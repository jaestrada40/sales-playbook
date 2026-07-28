import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, AlertCircle, HelpCircle, Package, FileText, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';
import { KBItem, KBType } from '../types';

interface CommandKModalProps {
  isOpen: boolean;
  onClose: () => void;
  kbItems: KBItem[];
  onSelectScript?: (scriptText: string) => void;
}

export const CommandKModal: React.FC<CommandKModalProps> = ({
  isOpen,
  onClose,
  kbItems,
  onSelectScript,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearchTerm('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = kbItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getTypeBadge = (type: KBType) => {
    switch (type) {
      case 'objecion':
        return { label: 'Objeción', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle };
      case 'producto':
        return { label: 'Producto', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package };
      case 'faq':
        return { label: 'FAQ', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle };
      case 'script':
        return { label: 'Script', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Sparkles };
      case 'caso_real':
        return { label: 'Caso Real', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: BookOpen };
      default:
        return { label: 'Nota', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="command-k-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-fade-in">
      <div 
        id="command-k-dialog"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="cmd-k-input"
            type="text"
            placeholder="Buscar en la base de conocimiento (Objeciones, Clip vs 1.25%, Clover Flex, Scripts)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-800 text-sm focus:outline-hidden placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC
          </kbd>
          <button
            id="cmd-k-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 p-3 px-4 border-b border-slate-100 bg-white overflow-x-auto text-xs font-medium">
          <span className="text-slate-400 shrink-0">Filtrar:</span>
          {[
            { id: 'all', label: 'Todo' },
            { id: 'objecion', label: 'Objeciones' },
            { id: 'producto', label: 'Productos / TPV' },
            { id: 'script', label: 'Scripts de Cierre' },
            { id: 'faq', label: 'Preguntas Frecuentes' },
            { id: 'caso_real', label: 'Casos Reales' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-medium">No se encontraron resultados para "{searchTerm}"</p>
              <p className="text-xs text-slate-400 mt-1">Prueba buscar "Clip", "Clover", "Tasa" o "Garantía"</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const badge = getTypeBadge(item.type);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{item.category}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="p-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copiar texto al portapapeles"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                      {onSelectScript && (
                        <button
                          onClick={() => {
                            onSelectScript(item.content);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-md transition-colors cursor-pointer"
                        >
                          Usar en llamada
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-3">
                    {item.content}
                  </p>

                  {item.keyTakeaway && (
                    <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 font-medium flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{item.keyTakeaway}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between px-4">
          <span>{filteredItems.length} respuestas disponibles</span>
          <span className="text-slate-400">Presiona ESC para cerrar</span>
        </div>
      </div>
    </div>
  );
};
