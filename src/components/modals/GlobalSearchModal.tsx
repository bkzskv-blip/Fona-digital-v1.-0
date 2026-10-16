import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  User,
  Stethoscope,
  Calendar,
  Receipt,
  FileText,
  ChevronRight,
  X,
  Baby,
  FlaskConical,
  ScanLine,
  Activity,
  CreditCard,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    patients,
    visits,
    consultations,
    appointments,
    invoices,
    pregnancies,
    labRequests,
    imagingRequests,
    setSelectedPatientId,
    setActiveTab,
    resolvedTheme,
  } = useApp();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isGlobalSearchOpen]);

  // Keyboard navigation / close listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      } else if (e.key === "Escape" && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // Search across all medical and operational records
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        patients: [],
        visits: [],
        consultations: [],
        appointments: [],
        maternity: [],
        labs: [],
        imaging: [],
        invoices: [],
      };
    }

    const matchedPatients = patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.patientCode.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );

    const matchedVisits = visits.filter(
      (v) =>
        v.visitCode.toLowerCase().includes(q) ||
        v.queueNumber.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
    );

    const matchedConsultations = consultations.filter(
      (c) =>
        c.consultationCode.toLowerCase().includes(q) ||
        c.motif.toLowerCase().includes(q) ||
        c.practitionerName.toLowerCase().includes(q)
    );

    const matchedAppointments = appointments.filter(
      (a) =>
        a.appointmentCode.toLowerCase().includes(q) ||
        a.motif.toLowerCase().includes(q) ||
        a.practitionerName.toLowerCase().includes(q)
    );

    const matchedMaternity = pregnancies.filter(
      (preg) =>
        preg.pregnancyCode.toLowerCase().includes(q) ||
        (preg.notes && preg.notes.toLowerCase().includes(q))
    );

    const matchedLabs = labRequests.filter(
      (lab) =>
        lab.labCode.toLowerCase().includes(q) ||
        lab.requesterName.toLowerCase().includes(q) ||
        lab.tests.some((t) => t.testName.toLowerCase().includes(q))
    );

    const matchedImaging = imagingRequests.filter(
      (img) =>
        img.imagingCode.toLowerCase().includes(q) ||
        img.examName.toLowerCase().includes(q) ||
        img.indication.toLowerCase().includes(q)
    );

    const matchedInvoices = invoices.filter(
      (i) =>
        i.invoiceCode.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q)
    );

    return {
      patients: matchedPatients.slice(0, 5),
      visits: matchedVisits.slice(0, 4),
      consultations: matchedConsultations.slice(0, 4),
      appointments: matchedAppointments.slice(0, 4),
      maternity: matchedMaternity.slice(0, 3),
      labs: matchedLabs.slice(0, 3),
      imaging: matchedImaging.slice(0, 3),
      invoices: matchedInvoices.slice(0, 3),
    };
  }, [
    query,
    patients,
    visits,
    consultations,
    appointments,
    pregnancies,
    labRequests,
    imagingRequests,
    invoices,
  ]);

  if (!isGlobalSearchOpen) return null;

  const totalCount =
    results.patients.length +
    results.visits.length +
    results.consultations.length +
    results.appointments.length +
    results.maternity.length +
    results.labs.length +
    results.imaging.length +
    results.invoices.length;

  const isLight = resolvedTheme === "light";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#020b17]/80 backdrop-blur-md"
        onClick={() => setIsGlobalSearchOpen(false)}
      />

      {/* Surface Modal */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl border border-[var(--border)] shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl overflow-hidden z-10 animate-fona-modal ${
          isLight ? "bg-white/95 text-[#071A33]" : "bg-[#071A33]/95 text-white"
        }`}
      >
        {/* Specular Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Search className="w-5 h-5 text-[#1261A0] dark:text-[#55D9FF] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher patient, code FONA, n° téléphone, passage, consultation, examen..."
            className="w-full bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 rounded-lg bg-[var(--surface)] text-[11px] font-mono text-[var(--text-secondary)] border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {query && totalCount === 0 && (
            <div className="py-12 text-center text-[var(--text-secondary)] text-xs">
              Aucun résultat pour <span className="font-semibold text-[var(--text-primary)]">« {query} »</span>.
            </div>
          )}

          {!query && (
            <div className="py-8 px-4 text-center space-y-1">
              <p className="text-xs text-[var(--text-secondary)]">
                Tapez le nom d'un patient (ex: <span className="text-cyan-500 font-semibold">Traoré</span>), son code (ex: <span className="text-cyan-500 font-semibold">PAT-2026-0001</span>), un numéro de téléphone, ou un motif d'acte.
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Raccourci clavier rapide : <kbd className="font-mono font-bold px-1.5 py-0.5 bg-[var(--surface)] rounded border text-[10px]">Ctrl + K</kbd>
              </p>
            </div>
          )}

          {/* 1. Patients Section */}
          {results.patients.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1261A0] dark:text-[#55D9FF]" />
                Patients ({results.patients.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.patients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatientId(pat.id);
                      setActiveTab("patients");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#1261A0] dark:text-[#55D9FF] border border-blue-400/25 flex items-center justify-center font-bold text-xs shrink-0">
                        {pat.firstName[0]}
                        {pat.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[#1261A0] dark:group-hover:text-[#55D9FF] truncate">
                          {pat.lastName.toUpperCase()} {pat.firstName}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                          <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{pat.patientCode}</span>
                          <span>&middot;</span>
                          <span>{pat.phone}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Passages / Visites */}
          {results.visits.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                Passages & Admissions ({results.visits.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.visits.map((vis) => {
                  const pat = patients.find((p) => p.id === vis.patientId);
                  return (
                    <div
                      key={vis.id}
                      onClick={() => {
                        setSelectedPatientId(vis.patientId);
                        setActiveTab("patients");
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">
                            {vis.visitCode}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
                            Ticket {vis.queueNumber}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                            {vis.type}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate mt-0.5">
                          {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patient"} &mdash; {vis.notes || "Passage au centre"}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Consultations */}
          {results.consultations.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
                Consultations Médicales ({results.consultations.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.consultations.map((cons) => (
                  <div
                    key={cons.id}
                    onClick={() => {
                      setSelectedPatientId(cons.patientId);
                      setActiveTab("consultations");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-300">
                        {cons.consultationCode}
                      </div>
                      <div className="text-xs text-[var(--text-primary)] truncate font-medium">{cons.motif}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{cons.practitionerName}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Rendez-vous */}
          {results.appointments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                Rendez-vous ({results.appointments.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.appointments.map((rdv) => (
                  <div
                    key={rdv.id}
                    onClick={() => {
                      setSelectedPatientId(rdv.patientId);
                      setActiveTab("appointments");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-violet-600 dark:text-violet-300">
                        {rdv.appointmentCode} &middot; {rdv.date} à {rdv.timeSlot}
                      </div>
                      <div className="text-xs text-[var(--text-primary)] truncate font-medium">{rdv.motif}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{rdv.practitionerName}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Maternité */}
          {results.maternity.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5 text-pink-500" />
                Dossiers Maternité ({results.maternity.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.maternity.map((preg) => {
                  const pat = patients.find((p) => p.id === preg.patientId);
                  return (
                    <div
                      key={preg.id}
                      onClick={() => {
                        setSelectedPatientId(preg.patientId);
                        setActiveTab("maternite");
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-pink-600 dark:text-pink-300">
                          {preg.pregnancyCode} &middot; DPA : {preg.eddDate}
                        </div>
                        <div className="text-xs text-[var(--text-primary)] truncate font-medium">
                          {pat ? `${pat.lastName.toUpperCase()} ${pat.firstName}` : "Patiente"} &mdash; G{preg.gravidity} P{preg.parity}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Laboratoire & Imagerie */}
          {(results.labs.length > 0 || results.imaging.length > 0) && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                Examens & Analyses ({results.labs.length + results.imaging.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.labs.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setSelectedPatientId(l.patientId);
                      setActiveTab("laboratory");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-300">
                        {l.labCode} &middot; Biologie
                      </div>
                      <div className="text-xs text-[var(--text-primary)] truncate font-medium">
                        {l.tests.map((t) => t.testName).slice(0, 2).join(", ")}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                  </div>
                ))}
                {results.imaging.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedPatientId(img.patientId);
                      setActiveTab("imaging");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-300">
                        {img.imagingCode} &middot; {img.modality}
                      </div>
                      <div className="text-xs text-[var(--text-primary)] truncate font-medium">
                        {img.examName}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Facturation & Caisse */}
          {results.invoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] px-3 py-1 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#D9B45B]" />
                Facturation & Caisse ({results.invoices.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedPatientId(inv.patientId);
                      setActiveTab("cashier");
                      setIsGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl hover:bg-[var(--surface-subtle)] border border-transparent hover:border-[var(--border)] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-[#D9B45B]">
                        {inv.invoiceCode} &middot; Statut: {inv.status}
                      </div>
                      <div className="text-xs text-[var(--text-primary)] truncate font-medium">
                        Solde dû : {inv.balance} FCFA
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <span>Recherche globale FONA Digital</span>
          <span className="font-mono text-[10px]">Centre Médical FONA</span>
        </div>
      </div>
    </div>
  );
};
