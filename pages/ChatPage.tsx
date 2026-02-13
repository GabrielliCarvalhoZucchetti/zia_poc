
import React, { useState, useRef, useEffect } from 'react';
import { User, Resource, Message, Conversation, UserRole, AgentType } from '../types';
import { Icons, canUserAccessResource } from '../constants';
import { generateAgentResponse } from '../services/geminiService';

interface ChatPageProps {
  user: User;
  activeResource: Resource | null;
  conversations: Conversation[];
  onAddMessage: (convId: string, message: Message) => void;
  onNewConversation: (resourceId: string) => string;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  user, 
  activeResource, 
  conversations, 
  onAddMessage,
  onNewConversation
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isTyping]);

  useEffect(() => {
    if (activeResource && !currentConvId) {
       const id = onNewConversation(activeResource.id);
       setCurrentConvId(id);
    }
  }, [activeResource]);

  const currentConversation = conversations.find(c => c.id === currentConvId);

  const handleSend = async () => {
    if (!input.trim() || !activeResource || !currentConvId) return;

    if (!canUserAccessResource(user.role, activeResource.requiredRole)) {
      alert(`Você não tem permissão para acessar ${activeResource.name}. Necessário: ${activeResource.requiredRole}`);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      agentId: activeResource.id
    };

    onAddMessage(currentConvId, userMsg);
    setInput('');
    setIsTyping(true);

    if (activeResource.agentType === AgentType.WRITING) {
      setActionFeedback(`O agente ${activeResource.name} está processando e gravando os dados...`);
    } else if (activeResource.agentType === AgentType.ACTION) {
      setActionFeedback(`O agente ${activeResource.name} está executando ações autorizadas no sistema...`);
    }

    const history = currentConversation?.messages.map(m => ({ role: m.role, content: m.content })) || [];
    const aiResponse = await generateAgentResponse(input, history, activeResource.prompt);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString(),
      agentId: activeResource.id
    };

    onAddMessage(currentConvId, botMsg);
    setIsTyping(false);
    setActionFeedback(null);
  };

  if (!activeResource) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
          <Icons.Chat />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo à ZIA</h2>
        <p className="text-slate-500 max-w-md">Selecione um Agente de IA para começar.</p>
      </div>
    );
  }

  const hasPermission = canUserAccessResource(user.role, activeResource.requiredRole);

  const agentTypeLabels: Record<AgentType, string> = {
    [AgentType.READING]: 'Leitura',
    [AgentType.WRITING]: 'Escrita',
    [AgentType.INTERPRETATION]: 'Interpretação',
    [AgentType.ACTION]: 'Ação'
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Menu lateral de Histórico (Estendido até embaixo) */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0 h-full">
        <div className="p-4">
          <button 
            onClick={() => setCurrentConvId(onNewConversation(activeResource.id))}
            className="w-full flex items-center justify-between gap-2 py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all text-sm shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Icons.Plus />
              Nova Conversa
            </div>
            <div className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tight">Alt+N</div>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico do Recurso</div>
          {conversations.filter(c => c.resourceId === activeResource.id).map(conv => (
            <button
              key={conv.id}
              onClick={() => setCurrentConvId(conv.id)}
              className={`w-full text-left p-3 rounded-xl group transition-all relative ${
                currentConvId === conv.id ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-semibold truncate pr-4">{conv.title}</div>
              <div className="text-[9px] text-slate-400 font-medium mt-1">{conv.updatedAt}</div>
              {currentConvId === conv.id && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full"></div>}
            </button>
          ))}
          {conversations.filter(c => c.resourceId === activeResource.id).length === 0 && (
            <div className="text-center py-10 px-4 text-xs text-slate-400 italic">Sem conversas anteriores.</div>
          )}
        </div>

        <div className="p-4 border-t border-slate-50">
           <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
              <div className="text-2xl">{activeResource.icon}</div>
              <div className="flex-1 min-w-0">
                 <div className="text-xs font-bold text-slate-800 truncate">{activeResource.name}</div>
                 <div className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">Status: Ativo</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Área Principal de Chat */}
      <main className="flex-1 flex flex-col bg-white h-full relative overflow-hidden">
        
        {/* Lista de Mensagens (Ocupa o centro e estende até o fundo) */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-12">
            
            {/* Header de Contexto Inicial */}
            {(!currentConversation || currentConversation.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="text-6xl mb-6">{activeResource.icon}</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">O que posso fazer como {activeResource.name}?</h2>
                <p className="text-slate-500 text-lg max-w-lg mb-8">{activeResource.description}</p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                   {['Como você funciona?', 'Quais meus limites?', 'Resuma o projeto', 'Próximas ações'].map(q => (
                     <button 
                      key={q}
                      onClick={() => setInput(q)}
                      className="p-3 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-left"
                     >
                        "{q}"
                     </button>
                   ))}
                </div>
              </div>
            )}

            {currentConversation?.messages.map((msg) => (
              <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex gap-6 items-start">
                  <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg shadow-sm ${
                    msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {msg.role === 'user' ? 'U' : activeResource.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {msg.role === 'user' ? 'Você' : activeResource.name}
                    </div>
                    <div className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-6 items-start animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg">{activeResource.icon}</div>
                <div className="flex-1 space-y-3 py-2">
                   <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                   <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        </div>

        {/* Feedback de Ação Flutuante */}
        {actionFeedback && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white border border-sky-100 shadow-xl px-5 py-2.5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-20">
            <div className="flex gap-1">
               <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
               <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-xs font-bold text-sky-800">{actionFeedback}</span>
          </div>
        )}

        {/* Área de Entrada (Estilo ChatGPT - Perto do fundo) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 z-10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="relative flex flex-col items-center">
              
              <div className="w-full relative shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200 bg-white group focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50 transition-all duration-300">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSend();
                     }
                  }}
                  disabled={!hasPermission}
                  placeholder={hasPermission ? `Envie uma mensagem para ${activeResource.name}...` : `Sem permissão para este recurso.`}
                  className="w-full bg-transparent px-5 py-4 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none min-h-[56px] max-h-[200px] text-sm leading-relaxed"
                  rows={1}
                />
                <div className="absolute right-3 bottom-3">
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || !hasPermission || isTyping}
                    className="w-10 h-10 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-300 shadow-lg shadow-slate-200 disabled:shadow-none"
                  >
                    <Icons.Send />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-[10px] text-slate-400 font-medium tracking-tight">
                ZIA pode cometer erros. Considere verificar informações importantes.
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ChatPage;
