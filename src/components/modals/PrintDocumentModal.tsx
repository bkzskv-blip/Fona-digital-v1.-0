import React from "react";
import { Printer, Download, X, CheckCircle, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassButton } from "../ui/GlassButton";
import { FonaLogo } from "../ui/FonaLogo";

export const PrintDocumentModal: React.FC = () => {
  const { printableDoc, setPrintableDoc, brandSettings, currentSite, formatCurrency, formatDate, formatDateTime } = useApp();

  if (!printableDoc) return null;

  const { type, title, patient, data } = printableDoc;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-print-wrapper">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020b17]/85 backdrop-blur-md no-print"
        onClick={() => setPrintableDoc(null)}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-3xl my-6 bg-[#0a1f38] border border-white/20 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07172b] no-print shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#55D9FF]" />
            <span className="font-bold text-white text-sm">Aperçu avant Impression Document Officiel</span>
          </div>

          <div className="flex items-center gap-3">
            <GlassButton
              variant="gold"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Imprimer Document
            </GlassButton>
            <button
              onClick={() => setPrintableDoc(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Sheet (Light/White paper format for clear printing) */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 print:m-0 print:w-full">
          {/* Official Clinic Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <FonaLogo variant="secondary" theme="light" size="sm" showSlogan={false} />
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {brandSettings.organizationName}
                  </h2>
                  <p className="text-[10px] italic text-amber-800 font-serif">
                    {brandSettings.slogan}
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-700 tracking-wide">
                {currentSite.name}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {currentSite.address} · {currentSite.city}
              </p>
              <p className="text-[11px] text-slate-500">
                Tél : {currentSite.phone} · Email : {brandSettings.clinicEmail}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-800 uppercase tracking-widest">
                Document Médical
              </span>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Date : {formatDate(new Date())}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Réf : DOC-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>

          {/* Patient Header Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Identité Patient</span>
              <span className="font-bold text-sm text-slate-900">
                {patient.lastName.toUpperCase()} {patient.firstName}
              </span>
              <p className="text-slate-600 mt-0.5">
                Sexe : {patient.sex === "MALE" ? "Masculin" : "Féminin"} · Né(e) le : {patient.birthDate}
              </p>
              <p className="text-slate-600">Téléphone : {patient.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Dossier Permanent</span>
              <span className="font-mono font-bold text-sm text-slate-900">{patient.patientCode}</span>
              <p className="text-slate-600 mt-0.5">Groupe Sanguin : {patient.bloodGroup || "Non renseigné"}</p>
              {patient.allergies?.length > 0 && (
                <p className="text-rose-600 font-bold mt-0.5">
                  Allergies : {patient.allergies.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Document Content Based on Type */}
          <div className="my-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4 uppercase tracking-wider">
              {title}
            </h3>

            {/* ORDONNANCE */}
            {type === "PRESCRIPTION" && data && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {data.prescriptions?.map((item: any, idx: number) => (
                    <div key={idx} className="pb-3 border-b border-slate-100">
                      <div className="flex items-baseline justify-between font-bold text-slate-900 text-sm">
                        <span>{idx + 1}. {item.medication}</span>
                        <span className="text-xs text-slate-600 font-normal">Durée : {item.duration}</span>
                      </div>
                      <div className="text-xs text-slate-700 mt-1 pl-4">
                        Posologie : <span className="font-semibold">{item.dosage}</span> ({item.frequency})
                      </div>
                      {item.instructions && (
                        <div className="text-[11px] text-slate-500 pl-4 italic">
                          Instructions : {item.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {data.carePlan && (
                  <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-700">
                    <span className="font-bold block mb-1">Recommandations & Conduite Thérapeutique :</span>
                    <p className="whitespace-pre-line">{data.carePlan}</p>
                  </div>
                )}
              </div>
            )}

            {/* LABORATOIRE */}
            {type === "LAB" && data && (
              <div className="space-y-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-600">
                      <th className="py-2">Analyse / Examen</th>
                      <th className="py-2">Résultat</th>
                      <th className="py-2">Valeurs de Référence</th>
                      <th className="py-2">Unité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tests?.map((t: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-slate-800">{t.testName}</td>
                        <td className={`py-2 font-bold ${t.isAbnormal ? "text-rose-600" : "text-slate-900"}`}>
                          {t.value || "En attente"} {t.isAbnormal && "(!)"}
                        </td>
                        <td className="py-2 text-slate-500">{t.referenceRange}</td>
                        <td className="py-2 text-slate-500">{t.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.clinicalNotes && (
                  <div className="text-xs text-slate-600 pt-2">
                    <span className="font-bold">Renseignements cliniques :</span> {data.clinicalNotes}
                  </div>
                )}
                {data.resultReport && (
                  <div className="text-xs text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                    <span className="font-bold block mb-1">Compte Rendu & Conclusions Biologiques :</span>
                    <p className="whitespace-pre-line leading-relaxed">{data.resultReport}</p>
                  </div>
                )}
                {data.documentName && (
                  <div className="text-xs text-slate-600 mt-1">
                    <span className="font-bold">Document / Fichier joint :</span> {data.documentName}
                  </div>
                )}
              </div>
            )}

            {/* IMAGERIE */}
            {type === "IMAGING" && data && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold block text-slate-700">Indication clinique :</span>
                  <p className="text-slate-800 mt-1">{data.indication}</p>
                </div>
                <div>
                  <span className="font-bold block text-slate-700">Constatations / Description :</span>
                  <p className="text-slate-800 mt-1 whitespace-pre-line leading-relaxed">{data.findings}</p>
                </div>
                <div className="p-3 bg-slate-50 border-l-4 border-slate-800 mt-3">
                  <span className="font-bold block text-slate-900">Conclusion :</span>
                  <p className="text-slate-800 mt-1">{data.conclusion}</p>
                </div>
              </div>
            )}

            {/* REÇU DE CAISSE */}
            {type === "RECEIPT" && data && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Reçu Numéro :</span>
                  <span className="font-mono font-bold text-slate-900">{data.receiptCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Mode de Règlement :</span>
                  <span className="font-bold text-slate-900">{data.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span>Référence Transaction :</span>
                  <span className="font-mono text-slate-700">{data.transactionRef || "N/A"}</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-slate-800 text-sm">
                  <span className="font-bold">Montant Réglé :</span>
                  <span className="font-mono font-black text-slate-900">
                    {formatCurrency(data.amount)}
                  </span>
                </div>
              </div>
            )}

            {/* FEUILLE DE TEMPÉRATURE & CONSTANTES MÉDICALES */}
            {type === "TEMPERATURE" && data && (
              <div className="space-y-5 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Feuille de Surveillance Clinique & Constantes Vitales
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Relevé chronologique des paramètres hémodynamiques et thermiques établi par : <span className="font-semibold">{data.measuredBy}</span>.
                  </p>
                </div>

                {/* Table of measurements */}
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px]">
                      <th className="border border-slate-300 p-2 font-bold">Date & Heure</th>
                      <th className="border border-slate-300 p-2 font-bold text-center">Température (°C)</th>
                      <th className="border border-slate-300 p-2 font-bold text-center">TA (mmHg)</th>
                      <th className="border border-slate-300 p-2 font-bold text-center">Pouls (bpm)</th>
                      <th className="border border-slate-300 p-2 font-bold text-center">SpO₂ (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.measures?.map((m: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="border border-slate-300 p-2 font-medium font-mono text-[11px]">{m.date}</td>
                        <td className={`border border-slate-300 p-2 text-center font-mono font-bold ${m.temp >= 38.5 ? "text-red-600" : ""}`}>
                          {m.temp}°C
                        </td>
                        <td className={`border border-slate-300 p-2 text-center font-mono font-bold ${m.taSys >= 140 ? "text-red-600" : ""}`}>
                          {m.taSys}/{m.taDia}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{m.pouls}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{m.spo2}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-snug">
                  <span className="font-bold">Observations médicales :</span> Constantes stables en voie de normalisation sous traitement antibiotique et antipyrétique. Surveillance de la tension artérielle poursuivie.
                </div>
              </div>
            )}

            {/* DOSSIER MÉDICAL PERMANENT DU PATIENT */}
            {type === "PATIENT_FOLDER" && (
              <div className="space-y-5 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px] mb-1">
                    Synthèse du Dossier Médical Informatisé Permanent
                  </div>
                  <p className="text-blue-800 text-[11px]">
                    Identifiant unique et historique médical consolidé au CM FONA conformément aux exigences déontologiques.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
                      Antécédents Médicaux & Chirurgicaux
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                      {patient.medicalHistory?.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                      {patient.surgicalHistory?.map((s, i) => (
                        <li key={i}>Chirurgie : {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
                      Allergies & Intolérances
                    </span>
                    {patient.allergies?.length > 0 ? (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 font-bold">
                        ⚠️ {patient.allergies.join(", ")}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Aucune allergie connue signalée</span>
                    )}
                  </div>
                </div>

                {data?.timeline && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-2 text-[11px] uppercase tracking-wider">
                      Historique Récent des Événements & Passages
                    </span>
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {data.timeline.slice(0, 6).map((ev: any, idx: number) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-900">{ev.title}</span>
                            <span className="text-slate-500 ml-2">({ev.author})</span>
                          </div>
                          <span className="font-mono text-slate-500">{formatDate(ev.occurredAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FICHE D'ACTE & SOIN INFIRMIER */}
            {type === "CARE" && data && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-bold text-teal-900 uppercase tracking-wider text-[11px] mb-1">
                    Traçabilité de Soin Infirmier — Code {data.careCode || "SOIN-2026"}
                  </div>
                  <p className="text-teal-800 text-[11px]">
                    Soin réalisé par : <span className="font-semibold">{data.nurseName}</span> le {formatDateTime(data.administeredAt || Date.now())}.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800 block mb-1">Acte dispensé :</span>
                  <p className="text-sm font-bold text-slate-900">{data.careType}</p>
                </div>

                {data.productsUsed?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 uppercase text-[10px]">
                      Matériel et Produits Utilisés
                    </span>
                    <table className="w-full text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 text-[11px]">
                          <th className="p-2 border border-slate-200">Désignation</th>
                          <th className="p-2 border border-slate-200">Quantité</th>
                          <th className="p-2 border border-slate-200">Provenance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.productsUsed.map((p: any, idx: number) => (
                          <tr key={idx} className="border border-slate-200">
                            <td className="p-2 font-medium">{p.name}</td>
                            <td className="p-2 font-mono">{p.quantity}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.source === "FONA" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                                {p.source === "FONA" ? "Fourni par FONA" : "Apporté par le patient"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                  <span className="font-bold block mb-1">Observations & État du patient :</span>
                  <p className="whitespace-pre-line">{data.observations}</p>
                </div>
              </div>
            )}

            {/* DOSSIER MATERNITÉ & OBSTÉTRICAL */}
            {type === "MATERNITY" && data && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="font-bold text-purple-900 uppercase tracking-wider text-[11px] mb-1">
                    Dossier de Suivi Prénatal & Maternité — Réf : {data.pregnancyCode || "MAT-2026"}
                  </div>
                  <p className="text-purple-800 text-[11px]">
                    Historique obstétrical : G{data.gravidity} P{data.parity} A{data.abortions} V{data.livingChildren} &middot; DDR : {data.lmpDate} &middot; DPA : {data.eddDate}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Gestité</span>
                    <span className="font-bold text-base text-slate-900">{data.gravidity}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Parité</span>
                    <span className="font-bold text-base text-slate-900">{data.parity}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Avortements</span>
                    <span className="font-bold text-base text-slate-900">{data.abortions}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase block">Enfants vivants</span>
                    <span className="font-bold text-base text-slate-900">{data.livingChildren}</span>
                  </div>
                </div>

                {data.delivery && (
                  <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                      Données d'Accouchement & Nouveau-Né
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>Mode d'accouchement : <b className="text-slate-900">{data.delivery.deliveryType}</b></div>
                      <div>Sexe nouveau-né : <b className="text-slate-900">{data.delivery.babyGender}</b></div>
                      <div>Poids : <b className="text-slate-900">{data.delivery.babyWeightGrams} g</b></div>
                      <div>Taille : <b className="text-slate-900">{data.delivery.babyHeightCm} cm</b></div>
                      <div>Score APGAR : <b className="text-slate-900">{data.delivery.apgar1min} (1min) / {data.delivery.apgar5min} (5min)</b></div>
                      <div>Pertes sanguines : <b className="text-slate-900">{data.delivery.postpartumBloodLossMl} ml</b></div>
                    </div>
                  </div>
                )}

                {data.notes && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700">
                    <span className="font-bold block mb-1">Notes obstétricales :</span>
                    <p>{data.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Signature & Stamp Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Cachet de la Clinique :</p>
              <div className="mt-3 w-32 h-20 rounded border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Tampon CM FONA
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Signature & Visa du Praticien :</p>
              <div className="mt-2 font-bold text-slate-800">
                {data.author || data.practitionerName || data.receivedBy || "Dr. Armand Koné"}
              </div>
              <div className="mt-4 font-mono text-[9px] text-slate-400">
                Certification numérique FONA Digital v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
