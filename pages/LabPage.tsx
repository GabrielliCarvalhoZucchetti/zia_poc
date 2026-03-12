
import React, { useState } from 'react';
import { Project, User, Subtask, ProjectAttachment } from '../types';
import { Icons } from '../constants';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface LabPageProps {
  user: User;
  projects: Project[];
  onCreateProject: (project: Omit<Project, 'id' | 'user'>) => string;
  onAddComment: (projectId: string, content: string) => void;
  onAddSubtask: (projectId: string, subtask: Omit<Subtask, 'id' | 'createdAt' | 'status'>) => void;
}

const LabPage: React.FC<LabPageProps> = ({ user, projects, onCreateProject, onAddComment, onAddSubtask }) => {
  const [showModal, setShowModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const [activeTab, setActiveTab] = useState('Resumo');
  const [newComment, setNewComment] = useState('');

  // Subtask form state
  const [stTitle, setStTitle] = useState('');
  const [stDescription, setStDescription] = useState('');
  const [stType, setStType] = useState<'Melhoria' | 'Bug' | 'Tarefa' | 'Novo Recurso'>('Melhoria');
  const [stPriority, setStPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Crítica'>('Média');
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [metrics, setMetrics] = useState('');
  const [scope, setScope] = useState('Interno');
  const [deadline, setDeadline] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState<'Agente' | 'Assistente' | 'Automação'>('Assistente');

  const columns: { id: Project['status']; label: string; color: string }[] = [
    { id: 'TRIAGEM', label: 'Em triagem', color: 'bg-slate-100' },
    { id: 'REFINAMENTO', label: 'Em refinamento', color: 'bg-indigo-100' },
    { id: 'DEV_SOLICITANTE', label: 'Em dev pelo solicitante', color: 'bg-violet-100' },
    { id: 'DESENVOLVIMENTO', label: 'Em desenvolvimento', color: 'bg-sky-100' },
    { id: 'MONITORAMENTO', label: 'Em monitoramento', color: 'bg-emerald-100' },
    { id: 'AG_SOLICITANTE', label: 'Ag.Solicitante', color: 'bg-amber-100' },
    { id: 'IMPEDIDO', label: 'Impedido', color: 'bg-rose-100' },
    { id: 'CONCLUIDO', label: 'Concluído', color: 'bg-slate-200' },
    { id: 'CANCELADO', label: 'Cancelado', color: 'bg-slate-300' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = onCreateProject({
      title,
      description,
      scope,
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: 'TRIAGEM',
      metrics,
      email,
      type: projectType
    });
    setGeneratedId(id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('ID copiado para a área de transferência!');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMetrics('');
    setScope('Interno');
    setDeadline('');
    setEmail('');
    setProjectType('Assistente');
    setGeneratedId(null);
    setShowModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Laboratório de Projetos</h1>
          <p className="text-slate-500">Acompanhe o desenvolvimento de projetos de IA e as métricas de desempenho do time.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-200 transition-all"
        >
          <Icons.Plus />
          Novo Projeto
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            tag: '#automacao', 
            value: 2, 
            description: 'Executa tarefas repetitivas sem tomar decisões',
            bgColor: 'bg-[#FFF9F0]',
            borderColor: 'border-orange-100',
            textColor: 'text-slate-900'
          },
          { 
            tag: '#assistente', 
            value: 15, 
            description: 'Entende perguntas e responde, mas não age sozinho',
            bgColor: 'bg-[#F0F4FF]',
            borderColor: 'border-blue-100',
            textColor: 'text-slate-900'
          },
          { 
            tag: '#agente', 
            value: 28, 
            description: 'Entende objetivos, decide o que fazer e executa ações',
            bgColor: 'bg-[#F0FFF4]',
            borderColor: 'border-emerald-100',
            textColor: 'text-slate-900'
          }
        ].map((kpi, i) => (
          <div key={i} className={`${kpi.bgColor} p-6 rounded-xl border ${kpi.borderColor} relative overflow-hidden group transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{kpi.tag}</span>
              <Icons.Paperclip className="w-3.5 h-3.5 text-slate-400 rotate-45" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mb-2">{kpi.value}</div>
            <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {kpi.description}
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex overflow-x-auto pb-8 gap-6 snap-x scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {columns.map(col => (
          <div key={col.id} className="flex-shrink-0 w-80 space-y-4 snap-start">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color.replace('100', '500').replace('200', '600').replace('300', '700')}`}></div>
                <h3 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider whitespace-nowrap">{col.label}</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                {projects.filter(p => p.status === col.id).length}
              </span>
            </div>
            <div className="space-y-4 min-h-[200px] bg-slate-50/50 p-2 rounded-2xl border border-transparent hover:border-slate-200 transition-colors">
              {projects.filter(p => p.status === col.id).map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => setSelectedProjectId(proj.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-sky-600">{proj.scope}</div>
                    {proj.user === user.name && (
                      <div className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ID: {proj.id}</div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-2">{proj.title}</h4>
                  
                  {proj.type && (
                    <div className="mb-3">
                      <span className="bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {proj.type}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Icons.Paperclip className="w-3 h-3 rotate-45" />
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium">
                      <Icons.User className="w-3 h-3" />
                      <span className="truncate">{proj.email || proj.user}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Prazo {new Date(proj.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Criar novo projeto de IA</h2>
                <p className="text-sm text-slate-500 mt-1">Preencha as informações básicas do projeto. Ele será criado com status "Em análise".</p>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <Icons.X />
              </button>
            </div>
            
            <div className="p-8">
              {generatedId ? (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Icons.Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Projeto Criado!</h3>
                    <p className="text-sm text-slate-500">Copie o ID abaixo para vincular aos seus recursos.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-mono font-bold text-xl text-slate-700">{generatedId}</span>
                    <button 
                      onClick={() => copyToClipboard(generatedId)}
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                    >
                      <Icons.Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
                  >
                    Concluir
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Título <span className="text-rose-500">*</span></label>
                    <input 
                      required 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      type="text" 
                      placeholder="Ex: Assistente de Atendimento ao Cliente" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tipo de Projeto <span className="text-rose-500">*</span></label>
                      <select 
                        value={projectType}
                        onChange={e => setProjectType(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all bg-white"
                      >
                        <option value="Assistente">Assistente</option>
                        <option value="Agente">Agente</option>
                        <option value="Automação">Automação</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email/Time Responsável</label>
                      <input 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        type="text" 
                        placeholder="Ex: time.ia@zucchetti.com.br" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Descrição <span className="text-rose-500">*</span></label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1">
                        {['B', 'I', 'U'].map(btn => (
                          <button key={btn} type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 font-bold text-sm">{btn}</button>
                        ))}
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        {['</>', '</>', '</>'].map((btn, i) => (
                          <button key={i} type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 text-xs">{btn}</button>
                        ))}
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 text-xs">≡</button>
                        <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 text-xs">≣</button>
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        <button type="button" className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 text-xs">{'</>'}</button>
                      </div>
                      <textarea 
                        required 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows={4} 
                        placeholder="Descreva o objetivo e escopo do projeto de IA" 
                        className="w-full px-4 py-3 focus:outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                    <p className="text-[11px] text-slate-400">Use a barra de ferramentas para formatar: negrito, itálico, sublinhado, títulos, listas e linha horizontal</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Qual métrica define o sucesso desse projeto <span className="text-rose-500">*</span></label>
                    <textarea 
                      required 
                      value={metrics} 
                      onChange={e => setMetrics(e.target.value)} 
                      rows={3} 
                      placeholder="Ex: Reduzir tempo médio de atendimento de 5min para 2min; Aumentar NPS de 70 para 85; Automatizar 80% das solicitações repetitivas" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200"
                    >
                      <Icons.AgentBuilder className="w-4 h-4" />
                      IA, me ajuda?
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                    >
                      Criar projeto
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProjectId(null)}></div>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-600">{selectedProject.title}</h2>
                <p className="text-xs text-slate-500 mt-1">Gerenciamento completo do projeto de IA</p>
              </div>
              <button onClick={() => setSelectedProjectId(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <Icons.X />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-2 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {['Resumo', 'Comentários', 'Subtarefas', 'Anexos', 'Métricas'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
              {activeTab === 'Resumo' && (
                <div className="bg-[#F0F4FF]/50 border border-blue-100 rounded-2xl p-6 space-y-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">Título</label>
                    <p className="text-sm text-slate-800 font-medium">{selectedProject.title}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">Descrição</label>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">Tipo do projeto</label>
                    <div className="relative">
                      <select 
                        value={selectedProject.type || 'Não definido'}
                        disabled
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75"
                      >
                        <option value="Não definido">Não definido</option>
                        <option value="Automação">Automação</option>
                        <option value="Assistente">Assistente</option>
                        <option value="Agente">Agente</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Icons.ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">Status</label>
                    <div>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                        {columns.find(c => c.id === selectedProject.status)?.label || selectedProject.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">Fonte de dados</label>
                    <p className="text-sm text-slate-400 italic">Não informado</p>
                  </div>

                  <div className="pt-4 border-t border-blue-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Icons.User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase">Criado por</div>
                      <div className="text-sm text-slate-800 font-medium">{selectedProject.user}</div>
                      {selectedProject.email && (
                        <div className="text-[10px] text-slate-500">{selectedProject.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Comentários' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {selectedProject.comments?.map(comment => (
                      <div key={comment.id} className="bg-[#F0F4FF]/30 border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-blue-50/50 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600">{comment.user}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Icons.History className="w-3 h-3" />
                            {new Date(comment.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!selectedProject.comments || selectedProject.comments.length === 0) && (
                      <div className="text-center py-10 text-slate-400">
                        <p className="text-sm italic">Nenhum comentário ainda.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-tight">Adicionar comentário</h4>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Digite seu comentário..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                    ></textarea>
                    <button
                      onClick={() => {
                        if (newComment.trim()) {
                          onAddComment(selectedProject.id, newComment);
                          setNewComment('');
                        }
                      }}
                      className="w-full py-3 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
                    >
                      Adicionar comentário
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'Subtarefas' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-tight">Subtarefas do projeto</h4>
                    <button 
                      onClick={() => setShowSubtaskModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all"
                    >
                      <Icons.Plus className="w-3 h-3" />
                      Nova Subtarefa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedProject.subtasks?.map(st => (
                      <div key={st.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              st.status === 'Concluído' ? 'bg-emerald-500' : 
                              st.status === 'Em Andamento' ? 'bg-amber-500' : 'bg-slate-300'
                            }`} />
                            <h5 className="text-sm font-bold text-slate-800">{st.title}</h5>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            st.priority === 'Crítica' ? 'bg-rose-100 text-rose-600' :
                            st.priority === 'Alta' ? 'bg-orange-100 text-orange-600' :
                            st.priority === 'Média' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {st.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{st.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{st.type}</span>
                          <span className="text-[10px] text-slate-400">{new Date(st.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {(!selectedProject.subtasks || selectedProject.subtasks.length === 0) && (
                      <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Icons.ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Nenhuma subtarefa criada ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'Métricas' && (
                <div className="space-y-6">
                  {/* North Star Metric (NSM) Card */}
                  <div className="bg-[#F0F4FF]/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-blue-600">North Star Metric (NSM)</h4>
                    
                    <div className="bg-white border border-blue-50 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Métrica de Sucesso</div>
                      <p className="text-sm text-slate-700 font-medium">
                        {selectedProject.metrics || "100% das notícias do setor econômico das BUs monitoradas pela Zucchetti"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-blue-50 rounded-xl p-4 shadow-sm">
                        <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Meta</div>
                        <p className="text-sm text-slate-500 italic">Não definida</p>
                      </div>
                      <div className="bg-white border border-blue-50 rounded-xl p-4 shadow-sm">
                        <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Atingido</div>
                        <p className="text-sm text-slate-500 italic">Não medido</p>
                      </div>
                    </div>
                  </div>

                  {/* Evolução da NSM Card */}
                  <div className="bg-[#F0F4FF]/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-blue-600">Evolução da NSM</h4>
                      <p className="text-[10px] text-slate-500">Acompanhamento semanal da meta vs atingido</p>
                    </div>

                    <div className="h-[300px] w-full bg-white/50 rounded-xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: 'Sem 1', meta: 25, atingido: 20 },
                            { name: 'Sem 2', meta: 50, atingido: 45 },
                            { name: 'Sem 3', meta: 75, atingido: 70 },
                            { name: 'Sem 4', meta: 100, atingido: 85 },
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            domain={[0, 100]}
                            ticks={[0, 25, 50, 75, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '12px', 
                              border: 'none', 
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              fontSize: '12px'
                            }} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            formatter={(value) => <span className="text-[10px] font-medium text-slate-600 capitalize">{value}</span>}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="meta" 
                            name="Meta"
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="atingido" 
                            name="Atingido"
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Anexos' && (
                <div className="space-y-8">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center group hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                      <Icons.Upload />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      <span className="text-blue-600 font-bold">Clique para fazer upload</span> ou arraste arquivos aqui
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">Os anexos serão enviados ao Jira</p>
                  </div>

                  {/* Existing Attachments Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600">Anexos existentes</h4>
                    
                    <div className="space-y-3">
                      {selectedProject.attachments && selectedProject.attachments.length > 0 ? (
                        selectedProject.attachments.map(file => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                <Icons.File />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700">{file.name}</p>
                                <p className="text-[10px] text-slate-400">{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                              <Icons.Trash />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <p className="text-sm">Nenhum anexo encontrado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Subtask Creation Modal */}
      {showSubtaskModal && selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSubtaskModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Criar subtarefa</h3>
                <p className="text-xs text-slate-500 mt-1">Adicione uma nova subtarefa ao projeto atual.</p>
              </div>
              <button onClick={() => setShowSubtaskModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Icons.X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Título <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  value={stTitle}
                  onChange={e => setStTitle(e.target.value)}
                  type="text" 
                  placeholder="Ex: Corrigir erro no processamento de dados" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Descrição <span className="text-rose-500">*</span></label>
                <textarea 
                  required 
                  value={stDescription}
                  onChange={e => setStDescription(e.target.value)}
                  placeholder="Descreva os detalhes da subtarefa" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tipo <span className="text-rose-500">*</span></label>
                  <select 
                    value={stType}
                    onChange={e => setStType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <option value="Melhoria">Melhoria</option>
                    <option value="Bug">Bug</option>
                    <option value="Tarefa">Tarefa</option>
                    <option value="Novo Recurso">Novo Recurso</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Prioridade</label>
                  <select 
                    value={stPriority}
                    onChange={e => setStPriority(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowSubtaskModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (stTitle.trim() && stDescription.trim()) {
                    onAddSubtask(selectedProject.id, {
                      title: stTitle,
                      description: stDescription,
                      type: stType,
                      priority: stPriority
                    });
                    setStTitle('');
                    setStDescription('');
                    setShowSubtaskModal(false);
                  }
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Criar subtarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabPage;
