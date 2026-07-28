import React from 'react';
import { X, Sparkles, CheckCircle2, Shield, Zap, Layers, Cpu, Code2 } from 'lucide-react';

interface UxDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UxDecisionsModal: React.FC<UxDecisionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="ux-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        id="ux-modal-dialog"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Decisiones de Diseño UX/UI & Arquitectura Angular 20</h2>
              <p className="text-xs text-slate-300">Fundamentos de diseño para la aplicación Sales Playbook</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-700">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              1. Asistente en Tiempo Real como "Copiloto", no un CRM Estático
            </h3>
            <p>
              Durante una llamada telefónica B2B de ventas (especialmente en POS y adquirencia), el vendedor dispone de menos de 3 segundos para responder cuando el cliente plantea una objeción sobre tasas (ej: <i>"Clip me cobra 3.6% y no me pide renta"</i>). Por eso:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>El <strong>panel central</strong> prioriza siempre "Qué decir ahora" con tipografía amplia e inequívoca.</li>
              <li>La <strong>Pregunta Sugerida</strong> cuenta con botón de copiado de 1 solo clic.</li>
              <li>Los <strong>Chips de Objeción Rápida</strong> permiten alternar dinámicamente el guion en caliente sin perder el ritmo de la conversación.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              2. Reducción de Fricción Visual e Información Jerarquizada
            </h3>
            <p>
              Inspirado en interfaces de alto rendimiento como Linear y Notion, utilizamos una paleta de tonos neutros claros (slate-50, blanco puro) con acentos en azul marino oscuro (slate-900) y verde esmeralda para estados positivos o cierres exitosos.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Registros de llamada en la barra inferior accionables en <strong>1 solo clic</strong> (No contestó, Cita agendada, etc.).</li>
              <li>Base de conocimiento accesible globalmente mediante <strong>Command + K (⌘K)</strong> desde cualquier pantalla.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-600" />
              3. Preparado para Migración Directa a Angular 20
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-800 space-y-1">
              <p className="font-bold text-slate-900">// Mapeo a componentes Angular 20 Standalone:</p>
              <p>• CallAssistantComponent -&gt; @Component(&#123; standalone: true, imports: [MatButtonModule, ... ] &#125;)</p>
              <p>• Signals de Angular 20 -&gt; activeCallSignal = signal&lt;ActiveCall&gt;(...)</p>
              <p>• Control Flow de Angular 20 -&gt; &#64;if (activeCall(); as call) &#123; ... &#125; &#64;else &#123; ... &#125;</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Entendido y cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
