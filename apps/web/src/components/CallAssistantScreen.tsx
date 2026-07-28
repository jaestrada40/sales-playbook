import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  AlertTriangle, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Zap, 
  User, 
  Play, 
  Pause,
  Award,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  Prospect, 
  ActiveCall, 
  CallStageId, 
  CallOutcome, 
  UserProfile,
  Playbook,
} from '../types';
import { PLAYBOOK_STAGES, SAMPLE_PROSPECTS } from '../data/mockData';

interface CallAssistantScreenProps {
  user: UserProfile;
  activeCall: ActiveCall;
  onUpdateCall: (updated: ActiveCall) => void;
  onEndCallWithOutcome: (outcome: CallOutcome, notes: string) => void;
  onOpenCmdK: () => void;
  playbook?: Playbook;
}

export const CallAssistantScreen: React.FC<CallAssistantScreenProps> = ({
  user,
  activeCall,
  onUpdateCall,
  onEndCallWithOutcome,
  onOpenCmdK,
  playbook,
}) => {
  const [currentStageId, setCurrentStageId] = useState<CallStageId>(activeCall.currentStageId);
  const [showAlternative, setShowAlternative] = useState(false);
  const [selectedObjectionId, setSelectedObjectionId] = useState<string | null>(null);
  const [copiedQuestion, setCopiedQuestion] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<'positive' | 'negative' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([
    'Vendedor: "Hola Alejandro, habla Carlos de Sales Playbook. ¿Tienes 2 min?"',
    'Cliente: "Hola Carlos, voy entrando a junta en 10 min, pero dime rápido."',
    'Vendedor: "Perfecto. Sé que procesas alto volumen en La Casona. ¿Sigues pagando 3.8% en Clip o Banamex?"',
    'Cliente: "Sí, con Banamex las terminales fallan los sábados. ¿Qué opción tienen ustedes?"'
  ]);

  const runtimeStages = playbook?.nodes?.length
    ? Array.from(new Set(playbook.nodes.map((node) => node.stageId))).map((stageId) => {
        const nodes = playbook.nodes.filter((node) => node.stageId === stageId);
        const first = nodes[0];
        return {
          id: stageId,
          name: stageId,
          script: first.script,
          suggestedQuestion: first.suggestedQuestion,
          alternativeScript: nodes[1]?.script,
          quickObjections: nodes.filter((node) => node.id !== first.id && node.stageId === 'objeciones').map((node) => ({ id: node.id, trigger: node.title, responseScript: node.script, suggestedQuestion: node.suggestedQuestion })),
        };
      })
    : PLAYBOOK_STAGES;

  // Stage lookup: real playbook nodes when one is selected, mock stages only as fallback.
  const currentStage = runtimeStages.find((s) => s.id === currentStageId) || runtimeStages[0];
  const stageIndex = runtimeStages.findIndex((s) => s.id === currentStageId);

  // Timer interval for call duration
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      onUpdateCall({
        ...activeCall,
        elapsedSeconds: activeCall.elapsedSeconds + 1,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall, isPaused, onUpdateCall]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStage = () => {
    if (stageIndex < runtimeStages.length - 1) {
      const nextId = runtimeStages[stageIndex + 1].id;
      setCurrentStageId(nextId);
      setShowAlternative(false);
      setSelectedObjectionId(null);
      setFeedbackRating(null);
      onUpdateCall({
        ...activeCall,
        currentStageId: nextId,
        stageProgress: {
          ...activeCall.stageProgress,
          [currentStageId]: true,
        },
      });
    }
  };

  const handlePrevStage = () => {
    if (stageIndex > 0) {
      const prevId = PLAYBOOK_STAGES[stageIndex - 1].id;
      setCurrentStageId(prevId);
      setShowAlternative(false);
      setSelectedObjectionId(null);
      setFeedbackRating(null);
    }
  };

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 1500);
  };

  // Get current active script text
  const currentObjection = currentStage.quickObjections.find((o) => o.id === selectedObjectionId);
  const displayScript = currentObjection
    ? currentObjection.responseScript
    : showAlternative && currentStage.alternativeScript
    ? currentStage.alternativeScript
    : currentStage.script;

  const displayQuestion = currentObjection
    ? currentObjection.suggestedQuestion
    : currentStage.suggestedQuestion;

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* 1. TOP BAR: Call Status & Seller Info */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Seller & Prospect Live Banner */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{user.name}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En Llamada
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Con: <strong className="text-white">{activeCall.prospect.contactName}</strong> ({activeCall.prospect.businessName})
            </p>
          </div>
        </div>

        {/* Center: Live Timer & IA Transcription Indicator */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Clock className="w-4 h-4" />
            <span className="text-base font-extrabold">{formatTimer(activeCall.elapsedSeconds)}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-slate-300 font-sans font-medium text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Transcripción IA en Vivo</span>
          </div>
        </div>

        {/* Right: Audio Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Micrófono Silenciado' : 'Silenciar Micrófono'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isPaused
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title={isPaused ? 'Reanudar Llamada' : 'Pausar Cronómetro'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenCmdK}
            className="px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Consultar Objeción (⌘K)</span>
          </button>
        </div>
      </div>

      {/* 2. PROSPECT INFO STRIP */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Negocio / Prospecto</span>
          <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{activeCall.prospect.businessName}</span>
          </div>
          <span className="text-slate-500 text-[11px] block">{activeCall.prospect.phone}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Tipo de Negocio</span>
          <p className="font-semibold text-slate-800">{activeCall.prospect.businessType}</p>
          <span className="text-slate-500 text-[11px] block">Proveedor actual: <strong className="text-slate-700">{activeCall.prospect.currentProvider}</strong></span>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">Volumen Mensual Tarjeta</span>
          <p className="font-extrabold text-emerald-600 text-sm">
            ${activeCall.prospect.monthlyVolumeUSD.toLocaleString()} USD / mes
          </p>
          <span className="text-slate-500 text-[11px] block">{activeCall.prospect.terminalCount} terminales activas</span>
        </div>

        <div className="space-y-0.5 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
          <span className="text-indigo-900 font-bold text-[10px] uppercase tracking-wider block flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-600" />
            Objetivo de la Llamada
          </span>
          <p className="text-[11px] text-indigo-950 font-medium leading-tight">
            {activeCall.prospect.objective}
          </p>
        </div>
      </div>

      {/* 3. THREE PANEL MAIN COPILOT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PANEL IZQUIERDO (Col-span-3): Flujo de Etapas */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Flujo de Llamada
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              Paso {stageIndex + 1} de {runtimeStages.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {runtimeStages.map((stage, idx) => {
              const isActive = stage.id === currentStageId;
              const isCompleted = activeCall.stageProgress[stage.id] || idx < stageIndex;

              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setCurrentStageId(stage.id);
                    setShowAlternative(false);
                    setSelectedObjectionId(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{stage.name}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Rapid Transcripts Feed preview */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Audición en Directo (Whisper)
            </span>
            <div className="p-2.5 bg-slate-950 text-slate-300 rounded-xl text-[11px] font-mono space-y-1.5 max-h-36 overflow-y-auto border border-slate-800">
              {liveTranscript.map((t, i) => (
                <p key={i} className={t.startsWith('Cliente') ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                  {t}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL GRANDE (Col-span-6): "Qué Decir Ahora" + Guion + Pregunta + Acciones */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Copilot Box */}
          <div className="bg-white rounded-2xl border-2 border-indigo-600 shadow-lg p-5 space-y-5 relative overflow-hidden">
            {/* Header of Copilot */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-indigo-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Qué decir ahora
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currentStage.name}
                </span>
              </div>

              {selectedObjectionId && (
                <button
                  onClick={() => setSelectedObjectionId(null)}
                  className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold px-2 py-1 rounded-md border border-amber-200 transition-colors cursor-pointer"
                >
                  Regresar al guion base
                </button>
              )}
            </div>

            {/* Script Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Guion Recomendado
                </span>
                {currentStage.alternativeScript && (
                  <button
                    onClick={() => setShowAlternative(!showAlternative)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{showAlternative ? 'Ver versión principal' : 'Ver alternativa 🔀'}</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-sm sm:text-base font-medium text-slate-900 leading-relaxed font-sans shadow-2xs">
                {displayScript}
              </div>
            </div>

            {/* Suggested Question */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Pregunta Sugerida
                </span>
                <button
                  onClick={() => handleCopyQuestion(displayQuestion)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedQuestion ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 italic">
                {displayQuestion}
              </p>
            </div>

            {/* Quick Objection Trigger Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                ¿El cliente respondió una objeción? Haz clic para ajustar guion:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStage.quickObjections.map((ob) => {
                  const isSelected = selectedObjectionId === ob.id;
                  return (
                    <button
                      key={ob.id}
                      onClick={() => setSelectedObjectionId(isSelected ? null : ob.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      {ob.trigger}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Stage Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevStage}
                  disabled={stageIndex === 0}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {/* Rating feedback */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => setFeedbackRating('positive')}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      feedbackRating === 'positive'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'text-slate-400 hover:text-slate-600 border-transparent'
                    }`}
                    title="Guion Efectivo"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFeedbackRating('negative')}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      feedbackRating === 'negative'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'text-slate-400 hover:text-slate-600 border-transparent'
                    }`}
                    title="Necesita Ajuste"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                id="copilot-next-step-btn"
                onClick={handleNextStage}
                disabled={stageIndex === runtimeStages.length - 1}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Siguiente paso</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO (Col-span-3): Notas & Captura de Datos */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Datos de la Llamada
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              Autoguardado
            </span>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Notas de la Llamada
            </label>
            <textarea
              id="call-notes-textarea"
              rows={4}
              value={activeCall.notes}
              onChange={(e) => onUpdateCall({ ...activeCall, notes: e.target.value })}
              placeholder="Escribe comentarios relevantes (ej: Le interesa Clover Flex, tiene 3 sucursales, hablar con su contador)..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 text-slate-800 font-medium placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Detected Pain */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Dolor Principal Detectado</label>
            <input
              type="text"
              value={activeCall.detectedPain}
              onChange={(e) => onUpdateCall({ ...activeCall, detectedPain: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
            />
          </div>

          {/* Provider & Volume */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600">Proveedor Actual</label>
              <input
                type="text"
                value={activeCall.detectedProvider}
                onChange={(e) => onUpdateCall({ ...activeCall, detectedProvider: e.target.value })}
                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600">Volumen Mensual</label>
              <input
                type="text"
                value={activeCall.detectedVolume}
                onChange={(e) => onUpdateCall({ ...activeCall, detectedVolume: e.target.value })}
                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Agreed Next Step */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Próximo Paso Acordado</label>
            <input
              type="text"
              value={activeCall.nextStep}
              onChange={(e) => onUpdateCall({ ...activeCall, nextStep: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 4. LOWER ACTION BAR: 1-Click Call Results */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Registrar Resultado Final de la Llamada (1 Clic)</span>
          <span className="text-[10px] text-slate-400 font-normal">Finaliza la llamada e integra el registro al Dashboard</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            id="outcome-no-contesto-btn"
            onClick={() => onEndCallWithOutcome('no_contesto', activeCall.notes)}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer hover:scale-[1.02] text-center"
          >
            ❌ No contestó
          </button>

          <button
            id="outcome-no-interesado-btn"
            onClick={() => onEndCallWithOutcome('no_interesado', activeCall.notes)}
            className="p-3 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-bold border border-rose-800 transition-all cursor-pointer hover:scale-[1.02] text-center"
          >
            🚫 No interesado
          </button>

          <button
            id="outcome-seguimiento-btn"
            onClick={() => onEndCallWithOutcome('seguimiento', activeCall.notes)}
            className="p-3 bg-amber-950/80 hover:bg-amber-900 text-amber-200 rounded-xl text-xs font-bold border border-amber-800 transition-all cursor-pointer hover:scale-[1.02] text-center"
          >
            ⏳ Seguimiento
          </button>

          <button
            id="outcome-interesado-btn"
            onClick={() => onEndCallWithOutcome('interesado', activeCall.notes)}
            className="p-3 bg-indigo-900 hover:bg-indigo-800 text-indigo-100 rounded-xl text-xs font-bold border border-indigo-700 transition-all cursor-pointer hover:scale-[1.02] text-center"
          >
            💡 Interesado
          </button>

          <button
            id="outcome-cita-agendada-btn"
            onClick={() => onEndCallWithOutcome('cita_agendada', activeCall.notes)}
            className="p-3 col-span-2 sm:col-span-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] text-center flex items-center justify-center gap-1"
          >
            🎯 Cita agendada
          </button>
        </div>
      </div>
    </div>
  );
};
