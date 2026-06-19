
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Resource, ResourceType, AgentType, UserRole, ResourceEnvironment, User, Project } from '../types';
import { Icons } from '../constants';

interface ResourceManagementPageProps {
  user: User;
  resources: Resource[];
  projects: Project[];
  onCreateResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'environment' | 'creatorId' | 'version' | 'updatedAt' | 'history'>) => void;
  onUpdateResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  onCreateRequest: (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação' | 'Promoção', reason?: string) => void;
  onRollback?: (resourceId: string, version: number) => void;
}

const getClassificationInfo = (type: ResourceType) => {
  switch (type) {
    case ResourceType.AGENT:
      return {
        label: 'Agente',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
        icon: '🤖',
        concept: 'Agente de IA',
        desc: 'Unidade autônoma de IA configurada para executar ações, analisar situações complexas e tomar decisões com base em seus objetivos delineados.'
      };
    case ResourceType.ASSISTANT:
      return {
        label: 'Assistente',
        color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100',
        icon: '💬',
        concept: 'Assistente de IA',
        desc: 'Interface conversacional direta em tempo real focada em responder a dúvidas, dar suporte ao cliente e extrair informações dinâmicas.'
      };
    case ResourceType.AUTOMATION:
      return {
        label: 'Automação',
        color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
        icon: '⚡',
        concept: 'Fluxo Automatizado',
        desc: 'Regras lógicas e webhooks ativados por gatilhos de eventos terceiros, gerando ações em lote de forma 100% autônoma.'
      };
    case ResourceType.SKILL:
      return {
        label: 'Skill',
        color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-100',
        icon: '✨',
        concept: 'Skill Inteligente',
        desc: 'Extensão de código carregada sob demanda para ensinar seu assistente ou agente a executar tarefas técnicas sob medida e chamadas externas.'
      };
    case ResourceType.DOCUMENTATION:
      return {
        label: 'Documentação',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
        icon: '📄',
        concept: 'Base de Conhecimento',
        desc: 'Documentos, PDFs ou diretrizes puras de regras enviadas à inteligência de RAG para embasar respostas confiáveis e precisas.'
      };
    default:
      return {
        label: 'Outro',
        color: 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200',
        icon: '⚙️',
        concept: 'Recurso Secundário',
        desc: 'Recurso de configuração diversa registrado no sistema.'
      };
  }
};

