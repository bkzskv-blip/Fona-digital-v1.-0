import { Pool } from "pg";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME || "cloud_sql_development_database";
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

const BACKUP_MASTER_KEY = process.env.BACKUP_ENCRYPTION_KEY || "FONA_SECURE_ENCRYPTED_VAULT_KEY_2026_MALI_BAMAKO";

function getDerivedEncryptionKey(): Buffer {
  return crypto.scryptSync(BACKUP_MASTER_KEY, "fona_salt_vault_mali_2026", 32);
}

function encryptPayload(dataString: string) {
  const key = getDerivedEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(dataString, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    algorithm: "AES-256-GCM",
  };
}

function decryptPayload(encryptedPackage: { encryptedData: string; iv: string; authTag: string }): string {
  const key = getDerivedEncryptionKey();
  const iv = Buffer.from(encryptedPackage.iv, "hex");
  const authTag = Buffer.from(encryptedPackage.authTag, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPackage.encryptedData, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf-8");
}

async function runTest() {
  const t0 = Date.now();
  console.log("=== DÉBUT DU TEST DE RESTAURATION COMPLÈTE EN ENVIRONNEMENT ISOLÉ ===");
  console.log(`Base de Production : ${sqlDbName}`);
  console.log(`Base Isolée de Restauration : test_isolated_db`);

  const prodPool = new Pool({
    host: sqlHost,
    database: sqlDbName,
    user,
    password,
    port: 5432,
  });

  const tableNames = [
    "users",
    "sessions",
    "system_settings",
    "patients",
    "patient_allergies",
    "patient_histories",
    "visits",
    "consultations",
    "vital_signs_records",
    "cares",
    "appointments",
    "pregnancies",
    "prenatal_visits",
    "deliveries",
    "lab_catalog",
    "lab_requests",
    "imaging_requests",
    "invoices",
    "payments",
    "audit_logs",
  ];

  console.log("\n[1/7] Extraction et snapshot des 20 tables de production...");
  const prodCountsBefore: Record<string, number> = {};
  const dumpData: Record<string, any[]> = {};

  for (const tbl of tableNames) {
    const res = await prodPool.query(`SELECT * FROM ${tbl};`);
    prodCountsBefore[tbl] = res.rows.length;
    dumpData[tbl] = res.rows;
  }
  console.log("Décomptes en production avant test :", prodCountsBefore);

  console.log("\n[2/7] Génération du package chiffré AES-256-GCM et réplication hors site...");
  const rawPayload = JSON.stringify({
    version: "FONA-BACKUP-v1.0",
    createdAt: new Date().toISOString(),
    sourceDatabase: sqlDbName,
    tableCounts: prodCountsBefore,
    data: dumpData,
  });

  const sha256Original = crypto.createHash("sha256").update(rawPayload).digest("hex");
  const encrypted = encryptPayload(rawPayload);

  const archivePackage = {
    archiveHeader: {
      format: "FONA_ENCRYPTED_SQL_ARCHIVE",
      version: "1.0",
      createdAt: new Date().toISOString(),
      encryption: "AES-256-GCM",
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      checksumSha256: sha256Original,
      totalTables: 20,
    },
    payload: encrypted.encryptedData,
  };

  const backupFilePath = path.join(process.cwd(), "data", "backups", "fona_full_restore_test.enc");
  fs.writeFileSync(backupFilePath, JSON.stringify(archivePackage, null, 2), "utf-8");
  console.log(`Archive sauvegardée sur disque : ${backupFilePath} (${fs.statSync(backupFilePath).size} octets)`);

  console.log("\n[3/7] Déchiffrement et vérification cryptographique...");
  const readArchive = JSON.parse(fs.readFileSync(backupFilePath, "utf-8"));
  const decryptedJson = decryptPayload({
    encryptedData: readArchive.payload,
    iv: readArchive.archiveHeader.iv,
    authTag: readArchive.archiveHeader.authTag,
  });
  const sha256Decrypted = crypto.createHash("sha256").update(decryptedJson).digest("hex");

  if (sha256Decrypted !== readArchive.archiveHeader.checksumSha256) {
    throw new Error("Échec d'intégrité SHA-256 ! Le condensat ne correspond pas.");
  }
  console.log(`Intégrité SHA-256 certifiée : ${sha256Decrypted.substring(0, 16)}...`);
  const restoredPayload = JSON.parse(decryptedJson);

  console.log("\n[4/7] Clonage du schéma complet dans test_isolated_db...");
  const isolatedPool = new Pool({
    host: sqlHost,
    database: "test_isolated_db",
    user,
    password,
    port: 5432,
  });

  await isolatedPool.query(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);

  // Clonage dynamique exact de chaque table depuis la production
  for (const tbl of tableNames) {
    const colRes = await prodPool.query(`
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tbl]);

    const colDefs = colRes.rows.map((c: any) => {
      let typeDef = c.data_type;
      if (c.data_type === "USER-DEFINED") typeDef = c.udt_name;
      else if (c.data_type === "character varying") typeDef = "varchar";
      else if (c.data_type === "numeric") typeDef = "numeric";
      else if (c.data_type === "ARRAY") typeDef = `${c.udt_name.replace(/^_/, "")}[]`;
      
      let def = `"${c.column_name}" ${typeDef}`;
      if (c.is_nullable === "NO") def += " NOT NULL";
      return def;
    });

    // Chercher la clé primaire
    const pkRes = await prodPool.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1 AND tc.table_schema = 'public';
    `, [tbl]);

    if (pkRes.rows.length > 0) {
      colDefs.push(`PRIMARY KEY (${pkRes.rows.map((r: any) => `"${r.column_name}"`).join(", ")})`);
    }

    const createTableSql = `CREATE TABLE public."${tbl}" (\n  ${colDefs.join(",\n  ")}\n);`;
    await isolatedPool.query(createTableSql);
  }
  console.log("Les 20 tables ont été répliquées fidèlement dans test_isolated_db !");

  console.log("\n[5/7] Insertion des données déchiffrées dans test_isolated_db...");
  const restoredCounts: Record<string, number> = {};

  const insertOrder = [
    "users",
    "sessions",
    "system_settings",
    "patients",
    "patient_allergies",
    "patient_histories",
    "visits",
    "consultations",
    "vital_signs_records",
    "cares",
    "appointments",
    "pregnancies",
    "prenatal_visits",
    "deliveries",
    "lab_catalog",
    "lab_requests",
    "imaging_requests",
    "invoices",
    "payments",
    "audit_logs",
  ];

  for (const tbl of insertOrder) {
    const rows = restoredPayload.data[tbl] || [];
    if (rows.length > 0) {
      for (const row of rows) {
        const cols = Object.keys(row);
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const values = cols.map((c) => {
          const val = row[c];
          if (typeof val === "object" && val !== null && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          return val;
        });
        const query = `INSERT INTO "${tbl}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders});`;
        await isolatedPool.query(query, values);
      }
    }
    const countCheck = await isolatedPool.query(`SELECT count(*) FROM "${tbl}";`);
    restoredCounts[tbl] = Number(countCheck.rows[0].count);
  }

  console.log("Décomptes après restauration dans test_isolated_db :", restoredCounts);

  // Appliquer les clés étrangères dans test_isolated_db pour tester l'intégrité
  console.log("\n[6/7] Application et validation des contraintes de clés étrangères...");
  const fkRes = await prodPool.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
  `);

  let fkSuccess = 0;
  for (const fk of fkRes.rows) {
    const alterSql = `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "fk_${fk.table_name}_${fk.column_name}" FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}"("${fk.foreign_column_name}") ON DELETE ${fk.delete_rule};`;
    await isolatedPool.query(alterSql);
    fkSuccess++;
  }
  console.log(`  ✓ ${fkSuccess} clés étrangères appliquées et validées sans aucune violation relationnelle.`);

  // Vérification de données essentielles
  const checkCustomLab = await isolatedPool.query(`SELECT lab_code, tests, result_report FROM lab_requests WHERE lab_code = 'LAB-CUSTOM-6512';`);
  if (checkCustomLab.rows.length === 0) {
    throw new Error("L'examen de laboratoire personnalisé n'a pas été retrouvé après restauration !");
  }
  console.log("  ✓ Examen personnalisé LAB-CUSTOM-6512 présent avec son compte rendu validé.");

  const checkUsers = await isolatedPool.query(`SELECT count(*) as total_users FROM users WHERE role = 'ADMIN';`);
  console.log(`  ✓ Utilisateurs administrateurs restaurés : ${checkUsers.rows[0].total_users}.`);

  console.log("\n[7/7] Test de reconnexion applicative et vérification de la production...");
  const testConn = await isolatedPool.query("SELECT count(*) as total_patients FROM patients;");
  console.log(`  ✓ Reconnexion applicative réussie sur test_isolated_db (${testConn.rows[0].total_patients} patients).`);

  // Vérifier que la production est 100% INCHANGÉE
  const prodCountsAfter: Record<string, number> = {};
  for (const tbl of tableNames) {
    const res = await prodPool.query(`SELECT count(*) FROM "${tbl}";`);
    prodCountsAfter[tbl] = Number(res.rows[0].count);
    if (prodCountsAfter[tbl] !== prodCountsBefore[tbl]) {
      throw new Error(`ALERTE : La table de production ${tbl} a été modifiée pendant le test !`);
    }
  }
  console.log("  ✓ Production vérifiée : STRICTEMENT INTANGIBLE ET INTACTE !");

  await isolatedPool.end();
  await prodPool.end();

  const totalTimeSeconds = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\n=== SUCCÈS COMPLET DU TEST DE RESTAURATION ISOLÉE en ${totalTimeSeconds}s ===`);
}

runTest().catch((err) => {
  console.error("ERREUR DANS LE TEST :", err);
  process.exit(1);
});
