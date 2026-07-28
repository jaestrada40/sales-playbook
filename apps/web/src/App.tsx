import React, { useEffect, useState } from 'react';
import { 
  ViewMode, 
  UserProfile, 
  ActiveCall, 
  Playbook, 
  KBItem, 
  CallLog, 
  CallOutcome 
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_PROSPECT, 
  INITIAL_PLAYBOOKS, 
  INITIAL_KB_ITEMS, 
  RECENT_CALL_LOGS 
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandKModal } from './components/CommandKModal';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { CallAssistantScreen } from './components/CallAssistantScreen';
import { PlaybookLibraryScreen } from './components/PlaybookLibraryScreen';
import { PlaybookEditorScreen } from './components/PlaybookEditorScreen';
import { KnowledgeBaseScreen } from './components/KnowledgeBaseScreen';
import { UxDecisionsModal } from './components/UxDecisionsModal';
import { CallResultModal } from './components/CallResultModal';
import { finishCall, getCalls, getPlaybooks, startCall, updateCall, type ApiCall, type ApiPlaybook } from './api';

const savedSession = (() => {
  try { return JSON.parse(localStorage.getItem('sales-playbook-session') ?? 'null') as { user: UserProfile; accessToken: string } | null; } catch { return null; }
})();

function mapApiPlaybook(playbook: ApiPlaybook): Playbook {
  const stageMap: Record<string, string> = {
    'Set the Tone': 'apertura', Apertura: 'apertura',
    'Examine Needs': 'necesidades', Descubrimiento: 'descubrimiento',
    'Leverage Wins': 'propuesta', Propuesta: 'propuesta',
    'Lock the Sale': 'cierre', Cierre: 'cierre',
    'Ease Concerns': 'objeciones', Objeciones: 'objeciones',
    Recap: 'cierre', Recapitulación: 'cierre',
  };
  return {
    id: playbook.id,
    title: playbook.title,
    description: playbook.description,
    version: playbook.version,
    status: playbook.status === 'PUBLISHED' ? 'publicado' : playbook.status === 'REVIEW' ? 'en_revision' : 'borrador',
    language: playbook.language === 'es' ? 'Español' as Playbook['language'] : 'Inglés' as Playbook['language'],
    industry: 'General' as Playbook['industry'],
    conversionRate: 0,
    usageCount: 0,
    updatedAt: playbook.updatedAt,
    author: 'Sales Playbook',
    nodes: playbook.sections.flatMap((section) => section.nodes.map((node) => ({
      id: node.id,
      stageId: (stageMap[section.title] ?? 'apertura') as Playbook['nodes'][number]['stageId'],
      title: node.title,
      script: node.script,
      suggestedQuestion: node.suggestedQuestion,
      branches: node.branches ?? [],
    }))),
  };
}

