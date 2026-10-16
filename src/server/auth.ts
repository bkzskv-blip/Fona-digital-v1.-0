import crypto from "crypto";
import { db } from "../db/index.ts";
import { users, sessions, auditLogs } from "../db/schema.ts";
import { eq, and, gt } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { Role, Permission } from "../types/index.ts";
import { ROLE_PERMISSIONS } from "../services/rbacService.ts";

export interface AuthenticatedUser {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  department: string;
  email: string;
  phone: string;
  avatarVariant: string;
  status: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  sessionToken?: string;
}

// ==========================================
// HACHAGE SÉCURISÉ DES MOTS DE PASSE (SCRYPT + SALT)
// ==========================================
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const checkHash = derivedKey.toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(checkHash, "hex"));
}

// ==========================================
// PROTECTION CONTRE LES ATTAQUES BRUTE-FORCE
// ==========================================
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (attempt && attempt.blockedUntil > now) {
    const waitSeconds = Math.ceil((attempt.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string) {
  const key = identifier.toLowerCase().trim();
  const attempt = loginAttempts.get(key) || { count: 0, blockedUntil: 0 };
  attempt.count += 1;

  // Si 5 échecs consécutifs, blocage de 15 minutes
  if (attempt.count >= 5) {
    attempt.blockedUntil = Date.now() + 15 * 60 * 1000;
  }
  loginAttempts.set(key, attempt);
}

export function resetLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier.toLowerCase().trim());
}

// ==========================================
// GESTION DES SESSIONS SÉCURISÉES (HTTPONLY COOKIE + TOKEN)
// ==========================================
export const SESSION_COOKIE_NAME = "fona_session";
export const SESSION_DURATION_HOURS = 12;

export async function createSession(userId: string, req: Request): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Inconnu";

  await db.insert(sessions).values({
    id: `sess-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
    isRevoked: false,
  });

  return token;
}

export async function revokeSession(token: string) {
  await db
    .update(sessions)
    .set({ isRevoked: true })
    .where(eq(sessions.token, token));
}

// ==========================================
// MIDDLEWARE D'AUTHENTIFICATION SERVEUR STRICTE
// ==========================================
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Récupération du token depuis Cookie HttpOnly ou header Authorization Bearer
    const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Non authentifié : Session requise pour accéder aux dossiers médicaux.",
      });
    }

    // 2. Vérification de la session en base de données
    const now = new Date();
    const activeSessions = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, token),
          eq(sessions.isRevoked, false),
          gt(sessions.expiresAt, now)
        )
      )
      .limit(1);

    if (activeSessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Session invalide ou expirée. Veuillez vous reconnecter.",
      });
    }

    const { user, session } = activeSessions[0];

    // Vérification stricte du verrouillage après 30 minutes d'inactivité
    const lastActiveTime = session.lastActiveAt ? new Date(session.lastActiveAt).getTime() : 0;
    const inactivityTimeoutMs = 30 * 60 * 1000; // 30 minutes
    if (lastActiveTime > 0 && now.getTime() - lastActiveTime > inactivityTimeoutMs) {
      await db
        .update(sessions)
        .set({ isRevoked: true })
        .where(eq(sessions.id, session.id));

      return res.status(401).json({
        success: false,
        error: "Session expirée après 30 minutes d'inactivité. Veuillez vous reconnecter.",
        code: "SESSION_INACTIVITY_EXPIRED",
      });
    }

    // Vérification du statut du compte
    if (user.status !== "ACTIF") {
      return res.status(403).json({
        success: false,
        error: "Compte suspendu ou inactif. Accès interdit.",
      });
    }

    // Mise à jour de l'activité
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, session.id));

    // Attachement de l'utilisateur déduit du serveur
    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role as Role,
      department: user.department,
      email: user.email,
      phone: user.phone,
      avatarVariant: user.avatarVariant || "doctor",
      status: user.status || "ACTIF",
    };
    req.sessionToken = token;

    next();
  } catch (error) {
    console.error("[AuthMiddleware] Erreur vérification session:", error);
    return res.status(500).json({ success: false, error: "Erreur serveur lors du contrôle d'accès." });
  }
}

// ==========================================
// MIDDLEWARE DE VÉRIFICATION RBAC SERVEUR
// ==========================================
export function requirePermission(permission: Permission) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Non authentifié." });
    }

    const userRole = req.user.role;
    const allowedPermissions = ROLE_PERMISSIONS[userRole] || [];

    if (!allowedPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Accès refusé : Votre profil « ${userRole} » ne possède pas la permission « ${permission} ».`,
      });
    }

    next();
  };
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Non authentifié." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Accès refusé : Réservé aux rôles [${allowedRoles.join(", ")}].`,
      });
    }

    next();
  };
}

// ==========================================
// JOURNAL D'AUDIT SÉCURISÉ CÔTÉ SERVEUR
// ==========================================
export async function auditServerAction(entry: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      id: `aud-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      timestamp: new Date(),
      userId: entry.userId,
      userName: entry.userName,
      userRole: entry.userRole,
      siteId: "site-plateau",
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      details: entry.details,
      ipAddress: entry.ipAddress || "127.0.0.1",
    });
  } catch (err) {
    console.error("[AuditServer] Erreur insertion log d'audit:", err);
  }
}
