import { Router } from "express";
import { db } from "../../db/index.ts";
import { users } from "../../db/schema.ts";
import { eq, or } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
  createSession,
  revokeSession,
  requireAuth,
  auditServerAction,
  SESSION_COOKIE_NAME,
  AuthRequest,
} from "../auth.ts";

const router = Router();

// ==========================================
// POST /api/auth/login
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: "Identifiant et mot de passe requis." });
    }

    // Protection contre les attaques par force brute
    const rateCheck = checkLoginRateLimit(identifier);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Trop de tentatives infructueuses. Veuillez patienter ${rateCheck.waitSeconds} secondes.`,
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\s+/g, "");

    // Recherche de l'utilisateur par nom d'utilisateur, email, téléphone ou ID
    const foundUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, cleanId),
          eq(users.email, cleanId),
          eq(users.phone, cleanPhone),
          eq(users.id, cleanId)
        )
      )
      .limit(1);

    if (foundUsers.length === 0) {
      recordFailedLogin(identifier);
      return res.status(401).json({ success: false, error: "Identifiant ou mot de passe incorrect." });
    }

    const user = foundUsers[0];

    if (user.status && user.status !== "ACTIF") {
      return res.status(403).json({
        success: false,
        error: `Compte ${(user.status || "inactif").toLowerCase()}. Veuillez contacter la direction de la clinique.`,
      });
    }

    // Vérification scrypt
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      recordFailedLogin(identifier);
      await auditServerAction({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        details: `Échec d'authentification pour le compte ${user.username}`,
        ipAddress: req.ip,
      });
      return res.status(401).json({ success: false, error: "Identifiant ou mot de passe incorrect." });
    }

    // Réinitialisation du compteur d'échecs
    resetLoginAttempts(identifier);

    // Création d'une session serveur chiffrée
    const token = await createSession(user.id, req);

    // Mise à jour de la date de dernière connexion
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Définition du cookie HttpOnly
    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000,
    });

    await auditServerAction({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      details: `Connexion réussie du praticien ${user.fullName} (${user.role})`,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      token, // Également renvoyé pour les clients API ou iframe avec Bearer token
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        email: user.email,
        phone: user.phone,
        avatarVariant: user.avatarVariant,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("[AuthRoutes] Erreur login:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur lors de la connexion." });
  }
});

// ==========================================
// POST /api/auth/logout
// ==========================================
router.post("/logout", requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.sessionToken) {
      await revokeSession(req.sessionToken);
    }

    res.clearCookie(SESSION_COOKIE_NAME);

    if (req.user) {
      await auditServerAction({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: "LOGOUT",
        entity: "User",
        entityId: req.user.id,
        details: `Déconnexion de ${req.user.fullName}`,
        ipAddress: req.ip,
      });
    }

    return res.json({ success: true, message: "Déconnexion réussie." });
  } catch (err) {
    console.error("[AuthRoutes] Erreur logout:", err);
    return res.status(500).json({ success: false, error: "Erreur lors de la déconnexion." });
  }
});

// ==========================================
// GET /api/auth/me
// ==========================================
router.get("/me", requireAuth, (req: AuthRequest, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// ==========================================
// POST /api/auth/change-password
// ==========================================
router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Mots de passe requis." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
    }

    const user = foundUsers[0];
    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, error: "Mot de passe actuel incorrect." });
    }

    const { hash, salt } = hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: hash, passwordSalt: salt, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await auditServerAction({
      userId: req.user!.id,
      userName: req.user!.fullName,
      userRole: req.user!.role,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: req.user!.id,
      details: "Modification réussie du mot de passe",
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    console.error("[AuthRoutes] Erreur change-password:", err);
    return res.status(500).json({ success: false, error: "Erreur serveur." });
  }
});

export default router;
