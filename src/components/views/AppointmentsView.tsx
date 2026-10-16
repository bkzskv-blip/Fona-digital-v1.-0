import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink,
  Stethoscope,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput, GlassSelect, GlassTextarea } from "../ui/GlassFormControls";
import { GlassModal } from "../ui/GlassModal";
import { GlassEmptyState } from "../ui/GlassEmptyState";
import { AppointmentStatus } from "../../types";

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointmentStatus,
    addVisit,
    patients,
    currentUser,
    currentSite,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab,
    showToast,
    formatDate,
  } = useApp();

  const [viewMode, setViewMode] = useState<"JOUR" | "SEMAINE" | "MOIS">("SEMAINE");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Appointment Form
  const [patientId, setPatientId] = useState(selectedPatientId || patients[0]?.id || "");
  const [practitionerName, setPractitionerName] = useState("Dr. Mariam Traoré");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [motif, setMotif] = useState("");
  const [reminderOffset, setReminderOffset] = useState("30");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchStatus;
    });
  }, [appointments, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif.trim()) {
      showToast("WARNING", "Champs requis", "Veuillez renseigner le motif du rendez-vous.");
      return;
    }

    addAppointment({
      patientId,
      practitionerId: currentUser.id,
      practitionerName,
      siteId: currentSite.id,
      date,
      timeSlot,
      durationMinutes: parseInt(durationMinutes) || 30,
      motif,
      status: "PREVU",
      reminderOffsetMinutes: parseInt(reminderOffset) || 30,
      reminderSent: false,
    });

    setIsModalOpen(false);
    setMotif("");
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "PREVU":
        return "bg-blue-500/20 text-[#4F7DF3] border-blue-400/30";
      case "CONFIRME":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "EFFECTUE":
        return "bg-cyan-500/20 text-[#55D9FF] border-cyan-400/30";
      case "ANNULE":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "ABSENT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#051426] p-1 rounded-xl border border-white/10">
            {(["JOUR", "SEMAINE", "MOIS"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === mode
                    ? "bg-[#4F7DF3] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode === "JOUR" ? "Jour" : mode === "SEMAINE" ? "Semaine" : "Mois"}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#081a33] text-xs text-slate-200 rounded-xl border border-white/15 px-3 py-2 focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="PREVU">Prévu</option>
            <option value="CONFIRME">Confirmé</option>
            <option value="EFFECTUE">Effectué</option>
            <option value="ANNULE">Annulé</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>

        <GlassButton
          variant="gold"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Planifier Rendez-vous
        </GlassButton>
      </div>

      {/* Calendar Slots / Appointment List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <GlassEmptyState
            icon={<CalendarDays className="w-7 h-7 text-[#1261A0] dark:text-[#55D9FF]" />}
            title="Aucun rendez-vous aujourd'hui"
            description="Aucun rendez-vous n'est programmé avec ce filtre. Vous pouvez enregistrer une nouvelle consultation planifiée dès maintenant."
            actionLabel="Planifier un Rendez-vous"
            actionIcon={<Plus className="w-4 h-4" />}
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          filteredAppointments.map((rdv) => {
            const patient = patients.find((p) => p.id === rdv.patientId);

            return (
              <GlassCard
                key={rdv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-[#081e3a] border border-cyan-400/30 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase">
                      {rdv.timeSlot}
                    </span>
                    <span className="text-[10px] text-slate-400">{rdv.durationMinutes} min</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(rdv.status)}`}>
                        {rdv.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {rdv.appointmentCode}
                      </span>
                      <span className="text-xs text-slate-400">· Date : {formatDate(rdv.date)}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {patient ? `${patient.lastName.toUpperCase()} ${patient.firstName}` : "Patient"}
                      <span className="font-normal text-slate-300 ml-2">— {rdv.motif}</span>
                    </h4>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#55D9FF]" />
                      <span>{rdv.practitionerName}</span>
                      <span>·</span>
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rappel auto {rdv.reminderOffsetMinutes} min avant</span>
                    </div>
                  </div>
                </div>

                {/* Status Changer Actions & 1-Click Ticket */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-wrap">
                  {rdv.status !== "EFFECTUE" && (
                    <button
                      onClick={() => {
                        const newVis = addVisit({
                          patientId: rdv.patientId,
                          siteId: currentSite.id,
                          type: "CONSULTATION",
                          status: "EN_COURS",
                          queueNumber: `A-${Math.floor(10 + Math.random() * 89)}`,
                          priority: "NORMALE",
                          createdById: currentUser.id,
                          createdByName: currentUser.fullName,
                          notes: `Arrivée RDV : ${rdv.motif}`,
                        });
                        updateAppointmentStatus(rdv.id, "EFFECTUE");
                        setSelectedPatientId(rdv.patientId);
                        showToast("SUCCESS", "Patient Admis", `Ticket ${newVis.queueNumber} émis depuis le rendez-vous.`);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-bold text-cyan-600 dark:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Émettre ticket de passage direct"
                    >
                      <span>⚡ Admettre (Ticket)</span>
                    </button>
                  )}

                  {/* Direct Consultation Launcher */}
                  <button
                    onClick={() => {
                      setSelectedPatientId(rdv.patientId);
                      setActiveTab("consultations");
                    }}
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/20 text-xs flex items-center gap-1 cursor-pointer"
                    title="Ouvrir la consultation"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Consulter</span>
                  </button>

                  {/* Direct Link to Patient Dossier */}
                  <button
                    onClick={() => {
                      setSelectedPatientId(rdv.patientId);
                      setActiveTab("patients");
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1 cursor-pointer"
                    title="Voir le dossier permanent du patient"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dossier</span>
                  </button>

                  {/* 1-Click Direct Status Selector */}
                  <select
                    value={rdv.status}
                    onChange={(e) => updateAppointmentStatus(rdv.id, e.target.value as AppointmentStatus)}
                    className="bg-[#051426] text-xs font-semibold rounded-lg border border-white/15 px-2 py-1 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="PREVU">Prévu</option>
                    <option value="CONFIRME">Confirmé</option>
                    <option value="EFFECTUE">Effectué</option>
                    <option value="ABSENT">Absent</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* NEW APPOINTMENT MODAL */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Programmer un Rendez-vous Médical"
        subtitle="Planning des consultations & rappels automatiques (Section 46-50)"
        icon={<CalendarDays className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassSelect
            label="Patient *"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.lastName.toUpperCase()} ${p.firstName} (${p.patientCode})`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassSelect
              label="Praticien Référent"
              value={practitionerName}
              onChange={(e) => setPractitionerName(e.target.value)}
              options={[
                { value: "Dr. Mariam Traoré", label: "Dr. Mariam Traoré (Médecine Générale)" },
                { value: "Dr. Armand Koné", label: "Dr. Armand Koné (Chirurgie / Direction)" },
                { value: "Awa Bamba-Diabaté (Sage-Femme)", label: "Awa Bamba-Diabaté (Sage-Femme)" },
                { value: "Koffi Yao Jean (Infirmier)", label: "Koffi Yao Jean (Soins infirmiers)" },
              ]}
            />

            <GlassSelect
              label="Durée Estimée"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              options={[
                { value: "15", label: "15 minutes (Acte rapide)" },
                { value: "30", label: "30 minutes (Consultation standard)" },
                { value: "45", label: "45 minutes (CPN / Échographie)" },
                { value: "60", label: "60 minutes (Bilan complet)" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <GlassInput
              label="Heure du Créneau *"
              type="time"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
            />
          </div>

          {/* Quick Time Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400">Créneaux fréquents :</span>
            {["08:30", "09:00", "10:00", "11:30", "15:00", "16:30"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeSlot(t)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                  timeSlot === t ? "bg-cyan-500/20 text-[#55D9FF] border-cyan-400/40" : "bg-white/5 border-white/10 text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Motif du Rendez-vous *
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["Consultation Générale", "Suivi CPN", "Contrôle tensionnel", "Bilan biologique", "Échographie obstétricale", "Pansement / Soin"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotif(m)}
                    className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>
            <GlassInput
              placeholder="Ex: Contrôle tensionnel 3 mois, échographie T2..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              required
            />
          </div>

          <GlassSelect
            label="Délai de Rappel Automatique (Notification)"
            value={reminderOffset}
            onChange={(e) => setReminderOffset(e.target.value)}
            options={[
              { value: "15", label: "15 minutes avant" },
              { value: "30", label: "30 minutes avant (Défaut recommandé)" },
              { value: "60", label: "1 heure avant" },
              { value: "1440", label: "24 heures avant" },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <GlassButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </GlassButton>
            <GlassButton type="submit" variant="gold" size="md">
              Enregistrer le Rendez-vous
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
