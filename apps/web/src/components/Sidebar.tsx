import React from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  BookOpen, 
  GitBranch, 
  HelpCircle, 
  PlusCircle, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle2, 
  PhoneIncoming,
  X
} from 'lucide-react';
import { ViewMode, UserProfile, ActiveCall } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: UserProfile;
  activeCall: ActiveCall | null;
  onStartNewCall: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  activeCall,
  onStartNewCall,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewMode,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'call-assistant' as ViewMode,
      label: 'Asistente de Llamada',
      icon: PhoneCall,
      badge: activeCall ? 'EN VIVO' : 'Copiloto',
      badgeColor: activeCall ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'playbooks' as ViewMode,
      label: 'Biblioteca Playbooks',
      icon: BookOpen,
      badge: 'v2.4',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'playbook-editor' as ViewMode,
      label: 'Editor de Flujos',
      icon: GitBranch,
      badge: null,
    },
    {
      id: 'knowledge-base' as ViewMode,
      label: 'Base de Conocimiento',
      icon: HelpCircle,
      badge: 'Cmd+K',
      badgeColor: 'bg-slate-100 text-slate-500 font-mono',
    },
  ];

  const sidebarContent = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-xl select-none">
      {/* Top CTA */}
      <div className="p-4 border-b border-slate-800">
        <button
          id="sidebar-new-call-btn"
          onClick={() => {
            onStartNewCall();
            if (isMobileOpen) onCloseMobile();
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer text-sm"
        >
          <PhoneIncoming className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Iniciar nueva llamada</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navegación Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                onNavigate(item.id);
                if (isMobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                isActive
                  ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-700/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Seller Metrics Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs space-y-3">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">Rendimiento Hoy</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="block text-lg font-extrabold text-white">{user.todayCallsCount}</span>
            <span className="text-[10px] text-slate-400">Llamadas</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="block text-lg font-extrabold text-emerald-400">{user.todayMeetingsBooked}</span>
            <span className="text-[10px] text-slate-400">Citas Agendadas</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Tasa de Conversión</span>
            <span className="font-bold text-emerald-400">{user.conversionRatePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user.conversionRatePercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-[calc(100vh-3.75rem)] sticky top-15 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
          <div className="relative w-72 max-w-[80vw] h-full">
            <button
              onClick={onCloseMobile}
              className="absolute top-3 right-3 z-10 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
