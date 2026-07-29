import React, { useState } from "react";
import {
  GitBranch,
  GripVertical,
  Plus,
  Save,
  Eye,
  Send,
  Trash2,
  Sparkles,
  ArrowDown,
  ArrowUp,
  HelpCircle,
  CheckCircle2,
  Layers,
  FileText,
  Copy,
} from "lucide-react";
import { Playbook, PlaybookNode, CallStageId } from "../types";

interface PlaybookEditorScreenProps {
  playbook: Playbook | null;
  onSavePlaybook: (updated: Playbook) => Promise<void>;
  onPreviewPlaybook: (playbook: Playbook) => void;
}

export const PlaybookEditorScreen: React.FC<PlaybookEditorScreenProps> = ({
  playbook,
  onSavePlaybook,
  onPreviewPlaybook,
}) => {
  const [title, setTitle] = useState(
    playbook?.title || "Nuevo Playbook de Ventas POS",
  );
  const [version, setVersion] = useState(playbook?.version || "v1.0 Borrador");
  const [description, setDescription] = useState(
    playbook?.description ||
      "Guion estructurado para llamadas de sustitución de terminales.",
  );
  const [nodes, setNodes] = useState<PlaybookNode[]>(
    playbook?.nodes && playbook.nodes.length > 0
      ? playbook.nodes
      : [
          {
            id: "node-1",
            stageId: "apertura",
            title: "Nodo 1: Apertura & Pitch de 15 segundos",
            script:
              "“Hola [Nombre], te hablo de Sales Playbook. ¿Sigues pagando 3.8% en comisiones con Clip o Banamex en tus terminales?”",
            suggestedQuestion:
              "“¿Tienes 2 minutos para confirmar si calificas para nuestro plan de tarifa plana 1.25%?”",
          },
          {
            id: "node-2",
            stageId: "descubrimiento",
            title: "Nodo 2: Diagnóstico de Terminales y Red",
            script:
              "“Cuéntame: ¿con qué frecuencia sufren caídas de señal Wi-Fi durante el cobro en horas de alta afluencia?”",
            suggestedQuestion:
              "“¿Qué porcentaje de sus cobros se realizan con tarjeta de débito vs crédito?”",
          },
          {
            id: "node-3",
            stageId: "propuesta",
            title: "Nodo 3: Presentación Clover Flex 3 Touch",
            script:
              "“Te equipamos con la Clover Flex 3 sin costo de renta mensual y con SIM 4G ilimitada gratis.”",
            suggestedQuestion:
              "“¿Prefieres que hagamos un análisis comparativo de tu último estado de cuenta este jueves?”",
          },
        ],
  );

  const [activeNodeId, setActiveNodeId] = useState<string>(
    nodes[0]?.id || "node-1",
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const handleUpdateNode = (updatedNode: PlaybookNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  const handleAddNode = () => {
    const newNode: PlaybookNode = {
      id: `node-${Date.now()}`,
      stageId: "necesidades",
      title: `Nuevo Nodo ${nodes.length + 1}`,
      script:
        "“Ingresa el guion recomendado para este paso de la conversación...”",
      suggestedQuestion: "“¿Ingresa la pregunta clave para el prospecto?”",
    };
    setNodes([...nodes, newNode]);
    setActiveNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) return;
    const filtered = nodes.filter((n) => n.id !== id);
    setNodes(filtered);
    setActiveNodeId(filtered[0].id);
  };

  const handleMoveNode = (id: string, direction: -1 | 1) => {
    const currentIndex = nodes.findIndex((node) => node.id === id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= nodes.length)
      return;
    const reordered = [...nodes];
    const targetStage = reordered[targetIndex].stageId;
    const movedNode = { ...reordered[currentIndex], stageId: targetStage };
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = movedNode;
    setNodes(reordered);
  };

  const handleDropNode = (targetId: string, placeAfter: boolean) => {
    if (!draggedNodeId || draggedNodeId === targetId) return;
    const dragged = nodes.find((node) => node.id === draggedNodeId);
    const target = nodes.find((node) => node.id === targetId);
    if (!dragged || !target) return;
    const remaining = nodes.filter((node) => node.id !== draggedNodeId);
    const targetIndex = remaining.findIndex((node) => node.id === targetId);
    const insertAt = targetIndex + (placeAfter ? 1 : 0);
    remaining.splice(insertAt, 0, { ...dragged, stageId: target.stageId });
    setNodes(remaining);
    setDraggedNodeId(null);
  };

  const buildPlaybook = (published = false): Playbook => {
    const nextVersion = published ? "v2.5 Publicado" : version;
    return {
      id: playbook?.id || `pb-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      version: nextVersion,
      status: published ? "publicado" : "borrador",
      language: "Español",
      industry: "Restaurantes & Bares",
      conversionRate: playbook?.conversionRate ?? 0,
      usageCount: playbook?.usageCount ?? 0,
      updatedAt: new Date().toISOString(),
      author: playbook?.author ?? "Usuario actual",
      nodes,
    };
  };

  const persist = async (updated: Playbook) => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await onSavePlaybook(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el playbook",
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    await persist(buildPlaybook(false));
  };

  const handlePublish = async () => {
    const publishedVersion = "v2.5 Publicado";
    setVersion(publishedVersion);
    await persist(buildPlaybook(true));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              {version}
            </span>
            <span className="text-xs text-slate-400">
              Árbol de decisiones del guion
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-extrabold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden w-full max-w-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardado
            </span>
          )}
          {saveError && (
            <span className="text-xs font-semibold text-rose-600">
              {saveError}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar borrador</span>
          </button>

          <button
            onClick={() => {
              void handleSave()
                .then(() =>
                  onPreviewPlaybook({
                    id: playbook?.id || `pb-${Date.now()}`,
                    title,
                    description,
                    version,
                    status: "publicado",
                    language: "Español",
                    industry: "Restaurantes & Bares",
                    conversionRate: 38.5,
                    usageCount: 1,
                    updatedAt: "Ahora",
                    author: "Carlos Ruiz",
                    nodes,
                  }),
                )
                .catch(() => undefined);
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Previsualizar</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving || !title.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Publicar versión</span>
          </button>
        </div>
      </div>

      {/* Main Flow Canvas & Node Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Visual Tree Node List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              Estructura de Nodos ({nodes.length})
            </h3>

            <button
              onClick={handleAddNode}
              className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Agregar nuevo nodo"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agregar Nodo</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 rounded-lg bg-indigo-50 border border-indigo-100 p-2">
            Este es el orden que verá el vendedor durante la llamada. Arrastra
            un bloque para colocarlo antes o después de otro, o usa las flechas
            ↑ y ↓; luego guarda o publica los cambios.
          </p>

          <div className="space-y-3">
            {nodes.map((node, i) => {
              const isSelected = node.id === activeNodeId;
              return (
                <div
                  key={node.id}
                  className={`relative ${draggedNodeId === node.id ? "opacity-40" : ""}`}
                  draggable
                  onDragStart={(event) => {
                    setDraggedNodeId(node.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", node.id);
                  }}
                  onDragEnd={() => setDraggedNodeId(null)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const bounds = event.currentTarget.getBoundingClientRect();
                    handleDropNode(
                      node.id,
                      event.clientY > bounds.top + bounds.height / 2,
                    );
                  }}
                >
                  <div
                    onClick={() => setActiveNodeId(node.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <GripVertical
                          className="w-4 h-4 opacity-60 cursor-grab active:cursor-grabbing"
                          aria-label="Arrastrar nodo"
                        />
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          Etapa: {node.stageId}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveNode(node.id, -1);
                          }}
                          disabled={i === 0}
                          className="p-1 rounded-md transition-colors disabled:opacity-25 hover:bg-white/10"
                          title="Mover antes"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveNode(node.id, 1);
                          }}
                          disabled={i === nodes.length - 1}
                          className="p-1 rounded-md transition-colors disabled:opacity-25 hover:bg-white/10"
                          title="Mover después"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {nodes.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isSelected
                                ? "text-rose-300 hover:text-white"
                                : "text-slate-400 hover:text-rose-600"
                            }`}
                            title="Eliminar nodo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="font-bold text-sm mb-1">{node.title}</p>
                    <p className="text-[11px] opacity-80 line-clamp-2 italic font-sans">
                      "{node.script}"
                    </p>
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="flex justify-center my-1 text-slate-300">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Active Node Properties Editor */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Propiedades del Nodo Seleccionado
              </h3>
              <p className="text-xs text-slate-500">
                Configura los guiones y preguntas del copiloto
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ID: {activeNode.id}
            </span>
          </div>

          <div className="space-y-4">
            {/* Title & Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título del Nodo
                </label>
                <input
                  type="text"
                  value={activeNode.title}
                  onChange={(e) =>
                    handleUpdateNode({ ...activeNode, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Etapa de la Llamada
                </label>
                <select
                  value={activeNode.stageId}
                  onChange={(e) =>
                    handleUpdateNode({
                      ...activeNode,
                      stageId: e.target.value as CallStageId,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-bold text-slate-800 bg-white"
                >
                  <option value="apertura">1. Apertura</option>
                  <option value="descubrimiento">2. Descubrimiento</option>
                  <option value="necesidades">3. Necesidades</option>
                  <option value="propuesta">4. Propuesta</option>
                  <option value="objeciones">5. Objeciones</option>
                  <option value="cierre">6. Cierre</option>
                </select>
              </div>
            </div>

            {/* Main Script */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guion Principal Recomendado
              </label>
              <textarea
                rows={4}
                value={activeNode.script}
                onChange={(e) =>
                  handleUpdateNode({ ...activeNode, script: e.target.value })
                }
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800 leading-relaxed"
              />
            </div>

            {/* Suggested Question */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pregunta Clave Sugerida
              </label>
              <input
                type="text"
                value={activeNode.suggestedQuestion}
                onChange={(e) =>
                  handleUpdateNode({
                    ...activeNode,
                    suggestedQuestion: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-bold text-slate-800"
              />
            </div>

            {/* Alternative Script */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guion Alternativo (Opcional)
              </label>
              <input
                type="text"
                value={activeNode.alternativeScript || ""}
                onChange={(e) =>
                  handleUpdateNode({
                    ...activeNode,
                    alternativeScript: e.target.value,
                  })
                }
                placeholder="Ingresa una variante más directa o técnica si el cliente lo requiere..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
