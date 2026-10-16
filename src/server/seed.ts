import { db } from "../db/index.ts";
import { users, labCatalog, systemSettings } from "../db/schema.ts";
import { hashPassword } from "./auth.ts";
import { INITIAL_USERS, INITIAL_LAB_CATALOG } from "../data/initialData.ts";
import { eq } from "drizzle-orm";

export async function seedInitialDataIfNeeded() {
  try {
    // 1. Initialisation des utilisateurs CM FONA avec hachage scrypt
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log("[Seed] Insertion des comptes praticiens initiaux avec mots de passe chiffrés...");
      for (const u of INITIAL_USERS) {
        const defaultPwd = u.password || "fona2026";
        const { hash, salt } = hashPassword(defaultPwd);

        await db.insert(users).values({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          role: u.role,
          department: u.department,
          email: u.email,
          phone: u.phone,
          avatarVariant: u.avatarVariant || "doctor",
          status: u.status || "ACTIF",
          passwordHash: hash,
          passwordSalt: salt,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      console.log(`[Seed] ${INITIAL_USERS.length} utilisateurs initialisés.`);
    }

    // 2. Initialisation du catalogue laboratoire (analyses médicales au Mali)
    const existingCatalog = await db.select().from(labCatalog).limit(1);
    if (existingCatalog.length === 0) {
      console.log("[Seed] Insertion du catalogue laboratoire de référence...");
      for (const item of INITIAL_LAB_CATALOG) {
        await db.insert(labCatalog).values({
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.category,
          sampleType: item.sampleType,
          defaultReferenceRange: item.defaultReferenceRange ?? null,
          defaultUnit: item.defaultUnit ?? null,
          priceFcfa: item.priceFCFA,
          isActive: item.isActive,
          createdAt: new Date(),
        } as any);
      }
      console.log(`[Seed] ${INITIAL_LAB_CATALOG.length} analyses de laboratoire initialisées.`);
    }
  } catch (err) {
    console.error("[Seed] Erreur lors de l'initialisation des données:", err);
  }
}