function mapApiCall(call: ApiCall): CallLog {
  const outcomes: Record<string, CallOutcome> = { no_contesto: 'no_contesto', no_interesado: 'no_interesado', seguimiento: 'seguimiento', interesado: 'interesado', cita_agendada: 'cita_agendada' };
  return { id: call.id, prospectName: call.prospectName, businessName: call.businessName, phone: '', durationSeconds: call.durationSeconds, timestamp: new Date(call.createdAt).toLocaleString(), outcome: outcomes[call.outcome ?? ''] ?? 'seguimiento', playbookTitle: call.playbook.title, notes: call.notes, dealValueEstimate: 0 };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(savedSession?.user ?? null);
  const [accessToken, setAccessToken] = useState(savedSession?.accessToken ?? '');
  const [currentView, setCurrentView] = useState<ViewMode>('call-assistant'); // Start directly on Call Assistant as requested!
  const [playbooks, setPlaybooks] = useState<Playbook[]>(INITIAL_PLAYBOOKS);
  const [activePlaybook, setActivePlaybook] = useState<Playbook>(INITIAL_PLAYBOOKS[0]);
  const [backendCallId, setBackendCallId] = useState('');
  const [kbItems, setKbItems] = useState<KBItem[]>(INITIAL_KB_ITEMS);
  const [recentCalls, setRecentCalls] = useState<CallLog[]>(RECENT_CALL_LOGS);

  // Active call state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>({
    id: 'call-active-1',
    prospect: INITIAL_PROSPECT,
    startTime: new Date(),
    elapsedSeconds: 252, // 00:04:12 initial timer
    currentStageId: 'necesidades',
    isLiveTranscriptActive: true,
    notes: 'Cliente menciona que Banamex falla los fines de semana. Tienen 3 sucursales con 6 terminales en total.',
    detectedPain: 'Fallas de conexión Wi-Fi en horas pico y comisiones del 3.8% en Clip.',
    detectedProvider: 'Banamex TPV + Clip de respaldo',
    detectedVolume: '$48,000 USD / mes',
    nextStep: 'Presentar Clover Flex 3 con SIM 4G gratis y tasa del 1.25%',
    stageProgress: {
      apertura: true,
      descubrimiento: true,
      necesidades: true,
      propuesta: false,
      objeciones: false,
      cierre: false,
    },
  });

  // Modals & Sliders
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isUxModalOpen, setIsUxModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [pendingOutcome, setPendingOutcome] = useState<CallOutcome | null>(null);
  const [selectedPlaybookForEditor, setSelectedPlaybookForEditor] = useState<Playbook | null>(INITIAL_PLAYBOOKS[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLoginSuccess = async (user: UserProfile, token = '') => {
    setCurrentUser(user);
    setAccessToken(token);
    if (token) localStorage.setItem('sales-playbook-session', JSON.stringify({ user, accessToken: token }));
    if (token) try {
      const apiPlaybooks = await getPlaybooks(token);
      const mapped = apiPlaybooks.map(mapApiPlaybook);
      setPlaybooks(mapped);
      if (mapped[0]) setActivePlaybook(mapped[0]);
    } catch (error) {
      console.error('No se pudieron cargar los playbooks', error);
    }
    try { setRecentCalls((await getCalls(token)).map(mapApiCall)); } catch { /* Dashboard conserva el estado local. */ }
  };

  useEffect(() => {
    if (!accessToken) return;
    void getPlaybooks(accessToken).then((items) => {
      const mapped = items.map(mapApiPlaybook);
      setPlaybooks(mapped);
      if (mapped[0]) setActivePlaybook(mapped[0]);
    }).catch(() => {
      localStorage.removeItem('sales-playbook-session');
      setCurrentUser(null);
    });
    void getCalls(accessToken).then((items) => setRecentCalls(items.map(mapApiCall))).catch(() => undefined);
  }, [accessToken]);

  // Handlers
  const handleStartNewCall = async (playbook = activePlaybook) => {
    setActivePlaybook(playbook);
    setActiveCall({
      id: `call-${Date.now()}`,
      prospect: INITIAL_PROSPECT,
      startTime: new Date(),
      elapsedSeconds: 0,
      currentStageId: 'apertura',
      isLiveTranscriptActive: true,
      notes: '',
      detectedPain: 'Comisiones elevadas TPV e inestabilidad de red.',
      detectedProvider: 'Banamex',
      detectedVolume: '$48,000 USD / mes',
      nextStep: 'Agendar demo presencial Clover',
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
        const createdCall = await startCall(accessToken, playbook.id, INITIAL_PROSPECT.contactName, INITIAL_PROSPECT.businessName);
        setBackendCallId(createdCall.id);
      } catch (error) {
        console.error('No se pudo iniciar la llamada en la API', error);
      }
    }
    setCurrentView('call-assistant');
  };

  const handleEndCallTrigger = (outcome: CallOutcome, notes: string) => {
    setPendingOutcome(outcome);
    setIsResultModalOpen(true);
  };

  const handleConfirmCallResult = (finalNotes: string, dateStr?: string) => {
    if (backendCallId && accessToken && pendingOutcome) {
      void finishCall(accessToken, backendCallId, pendingOutcome, finalNotes, activeCall?.elapsedSeconds ?? 0);
    }
    if (activeCall && pendingOutcome) {
      const newLog: CallLog = {
        id: `call-log-${Date.now()}`,
        prospectName: activeCall.prospect.contactName,
        businessName: activeCall.prospect.businessName,
        phone: activeCall.prospect.phone,
        durationSeconds: activeCall.elapsedSeconds,
        timestamp: 'Ahora mismo',
        outcome: pendingOutcome,
        playbookTitle: 'Venta POS Restaurantes & Comensales',
        notes: finalNotes || activeCall.notes || 'Llamada completada.',
        dealValueEstimate: activeCall.prospect.monthlyVolumeUSD,
      };

      setRecentCalls([newLog, ...recentCalls]);

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          todayCallsCount: currentUser.todayCallsCount + 1,
          todayMeetingsBooked:
            pendingOutcome === 'cita_agendada'
              ? currentUser.todayMeetingsBooked + 1
              : currentUser.todayMeetingsBooked,
        });
      }
    }

    setIsResultModalOpen(false);
    setActiveCall(null);
    setBackendCallId('');
    setCurrentView('dashboard');
  };

  const handleSavePlaybook = (updatedPb: Playbook) => {
    const exists = playbooks.some((p) => p.id === updatedPb.id);
    if (exists) {
      setPlaybooks(playbooks.map((p) => (p.id === updatedPb.id ? updatedPb : p)));
    } else {
      setPlaybooks([updatedPb, ...playbooks]);
    }
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
        onOpenUxModal={() => setIsUxModalOpen(true)}
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
          onStartNewCall={handleStartNewCall}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* View Router Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentView === 'dashboard' && (
            <DashboardScreen
              user={currentUser}
              playbooks={playbooks}
              recentCalls={recentCalls}
              onStartNewCall={handleStartNewCall}
              onNavigate={(v) => setCurrentView(v)}
              onSelectPlaybook={(pb) => {
                handleStartNewCall();
              }}
            />
          )}

          {currentView === 'call-assistant' && (
            activeCall ? (
              <CallAssistantScreen
                user={currentUser}
                activeCall={activeCall}
                playbook={activePlaybook}
                backendCallId={backendCallId}
                onSaveNotes={(notes, duration) => { if (backendCallId && accessToken) void updateCall(accessToken, backendCallId, notes, duration); }}
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
                  Listo para iniciar la siguiente llamada B2B
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Haz clic a continuación para simular una llamada entrante/saliente asistida con el copiloto en tiempo real.
                </p>
                <button
                  onClick={handleStartNewCall}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md text-sm transition-all cursor-pointer"
                >
                  📞 Iniciar llamada con Restaurante La Casona
                </button>
              </div>
            )
          )}

          {currentView === 'playbooks' && (
            <PlaybookLibraryScreen
              playbooks={playbooks}
              onSelectPlaybook={(pb) => {
                void handleStartNewCall(pb);
              }}
              onEditPlaybook={(pb) => {
                setSelectedPlaybookForEditor(pb);
                setCurrentView('playbook-editor');
              }}
              onCreateNewPlaybook={() => {
                setSelectedPlaybookForEditor(null);
                setCurrentView('playbook-editor');
              }}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'playbook-editor' && (
            <PlaybookEditorScreen
              playbook={selectedPlaybookForEditor}
              onSavePlaybook={handleSavePlaybook}
              onPreviewPlaybook={(pb) => {
                void handleStartNewCall(pb);
              }}
            />
          )}

          {currentView === 'knowledge-base' && (
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
          setCurrentView('call-assistant');
        }}
      />

      <UxDecisionsModal
        isOpen={isUxModalOpen}
        onClose={() => setIsUxModalOpen(false)}
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
