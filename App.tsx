
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, UserRole, Resource, ResourceType, AgentType, Conversation, Message, ResourceEnvironment, AccessRequest, Project, Subtask, ResourceVersion, Tool, ToolType, Notification } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import ResourceManagementPage from './pages/ResourceManagementPage';
import DocumentationPage from './pages/DocumentationPage';
import LabPage from './pages/LabPage';
import AuditLogsPage from './pages/AuditLogsPage';
import LunaMonitoringPage from './pages/LunaMonitoringPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import AppsPage from './pages/AppsPage';
import WhatsAppMonitorPage from './pages/WhatsAppMonitorPage';
import ItauLeadUploadPage from './pages/ItauLeadUploadPage';
import ZnoteLayout from './pages/znote/ZnoteLayout';
import CreateResourcePage from './pages/CreateResourcePage';
import { LoginPage } from './pages/LoginPage';

const INITIAL_TOOLS: Tool[] = [
  {
    id: 't1',
    name: 'fetchCustomerCRM',
    type: ToolType.HTTP,
    description: 'Recupera dados cadastrais do cliente via API de CRM da Zucchetti usando o ID do cliente',
    status: 'active',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'ID único do cliente no CRM' }
    ],
    url: 'https://api.zucchetti.cloud/crm/v1/customers/:id',
    method: 'GET',
    parameterMapping: [
      { paramName: 'id', location: 'path' }
    ],
    bodyFormat: 'JSON'
  },
  {
    id: 't2',
    name: 'notifySlackChannel',
    type: ToolType.MCP,
    description: 'Envia mensagens formatadas para canais específicos do Slack via servidor MCP corporativo',
    status: 'active',
    parameters: [
      { name: 'channel', type: 'string', required: true, description: 'Canal de destino (ex: #leads)' },
      { name: 'message', type: 'string', required: true, description: 'Conteúdo em markdown customizado' }
    ],
    serverUrl: 'http://mcp.zucchetti.internal:9000/slack',
    transportProtocol: 'SSE',
    discoveredTools: ['notifySlackChannel', 'listChannels', 'registerUser'],
    selectedDiscoveredTool: 'notifySlackChannel'
  }
];

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'r1', 
    title: 'Assistente Geral', 
    status: 'MONITORAMENTO', 
    description: 'Assistente central conectado a todos os agentes disponíveis de acordo com seu perfil e permissões.', 
    scope: 'Global', 
    metrics: 'NPS > 90', 
    deadline: '2025-12-31', 
    user: 'Gabrielli Carvalho', 
    email: 'gabrielli.carvalho@zucchetti.com.br', 
    type: 'Assistente',
    comments: [
      { id: 'c1', user: 'Gabriel Ricardo', content: 'Comentado por: alice.castro@zucchetti.com Fonte de dados: Valor Econômico, Google Alerta, Isto É Dinheiro, Revistas de TI, Época Negócios, Comissão de Valores Mobiliários, Publicação de Balanços', timestamp: '2026-01-26T10:00:00Z' },
      { id: 'c2', user: 'Gabriel Ricardo', content: 'Comentado por: alice.castro@zucchetti.com Fontes de notícias, termos de busca e lista de concorrentes: https://zucchettioffice365.sharepoint.com/:x:/s/GestaoEstrategica/IQAAoHqAgmLQRahrzX_D48bKAAy-zDES_Qj_BQbMkkTwWHw?e=hdQCaX Modelo de output: https://zucchettioffice365.sharepoint.com/:w:/s/GestaoEstrategica/IQBVlrCQx5ReT7gPTjQNfQFmAbtkJXmstetSWg7y?e=tNZeIn', timestamp: '2026-01-29T14:30:00Z' },
      { id: 'c3', user: 'Gabrielli Marques Carvalho', content: 'Realizado reunião de demonstração prévia de projeto e alinhado alguns pontos quanto ao desenvolvimento do projeto(stack e fluxo do projeto no n8n), estamos no aguardo da área de negócio para prosseguir com o desenvolvimento do tutorial junto com envio de algumas informações por email.', timestamp: '2026-02-06T16:45:00Z' }
    ]
  },
  { id: 'r2', title: 'Doc ClippPro', status: 'CONCLUIDO', description: 'Documentação oficial do produto vetorizada para consulta via IA.', scope: 'Interno', metrics: '100% cobertura', deadline: '2025-01-12', user: 'Kristofer Pinheiro', email: 'kristofer.pinheiro@zucchetti.com.br', type: 'Automação' },
  { id: 'r3', title: 'Gestor de Base', status: 'DESENVOLVIMENTO', description: 'Agente para manipulação e escrita de dados em base segura.', scope: 'Infra', metrics: 'Latência < 2s', deadline: '2025-06-30', user: 'Kristofer Pinheiro', email: 'kristofer.pinheiro@zucchetti.com.br', type: 'Agente' },
  { id: 'r4', title: 'Auditor de Sistema', status: 'REFINAMENTO', description: 'Analista de logs para investigação de erros e auditoria de segurança.', scope: 'Segurança', metrics: '99% detecção', deadline: '2025-07-15', user: 'Gabrielli Carvalho', email: 'gabrielli.carvalho@zucchetti.com.br', type: 'Agente' },
];

