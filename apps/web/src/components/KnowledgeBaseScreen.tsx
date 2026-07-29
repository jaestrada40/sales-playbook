import React, { useState } from "react";
import {
  Search,
  HelpCircle,
  AlertCircle,
  Package,
  Sparkles,
  BookOpen,
  FileText,
  Copy,
  Check,
  Tag,
  TrendingUp,
  Filter,
} from "lucide-react";
import { KBItem, KBType } from "../types";

interface KnowledgeBaseScreenProps {
  kbItems: KBItem[];
  onOpenCmdK: () => void;
  onSelectScriptForCall?: (script: string) => void;
}

export const KnowledgeBaseScreen: React.FC<KnowledgeBaseScreenProps> = ({
  kbItems,
  onOpenCmdK,
  onSelectScriptForCall,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Todo", icon: BookOpen },
    { id: "objecion", label: "Objeciones", icon: AlertCircle },
    { id: "producto", label: "Productos / TPV", icon: Package },
    { id: "script", label: "Scripts de Cierre", icon: Sparkles },
    { id: "faq", label: "Preguntas Frecuentes", icon: HelpCircle },
    { id: "caso_real", label: "Casos Reales", icon: TrendingUp },
  ];

  const filteredItems = kbItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Base de Conocimiento
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Respuestas ultrarrápidas a objeciones, datos técnicos de Clover y
            comparativas de comisiones
          </p>
        </div>

        <button
          onClick={onOpenCmdK}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Abrir Búsqueda Rápida (⌘K)</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por argumento, competidor (Clip, Banamex, BBVA) o modelo TPV (Clover Flex)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
          />
        </div>

        {/* Tab List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {item.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Usado {item.timesUsed} veces
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900">
                {item.title}
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {item.content}
              </p>

              {item.keyTakeaway && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-medium flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Idea Clave:</strong> {item.keyTakeaway}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleCopy(item.id, item.content)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
