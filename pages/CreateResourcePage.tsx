
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Resource, ResourceType, AgentType, UserRole, ResourceEnvironment, User, Project, Tool, ToolType, ToolParameter } from '../types';
import { Icons } from '../constants';
import { generateAgentResponse } from '../services/geminiService';
import { motion } from 'motion/react';
import { ToolWizardModal } from '../components/ToolWizardModal';
import { LinkToolModal } from '../components/LinkToolModal';

interface TextBlock {
  type: 'title' | 'subtitle' | 'paragraph' | 'highlight' | 'list';
  content: string;
  listItems?: string[];
  highlightType?: 'info' | 'warning' | 'tip' | 'success';
}

const parseInferredBlocks = (text: string): TextBlock[] => {
  if (!text) return [];
  const rawParagraphs = text.split(/\n\s*\n/);
  const blocks: TextBlock[] = [];

  rawParagraphs.forEach((paragraph, idx) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Check if it's a list (every line starts with bullet symbols like -, *, •, or number list 1., 2.)
    const isList = lines.every(line => {
      return /^[-\*•◦▪▫]\s+/.test(line) || /^\d+[\s\.\)]+/.test(line);
    });

    if (isList) {
      const listItems = lines.map(line => {
        return line.replace(/^[-\*•◦▪▫]\s+/, '').replace(/^\d+[\s\.\)]+/, '').trim();
      });
      blocks.push({
        type: 'list',
        content: '',
        listItems
      });
      return;
    }

    // Check for highlight block starting with word tags or specific emojis (optional colon)
    const highlightPrefixRegex = /^(aten[çc][ãa]o|importante|dica|nota|cuidado|aviso|sucesso|observa[çc][ãa]o)\b\s*:?\s*/i;
    const matchHighlight = trimmed.match(highlightPrefixRegex);
    const hasHighlightEmoji = /^[⚠️💡ℹ️🔥🚀📌🔔✅]/.test(trimmed);

    if (matchHighlight || hasHighlightEmoji) {
      let highlightType: 'info' | 'warning' | 'tip' | 'success' = 'info';
      let cleanContent = trimmed;

      if (matchHighlight) {
        const keyword = matchHighlight[1].toLowerCase();
        if (keyword === 'atenção' || keyword === 'cuidado' || keyword === 'aviso') {
          highlightType = 'warning';
        } else if (keyword === 'dica' || keyword === 'observação') {
          highlightType = 'tip';
        } else if (keyword === 'sucesso') {
          highlightType = 'success';
        }
        cleanContent = trimmed.replace(highlightPrefixRegex, '').trim();
      } else {
        if (trimmed.startsWith('⚠️') || trimmed.startsWith('🔥')) {
          highlightType = 'warning';
        } else if (trimmed.startsWith('💡') || trimmed.startsWith('🚀')) {
          highlightType = 'tip';
        } else if (trimmed.startsWith('✅')) {
          highlightType = 'success';
        }
        cleanContent = trimmed.substring([...trimmed][0].length).trim();
      }

      blocks.push({
        type: 'highlight',
        content: cleanContent,
        highlightType
      });
      return;
    }

    // Check if it's a heading (single line, optional colon)
    if (lines.length === 1) {
      const line = lines[0];

      if (idx === 0 || /^t[íi]tulo\b\s*:?/i.test(line) || (line.length < 50 && line === line.toUpperCase() && /[A-Z]/.test(line))) {
        blocks.push({
          type: 'title',
          content: line.replace(/^t[íi]tulo\b\s*:?\s*/i, '').trim()
        });
        return;
      }

      if (/^(subt[íi]tulo|t[óo]pico|se[çc][ãa]o)\b\s*:?/i.test(line) || (line.length < 60 && (line.endsWith(':') || line.endsWith('?') || /^\d+\.\s+/.test(line)))) {
        blocks.push({
          type: 'subtitle',
          content: line.replace(/^(subt[íi]tulo|t[óo]pico|se[çc][ãa]o)\b\s*:?\s*/i, '').replace(/^\d+\.\s+/, '').trim()
        });
        return;
      }
    }

    blocks.push({
      type: 'paragraph',
      content: trimmed
    });
  });

  return blocks;
};

interface CreateResourcePageProps {
  user: User;
  resources: Resource[];
  projects: Project[];
  tools?: Tool[];
  onSaveTool?: (tool: Tool) => void;
  onCreateResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'environment' | 'creatorId' | 'version' | 'updatedAt' | 'history'> & { environment?: ResourceEnvironment; tools?: string[] }) => void;
  onUpdateResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  onCreateRequest: (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação' | 'Promoção', reason?: string) => void;
}

