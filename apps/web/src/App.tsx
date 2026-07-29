import React, { useEffect, useState } from "react";
import {
  ViewMode,
  UserProfile,
  ActiveCall,
  Playbook,
  KBItem,
  CallLog,
  CallOutcome,
} from "./types";
import {
  INITIAL_USER,
  INITIAL_PROSPECT,
  INITIAL_PLAYBOOKS,
  INITIAL_KB_ITEMS,
  RECENT_CALL_LOGS,
} from "./data/mockData";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { CommandKModal } from "./components/CommandKModal";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { CallAssistantScreen } from "./components/CallAssistantScreen";
import { PlaybookLibraryScreen } from "./components/PlaybookLibraryScreen";
import { PlaybookEditorScreen } from "./components/PlaybookEditorScreen";
import { KnowledgeBaseScreen } from "./components/KnowledgeBaseScreen";
import { CallResultModal } from "./components/CallResultModal";
import { OperationsScreen } from "./components/OperationsScreen";
import {
  createPlaybook,
  finishCall,
  getCalls,
  getKnowledge,
  getOperationsOverview,
  getPlaybooks,
  startCall,
  updateCall,
  updatePlaybook,
  type ApiCall,
  type ApiKnowledge,
  type ApiPlaybook,
  type SavePlaybookInput,
} from "./api";

const savedSession = (() => {
  try {
    return JSON.parse(
      localStorage.getItem("sales-playbook-session") ?? "null",
    ) as { user: UserProfile; accessToken: string } | null;
  } catch {
    return null;
  }
})();
const demoEnabled = import.meta.env.VITE_ENABLE_DEMO === "true";

function mapApiPlaybook(playbook: ApiPlaybook): Playbook {
  const stageMap: Record<string, string> = {
    "Set the Tone": "apertura",
    Apertura: "apertura",
    "Examine Needs": "necesidades",
    Descubrimiento: "descubrimiento",
    "Leverage Wins": "propuesta",
    Propuesta: "propuesta",
    "Lock the Sale": "cierre",
    Cierre: "cierre",
    "Ease Concerns": "objeciones",
    Objeciones: "objeciones",
    Recap: "cierre",
    Recapitulación: "cierre",
  };
  return {
    id: playbook.id,
    title: playbook.title,
    description: playbook.description,
    version: playbook.version,
    status:
      playbook.status === "PUBLISHED"
        ? "publicado"
        : playbook.status === "REVIEW"
          ? "en_revision"
          : "borrador",
    language:
      playbook.language === "es"
        ? ("Español" as Playbook["language"])
        : ("Inglés" as Playbook["language"]),
    industry: "General" as Playbook["industry"],
    conversionRate: 0,
    usageCount: 0,
    updatedAt: playbook.updatedAt,
    author: "Sales Playbook",
    nodes: playbook.sections.flatMap((section) =>
      section.nodes.map((node) => ({
        id: node.id,
        stageId: (stageMap[section.title] ??
          "apertura") as Playbook["nodes"][number]["stageId"],
        title: node.title,
        script: node.script,
        suggestedQuestion: node.suggestedQuestion,
        branches: node.branches ?? [],
      })),
    ),
  };
}

function mapApiCall(call: ApiCall): CallLog {
  const outcomes: Record<string, CallOutcome> = {
    no_contesto: "no_contesto",
    no_interesado: "no_interesado",
    seguimiento: "seguimiento",
    interesado: "interesado",
    cita_agendada: "cita_agendada",
  };
  return {
    id: call.id,
    prospectName: call.prospectName,
    businessName: call.businessName,
    phone: "",
    durationSeconds: call.durationSeconds,
    timestamp: new Date(call.createdAt).toLocaleString(),
    outcome: outcomes[call.outcome ?? ""] ?? "seguimiento",
    playbookTitle: call.playbook.title,
    notes: call.notes,
    dealValueEstimate: 0,
  };
}