const INITIAL_RESOURCES: Resource[] = [
  { 
    id: 'luna-secretario', 
    name: 'Luna, o secretário', 
    description: 'Seu secretário executivo inteligente. Ele armazena as transcrições das suas gravações corporativas no seu RAG (Base de Conhecimento) e ajuda você a resumir reuniões, criar atas, extrair tarefas acionáveis e responder a dúvidas sobre tudo o que foi gravado.', 
    type: ResourceType.ASSISTANT, 
    agentType: AgentType.READING, 
    requiredRole: UserRole.BASIC, 
    createdAt: '2026-06-19', 
    environment: ResourceEnvironment.PRODUCTION, 
    creatorId: 'system', 
    creatorName: 'Gabrielli Carvalho', 
    creatorEmail: 'gabrielli.carvalho@zucchetti.com.br',
    creatorArea: 'IA & Inovação',
    version: 1, 
    updatedAt: '2026-06-19', 
    prompt: 'Você é "Luna, o secretário", um assistente atencioso e inteligente da organização Zucchetti. Toda vez que o usuário salvar uma gravação de reunião ou notas de voz, o conteúdo transcrito é anexado diretamente à sua base de dados (RAG) o que permite que você responda com precisão extrema a perguntas detalhadas sobre as discussões, atas, tarefas e pessoas mencionadas nessas gravações. Quando o usuário fizer perguntas, consulte as notas de voz gravadas abaixo e retire as respostas diretamente delas se estiverem disponíveis. Responda detalhadamente e de forma prestativa, sempre em português.',
    history: []
  },
  { 
    id: 'r1', 
    name: 'Assistente Geral', 
    description: 'Assistente central conectado a todos os agentes disponíveis de acordo com seu perfil e permissões. Identifica automaticamente o especialista necessário para sua pergunta, permitindo também a seleção manual de qualquer assistente ao qual você tenha acesso.', 
    type: ResourceType.AGENT, 
    agentType: AgentType.READING, 
    requiredRole: UserRole.BASIC, 
    createdAt: '2025-01-10', 
    environment: ResourceEnvironment.PRODUCTION, 
    creatorId: 'system', 
    creatorName: 'Gabrielli Carvalho', 
    creatorEmail: 'gabrielli.carvalho@zucchetti.com.br',
    creatorArea: 'IA & Inovação',
    version: 2, 
    updatedAt: '2025-01-20', 
    projectId: 'r1',
    history: [
      {
        version: 1,
        name: 'Assistente Geral (Initial)',
        description: 'Primeira versão do assistente central.',
        prompt: 'Você é um assistente prestativo.',
        updatedAt: '2025-01-10',
        updatedBy: 'system'
      }
    ]
  },
  { 
    id: 'r2', 
    name: 'Doc ClippPro', 
    description: 'Documentação oficial do produto.', 
    type: ResourceType.DOCUMENTATION, 
    requiredRole: UserRole.BASIC, 
    createdAt: '2025-01-12', 
    environment: ResourceEnvironment.PRODUCTION, 
    creatorId: 'system', 
    creatorName: 'Kristofer Pinheiro', 
    creatorEmail: 'kristofer.pinheiro@zucchetti.com.br',
    creatorArea: 'Produto',
    version: 3, 
    updatedAt: '2025-02-15', 
    projectId: 'r2',
    history: [
      { version: 2, name: 'Doc ClippPro v2', description: 'Atualização de manuais 2024.', updatedAt: '2025-02-01', updatedBy: 'system' },
      { version: 1, name: 'Doc ClippPro v1', description: 'Carga inicial de documentação.', updatedAt: '2025-01-12', updatedBy: 'system' }
    ]
  },
  { id: 'r3', name: 'Gestor de Base', description: 'Manipula escritas e updates de dados.', type: ResourceType.AGENT, agentType: AgentType.WRITING, requiredRole: UserRole.ADVANCED, createdAt: '2025-02-05', environment: ResourceEnvironment.STAGING, creatorId: 'system', creatorName: 'Kristofer Pinheiro', creatorEmail: 'kristofer.pinheiro@zucchetti.com.br', creatorArea: 'TI', version: 1, updatedAt: '2025-02-05', projectId: 'r3' },
  { 
    id: 's1', 
    name: 'Validador de CNPJ', 
    description: 'Valida cadastros de fornecedores e parceiros contra dados da Receita Federal.', 
    type: ResourceType.SKILL, 
    requiredRole: UserRole.BASIC, 
    createdAt: '2025-05-15', 
    environment: ResourceEnvironment.PRODUCTION, 
    creatorId: 'system', 
    creatorName: 'Gabrielli Carvalho', 
    creatorEmail: 'gabrielli.carvalho@zucchetti.com.br', 
    creatorArea: 'IA & Inovação', 
    version: 1, 
    updatedAt: '2025-05-15', 
    prompt: JSON.stringify({
      fileName: 'validate_cnpj.py',
      fileSize: '4.8 KB',
      fileType: 'text/x-python',
      fileContent: 'import urllib.request\nimport json\n\ndef validate_cnpj(cnpj):\n    cnpj_clean = cnpj.replace(".", "").replace("/", "").replace("-", "")\n    url = f"https://publica.cnpj.ws/cnpj/{cnpj_clean}"\n    try:\n        response = urllib.request.urlopen(url)\n        data = json.loads(response.read().decode())\n        return {"status": "success", "data": data}\n    except Exception as e:\n        return {"status": "error", "message": str(e)}'
    })
  },
  { id: 'r4', name: 'Auditor de Sistema', description: 'Analisa logs de execução.', type: ResourceType.AGENT, agentType: AgentType.INTERPRETATION, requiredRole: UserRole.ADMINISTRATOR, createdAt: '2025-02-10', environment: ResourceEnvironment.STAGING, creatorId: 'system', creatorName: 'Gabrielli Carvalho', creatorEmail: 'gabrielli.carvalho@zucchetti.com.br', creatorArea: 'Compliance', version: 1, updatedAt: '2025-02-10', projectId: 'r4' },
  { id: 'm1', name: 'GPT-4', description: 'Modelo de linguagem de alta performance da OpenAI.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system', creatorName: 'OpenAI', creatorEmail: 'support@openai.com', creatorArea: 'Parceiro Externo', version: 1, updatedAt: '2025-03-01' },
  { id: 'm2', name: 'GPT-5-nano', description: 'Próxima geração de modelos compactos e eficientes.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system', creatorName: 'OpenAI', creatorEmail: 'support@openai.com', creatorArea: 'Parceiro Externo', version: 1, updatedAt: '2025-03-01' },
  { id: 'm3', name: 'Claude 3.5', description: 'Modelo avançado da Anthropic com foco em raciocínio.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system', creatorName: 'Anthropic', creatorEmail: 'support@anthropic.com', creatorArea: 'Parceiro Externo', version: 1, updatedAt: '2025-03-01' },
];

