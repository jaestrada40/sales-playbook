import React, { useState } from 'react';
import { Search, Plus, BookOpen, Star, Filter, Sparkles, ArrowRight, Play, Edit3, CheckCircle2 } from 'lucide-react';
import { Playbook, ViewMode } from '../types';

interface PlaybookLibraryScreenProps {
  playbooks: Playbook[];
  onSelectPlaybook: (playbook: Playbook) => void;
  onEditPlaybook: (playbook: Playbook) => void;
  onCreateNewPlaybook: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const PlaybookLibraryScreen: React.FC<PlaybookLibraryScreenProps> = ({
  playbooks,
  onSelectPlaybook,
  onEditPlaybook,
  onCreateNewPlaybook,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPlaybooks = playbooks.filter((pb) => {
    const matchesSearch =
      pb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pb.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || pb.language === languageFilter;
    const matchesIndustry = industryFilter === 'all' || pb.industry === industryFilter;
    const matchesStatus = statusFilter === 'all' || pb.status === statusFilter;
    return matchesSearch && matchesLanguage && matchesIndustry && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Biblioteca de Playbooks
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Guiones de llamadas estructurados y optimizados por industria
          </p>
        </div>

        <button
          id="create-playbook-btn"
          onClick={onCreateNewPlaybook}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Crear nuevo playbook</span>
        </button>
      </div>

      {/* Search & Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por título de playbook, industria o palabra clave (ej. Restaurantes, Clip)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">Todas las Industrias</option>
              <option value="Restaurantes & Bares">Restaurantes & Bares</option>
              <option value="Retail">Retail</option>
              <option value="Servicios Médicos">Servicios Médicos</option>
              <option value="E-Commerce">E-Commerce</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">Todos los Estados</option>
              <option value="publicado">Publicados</option>
              <option value="borrador">Borradores</option>
            </select>

            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">Todos los Idiomas</option>
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Playbooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaybooks.map((pb) => (
          <div
            key={pb.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold border ${
                  pb.status === 'publicado'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {pb.version}
                </span>

                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {pb.conversionRate}% conversión
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-900">
                {pb.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {pb.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Autor: {pb.author}</span>
                <span>Usado {pb.usageCount} veces</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSelectPlaybook(pb);
                    onNavigate('call-assistant');
                  }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Cargar en copilot</span>
                </button>

                <button
                  onClick={() => onEditPlaybook(pb)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar flujo</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