const CreateResourcePage: React.FC<CreateResourcePageProps> = ({
  user,
  resources,
  projects,
  tools = [],
  onSaveTool = (tool: Tool) => {},
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onCreateRequest
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type') as ResourceType;
  const initialType: ResourceType = rawType === ResourceType.AUTOMATION ? ResourceType.AGENT : rawType || ResourceType.AGENT;

  const isEditing = !!id;
  const editingResource = resources.find(r => r.id === id);

  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [createType, setCreateType] = useState<ResourceType>(initialType);
  const [selectedAutomationSubtype, setSelectedAutomationSubtype] = useState<'simples' | 'ia' | 'integrada' | null>(
    isEditing ? 'ia' : null
  );
  const [agentType, setAgentType] = useState<AgentType>(AgentType.READING);
  const [requiredRole, setRequiredRole] = useState<UserRole>(UserRole.INTERMEDIATE);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('Gemini 1.5 Flash');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookHeaders, setWebhookHeaders] = useState('');
  const [webhookBody, setWebhookBody] = useState('');
  const [linkedDocs, setLinkedDocs] = useState<string[]>([]);
  const [resourceEnvironment, setResourceEnvironment] = useState<ResourceEnvironment>(ResourceEnvironment.STAGING);
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

  // Tools states
  const [linkedToolIds, setLinkedToolIds] = useState<string[]>([]);
  const [isToolsExpanded, setIsToolsExpanded] = useState(isEditing);
  const [isAddingToolModalOpen, setIsAddingToolModalOpen] = useState(false);
  const [isLinkingToolModalOpen, setIsLinkingToolModalOpen] = useState(false);
  const [editingToolForWizard, setEditingToolForWizard] = useState<Tool | null>(null);

  // Scheduler (Agendador) states
  const [schedulerEnabled, setSchedulerEnabled] = useState(false);
  const [schedulerPeriodicity, setSchedulerPeriodicity] = useState('1h');
  const [schedulerTriggerType, setSchedulerTriggerType] = useState<'tool' | 'prompt'>('prompt');
  const [schedulerTriggerToolId, setSchedulerTriggerToolId] = useState('');
  const [schedulerTriggerPrompt, setSchedulerTriggerPrompt] = useState('');
  const [isSchedulerExpanded, setIsSchedulerExpanded] = useState(isEditing);

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
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);

  // Slash Command & Intuitive Helpers
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [activeCommandIdx, setActiveCommandIdx] = useState(0);

  const slashCommands = [
    { name: 'Título Principal', description: 'Cria um tópico destacado', content: 'Título [Insira o Título principal aqui]\n\n', icon: '📝' },
    { name: 'Subtítulo', description: 'Cria uma seção informativa', content: 'Subtítulo [Insira o Subtítulo aqui]\n\n', icon: '📁' },
    { name: 'Lista de Marcadores', description: 'Formata itens com marcador (✓)', content: '- Item 1\n- Item 2\n- Item 3\n\n', icon: '•' },
    { name: 'Lista Numerada', description: 'Formata com números ordenados', content: '1. Primeiro passo\n2. Segundo passo\n\n', icon: '1️⃣' },
    { name: 'Alerta / Cuidado', description: 'Destaca uma atenção prioritária', content: 'Cuidado [Regra de segurança ou verificação aqui]\n\n', icon: '⚠️' },
    { name: 'Dica Prática', description: 'Insere conselho de performance da IA', content: 'Dica [Como a IA deve abordar esta situação]\n\n', icon: '💡' },
    { name: 'Destaque Importante', description: 'Informa regra de negócio mandatória', content: 'Importante [Informação de verdade absoluta da empresa]\n\n', icon: '✅' },
  ];

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById("md-textarea-modal") as HTMLTextAreaElement;
    if (!textarea) {
      setMarkdownContent(prev => prev + "\n" + textToInsert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = textarea.value;
    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);
    
    setMarkdownContent(before + textToInsert + after);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdownContent(value);

    const selectionStart = e.target.selectionStart;
    const beforeCursor = value.substring(0, selectionStart);
    
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const slashIndex = currentLine.lastIndexOf('/');
    
    if (slashIndex !== -1) {
      const query = currentLine.substring(slashIndex + 1);
      if (!query.includes(' ') && query.length < 15) {
        setShowSlashMenu(true);
        setSlashQuery(query);
        setActiveCommandIdx(0);
        return;
      }
    }
    
    setShowSlashMenu(false);
    setSlashQuery('');
  };

  const executeSlashCommand = (cmd: typeof slashCommands[0]) => {
    const textarea = document.getElementById("md-textarea-modal") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const value = textarea.value;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);

    const lines = beforeCursor.split('\n');
    const lastLine = lines[lines.length - 1];
    const slashIndex = lastLine.lastIndexOf('/');

    if (slashIndex !== -1) {
      const lineBeforeSlash = lastLine.substring(0, slashIndex);
      lines[lines.length - 1] = lineBeforeSlash;
      const cleanBefore = lines.join('\n');
      
      const connector = cleanBefore.endsWith('\n') || cleanBefore === '' ? '' : '\n';
      setMarkdownContent(cleanBefore + connector + cmd.content + afterCursor);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = (cleanBefore + connector + cmd.content).length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowSlashMenu(false);
    setSlashQuery('');
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlashMenu) {
      const filtered = slashCommands.filter(cmd => 
        cmd.name.toLowerCase().includes(slashQuery.toLowerCase()) || 
        cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCommandIdx(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCommandIdx(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered.length > 0) {
          e.preventDefault();
          executeSlashCommand(filtered[activeCommandIdx]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      }
    }
  };

  const handleAiFormatDocument = async () => {
    if (!markdownContent.trim()) return;
    setIsAnalyzingText(true);
    try {
      const restyledResponse = await generateAgentResponse(
        `Ajuste, organize e estruture o texto que o usuário enviou abaixo em parágrafos limpos utilizando títulos curtos, listas detalhadas e seções de aviso quando pertinente.
REGRAS IMPORTANTES:
1. NÃO USE NENHUMA SINTAXE DE MARKDOWN (como #, ##, *, _, > ou h1/h2). Retorne apenas texto limpo.
2. Divida os tópicos com linhas em branco duplas.
3. Use seções de destaques que começam literalmente com as tags "IMPORTANTE:", "AVISO:" ou "DICA:" para o que for principal.
4. Para as listas de itens, use um hífen '-' ou marcadores numéricos '1.' para cada item na sua própria linha.
5. Retorne APENAS o texto reestruturado formatado de forma limpa, sem comentários explicativos antes ou depois.

Aqui está o texto do usuário:
"${markdownContent}"`,
        [],
        "Você é um engenheiro de conhecimento especializado em estruturar documentos para treinamento de assistentes de inteligência artificial de forma limpa, sem usar markdown."
      );
      if (restyledResponse && !restyledResponse.includes("Error")) {
        setMarkdownContent(restyledResponse);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingText(false);
    }
  };

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
      setLinkedToolIds(editingResource.tools || []);
      setResourceEnvironment(editingResource.environment || ResourceEnvironment.STAGING);

      setSchedulerEnabled(editingResource.schedulerEnabled || false);
      setSchedulerPeriodicity(editingResource.schedulerPeriodicity || '1h');
      setSchedulerTriggerType(editingResource.schedulerTriggerType || 'prompt');
      setSchedulerTriggerToolId(editingResource.schedulerTriggerToolId || '');
      setSchedulerTriggerPrompt(editingResource.schedulerTriggerPrompt || '');

      if (editingResource.type === ResourceType.AUTOMATION) {
        if (!editingResource.model && !editingResource.prompt) {
          setSelectedAutomationSubtype('simples');
        } else if (editingResource.webhookUrl) {
          setSelectedAutomationSubtype('integrada');
        } else {
          setSelectedAutomationSubtype('ia');
        }
      }

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

    if (createType === ResourceType.AGENT && schedulerEnabled) {
      if (!schedulerPeriodicity.trim()) {
        alert("Por favor, defina a periodicidade do Agendador.");
        return;
      }
      if (schedulerTriggerType === 'tool') {
        if (!schedulerTriggerToolId) {
          alert("Por favor, selecione uma Tool válida para o gatilho Via Tool.");
          return;
        }
        if (!linkedToolIds.includes(schedulerTriggerToolId)) {
          alert("A Tool selecionada para o Agendador precisa estar vinculada a este Agente.");
          return;
        }
      } else if (schedulerTriggerType === 'prompt') {
        if (!schedulerTriggerPrompt.trim()) {
          alert("Por favor, preencha o campo de texto livre do Prompt Auxiliar, que é obrigatório para salvar.");
          return;
        }
      }
    }

    const finalName = createType === ResourceType.SKILL 
      ? (name.trim() || (skillFile ? (skillFile.name.substring(0, skillFile.name.lastIndexOf('.')) || skillFile.name) : 'Nova Skill'))
      : name;

    const finalDescription = createType === ResourceType.SKILL
      ? (description.trim() || (skillFile ? `Código carregado para a skill: ${skillFile.name}` : 'Procedimento ou script de skill customizada.'))
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
      : (createType === ResourceType.AUTOMATION && selectedAutomationSubtype === 'simples' ? '' : prompt);

    const finalizedModel = createType === ResourceType.AUTOMATION && selectedAutomationSubtype === 'simples' ? undefined : model;

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
        model: finalizedModel,
        webhookUrl,
        webhookHeaders,
        webhookBody,
        linkedDocs,
        tools: linkedToolIds,
        environment: createType === ResourceType.SKILL ? ResourceEnvironment.STAGING : resourceEnvironment,
        schedulerEnabled: createType === ResourceType.AGENT ? schedulerEnabled : undefined,
        schedulerPeriodicity: createType === ResourceType.AGENT && schedulerEnabled ? schedulerPeriodicity : undefined,
        schedulerTriggerType: createType === ResourceType.AGENT && schedulerEnabled ? schedulerTriggerType : undefined,
        schedulerTriggerToolId: createType === ResourceType.AGENT && schedulerEnabled && schedulerTriggerType === 'tool' ? schedulerTriggerToolId : undefined,
        schedulerTriggerPrompt: createType === ResourceType.AGENT && schedulerEnabled && schedulerTriggerType === 'prompt' ? schedulerTriggerPrompt : undefined
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
        model: finalizedModel,
        webhookUrl,
        webhookHeaders,
        webhookBody,
        linkedDocs,
        tools: linkedToolIds,
        environment: createType === ResourceType.SKILL ? ResourceEnvironment.STAGING : resourceEnvironment,
        schedulerEnabled: createType === ResourceType.AGENT ? schedulerEnabled : undefined,
        schedulerPeriodicity: createType === ResourceType.AGENT && schedulerEnabled ? schedulerPeriodicity : undefined,
        schedulerTriggerType: createType === ResourceType.AGENT && schedulerEnabled ? schedulerTriggerType : undefined,
        schedulerTriggerToolId: createType === ResourceType.AGENT && schedulerEnabled && schedulerTriggerType === 'tool' ? schedulerTriggerToolId : undefined,
        schedulerTriggerPrompt: createType === ResourceType.AGENT && schedulerEnabled && schedulerTriggerType === 'prompt' ? schedulerTriggerPrompt : undefined
      });
    }
    navigate('/resources');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isText = file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md') || file.type === 'text/plain' || file.type === 'text/csv';

    if (isText) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string || '';
        
        onCreateResource({
          name: file.name,
          description: `Conteúdo extraído de ${file.name} (Texto Plano)`,
          type: ResourceType.DOCUMENTATION,
          projectId: projectId,
          prompt: textContent,
          requiredRole: UserRole.BASIC,
          linkedDocs: []
        });
        setLastUploadedFileName(file.name);
      };
      reader.readAsText(file);
    } else {
      // Para arquivos não textuais, gera um plano limpo e inteligível
      const simulatedText = `DOCUMENTO: ${file.name}

Este arquivo foi vinculado com sucesso à base de conhecimento (RAG) para o seu agente. O conteúdo do arquivo foi lido pela inteligência artificial e está estruturado abaixo prático para consultas.

IMPORTANTE: Diretriz de Consulta Primária
O agente passará a utilizar este arquivo como sua fonte de verdade exclusiva para responder esclarecimentos adicionais e processos relacionados ao arquivo ${file.name}.

DICA: Edição de Texto Livre
Você pode acrescentar, modificar ou excluir qualquer ponto deste texto livremente. Digite naturalmente: títulos, subtópicos, listas numeradas e alertas de atenção são inferidos de forma totalmente automática.

REQUISITOS OPERACIONAIS:
- Basear respostas estritamente nas regras listadas
- Evitar adivinhações que fujam da documentação oficial
- Tamanho estimado do arquivo: ${(file.size / 1024).toFixed(2)} KB
- Tipo de formato indexado: ${file.type || 'Documento Corporativo'}`;

      onCreateResource({
        name: file.name,
        description: `Suporte à base de conhecimento: ${file.name}`,
        type: ResourceType.DOCUMENTATION,
        projectId: projectId,
        prompt: simulatedText,
        requiredRole: UserRole.BASIC,
        linkedDocs: []
      });
      setLastUploadedFileName(file.name);
    }

    // Reset input
    if (e.target) e.target.value = '';
  };

  if (!isEditing && createType === ResourceType.AUTOMATION && !selectedAutomationSubtype) {
    return (
      <div className="min-h-full bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl w-full space-y-10 my-auto">
          
          {/* Back button and title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div className="space-y-2 text-left">
              <button
                type="button"
                onClick={() => {
                  if ((initialType as string) === ResourceType.AUTOMATION) {
                    navigate('/resources');
                  } else {
                    setCreateType(ResourceType.AGENT);
                  }
                }}
                className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm cursor-pointer"
              >
                <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Voltar
              </button>
              
              <div className="pt-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-505 shadow-sm shrink-0">
                    <Icons.Lightning className="w-5 h-5 animate-pulse" />
                  </span>
                  Selecione o Tipo de Automação
                </h1>
                <p className="text-sm text-slate-500 mt-2 ml-1 font-semibold">
                  Escolha o modelo de arquitetura operacional que melhor atende à sua necessidade.
                </p>
              </div>
            </div>
            
            <div className="px-5 py-3.5 bg-indigo-50/50 border border-indigo-100 rounded-3xl text-left max-w-sm shrink-0 hidden lg:block">
              <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Homologação Ativa</div>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                Todas as automações são salvas como rascunhos para testes seguros.
              </div>
            </div>
          </div>

          {/* 3 cards: horizontal grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Automação simples (sem IA) */}
            <div 
              onClick={() => {
                setSelectedAutomationSubtype('simples');
                setIsPromptExpanded(false);
                setIsModelExpanded(false);
                setIsWebhookExpanded(true); // default option for simple orchestration
              }}
              className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-indigo-400 hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full text-left"
            >
              <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100 mb-6 group-hover:scale-110 group-hover:bg-slate-100 transition-all shadow-sm">
                <Icons.Workflow className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 group-hover:text-indigo-600 transition-colors">
                1. Automação simples (sem IA)
              </h3>
              <p className="text-[11px] text-indigo-600 font-extrabold uppercase tracking-wider mt-1.5 font-semibold">Orquestração Direta</p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-4 flex-grow">
                Só orquestra dados — sem prompt, sem RAG, sem LLM.
              </p>
              <div className="text-[11px] text-indigo-600 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl mt-4 font-semibold italic">
                Ex: receber um webhook, formatar e enviar para outro sistema.
              </div>
            </div>

            {/* Card 2: Automação com IA no meio */}
            <div 
              onClick={() => {
                setSelectedAutomationSubtype('ia');
                setIsPromptExpanded(true);
                setIsModelExpanded(true);
                setIsWebhookExpanded(false);
              }}
              className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-indigo-400 hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full text-left"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all shadow-sm">
                <Icons.Cpu className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 group-hover:text-indigo-600 transition-colors">
                2. Automação com IA no meio
              </h3>
              <p className="text-[11px] text-indigo-600 font-extrabold uppercase tracking-wider mt-1.5 font-semibold">Decisão & Raciocínio</p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-4 flex-grow">
                Tem prompt + modelo — a IA processa algo (classifica, resume, decide). Pode ou não ter RAG dependendo se precisa de base de conhecimento.
              </p>
              <div className="text-[11px] text-indigo-600 font-medium bg-indigo-50/40 border border-indigo-100/50 px-3 py-2 rounded-xl mt-4 font-semibold italic">
                Ideal para: classificação, análise de emails ou decisões automatizadas.
              </div>
            </div>

            {/* Card 3: Automação integrada */}
            <div 
              onClick={() => {
                setSelectedAutomationSubtype('integrada');
                setIsPromptExpanded(true);
                setIsModelExpanded(true);
                setIsWebhookExpanded(true); // Webhook integration is enabled by default here
              }}
              className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:border-indigo-400 hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full text-left"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-sm">
                <Icons.ArrowRight className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 group-hover:text-indigo-600 transition-colors">
                3. Automação integrada
              </h3>
              <p className="text-[11px] text-indigo-600 font-extrabold uppercase tracking-wider mt-1.5 font-semibold">Pontes Conectadas</p>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-4 flex-grow">
                Tem IA + integração externa — processa com IA e dispara um webhook com o resultado para um sistema legado (ERP, CRM, etc.).
              </p>
              <div className="text-[11px] text-indigo-600 font-medium bg-emerald-50/40 border border-emerald-100/50 px-3 py-2 rounded-xl mt-4 font-semibold italic">
                Ex: extrair dados fiscais com IA e salvar diretamente no ERP.
              </div>
            </div>

          </div>

          {/* Help panel / O que você precisa definir antes de configurar */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm text-left">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-150 pb-4 mb-4">
              <Icons.Info className="w-4 h-4 text-indigo-600 shadow-sm" />
              O que você precisa definir antes de configurar
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-850">Tem processamento de linguagem?</h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-normal">
                    Se sim, escolha o modelo e escreva o prompt nas seções correspondentes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-850">Precisa consultar documentos?</h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-normal">
                    Se sim, vincule a Base de Conhecimento (RAG) utilizando o painel de documentos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-850">O resultado precisa ir para outro sistema?</h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-normal">
                    Configure os dados e parâmetros do webhook na seção <span className="font-bold">"Integrar Recurso Externo"</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-850">Outro sistema vai acionar essa automação?</h5>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-normal">
                    Ative a opção <span className="font-bold">"Expor Recurso"</span> para gerar de forma automatizada o endpoint de API correspondente.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

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
                  
                  {/* ACCORDION ROADMAP / CLASSIFICACAO TYPE */}
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
                          <h3 className="text-sm font-bold text-slate-800">Classificação</h3>
                          <p className="text-[11px] text-slate-500 font-medium font-semibold">Selecione o modelo operacional</p>
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
                      <div className="p-6 border-t border-slate-100 space-y-4 text-left">
                        <div className="relative">
                          <select 
                            value={createType} 
                            onChange={e => {
                              const val = e.target.value as ResourceType;
                              setCreateType(val);
                            }} 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 bg-white text-sm font-semibold text-slate-800 appearance-none transition-all cursor-pointer"
                          >
                            <option value={ResourceType.ASSISTANT}>Assistente</option>
                            <option value={ResourceType.AGENT}>Agente</option>
                            <option value={ResourceType.SKILL}>Skill</option>
                          </select>
                          <Icons.ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {createType === ResourceType.AUTOMATION && selectedAutomationSubtype && (
                          <div className="mt-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between text-left">
                            <div className="text-xs font-semibold text-slate-700">
                              Tipo de Automação: <strong className="text-indigo-600">
                                {selectedAutomationSubtype === 'simples' ? 'Simples (sem IA)' :
                                 selectedAutomationSubtype === 'ia' ? 'Com IA no meio' : 'Integrada'}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedAutomationSubtype(null)}
                              className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                            >
                              Alterar
                            </button>
                          </div>
                        )}
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
                      {selectedAutomationSubtype !== 'simples' && (
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
                      )}
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
                      {/* Detalhes de Identificação da Skill */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/60 shadow-inner">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                            <span>Nome de Exibição da Skill</span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 rounded font-bold uppercase tracking-tight">Opcional</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Consultar API de Vendas"
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 placeholder:text-slate-400"
                          />
                          <p className="text-[10px] text-slate-400 ml-1 font-medium italic">Se vazio, usará o nome do arquivo enviado</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-[0.15em] ml-1 flex items-center justify-between">
                            <span>Descrição / Propósito da Skill</span>
                            <span className="text-[9px] bg-fuchsia-100 text-fuchsia-700 px-1.5 rounded font-bold uppercase tracking-tight">Importante</span>
                          </label>
                          <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva o que esta skill faz para que os assistentes/agentes saibam quando utilizá-la..."
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 resize-none h-[49px] placeholder:text-slate-400 leading-normal"
                          />
                        </div>

                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-black text-slate-455 uppercase tracking-[0.15em] ml-1 flex items-center justify-between">
                            <span>Ambiente de Publicação</span>
                            <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 rounded font-bold uppercase tracking-tight">Infraestrutura</span>
                          </label>
                          <select
                            value={resourceEnvironment}
                            onChange={e => setResourceEnvironment(e.target.value as ResourceEnvironment)}
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 cursor-pointer"
                          >
                            <option value={ResourceEnvironment.STAGING}>🛠️ Homologação (STAGING)</option>
                          </select>
                          <p className="text-[10px] text-slate-400 ml-1 font-medium italic">Selecione para onde deseja publicar esta Skill</p>
                        </div>
                      </div>

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
                                  const blob = new Blob([skillFile.content || ''], { type: skillFile.type || 'text/javascript' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = skillFile.name;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                                className="px-4 py-2 text-xs font-bold text-teal-600 hover:text-teal-700 hover:bg-teal-50 border border-teal-100 rounded-xl transition-all flex items-center gap-1"
                              >
                                <Icons.Download className="w-3 h-3" />
                                Download Código
                              </button>
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
                {selectedAutomationSubtype !== 'simples' && (
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
                )}

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
                                  https://luna.zucchetti.com.br/api/webhook/v1/{isEditing ? editingResource?.id : 'recurso-novo'}
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://luna.zucchetti.com.br/api/webhook/v1/${isEditing ? editingResource?.id : 'recurso-novo'}`);
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
                    {selectedAutomationSubtype !== 'simples' && (
                      <div className="col-span-full border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all mt-6 font-sans">
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
                    )}
                  </div>
                )}

              {/* ACCORDION 3: Configuração de Tools (Ações e Conectores) */}
              {[ResourceType.AGENT, ResourceType.ASSISTANT].includes(createType) && (
                <div className="col-span-full border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all mt-6 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                    className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                        <Icons.Workflow className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Definições de Tools (Ações do Agente)</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Cadastre e vincule APIs HTTP ou fluxos MCP para controle operacional do Agente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {linkedToolIds.length > 0 && (
                        <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-tight">
                          {linkedToolIds.length} {linkedToolIds.length === 1 ? 'tool vinculada' : 'tools vinculadas'}
                        </span>
                      )}
                      <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isToolsExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isToolsExpanded && (
                    <div className="p-6 border-t border-slate-100 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold">Atribua capacidades e conectores para que o modelo de IA consiga realizar operações.</p>
                        </div>
                        <div className="flex gap-2.5 shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setIsLinkingToolModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-850 hover:bg-slate-100 transition-all bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200"
                          >
                            <Icons.Link className="w-3.5 h-3.5" />
                            <span>Vincular existente</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingToolForWizard(null);
                              setIsAddingToolModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-all bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-100"
                          >
                            <Icons.Plus className="w-3.5 h-3.5" />
                            <span>Cadastrar nova tool</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const linkedTools = tools.filter(t => linkedToolIds.includes(t.id));
                          if (linkedTools.length === 0) {
                            return (
                              <div className="col-span-full p-10 rounded-[24px] border-2 border-dashed border-slate-100 text-center bg-slate-50/25">
                                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-350 mx-auto mb-3 shadow-sm">
                                  <Icons.Workflow className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="text-xs font-bold text-slate-650">Nenhuma tool vinculada ao agente</div>
                                <div className="text-[11px] text-slate-400 mt-1">Conecte endpoints de REST APIs (HTTP) ou servidores MCP para habilitar ações.</div>
                              </div>
                            );
                          }

                          return linkedTools.map(tool => (
                            <div key={tool.id} className="group flex flex-col justify-between p-5 rounded-[22px] border border-slate-150 bg-white hover:border-slate-250 transition-all">
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-extrabold text-xs text-slate-800 truncate" title={tool.name}>{tool.name}</span>
                                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${tool.type === ToolType.HTTP ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {tool.type === ToolType.HTTP ? 'HTTP Request' : 'Servidor MCP'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-semibold leading-normal line-clamp-2">{tool.description}</p>
                                
                                {tool.parameters?.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                    {tool.parameters.map((p, pIdx) => (
                                      <span key={pIdx} className="text-[9px] bg-slate-50 border border-slate-200/60 text-slate-500 font-mono px-1.5 py-0.5 rounded-md">
                                        {p.name}:{p.type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 mt-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingToolForWizard(tool);
                                    setIsAddingToolModalOpen(true);
                                  }}
                                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-all flex items-center gap-1"
                                >
                                  <Icons.Settings className="w-3.5 h-3.5" />
                                  <span>Editar Definição</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLinkedToolIds(prev => prev.filter(id => id !== tool.id))}
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-all flex items-center gap-1"
                                >
                                  <Icons.X className="w-3.5 h-3.5" />
                                  <span>Desvincular</span>
                                </button>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMPONENTE AGENDADOR - RF01 */}
              {createType === ResourceType.AGENT && (
                <div id="luna-scheduler-component" className="col-span-full border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm transition-all mt-6 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsSchedulerExpanded(!isSchedulerExpanded)}
                    className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <Icons.Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">Agendador (Execução Autônoma)</h3>
                          {schedulerEnabled ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">Ativo</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">Inativo</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Configure execuções periódicas automáticas para o seu agente rodar sozinho</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {schedulerEnabled && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-tight">
                          {schedulerPeriodicity} ({schedulerTriggerType === 'tool' ? 'Via Tool' : 'Via Prompt'})
                        </span>
                      )}
                      <Icons.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSchedulerExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isSchedulerExpanded && (
                    <div className="p-6 border-t border-slate-100 space-y-6">
                      
                      {/* Ativar/Desativar Agendador */}
                      <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-slate-700 block">Ativar Agendamento Autônomo</label>
                          <p className="text-[11px] text-slate-400 font-medium">Quando ativo, o agente rodará sem requerer interação manual no Playground</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            id="scheduler-toggle"
                            checked={schedulerEnabled}
                            onChange={(e) => setSchedulerEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {schedulerEnabled && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          
                          {/* RF02 - Periodicidade */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span>Periodicidade de Execução</span>
                                <span className="text-rose-500 font-bold">*</span>
                              </label>
                              <p className="text-[11px] text-slate-450 leading-relaxed font-medium">Defina em qual frequência ou horário o agente iniciará o ciclo de reasoning.</p>
                              
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {[
                                  { label: 'Cada 10 min', value: '10m' },
                                  { label: 'Cada 30 min', value: '30m' },
                                  { label: 'Cada 1 hora', value: '1h' },
                                  { label: 'Cada 12 horas', value: '12h' },
                                  { label: 'Diário (09:00)', value: '0 9 * * *' },
                                  { label: 'Semanal (Seg)', value: '0 9 * * 1' },
                                ].map((pOption) => (
                                  <button
                                    key={pOption.value}
                                    type="button"
                                    onClick={() => setSchedulerPeriodicity(pOption.value)}
                                    className={`py-2 px-3 text-center text-[10px] sm:text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                      schedulerPeriodicity === pOption.value
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {pOption.label}
                                  </button>
                                ))}
                              </div>

                              <div className="pt-2">
                                <label className="text-[10px] font-bold text-slate-400 block mb-1">Expressão Customizada (Intervalo ou Cron)</label>
                                <input
                                  type="text"
                                  id="scheduler-periodicity-input"
                                  value={schedulerPeriodicity}
                                  onChange={(e) => setSchedulerPeriodicity(e.target.value)}
                                  placeholder="Ex: 5m, 2h ou 0 18 * * 1-5"
                                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            {/* RF03 - Tipo de Gatilho */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span>Gatilho de Disparo</span>
                                <span className="text-rose-500 font-bold">*</span>
                              </label>
                              <p className="text-[11px] text-slate-455 leading-relaxed font-medium">Escolha como o ciclo de reasoning será inicializado no horário programado.</p>
                              
                              <div className="flex gap-4 mt-3">
                                <label className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer select-none">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      id="trigger-type-prompt"
                                      name="schedulerTriggerType"
                                      value="prompt"
                                      checked={schedulerTriggerType === 'prompt'}
                                      onChange={() => setSchedulerTriggerType('prompt')}
                                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-slate-750 block">Via Prompt auxiliar</span>
                                      <span className="text-[10px] text-slate-400 font-semibold block">Texto livre customizado</span>
                                    </div>
                                  </div>
                                </label>

                                <label className="flex-1 flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer select-none">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      id="trigger-type-tool"
                                      name="schedulerTriggerType"
                                      value="tool"
                                      checked={schedulerTriggerType === 'tool'}
                                      onChange={() => setSchedulerTriggerType('tool')}
                                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-slate-755 block">Via Tool</span>
                                      <span className="text-[10px] text-slate-400 font-semibold block">Invocação de tool vinculada</span>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            {/* RF04 - Gatilho via Tool */}
                            {schedulerTriggerType === 'tool' && (() => {
                              const linkedTools = tools.filter(t => linkedToolIds.includes(t.id));
                              return (
                                <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                    <span>Selecionar Tool de Entrada</span>
                                    <span className="text-rose-500 font-bold">*</span>
                                  </label>
                                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    A cada execução agendada, o runtime rodará esta tool automaticamente e injetará seu resultado como dado de entrada para o reasoning do agente.
                                  </p>

                                  {linkedTools.length === 0 ? (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium space-y-1">
                                      <div className="font-bold flex items-center gap-1.5">
                                        <span>⚠️ Nenhuma Tool Vinculada ao Agente</span>
                                      </div>
                                      <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                                        Você precisa cadastrar e vincular pelo menos uma Tool ao agente (na seção acima "Definições de Tools") antes de poder configurar o gatilho Via Tool.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <select
                                        id="scheduler-tool-select"
                                        value={schedulerTriggerToolId}
                                        onChange={(e) => setSchedulerTriggerToolId(e.target.value)}
                                        className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      >
                                        <option value="">-- Escolher Tool Vinculada --</option>
                                        {linkedTools.map(t => (
                                          <option key={t.id} value={t.id}>
                                            {t.name} ({t.type === ToolType.HTTP ? 'HTTP' : 'MCP'})
                                          </option>
                                        ))}
                                      </select>
                                      
                                      {schedulerTriggerToolId ? (() => {
                                        const selectedTool = linkedTools.find(t => t.id === schedulerTriggerToolId);
                                        if (!selectedTool) return null;
                                        return (
                                          <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl flex flex-col gap-1.5">
                                            <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Tool Selecionada</span>
                                            <span className="text-xs font-bold text-slate-850">{selectedTool.name}</span>
                                            <p className="text-[11px] text-slate-500 font-medium leading-normal">{selectedTool.description}</p>
                                          </div>
                                        );
                                      })() : (
                                        <p className="text-[11px] text-rose-500 font-bold">Atenção: Selecione uma tool válida para salvar.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* RF05 - Gatilho via Prompt auxiliar */}
                            {schedulerTriggerType === 'prompt' && (
                              <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
                                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                  <span>Prompt Auxiliar de Execução</span>
                                  <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                  Informe o texto ou instrução livre que será enviada para iniciar a cadeia de reasoning do agente autonomamente.
                                </p>
                                <textarea
                                  id="scheduler-prompt-textarea"
                                  value={schedulerTriggerPrompt}
                                  onChange={(e) => setSchedulerTriggerPrompt(e.target.value)}
                                  placeholder="Ex: Colete os leads qualificados de hoje no CRM, cruze com as metas do mês, analise as discrepâncias e notifique o canal de vendas."
                                  rows={4}
                                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 px-4 py-3 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed placeholder:text-slate-400"
                                />
                                {!schedulerTriggerPrompt.trim() && (
                                  <p className="text-[11px] text-rose-500 font-bold">Atenção: O prompt auxiliar é obrigatório para salvar o agendamento.</p>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  )}
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
            <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm border border-sky-100/50">
                  <span className="text-2xl">📘</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Editor de Documentação</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{editingDoc.name}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <span className="text-[11px] font-medium text-slate-400 font-sans">Editor de Base de Conhecimento (Markdown-Free)</span>
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
              {editorTab === 'editor' ? (
                /* Left Pane: Simple Text Editor with Notion-like Intuitive Tools */
                <div className="w-full bg-white flex flex-col p-8 overflow-y-auto custom-scrollbar relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 shrink-0">
                    {/* Quick helper tag */}
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <span>💡 Digite</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700 font-bold">/</kbd>
                      <span>para abrir comandos rápidos de formatação</span>
                    </div>

                    <button
                      type="button"
                      disabled={isAnalyzingText || !markdownContent.trim()}
                      onClick={handleAiFormatDocument}
                      className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 transition-all px-3 py-1.5 rounded-lg border border-sky-100 disabled:opacity-50"
                    >
                      {isAnalyzingText ? <Icons.Loader className="w-3.5 h-3.5 animate-spin" /> : <Icons.Sparkles className="w-3.5 h-3.5" />}
                      <span>IA - Auto-estruturar com Inteligência</span>
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col pt-2 relative">
                    <div className="flex-1 relative min-h-[300px]">
                      <textarea 
                        id="md-textarea-modal"
                        value={markdownContent}
                        onChange={handleTextareaChange}
                        onKeyDown={handleTextareaKeyDown}
                        className="w-full h-full min-h-[300px] absolute inset-0 resize-none focus:outline-none text-base font-sans leading-relaxed text-slate-700 placeholder:text-slate-400 bg-transparent py-4 border-t border-slate-100"
                        placeholder="Escreva ou cole as diretrizes de conhecimento do seu agente de IA aqui naturalmente. Você não precisa saber markdown! Basta estruturar seu texto, fazer listas com hífens '-' ou números '1.', use títulos à vontade, ou comece parágrafos com expressões como 'Importante', 'Cuidado' ou 'Dica' para que a Inteligência de RAG as isole automaticamente..."
                        style={{ whiteSpace: 'pre-wrap' }}
                      ></textarea>

                      {/* Absolute slash dropdown menu */}
                      {showSlashMenu && (
                        <div className="absolute left-6 bottom-4 max-w-xs w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Inserir bloco de formatação
                          </div>
                          <div className="max-h-52 overflow-y-auto py-1">
                            {(() => {
                              const filtered = slashCommands.filter(cmd => 
                                cmd.name.toLowerCase().includes(slashQuery.toLowerCase()) || 
                                cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
                              );
                              if (filtered.length === 0) {
                                return <div className="px-4 py-2 text-center text-xs text-slate-400">Nenhum bloco encontrado</div>;
                              }
                              return filtered.map((cmd, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => executeSlashCommand(cmd)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${activeCommandIdx === idx ? 'bg-slate-100 text-slate-900 font-black' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                  <span className="text-base shrink-0">{cmd.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{cmd.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{cmd.description}</p>
                                  </div>
                                </button>
                              ));
                            })()}
                          </div>
                          <div className="bg-slate-50/50 px-4 py-1.5 border-t border-slate-100 text-[9px] text-slate-400 font-medium flex items-center justify-between">
                            <span>Use ↑↓ para focar • [Enter] para escolher</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Right Pane: Live Beautiful Preview of Inferred Formatting */
                <div className="w-full bg-slate-50/50 flex flex-col p-8 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Visual Interpretado pela IA (Automático)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">Pronto para RAG</span>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-150 p-10 text-left min-h-[400px] relative max-w-4xl mx-auto w-full">
                    {/* Subtle Top Header Decor */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400"></div>
                    
                    <div className="space-y-6 pt-4">
                      {parseInferredBlocks(markdownContent).map((block, bIdx) => {
                        if (block.type === 'title') {
                          return (
                            <h1 key={bIdx} className="text-2xl font-black text-slate-900 tracking-tight border-b pb-3 mb-6 flex items-center gap-2">
                              <span>📘</span>
                              <span>{block.content}</span>
                            </h1>
                          );
                        }
                        if (block.type === 'subtitle') {
                          return (
                            <h2 key={bIdx} className="text-lg font-extrabold text-slate-800 tracking-tight mt-6 mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-4 bg-sky-500 rounded-full inline-block"></span>
                              <span>{block.content}</span>
                            </h2>
                          );
                        }
                        if (block.type === 'highlight') {
                          const styleMap = {
                            warning: 'bg-amber-50/70 border-amber-200 text-amber-900 font-semibold',
                            tip: 'bg-violet-50/70 border-violet-200 text-violet-900 font-semibold',
                            success: 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold',
                            info: 'bg-sky-50/70 border-sky-200 text-sky-950 font-semibold'
                          };
                          const emojiMap = {
                            warning: '⚠️',
                            tip: '💡',
                            success: '✅',
                            info: 'ℹ️'
                          };
                          const labelMap = {
                            warning: 'Atenção / Aviso Relevante',
                            tip: 'Dica de IA / Insight',
                            success: 'Meta Alcançada / Validado',
                            info: 'Nota Importante / Diretriz'
                          };
                          const type = block.highlightType || 'info';
                          return (
                            <div key={bIdx} className={`p-5 rounded-2xl border-l-4 border ${styleMap[type]} my-4 shadow-sm`}>
                              <div className="flex items-center gap-2 mb-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                <span>{emojiMap[type]}</span>
                                <span>{labelMap[type]}</span>
                              </div>
                              <p className="text-sm font-medium leading-relaxed">{block.content}</p>
                            </div>
                          );
                        }
                        if (block.type === 'list') {
                          return (
                            <ul key={bIdx} className="space-y-2.5 my-4 pl-1">
                              {block.listItems?.map((item, iIdx) => (
                                <li key={iIdx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed font-semibold">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-50 border border-sky-200 shrink-0 text-sky-600 font-bold text-[10px] mt-0.5">✓</span>
                                  <div>{item}</div>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={bIdx} className="text-sm text-slate-600 leading-relaxed font-medium">
                            {block.content}
                          </p>
                        );
                      })}

                      {!markdownContent.trim() && (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                          <span className="text-4xl mb-4">✨</span>
                          <h4 className="text-sm font-bold text-slate-700">Visualização de Inteligência Artificial</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Qualquer texto digitado no editor será automaticamente formatado e exibido aqui em formato legível por IA.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-white shadow-lg shadow-slate-100 shrink-0">
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

      {/* Tool Integration Modals */}
      <ToolWizardModal
        isOpen={isAddingToolModalOpen}
        onClose={() => {
          setIsAddingToolModalOpen(false);
          setEditingToolForWizard(null);
        }}
        onSave={(newTool: Tool) => {
          onSaveTool(newTool);
          if (!linkedToolIds.includes(newTool.id)) {
            setLinkedToolIds(prev => [...prev, newTool.id]);
          }
        }}
        existingTool={editingToolForWizard}
        siblingTools={tools.filter(t => linkedToolIds.includes(t.id))}
      />

      <LinkToolModal
        isOpen={isLinkingToolModalOpen}
        onClose={() => setIsLinkingToolModalOpen(false)}
        allTools={tools}
        linkedToolIds={linkedToolIds}
        onLink={(toolId) => {
          if (!linkedToolIds.includes(toolId)) {
            setLinkedToolIds(prev => [...prev, toolId]);
          }
        }}
        onUnlink={(toolId) => {
          setLinkedToolIds(prev => prev.filter(id => id !== toolId));
        }}
      />
    </div>
  );
};

export default CreateResourcePage;