function mapApiKnowledge(item: ApiKnowledge): KBItem {
  const types: Record<string, KBItem["type"]> = {
    faq: "faq",
    objecion: "objecion",
    producto: "producto",
    product: "producto",
    script: "script",
    caso_real: "caso_real",
    nota: "nota",
  };
  return {
    id: item.id,
    title: item.title,
    type: types[item.type] ?? "nota",
    category: item.category,
    content: item.content,
    keyTakeaway: item.content.slice(0, 140),
    tags: item.tags,
    timesUsed: 0,
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    savedSession?.user ?? null,
  );
  const [accessToken, setAccessToken] = useState(
    savedSession?.accessToken ?? "",
  );
  const [currentView, setCurrentView] = useState<ViewMode>("call-assistant"); // Start directly on Call Assistant as requested!
  const [playbooks, setPlaybooks] = useState<Playbook[]>(
    demoEnabled ? INITIAL_PLAYBOOKS : [],
  );
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(
    demoEnabled ? INITIAL_PLAYBOOKS[0] : null,
  );
  const [backendCallId, setBackendCallId] = useState("");
  const [kbItems, setKbItems] = useState<KBItem[]>(
    demoEnabled ? INITIAL_KB_ITEMS : [],
  );
  const [recentCalls, setRecentCalls] = useState<CallLog[]>(
    demoEnabled ? RECENT_CALL_LOGS : [],
  );

  // Active call state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(
    demoEnabled
      ? {
          id: "call-active-1",
          prospect: INITIAL_PROSPECT,
          startTime: new Date(),
          elapsedSeconds: 252, // 00:04:12 initial timer
          currentStageId: "necesidades",
          isLiveTranscriptActive: true,
          notes:
            "Cliente menciona que Banamex falla los fines de semana. Tienen 3 sucursales con 6 terminales en total.",
          detectedPain:
            "Fallas de conexión Wi-Fi en horas pico y comisiones del 3.8% en Clip.",
          detectedProvider: "Banamex TPV + Clip de respaldo",
          detectedVolume: "$48,000 USD / mes",
          nextStep:
            "Presentar Clover Flex 3 con SIM 4G gratis y tasa del 1.25%",
          stageProgress: {
            apertura: true,
            descubrimiento: true,
            necesidades: true,
            propuesta: false,
            objeciones: false,
            cierre: false,
          },
        }
      : null,
  );

  // Modals & Sliders
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(
    null,
  );
  const [selectedPlaybookForEditor, setSelectedPlaybookForEditor] =
    useState<Playbook | null>(demoEnabled ? INITIAL_PLAYBOOKS[0] : null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLoginSuccess = async (user: UserProfile, token = "") => {
    user.apiRole ??= "SELLER";
    setCurrentUser(user);
    setAccessToken(token);
    if (token)
      localStorage.setItem(
        "sales-playbook-session",
        JSON.stringify({ user, accessToken: token }),
      );
    if (token)
      try {
        const apiPlaybooks = await getPlaybooks(token);
        const mapped = apiPlaybooks.map(mapApiPlaybook);
        setPlaybooks(mapped);
        if (mapped[0]) setActivePlaybook(mapped[0]);
      } catch (error) {
        console.error("No se pudieron cargar los playbooks", error);
      }
    try {
      setRecentCalls((await getCalls(token)).map(mapApiCall));
    } catch {
      /* Dashboard conserva el estado local. */
    }
    try {
      setKbItems((await getKnowledge(token)).map(mapApiKnowledge));
    } catch {
      /* Knowledge Base conserva el estado local. */
    }
    if (token)
      try {
        const metrics = await getOperationsOverview(token);
        setCurrentUser((current) =>
          current
            ? {
                ...current,
                todayCallsCount: metrics.callsToday,
                todayMeetingsBooked: metrics.meetingsToday,
                conversionRatePercent: metrics.conversionRate,
              }
            : current,
        );
      } catch {
        /* Sin métricas todavía. */
      }
  };

  useEffect(() => {
    if (!accessToken) return;
    void getPlaybooks(accessToken)
      .then((items) => {
        const mapped = items.map(mapApiPlaybook);
        setPlaybooks(mapped);
        if (mapped[0]) setActivePlaybook(mapped[0]);
      })
      .catch(() => {
        localStorage.removeItem("sales-playbook-session");
        setCurrentUser(null);
      });
    void getCalls(accessToken)
      .then((items) => setRecentCalls(items.map(mapApiCall)))
      .catch(() => undefined);
    void getKnowledge(accessToken)
      .then((items) => setKbItems(items.map(mapApiKnowledge)))
      .catch(() => undefined);
  }, [accessToken]);

  // Handlers
  const handleStartNewCall = async (
    requestedPlaybook?: Playbook,
    prospect = INITIAL_PROSPECT,
    campaignId?: string,
    consentConfirmed = false,
  ) => {
    const playbook = requestedPlaybook ?? activePlaybook;
    if (!playbook) return;
    setActivePlaybook(playbook);
    setActiveCall({
      id: `call-${Date.now()}`,
      prospect,
      startTime: new Date(),
      elapsedSeconds: 0,
      currentStageId: "apertura",
      isLiveTranscriptActive: true,
      notes: "",
      detectedPain: "Comisiones elevadas TPV e inestabilidad de red.",
      detectedProvider: prospect.currentProvider,
      detectedVolume: `$${prospect.monthlyVolumeUSD.toLocaleString()} USD / mes`,
      nextStep: prospect.objective,
      stageProgress: {
        apertura: false,
        descubrimiento: false,
        necesidades: false,
        propuesta: false,
        objeciones: false,
        cierre: false,
      },
    });
    if (accessToken) {
      try {
        const createdCall = await startCall(
          accessToken,
          playbook.id,
          prospect.contactName,
          prospect.businessName,
          prospect.id,
          campaignId,
          consentConfirmed,
        );
        setBackendCallId(createdCall.id);
      } catch (error) {
        console.error("No se pudo iniciar la llamada en la API", error);
      }
    }
    setCurrentView("call-assistant");
  };

  const handleEndCallTrigger = (outcome: CallOutcome, notes: string) => {
    setPendingOutcome(outcome);
    setIsResultModalOpen(true);
  };

  const handleConfirmCallResult = async (
    finalNotes: string,
    dateStr?: string,
  ) => {
    if (backendCallId && accessToken && pendingOutcome) {
      await finishCall(
        accessToken,
        backendCallId,
        pendingOutcome,
        finalNotes,
        activeCall?.elapsedSeconds ?? 0,
        dateStr,
      );
    }
    if (activeCall && pendingOutcome) {
      const newLog: CallLog = {
        id: `call-log-${Date.now()}`,
        prospectName: activeCall.prospect.contactName,
        businessName: activeCall.prospect.businessName,
        phone: activeCall.prospect.phone,
        durationSeconds: activeCall.elapsedSeconds,
        timestamp: "Ahora mismo",
        outcome: pendingOutcome,
        playbookTitle: activePlaybook?.title ?? "Playbook",
        notes: finalNotes || activeCall.notes || "Llamada completada.",
        dealValueEstimate: activeCall.prospect.monthlyVolumeUSD,
      };

      setRecentCalls([newLog, ...recentCalls]);

      if (currentUser) {
        const isValidCall = activeCall.elapsedSeconds >= 120;
        setCurrentUser({
          ...currentUser,
          todayCallsCount: currentUser.todayCallsCount + (isValidCall ? 1 : 0),
          todayMeetingsBooked:
            isValidCall && pendingOutcome === "cita_agendada"
              ? currentUser.todayMeetingsBooked + 1
              : currentUser.todayMeetingsBooked,
        });
      }
    }

    setIsResultModalOpen(false);
    setActiveCall(null);
    setBackendCallId("");
    setCurrentView("dashboard");
  };

  const handleSavePlaybook = async (updatedPb: Playbook) => {
    let savedPlaybook = updatedPb;
    if (accessToken) {
      const stageTitles: Record<string, string> = {
        apertura: "Apertura",
        descubrimiento: "Descubrimiento",
        necesidades: "Necesidades",
        propuesta: "Propuesta",
        objeciones: "Objeciones",
        cierre: "Cierre",
      };
      const stageOrder = [
        "apertura",
        "descubrimiento",
        "necesidades",
        "propuesta",
        "objeciones",
        "cierre",
      ];
      const payload: SavePlaybookInput = {
        title: updatedPb.title,
        description: updatedPb.description,
        language: updatedPb.language === "Español" ? "es" : "en",
        industry: updatedPb.industry,
        version: updatedPb.version,
        status:
          updatedPb.status === "publicado"
            ? "PUBLISHED"
            : updatedPb.status === "en_revision"
              ? "REVIEW"
              : "DRAFT",
        sections: stageOrder
          .map((stageId, sortOrder) => ({
            title: stageTitles[stageId],
            sortOrder,
            nodes: updatedPb.nodes
              .filter((node) => node.stageId === stageId)
              .map((node, nodeOrder) => ({
                id: node.id,
                title: node.title,
                script: node.script,
                suggestedQuestion: node.suggestedQuestion,
                sortOrder: nodeOrder,
                branches: node.branches ?? [],
              })),
          }))
          .filter((section) => section.nodes.length > 0),
      };
      let id = updatedPb.id;
      if (!playbooks.some((playbook) => playbook.id === id)) {
        const created = await createPlaybook(accessToken, payload);
        id = created.id;
      }
      savedPlaybook = mapApiPlaybook(
        await updatePlaybook(accessToken, id, payload),
      );
    }
    const exists = playbooks.some((p) => p.id === savedPlaybook.id);
    if (exists) {
      setPlaybooks((current) =>
        current.map((p) => (p.id === savedPlaybook.id ? savedPlaybook : p)),
      );
    } else {
      setPlaybooks((current) => [savedPlaybook, ...current]);
    }
    setSelectedPlaybookForEditor(savedPlaybook);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* App Top Bar Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        user={currentUser}
        activeCall={activeCall}
        onOpenCmdK={() => setIsCmdKOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          user={currentUser}
          activeCall={activeCall}
          onStartNewCall={() => {
            if (demoEnabled) void handleStartNewCall();
            else setCurrentView("operations");
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* View Router Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === "dashboard" && (
            <DashboardScreen
              user={currentUser}
              playbooks={playbooks}
              recentCalls={recentCalls}
              onStartNewCall={() => {
                if (demoEnabled) void handleStartNewCall();
                else setCurrentView("operations");
              }}
              onNavigate={(v) => setCurrentView(v)}
              onSelectPlaybook={(pb) => {
                if (demoEnabled) void handleStartNewCall(pb);
                else {
                  setActivePlaybook(pb);
                  setCurrentView("operations");
                }
              }}
            />
          )}

          {currentView === "call-assistant" &&
            (activeCall && activePlaybook ? (
              <CallAssistantScreen
                user={currentUser}
                activeCall={activeCall}
                playbook={activePlaybook}
                backendCallId={backendCallId}
                onSaveNotes={(notes, duration) => {
                  if (backendCallId && accessToken)
                    void updateCall(
                      accessToken,
                      backendCallId,
                      notes,
                      duration,
                    );
                }}
                onUpdateCall={(updated) => setActiveCall(updated)}
                onEndCallWithOutcome={handleEndCallTrigger}
                onOpenCmdK={() => setIsCmdKOpen(true)}
              />
            ) : (
              <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Selecciona un prospecto para comenzar
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  El asistente no hace la llamada. Mientras hablas por tu
                  teléfono, te muestra qué decir, qué preguntar y cómo responder
                  objeciones. Primero agrega un prospecto, registra su
                  consentimiento y pulsa Iniciar.
                </p>
                <button
                  onClick={() => setCurrentView("operations")}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                >
                  Agregar o seleccionar prospecto
                </button>
              </div>
            ))}

          {currentView === "operations" && currentUser && (
            <OperationsScreen
              accessToken={accessToken}
              user={currentUser}
              onStartCall={(prospect, playbookId, campaignId, consent) => {
                const selected =
                  playbooks.find((item) => item.id === playbookId) ??
                  activePlaybook ??
                  undefined;
                void handleStartNewCall(
                  selected,
                  prospect,
                  campaignId,
                  consent,
                );
              }}
            />
          )}

          {currentView === "playbooks" && (
            <PlaybookLibraryScreen
              playbooks={playbooks}
              onSelectPlaybook={(pb) => {
                if (demoEnabled) void handleStartNewCall(pb);
                else {
                  setActivePlaybook(pb);
                  setCurrentView("operations");
                }
              }}
              onEditPlaybook={(pb) => {
                setSelectedPlaybookForEditor(pb);
                setCurrentView("playbook-editor");
              }}
              onCreateNewPlaybook={() => {
                setSelectedPlaybookForEditor(null);
                setCurrentView("playbook-editor");
              }}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === "playbook-editor" && (
            <PlaybookEditorScreen
              playbook={selectedPlaybookForEditor}
              onSavePlaybook={handleSavePlaybook}
              onPreviewPlaybook={(pb) => {
                void handleStartNewCall(pb);
              }}
            />
          )}

          {currentView === "knowledge-base" && (
            <KnowledgeBaseScreen
              kbItems={kbItems}
              onOpenCmdK={() => setIsCmdKOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandKModal
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        kbItems={kbItems}
        onSelectScript={(script) => {
          if (activeCall) {
            setActiveCall({
              ...activeCall,
              notes: `${activeCall.notes}\n[Script utilizado]: ${script}`,
            });
          }
          setIsCmdKOpen(false);
          setCurrentView("call-assistant");
        }}
      />

      {activeCall && (
        <CallResultModal
          isOpen={isResultModalOpen}
          outcome={pendingOutcome}
          prospect={activeCall.prospect}
          initialNotes={activeCall.notes}
          onConfirm={handleConfirmCallResult}
          onCancel={() => setIsResultModalOpen(false)}
        />
      )}
    </div>
  );
}
