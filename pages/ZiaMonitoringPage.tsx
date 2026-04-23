
import React, { useState } from 'react';
import { UserUsage, UserRole } from '../types';
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
  Pie
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

const ZiaMonitoringPage: React.FC = () => {
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

        {/* Filter Panel */}
        {showFilters && (
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                <Icons.User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{activeUsersTotal}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Usuários Ativos</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                <Icons.Chat className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{totalInteractions}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Total Interações</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 text-[#0070E0] rounded-xl flex items-center justify-center">
                <Icons.AgentBuilder className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{avgInteractions}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Média por Usuário</div>
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
    </div>
  </div>
);
};

export default ZiaMonitoringPage;
