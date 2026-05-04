
import React, { useState } from 'react';
import { UserUsage, UserRole, ApiInteractionLog, ApiKey } from '../types';
import { Icons } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

const MOCK_USAGE_DATA: UserUsage[] = [
  {
    id: 'u1',
    name: 'Joao Silva',
    email: 'joao.silva@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
    bu: 'ERP',
    lastActivity: '2026-04-23 10:45',
    interactionsCount: 450,
    accessedResources: ['Assistente Geral', 'GPT-4'],
    status: 'Ativo'
  },
  {
    id: 'u2',
    name: 'Ana Costa',
    email: 'ana.costa@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    bu: 'Comercial',
    lastActivity: '2026-04-23 11:20',
    interactionsCount: 380,
    accessedResources: ['Doc ClippPro', 'Claude 3.5'],
    status: 'Ativo'
  },
  {
    id: 'u3',
    name: 'Marcos Oliveira',
    email: 'marcos.oliveira@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos',
    bu: 'Administração',
    lastActivity: '2026-04-22 17:30',
    interactionsCount: 290,
    accessedResources: ['GPT-4', 'Gestor de Base'],
    status: 'Ativo'
  },
  {
    id: 'u4',
    name: 'Alice Castro',
    email: 'alice.castro@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    bu: 'Staff',
    lastActivity: '2026-04-23 09:15',
    interactionsCount: 210,
    accessedResources: ['Assistente Geral'],
    status: 'Ativo'
  },
  {
    id: 'u5',
    name: 'Ricardo Souza',
    email: 'ricardo.souza@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo',
    bu: 'POS',
    lastActivity: '2026-04-20 14:00',
    interactionsCount: 150,
    accessedResources: ['Auditor de Sistema'],
    status: 'Inativo'
  },
  {
    id: 'u6',
    name: 'Paula Lima',
    email: 'paula.lima@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula',
    bu: 'HR TECH',
    lastActivity: '2026-04-23 12:05',
    interactionsCount: 120,
    accessedResources: ['GPT-4'],
    status: 'Ativo'
  },
  {
    id: 'u7',
    name: 'Fernando Dias',
    email: 'fernando.dias@zucchetti.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando',
    bu: 'ERP',
    lastActivity: '2026-04-21 10:30',
    interactionsCount: 85,
    accessedResources: ['Gestor de Base'],
    status: 'Ativo'
  }
];

const MOCK_LOGS: ApiInteractionLog[] = [
  {
    id: 'l1',
    author: 'Assistente Geral',
    apiKeyName: 'ZIA_KEY_01',
    input: 'Qual o faturamento de Março?',
    model: 'GPT-4o',
    output: 'O faturamento total de Março foi de R$ 1.250.000,00, representando um aumento de 15% em relação a Fevereiro.',
    timestamp: '2026-04-23 14:10:05',
    tokens: 154,
    cost: 0.05
  },
  {
    id: 'l2',
    author: 'Gestor de Base',
    apiKeyName: 'ZIA_KEY_02',
    input: 'Analise o churn rate do time POS.',
    model: 'Claude 3.5 Sonnet',
    output: 'O churn rate do time POS está em 4.2%. Os principais motivos identificados são falta de engajamento no primeiro mês e preço.',
    timestamp: '2026-04-23 14:15:22',
    tokens: 450,
    cost: 0.12
  },
  {
    id: 'l3',
    author: 'Auditor de Sistema',
    apiKeyName: 'ZIA_KEY_01',
    input: 'Verificar logs de erro do módulo ERP.',
    model: 'GPT-4o mini',
    output: 'Foram encontrados 3 alertas críticos nas últimas 24 horas relacionados à conexão com o banco de dados.',
    timestamp: '2026-04-23 14:20:10',
    tokens: 210,
    cost: 0.02
  },
  {
    id: 'l4',
    author: 'Doc ClippPro',
    apiKeyName: 'ZIA_KEY_DOCS',
    input: 'Como configurar o certificado digital?',
    model: 'Gemini 1.5 Flash',
    output: 'Para configurar o certificado, acesse Menu > Configurações > Certificado e selecione o arquivo .pfx importado.',
    timestamp: '2026-04-23 14:25:45',
    tokens: 320,
    cost: 0.01
  },
  {
    id: 'l5',
    author: 'Assistente Geral',
    apiKeyName: 'ZIA_KEY_01',
    input: 'Resuma o último e-mail recebido.',
    model: 'GPT-4o',
    output: 'O e-mail trata da nova política de home-office que será implementada a partir de Junho nas unidades administrativas.',
    timestamp: '2026-04-23 14:30:12',
    tokens: 180,
    cost: 0.06
  }
];

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'PROD_INTEGRATION_01',
    resourceId: 'r1',
    resourceName: 'Assistente Geral',
    key: 'zia_prod_...4k92',
    status: 'Ativa',
    createdAt: '2026-01-15',
    lastUsed: '2026-04-23 15:45',
    usageCount: 12500
  },
  {
    id: 'k2',
    name: 'STAGING_TEST_KEY',
    resourceId: 'r3',
    resourceName: 'Gestor de Base',
    key: 'zia_stg_...1a88',
    status: 'Ativa',
    createdAt: '2026-02-10',
    lastUsed: '2026-04-23 14:20',
    usageCount: 4500
  },
  {
    id: 'k3',
    name: 'LEGACY_KEY',
    resourceId: 'r1',
    resourceName: 'Assistente Geral',
    key: 'zia_old_...9f22',
    status: 'Revogada',
    createdAt: '2025-11-20',
    lastUsed: '2026-01-05 10:00',
    usageCount: 8900
  },
  {
    id: 'k4',
    name: 'AUDIT_INTERNAL',
    resourceId: 'r4',
    resourceName: 'Auditor de Sistema',
    key: 'zia_aud_...m5p1',
    status: 'Ativa',
    createdAt: '2026-03-05',
    lastUsed: '2026-04-23 09:30',
    usageCount: 1200
  }
];

