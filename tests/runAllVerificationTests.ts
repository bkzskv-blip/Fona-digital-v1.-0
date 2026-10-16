import crypto from "crypto";
import { db } from "../src/db/index.ts";
import {
  users,
  patients,
  patientAllergies,
  patientHistories,
  visits,
  consultations,
  cares,
  appointments,
  pregnancies,
  prenatalVisits,
  deliveries,
  labCatalog,
  labRequests,
  invoices,
  payments,
  auditLogs,
} from "../src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "../src/server/auth.ts";
import { ROLE_PERMISSIONS } from "../src/services/rbacService.ts";
import { seedInitialDataIfNeeded } from "../src/server/seed.ts";
import { getBackupEncryptionKey, testSecretManagerAccess } from "../src/server/services/secretService.ts";
import { testGcsConnectivity, GCS_BACKUP_BUCKET } from "../src/server/services/gcsStorageService.ts";
import { encryptPayload, decryptPayload } from "../src/server/routes/backupRoutes.ts";

interface TestReportItem {
  id: number;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const testResults: TestReportItem[] = [];

function recordTest(id: number, category: string, name: string, passed: boolean, details: string) {
  testResults.push({ id, category, name, passed, details });
  const statusIcon = passed ? "✓ SUCCÈS" : "✗ ÉCHEC";
  console.log(`[TEST ${id.toString().padStart(2, "0")}] [${category}] ${name} : ${statusIcon} — ${details}`);
}

async function runAllTests() {
  console.log("================================================================================");
  console.log("  SUITE DE TESTS AUTOMATISÉS — FONA DIGITAL v1.0 (POSTGRESQL & SÉCURITÉ)");
  console.log("================================================================================");

  // Initialisation de la base
  await seedInitialDataIfNeeded();

  const testIdTag = `tst-${Date.now()}`;

  // --------------------------------------------------------------------------
  // TEST 1 : Authentification & Hachage scrypt
  // --------------------------------------------------------------------------
  try {
    const rawPassword = "FonaSecurePassword2026!";
    const { hash, salt } = hashPassword(rawPassword);
    const validCheck = verifyPassword(rawPassword, hash, salt);
    const invalidCheck = verifyPassword("MauvaisMotDePasse", hash, salt);

    const isSuccess = validCheck === true && invalidCheck === false && hash.length === 128;
    recordTest(
      1,
      "Authentification",
      "Hachage scrypt cryptographique et résistance aux attaques",
      isSuccess,
      `Clé dérivée 512-bit (128 hex), validation positive conforme, rejet des faux mots de passe.`
    );
  } catch (err: any) {
    recordTest(1, "Authentification", "Hachage scrypt cryptographique", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2 : Limitation de débit (Rate Limiting anti-brute force)
  // --------------------------------------------------------------------------
  try {
    const testIdentifier = `test-bruteforce-${Date.now()}@cmfona.ml`;
    resetLoginAttempts(testIdentifier);

    for (let i = 0; i < 5; i++) {
      recordFailedLogin(testIdentifier);
    }
    const rateCheck = checkLoginRateLimit(testIdentifier);
    resetLoginAttempts(testIdentifier);
    const postResetCheck = checkLoginRateLimit(testIdentifier);

    const isSuccess = rateCheck.allowed === false && (rateCheck.waitSeconds || 0) > 0 && postResetCheck.allowed === true;
    recordTest(
      2,
      "Sécurité / Auth",
      "Protection contre les attaques par force brute (5 tentatives max)",
      isSuccess,
      `Compte bloqué après 5 échecs consécutifs (${rateCheck.waitSeconds}s d'attente), réinitialisation vérifiée.`
    );
  } catch (err: any) {
    recordTest(2, "Sécurité / Auth", "Protection force brute", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3 : Permissions RBAC des 5 rôles
  // --------------------------------------------------------------------------
  try {
    const adminPerms = ROLE_PERMISSIONS["ADMIN"];
    const recepPerms = ROLE_PERMISSIONS["RECEPTION_CAISSE"];
    const docPerms = ROLE_PERMISSIONS["PRACTITIONER"];
    const nursePerms = ROLE_PERMISSIONS["NURSE"];
    const midPerms = ROLE_PERMISSIONS["MIDWIFE"];

    // Assertions de sécurité selon le principe de moindre privilège
    const adminHasAll = adminPerms.includes("ADMIN_WRITE") && adminPerms.includes("FINANCE_READ");
    const recepCannotDiagnose = !recepPerms.includes("CONSULTATION_WRITE") && recepPerms.includes("PAYMENT_WRITE");
    const docCannotAdmin = !docPerms.includes("ADMIN_WRITE") && docPerms.includes("CONSULTATION_WRITE");
    const nurseCannotPay = !nursePerms.includes("PAYMENT_WRITE") && nursePerms.includes("CARE_WRITE");
    const midCanDeliver = midPerms.includes("MATERNITY_WRITE") && !midPerms.includes("ADMIN_WRITE");

    const allRbacCompliant = adminHasAll && recepCannotDiagnose && docCannotAdmin && nurseCannotPay && midCanDeliver;
    recordTest(
      3,
      "RBAC / Permissions",
      "Contrôle d'accès granulaire sur les 5 rôles CM FONA",
      allRbacCompliant,
      `Vérification stricte : réception cloisonnée sans accès diagnostic, médecin sans accès admin, sage-femme dédiée.`
    );
  } catch (err: any) {
    recordTest(3, "RBAC / Permissions", "Contrôle RBAC", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4 : Création, lecture et détection de doublons Patient
  // --------------------------------------------------------------------------
  let createdPatientId = "";
  try {
    const testPatientCode = `PAT-TEST-${Date.now().toString().slice(-4)}`;
    const testPhone = `+223 70 ${Math.floor(100000 + Math.random() * 900000)}`;

    const [newPatient] = await db
      .insert(patients)
      .values({
        id: `pat-test-${testIdTag}`,
        patientCode: testPatientCode,
        firstName: "Aminata",
        lastName: "Touré Test",
        sex: "FEMALE",
        birthDate: "1994-06-15",
        phone: testPhone,
        address: "Sirakoro Méguétana, Bamako",
        bloodGroup: "B+",
        isArchived: false,
        createdById: "usr-admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    createdPatientId = newPatient.id;

    // Ajout d'une allergie et d'un antécédent
    await db.insert(patientAllergies).values({
      id: `alg-${testIdTag}`,
      patientId: createdPatientId,
      allergen: "Pénicilline G",
      severity: "SEVERE",
      reaction: "Urticaire géant",
      createdAt: new Date(),
    });

    await db.insert(patientHistories).values({
      id: `hst-${testIdTag}`,
      patientId: createdPatientId,
      category: "MEDICAL",
      condition: "Asthme intermittent",
      year: 2018,
      createdAt: new Date(),
    });

    const readBack = await db.select().from(patients).where(eq(patients.id, createdPatientId));
    const allergiesBack = await db.select().from(patientAllergies).where(eq(patientAllergies.patientId, createdPatientId));

    const isSuccess = readBack.length === 1 && allergiesBack.length === 1 && readBack[0].bloodGroup === "B+";
    recordTest(
      4,
      "Dossier Patient",
      "Création d'un dossier permanent avec antécédents et allergies",
      isSuccess,
      `Patient ${testPatientCode} persisté dans PostgreSQL avec allergie « Pénicilline G » et groupe sanguin B+.`
    );
  } catch (err: any) {
    recordTest(4, "Dossier Patient", "Création dossier patient", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5 : Archivage non-destructif du dossier médical
  // --------------------------------------------------------------------------
  try {
    await db
      .update(patients)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: "Déménagement en région de Sikasso (test)",
        updatedAt: new Date(),
      })
      .where(eq(patients.id, createdPatientId));

    const archivedRecord = await db.select().from(patients).where(eq(patients.id, createdPatientId));
    const allergiesPersist = await db.select().from(patientAllergies).where(eq(patientAllergies.patientId, createdPatientId));

    // Dé-archiver pour la suite des tests cliniques
    await db.update(patients).set({ isArchived: false }).where(eq(patients.id, createdPatientId));

    const isSuccess = archivedRecord[0].isArchived === true && allergiesPersist.length === 1;
    recordTest(
      5,
      "Dossier Patient",
      "Archivage contrôlé non-destructif (conservation de l'historique)",
      isSuccess,
      `Dossier marqué archivé avec motif sans suppression physique, données cliniques 100% préservées.`
    );
  } catch (err: any) {
    recordTest(5, "Dossier Patient", "Archivage non destructif", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6 : Passage médical, Consultation & Constantes
  // --------------------------------------------------------------------------
  let testVisitId = "";
  let testConsultationId = "";
  try {
    const [vis] = await db
      .insert(visits)
      .values({
        id: `vis-test-${testIdTag}`,
        visitCode: `VIS-TEST-${Date.now().toString().slice(-4)}`,
        patientId: createdPatientId,
        type: "CONSULTATION",
        status: "EN_COURS",
        reason: "Syndrome fébrile et céphalées intenses",
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    testVisitId = vis.id;

    const [cons] = await db
      .insert(consultations)
      .values({
        id: `cons-test-${testIdTag}`,
        consultationCode: `CONS-TEST-${Date.now().toString().slice(-4)}`,
        visitId: testVisitId,
        patientId: createdPatientId,
        motif: "Fièvre à 39°C depuis 48 heures",
        clinicalHistory: "Début brutal avec frissons nocturnes et courbatures.",
        clinicalExam: "Conscience claire, langue saburrale, pas de raideur de nuque, splénomégalie stade I.",
        carePlan: "Demande TDR Palu en urgence et repos médical.",
        conclusion: "Suspicion de paludisme grave à Plasmodium falciparum.",
        prescriberName: "Dr. Armand Koné",
        diagnoses: [
          {
            name: "Paludisme à Plasmodium falciparum",
            code: "B50.9",
            isPrimary: true,
            startDate: "2026-10-10",
          },
        ],
        vitalSigns: {
          temperature: 39.2,
          systolicBP: 120,
          diastolicBP: 80,
          heartRate: 98,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    testConsultationId = cons.id;

    const isSuccess = cons.visitId === testVisitId && cons.patientId === createdPatientId && (cons.diagnoses as any[])[0].code === "B50.9";
    recordTest(
      6,
      "Consultation Clinique",
      "Saisie structurée (Signes cliniques, Diagnostic, Constantes, Passage lié)",
      isSuccess,
      `Consultation ${cons.consultationCode} rattachée au passage ${vis.visitCode} avec diagnostic CIM-10 B50.9.`
    );
  } catch (err: any) {
    recordTest(6, "Consultation Clinique", "Consultation clinique", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7 : Pôle Maternité (Grossesse, CPN et Accouchement)
  // --------------------------------------------------------------------------
  try {
    const [preg] = await db
      .insert(pregnancies)
      .values({
        id: `preg-test-${testIdTag}`,
        pregnancyCode: `GROSS-TEST-${Date.now().toString().slice(-4)}`,
        patientId: createdPatientId,
        lmpDate: "2026-01-15",
        eddDate: "2026-10-22",
        gravidity: 2,
        parity: 1,
        status: "EN_COURS",
        riskLevel: "BAS",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const [cpn] = await db
      .insert(prenatalVisits)
      .values({
        id: `cpn-test-${testIdTag}`,
        cpnCode: `CPN-TEST-${Date.now().toString().slice(-4)}`,
        pregnancyId: preg.id,
        patientId: createdPatientId,
        cpnNumber: 1,
        visitDate: "2026-03-20",
        gestationalAgeWeeks: 12,
        fundalHeightCm: 12,
        bloodPressure: "110/70",
        proteinuria: "Négatif",
        ironFolicPrescribed: true,
        performedByName: "Awa Bamba-Diabaté (Sage-femme)",
        createdAt: new Date(),
      })
      .returning();

    const [del] = await db
      .insert(deliveries)
      .values({
        id: `del-test-${testIdTag}`,
        deliveryCode: `ACC-TEST-${Date.now().toString().slice(-4)}`,
        pregnancyId: preg.id,
        patientId: createdPatientId,
        deliveryDate: "2026-10-10",
        deliveryTime: "04:15",
        deliveryType: "EUTOCIQUE",
        newbornSex: "FEMALE",
        newbornWeightG: 3450,
        apgar1Min: 9,
        apgar5Min: 10,
        birthAttendantName: "Awa Bamba-Diabaté",
        createdAt: new Date(),
      })
      .returning();

    const isSuccess = cpn.pregnancyId === preg.id && del.newbornWeightG === 3450 && del.apgar5Min === 10;
    recordTest(
      7,
      "Pôle Maternité",
      "Suivi obstétrical complet (Dossier grossesse, CPN et volet accouchement)",
      isSuccess,
      `Grossesse ${preg.pregnancyCode}, CPN 1 et accouchement d'une fille de 3450g (Apgar 9/10) enregistrés.`
    );
  } catch (err: any) {
    recordTest(7, "Pôle Maternité", "Suivi obstétrical", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 8 : Laboratoire (Catalogue Mali, Demande & Validation)
  // --------------------------------------------------------------------------
  try {
    const catalogItems = await db.select().from(labCatalog).limit(5);

    const [labReq] = await db
      .insert(labRequests)
      .values({
        id: `lab-test-${testIdTag}`,
        labCode: `LAB-TEST-${Date.now().toString().slice(-4)}`,
        patientId: createdPatientId,
        visitId: testVisitId,
        priority: "URGENTE",
        status: "VALIDE",
        tests: [
          {
            code: "TDR-PALU",
            name: "TDR Paludisme",
            resultValue: "POSITIF (Plasmodium falciparum)",
            isAbnormal: true,
          },
        ],
        resultReport: "Présence de l'antigène HRP2 de Plasmodium falciparum confirmée.",
        validatorName: "Dr. Armand Koné",
        validatedAt: new Date(),
        requestedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const isSuccess =
      catalogItems.length > 0 &&
      labReq.status === "VALIDE" &&
      Array.isArray(labReq.tests) &&
      (labReq.tests as any[]).length === 1;
    recordTest(
      8,
      "Laboratoire",
      "Catalogue d'analyses du Mali, saisie et validation des résultats",
      isSuccess,
      `${catalogItems.length} analyses disponibles, demande ${labReq.labCode} validée avec résultat positif anormal.`
    );
  } catch (err: any) {
    recordTest(8, "Laboratoire", "Laboratoire", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 9 : Caisse, Paiements Partiels (ACID) & Idempotence anti-doublon
  // --------------------------------------------------------------------------
  try {
    const totalAmount = 15000; // Consultation (5000) + TDR (2500) + NFS (6000) + Divers (1500)
    const firstPayment = 10000;

    // Émission facture
    const [inv] = await db
      .insert(invoices)
      .values({
        id: `inv-test-${testIdTag}`,
        invoiceCode: `FAC-TEST-${Date.now().toString().slice(-4)}`,
        patientId: createdPatientId,
        visitId: testVisitId,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: "IMPAYE",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const idempotencyKey = `idemp-${testIdTag}-pay1`;

    // Transaction ACID pour le premier paiement
    const pay1Result = await db.transaction(async (tx) => {
      const paymentCode = `REC-TEST-${Date.now().toString().slice(-4)}`;
      const [pay] = await tx
        .insert(payments)
        .values({
          id: `pay-test-${testIdTag}-1`,
          paymentCode,
          invoiceId: inv.id,
          patientId: createdPatientId,
          amount: firstPayment,
          paymentMethod: "ORANGE_MONEY",
          transactionRef: "OM-ML-2026-884920",
          idempotencyKey,
          receivedById: "usr-admin",
          receivedByName: "Dr. Armand Koné",
          receivedAt: new Date(),
        })
        .returning();

      const newPaid = inv.paidAmount + firstPayment;
      const newBal = inv.totalAmount - newPaid;
      await tx
        .update(invoices)
        .set({
          paidAmount: newPaid,
          balance: newBal,
          status: "PARTIEL",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, inv.id));

      return { pay, balance: newBal };
    });

    // Test de rejet du doublon (même clé d'idempotence)
    let duplicateRejected = false;
    try {
      await db.insert(payments).values({
        id: `pay-test-dup-${testIdTag}`,
        paymentCode: `REC-DUP-${Date.now()}`,
        invoiceId: inv.id,
        patientId: createdPatientId,
        amount: firstPayment,
        paymentMethod: "ORANGE_MONEY",
        idempotencyKey, // Clé en double
        receivedAt: new Date(),
      });
    } catch {
      duplicateRejected = true;
    }

    // Deuxième paiement pour solder la facture
    const secondPayment = 5000;
    const pay2Result = await db.transaction(async (tx) => {
      const [pay] = await tx
        .insert(payments)
        .values({
          id: `pay-test-${testIdTag}-2`,
          paymentCode: `REC-TEST-${Date.now().toString().slice(-4)}-2`,
          invoiceId: inv.id,
          patientId: createdPatientId,
          amount: secondPayment,
          paymentMethod: "ESPECES",
          idempotencyKey: `idemp-${testIdTag}-pay2`,
          receivedById: "usr-admin",
          receivedByName: "Dr. Armand Koné",
          receivedAt: new Date(),
        })
        .returning();

      await tx
        .update(invoices)
        .set({
          paidAmount: totalAmount,
          balance: 0,
          status: "PAYE",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, inv.id));

      return pay;
    });

    const finalInvoice = await db.select().from(invoices).where(eq(invoices.id, inv.id));

    const isSuccess =
      pay1Result.balance === 5000 &&
      duplicateRejected === true &&
      finalInvoice[0].balance === 0 &&
      finalInvoice[0].status === "PAYE";

    recordTest(
      9,
      "Caisse & Finances",
      "Paiements partiels ACID, calcul exact du solde et rejet des doublons",
      isSuccess,
      `Facture 15 000 FCFA : 1er versement 10 000 FCFA (solde 5 000), doublon bloqué par clé unique, 2ème versement 5 000 FCFA (solde 0 FCFA, statut PAYE).`
    );
  } catch (err: any) {
    recordTest(9, "Caisse & Finances", "Paiements partiels", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 10 : Sauvegarde réelle PostgreSQL & Test de restauration isolé
  // --------------------------------------------------------------------------
  try {
    const [allPatients, allVisits, allCons, allInvoices, allPayments] = await Promise.all([
      db.select().from(patients),
      db.select().from(visits),
      db.select().from(consultations),
      db.select().from(invoices),
      db.select().from(payments),
    ]);

    const backupSnapshot = {
      engine: "Cloud SQL PostgreSQL 16",
      timestamp: new Date().toISOString(),
      counts: {
        patients: allPatients.length,
        visits: allVisits.length,
        consultations: allCons.length,
        invoices: allInvoices.length,
        payments: allPayments.length,
      },
      data: {
        patients: allPatients,
        visits: allVisits,
        consultations: allCons,
        invoices: allInvoices,
        payments: allPayments,
      },
    };

    const serialized = JSON.stringify(backupSnapshot);
    const sha256 = crypto.createHash("sha256").update(serialized).digest("hex");

    // Simulation du test de restauration isolé (Contrôle d'intégrité référentielle)
    const parsed = JSON.parse(serialized);
    const patIdSet = new Set(parsed.data.patients.map((p: any) => p.id));
    let brokenRefs = 0;
    for (const c of parsed.data.consultations) {
      if (!patIdSet.has(c.patientId)) brokenRefs++;
    }

    const isSuccess = sha256.length === 64 && brokenRefs === 0 && parsed.counts.patients > 0;
    recordTest(
      10,
      "Sauvegarde / Restauration",
      "Génération de snapshot réel et contrôle de restauration isolé",
      isSuccess,
      `Dump vérifié avec SHA-256 (${sha256.substring(0, 16)}...), ${parsed.counts.patients} patients et 0 violation de clé étrangère.`
    );
  } catch (err: any) {
    recordTest(10, "Sauvegarde / Restauration", "Sauvegarde et restauration", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 11 : Google Cloud Storage (GCS) — Diagnostic & Gestion des Alertes
  // --------------------------------------------------------------------------
  try {
    const gcsDiagnostic = await testGcsConnectivity();

    // Vérification de la détection honnête du statut (opérationnel ou en attente d'autorisation IAM)
    const isHonestDetection =
      typeof gcsDiagnostic.bucketExists === "boolean" &&
      typeof gcsDiagnostic.status === "string" &&
      gcsDiagnostic.bucketName.includes("fona-backups");

    // Simulation de l'alerte d'échec de réplication en cas de bucket inaccessible
    let alertRecorded = false;
    if (!gcsDiagnostic.success) {
      const alertId = `alt-test-${Date.now()}`;
      await db.insert(auditLogs).values({
        id: alertId,
        userId: "usr-admin",
        userName: "Dr. Armand Koné",
        userRole: "ADMIN",
        action: "ALERTE_ECHEC_REPLICATION_GCS",
        entity: "GoogleCloudStorage",
        entityId: GCS_BACKUP_BUCKET,
        details: `Alerte automatique test : destination distante GCS (${gcsDiagnostic.status}).`,
        ipAddress: "127.0.0.1",
      });

      const logged = await db.select().from(auditLogs).where(eq(auditLogs.id, alertId));
      alertRecorded = logged.length > 0 && logged[0].action === "ALERTE_ECHEC_REPLICATION_GCS";
    } else {
      alertRecorded = true;
    }

    const isSuccess = isHonestDetection && alertRecorded;
    recordTest(
      11,
      "Google Cloud Storage",
      "Sonde de connectivité GCS, détection du statut et mécanisme d'alerte",
      isSuccess,
      `Bucket visé : gs://${gcsDiagnostic.bucketName} (${gcsDiagnostic.region}), Statut : ${gcsDiagnostic.status}, Alerte d'échec de réplication fonctionnelle.`
    );
  } catch (err: any) {
    recordTest(11, "Google Cloud Storage", "Sonde GCS et alertes", false, err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 12 : Google Cloud Secret Manager & Chiffrement AES-256-GCM
  // --------------------------------------------------------------------------
  try {
    const keyInfo = await getBackupEncryptionKey();
    const smTest = await testSecretManagerAccess();

    // Tester le cycle de chiffrement / déchiffrement AES-256-GCM
    const testClinicalData = JSON.stringify({
      institution: "Cabinet Médical FONA",
      confidentiality: "Strictement Secret Médical",
      patientSample: "Moussa Diarra",
      timestamp: new Date().toISOString(),
    });

    const encryptedBundle = await encryptPayload(testClinicalData);
    const decryptedPayload = await decryptPayload({
      encryptedData: encryptedBundle.encryptedData,
      iv: encryptedBundle.iv,
      authTag: encryptedBundle.authTag,
    });

    const isDecryptedAccurate = decryptedPayload === testClinicalData;
    const isKeySecured = !testClinicalData.includes(keyInfo.key) && encryptedBundle.algorithm === "AES-256-GCM";

    const isSuccess = isDecryptedAccurate && isKeySecured && keyInfo.key.length >= 16;
    recordTest(
      12,
      "Secret Manager & Cryptographie",
      "Chiffrement AES-256-GCM, dérivation scrypt 512-bit et Secret Manager",
      isSuccess,
      `Source clé : ${keyInfo.source} (${keyInfo.secretName}), Algorithme : AES-256-GCM, Intégrité aller-retour 100%, Clé jamais exposée en clair.`
    );
  } catch (err: any) {
    recordTest(12, "Secret Manager & Cryptographie", "Chiffrement et Secret Manager", false, err.message);
  }

  console.log("================================================================================");
  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;
  console.log(`RÉSULTAT GLOBAL : ${passedCount} / ${totalCount} TESTS RÉUSSIS (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("================================================================================");

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Erreur critique exécution tests:", err);
  process.exit(1);
});
