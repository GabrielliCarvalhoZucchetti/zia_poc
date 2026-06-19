import React, { useState, useRef, useEffect } from 'react';
import { User, Resource, Message, Conversation, UserRole, AgentType, Attachment, ResourceType, ResourceEnvironment } from '../types';
import { Icons, canUserAccessResource } from '../constants';
import { generateAgentResponse } from '../services/geminiService';

interface ChatPageProps {
  user: User;
  activeResource: Resource | null;
  conversations: Conversation[];
  onAddMessage: (convId: string, message: Message) => void;
  onNewConversation: (resourceId: string) => string;
  onCreateRequest?: (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação', reason?: string) => void;
  resources: Resource[];
  setActiveResource: (resource: Resource) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  user, 
  activeResource, 
  conversations, 
  onAddMessage,
  onNewConversation,
  onCreateRequest,
  resources,
  setActiveResource
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [requestSent, setRequestSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [chatMode, setChatMode] = useState<'assistants' | 'models'>(() => {
    if (activeResource && activeResource.type === ResourceType.MARKET_MODEL) {
      return 'models';
    }
    return 'assistants';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isTyping]);

  // Sincroniza a conversa ativa com base no recurso ativo selecionado
  useEffect(() => {
    if (!activeResource) return;

    // Se a conversa atual não for do recurso ativo, procura uma anterior ou cria nova
    const currentConv = conversations.find(c => c.id === currentConvId);
    if (!currentConv || currentConv.resourceId !== activeResource.id) {
      const lastConvForResource = conversations.find(c => c.resourceId === activeResource.id);
      if (lastConvForResource) {
        setCurrentConvId(lastConvForResource.id);
      } else {
        const id = onNewConversation(activeResource.id);
        setCurrentConvId(id);
      }
    }

    // Sincroniza o chatMode baseado no tipo do recurso selecionado
    if (activeResource.type === ResourceType.MARKET_MODEL) {
      setChatMode('models');
    } else {
      setChatMode('assistants');
    }
  }, [activeResource?.id]);

  const currentConversation = conversations.find(c => c.id === currentConvId);

  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConvId(conv.id);
    const associatedResource = resources.find(r => r.id === conv.resourceId);
    if (associatedResource) {
      setActiveResource(associatedResource);
      if (associatedResource.type === ResourceType.MARKET_MODEL) {
        setChatMode('models');
      } else {
        setChatMode('assistants');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file: File) => {
      let type: Attachment['type'] = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file), // In a real app, this would be a server upload URL
        size: file.size
      };
    });

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    let url = linkInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const newLink: Attachment = {
      id: `att-link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: url.replace(/^https?:\/\//, '').split('/')[0],
      type: 'link',
      url: url
    };

    setPendingAttachments(prev => [...prev, newLink]);
    setLinkInput('');
    setShowLinkModal(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio: Attachment = {
          id: `att-voice-${Date.now()}`,
          name: `Mensagem de Voz ${new Date().toLocaleTimeString()}`,
          type: 'audio',
          url: audioUrl,
          size: audioBlob.size
        };
        setPendingAttachments(prev => [...prev, newAudio]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingAttachments.length === 0) || !activeResource || !currentConvId) return;

    if (!canUserAccessResource(user.role, activeResource.requiredRole)) {
      if (onCreateRequest) {
        onCreateRequest(
          activeResource.id, 
          activeResource.name, 
          activeResource.type === ResourceType.AGENT ? 'Agente' : 'Assistente',
          input
        );
        setRequestSent(true);
        setInput('');
      } else {
        alert(`Você não tem permissão para acessar ${activeResource.name}. Necessário: ${activeResource.requiredRole}`);
      }
      return;
    }

    const userMsg: Message = {
      id: `m-u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      agentId: activeResource.id,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    onAddMessage(currentConvId, userMsg);
    setInput('');
    setPendingAttachments([]);
    setIsTyping(true);

    if (activeResource.agentType === AgentType.WRITING) {
      setActionFeedback(`O agente ${activeResource.name} está processando e gravando os dados...`);
    } else if (activeResource.agentType === AgentType.ACTION) {
      setActionFeedback(`O agente ${activeResource.name} está executando ações autorizadas no sistema...`);
    }

    const history = currentConversation?.messages.map(m => ({ role: m.role, content: m.content })) || [];
    
    // Se for um modelo de mercado, adicionamos uma instrução extra para simular o comportamento
    const systemInstruction = activeResource.type === ResourceType.MARKET_MODEL 
      ? `Você é o modelo ${activeResource.name}. Responda de forma precisa e útil, mantendo a identidade deste modelo específico. ${activeResource.prompt || ''}`
      : activeResource.prompt;

    const aiResponse = activeResource.webhookUrl 
      ? await (async () => {
          try {
            const response = await fetch(activeResource.webhookUrl!, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: input,
                user: { id: user.id, name: user.name, role: user.role },
                resource: { id: activeResource.id, name: activeResource.name },
                history: history,
                attachments: userMsg.attachments
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              // Tenta extrair a resposta de campos comuns ou retorna o JSON formatado
              return data.response || data.output || data.message || data.text || (typeof data === 'string' ? data : JSON.stringify(data, null, 2));
            } else {
              return `⚠️ Erro no Webhook (${response.status}): Não foi possível processar a solicitação externamente.`;
            }
          } catch (error) {
            console.error("Webhook error:", error);
            return "❌ Falha na conexão com o Webhook externo. Verifique se a URL está correta e se o serviço (n8n, Lovable, etc.) está aceitando requisições.";
          }
        })()
      : await generateAgentResponse(input, history, systemInstruction);

    const botMsg: Message = {
      id: `m-a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString(),
      agentId: activeResource.id
    };

    onAddMessage(currentConvId, botMsg);
    setIsTyping(false);
    setActionFeedback(null);
  };

  const hasPermission = activeResource ? canUserAccessResource(user.role, activeResource.requiredRole) : true;

  const agentTypeLabels: Record<AgentType, string> = {
    [AgentType.READING]: 'Leitura',
    [AgentType.WRITING]: 'Escrita',
    [AgentType.INTERPRETATION]: 'Interpretação',
    [AgentType.ACTION]: 'Ação'
  };

  return (
    <div className="flex-1 flex h-full bg-[#f4f7fe] dark:bg-[#070b19] p-5 gap-5 overflow-hidden select-none">
      {/* Menu lateral de Histórico */}
      {sidebarOpen && (
        <aside className="w-72 flex flex-col gap-4 h-full shrink-0 animate-in slide-in-from-left duration-305">
          {/* MODO DE CONVERSA */}
          <div className="bg-white dark:bg-[#0d1222] border border-slate-200/60 dark:border-slate-800/80 shadow-xs rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
              MODO DE CONVERSA
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setChatMode('assistants');
                  setActiveResource(null as any);
                }}
                className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all font-bold cursor-pointer ${
                  chatMode === 'assistants'
                    ? 'bg-sky-50 text-[#0070E0] dark:bg-sky-950/40 dark:text-sky-300 font-extrabold shadow-xs'
                    : 'text-slate-705 hover:text-[#0070E0] dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-sky-955/20 dark:hover:text-sky-350'
                }`}
              >
                Conversar com assistentes
              </button>
              <button
                onClick={() => {
                  setChatMode('models');
                  setActiveResource(null as any);
                }}
                className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all font-bold cursor-pointer ${
                  chatMode === 'models'
                    ? 'bg-sky-50 text-[#0070E0] dark:bg-sky-950/40 dark:text-sky-300 font-extrabold shadow-xs'
                    : 'text-slate-705 hover:text-[#0070E0] dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-sky-955/20 dark:hover:text-sky-350'
                }`}
              >
                Conversar com modelos
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed px-1 font-medium select-none">
              {chatMode === 'assistants'
                ? 'Converse com os assistentes inteligentes internos especializados no seu ecossistema.'
                : 'Converse com os modelos premium de IA (como GPT, Claude e Gemini) diretamente no Playground.'}
            </p>
          </div>

          {/* + NOVA CONVERSA */}
          <button
            onClick={() => {
              if (activeResource) {
                setCurrentConvId(onNewConversation(activeResource.id));
              } else {
                const defaultRes = resources.find(r => 
                  chatMode === 'models' ? r.type === ResourceType.MARKET_MODEL : r.type !== ResourceType.MARKET_MODEL
                );
                if (defaultRes) {
                  setActiveResource(defaultRes);
                  setCurrentConvId(onNewConversation(defaultRes.id));
                }
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#0d1222] border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-55 dark:hover:bg-slate-800/20 text-slate-755 dark:text-slate-300 rounded-[14px] font-bold transition-all text-sm shadow-xs cursor-pointer hover:border-slate-300"
          >
            <Icons.Plus className="w-4 h-4 text-slate-500" />
            Nova Conversa
          </button>

          {/* HISTÓRICO */}
          <div className="bg-white dark:bg-[#0d1222] border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
              HISTÓRICO DE CONVERSAS
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {conversations.map(conv => {
                const assocResource = resources.find(r => r.id === conv.resourceId);
                const isMarketModel = assocResource?.type === ResourceType.MARKET_MODEL;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3 rounded-xl group transition-all relative flex flex-col gap-1 cursor-pointer ${
                      currentConvId === conv.id 
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 font-bold' 
                        : 'text-slate-600 hover:bg-slate-55 dark:text-slate-300 dark:hover:bg-slate-655'
                    }`}
                  >
                    <div className="text-sm font-semibold truncate pr-4 w-full">{conv.title}</div>
                    <div className="flex items-center gap-1.5 w-full">
                      {assocResource ? (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isMarketModel 
                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50 dark:bg-indigo-950/55 dark:text-indigo-400 dark:border-indigo-900/50' 
                            : 'bg-sky-50 text-sky-70 border border-sky-100/50 dark:bg-sky-955 dark:text-sky-350 dark:border-sky-900/50'
                        }`}>
                          {assocResource.name}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-550 border border-slate-200/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          Modelo Externo
                        </span>
                      )}
                      <span className="text-[8px] text-slate-400 font-medium ml-auto">11:33</span>
                    </div>
                    {currentConvId === conv.id && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full"></div>}
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className="text-center py-20 px-4 text-xs text-slate-400 dark:text-slate-500 italic select-none">
                  Nenhuma conversa ainda
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Botão de Toggle Lateral do Menu de Histórico */}
      <div className="flex flex-col justify-start pt-1.5 shrink-0">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-550 dark:hover:text-slate-350 transition-all p-2 bg-white dark:bg-[#0d1222] border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
          title={sidebarOpen ? "Ocultar Menu Histórico" : "Mostrar Menu Histórico"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d={sidebarOpen ? "m16 15-3-3 3-3" : "m12 9 3 3-3 3"} />
          </svg>
        </button>
      </div>

      {/* Área Principal de conversa (dentro de um Card elegante com cantos arredondados [24px]) */}
      <main className="flex-1 flex flex-col h-full bg-white dark:bg-[#0d1222] border border-slate-100 dark:border-slate-800/80 rounded-[24px] shadow-xs overflow-hidden relative">
        
        {/* Header do Playground */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between select-none shrink-0 min-h-[72px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/30 text-[#0070E0] dark:text-sky-450 rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-12">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#050C1F] dark:text-slate-100 tracking-tight">
                {chatMode === 'assistants' ? 'Conversar com assistentes' : 'Conversar com modelos'}
              </h1>
            </div>
          </div>

          {/* Seletor dropdown para selecionar o assistente/modelo */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">
              {chatMode === 'assistants' ? 'SELECIONE SEU ASSISTENTE:' : 'SELECIONE SEU MODELO:'}
            </span>
            <div className="relative">
              <select
                value={activeResource?.id || ''}
                onChange={(e) => {
                  const selectedRes = resources.find(r => r.id === e.target.value);
                  if (selectedRes) {
                    setActiveResource(selectedRes);
                  }
                }}
                className="appearance-none font-bold text-xs text-slate-650 dark:text-slate-350 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-850 px-4 py-2.5 pr-10 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs min-w-[200px]"
              >
                <option value="" disabled>
                  {chatMode === 'assistants' ? 'Selecionar Assistente' : 'Selecionar Modelo'}
                </option>
                {resources
                  .filter(r => chatMode === 'models' ? r.type === ResourceType.MARKET_MODEL : r.type !== ResourceType.MARKET_MODEL)
                  .map(res => (
                    <option key={res.id} value={res.id}>
                      {res.name}
                    </option>
                  ))
                }
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Icons.ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {!activeResource ? (
          /* Estado Placeholder de Seleção de Assistente */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0d1222] select-none">
            <div className="w-20 h-20 text-slate-200 dark:text-slate-700 mb-5 flex items-center justify-center animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-95 text-slate-300 dark:text-slate-700">
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M12 2v4" />
                <path d="M11 6h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-400/95 dark:text-slate-500 mb-2 tracking-tight">
              {chatMode === 'assistants' ? 'Selecione seu assistente' : 'Selecione seu modelo'}
            </h2>
            <p className="text-sm text-slate-400/80 dark:text-slate-500 max-w-sm leading-relaxed">
              Abra o menu no canto superior direito para escolher seu agente de Inteligência Artificial e iniciar o chat.
            </p>
          </div>
        ) : (
          /* Área de chat normal se o assistente/modelo estiver selecionado */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-500">
                
                {!hasPermission && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-white/65 dark:bg-slate-950/65 backdrop-blur-[2px]">
                    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl max-w-md text-center space-y-4">
                      <div className="w-12 h-12 bg-rose-50 dark:bg-rose-955/30 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                        <Icons.Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Acesso Restrito</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          Você não tem permissão para usar este recurso. Requer permissão: {activeResource.requiredRole}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensagem de Boas-vindas para chats vazios */}
                {(!currentConversation || currentConversation.messages.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-505">
                    <div className="w-14 h-14 bg-sky-50 dark:bg-sky-955/30 rounded-3xl flex items-center justify-center text-[#0070E0] mb-6 shadow-xs">
                      <Icons.Chat />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
                      O que posso fazer como {activeResource.name}?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-semibold">
                      Envie uma mensagem abaixo para interagir com este recurso de inteligência artificial.
                    </p>
                  </div>
                )}

                {/* Mensagens do Chat */}
                {currentConversation?.messages.map((msg) => (
                  <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex gap-6 items-start">
                      <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold shadow-xs select-none ${
                        msg.role === 'user' ? 'bg-[#0070E0] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/30'
                      }`}>
                        {msg.role === 'user' ? 'U' : activeResource.name[0]}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-2 select-none">
                          {msg.role === 'user' ? 'Você' : activeResource.name}
                        </div>
                        <div className="text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-6 items-start animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Icons.Chat className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-20" />
              </div>
            </div>

