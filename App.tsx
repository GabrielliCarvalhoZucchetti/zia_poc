
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Resource, ResourceType, AgentType, Conversation, Message } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatPage from './pages/ChatPage';
import ResourceManagementPage from './pages/ResourceManagementPage';
import DocumentationPage from './pages/DocumentationPage';
import LabPage from './pages/LabPage';
import AuditLogsPage from './pages/AuditLogsPage';
import MonitoringPage from './pages/MonitoringPage';

const INITIAL_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Assistente Geral', description: 'IA multiuso para tarefas diárias.', type: ResourceType.AGENT, agentType: AgentType.READING, requiredRole: UserRole.BASIC, icon: '⚡', createdAt: '2025-01-10' },
  { id: 'r2', name: 'Doc ClippPro', description: 'Documentação oficial do produto.', type: ResourceType.DOCUMENTATION, requiredRole: UserRole.BASIC, icon: '📚', createdAt: '2025-01-12' },
  { id: 'r3', name: 'Gestor de Base', description: 'Manipula escritas e updates de dados.', type: ResourceType.AGENT, agentType: AgentType.WRITING, requiredRole: UserRole.ADVANCED, icon: '💾', createdAt: '2025-02-05' },
  { id: 'r4', name: 'Auditor de Sistema', description: 'Analisa logs de execução.', type: ResourceType.AGENT, agentType: AgentType.INTERPRETATION, requiredRole: UserRole.ADMINISTRATOR, icon: '🛡️', createdAt: '2025-02-10' },
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

  const handleRoleChange = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const handleCreateResource = (res: Omit<Resource, 'id' | 'createdAt'>) => {
    const newRes: Resource = {
      ...res,
      id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setResources(prev => [...prev, newRes]);
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

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header 
            user={user} 
            onRoleChange={handleRoleChange} 
            resources={resources}
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
                />
              } />
              <Route path="/resources" element={
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <ResourceManagementPage 
                    resources={resources} 
                    onCreateResource={handleCreateResource}
                    onDeleteResource={handleDeleteResource}
                  />
                </div>
              } />
              <Route path="/lab" element={<div className="flex-1 overflow-y-auto bg-slate-50"><LabPage /></div>} />
              <Route path="/audit" element={<div className="flex-1 overflow-y-auto bg-slate-50"><AuditLogsPage /></div>} />
              <Route path="/monitoring" element={<div className="flex-1 overflow-y-auto bg-slate-50"><MonitoringPage /></div>} />
              <Route path="/docs" element={<div className="flex-1 overflow-y-auto bg-slate-50"><DocumentationPage /></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
