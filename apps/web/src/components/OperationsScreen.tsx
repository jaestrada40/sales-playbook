import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileUp,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  addDnc,
  createCampaign,
  getAudit,
  getCampaigns,
  getCompliance,
  getOperationsOverview,
  getProspects,
  getTeams,
  importProspects,
  purgeExpiredData,
  saveCompliance,
  updateProspect,
  type ApiCampaign,
  type ApiOverview,
  type ApiProspect,
  type ApiTeam,
} from "../api";
import type { Prospect, UserProfile } from "../types";

interface Props {
  accessToken: string;
  user: UserProfile;
  onStartCall: (
    prospect: Prospect,
    playbookId?: string,
    campaignId?: string,
    consentConfirmed?: boolean,
  ) => void;
}

const toProspect = (item: ApiProspect): Prospect => ({
  id: item.id,
  businessName: item.businessName,
  contactName: item.contactName,
  role: item.role,
  phone: item.phone,
  email: item.email,
  businessType: item.businessType,
  currentProvider: item.currentProvider,
  monthlyVolumeUSD: item.monthlyVolumeUSD,
  terminalCount: item.terminalCount,
  objective: item.objective,
  mainPainPoint: item.mainPainPoint,
  address: item.address,
  tags: item.tags,
});

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) {
      cell += '"';
      i += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map((value) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  const aliases: Record<string, string> = {
    businessname: "businessName",
    negocio: "businessName",
    contactname: "contactName",
    contacto: "contactName",
    phone: "phone",
    telefono: "phone",
    email: "email",
    role: "role",
    cargo: "role",
    businesstype: "businessType",
    tipo: "businessType",
    currentprovider: "currentProvider",
    proveedor: "currentProvider",
    monthlyvolumeusd: "monthlyVolumeUSD",
    volumen: "monthlyVolumeUSD",
    terminalcount: "terminalCount",
    terminales: "terminalCount",
    objective: "objective",
    objetivo: "objective",
    mainpainpoint: "mainPainPoint",
    problema: "mainPainPoint",
    address: "address",
    direccion: "address",
    tags: "tags",
  };
  return rows
    .slice(1)
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [
          aliases[header] ?? header,
          ["monthlyVolumeUSD", "terminalCount"].includes(aliases[header])
            ? Number(values[index] || 0)
            : aliases[header] === "tags"
              ? (values[index] || "").split("|").filter(Boolean)
              : (values[index] ?? ""),
        ]),
      ),
    )
    .filter((item) => item.businessName && item.contactName && item.phone);
}

