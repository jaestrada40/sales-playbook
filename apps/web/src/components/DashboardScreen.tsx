import React from "react";
import {
  PhoneIncoming,
  CheckCircle2,
  Clock,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
  Phone,
  User,
  Calendar,
  ChevronRight,
  DollarSign,
  Sparkles,
  Zap,
} from "lucide-react";
import { UserProfile, Playbook, CallLog, ViewMode } from "../types";

interface DashboardScreenProps {
  user: UserProfile;
  playbooks: Playbook[];
  recentCalls: CallLog[];
  onStartNewCall: () => void;
  onNavigate: (view: ViewMode) => void;
  onSelectPlaybook: (playbook: Playbook) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  playbooks,
  recentCalls,
  onStartNewCall,
  onNavigate,
  onSelectPlaybook,
}) => {
  const pendingFollowUps = recentCalls.filter(
    (call) => call.outcome === "seguimiento",
  ).length;
  const interestedCalls = recentCalls.filter((call) =>
    ["interesado", "cita_agendada"].includes(call.outcome),
  ).length;
  const pipelineEstimate = recentCalls.reduce(
    (sum, call) => sum + (call.dealValueEstimate ?? 0),
    0,
  );
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "cita_agendada":
        return {
          label: "Cita Agendada",
          color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "interesado":
        return {
          label: "Interesado",
          color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        };
      case "seguimiento":
        return {
          label: "Seguimiento Pendiente",
          color: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "no_interesado":
        return {
          label: "No Interesado",
          color: "bg-rose-100 text-rose-800 border-rose-300",
        };
      default:
        return {
          label: "No Contestó",
          color: "bg-slate-100 text-slate-700 border-slate-300",
        };
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Main CTA */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Copiloto de Llamadas Activo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Hola, {user.name}! 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Consulta tus prospectos asignados y tareas pendientes en{" "}
            <span className="text-emerald-400 font-bold">
              CRM y Operaciones
            </span>
            .
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            id="dashboard-start-call-btn"
            onClick={onStartNewCall}
            className="w-full sm:w-auto px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-98 cursor-pointer text-base"
          >
            <PhoneIncoming className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>Iniciar nueva llamada</span>
          </button>
        </div>

        {/* Decorative background accent */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Llamadas Completadas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {user.todayCallsCount}
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
              Registradas hoy
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Objetivo diario: 20 llamadas
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Citas Agendadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {user.todayMeetingsBooked}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              {interestedCalls} oportunidades
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Valor registrado: ${pipelineEstimate.toLocaleString()} USD
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Seguimientos Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {pendingFollowUps}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              Programados hoy
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Consulta fechas en CRM y Operaciones
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tasa de Conversión</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {user.conversionRatePercent}%
            </span>
            <span className="text-xs text-purple-600 font-bold">
              Calculada con resultados
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Interesados y citas / llamadas
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Calls & Pending Followups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Call History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Resumen de Llamadas Recientes
                </h3>
                <p className="text-xs text-slate-500">
                  Historial de conversaciones asistidas de hoy
                </p>
              </div>
              <button
                onClick={() => onNavigate("call-assistant")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Ver copilot</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentCalls.map((log) => {
                const outcomeInfo = getOutcomeBadge(log.outcome);
                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {log.businessName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${outcomeInfo.color}`}
                        >
                          {outcomeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Contacto: {log.prospectName}</span>
                        <span>•</span>
                        <span>{log.phone}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">
                          {log.timestamp}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-1">
                        "{log.notes}"
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-slate-700">
                          Duración
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {formatDuration(log.durationSeconds)}
                        </span>
                      </div>
                      <button
                        onClick={onStartNewCall}
                        className="p-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        title="Volver a llamar"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Llamar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Playbooks */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Playbooks Recientes
                </h3>
                <p className="text-xs text-slate-500">
                  Guiones de ventas más efectivos
                </p>
              </div>
              <button
                onClick={() => onNavigate("playbooks")}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {playbooks.slice(0, 3).map((pb) => (
                <div
                  key={pb.id}
                  onClick={() => {
                    onSelectPlaybook(pb);
                    onNavigate("call-assistant");
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      {pb.version}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      {pb.conversionRate}% conv.
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 mb-1">
                    {pb.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {pb.description}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{pb.usageCount} usos esta semana</span>
                    <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
                      Cargar en llamada →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="p-4 bg-indigo-950 text-white rounded-2xl shadow-md space-y-2 border border-indigo-900">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Tip de Conversión POS</span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Mencionar la{" "}
              <strong className="text-white">
                SIM 4G Multi-carrier ilimitada incluida
              </strong>{" "}
              en la Clover Flex reduce la objeción por caídas de Wi-Fi en un
              64%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
