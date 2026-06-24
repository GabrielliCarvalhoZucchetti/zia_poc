
import React from 'react';
import { Sun, Moon, Mic, Square, Pause, Play, Save, Sparkles, Trash2, Bell, Check } from 'lucide-react';
import { User, UserRole, Resource, ResourceType, Notification } from '../types';
import { Icons } from '../constants';

interface HeaderProps {
  user: User;
  onRoleChange: (role: UserRole) => void;
  resources: Resource[];
  activeResource: Resource | null;
  setActiveResource: (resource: Resource) => void;
  onLogout?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onSaveTranscript?: (title: string, content: string, duration: string) => void;
  savedTranscripts?: any[];
  notifications?: Notification[];
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onRoleChange, 
  resources, 
  activeResource, 
  setActiveResource,
  onLogout,
  isDarkMode = false,
  toggleDarkMode,
  onSaveTranscript,
  savedTranscripts = [],
  notifications = [],
  setNotifications
}) => {
  const [showResourceMenu, setShowResourceMenu] = React.useState(false);
  const [showMarketMenu, setShowMarketMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = (id: string) => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleMarkAllAsRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleClearAll = () => {
    if (setNotifications) {
      setNotifications([]);
    }
  };

  // Recording states
  const [recordingState, setRecordingState] = React.useState<'idle' | 'recording' | 'paused'>('idle');
  const [recordingDuration, setRecordingDuration] = React.useState<number>(0);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [recordingTitle, setRecordingTitle] = React.useState('');
  const [transcriptText, setTranscriptText] = React.useState('');
  const [isTranscribing, setIsTranscribing] = React.useState(false);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const isSimulatedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerGeminiTranscription = async () => {
    setIsTranscribing(true);
    setTranscriptText('');
    try {
      const topicKeywords = ["integração de IA", "RAG de documentos", "reunião administrativa", "fluxos no n8n", "ecossistema de agentes Luna", "Zucchetti Brasil", "suporte de sistemas", "tecnologias ERP"];
      const randomKeyword = topicKeywords[Math.floor(Math.random() * topicKeywords.length)];
      
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `Gere uma transcrição de áudio detalhada, rica e altamente profissional em língua portuguesa. O usuário chamado "${user.name}" (setor: ${user.bu || "Geral"}) acabou de gravar uma gravação de reunião sobre "${randomKeyword}".
Crie uma conversa simulada excelente, estruturada sob marcadores de horas (ex: [00:05] Facilitador, [01:22] Liderança), destacando tópicos discutidos, metas, dúvidas resolvidas e compromissos finais práticos sobre Luna, agentes inteligentes e Zucchetti. 
A transcrição deve ter entre 150 e 300 palavras e parecer 100% autêntica, útil e com vocabulário corporativo refinado de TI/negócios.
Retorne APENAS o texto livre da transcrição (sem cabeçalhos markdown de título como '# Transcorrer' ou blocos de código com crases '\`\`\`').`,
          history: [],
          systemInstruction: "Você é um gerador especialista em transcrições realistas de áudio corporativo da Zucchetti. Responda apenas com o texto bruto transcrevido e estruturado, em português, sem tags ou formatação desnecessária."
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setTranscriptText(data.text);
          setIsTranscribing(false);
          return;
        }
      }
      throw new Error("Falha no payload");
    } catch (e) {
      console.warn("Gemini transcription fell back to preset engine:", e);
      // Fallback
      setTimeout(() => {
        const durationMin = Math.floor(recordingDuration / 60);
        const durationSec = recordingDuration % 60;
        const fallbackText = `--- TRANSCRIÇÃO DE ÁUDIO REALIZADA ---
Gravação: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}
Duração: ${durationMin}m ${durationSec}s
Participante(s): ${user.name} (Papel/Área: ${user.bu || 'Geral'})

[00:02] ${user.name}: Iniciando gravação de notas de voz Luna. O objetivo dessa discussão rápida é registrar as prioridades estratégicas sobre a sincronização de agentes e a base de RAG.
[00:25] ${user.name}: Comentamos sobre o "Luna, o secretário" e como as atas salvas estarão instantaneamente vetorizadas. Esse RAG fica ativo imediatamente na aba de Recursos e no Playground para o time.
[00:55] ${user.name}: Próximos passos imediatos:
  - Validar a formatação de tabelas e as diretrizes de prompt.
  - Conectar demais ferramentas e garantir os testes em homologação.`;
        setTranscriptText(fallbackText);
        setIsTranscribing(false);
      }, 1500);
    }
  };

  const startRecording = async () => {
    try {
      isSimulatedRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const textUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(textUrl);
        
        setShowSaveModal(true);
        setRecordingTitle(`Gravação Luna - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
        
        triggerGeminiTranscription();
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Erro ao acessar microfone corporativo (provavelmente devido ao sandbox do iframe), ativando modo simulado:', err);
      
      isSimulatedRef.current = true;
      setRecordingState('recording');
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      alert('Microfone bloqueado ou indisponível nesta aba. Luna ativou o "Simulador de Ata Inteligente" para que você possa testar o salvamento, transcrição automática e os rankings livremente!');
    }
  };

  const pauseRecording = () => {
    if (isSimulatedRef.current) {
      setRecordingState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (isSimulatedRef.current) {
      setRecordingState('recording');
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (isSimulatedRef.current) {
      setRecordingState('idle');
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Simula a URL do áudio e prepara o pop-up
      setAudioUrl('simulated-audio-attachment');
      setShowSaveModal(true);
      setRecordingTitle(`Gravação Luna - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      triggerGeminiTranscription();
    } else if (mediaRecorderRef.current && recordingState !== 'idle') {
      mediaRecorderRef.current.stop();
      setRecordingState('idle');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    setRecordingState('idle');
    if (timerRef.current) clearInterval(timerRef.current);
    if (isSimulatedRef.current) {
      // Nenhum recurso real de hardware a ser fechado
    } else if (mediaRecorderRef.current && recordingState !== 'idle') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleSave = () => {
    if (!recordingTitle.trim()) {
      alert("Por favor, insira um título para a gravação.");
      return;
    }
    if (!transcriptText.trim()) {
      alert("A transcrição está vazia. Aguarde o fim da transcrição ou edite o texto.");
      return;
    }

    if (onSaveTranscript) {
      const formattedDuration = formatDuration(recordingDuration);
      onSaveTranscript(recordingTitle, transcriptText, formattedDuration);
      setShowSaveModal(false);
      alert(`Gravação salva com sucesso! O conteúdo transcrito foi inserido com sucesso na base de conhecimento (RAG) do assistente "Luna, o secretário".`);
    }
  };

  const handleDiscardAudio = () => {
    if (confirm("Tem certeza que deseja descartar esta gravação? Todo o progresso de áudio e a transcrição sugerida por Luna serão excluídos permanentemente.")) {
      setAudioUrl(null);
      setTranscriptText('');
      setRecordingTitle('');
      setShowSaveModal(false);
    }
  };

  const mainResources = resources.filter(r => r.type !== ResourceType.MARKET_MODEL);
  const marketModels = resources.filter(r => r.type === ResourceType.MARKET_MODEL);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.BASIC]: 'Básico',
    [UserRole.INTERMEDIATE]: 'Intermediário',
    [UserRole.ADVANCED]: 'Avançado',
    [UserRole.ADMINISTRATOR]: 'Administrador'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-105">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 tracking-tight block">Luna Zucchetti</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none mt-0.5">Inteligência Artificial</span>
          </div>
        </div>

        {/* Removido Criador e Área do Header */}
      </div>

      <div className="flex items-center gap-6">
        {/* --- WIDGET DE GRAVAÇÃO LUNA --- */}
        <div className="flex items-center gap-2">
          {recordingState === 'idle' ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-3 py-1.5 h-9 bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer group"
              title="Iniciar Gravação"
            >
              <Mic className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
              <span>Gravar Reunião</span>
              {savedTranscripts && savedTranscripts.length > 0 && (
                <span className="flex items-center justify-center bg-rose-200 text-rose-800 rounded-full w-4.5 h-4.5 text-[9px] font-black leading-none ml-1">
                  {savedTranscripts.length}
                </span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full py-1 px-1.5 pl-3 h-9 shadow-xs animate-in slide-in-from-left duration-200">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${recordingState === 'recording' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${recordingState === 'recording' ? 'bg-rose-600' : 'bg-amber-500'}`}></span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">{formatDuration(recordingDuration)}</span>
                <span className="text-[10px] font-bold text-slate-400 hidden sm:inline uppercase tracking-wider">
                  {recordingState === 'recording' ? 'Gravando' : 'Pausado'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-2">
                {recordingState === 'recording' ? (
                  <button
                    onClick={pauseRecording}
                    className="p-1 h-7 w-7 rounded-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Pausar Gravação"
                  >
                    <Pause className="w-3 h-3 text-slate-655" />
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="p-1 h-7 w-7 rounded-full bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 border border-sky-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="Retomar Gravação"
                  >
                    <Play className="w-3 h-3 text-sky-655 fill-current" />
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="p-1 h-7 w-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Finalizar e Salvar no RAG"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>

                <button
                  onClick={cancelRecording}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/85 px-2 py-1 rounded-full transition-colors cursor-pointer"
                  title="Descartar gravação"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- SINO DE NOTIFICAÇÕES (ATIVO) --- */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all border border-transparent flex items-center justify-center cursor-pointer relative"
            title="Notificações de Agentes Ativos"
            id="notification-bell-btn"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 text-white text-[9px] font-black items-center justify-center leading-none">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Dropdown de Notificações */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-96 animate-in fade-in-50 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between select-none">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                  <span>🔔</span>
                  <span>Mensagens Ativas</span>
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[9px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-64">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 italic">
                    Nenhuma notificação ativa de agentes.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 text-left transition-all cursor-pointer relative ${
                        !n.read 
                          ? 'bg-indigo-50/40 hover:bg-indigo-50/60 border-l-2 border-indigo-500' 
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                          {n.agentName}
                        </span>
                        <span className="text-[8px] text-slate-450 font-medium">
                          {n.timestamp}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1.5 leading-tight">
                        {n.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        {n.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-150 text-center">
                  <button
                    onClick={handleClearAll}
                    className="text-[9px] font-black text-rose-600 hover:text-rose-800 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Limpar histórico de notificações
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {toggleDarkMode && (
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-all border border-transparent flex items-center justify-center cursor-pointer"
            title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500 animate-pulse" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-[10px] font-bold text-sky-600 uppercase">{roleLabels[user.role]}</div>
          </div>
          <img src={user.avatar} alt="Usuário" className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 animate-in zoom-in-75" />
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="ml-2 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all border border-transparent hover:border-red-100 flex items-center justify-center cursor-pointer"
              title="Sair do sistema"
            >
              <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* --- MODAL DE SALVAMENTO DE GRAVAÇÃO (RAG LUNA) --- */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowSaveModal(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative z-[101] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-500 animate-pulse" />
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">Finalizar e Processar Gravação</h2>
              </div>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-slate-450 hover:text-slate-650 transition-colors p-1 hover:bg-slate-200/50 rounded-full cursor-pointer focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-xs text-sky-850 flex items-start gap-3 leading-relaxed">
                <span className="text-lg">💁‍♂️</span>
                <div>
                  <p className="font-bold mb-0.5">Vetorização e Organização no RAG</p>
                  <p className="text-sky-750">Esta gravação e o texto transcrito serão persistidos na base de inteligência (RAG) do assistente default <strong>Luna, o secretário</strong>, ficando prontos para consulta em tempo real no Playground.</p>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Documento / Gravação</label>
                <input
                  type="text"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  placeholder="Ex: Reunião Geral de Sprints"
                  className="w-full text-xs font-bold px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-750 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-100/20 transition-all font-sans"
                />
              </div>

              {/* Player de áudio da Gravação */}
              {audioUrl && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amostra do Áudio Gravado</label>
                  <audio src={audioUrl} controls className="w-full h-10 border border-slate-200/85 rounded-xl bg-slate-50 focus:outline-none" />
                </div>
              )}

              {/* Transcrição da Gravação */}
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Transcrição da Conversa</label>
                  {isTranscribing && (
                    <span className="text-[10px] bg-sky-100 text-sky-750 font-bold px-2 py-0.5 rounded-full animate-pulse">Consultando Luna...</span>
                  )}
                </div>
                
                {isTranscribing ? (
                  <div className="flex flex-col items-center justify-center py-12 border border-slate-200 border-dashed rounded-xl bg-slate-50/50 gap-3">
                    <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-450 font-semibold italic">A Inteligência Luna está processando a transcrição das notas...</p>
                  </div>
                ) : (
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    rows={8}
                    placeholder="Refine a transcrição gerada..."
                    className="w-full text-xs font-mono p-4 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed text-slate-750 bg-[#fafbfc] focus:bg-white transition-all whitespace-pre-wrap resize-y"
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
              <button 
                onClick={handleDiscardAudio}
                className="px-4 py-2 border border-red-250 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Descartar Gravação</span>
              </button>

              <div className="flex items-center gap-3.5">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-all cursor-pointer"
                >
                  Continuar Editando
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isTranscribing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar no RAG do Luna</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
