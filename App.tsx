
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Resource, ResourceType, AgentType, Conversation, Message, ResourceEnvironment } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPage from './pages/ChatPage';
import ResourceManagementPage from './pages/ResourceManagementPage';
import DocumentationPage from './pages/DocumentationPage';
import LabPage from './pages/LabPage';
import AuditLogsPage from './pages/AuditLogsPage';
import MonitoringPage from './pages/MonitoringPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import { AccessRequest } from './types';

const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Assistente Geral', description: 'Assistente central conectado a todos os agentes disponíveis de acordo com seu perfil e permissões. Identifica automaticamente o especialista necessário para sua pergunta, permitindo também a seleção manual de qualquer assistente ao qual você tenha acesso.', type: ResourceType.AGENT, agentType: AgentType.READING, requiredRole: UserRole.BASIC, createdAt: '2025-01-10', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system' },
  { id: 'r2', name: 'Doc ClippPro', description: 'Documentação oficial do produto.', type: ResourceType.DOCUMENTATION, requiredRole: UserRole.BASIC, createdAt: '2025-01-12', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system' },
  { id: 'r3', name: 'Gestor de Base', description: 'Manipula escritas e updates de dados.', type: ResourceType.AGENT, agentType: AgentType.WRITING, requiredRole: UserRole.ADVANCED, createdAt: '2025-02-05', environment: ResourceEnvironment.STAGING, creatorId: 'system' },
  { id: 'r4', name: 'Auditor de Sistema', description: 'Analisa logs de execução.', type: ResourceType.AGENT, agentType: AgentType.INTERPRETATION, requiredRole: UserRole.ADMINISTRATOR, createdAt: '2025-02-10', environment: ResourceEnvironment.STAGING, creatorId: 'system' },
  { id: 'm1', name: 'GPT-4', description: 'Modelo de linguagem de alta performance da OpenAI.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system' },
  { id: 'm2', name: 'GPT-5-nano', description: 'Próxima geração de modelos compactos e eficientes.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system' },
  { id: 'm3', name: 'Claude 3.5', description: 'Modelo avançado da Anthropic com foco em raciocínio.', type: ResourceType.MARKET_MODEL, requiredRole: UserRole.BASIC, createdAt: '2025-03-01', environment: ResourceEnvironment.PRODUCTION, creatorId: 'system' },
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
    reason: 'Preciso atualizar os dados de faturamento do mês passado.'
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

const App: React.FC = () => {
  const [user, setUser] = useState<User>({
    id: 'u1',
    name: 'Joao Silva',
    role: UserRole.ADMINISTRATOR,
    avatar: 'https://picsum.photos/seed/zia-user/100/100'
  });

  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [activeResource, setActiveResource] = useState<Resource | null>(INITIAL_RESOURCES[0]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [systemWebhookUrl, setSystemWebhookUrl] = useState<string>('');

  const handleRoleChange = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const handleCreateResource = (res: Omit<Resource, 'id' | 'createdAt' | 'environment' | 'creatorId'>) => {
    const newRes: Resource = {
      ...res,
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0],
      environment: ResourceEnvironment.STAGING,
      creatorId: user.id
    };
    setResources(prev => [...prev, newRes]);
  };

  const handleUpdateResource = (updatedRes: Resource) => {
    setResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
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
    setConversations(prev => prev.map(conv => 
      conv.id === convId 
      ? { ...conv, messages: [...conv.messages, message], updatedAt: new Date().toLocaleTimeString() }
      : conv
    ));
  };

  const handleApproveRequest = (id: string) => {
    setAccessRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'APPROVED' } : req
    ));
    // Em um app real, aqui também atualizaríamos as permissões do usuário para o recurso
  };

  const handleRejectRequest = (id: string) => {
    setAccessRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'REJECTED' } : req
    ));
  };

  const handleCreateRequest = async (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação') => {
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
      reason: 'Solicitação via interface do chat.'
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

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar userRole={user.role} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header 
            user={user} 
            onRoleChange={handleRoleChange} 
            resources={visibleResources}
            activeResource={activeResource}
            setActiveResource={setActiveResource}
          />
          
          {/* Removido o overflow-y-auto global para permitir que o Chat controle seu próprio scroll de 100% de altura */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={
                <ChatPage 
                  user={user} 
                  activeResource={activeResource} 
                  conversations={conversations}
                  onAddMessage={handleAddMessage}
                  onNewConversation={handleNewConversation}
                  onCreateRequest={handleCreateRequest}
                />
              } />
              <Route path="/resources" element={
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <ResourceManagementPage 
                    user={user}
                    resources={resources} 
                    onCreateResource={handleCreateResource}
                    onUpdateResource={handleUpdateResource}
                    onDeleteResource={handleDeleteResource}
                  />
                </div>
              } />
              <Route path="/lab" element={<div className="flex-1 overflow-y-auto bg-slate-50"><LabPage /></div>} />
              <Route path="/audit" element={<div className="flex-1 overflow-y-auto bg-slate-50"><AuditLogsPage /></div>} />
              <Route path="/monitoring" element={<div className="flex-1 overflow-y-auto bg-slate-50"><MonitoringPage systemWebhookUrl={systemWebhookUrl} onUpdateSystemWebhook={setSystemWebhookUrl} /></div>} />
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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
