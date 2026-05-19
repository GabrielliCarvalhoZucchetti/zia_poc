
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Resource, ResourceType, AgentType, UserRole, ResourceEnvironment, User, Project } from '../types';
import { Icons } from '../constants';
import { generateAgentResponse } from '../services/geminiService';
import { motion } from 'motion/react';

interface CreateResourcePageProps {
  user: User;
  resources: Resource[];
  projects: Project[];
  onCreateResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'environment' | 'creatorId' | 'version' | 'updatedAt' | 'history'>) => void;
  onUpdateResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  onCreateRequest: (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação' | 'Promoção', reason?: string) => void;
}

const CreateResourcePage: React.FC<CreateResourcePageProps> = ({
  user,
  resources,
  projects,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onCreateRequest
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as ResourceType || ResourceType.AGENT;

  const isEditing = !!id;
  const editingResource = resources.find(r => r.id === id);

  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [createType, setCreateType] = useState<ResourceType>(initialType);
  const [agentType, setAgentType] = useState<AgentType>(AgentType.READING);
  const [requiredRole, setRequiredRole] = useState<UserRole>(UserRole.INTERMEDIATE);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('Gemini 1.5 Flash');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookHeaders, setWebhookHeaders] = useState('');
  const [webhookBody, setWebhookBody] = useState('');
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);

  // Pagination for Documents
  const [docPage, setDocPage] = useState(1);
  const docsPerPage = 3; 

  // Markdown Editor States
  const [editingDoc, setEditingDoc] = useState<Resource | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isMarkdownEditorOpen, setIsMarkdownEditorOpen] = useState(false);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

  // Efeito para abrir o editor assim que o arquivo for "convertido" (adicionado à lista)
  useEffect(() => {
    if (lastUploadedFileName) {
      const newDoc = resources.find(r => r.name === lastUploadedFileName && r.type === ResourceType.DOCUMENTATION);
      if (newDoc) {
        setEditingDoc(newDoc);
        setMarkdownContent(newDoc.prompt || '');
        setIsMarkdownEditorOpen(true);
        setLastUploadedFileName(null);
      }
    }
  }, [resources, lastUploadedFileName]);

  useEffect(() => {
    if (isEditing && editingResource) {
      setName(editingResource.name);
      setProjectId(editingResource.projectId || '');
      setDescription(editingResource.description);
      setCreateType(editingResource.type);
      setAgentType(editingResource.agentType || AgentType.READING);
      setRequiredRole(editingResource.requiredRole);
      setPrompt(editingResource.prompt || '');
      setModel(editingResource.model || 'Gemini 1.5 Flash');
      setWebhookUrl(editingResource.webhookUrl || '');
      setWebhookHeaders(editingResource.webhookHeaders || '');
      setWebhookBody(editingResource.webhookBody || '');
      setLinkedDocs(editingResource.linkedDocs || []);
    }
  }, [isEditing, editingResource]);

  const handleImproveDescription = async () => {
    if (!description.trim()) return;
    setIsImprovingDescription(true);
    try {
      const improved = await generateAgentResponse(
        `Melhore e refine a seguinte descrição de um recurso de IA. Torne-a mais profissional, clara e atraente, descrevendo bem o propósito do recurso. Retorne APENAS o texto da descrição melhorada, sem comentários adicionais:\n\n"${description}"`,
        [],
        "Você é um especialista em descrever produtos de tecnologia e IA. Sua tarefa é criar descrições envolventes e informativas."
      );
      if (improved && !improved.includes("Error")) {
        setDescription(improved);
      }
    } catch (error) {
      console.error("Failed to improve description:", error);
    } finally {
      setIsImprovingDescription(false);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && editingResource) {
      onUpdateResource({
        ...editingResource,
        name,
        description,
        projectId,
        type: createType,
        agentType: [ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) ? agentType : undefined,
        requiredRole,
        prompt,
        model,
        webhookUrl,
        webhookHeaders,
        webhookBody,
        linkedDocs
      });
    } else {
      onCreateResource({
        name,
        description,
        projectId,
        type: createType,
        agentType: [ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) ? agentType : undefined,
        requiredRole,
        prompt,
        model,
        webhookUrl,
        webhookHeaders,
        webhookBody,
        linkedDocs
      });
    }
    navigate('/resources');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simular conversão para Markdown
    const simulatedMarkdown = `# Documento: ${file.name}\n\nEste é um conteúdo simulado extraído do arquivo original.\n\n## Detalhes\n- Nome: ${file.name}\n- Tamanho: ${(file.size / 1024).toFixed(2)} KB\n- Tipo: ${file.type}\n\n--- \n*O conteúdo real seria extraído via processamento de OCR/Texto.*`;

    onCreateResource({
      name: file.name,
      description: `Conteúdo extraído de ${file.name}`,
      type: ResourceType.DOCUMENTATION,
      projectId: projectId,
      prompt: simulatedMarkdown,
      requiredRole: UserRole.BASIC,
      linkedDocs: []
    });

    setLastUploadedFileName(file.name);

    // Reset input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="min-h-full bg-white flex flex-col">
      {/* Header Fixo da Página */}
      <div className="bg-white border-b border-slate-200 px-12 py-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/resources')}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 border border-transparent hover:border-slate-200"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {isEditing ? `Edição de Recurso: ${editingResource?.name}` : 'Construção de Inteligência Artificial'}
                </h1>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[10px] font-bold rounded-md uppercase tracking-wider">Builder v2.0</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                Ambiente de **Homologação** • As alterações são salvas como rascunho até que você publique.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate('/resources')}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
            >
              Descartar
            </button>
            {isEditing && editingResource?.environment !== ResourceEnvironment.PRODUCTION && (
              <button 
                type="button"
                onClick={() => {
                  onCreateRequest(
                    editingResource.id, 
                    editingResource.name, 
                    'Promoção' as any, 
                    'Solicitação de promoção do ambiente de Homologação para Produção. Atendendo aos requisitos de qualidade.'
                  );
                  alert('Solicitação de promoção para Produção enviada com sucesso! Você pode acompanhar o status na gestão de acessos.');
                }}
                className="px-6 py-2.5 text-sm font-bold text-sky-600 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-xl transition-all flex items-center gap-2"
              >
                <Icons.Lightning className="w-4 h-4" />
                Solicitar Produção
              </button>
            )}
            <button 
              type="button"
              onClick={handleSubmit}
              className="px-10 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xl shadow-slate-200 transition-all flex items-center gap-2 border border-slate-900"
            >
              <Icons.Check className="w-4 h-4" />
              {isEditing ? 'Salvar Revisão' : 'Finalizar e Publicar'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-[1600px] mx-auto px-12 py-10">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
            
            {/* Coluna Principal: Configurações */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* Seção 1: Identidade */}
              <section className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm space-y-8 border-t-4 border-t-sky-500">
                 <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                      <Icons.Database className="w-5 h-5" />
                    </div>
                    Definição de Identidade
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 ml-13">Configure os fundamentos básicos da sua nova ferramenta de IA.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tipo de Core Engine</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button 
                        type="button"
                        onClick={() => setCreateType(ResourceType.AUTOMATION)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left relative overflow-hidden group ${
                          createType === ResourceType.AUTOMATION
                            ? 'border-amber-500 bg-amber-50/30' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl w-fit ${createType === ResourceType.AUTOMATION ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                          <Icons.Workflow className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-base font-bold ${createType === ResourceType.AUTOMATION ? 'text-amber-900' : 'text-slate-700'}`}>Automação</div>
                          <div className="text-xs text-slate-500 leading-relaxed mt-1">Executa tarefas repetitivas sem tomar decisões baseadas em contexto fluído.</div>
                        </div>
                        {createType === ResourceType.AUTOMATION && <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></div>}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setCreateType(ResourceType.AGENT)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left relative overflow-hidden group ${
                          createType === ResourceType.AGENT 
                            ? 'border-sky-500 bg-sky-50/30' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl w-fit ${createType === ResourceType.AGENT ? 'bg-sky-100 text-sky-600' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                          <Icons.Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-base font-bold ${createType === ResourceType.AGENT ? 'text-sky-900' : 'text-slate-700'}`}>Agente Autônomo</div>
                          <div className="text-xs text-slate-500 leading-relaxed mt-1">Entende objetivos complexos, decide passos intermediários e executa ações de forma proativa.</div>
                        </div>
                        {createType === ResourceType.AGENT && <div className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full"></div>}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setCreateType(ResourceType.ASSISTANT)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left relative overflow-hidden group ${
                          createType === ResourceType.ASSISTANT
                            ? 'border-indigo-500 bg-indigo-50/30' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-3 rounded-xl w-fit ${createType === ResourceType.ASSISTANT ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                          <Icons.MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-base font-bold ${createType === ResourceType.ASSISTANT ? 'text-indigo-900' : 'text-slate-700'}`}>Assistente Cognitivo</div>
                          <div className="text-xs text-slate-500 leading-relaxed mt-1">Especialista em processar perguntas e gerar respostas precisas, mas atua apenas sob demanda.</div>
                        </div>
                        {createType === ResourceType.ASSISTANT && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></div>}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vincular ao Projeto Estratégico</label>
                      <div className="relative">
                        <select 
                          required 
                          value={projectId} 
                          onChange={e => setProjectId(e.target.value)} 
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 bg-white text-sm appearance-none transition-all"
                        >
                          <option value="">Selecione um projeto mapeado no Lab...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                        <Icons.ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Título do Recurso</label>
                      <input 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        type="text" 
                        placeholder="Ex: Engine de Triagem Fiscal" 
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-sm transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contexto de Negócio & Finalidade</label>
                      <button 
                        type="button"
                        onClick={handleImproveDescription}
                        disabled={isImprovingDescription || !description.trim()}
                        className="flex items-center gap-2 text-[10px] font-bold text-sky-600 hover:text-sky-700 transition-all bg-sky-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {isImprovingDescription ? <Icons.Loader className="w-3 h-3 animate-spin" /> : <Icons.Sparkles className="w-3 h-3" />}
                        {isImprovingDescription ? 'Processando...' : 'IA: Gerar Descrição Profissional'}
                      </button>
                    </div>
                    <textarea 
                      required 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={3} 
                      placeholder="Descreva o propósito deste recurso, que problemas ele resolve e qual seu público-alvo..." 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-sm leading-relaxed transition-all"
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Seção 2: Inteligência */}
              {[ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) && (
                <section className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-sm space-y-8 border-t-4 border-t-indigo-500">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Icons.Cpu className="w-5 h-5" />
                      </div>
                      Arquitetura de Inteligência
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 ml-13">Configure o cérebro e as capacidades operacionais do seu recurso.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="md:col-span-1 space-y-3">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Modelo (Engine)</label>
                         <div className="relative">
                            <select 
                              value={model} 
                              onChange={e => setModel(e.target.value)}
                              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white text-sm appearance-none"
                            >
                              <optgroup label="OpenAI">
                                <option value="GPT-4o">GPT-4o</option>
                                <option value="GPT-4o-mini">GPT-4o mini</option>
                              </optgroup>
                              <optgroup label="Google">
                                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
                              </optgroup>
                              <optgroup label="Anthropic">
                                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                                <option value="Claude 3 Haiku">Claude 3 Haiku</option>
                              </optgroup>
                            </select>
                            <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                         </div>
                       </div>

                       <div className="md:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start gap-4">
                         <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 shrink-0">
                           <Icons.Info className="w-5 h-5" />
                         </div>
                         <div>
                           <div className="text-xs font-bold text-slate-700">Nota de Desempenho</div>
                           <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                             O modelo selecionado impacta diretamente no custo por token e na latência de resposta. 
                             Para tarefas de triagem rápida, recomendamos <strong>Flash/Mini</strong>. Para raciocínio complexo, use <strong>Pro/Sonnet</strong>.
                           </p>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">System Prompt & Diretrizes Operacionais</label>
                        <button 
                          type="button"
                          onClick={handleImprovePrompt}
                          disabled={isImprovingPrompt || !prompt.trim()}
                          className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-all bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {isImprovingPrompt ? <Icons.Loader className="w-3 h-3 animate-spin" /> : <Icons.Sparkles className="w-3 h-3" />}
                          {isImprovingPrompt ? 'Refinando Engine...' : 'IA: Otimizar System Prompt'}
                        </button>
                      </div>
                      <textarea 
                        required 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        rows={12} 
                        placeholder="Ex: Você é um assistente sênior da Zucchetti especialista em..." 
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-mono leading-relaxed transition-all bg-slate-900 text-slate-300 selection:bg-indigo-500/30"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-full p-8 border border-slate-200 rounded-3xl space-y-6 bg-slate-50/10 hover:border-sky-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Icons.ArrowRight className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">Integrar Recurso Externo</h3>
                            <p className="text-[11px] text-slate-500">Configuração de Webhook / API de Saída</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL do Endpoint</label>
                            <input 
                              value={webhookUrl} 
                              onChange={e => setWebhookUrl(e.target.value)} 
                              type="url" 
                              placeholder="https://api.empresa.com/v1/action" 
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono bg-white" 
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headers (JSON)</label>
                            <textarea 
                              value={webhookHeaders} 
                              onChange={e => setWebhookHeaders(e.target.value)} 
                              rows={1}
                              placeholder='{ "Authorization": "Bearer key..." }' 
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono bg-white resize-none" 
                            />
                          </div>

                          <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estrutura do Body (Payload JSON)</label>
                            <textarea 
                              value={webhookBody} 
                              onChange={e => setWebhookBody(e.target.value)} 
                              rows={4}
                              placeholder='{ "message": "{{output}}", "user": "{{user_email}}" }' 
                              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono bg-white leading-relaxed" 
                            />
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 italic bg-sky-50/50 p-2 rounded-lg border border-sky-100/50 mt-2">
                              <Icons.Info className="w-3 h-3 text-sky-500" />
                              <span>Use <strong>{"{{output}}"}</strong> para injetar a resposta da IA e <strong>{"{{user_email}}"}</strong> para o email do solicitante.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-full p-8 border border-sky-200 rounded-3xl space-y-6 bg-sky-50/20 hover:border-sky-400 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Icons.Download className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">Expor Recurso</h3>
                            <p className="text-[11px] text-slate-500">O recurso será disponibilizado via API para outros sistemas</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL de Integração (Endpoint Automático)</label>
                            <div className="flex gap-2">
                              <div className="flex-1 px-4 py-3.5 rounded-xl border border-sky-100 bg-white text-[11px] font-mono text-sky-700 truncate select-all">
                                https://zia.zucchetti.com.br/api/webhook/v1/{isEditing ? editingResource?.id : 'recurso-novo'}
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://zia.zucchetti.com.br/api/webhook/v1/${isEditing ? editingResource?.id : 'recurso-novo'}`);
                                  alert('URL copiada para a área de transferência!');
                                }}
                                className="px-5 bg-white border border-sky-200 text-sky-600 rounded-xl hover:bg-sky-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                              >
                                <Icons.Copy className="w-4 h-4" />
                                Copiar
                              </button>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-white/60 border border-sky-100 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                <Icons.Info className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700">Geração de Endpoint Automática</p>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    Este recurso será exposto como um endpoint seguro que aceita payloads via <strong>POST</strong>. 
                                    As instruções de autenticação estarão disponíveis na aba de gestão de acessos.
                                </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Context Store (RAG) - MOVED HERE */}
                    <div className="pt-8 border-t border-slate-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                              <Icons.Database className="w-5 h-5" />
                            </div>
                            Base de Conhecimento (RAG)
                          </h2>
                          <p className="text-sm text-slate-500 mt-1 ml-13">Vincule documentos para que a IA utilize como fonte de verdade.</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-all bg-sky-50 px-5 py-2.5 rounded-xl border border-sky-100"
                          >
                            <Icons.Upload className="w-4 h-4" />
                            <span>Treinar com novo documento</span>
                          </button>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          accept=".pdf,.doc,.docx,.txt,.csv"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const allProjDocs = resources.filter(r => r.type === ResourceType.DOCUMENTATION && r.projectId === projectId);
                          const totalDocs = allProjDocs.length;
                          const totalPages = Math.ceil(totalDocs / docsPerPage);
                          const paginatedDocs = allProjDocs.slice((docPage - 1) * docsPerPage, docPage * docsPerPage);

                          if (totalDocs === 0) {
                            return (
                              <div className="col-span-full p-12 rounded-[32px] border-2 border-dashed border-slate-100 text-center bg-slate-50/30">
                                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4">
                                  <Icons.Database className="w-8 h-8" />
                                </div>
                                <div className="text-sm font-bold text-slate-600">Nenhum documento vinculado</div>
                                <div className="text-xs text-slate-400 mt-1">Carregue manuais, bases de conhecimento ou CSVs para alimentar esta IA.</div>
                              </div>
                            );
                          }

                          return (
                            <>
                              {paginatedDocs.map(doc => {
                                const isOwner = doc.creatorId === user.id || user.role === UserRole.ADMINISTRATOR;
                                return (
                                  <div key={doc.id} className={`group relative flex flex-col gap-4 p-6 rounded-[24px] border transition-all ${linkedDocs.includes(doc.id) ? 'bg-sky-50/50 border-sky-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                    <div className="flex items-start gap-4">
                                      <div className="relative flex items-center justify-center h-6 w-6 shrink-0 mt-1">
                                        <input 
                                          type="checkbox" 
                                          checked={linkedDocs.includes(doc.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) setLinkedDocs(prev => [...prev, doc.id]);
                                            else setLinkedDocs(prev => prev.filter(id => id !== doc.id));
                                          }}
                                          className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${linkedDocs.includes(doc.id) ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200 peer-hover:border-slate-400'}`}>
                                          {linkedDocs.includes(doc.id) && <Icons.Check className="w-4 h-4 text-white" />}
                                        </div>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0 pr-10">
                                        <div className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                                          {doc.name}
                                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-tighter">Markdown</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{doc.description}</div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                      <div className="flex items-center gap-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">v{doc.version || 1}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Ativo em RAG</div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {isOwner && (
                                          <>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                setEditingDoc(doc);
                                                setMarkdownContent(doc.prompt || '');
                                                setIsMarkdownEditorOpen(true);
                                              }}
                                              className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                              title="Editar Conteúdo"
                                            >
                                              <Icons.Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                if (confirm('Deseja excluir esta base de conhecimento permanentemente?')) {
                                                  onDeleteResource(doc.id);
                                                }
                                              }}
                                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                              title="Excluir"
                                            >
                                              <Icons.Trash className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Document Pagination */}
                              {totalDocs > docsPerPage && (
                                <div className="col-span-full flex items-center justify-between px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                  <div className="text-xs text-slate-500 font-medium">
                                    Mostrando {(docPage - 1) * docsPerPage + 1}-{Math.min(docPage * docsPerPage, totalDocs)} de {totalDocs} documentos
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      type="button"
                                      disabled={docPage === 1}
                                      onClick={() => setDocPage(prev => prev - 1)}
                                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                      <Icons.ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setDocPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${docPage === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-200 text-slate-500'}`}
                                      >
                                        {i + 1}
                                      </button>
                                    ))}
                                    <button 
                                      type="button"
                                      disabled={docPage === totalPages}
                                      onClick={() => setDocPage(prev => prev + 1)}
                                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                    >
                                      <Icons.ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Seção 2: Vetorização (Se Documentação) */}
              {createType === ResourceType.DOCUMENTATION && (
                <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-slate-800">Conteúdo & Vetorização</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload de Arquivos</label>
                    <div className="border-3 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer group">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icons.Plus className="w-8 h-8 text-slate-300 group-hover:text-sky-500" />
                      </div>
                      <div className="text-sm font-bold text-slate-600 mb-1">Selecionar documentos para indexar</div>
                      <div className="text-xs text-slate-400">PDF, TXT, CSV, DOCX (Max 20MB por arquivo)</div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Side Column: Metadata & Knowledge Hub */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-8 sticky top-32">
                <div>
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Controle de Governança</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Autor</div>
                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Departamento</div>
                        <div className="text-sm font-bold text-slate-800">{user.bu || 'Zucchetti Corporate'}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] block">Visibilidade & Permissões</label>
                      <div className="space-y-3">
                         {[
                           { role: UserRole.INTERMEDIATE, label: 'Exclusivo do Departamento', desc: 'Restrito para membros da sua BU/Área', icon: Icons.Lock },
                           { role: UserRole.BASIC, label: 'Lançamento Corporativo', desc: 'Disponível para qualquer usuário logado', icon: Icons.Globe },
                         ].map((r) => (
                           <button 
                             key={r.role}
                             type="button"
                             onClick={() => setRequiredRole(r.role)}
                             className={`w-full p-4 rounded-2xl border-2 flex items-start gap-4 transition-all text-left ${
                               requiredRole === r.role 
                                 ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-md' 
                                 : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                             }`}
                           >
                             <div className={`mt-0.5 ${requiredRole === r.role ? 'text-sky-600' : 'text-slate-400'}`}>
                               <r.icon className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="text-xs font-bold leading-tight">{r.label}</div>
                               <div className="text-[10px] mt-1 opacity-60 leading-normal">{r.desc}</div>
                             </div>
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-2xl text-slate-400 space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400">
                       <Icons.ShieldCheck className="w-5 h-5" />
                     </div>
                     <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compliance IA</h4>
                   </div>
                   <p className="text-[10px] leading-relaxed">
                     Este recurso será auditado por logs de atividade. Promoções para <strong>PRODUÇÃO</strong> exigirão análise da área técnica responsável.
                   </p>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>

      {/* Markdown Editor Modal */}
      {isMarkdownEditorOpen && editingDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-5xl h-[85vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm border border-sky-100/50">
                  <Icons.Documentation className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Editor de Documentação</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{editingDoc.name}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-medium text-slate-400">Modo de Edição Direta</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMarkdownEditorOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Toolbar */}
            <div className="px-10 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                <button 
                  type="button"
                  onClick={() => {
                     const el = document.getElementById('md-textarea-modal') as HTMLTextAreaElement;
                     const start = el.selectionStart;
                     const end = el.selectionEnd;
                     const text = markdownContent;
                     const before = text.substring(0, start);
                     const after = text.substring(end);
                     setMarkdownContent(before + '# ' + text.substring(start, end) + after);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <span className="text-lg font-serif">H1</span>
                  Título
                </button>
                <div className="w-px h-5 bg-slate-100 mx-0.5"></div>
                <button 
                  type="button"
                  onClick={() => {
                     const el = document.getElementById('md-textarea-modal') as HTMLTextAreaElement;
                     const start = el.selectionStart;
                     const end = el.selectionEnd;
                     const text = markdownContent;
                     const before = text.substring(0, start);
                     const after = text.substring(end);
                     setMarkdownContent(before + '**' + text.substring(start, end) + '**' + after);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <span className="font-serif font-black underline">B</span>
                  Negrito
                </button>
                <div className="w-px h-5 bg-slate-100 mx-0.5"></div>
                <button 
                  type="button"
                  onClick={() => {
                     const el = document.getElementById('md-textarea-modal') as HTMLTextAreaElement;
                     const start = el.selectionStart;
                     const end = el.selectionEnd;
                     const text = markdownContent;
                     const before = text.substring(0, start);
                     const after = text.substring(end);
                     setMarkdownContent(before + '- ' + text.substring(start, end) + after);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all flex items-center gap-2"
                >
                  <div className="w-3 h-3 border-2 border-slate-400 rounded-full"></div>
                  Lista
                </button>
              </div>

              <div className="ml-auto flex items-center gap-3 text-[10px] font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
                <Icons.Info className="w-3.5 h-3.5 text-sky-500" />
                <span>O Markdown será processado como texto puro para a IA</span>
              </div>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-white flex justify-center custom-scrollbar">
              <div className="w-full max-w-3xl py-12 px-10">
                <textarea 
                  id="md-textarea-modal"
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full h-full min-h-[500px] resize-none focus:outline-none text-lg font-sans leading-relaxed text-slate-700 placeholder:text-slate-300"
                  placeholder="Comece a escrever seu guia ou documentação aqui..."
                  style={{ whiteSpace: 'pre-wrap' }}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between bg-white">
              <span className="text-[11px] font-medium text-slate-400">Conteúdo salvo localmente • v{editingDoc.version || 1}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMarkdownEditorOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Descartar
                </button>
                <button 
                  onClick={() => {
                    onUpdateResource({
                      ...editingDoc,
                      prompt: markdownContent,
                      updatedAt: new Date().toISOString(),
                      version: (editingDoc.version || 0) + 1
                    });
                    setIsMarkdownEditorOpen(false);
                  }}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-100 transition-all flex items-center gap-2"
                >
                  <Icons.Check className="w-4 h-4" />
                  Salvar Documento
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreateResourcePage;