const MOCK_COSTS_TREND = [
  { month: 'Nov', cost: 120 },
  { month: 'Dez', cost: 150 },
  { month: 'Jan', cost: 280 },
  { month: 'Fev', cost: 350 },
  { month: 'Mar', cost: 480 },
  { month: 'Abr', cost: 520 }
];

const MOCK_RESOURCE_COSTS = [
  { name: 'Assistente Geral', cost: 320, interactions: 15400 },
  { name: 'Gestor de Base', cost: 120, interactions: 5200 },
  { name: 'Auditor de Sistema', cost: 45, interactions: 1200 },
  { name: 'Doc ClippPro', cost: 35, interactions: 8900 }
];

const ZiaMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'costs' | 'keys'>('logs');
  const [period, setPeriod] = useState('Últimos 30 dias');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter States
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Ativo' | 'Inativo'>('Todos');
  const [filterProject, setFilterProject] = useState('Todos');
  const [filterBU, setFilterBU] = useState('Todos');
  const [filterMinInteractions, setFilterMinInteractions] = useState<string>('');
  const [filterMaxInteractions, setFilterMaxInteractions] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Log Filter States
  const [filterLogAuthor, setFilterLogAuthor] = useState('Todos');
  const [filterLogModel, setFilterLogModel] = useState('Todos');
  const [filterLogKey, setFilterLogKey] = useState('Todos');
  const [searchLogInput, setSearchLogInput] = useState('');

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [sortBy, setSortBy] = useState<'interactions' | 'activity'>('interactions');

  // Filter Logic
  const filteredData = MOCK_USAGE_DATA.filter(user => {
    // User search
    if (filterUser && !user.name.toLowerCase().includes(filterUser.toLowerCase()) && !user.email.toLowerCase().includes(filterUser.toLowerCase())) {
      return false;
    }
    // Status
    if (filterStatus !== 'Todos' && user.status !== filterStatus) {
      return false;
    }
    // BU
    if (filterBU !== 'Todos' && user.bu !== filterBU) {
      return false;
    }
    // Project
    if (filterProject !== 'Todos' && !user.accessedResources.includes(filterProject)) {
      return false;
    }
    // Min Interactions
    if (filterMinInteractions && user.interactionsCount < parseInt(filterMinInteractions)) {
      return false;
    }
    // Max Interactions
    if (filterMaxInteractions && user.interactionsCount > parseInt(filterMaxInteractions)) {
      return false;
    }
    // Dates (Mock comparison for simplicity)
    if (filterDateStart && new Date(user.lastActivity) < new Date(filterDateStart)) {
      return false;
    }
    if (filterDateEnd && new Date(user.lastActivity) > new Date(filterDateEnd)) {
      return false;
    }

    return true;
  });

  const filteredLogs = MOCK_LOGS.filter(log => {
    if (filterLogAuthor !== 'Todos' && log.author !== filterLogAuthor) return false;
    if (filterLogModel !== 'Todos' && log.model !== filterLogModel) return false;
    if (filterLogKey !== 'Todos' && log.apiKeyName !== filterLogKey) return false;
    if (searchLogInput && !log.input.toLowerCase().includes(searchLogInput.toLowerCase()) && !log.output.toLowerCase().includes(searchLogInput.toLowerCase())) return false;
    return true;
  });

  const totalInteractions = filteredData.reduce((acc, curr) => acc + curr.interactionsCount, 0);
  const activeUsersTotal = filteredData.filter(u => u.status === 'Ativo').length;
  const avgInteractions = filteredData.length > 0 ? Math.round(totalInteractions / filteredData.length) : 0;
  const mostActiveUser = [...filteredData].sort((a, b) => b.interactionsCount - a.interactionsCount)[0];

  const chartData = filteredData.map(user => ({
    name: user.name.split(' ')[0],
    interactions: user.interactionsCount,
  })).sort((a, b) => b.interactions - a.interactions);

  const distributionData = [
    { name: 'Top 3 Usuários', value: filteredData.slice(0, 3).reduce((acc, curr) => acc + curr.interactionsCount, 0) },
    { name: 'Outros', value: filteredData.slice(3).reduce((acc, curr) => acc + curr.interactionsCount, 0) },
  ];

  const COLORS = ['#0070E0', '#CBD5E1'];

  const sortedUsers = [...filteredData].sort((a, b) => {
    if (sortBy === 'interactions') {
      return sortOrder === 'desc' ? b.interactionsCount - a.interactionsCount : a.interactionsCount - b.interactionsCount;
    } else {
      return sortOrder === 'desc' 
        ? new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        : new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
    }
  });

  // Get unique values for filters
  const allProjects = Array.from(new Set(MOCK_USAGE_DATA.flatMap(u => u.accessedResources)));
  const allBUs = Array.from(new Set(MOCK_USAGE_DATA.map(u => u.bu))).filter(Boolean) as string[];

  // Data for Log filters
  const allLogAuthors = Array.from(new Set(MOCK_LOGS.map(l => l.author)));
  const allLogModels = Array.from(new Set(MOCK_LOGS.map(l => l.model)));
  const allLogKeys = Array.from(new Set(MOCK_LOGS.map(l => l.apiKeyName)));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Monitoramento</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Acompanhe o uso da plataforma por usuário</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {['Hoje', 'Últimos 7 dias', 'Últimos 30 dias', 'Personalizado'].map((p) => (
                <button 
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    if (p === 'Personalizado') {
                      setShowFilters(!showFilters);
                    } else {
                      setShowFilters(false);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    period === p 
                      ? 'bg-sky-50 text-[#0070E0]' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {p}
                  {p === 'Personalizado' && <Icons.Filter className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-8 h-8 bg-white text-[#0070E0] rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-sky-100">
            <Icons.Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-sky-900">Sobre as métricas de Interação</h4>
            <p className="text-xs text-sky-700 mt-1 leading-relaxed">
              As interações consideram apenas ações que gerem processamento no sistema, como envio de mensagens para agentes, execução de automações ou solicitações de análise. 
              Ações de navegação (cliques, visualizações ou troca de telas) <strong>não</strong> são contabilizadas como interações.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'logs' ? 'text-[#0070E0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Monitoramento de API (Real-time)
            {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'users' ? 'text-[#0070E0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Uso por Usuário & BUs
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('costs')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'costs' ? 'text-[#0070E0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Gestão de Custos
            {activeTab === 'costs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'keys' ? 'text-[#0070E0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Chaves de API
            {activeTab === 'keys' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0] rounded-full" />}
          </button>
        </div>

        {/* Filter Panel (Contextual) */}
        {showFilters && activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Icons.Filter className="w-4 h-4 text-[#0070E0]" />
                Filtros Avançados
              </h3>
              <button 
                onClick={() => {
                  setFilterUser('');
                  setFilterStatus('Todos');
                  setFilterProject('Todos');
                  setFilterBU('Todos');
                  setFilterMinInteractions('');
                  setFilterMaxInteractions('');
                  setFilterDateStart('');
                  setFilterDateEnd('');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-[#0070E0] uppercase tracking-widest transition-colors"
              >
                Limpar Todos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    placeholder="Nome ou e-mail"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all"
                  />
                  <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidade de Negócio (BU)</label>
                <select 
                  value={filterBU}
                  onChange={(e) => setFilterBU(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todas as BUs</option>
                  {allBUs.map(bu => (
                    <option key={bu} value={bu}>{bu}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status / Acesso</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto / Agente</label>
                <select 
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Projetos</option>
                  {allProjects.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interações</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={filterMinInteractions}
                    onChange={(e) => setFilterMinInteractions(e.target.value)}
                    placeholder="Mín"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all"
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="number" 
                    value={filterMaxInteractions}
                    onChange={(e) => setFilterMaxInteractions(e.target.value)}
                    placeholder="Máx"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Período de Atividade</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={filterDateStart}
                      onChange={(e) => setFilterDateStart(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-slate-300 font-bold">até</span>
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={filterDateEnd}
                      onChange={(e) => setFilterDateEnd(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFilters && activeTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Icons.Filter className="w-4 h-4 text-[#0070E0]" />
                Filtrar Interações
              </h3>
              <button 
                onClick={() => {
                  setFilterLogAuthor('Todos');
                  setFilterLogModel('Todos');
                  setFilterLogKey('Todos');
                  setSearchLogInput('');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-[#0070E0] uppercase tracking-widest transition-colors"
              >
                Limpar Logs
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recurso / Agente</label>
                <select 
                  value={filterLogAuthor}
                  onChange={(e) => setFilterLogAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Recursos</option>
                  {allLogAuthors.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modelo LLM</label>
                <select 
                  value={filterLogModel}
                  onChange={(e) => setFilterLogModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Modelos</option>
                  {allLogModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chave API</label>
                <select 
                  value={filterLogKey}
                  onChange={(e) => setFilterLogKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todas as Chaves</option>
                  {allLogKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buscar no Conteúdo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchLogInput}
                    onChange={(e) => setSearchLogInput(e.target.value)}
                    placeholder="Busca em input/output..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0070E0] transition-all"
                  />
                  <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                {activeTab === 'costs' ? <Icons.Dollar className="w-6 h-6" /> : <Icons.User className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {activeTab === 'costs' ? 'R$ 520,30' : activeUsersTotal}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {activeTab === 'costs' ? 'Custo Acumulado (Mês)' : 'Usuários Ativos'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                <Icons.Chat className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{totalInteractions + 34000}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Total Interações</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                {activeTab === 'keys' ? <Icons.Key className="w-6 h-6" /> : <Icons.AgentBuilder className="w-6 h-6" />}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {activeTab === 'keys' ? MOCK_API_KEYS.filter(k => k.status === 'Ativa').length : avgInteractions}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {activeTab === 'keys' ? 'Chaves Ativas' : 'Média por Usuário'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shadow-inner">
                <Icons.User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 truncate max-w-[150px]">{mostActiveUser?.name || '-'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap font-sans">Usuário mais Ativo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'users' ? (
          <>
            {/* Charts Row */}
            {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Uso por Usuário (Interações)</h3>
                <Icons.Monitoring className="w-4 h-4 text-slate-300" />
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#F8FAFC'}} 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="interactions" fill="#0070E0" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Distribuição de Uso</h3>
                <Icons.Audit className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4">
                  {distributionData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[24px] border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Icons.Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhum resultado encontrado</h3>
            <p className="text-slate-500 mt-2">Tente ajustar seus filtros para encontrar o que procura.</p>
          </div>
        )}

            {/* User Table */}
            {filteredData.length > 0 && (
              <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detalhamento Operacional</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium whitespace-nowrap">
                      Mostrando <span className="text-[#0070E0] font-bold">{filteredData.length}</span> resultados
                    </div>
                  </div>
                </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acessos</th>
                    <th 
                      className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-[#0070E0] transition-colors"
                      onClick={() => {
                        setSortBy('activity');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        Última Atividade
                        {sortBy === 'activity' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-[#0070E0] transition-colors"
                      onClick={() => {
                        setSortBy('interactions');
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      }}
                    >
                      <div className="flex items-center gap-2">
                        Interações
                        {sortBy === 'interactions' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedUsers.map((user, idx) => (
                    <tr key={user.id} className={`hover:bg-slate-50/30 transition-colors group ${idx < 3 ? 'bg-sky-50/10' : ''}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center border border-slate-100">
                            <Icons.User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                          user.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-1">
                          {user.accessedResources.map((res, i) => (
                            <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100">
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-500 font-medium">{user.lastActivity}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-[80px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#0070E0] h-full rounded-full transition-all duration-1000" 
                              style={{width: `${(user.interactionsCount / mostActiveUser.interactionsCount) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-slate-800">{user.interactionsCount}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="p-4 bg-slate-50/50 flex items-center justify-center gap-2 border-t border-slate-50">
                 <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                   <Icons.ChevronLeftDouble className="w-3 h-3" />
                 </button>
                 <button className="px-3 h-8 bg-white border border-slate-200 text-xs font-bold text-[#0070E0] rounded-lg shadow-sm">1</button>
                 <button className="px-3 h-8 hover:bg-white border border-transparent hover:border-slate-100 text-xs font-bold text-slate-400 rounded-lg transition-all">2</button>
                 <button className="px-3 h-8 hover:bg-white border border-transparent hover:border-slate-100 text-xs font-bold text-slate-400 rounded-lg transition-all">3</button>
                 <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                   <Icons.ChevronLeftDouble className="w-3 h-3 rotate-180" />
                 </button>
              </div>
            </div>
            )}
          </>
        ) : activeTab === 'logs' ? (
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Logs de Interação Zia API</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-400 font-medium">Exibindo interações em tempo real</div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all">
                  <Icons.Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autor (Recurso)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chave API</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[200px]">Input Enviado</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modelo</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[250px]">Output Recebido</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-sky-500 rounded-full" />
                          <span className="text-sm font-bold text-slate-700">{log.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <code className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">{log.apiKeyName}</code>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-600 line-clamp-2 max-w-[300px] leading-relaxed italic">
                          "{log.input}"
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100">
                          {log.model}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-slate-800 line-clamp-3 max-w-[400px] leading-relaxed font-medium">
                          {log.output}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-[10px] font-mono text-slate-400">{log.timestamp}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Fim dos logs recentes</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-[#0070E0] rounded shadow-sm">Carregar Mais</button>
              </div>
            </div>
          </div>
        ) : activeTab === 'costs' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Tendência de Custos (USD)</h3>
                    <p className="text-xs text-slate-400 font-medium">Evolução dos gastos com tokens em toda a organização</p>
                  </div>
                  <Icons.Dollar className="w-5 h-5 text-sky-600" />
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_COSTS_TREND}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0070E0" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0070E0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94A3B8'}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="cost" stroke="#0070E0" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Custo por Recurso</h3>
                    <p className="text-xs text-slate-400 font-medium">Consumo proporcional dos últimos 30 dias</p>
                  </div>
                  <Icons.Monitoring className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="space-y-6">
                  {MOCK_RESOURCE_COSTS.map((res, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{res.name}</span>
                        <span>R$ {res.cost.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                          style={{width: `${(res.cost / 520) * 100}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{res.interactions.toLocaleString()} interações</span>
                        <span>Avg. R$ {(res.cost / res.interactions).toFixed(4)} / int</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Histórico de Faturamento Sugerido</h3>
              </div>
              <div className="p-12 text-center">
                <Icons.Audit className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-medium">Relatórios detalhados por Centro de Custo em desenvolvimento.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gestão de Chaves Zia API</h3>
                  <p className="text-xs text-slate-400 mt-1">Gerencie o acesso programático para seus Agentes e Assistentes</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-100">
                  <Icons.Plus className="w-4 h-4" />
                  Nova Chave
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome da Chave</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recurso Associado</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chave (Masked)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uso Total</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_API_KEYS.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800">{key.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Criada em {key.createdAt}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-600">{key.resourceName}</span>
                      </td>
                      <td className="px-6 py-5">
                         <code className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-slate-500">{key.key}</code>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          key.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-slate-700">{key.usageCount.toLocaleString()} calls</div>
                        <div className="text-[10px] text-slate-400">Último uso: {key.lastUsed || '-'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all" title="Editar">
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all" title={key.status === 'Ativa' ? 'Revogar' : 'Excluir'}>
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 bg-white text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                <Icons.Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-amber-900">Segurança de Chaves</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  As chaves de API concedem acesso total aos recursos vinculados. Nunca compartilhe chaves em ambientes públicos ou no frontend das aplicações. 
                  Sempre use um Proxy Seguro ou as bibliotecas oficiais da ZIA para integração.
                </p>
              </div>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shadow-md shadow-amber-100">
                Ver Guia de Segurança
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZiaMonitoringPage;