const ResourceManagementPage: React.FC<ResourceManagementPageProps> = ({ 
  user,
  resources, 
  projects,
  onCreateResource, 
  onUpdateResource,
  onDeleteResource,
  onCreateRequest,
  onRollback
}) => {
  const navigate = useNavigate();
  const hasLinkedProject = projects.some(p => p.user === user.name);
  const isAdministrator = user.role === UserRole.ADMINISTRATOR;

  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');

  const myResources = resources.filter(r => 
    r.type !== ResourceType.MARKET_MODEL && 
    r.creatorId === user.id
  );

  const otherResources = resources.filter(r => 
    r.type !== ResourceType.MARKET_MODEL && 
    r.creatorId !== user.id
  );

  const filteredResources = activeTab === 'mine' ? myResources : otherResources;
  const [showHistoryModal, setShowHistoryModal] = useState<Resource | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showRagModal, setShowRagModal] = useState(false);
  const [transcriptsList, setTranscriptsList] = useState<any[]>([]);

  React.useEffect(() => {
    try {
      setTranscriptsList(JSON.parse(localStorage.getItem('luna_transcripts') || '[]'));
    } catch (e) {
      setTranscriptsList([]);
    }
  }, [showRagModal]);

  const transcriptsCount = transcriptsList.length;

  React.useEffect(() => {
    const handleClose = () => setActiveDropdown(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleEdit = (res: Resource) => {
    navigate(`/resources/edit/${res.id}`);
  };

  const handlePromoteToProduction = (res: Resource) => {
    onCreateRequest(
      res.id, 
      res.name, 
      'Promoção', 
      `Solicitação de promoção do ambiente de Homologação para Produção. Vincular ao Jira.`
    );
    alert("Solicitação de promoção enviada para aprovação do administrador.");
  };

  const handleDownloadSkill = (res: Resource) => {
    const fileName = `${res.name}_instrucoes.txt`;
    const fileContent = res.description || 'Nenhuma instrução cadastrada para esta skill.';
    
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Recursos</h1>
          <p className="text-slate-500">Crie e configure agentes de IA, assistentes e bancos de documentos vetorizados.</p>
        </div>
        <div className="flex items-center gap-4">
          {!hasLinkedProject && !isAdministrator && (
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 animate-pulse">
              Requer projeto vinculado no AI LAB para criar recursos
            </div>
          )}
          <button 
            onClick={() => navigate('/resources/create')}
            disabled={!hasLinkedProject && !isAdministrator}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-200 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <Icons.Plus />
            Novo Recurso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Recursos', value: filteredResources.length, icon: <Icons.Search />, color: 'bg-slate-500' },
          { label: 'Agentes / Assist.', value: filteredResources.filter(r => [ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(r.type)).length, icon: <Icons.AgentBuilder />, color: 'bg-indigo-500' },
          { label: 'Skills', value: filteredResources.filter(r => r.type === ResourceType.SKILL).length, icon: <Icons.Sparkles />, color: 'bg-fuchsia-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex border-b border-slate-200 mb-6 gap-8">
        <button 
          onClick={() => setActiveTab('mine')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'mine' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Meus Recursos ({myResources.length})
          {activeTab === 'mine' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'all' ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Recursos Existentes ({otherResources.length})
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-700">
            {activeTab === 'mine' ? 'Meus Recursos' : 'Outros Recursos da Organização'}
          </h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Pesquisar..." className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Recurso</th>
              <th className="px-6 py-4">Classificação</th>
              <th className="px-6 py-4">Criador</th>
              <th className="px-6 py-4">Área / BU</th>
              <th className="px-6 py-4">Ambiente</th>
              <th className="px-6 py-4">Versões</th>
              <th className="px-6 py-4">Última Atualização</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredResources.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{res.name}</div>
                  {res.id === 'luna-secretario' && (
                    <div className="mt-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRagModal(true);
                        }}
                        className="text-[10px] font-extrabold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver documentos salvos no RAG"
                      >
                        <span className="text-[10px]">📚</span>
                        <span>{transcriptsCount} Gravações no RAG</span>
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const info = getClassificationInfo(res.type);
                    return (
                      <div className="relative group inline-block">
                        <span className="text-xs font-semibold text-slate-750 hover:text-sky-600 cursor-help transition-colors">
                          {info.label}
                        </span>
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-xl p-3.5 z-50 pointer-events-none transition-all duration-200 border border-slate-750 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-bottom invisible group-hover:visible">
                          <div className="font-extrabold mb-1.5 pb-1.5 border-b border-white/10 text-[11px] text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <span>{info.icon}</span>
                            <span>{info.concept}</span>
                          </div>
                          <p className="text-slate-200 font-medium leading-relaxed mb-2">
                            {info.desc}
                          </p>
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-white/5 text-[10px] text-slate-400">
                            <span className="font-bold text-slate-500 block mb-0.5">Descrição do Item:</span>
                            <p className="italic line-clamp-2 leading-normal">
                              {res.description ? `"${res.description}"` : 'Sem descrição cadastrada.'}
                            </p>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-slate-900/95"></div>
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {res.creatorName ? res.creatorName.charAt(0) : 'S'}
                    </div>
                    <div className="text-xs font-bold text-slate-600">{res.creatorName || 'Sistema'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {res.creatorArea || 'Geral'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-1 ${
                      res.environment === ResourceEnvironment.PRODUCTION ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {res.environment === ResourceEnvironment.PRODUCTION ? 'Produção' : 'Homologação'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-600">v{res.version}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{res.updatedAt}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-block text-left relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === res.id ? null : res.id);
                      }}
                      className="p-2 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-650 transition-all focus:outline-none"
                      title="Ações"
                    >
                      <Icons.MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeDropdown === res.id && (
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 divide-y divide-slate-100 origin-top-right text-left">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHistoryModal(res);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                          >
                            <Icons.History className="w-4 h-4 text-slate-400" />
                            <span>Histórico de Versões</span>
                          </button>
                          
                          {res.type === ResourceType.SKILL && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSkill(res);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-teal-600 hover:bg-teal-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Icons.Download className="w-4 h-4 text-teal-550" />
                              <span>Baixar Instruções (TXT)</span>
                            </button>
                          )}
                          
                          {res.environment !== ResourceEnvironment.PRODUCTION && res.type !== ResourceType.SKILL && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromoteToProduction(res);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Icons.Lightning className="w-4 h-4 text-emerald-550" />
                              <span>Solicitar Promoção</span>
                            </button>
                          )}
                        </div>

                        {(res.type !== ResourceType.SKILL || res.creatorId === user.id || isAdministrator) && (
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(res);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Icons.Edit className="w-4 h-4 text-slate-400" />
                              <span>Editar Recurso</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteResource(res.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Icons.Trash className="w-4 h-4 text-rose-550" />
                              <span>Excluir Recurso</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Icons.History className="w-5 h-5 text-indigo-600" />
                Versões: {showHistoryModal.name}
              </h2>
              <button onClick={() => setShowHistoryModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Icons.X />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-800 uppercase">Versão Atual (v{showHistoryModal.version})</div>
                  <div className="text-[10px] text-indigo-600">Atualizado em {showHistoryModal.updatedAt}</div>
                </div>
                <div className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded">ATIVO</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Versões Anteriores</h3>
                {(!showHistoryModal.history || showHistoryModal.history.length === 0) ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">Nenhuma versão anterior encontrada.</div>
                ) : (
                  showHistoryModal.history.map((h, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">Versão {h.version}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 font-medium">{h.updatedAt}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-bold text-slate-400">Por {h.updatedBy}</div>
                          {onRollback && (
                            <button 
                              onClick={() => {
                                if (confirm(`Deseja restaurar para a Versão ${h.version}? A versão atual será salva no histórico.`)) {
                                  onRollback(showHistoryModal.id, h.version);
                                  setShowHistoryModal(null);
                                }
                              }}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              Restaurar
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {h.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowHistoryModal(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL LUNA RAG REGISTROS --- */}
      {showRagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in" onClick={() => setShowRagModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>📚</span>
                <span>Base de Conhecimento (RAG): Luna, o secretário</span>
              </h2>
              <button onClick={() => setShowRagModal(false)} className="text-slate-400 hover:text-slate-650 transition-colors p-1.5 hover:bg-slate-200/50 rounded-full cursor-pointer focus:outline-none">
                <Icons.X />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-850 flex items-start gap-2.5 leading-relaxed">
                <span className="text-base">💁‍♂️</span>
                <div>
                  <p className="font-bold mb-0.5">Como funciona a busca sintética do assistente?</p>
                  <p className="text-sky-750">Sempre que você conversa com o <strong>Luna, o secretário</strong> (seja no Playground ou nos canais de chat), seu mecanismo RAG lê os arquivos abaixo e fundamenta as respostas exclusivamente no conteúdo de reuniões e atas gravadas.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gravações Salvas ({transcriptsList.length})</h3>
                {transcriptsList.length === 0 ? (
                  <div className="text-center py-12 border border-slate-150 border-dashed rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 italic">Nenhuma gravação armazenada no RAG do Luna.</p>
                    <p className="text-[10px] text-sky-600 font-bold mt-1.5">Use o botão "Gravar Reunião" do cabeçalho para gerar conteúdo!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcriptsList.map((t, idx) => (
                      <div key={t.id || idx} className="bg-white border border-slate-200 p-4 rounded-xl hover:shadow-xs transition-all">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{t.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                              <span>📅 {t.timestamp}</span>
                              <span>•</span>
                              <span>⏱️ Duração: {t.duration}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover esta gravação do RAG do Luna? Isso excluirá permanentemente.`)) {
                                const updated = transcriptsList.filter((_, i) => i !== idx);
                                localStorage.setItem('luna_transcripts', JSON.stringify(updated));
                                setTranscriptsList(updated);
                                alert("Documento excluído com sucesso do RAG do Luna!");
                                // Trigger a reload by reloading the window or setting state
                                window.location.reload();
                              }
                            }}
                            className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-150/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all shrink-0"
                          >
                            Excluir
                          </button>
                        </div>
                        
                        <div className="text-xs text-slate-650 bg-slate-50 p-3 rounded-lg border border-slate-150/50 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
                          {t.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowRagModal(false)} 
                className="px-5 py-2 hover:bg-slate-150/40 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementPage;
