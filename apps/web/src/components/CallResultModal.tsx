import React, { useState } from 'react';
import { CheckCircle2, Calendar, Clock, DollarSign, FileText, X } from 'lucide-react';
import { CallOutcome, Prospect } from '../types';

interface CallResultModalProps {
  isOpen: boolean;
  outcome: CallOutcome | null;
  prospect: Prospect;
  initialNotes: string;
  onConfirm: (notes: string, dateStr?: string) => void;
  onCancel: () => void;
}

export const CallResultModal: React.FC<CallResultModalProps> = ({
  isOpen,
  outcome,
  prospect,
  initialNotes,
  onConfirm,
  onCancel,
}) => {
  const [notes, setNotes] = useState(initialNotes || 'Llamada completada con éxito.');
  const [meetingDate, setMeetingDate] = useState('2026-07-30T11:00');

  if (!isOpen || !outcome) return null;

  const getTitle = () => {
    switch (outcome) {
      case 'cita_agendada':
        return '🎯 Agendar Cita Demo Presencial';
      case 'interesado':
        return '💡 Marcar Prospecto como Interesado';
      case 'seguimiento':
        return '⏳ Programar Llamada de Seguimiento';
      case 'no_interesado':
        return '🚫 Registrar como No Interesado';
      default:
        return '❌ Registrar No Contestó';
    }
  };

  return (
    <div id="call-result-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        id="call-result-dialog"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-sm font-extrabold">{getTitle()}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Prospecto</span>
            <p className="font-extrabold text-slate-900 text-sm">{prospect.businessName}</p>
            <p className="text-slate-500">{prospect.contactName} ({prospect.phone})</p>
          </div>

          {(outcome === 'cita_agendada' || outcome === 'seguimiento') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Fecha y Hora Programada
              </label>
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Notas finales del cierre
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(notes, meetingDate)}
              className="px-4 py-2 text-xs font-extrabold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Guardar y Finalizar Llamada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
