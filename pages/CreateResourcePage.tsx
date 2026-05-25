
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
  
  // Collapsible section states to prevent scrolling
  const [isTypeExpanded, setIsTypeExpanded] = useState(isEditing);
  const [isProjectExpanded, setIsProjectExpanded] = useState(isEditing);
  const [isTitleExpanded, setIsTitleExpanded] = useState(isEditing);
  const [isContextExpanded, setIsContextExpanded] = useState(isEditing);
  const [isModelExpanded, setIsModelExpanded] = useState(isEditing);
  const [isPromptExpanded, setIsPromptExpanded] = useState(isEditing);
  const [isWebhookExpanded, setIsWebhookExpanded] = useState(isEditing && !!editingResource?.webhookUrl);
  const [isExportExpanded, setIsExportExpanded] = useState(isEditing);
  const [isRagExpanded, setIsRagExpanded] = useState(isEditing && !!editingResource?.linkedDocs?.length);
  const [isArquiteturaExpanded, setIsArquiteturaExpanded] = useState(isEditing);
  const [isVetorizacaoExpanded, setIsVetorizacaoExpanded] = useState(isEditing);
  const [isSkillExpanded, setIsSkillExpanded] = useState(isEditing);

  // Skill File State
  const [skillFile, setSkillFile] = useState<{ name: string; size: string; type: string; content?: string } | null>(null);
  const skillFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isEditingSkillCode, setIsEditingSkillCode] = useState(false);
  const [editedSkillCode, setEditedSkillCode] = useState('');

  const handleStartEditingSkill = () => {
    if (skillFile) {
      setEditedSkillCode(skillFile.content || '');
      setIsEditingSkillCode(true);
    }
  };

  const handleSaveSkillCode = () => {
    if (skillFile) {
      setSkillFile({
        ...skillFile,
        content: editedSkillCode
      });
      setIsEditingSkillCode(false);
    }
  };

  const handleSkillFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      setSkillFile({
        name: file.name,
        size: formattedSize,
        type: file.type || 'text/plain',
        content: content
      });
      if (!name) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
    };
    reader.readAsText(file);

    if (e.target) e.target.value = '';
  };

  // Pagination for Documents
  const [docPage, setDocPage] = useState(1);
  const docsPerPage = 3; 

  // Markdown Editor States
  const [editingDoc, setEditingDoc] = useState<Resource | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isMarkdownEditorOpen, setIsMarkdownEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<'editor' | 'preview'>('editor');
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

      // Se for SKILL, tenta carregar o arquivo associado
      if (editingResource.type === ResourceType.SKILL && editingResource.prompt) {
        try {
          const parsed = JSON.parse(editingResource.prompt);
          if (parsed && parsed.fileName) {
            setSkillFile({
              name: parsed.fileName,
              size: parsed.fileSize,
              type: parsed.fileType,
              content: parsed.fileContent
            });
          }
        } catch (e) {
          // fallback se for um script puro
          setSkillFile({
            name: `${editingResource.name}.js`,
            size: 'N/A',
            type: 'application/javascript',
            content: editingResource.prompt
          });
        }
      }
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

    if (createType === ResourceType.SKILL && !skillFile) {
      alert("Por favor, carregue o arquivo de código da Skill antes de publicar.");
      return;
    }

    const finalName = createType === ResourceType.SKILL 
      ? (skillFile ? (skillFile.name.substring(0, skillFile.name.lastIndexOf('.')) || skillFile.name) : 'Nova Skill')
      : name;

    const finalDescription = createType === ResourceType.SKILL
      ? (description || (skillFile ? `Código carregado para a skill: ${skillFile.name}` : 'Procedimento ou script de skill customizada.'))
      : description;

    const finalProjectId = createType === ResourceType.SKILL && !projectId
      ? (projects[0]?.id || 'p1')
      : projectId;

    const finalizedPrompt = createType === ResourceType.SKILL && skillFile
      ? JSON.stringify({
          fileName: skillFile.name,
          fileSize: skillFile.size,
          fileType: skillFile.type,
          fileContent: skillFile.content || ''
        })
      : prompt;

    if (isEditing && editingResource) {
      onUpdateResource({
        ...editingResource,
        name: finalName,
        description: finalDescription,
        projectId: finalProjectId,
        type: createType,
        agentType: [ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) ? agentType : undefined,
        requiredRole,
        prompt: finalizedPrompt,
        model,
        webhookUrl,
        webhookHeaders,
        webhookBody,
        linkedDocs
      });
    } else {
      onCreateResource({
        name: finalName,
        description: finalDescription,
        projectId: finalProjectId,
        type: createType,
        agentType: [ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) ? agentType : undefined,
        requiredRole,
        prompt: finalizedPrompt,
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
        <div className="max-w-[1850px] mx-auto flex items-center justify-between">
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
        <div className="max-w-[1850px] mx-auto px-12 py-10">
          <div className="space-y-8">
              
              {/* Seção 1: Identidade */}
              <div className="grid grid-cols-1 gap-6">
                <div className={createType !== ResourceType.SKILL ? "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" : "grid grid-cols-1 gap-6 items-start"}>
                  
                  {/* ACCORDION ROADMAP / CORE ENGINE TYPE */}
                  <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                    <button
                      type="button"
                      onClick={() => setIsTypeExpanded(!isTypeExpanded)}
                      className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                          <Icons.Workflow className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Tipo de Core Engine</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Selecione o modelo operacional</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight">
                          {createType === ResourceType.AUTOMATION ? 'Automação' :
                           createType === ResourceType.AGENT ? 'Agente' :
                           createType === ResourceType.ASSISTANT ? 'Assistente' : 'Skill'}
                        </span>
                        <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isTypeExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isTypeExpanded && (
                      <div className="p-6 border-t border-slate-100 space-y-4">
                        <div className="relative">
                          <select 
                            value={createType} 
                            onChange={e => setCreateType(e.target.value as ResourceType)} 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 bg-white text-sm font-semibold text-slate-800 appearance-none transition-all cursor-pointer"
                          >
                            <option value={ResourceType.AUTOMATION}>Automação</option>
                            <option value={ResourceType.AGENT}>Agente Autônomo</option>
                            <option value={ResourceType.ASSISTANT}>Assistente Cognitivo</option>
                            <option value={ResourceType.SKILL}>Skill / Código Customizado</option>
                          </select>
                          <Icons.ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>

                  {createType !== ResourceType.SKILL && (
                    <>
                      {/* ACCORDION STRATEGIC PROJECT LINK */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsProjectExpanded(!isProjectExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                              <Icons.Lab className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Projeto Estratégico</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Vincule a uma iniciativa</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 max-w-[150px] md:max-w-[200px]">
                            <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight truncate block max-w-full">
                              {projects.find(p => p.id === projectId)?.title || 'Sem Vínculo'}
                            </span>
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isProjectExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isProjectExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-4">
                            <div className="relative">
                              <select 
                                required={createType !== ResourceType.SKILL} 
                                value={projectId} 
                                onChange={e => setProjectId(e.target.value)} 
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 bg-white text-sm font-semibold text-slate-800 appearance-none transition-all cursor-pointer"
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
                        )}
                      </div>

                      {/* ACCORDION RESOURCE TITLE */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                              <Icons.Edit className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Título do Recurso</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Nome claro e objetivo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 max-w-[150px] md:max-w-[200px]">
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight truncate block max-w-full">
                              {name.trim() ? name : 'Sem Nome'}
                            </span>
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isTitleExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isTitleExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-4">
                            <input 
                              required={createType !== ResourceType.SKILL} 
                              value={name} 
                              onChange={e => setName(e.target.value)} 
                              type="text" 
                              placeholder="Ex: Engine de Triagem Fiscal" 
                              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-sm font-semibold text-slate-800 transition-all" 
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                  {createType !== ResourceType.SKILL && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-6">
                      {/* ACCORDION: Contexto de Negócio & Finalidade */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsContextExpanded(!isContextExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                              <Icons.Documentation className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Contexto de Negócio & Finalidade</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Descreva o propósito deste recurso, que problemas ele resolve e qual seu público-alvo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {description.trim() && (
                              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Definido</span>
                            )}
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isContextExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isContextExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-4">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA: Otimizar ou Descrever</label>
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
                              required={createType !== ResourceType.SKILL} 
                              value={description} 
                              onChange={e => setDescription(e.target.value)} 
                              placeholder="Descreva o propósito deste recurso, que problemas ele resolve e qual seu público-alvo..." 
                              className="w-full px-5 py-[16px] min-h-[100px] rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-sm font-semibold text-slate-800 transition-all resize-y"
                            ></textarea>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION: Modelo (Engine) */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsModelExpanded(!isModelExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                              <Icons.Cpu className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Modelo (Engine)</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Selecione a inteligência artificial (LLM) que irá reprocessar as requisições deste recurso</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight">{model}</span>
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isModelExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isModelExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-4">
                            <div className="relative">
                              <select 
                                value={model} 
                                onChange={e => setModel(e.target.value)}
                                className="w-full px-5 py-[18px] rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white text-sm font-semibold text-slate-800 appearance-none transition-all cursor-pointer"
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
                              <Icons.ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Seção 2: Inteligência (Se Skill / Habilidade) */}
              {createType === ResourceType.SKILL && (
                <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm border-t-4 border-t-fuchsia-500 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsSkillExpanded(!isSkillExpanded)}
                    className="w-full flex items-center justify-between p-8 bg-slate-50/35 hover:bg-slate-50/60 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                        <Icons.Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-850 tracking-tight">Configuração & Código da Skill</h2>
                        <p className="text-xs text-slate-500 font-semibold">Suba e gerencie o arquivo de script ou definição da sua skill</p>
                      </div>
                    </div>
                    <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSkillExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isSkillExpanded && (
                    <div className="p-8 border-t border-slate-100 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <span>Arquivo de Skill / Código de Execução</span>
                        <span className="text-[10px] bg-fuchsia-50 text-fuchsia-600 px-1.5 py-0.5 rounded font-black lowercase tracking-widest leading-none">Obrigatório</span>
                      </label>
                      
                      {!skillFile ? (
                        <div 
                          onClick={() => skillFileInputRef.current?.click()}
                          className="border-3 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400 hover:border-fuchsia-300 hover:bg-fuchsia-50/20 transition-all cursor-pointer group bg-slate-50/20 hover:scale-[0.99] duration-300"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100 shadow-sm text-fuchsia-400">
                            <Icons.Upload className="w-8 h-8 group-hover:text-fuchsia-600" />
                          </div>
                          <div className="text-sm font-bold text-slate-700 mb-1">Selecionar arquivo de código</div>
                          <div className="text-xs text-slate-400">Arraste ou clique para fazer upload de JS, PY, JSON, YAML ou ZIP (Max 20MB)</div>
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 p-6 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center shrink-0">
                                <Icons.Terminal className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-800">{skillFile.name}</div>
                                <div className="text-xs text-slate-400 font-semibold">{skillFile.size} • {skillFile.type || 'Ficheiro de Skill'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {!isEditingSkillCode ? (
                                <button
                                  type="button"
                                  onClick={handleStartEditingSkill}
                                  className="px-4 py-2 text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 border border-fuchsia-100 rounded-xl transition-all"
                                >
                                  Editar Código
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleSaveSkillCode}
                                    className="px-4 py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-all animate-pulse"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsEditingSkillCode(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSkillFile(null);
                                  setIsEditingSkillCode(false);
                                }}
                                className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all"
                              >
                                Remover Arquivo
                              </button>
                            </div>
                          </div>

                          {skillFile.content !== undefined && (
                            <div className="space-y-2 text-left">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                                <span>Conteúdo / Código da Skill</span>
                                {isEditingSkillCode && (
                                  <span className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-wider animate-pulse">modo edição ativo</span>
                                )}
                              </div>
                              
                              {isEditingSkillCode ? (
                                <textarea
                                  value={editedSkillCode}
                                  onChange={(e) => setEditedSkillCode(e.target.value)}
                                  className="w-full h-80 rounded-2xl border border-slate-200 bg-slate-950 p-5 font-mono text-xs text-slate-350 leading-relaxed focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 scrollbar-thin resize-none"
                                  placeholder="Escreva ou edite o código de script da sua skill aqui..."
                                />
                              ) : (
                                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-950 p-5 font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
                                  <pre className="whitespace-pre-wrap">{skillFile.content}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <input 
                        type="file" 
                        ref={skillFileInputRef} 
                        onChange={handleSkillFileUpload} 
                        className="hidden" 
                        accept=".js,.py,.json,.yaml,.yml,.txt,.zip"
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

              {/* Seção 2: Inteligência */}
              {[ResourceType.AGENT, ResourceType.ASSISTANT, ResourceType.AUTOMATION].includes(createType) && (
                <div className="space-y-8">

                     {/* ACCORDION: System Prompt & Diretrizes Operacionais */}
                     <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                       <button
                         type="button"
                         onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                         className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                             <Icons.MessageSquare className="w-5 h-5" />
                           </div>
                           <div>
                             <h3 className="text-sm font-bold text-slate-800">System Prompt & Diretrizes Operacionais</h3>
                             <p className="text-[11px] text-slate-500 font-medium">Defina as diretrizes operacionais, restrições e comportamento da inteligência artificial</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           {prompt.trim() && (
                             <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Configurado</span>
                           )}
                           <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPromptExpanded ? 'rotate-180' : ''}`} />
                         </div>
                       </button>

                       {isPromptExpanded && (
                         <div className="p-6 border-t border-slate-100 space-y-4">
                           <div className="flex items-center justify-between px-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prompt de Instruções</label>
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
                             rows={8} 
                             placeholder="Ex: Você é um assistente sênior da Zucchetti especialista em..." 
                             className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-mono leading-relaxed transition-all bg-slate-900 text-slate-300 selection:bg-indigo-500/30"
                           ></textarea>
                         </div>
                       )}
                     </div>

                    {/* ACCORDION SIDE-BY-SIDE SIDE PANEL */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* ACCORDION 1: Integrar Recurso Externo */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsWebhookExpanded(!isWebhookExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm">
                              <Icons.ArrowRight className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Integrar Recurso Externo</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Configure o envio automatizado de dados (webhook pós-execução) para as suas APIs ou sistemas legados</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {webhookUrl && (
                              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight">Ativo</span>
                            )}
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isWebhookExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isWebhookExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-6">
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
                                  rows={3}
                                  placeholder='{ "message": "{{output}}", "user": "{{user_email}}" }' 
                                  className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 text-xs font-mono bg-white leading-relaxed" 
                                />
                                <div className="flex items-center gap-2 text-[9px] text-slate-500 italic bg-sky-50/50 p-2 rounded-lg border border-sky-100/50 mt-2">
                                  <Icons.Info className="w-3 h-3 text-sky-500 shrink-0" />
                                  <span>Use <strong>{"{{output}}"}</strong> para injetar a resposta da IA e <strong>{"{{user_email}}"}</strong> para o email do solicitante.</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 1.5: Expor Recurso */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all">
                        <button
                          type="button"
                          onClick={() => setIsExportExpanded(!isExportExpanded)}
                          className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                              <Icons.Download className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">Expor Recurso</h3>
                              <p className="text-[11px] text-slate-500 font-medium">Consuma a inteligência deste recurso de IA a partir de qualquer software via chamada de API segura</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isEditing && (
                              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase tracking-tight border border-green-100">Ativo</span>
                            )}
                            <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExportExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isExportExpanded && (
                          <div className="p-6 border-t border-slate-100 space-y-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL de Integração (Endpoint Automático)</label>
                              <div className="flex gap-2">
                                <div className="flex-1 px-4 py-3 bg-white text-[10px] font-mono text-sky-700 truncate select-all rounded-xl border border-sky-100 flex items-center">
                                  https://zia.zucchetti.com.br/api/webhook/v1/{isEditing ? editingResource?.id : 'recurso-novo'}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://zia.zucchetti.com.br/api/webhook/v1/${isEditing ? editingResource?.id : 'recurso-novo'}`);
                                    alert('URL copiada para a área de transferência!');
                                  }}
                                  className="px-4 py-2 bg-white border border-sky-200 text-sky-600 rounded-xl hover:bg-sky-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold shrink-0"
                                >
                                  <Icons.Copy className="w-3.5 h-3.5" />
                                  Copiar
                                </button>
                              </div>
                            </div>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed italic">
                              Este recurso será exposto como um endpoint seguro que aceita payloads via <strong>POST</strong>. 
                              As instruções de autenticação estarão disponíveis na aba de gestão de acessos.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACCORDION 2: Base de Conhecimento (RAG) */}
                    <div className="col-span-full border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all mt-6">
                      <button
                        type="button"
                        onClick={() => setIsRagExpanded(!isRagExpanded)}
                        className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-amber-600 shadow-sm">
                            <Icons.Database className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">Base de Conhecimento (RAG & Fontes Adicionais)</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Vincule documentos para que a IA utilize como fonte de verdade exclusiva</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {linkedDocs.length > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-tight">{linkedDocs.length} {linkedDocs.length === 1 ? 'doc' : 'docs'} vinculados</span>
                          )}
                          <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isRagExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isRagExpanded && (
                        <div className="p-6 border-t border-slate-100 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="text-xs text-slate-400 font-semibold">Selecione quais fontes de conhecimento este agente tem acesso durante a consulta.</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-all bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-100 shrink-0 self-start sm:self-auto"
                            >
                              <Icons.Upload className="w-4 h-4" />
                              <span>Treinar com novo documento</span>
                            </button>
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
                                  <div className="col-span-full p-10 rounded-[24px] border-2 border-dashed border-slate-100 text-center bg-slate-50/25">
                                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-3">
                                      <Icons.Database className="w-6 h-6" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-650">Nenhum documento vinculado ao projeto</div>
                                    <div className="text-[11px] text-slate-400 mt-1">Carregue manuais, bases de conhecimento ou CSVs para alimentar esta IA.</div>
                                  </div>
                                );
                              }

                              return (
                                <>
                                  {paginatedDocs.map(doc => {
                                    const isOwner = doc.creatorId === user.id || user.role === UserRole.ADMINISTRATOR;
                                    return (
                                      <div key={doc.id} className={`group relative flex flex-col gap-4 p-5 rounded-[20px] border transition-all ${linkedDocs.includes(doc.id) ? 'bg-sky-50/40 border-sky-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                        <div className="flex items-start gap-4">
                                          <div className="relative flex items-center justify-center h-5 w-5 shrink-0 mt-0.5">
                                            <input 
                                              type="checkbox" 
                                              checked={linkedDocs.includes(doc.id)}
                                              onChange={(e) => {
                                                if (e.target.checked) setLinkedDocs(prev => [...prev, doc.id]);
                                                else setLinkedDocs(prev => prev.filter(id => id !== doc.id));
                                              }}
                                              className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
                                            />
                                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${linkedDocs.includes(doc.id) ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-200 peer-hover:border-slate-300'}`}>
                                              {linkedDocs.includes(doc.id) && <Icons.Check className="w-3 h-3 text-white" />}
                                            </div>
                                          </div>
                                          
                                          <div className="flex-1 min-w-0 pr-6">
                                            <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-2">
                                              {doc.name}
                                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-bold rounded uppercase tracking-tighter shrink-0">Markdown</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">{doc.description}</div>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                                          <div className="flex items-center gap-3">
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">v{doc.version || 1}</div>
                                            <div className="text-[9px] text-slate-400 font-medium font-semibold">Ativo em RAG</div>
                                          </div>
                                          <div className="flex items-center gap-0.5">
                                            {isOwner && (
                                              <>
                                                <button 
                                                  type="button"
                                                  onClick={() => {
                                                    setEditingDoc(doc);
                                                    setMarkdownContent(doc.prompt || '');
                                                    setIsMarkdownEditorOpen(true);
                                                  }}
                                                  className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                  title="Editar Conteúdo"
                                                >
                                                  <Icons.Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                  type="button"
                                                  onClick={() => {
                                                    if (confirm('Deseja excluir esta base de conhecimento permanentemente?')) {
                                                      onDeleteResource(doc.id);
                                                    }
                                                  }}
                                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                  title="Excluir"
                                                >
                                                  <Icons.Trash className="w-3.5 h-3.5" />
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
                                    <div className="col-span-full flex items-center justify-between px-5 py-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                      <div className="text-[11px] text-slate-500 font-medium">
                                        Mostrando {(docPage - 1) * docsPerPage + 1}-{Math.min(docPage * docsPerPage, totalDocs)} de {totalDocs} documentos
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button 
                                          type="button"
                                          disabled={docPage === 1}
                                          onClick={() => setDocPage(prev => prev - 1)}
                                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                        >
                                          <Icons.ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                          <button
                                            key={i}
                                            type="button"
                                            onClick={() => setDocPage(i + 1)}
                                            className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${docPage === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-200 text-slate-500'}`}
                                          >
                                            {i + 1}
                                          </button>
                                        ))}
                                        <button 
                                          type="button"
                                          disabled={docPage === totalPages}
                                          onClick={() => setDocPage(prev => prev + 1)}
                                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                        >
                                          <Icons.ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Seção 2: Vetorização (Se Documentação) */}
              {createType === ResourceType.DOCUMENTATION && (
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsVetorizacaoExpanded(!isVetorizacaoExpanded)}
                    className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                        <Icons.Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Conteúdo & Vetorização</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Suba e gerencie arquivos para indexar no recurso</p>
                      </div>
                    </div>
                    <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isVetorizacaoExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isVetorizacaoExpanded && (
                    <div className="p-6 border-t border-slate-100 space-y-6">
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
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>

      {/* Markdown Editor Modal */}
      {isMarkdownEditorOpen && editingDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-6xl h-[88vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm border border-sky-100/50">
                  <span className="text-2xl">📘</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Editor de Documentação</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{editingDoc.name}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-medium text-slate-400">Editor Visual Notion para Treinamento de IA</span>
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

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden bg-slate-50">
              {/* Notion Paper Workspace */}
              <div className="flex-1 overflow-y-auto p-10 flex justify-center custom-scrollbar">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl min-h-[550px] border border-slate-200 relative overflow-hidden flex flex-col p-12 text-left">
                  {/* Notion Page Cover Accent */}
                  <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-sky-400/10 via-sky-300/5 to-indigo-400/10 border-b border-slate-100"></div>
                  
                  <div className="pt-20 flex-1 flex flex-col">


                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
                      {editingDoc.name}
                    </h1>

                    <textarea 
                      id="md-textarea-modal"
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      className="w-full flex-1 min-h-[350px] resize-none focus:outline-none text-base font-sans leading-relaxed text-slate-700 placeholder:text-slate-350 bg-transparent"
                      placeholder="Comece a digitar para formatar seus títulos, listas e diretrizes de IA..."
                      style={{ whiteSpace: 'pre-wrap' }}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white shadow-lg shadow-slate-100">
              <span className="text-[11px] font-medium text-slate-400">Página editável • Versão local v{editingDoc.version || 1} • Compatível com Inteligência Artificial</span>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsMarkdownEditorOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all font-sans"
                >
                  Descartar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onUpdateResource({
                      ...editingDoc,
                      prompt: markdownContent,
                      updatedAt: new Date().toISOString(),
                      version: (editingDoc.version || 0) + 1
                    });
                    setIsMarkdownEditorOpen(false);
                  }}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-100 transition-all flex items-center gap-2 font-sans"
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