const INITIAL_REQUESTS: AccessRequest[] = [
  { 
    id: 'req1', 
    userId: 'u2', 
    userName: 'Ana Costa', 
    userAvatar: 'https://picsum.photos/seed/ana/100/100', 
    userBU: 'Comercial',
    resourceId: 'r3', 
    resourceName: 'Gestor de Base', 
    resourceCategory: 'Agente',
    status: 'PENDING', 
    timestamp: '2025-05-11 09:15:00',
    reason: 'Preciso atualizar os dados de faturamento do mês passado.',
    requiresDoubleApproval: true,
    ownerApproved: false,
    iaTeamApproved: false,
    resourceOwnerEmail: 'infra@zucchetti.com.br'
  },
  { 
    id: 'req2', 
    userId: 'u3', 
    userName: 'Marcos Oliveira', 
    userAvatar: 'https://picsum.photos/seed/marcos/100/100', 
    userBU: 'ERP',
    resourceId: 'r4', 
    resourceName: 'Auditor de Sistema', 
    resourceCategory: 'Assistente',
    status: 'PENDING', 
    timestamp: '2025-05-11 10:30:00',
    reason: 'Análise de logs para investigação de erro no checkout.'
  }
];

const AppInner: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('luna_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('luna_dark_mode', String(newVal));
      return newVal;
    });
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('luna_auth') === 'true';
  });

  const [user, setUser] = useState<User>(() => {
    const cached = localStorage.getItem('luna_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      id: 'u1',
      name: 'Gabrielli Carvalho',
      role: UserRole.ADMINISTRATOR,
      avatar: 'https://picsum.photos/seed/luna-user/100/100',
      bu: 'Desenvolvimento'
    };
  });

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem('luna_auth', 'true');
    localStorage.setItem('luna_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('luna_auth');
    localStorage.removeItem('luna_user');
  };

  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeResource, setActiveResource] = useState<Resource | null>(INITIAL_RESOURCES[0]);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const cached = localStorage.getItem('luna_conversations');
    return cached ? JSON.parse(cached) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const cached = localStorage.getItem('luna_notifications');
    return cached ? JSON.parse(cached) : [];
  });
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [systemWebhookUrl, setSystemWebhookUrl] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('luna_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('luna_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [tools, setTools] = useState<Tool[]>(() => {
    const cached = localStorage.getItem('luna_tools');
    return cached ? JSON.parse(cached) : INITIAL_TOOLS;
  });

  useEffect(() => {
    localStorage.setItem('luna_tools', JSON.stringify(tools));
  }, [tools]);

  const [savedTranscripts, setSavedTranscripts] = useState<{ id: string; title: string; content: string; timestamp: string; duration: string }[]>(() => {
    const cached = localStorage.getItem('luna_transcripts');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    localStorage.setItem('luna_transcripts', JSON.stringify(savedTranscripts));
    
    setResources(prev => prev.map(res => {
      if (res.id === 'luna-secretario') {
        const basePrompt = 'Você é "Luna, o secretário", um assistente atencioso e inteligente da organização Zucchetti. Toda vez que o usuário salvar uma gravação de reunião ou notas de voz, o conteúdo transcrito é anexado diretamente à sua base de dados (RAG) o que permite que você responda com precisão extrema a perguntas detalhadas sobre as discussões, atas, tarefas e pessoas mencionadas nessas gravações. Quando o usuário fizer perguntas, consulte as notas de voz gravadas abaixo e retire as respostas diretamente delas se estiverem disponíveis. Responda detalhadamente e de forma prestativa, sempre em português.';
        
        const ragContext = savedTranscripts.map(t => `\n\n--- GRAVAÇÃO SALVA NO RAG: ${t.title} (Data/Hora: ${t.timestamp}) ---\n${t.content}`).join('');
        
        return {
          ...res,
          prompt: basePrompt + (ragContext ? `\n\n--- BASE DE CONHECIMENTO RETRIEVED (RAG) ---\nUse estas informações abaixo para responder a qualquer pergunta do usuário:\n${ragContext}` : '\n\n(Nenhuma gravação foi salva no RAG até o momento. Incentive o usuário a usar o botão de gravação no cabeçalho para gerar e salvar as discussões corporativas)')
        };
      }
      return res;
    }));
  }, [savedTranscripts]);

  const handleSaveTranscript = (title: string, content: string, duration: string) => {
    const newTranscript = {
      id: `tr-${Date.now()}`,
      title,
      content,
      timestamp: new Date().toLocaleString(),
      duration
    };
    setSavedTranscripts(prev => [newTranscript, ...prev]);
  };

  const handleRoleChange = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const handleCreateResource = (res: Omit<Resource, 'id' | 'createdAt' | 'environment' | 'creatorId' | 'version' | 'updatedAt' | 'history'> & { environment?: ResourceEnvironment }) => {
    const now = new Date().toISOString().split('T')[0];
    const newRes: Resource = {
      ...res,
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      version: 1,
      environment: res.environment || ResourceEnvironment.STAGING,
      creatorId: user.id,
      creatorName: user.name,
      creatorEmail: 'gabrielli.carvalho@zucchetti.com.br',
      creatorArea: user.bu || 'Geral',
      history: []
    } as Resource;
    setResources(prev => [...prev, newRes]);
  };

  const handleUpdateResource = (updatedRes: Resource) => {
    setResources(prev => prev.map(r => {
      if (r.id === updatedRes.id) {
        const now = new Date().toLocaleString();
        
        // Criar entrada de histórico da versão ATUAL antes de atualizar
        const historyEntry: ResourceVersion = {
          version: r.version,
          name: r.name,
          description: r.description,
          prompt: r.prompt,
          webhookUrl: r.webhookUrl,
          webhookHeaders: r.webhookHeaders,
          webhookBody: r.webhookBody,
          model: r.model,
          updatedAt: r.updatedAt,
          updatedBy: user.name
        };
        
        return {
          ...updatedRes,
          version: r.version + 1,
          updatedAt: now,
          history: [historyEntry, ...(r.history || [])]
        };
      }
      return r;
    }));
  };

  const handleRollbackResource = (resourceId: string, version: number) => {
    setResources(prev => prev.map(r => {
      if (r.id === resourceId) {
        const versionToRestore = r.history?.find(h => h.version === version);
        if (!versionToRestore) return r;

        const now = new Date().toLocaleString();
        
        // Salva a versão atual no histórico antes de voltar
        const currentAsHistory: ResourceVersion = {
          version: r.version,
          name: r.name,
          description: r.description,
          prompt: r.prompt,
          webhookUrl: r.webhookUrl,
          webhookHeaders: r.webhookHeaders,
          webhookBody: r.webhookBody,
          model: r.model,
          updatedAt: r.updatedAt,
          updatedBy: user.name
        };

        return {
          ...r,
          ...versionToRestore,
          version: r.version + 1, // Incrementar a versão ao restaurar também
          updatedAt: now,
          history: [currentAsHistory, ...(r.history?.filter(h => h.version !== version) || [])]
        };
      }
      return r;
    }));
    alert(`Recurso restaurado com sucesso para a versão ${version}.`);
  };

  const handleCreateProject = (project: Omit<Project, 'id' | 'user'>) => {
    const newProject: Project = {
      ...project,
      id: Math.floor(1000 + Math.random() * 9000).toString(), // Generate a 4-digit ID
      user: user.name,
      email: project.email || '',
      type: project.type || 'Assistente'
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject.id;
  };

  const handleAddComment = (projectId: string, content: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
      ? { 
          ...p, 
          comments: [
            ...(p.comments || []), 
            { 
              id: `c-${Date.now()}`, 
              user: user.name, 
              content, 
              timestamp: new Date().toISOString() 
            }
          ] 
        }
      : p
    ));
  };

  const handleAddSubtask = (projectId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'status'>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
      ? { 
          ...p, 
          subtasks: [
            ...(p.subtasks || []), 
            { 
              ...subtask,
              id: `st-${Date.now()}`, 
              createdAt: new Date().toISOString(),
              status: 'Pendente'
            }
          ] 
        }
      : p
    ));
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev
      .filter(r => r.id !== id)
      .map(r => ({
        ...r,
        linkedDocs: r.linkedDocs?.filter(docId => docId !== id)
      }))
    );
  };

  const handleNewConversation = (resourceId: string): string => {
    const id = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newConv: Conversation = {
      id,
      title: `Conversa ${conversations.length + 1}`,
      resourceId,
      messages: [],
      updatedAt: new Date().toLocaleTimeString()
    };
    setConversations(prev => [newConv, ...prev]);
    return id;
  };

  const handleAddMessage = (convId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const isFirstMessage = conv.messages.length === 0;
        const newTitle = isFirstMessage 
          ? (message.content.length > 40 ? message.content.substring(0, 40) + '...' : message.content)
          : conv.title;
          
        return { 
          ...conv, 
          messages: [...conv.messages, message], 
          updatedAt: new Date().toLocaleTimeString(),
          title: newTitle
        };
      }
      return conv;
    }));
  };

  const handleApproveRequest = (id: string) => {
    const request = accessRequests.find(req => req.id === id);
    if (!request) return;

    let isFullyApproved = false;

    setAccessRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updatedReq = { ...req };
        if (updatedReq.requiresDoubleApproval) {
          if (!updatedReq.ownerApproved) {
            updatedReq.ownerApproved = true;
          } else if (!updatedReq.iaTeamApproved) {
            updatedReq.iaTeamApproved = true;
            updatedReq.status = 'APPROVED';
            isFullyApproved = true;
          }
        } else {
          updatedReq.status = 'APPROVED';
          isFullyApproved = true;
        }
        return updatedReq;
      }
      return req;
    }));

    // Se for uma solicitação de promoção e foi totalmente aprovada, atualiza o ambiente do recurso
    if (request.resourceCategory === 'Promoção' && (isFullyApproved || (!request.requiresDoubleApproval))) {
      // Nota: isFullyApproved é setado no mesmo loop síncrono da lógica acima se não for double approval
      // Mas para garantir, podemos checar as condições
      const willBeApproved = !request.requiresDoubleApproval || (request.ownerApproved && !request.iaTeamApproved);
      
      if (willBeApproved) {
        setResources(prev => prev.map(res => 
          res.id === request.resourceId ? { ...res, environment: ResourceEnvironment.PRODUCTION } : res
        ));
        alert(`O recurso "${request.resourceName}" foi promovido para o ambiente de PRODUÇÃO com sucesso!`);
      }
    }

    // Simulação de integração com Jira
    if (systemWebhookUrl) {
      fetch(systemWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REQUEST_APPROVED',
          jira_sync: true,
          request
        })
      }).catch(err => console.error("Jira sync failed:", err));
    }
  };

  const handleRejectRequest = (id: string) => {
    setAccessRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'REJECTED' } : req
    ));
  };

  const handleCreateRequest = async (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação' | 'Promoção', reason?: string) => {
    const isGestorDeBase = resourceName === 'Gestor de Base';
    const resource = resources.find(r => r.id === resourceId);
    
    // Simular o email do criador (em um app real seria buscado via API)
    const resourceOwnerEmail = isGestorDeBase ? 'kristofer.pinheiro@zucchetti.com.br' : (resource?.creatorId === 'system' ? 'gabrielli.carvalho@zucchetti.com.br' : 'gabrielli.carvalho@zucchetti.com.br');

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userBU: 'ERP', // Default BU
      resourceId,
      resourceName,
      resourceCategory: category,
      status: 'PENDING',
      timestamp: new Date().toLocaleString(),
      reason: reason || 'Solicitação via interface do sistema.',
      requiresDoubleApproval: isGestorDeBase,
      ownerApproved: false,
      iaTeamApproved: false,
      resourceOwnerEmail: resourceOwnerEmail
    };

    setAccessRequests(prev => [newRequest, ...prev]);

    if (systemWebhookUrl) {
      try {
        await fetch(systemWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ACCESS_REQUEST_CREATED',
            request: newRequest
          })
        });
      } catch (error) {
        console.error("Failed to send system webhook:", error);
      }
    }
  };

  const visibleResources = resources.filter(res => 
    res.environment === ResourceEnvironment.PRODUCTION || 
    res.creatorId === user.id || 
    user.role === UserRole.ADMINISTRATOR
  );

  useEffect(() => {
    if (activeResource && !visibleResources.find(r => r.id === activeResource.id)) {
      setActiveResource(visibleResources[0] || null);
    } else if (!activeResource && visibleResources.length > 0) {
      setActiveResource(visibleResources[0]);
    }
  }, [visibleResources, activeResource]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar userRole={user.role} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header 
            user={user} 
            onRoleChange={handleRoleChange} 
            resources={visibleResources}
            activeResource={activeResource}
            setActiveResource={setActiveResource}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onSaveTranscript={handleSaveTranscript}
            savedTranscripts={savedTranscripts}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          
          {/* Removido o overflow-y-auto global para permitir que o Chat controle seu próprio scroll de 100% de altura */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/chat" element={
                <ChatPage 
                  user={user} 
                  activeResource={activeResource} 
                  conversations={conversations}
                  onAddMessage={handleAddMessage}
                  onNewConversation={handleNewConversation}
                  onCreateRequest={handleCreateRequest}
                  resources={visibleResources}
                  setActiveResource={setActiveResource}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  setConversations={setConversations}
                />
              } />
              <Route path="/resources" element={
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <ResourceManagementPage 
                    user={user}
                    resources={resources} 
                    projects={projects}
                    onCreateResource={handleCreateResource}
                    onUpdateResource={handleUpdateResource}
                    onDeleteResource={handleDeleteResource}
                    onCreateRequest={handleCreateRequest}
                    onRollback={handleRollbackResource}
                  />
                </div>
              } />
              <Route path="/resources/create" element={
                <CreateResourcePage 
                  user={user}
                  resources={resources}
                  projects={projects}
                  tools={tools}
                  onSaveTool={(t: Tool) => {
                    setTools(prev => {
                      const idx = prev.findIndex(item => item.id === t.id);
                      if (idx > -1) {
                        const copy = [...prev];
                        copy[idx] = t;
                        return copy;
                      } else {
                        return [...prev, t];
                      }
                    });
                  }}
                  onCreateResource={handleCreateResource}
                  onUpdateResource={handleUpdateResource}
                  onDeleteResource={handleDeleteResource}
                  onCreateRequest={handleCreateRequest}
                />
              } />
              <Route path="/resources/edit/:id" element={
                <CreateResourcePage 
                  user={user}
                  resources={resources}
                  projects={projects}
                  tools={tools}
                  onSaveTool={(t: Tool) => {
                    setTools(prev => {
                      const idx = prev.findIndex(item => item.id === t.id);
                      if (idx > -1) {
                        const copy = [...prev];
                        copy[idx] = t;
                        return copy;
                      } else {
                        return [...prev, t];
                      }
                    });
                  }}
                  onCreateResource={handleCreateResource}
                  onUpdateResource={handleUpdateResource}
                  onDeleteResource={handleDeleteResource}
                  onCreateRequest={handleCreateRequest}
                />
              } />
              <Route path="/lab" element={
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <LabPage 
                    user={user}
                    projects={projects} 
                    onCreateProject={handleCreateProject}
                    onAddComment={handleAddComment}
                    onAddSubtask={handleAddSubtask}
                  />
                </div>
              } />
              <Route path="/audit" element={<div className="flex-1 overflow-y-auto bg-slate-50"><AuditLogsPage /></div>} />
              <Route path="/luna-monitoring" element={<LunaMonitoringPage isDarkMode={isDarkMode} />} />
              <Route path="/docs" element={<div className="flex-1 overflow-y-auto bg-slate-50"><DocumentationPage /></div>} />
              <Route path="/access-requests" element={
                user.role === UserRole.ADMINISTRATOR ? (
                  <div className="flex-1 overflow-y-auto bg-slate-50">
                    <AccessRequestsPage 
                      requests={accessRequests}
                      onApprove={handleApproveRequest}
                      onReject={handleRejectRequest}
                    />
                  </div>
                ) : (
                  <Navigate to="/chat" replace />
                )
              } />
              <Route path="/apps" element={<div className="flex-1 overflow-y-auto bg-slate-50"><AppsPage /></div>} />
              <Route path="/whatsapp-monitor" element={<WhatsAppMonitorPage />} />
              <Route path="/itau-upload" element={<ItauLeadUploadPage />} />
              <Route path="/znote/*" element={<ZnoteLayout />} />
            </Routes>
          </main>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppInner />
    </Router>
  );
};

export default App;
