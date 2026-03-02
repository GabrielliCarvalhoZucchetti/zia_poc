
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
  onCreateRequest?: (resourceId: string, resourceName: string, category: 'Agente' | 'Assistente' | 'Automação') => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  user, 
  activeResource, 
  conversations, 
  onAddMessage,
  onNewConversation,
  onCreateRequest
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

  useEffect(() => {
    if (activeResource && !currentConvId) {
       const id = onNewConversation(activeResource.id);
       setCurrentConvId(id);
    }
  }, [activeResource]);

  const currentConversation = conversations.find(c => c.id === currentConvId);

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
      alert(`Você não tem permissão para acessar ${activeResource.name}. Necessário: ${activeResource.requiredRole}`);
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
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sky-600 shadow-sm">
                 <Icons.Chat />
              </div>
              <div className="flex-1 min-w-0">
                 <div className="text-xs font-bold text-slate-800 truncate">{activeResource.name}</div>
                 <div className="text-[9px] text-slate-500 font-medium uppercase tracking-tighter">
                   Status: {activeResource.environment === ResourceEnvironment.PRODUCTION ? 'Ativo' : 'Homologação'}
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Área Principal do Playground */}
      <main className="flex-1 flex flex-col bg-white h-full relative overflow-hidden">
        
        {/* Lista de Mensagens (Ocupa o centro e estende até o fundo) */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-12">
            
            {!hasPermission && (
              <div className="absolute inset-0 z-30 flex items-center justify-center p-8 bg-white/60 backdrop-blur-[2px]">
                <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-2xl max-w-md text-center space-y-6 animate-in zoom-in fade-in duration-300">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
                    <Icons.Settings className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Acesso Restrito</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Você não possui o nível de permissão necessário ({activeResource.requiredRole}) para interagir com o agente <strong>{activeResource.name}</strong>.
                    </p>
                  </div>
                  
                  {requestSent ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-left">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                        <Icons.Check />
                      </div>
                      <div className="text-xs font-bold text-emerald-800">Solicitação Enviada! Aguarde a aprovação de um administrador.</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (onCreateRequest) {
                          onCreateRequest(activeResource.id, activeResource.name, activeResource.type === ResourceType.AGENT ? 'Agente' : 'Assistente');
                          setRequestSent(true);
                        }
                      }}
                      className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      <Icons.Plus />
                      Solicitar Acesso Agora
                    </button>
                  )}
                  
                  <div className="pt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    Governança ZIA • Protocolo RBAC
                  </div>
                </div>
              </div>
            )}

            {/* Header de Contexto Inicial */}
            {(!currentConversation || currentConversation.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                {activeResource.type !== ResourceType.MARKET_MODEL && (
                  <>
                    <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600 mb-6">
                      <Icons.Chat />
                    </div>
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
                  </>
                )}
                {activeResource.type === ResourceType.MARKET_MODEL && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6">
                      <Icons.Chat />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{activeResource.name}</h2>
                    <p className="text-slate-400 text-sm">Pronto para processar sua solicitação.</p>
                  </div>
                )}
              </div>
            )}

            {currentConversation?.messages.map((msg) => (
              <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex gap-6 items-start">
                  <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                    msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {msg.role === 'user' ? 'U' : activeResource.name[0]}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      {msg.role === 'user' ? 'Você' : activeResource.name}
                      {activeResource.type === ResourceType.MARKET_MODEL && msg.role === 'assistant' && (
                        <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-black">MODELO EXTERNO</span>
                      )}
                    </div>
                    <div className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {msg.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) => 
                        part.match(/^https?:\/\//) ? (
                          <a key={i} href={part} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline break-all">
                            {part}
                          </a>
                        ) : part
                      )}
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {msg.attachments.map(att => (
                          <div key={att.id} className="max-w-sm rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group/att">
                            {att.type === 'image' && (
                              <img src={att.url} alt={att.name} className="max-h-64 w-auto object-contain" />
                            )}
                            {att.type === 'video' && (
                              <video src={att.url} controls className="max-h-64 w-auto" />
                            )}
                            {att.type === 'audio' && (
                              <div className="p-4 flex items-center gap-3 min-w-[240px]">
                                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                                  <Icons.Audio />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">{att.name}</div>
                                  <audio src={att.url} controls className="h-8 w-full mt-2" />
                                </div>
                              </div>
                            )}
                            {att.type === 'document' && (
                              <a href={att.url} target="_blank" rel="noreferrer" className="p-4 flex items-center gap-3 min-w-[200px] hover:bg-slate-100 transition-colors">
                                <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center">
                                  <Icons.File />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">{att.name}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Documento</div>
                                </div>
                              </a>
                            )}
                            {att.type === 'link' && (
                              <a href={att.url} target="_blank" rel="noreferrer" className="p-4 flex items-center gap-3 min-w-[200px] hover:bg-slate-100 transition-colors">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                  <Icons.Link />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">{att.name}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Link Externo</div>
                                </div>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
              
              {pendingAttachments.length > 0 && (
                <div className="w-full flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2">
                  {pendingAttachments.map(att => (
                    <div key={att.id} className="relative group">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl pr-8">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-500 shadow-sm">
                          {att.type === 'image' && <Icons.Image />}
                          {att.type === 'video' && <Icons.Video />}
                          {att.type === 'audio' && <Icons.Audio />}
                          {att.type === 'document' && <Icons.File />}
                          {att.type === 'link' && <Icons.Link />}
                        </div>
                        <div className="max-w-[120px] truncate text-[10px] font-bold text-slate-700">{att.name}</div>
                      </div>
                      <button 
                        onClick={() => removeAttachment(att.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-md"
                      >
                        <Icons.X />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                  disabled={!hasPermission || isRecording}
                  placeholder={isRecording ? `Gravando áudio... ${formatDuration(recordingDuration)}` : (hasPermission ? `Envie uma mensagem para ${activeResource.name}...` : `Sem permissão para este recurso.`)}
                  className={`w-full bg-transparent px-5 py-4 pr-36 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none min-h-[56px] max-h-[200px] text-sm leading-relaxed ${isRecording ? 'italic text-red-500' : ''}`}
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {!isRecording ? (
                    <>
                      <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!hasPermission || isTyping}
                        className="w-10 h-10 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-all"
                        title="Anexar arquivo"
                      >
                        <Icons.Paperclip />
                      </button>
                      <button 
                        onClick={() => setShowLinkModal(true)}
                        disabled={!hasPermission || isTyping}
                        className="w-10 h-10 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center transition-all"
                        title="Adicionar link"
                      >
                        <Icons.Link />
                      </button>
                      <button 
                        onClick={startRecording}
                        disabled={!hasPermission || isTyping}
                        className="w-10 h-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
                        title="Gravar áudio"
                      >
                        <Icons.Mic />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={stopRecording}
                      className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all animate-pulse shadow-lg shadow-red-100"
                      title="Parar gravação"
                    >
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </button>
                  )}
                  <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && pendingAttachments.length === 0) || !hasPermission || isTyping || isRecording}
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

      {/* Modal para Adicionar Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Link</h2>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
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
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLinkModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-100">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
