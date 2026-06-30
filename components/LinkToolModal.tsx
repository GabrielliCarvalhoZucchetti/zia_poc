import React, { useState } from 'react';
import { Tool, ToolType, Resource } from '../types';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LinkToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTools: Tool[];
  linkedToolIds: string[];
  onLink: (toolId: string) => void;
  onUnlink: (toolId: string) => void;
  allSkills?: Resource[];
}

export const LinkToolModal: React.FC<LinkToolModalProps> = ({
  isOpen,
  onClose,
  allTools,
  linkedToolIds,
  onLink,
  onUnlink,
  allSkills = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const items = [
    ...allTools.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      itemType: 'tool' as const,
      toolType: t.type,
      status: t.status,
      parameters: t.parameters,
    })),
    ...allSkills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      itemType: 'skill' as const,
      toolType: null,
      status: 'active' as const,
      parameters: [],
    }))
  ];

  const filteredItems = items.filter(item => {
    const term = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.itemType.toLowerCase().includes(term) ||
      (item.toolType && item.toolType.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm border border-sky-100/50">
              <Icons.Link className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Vincular Tool ou Skill Existente</h2>
              <p className="text-xs text-slate-400 mt-0.5">Associe uma ferramenta ou habilidade global já cadastrada à lógica operacional deste recurso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            type="button"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar ferramentas ou skills por nome, tipo ou descrição..."
              className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-205 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-sm font-semibold text-slate-800 transition-all bg-white shadow-sm"
            />
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-3xl mb-3 block">🔍</span>
              <p className="text-sm font-bold text-slate-700">Nenhum item encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Refine o termo de busca ou certifique-se de que a tool ou skill existe.</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const isLinked = linkedToolIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-6 ${isLinked ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-150 hover:border-slate-250 shadow-sm'}`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-slate-800 truncate">{item.name}</span>
                       {item.itemType === 'tool' ? (
                         <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${item.toolType === ToolType.HTTP ? 'bg-green-150 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                           {item.toolType === ToolType.HTTP ? 'HTTP Request' : 'Servidor MCP'}
                         </span>
                       ) : (
                         <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-700">
                           Skill / Habilidade
                         </span>
                       )}
                       <span className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} title={item.status === 'active' ? 'Ativo' : 'Inativo'} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                    {item.parameters.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400 font-bold">Parâmetros:</span>
                        {item.parameters.map((p, pIdx) => (
                          <span key={pIdx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            {p.name}
                            {p.required && <span className="text-rose-500">*</span>}
                            <span className="text-slate-400">:{p.type}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isLinked ? (
                      <button
                        type="button"
                        onClick={() => onUnlink(item.id)}
                        className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-rose-100"
                      >
                        <Icons.X className="w-3.5 h-3.5" />
                        Desvincular
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onLink(item.id)}
                        className="px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold rounded-xl shadow-lg shadow-sky-100 transition-all flex items-center gap-1.5"
                      >
                        <Icons.Plus className="w-3.5 h-3.5" />
                        Vincular
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all font-sans"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