export const OperationsScreen: React.FC<Props> = ({
  accessToken,
  user,
  onStartCall,
}) => {
  const manager = user.apiRole !== "SELLER";
  const [overview, setOverview] = useState<ApiOverview | null>(null);
  const [prospects, setProspects] = useState<ApiProspect[]>([]);
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [level, setLevel] = useState<"daily" | "admin">("daily");
  const [tab, setTab] = useState<
    "prospects" | "followups" | "campaigns" | "team" | "compliance" | "audit"
  >("prospects");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [showNewProspect, setShowNewProspect] = useState(false);
  const [newProspect, setNewProspect] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
  });
  const reload = async () => {
    const [o, p, c, t, co] = await Promise.all([
      getOperationsOverview(accessToken),
      getProspects(accessToken),
      getCampaigns(accessToken),
      getTeams(accessToken),
      getCompliance(accessToken),
    ]);
    setOverview(o);
    setProspects(p);
    setCampaigns(c);
    setTeams(t.teams);
    setCompliance(co);
    if (manager) setAudit(await getAudit(accessToken));
  };
  useEffect(() => {
    void reload().catch((error) =>
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar operaciones",
      ),
    );
  }, [accessToken]);
  const visible = useMemo(
    () =>
      prospects.filter((p) =>
        `${p.businessName} ${p.contactName} ${p.phone}`
          .toLowerCase()
          .includes(filter.toLowerCase()),
      ),
    [prospects, filter],
  );
  const cards = overview
    ? [
        ["Llamadas válidas", overview.callsToday],
        ["Intentos hoy", overview.attemptsToday],
        ["Citas hoy", overview.meetingsToday],
        ["Conversión", `${overview.conversionRate}%`],
        ["Pipeline", `$${overview.pipelineValue.toLocaleString()}`],
        ["Tareas pendientes", overview.pendingTasks],
      ]
    : [];

  const exportCsv = () => {
    const header = [
      "businessName",
      "contactName",
      "phone",
      "email",
      "status",
      "campaign",
      "assignee",
      "attempts",
      "consent",
    ];
    const lines = prospects.map((p) =>
      [
        p.businessName,
        p.contactName,
        p.phone,
        p.email,
        p.status,
        p.campaign.name,
        p.assignee?.name ?? "",
        p.attempts,
        p.consentStatus,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "prospectos-crm.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = async (file: File) => {
    if (!campaigns[0]) throw new Error("Crea una campaña antes de importar");
    const rows = parseCsv(await file.text());
    if (!rows.length)
      throw new Error(
        "CSV sin filas válidas. Requiere negocio, contacto y teléfono.",
      );
    const result = await importProspects(accessToken, campaigns[0].id, rows);
    setMessage(
      `${result.imported} prospectos importados; ${result.blockedByDnc} bloqueados por DNC.`,
    );
    await reload();
  };
  const handleCreateProspect = async () => {
    if (!campaigns[0])
      throw new Error("Crea una campaña antes de agregar prospectos");
    if (
      !newProspect.businessName ||
      !newProspect.contactName ||
      !newProspect.phone
    )
      throw new Error("Completa negocio, contacto y teléfono");
    await importProspects(accessToken, campaigns[0].id, [newProspect]);
    setNewProspect({ businessName: "", contactName: "", phone: "", email: "" });
    setShowNewProspect(false);
    setMessage(
      "Prospecto agregado. Registra su consentimiento para iniciar una sesión.",
    );
    await reload();
  };

  return (
    <div className="space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Operación comercial
        </h1>
        <p className="text-xs text-slate-500">
          Prospectos, llamadas y seguimientos del equipo de ventas.
        </p>
      </div>
      {message && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900">
          {message}
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {cards.map(([label, value]) => (
          <div
            key={String(label)}
            className="bg-white p-4 rounded-xl border border-slate-200"
          >
            <p className="text-[10px] uppercase font-bold text-slate-400">
              {label}
            </p>
            <p className="text-xl font-extrabold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950">
        <strong>¿Cómo te ayuda?</strong> Selecciona un prospecto, sigue el guion
        durante la conversación y registra el resultado. La aplicación guarda el
        intento, crea seguimientos y actualiza tus métricas.{" "}
        <strong>
          Solo cuentan como llamadas válidas las que duren 2:00 minutos o más.
        </strong>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {(level === "daily"
            ? (["prospects", "followups", "campaigns"] as const)
            : (["team", "compliance", "audit"] as const)
          ).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold ${tab === id ? "bg-slate-900 text-white" : "bg-white border border-slate-200"}`}
            >
              {id === "prospects"
                ? "Prospectos"
                : id === "followups"
                  ? "Seguimientos"
                  : id === "campaigns"
                    ? "Campañas"
                    : id === "team"
                      ? "Equipo"
                      : id === "compliance"
                        ? "Cumplimiento"
                        : "Auditoría"}
            </button>
          ))}
        </div>
        {manager && (
          <button
            onClick={() => {
              const next = level === "daily" ? "admin" : "daily";
              setLevel(next);
              setTab(next === "daily" ? "prospects" : "team");
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white flex items-center gap-2"
          >
            {level === "daily" ? (
              <Settings className="w-4 h-4" />
            ) : (
              <BriefcaseBusiness className="w-4 h-4" />
            )}
            {level === "daily"
              ? "Administración avanzada"
              : "Volver a operación diaria"}
          </button>
        )}
      </div>
      {tab === "prospects" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 flex flex-wrap gap-2 justify-between">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar prospecto..."
              className="px-3 py-2 border rounded-xl text-xs min-w-64"
            />
            <div className="flex gap-2">
              {manager && (
                <>
                  <button
                    onClick={() => setShowNewProspect((open) => !open)}
                    className="px-3 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold flex gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    Agregar prospecto
                  </button>
                  <label className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer flex gap-1">
                    <FileUp className="w-4 h-4" />
                    Importar CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        void handleImport(e.target.files[0]).catch((x) =>
                          setMessage(x.message),
                        )
                      }
                    />
                  </label>
                </>
              )}
              <button
                onClick={exportCsv}
                className="px-3 py-2 border rounded-xl text-xs font-bold flex gap-1"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
          {showNewProspect && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateProspect().catch((error) =>
                  setMessage(error.message),
                );
              }}
              className="mx-4 mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid sm:grid-cols-2 lg:grid-cols-5 gap-2"
            >
              {(
                [
                  ["businessName", "Negocio *"],
                  ["contactName", "Nombre del contacto *"],
                  ["phone", "Teléfono *"],
                  ["email", "Correo"],
                ] as const
              ).map(([field, placeholder]) => (
                <input
                  key={field}
                  value={newProspect[field]}
                  onChange={(event) =>
                    setNewProspect({
                      ...newProspect,
                      [field]: event.target.value,
                    })
                  }
                  placeholder={placeholder}
                  type={field === "email" ? "email" : "text"}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              ))}
              <button className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
                Guardar prospecto
              </button>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Prospecto",
                    "Campaña",
                    "Asignado",
                    "Estado",
                    "Intentos",
                    "Consentimiento",
                    "Pipeline",
                    "Acciones",
                  ].map((h) => (
                    <th key={h} className="p-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr className="border-t">
                    <td colSpan={8} className="p-10 text-center text-slate-500">
                      <strong className="block text-slate-800 mb-1">
                        Todavía no hay prospectos.
                      </strong>
                      Agrega uno manualmente o importa tu lista CSV. Después
                      registra el consentimiento y pulsa Iniciar para abrir el
                      asistente de guion.
                    </td>
                  </tr>
                )}
                {visible.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      <strong>{p.businessName}</strong>
                      <br />
                      <span className="text-slate-500">
                        {p.contactName} · {p.phone}
                      </span>
                    </td>
                    <td className="p-3">{p.campaign.name}</td>
                    <td className="p-3">
                      {manager ? (
                        <select
                          value={p.assignee?.id ?? ""}
                          onChange={(e) =>
                            void updateProspect(accessToken, p.id, {
                              assigneeId: e.target.value || undefined,
                              status: e.target.value ? "ASSIGNED" : "NEW",
                            }).then(reload)
                          }
                          className="border rounded p-1"
                        >
                          <option value="">Sin asignar</option>
                          {teams
                            .flatMap((t) => t.users)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                        </select>
                      ) : (
                        p.assignee?.name
                      )}
                    </td>
                    <td className="p-3">
                      {p.doNotCall ? (
                        <span className="text-rose-600 font-bold">DNC</span>
                      ) : (
                        p.status
                      )}
                    </td>
                    <td className="p-3">{p.attempts}</td>
                    <td className="p-3">
                      <select
                        value={p.consentStatus}
                        onChange={(e) =>
                          void updateProspect(accessToken, p.id, {
                            consentStatus: e.target.value,
                            consentSource: "MANUAL",
                          }).then(reload)
                        }
                        className="border rounded p-1"
                      >
                        <option>UNKNOWN</option>
                        <option>PENDING</option>
                        <option>GRANTED</option>
                        <option>DENIED</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={p.opportunity?.stage ?? "DISCOVERY"}
                        onChange={(e) =>
                          void updateProspect(accessToken, p.id, {
                            opportunityStage: e.target.value,
                          }).then(reload)
                        }
                        className="border rounded p-1"
                      >
                        <option>DISCOVERY</option>
                        <option>PROPOSAL</option>
                        <option>FOLLOW_UP</option>
                        <option>WON</option>
                        <option>LOST</option>
                      </select>
                    </td>
                    <td className="p-3 flex gap-1">
                      <button
                        disabled={p.doNotCall || p.consentStatus !== "GRANTED"}
                        title={
                          p.doNotCall
                            ? "El prospecto está en la lista de no llamar"
                            : p.consentStatus !== "GRANTED"
                              ? "Registra el consentimiento antes de iniciar"
                              : "Iniciar sesión de llamada"
                        }
                        onClick={() =>
                          onStartCall(
                            toProspect(p),
                            p.campaign.playbookId,
                            p.campaign.id,
                            true,
                          )
                        }
                        className="px-2 py-1 bg-emerald-500 rounded font-bold disabled:opacity-40"
                      >
                        Iniciar
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Motivo para no llamar");
                          if (reason)
                            void addDnc(accessToken, p.phone, reason).then(
                              reload,
                            );
                        }}
                        className="px-2 py-1 bg-rose-50 text-rose-700 rounded"
                      >
                        DNC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "followups" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 font-bold flex gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Seguimientos pendientes
          </div>
          {prospects.flatMap((prospect) =>
            prospect.tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div>
                  <strong>{task.title}</strong>
                  <p className="text-slate-500">
                    {prospect.businessName} · {prospect.contactName}
                  </p>
                </div>
                <span className="font-semibold text-slate-600">
                  {new Date(task.dueAt).toLocaleString()}
                </span>
              </div>
            )),
          )}
          {!prospects.some((prospect) => prospect.tasks.length > 0) && (
            <p className="p-6 border-t text-sm text-slate-500">
              No hay seguimientos pendientes.
            </p>
          )}
        </div>
      )}
      {tab === "campaigns" && (
        <div>
          <section className="bg-white p-5 rounded-2xl border">
            <h2 className="font-bold mb-3 flex gap-2">
              <BriefcaseBusiness className="w-4 h-4" />
              Campañas outbound
            </h2>
            {campaigns.map((c) => (
              <div key={c.id} className="p-3 border rounded-xl mb-2">
                <strong>{c.name}</strong>
                <p className="text-xs text-slate-500">
                  {c._count.prospects} prospectos · {c._count.calls} llamadas ·
                  meta {c.dailyCallGoal}/día
                </p>
              </div>
            ))}
            {manager && (
              <button
                onClick={() => {
                  const name = prompt("Nombre de la campaña");
                  if (name && teams[0])
                    void createCampaign(accessToken, {
                      name,
                      teamId: teams[0].id,
                      direction: "OUTBOUND",
                    }).then(reload);
                }}
                className="mt-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Nueva campaña
              </button>
            )}
          </section>
        </div>
      )}
      {tab === "team" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white p-5 rounded-2xl border">
            <h2 className="font-bold mb-3 flex gap-2">
              <Users className="w-4 h-4" />
              Equipos
            </h2>
            {teams.map((t) => (
              <div key={t.id}>
                <strong>{t.name}</strong>
                {t.users.map((u) => (
                  <p key={u.id} className="text-xs p-2 border-b">
                    {u.name} · {u.role}
                  </p>
                ))}
              </div>
            ))}
            {overview?.agents.map((a) => (
              <p key={a.id} className="text-xs mt-2">
                {a.name}: {a._count.calls} llamadas hoy,{" "}
                {a._count.assignedProspects} asignados
              </p>
            ))}
          </section>
        </div>
      )}
      {tab === "compliance" && (
        <div className="bg-white p-5 rounded-2xl border">
          <h2 className="font-bold flex gap-2">
            <ShieldCheck className="w-4 h-4" />
            Política de llamadas
          </h2>
          {compliance.map((c) => (
            <div key={c.id} className="grid sm:grid-cols-3 gap-3 mt-4 text-xs">
              <label>
                Jurisdicción
                <input
                  value={c.jurisdiction}
                  readOnly
                  className="block border p-2 rounded w-full"
                />
              </label>
              <label>
                Inicio
                <input
                  type="number"
                  value={c.callingStartHour}
                  onChange={(e) =>
                    setCompliance([
                      { ...c, callingStartHour: Number(e.target.value) },
                    ])
                  }
                  className="block border p-2 rounded w-full"
                />
              </label>
              <label>
                Fin
                <input
                  type="number"
                  value={c.callingEndHour}
                  onChange={(e) =>
                    setCompliance([
                      { ...c, callingEndHour: Number(e.target.value) },
                    ])
                  }
                  className="block border p-2 rounded w-full"
                />
              </label>
              <label>
                Retención (días)
                <input
                  type="number"
                  value={c.retentionDays}
                  onChange={(e) =>
                    setCompliance([
                      { ...c, retentionDays: Number(e.target.value) },
                    ])
                  }
                  className="block border p-2 rounded w-full"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.requireConsent}
                  onChange={(e) =>
                    setCompliance([{ ...c, requireConsent: e.target.checked }])
                  }
                />
                Exigir consentimiento
              </label>
              <p className="text-amber-700">
                Grabación desactivada: no hay telefonía integrada.
              </p>
              <button
                onClick={() =>
                  void saveCompliance(accessToken, {
                    jurisdiction: c.jurisdiction,
                    timezone: c.timezone,
                    callingStartHour: c.callingStartHour,
                    callingEndHour: c.callingEndHour,
                    retentionDays: c.retentionDays,
                    requireConsent: c.requireConsent,
                  }).then(() => setMessage("Política guardada"))
                }
                className="px-3 py-2 bg-slate-900 text-white rounded-xl font-bold"
              >
                Guardar política
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "compliance" && (
        <button
          onClick={() => {
            if (
              confirm(
                "Se eliminarán llamadas y auditorías anteriores al período de retención. ¿Continuar?",
              )
            )
              void purgeExpiredData(accessToken).then((result) =>
                setMessage(
                  `${result.callsDeleted} llamadas y ${result.auditDeleted} auditorías eliminadas.`,
                ),
              );
          }}
          className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
        >
          Aplicar retención ahora
        </button>
      )}
      {tab === "audit" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 font-bold flex gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Últimos cambios
          </div>
          {audit.map((a) => (
            <div key={a.id} className="p-3 border-t text-xs">
              <strong>{a.actor.name}</strong> · {a.action} {a.entityType} ·{" "}
              {new Date(a.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