            {/* Input de Mensagem */}
            <div className="border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-[#0d1222] p-6 pb-4 shrink-0">
              <div className="max-w-3xl mx-auto px-4">
                <div className="relative flex flex-col items-center">
                  
                  {activeResource.name === 'Gestor de Base' && !requestSent ? (
                    <div className="w-full flex flex-col items-center gap-6 py-6 bg-sky-50/40 dark:bg-sky-955/10 rounded-[24px] border border-sky-105 dark:border-sky-900/40 animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-white dark:bg-[#111827] text-sky-600 dark:text-sky-450 rounded-2xl flex items-center justify-center shadow-sm border border-sky-150 dark:border-sky-900/50">
                        <Icons.Lock className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-2 px-6">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Uso sob Demanda: Gestor de Base</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm px-4">
                          Este agente requer aprovação dupla (Gestor do Recurso e Time de IA) para ser utilizado. Clique abaixo para iniciar o processo de solicitação.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (onCreateRequest) {
                            onCreateRequest(
                              activeResource.id, 
                              activeResource.name, 
                              'Agente',
                              'Solicitação de acesso ao Gestor de Base para análise de indicadores. Requer aprovação do proprietário e do Time de IA.'
                            );
                            setRequestSent(true);
                          }
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-sky-200/20 transition-all text-sm cursor-pointer"
                      >
                        <Icons.Check className="w-4 h-4" />
                        Solicitar Uso do Agente
                      </button>
                    </div>
                  ) : requestSent ? (
                    <div className="w-full flex items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                      <div className="w-10 h-10 bg-white dark:bg-[#111827] text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                        <Icons.Check className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Solicitação Enviada com Sucesso</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium font-semibold">Acompanhe o status em "Solicitações de Acesso". Fluxo de aprovação dupla iniciado.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111827] focus-within:border-[#0070E0] dark:focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-50 dark:focus-within:ring-sky-950/20 transition-all duration-300 overflow-hidden">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={`Envie uma mensagem para ${activeResource.name}...`}
                        className="w-full bg-transparent px-6 py-5 pr-40 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none min-h-[64px] max-h-[200px] text-sm leading-relaxed font-semibold"
                        rows={1}
                      />
                      
                      <div className="absolute right-4 bottom-4 flex items-center gap-3">
                        <button onClick={() => fileInputRef.current?.click()} className="text-slate-300 dark:text-slate-600 hover:text-slate-550 dark:hover:text-slate-400 transition-colors cursor-pointer">
                          <Icons.Paperclip className="w-5 h-5" />
                        </button>
                        <button onClick={() => setShowLinkModal(true)} className="text-slate-300 dark:text-slate-600 hover:text-slate-550 dark:hover:text-slate-400 transition-colors cursor-pointer">
                          <Icons.Link className="w-5 h-5" />
                        </button>
                        <button className="text-slate-300 dark:text-slate-600 hover:text-slate-550 transition-colors cursor-pointer">
                          <Icons.Mic className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className="w-10 h-10 bg-sky-50 dark:bg-sky-955 text-[#0070E0] dark:text-sky-400 rounded-xl flex items-center justify-center hover:bg-[#0070E0] hover:text-white dark:hover:bg-sky-500 transition-all disabled:bg-slate-50 disabled:text-slate-300 dark:disabled:bg-slate-900 dark:disabled:text-slate-700 cursor-pointer"
                        >
                          <Icons.Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {actionFeedback && (
                    <div className="mt-2 text-xs text-[#0070E0] dark:text-sky-400 font-bold animate-pulse">
                      {actionFeedback}
                    </div>
                  )}

                  <div className="mt-3.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight select-none">
                    Luna pode cometer erros. Considere verificar informações importantes.
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>

      {/* Input de arquivo invisível */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        multiple
      />

      {/* Modal para Adicionar Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}></div>
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-105">Adicionar Link</h2>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer">
                <Icons.X />
              </button>
            </div>
            <form onSubmit={handleAddLink} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">URL do Link</label>
                <input 
                  autoFocus
                  required
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  type="text" 
                  placeholder="https://exemplo.com" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-100/10 cursor-pointer">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
