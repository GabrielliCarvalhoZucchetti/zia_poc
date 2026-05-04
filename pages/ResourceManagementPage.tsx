
import React, { useState } from 'react';
import { Resource, ResourceType, AgentType, UserRole, ResourceEnvironment, User, Project } from '../types';
import { Icons } from '../constants';
import { generateAgentResponse } from '../services/geminiService';

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
  const hasLinkedProject = projects.some(p => p.user === user.name);
  const isAdministrator = user.role === UserRole.ADMINISTRATOR;

  const filteredResources = resources.filter(r => 
    r.type !== ResourceType.MARKET_MODEL && 
    (r.creatorId === user.id || isAdministrator)
  );
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [createType, setCreateType] = useState<ResourceType>(ResourceType.AGENT);
  
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState<AgentType>(AgentType.READING);
  const [requiredRole, setRequiredRole] = useState<UserRole>(UserRole.BASIC);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('Gemini 1.5 Flash');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState<Resource | null>(null);

  const handleImprovePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsImprovingPrompt(true);
    try {
      const improved = await generateAgentResponse(
        `Melhore e refine o seguinte prompt de sistema para um agente de IA. Torne-o mais profissional, claro e eficaz, mantendo o objetivo original. Retorne APENAS o texto do prompt melhorado, sem comentários adicionais:\n\n"${prompt}"`,
        [],
        "Você é um especialista em engenharia de prompts para IA. Sua tarefa é otimizar prompts para torná-los mais precisos e eficientes."
      );
      if (improved && !improved.includes("Error")) {
        setPrompt(improved);
      }
    } catch (error) {
      console.error("Failed to improve prompt:", error);
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  const handleEdit = (res: Resource) => {
    setEditingResource(res);
    setCreateType(res.type);
    setName(res.name);
    setDescription(res.description);
    setAgentType(res.agentType || AgentType.READING);
    setRequiredRole(res.requiredRole);
    setPrompt(res.prompt || '');
    setModel(res.model || 'Gemini 1.5 Flash');
    setWebhookUrl(res.webhookUrl || '');
    setLinkedDocs(res.linkedDocs || []);
    setProjectId(res.projectId || '');
    setShowModal(true);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação do ID do Projeto
    const projectExists = projects.some(p => p.id === projectId);
    if (!projectExists && !isAdministrator) {
      alert("ID do Projeto inválido. Por favor, verifique o ID correto na aba Laboratório.");
      return;
    }

    if (editingResource) {
      onUpdateResource({
        ...editingResource,
        name,
        description,
        projectId,
        type: createType,
        agentType: createType === ResourceType.AGENT ? agentType : undefined,
        requiredRole,
        prompt,
        model,
        webhookUrl,
        linkedDocs
      });
    } else {
      onCreateResource({
        name,
        description,
        projectId,
        type: createType,
        agentType: createType === ResourceType.AGENT ? agentType : undefined,
        requiredRole,
        prompt,
        model,
        webhookUrl,
        linkedDocs
      });
    }
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingResource(null);
    setName('');
    setProjectId('');
    setDescription('');
    setPrompt('');
    setModel('Gemini 1.5 Flash');
    setWebhookUrl('');
    setLinkedDocs([]);
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
              ⚠️ Requer projeto vinculado no AI LAB para criar recursos
            </div>
          )}
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            disabled={!hasLinkedProject && !isAdministrator}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-200 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            <Icons.Plus />
            Novo Recurso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Recursos', value: filteredResources.length, icon: <Icons.Search />, color: 'bg-blue-500' },
          { label: 'Agentes em Produção', value: filteredResources.filter(r => r.type === ResourceType.AGENT && r.environment === ResourceEnvironment.PRODUCTION).length, icon: <Icons.AgentBuilder />, color: 'bg-indigo-500' },
          { label: 'Documentação', value: filteredResources.filter(r => r.type === ResourceType.DOCUMENTATION).length, icon: <Icons.Documentation />, color: 'bg-emerald-500' },
          { label: 'Apenas Admin', value: filteredResources.filter(r => r.requiredRole === UserRole.ADMINISTRATOR).length, icon: <Icons.Settings />, color: 'bg-amber-500' },
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-700">Recursos Existentes</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Pesquisar..." className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Recurso</th>
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
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{res.name}</div>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setShowHistoryModal(res)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Ver Histórico de Versões"
                    >
                      <Icons.History />
                    </button>
                    {(res.creatorId === user.id || isAdministrator) ? (
                      <>
                        <button 
                          onClick={() => handleEdit(res)}
                          className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Editar Recurso"
                        >
                          <Icons.Edit />
                        </button>
                        <button 
                          onClick={() => onDeleteResource(res.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir Recurso"
                        >
                          <Icons.Trash />
                        </button>
                      </>
                    ) : (
                      <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Somente Leitura</div>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingResource ? `Editar ${editingResource.name}` : 'Novo Recurso ZIA'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Icons.X />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6">
                {!editingResource && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Vincular ao projeto existente</label>
                    <select 
                      required 
                      value={projectId} 
                      onChange={e => setProjectId(e.target.value)} 
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="">Selecione um projeto...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} (ID: {p.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 italic">O recurso deve ser vinculado a um projeto mapeado na aba Laboratório.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título do Recurso</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Assistente de Vendas" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição (Obrigatório para Publicação)</label>
                  <textarea 
                    required 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={2} 
                    placeholder="Explique o que este recurso faz e por que foi atualizado..." 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  ></textarea>
                </div>
              </div>


              {createType === ResourceType.AGENT && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Modelo de LLM (Motor de IA)</label>
                  <select 
                    value={model} 
                    onChange={e => setModel(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="GPT-4o">GPT-4o (OpenAI)</option>
                    <option value="GPT-4o-mini">GPT-4o mini (OpenAI)</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Google)</option>
                    <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Google)</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                    <option value="Claude 3 Haiku">Claude 3 Haiku (Anthropic)</option>
                  </select>
                </div>
              )}

              {createType === ResourceType.AGENT && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">Prompt do Sistema / Instruções</label>
                    <button 
                      type="button"
                      onClick={handleImprovePrompt}
                      disabled={isImprovingPrompt || !prompt.trim()}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 hover:text-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImprovingPrompt ? (
                        <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Icons.AgentBuilder />
                      )}
                      {isImprovingPrompt ? 'Melhorando...' : 'Melhorar com IA'}
                    </button>
                  </div>
                  <textarea required value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Defina a personalidade e restrições do agente..." className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                </div>
              )}

              {createType === ResourceType.AGENT && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Icons.Settings className="w-3 h-3" />
                    Webhook de Integração (n8n, Lovable, etc.)
                  </label>
                  <input 
                    value={webhookUrl} 
                    onChange={e => setWebhookUrl(e.target.value)} 
                    type="url" 
                    placeholder="https://seu-webhook.com/api/..." 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono" 
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    Quando configurado, as solicitações do usuário serão enviadas para este endpoint para processamento externo.
                  </p>
                </div>
              )}

              {createType === ResourceType.AGENT && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Upload de Arquivos para Vetorização</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-sky-400 transition-colors cursor-pointer bg-slate-50">
                      <Icons.Plus />
                      <span className="text-[10px] font-semibold mt-2">Arraste documentos para treinar este agente (.pdf, .txt)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Documentos Vetorizados Vinculados</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      {resources.filter(r => r.type === ResourceType.DOCUMENTATION).length === 0 ? (
                        <div className="text-xs text-slate-400 italic">Nenhuma documentação disponível para vincular.</div>
                      ) : (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {resources.filter(r => r.type === ResourceType.DOCUMENTATION).map(doc => (
                            <label key={doc.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={linkedDocs.includes(doc.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setLinkedDocs(prev => [...prev, doc.id]);
                                  else setLinkedDocs(prev => prev.filter(id => id !== doc.id));
                                }}
                                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-slate-700">{doc.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{doc.description}</div>
                              </div>
                              {(doc.creatorId === user.id || isAdministrator) && (
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm(`Deseja realmente excluir o documento "${doc.name}"? Esta ação é irreversível.`)) {
                                      onDeleteResource(doc.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                                  title="Excluir Documento Permanentemente"
                                >
                                  <Icons.Trash />
                                </button>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {createType === ResourceType.DOCUMENTATION && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Arquivos Vetorizados</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-sky-400 transition-colors cursor-pointer">
                    <Icons.Plus />
                    <span className="text-xs font-semibold mt-2">Clique ou arraste arquivos para vetorização (.pdf, .txt, .csv)</span>
                  </div>
                  {editingResource && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Icons.Check />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-800">Documento Ativo</div>
                        <div className="text-[10px] text-emerald-600">Vetorização concluída e pronta para uso.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingResource && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">Status de Publicação</div>
                      <div className="text-[10px] text-slate-500">
                        {editingResource.environment === ResourceEnvironment.PRODUCTION 
                          ? 'Este recurso está disponível para todos os usuários autorizados.' 
                          : 'Este recurso está em fase de testes e visível apenas para você.'}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      editingResource.environment === ResourceEnvironment.PRODUCTION ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {editingResource.environment === ResourceEnvironment.PRODUCTION ? 'Produção' : 'Homologação'}
                    </span>
                  </div>
                  
                  {editingResource.environment === ResourceEnvironment.STAGING && (
                    <div className="pt-2 border-t border-slate-200">
                      <button 
                        type="button"
                        onClick={() => {
                          handlePromoteToProduction(editingResource);
                          setShowModal(false);
                        }}
                        className="w-full py-2 bg-white border border-sky-200 text-sky-600 rounded-lg text-xs font-bold hover:bg-sky-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Icons.Check />
                        Ambiente de Produção
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-100">
                  {editingResource ? 'Publicar Revisão' : 'Criar Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementPage;
