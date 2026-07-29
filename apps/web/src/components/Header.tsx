import React from "react";
import { PhoneCall, Search, Phone, Menu } from "lucide-react";
import { ViewMode, UserProfile, ActiveCall } from "../types";

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: UserProfile;
  activeCall: ActiveCall | null;
  onOpenCmdK: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  user,
  activeCall,
  onOpenCmdK,
  onToggleMobileSidebar,
}) => {
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-indigo-900">
                  Sales Playbook
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  Copilot
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search + Active Call Widget */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-auto">
          {/* Cmd + K Button */}
          <button
            id="header-cmd-k-btn"
            onClick={onOpenCmdK}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscar objeciones, terminales Clover, scripts...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Active Call Quick Banner */}
          {activeCall && (
            <button
              onClick={() => onNavigate("call-assistant")}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                currentView === "call-assistant"
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 animate-pulse"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {activeCall.prospect.businessName}
              </span>
              <span className="font-mono bg-black/10 px-1.5 py-0.5 rounded-md">
                {formatSeconds(activeCall.elapsedSeconds)}
              </span>
            </button>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Cmd K on mobile */}
          <button
            onClick={onOpenCmdK}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            title="Buscar base de conocimiento"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
