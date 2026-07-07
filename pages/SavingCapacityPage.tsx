import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Droplet, 
  User, 
  Users, 
  Plus, 
  Calendar, 
  ArrowRight, 
  Trash, 
  Edit, 
  RefreshCw, 
  Zap, 
  Check, 
  HelpCircle, 
  ChevronRight, 
  BarChart2, 
  AlertTriangle,
  Info,
  DollarSign,
  TrendingDown,
  ChevronDown,
  Sparkles,
  Settings
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface ResourceSaving {
  id: string;
  name: string;
  area: string;
  platform: string; // "Luna"
  minutesAvoided: number; // minutos evitados por execução
  executions: number; // execuções no mês
  realizedFTE: number; // Saving Realizado acumulado (ledger)
  absorbedFTE: number; // Capacidade Absorvida acumulada (ledger)
}

interface MonthlyHistory {
  monthName: string;
  totalBruta: number;
  totalRealizado: number;
  totalAbsorvida: number;
  totalLiquida: number;
  efficiencyIndex: number;
}

export default function SavingCapacityPage() {
  // 1. Core State with LocalStorage Persistence
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(() => {
    return Number(localStorage.getItem('saving_month_idx') || '0');
  });

  const monthsList = [
    'Julho 2026', 'Agosto 2026', 'Setembro 2026', 'Outubro 2026', 
    'Novembro 2026', 'Dezembro 2026', 'Janeiro 2027', 'Fevereiro 2027'
  ];

  const currentMonthName = monthsList[currentMonthIndex % monthsList.length];

  const [resources, setResources] = useState<ResourceSaving[]>(() => {
    const cached = localStorage.getItem('saving_resources');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    // Preloaded resource data based on the document's 4 cases
    return [
      {
        id: 'res-1',
        name: 'Automação Cross-sell',
        area: 'Comercial',
        platform: 'Luna',
        minutesAvoided: 15,
        executions: 803, // Gives exactly 1.14 FTE
        realizedFTE: 0.0,
        absorbedFTE: 0.0
      },
      {
        id: 'res-2',
        name: 'Suporte N0',
        area: 'Suporte',
        platform: 'Luna',
        minutesAvoided: 8,
        executions: 1254, // Gives exactly 0.95 FTE
        realizedFTE: 0.0,
        absorbedFTE: 0.0
      },
      {
        id: 'res-3',
        name: 'Triagem Pré-vendas',
        area: 'Vendas',
        platform: 'Luna',
        minutesAvoided: 20,
        executions: 750, // Gives exactly 1.42 FTE
        realizedFTE: 0.0,
        absorbedFTE: 0.0
      },
      {
        id: 'res-4',
        name: 'Análise de Feedback Produto',
        area: 'Produto',
        platform: 'Luna',
        minutesAvoided: 30,
        executions: 479, // Gives exactly 1.36 FTE
        realizedFTE: 0.0,
        absorbedFTE: 0.0
      }
    ];
  });

  // History ledger to show trends
  const [history, setHistory] = useState<MonthlyHistory[]>(() => {
    const cached = localStorage.getItem('saving_history');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    // Pre-loaded historical series to start with beautiful charts
    return [
      { monthName: 'Abril 2026', totalBruta: 2.1, totalRealizado: 0.0, totalAbsorvida: 0.4, totalLiquida: 1.7, efficiencyIndex: 631.2 },
      { monthName: 'Maio 2026', totalBruta: 3.3, totalRealizado: 0.5, totalAbsorvida: 0.8, totalLiquida: 2.0, efficiencyIndex: 632.4 },
      { monthName: 'Junho 2026', totalBruta: 4.5, totalRealizado: 1.0, totalAbsorvida: 1.2, totalLiquida: 2.3, efficiencyIndex: 633.6 },
    ];
  });

  // Dynamic state for creating/editing resources
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newResName, setNewResName] = useState('');
  const [newResArea, setNewResArea] = useState('Comercial');
  const [newResMinutes, setNewResMinutes] = useState(15);
  const [newResExecutions, setNewResExecutions] = useState(500);

  // Active view mode: "Geral" (Agregado) or specific resource ID
  const [selectedResourceId, setSelectedResourceId] = useState<string>('all');

  // Interactive accountability state
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionResourceId, setDecisionResourceId] = useState<string>('');
  const [decisionType, setDecisionType] = useState<'realized' | 'absorbed'>('realized');
  const [decisionValue, setDecisionValue] = useState<number>(0.5);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem('saving_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('saving_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('saving_month_idx', String(currentMonthIndex));
  }, [currentMonthIndex]);

  // 2. Calculations (Base fixa de 176h úteis/mês)
  const HOURS_LIMIT = 176;

  // Calculates single resource stats
  const calculateResourceStats = (res: ResourceSaving) => {
    const brutaFTE = parseFloat(((res.executions * res.minutesAvoided / 60) / HOURS_LIMIT).toFixed(2));
    const liquidaFTE = parseFloat(Math.max(0, brutaFTE - res.realizedFTE - res.absorbedFTE).toFixed(2));
    return {
      brutaFTE,
      liquidaFTE,
      hoursAvoided: parseFloat((res.executions * res.minutesAvoided / 60).toFixed(1))
    };
  };

  // Aggregates for all resources
  const aggregatedMetrics = useMemo(() => {
    let totalBruta = 0;
    let totalRealizado = 0;
    let totalAbsorvida = 0;
    let totalHours = 0;

    resources.forEach(res => {
      const stats = calculateResourceStats(res);
      totalBruta += stats.brutaFTE;
      totalRealizado += res.realizedFTE;
      totalAbsorvida += res.absorbedFTE;
      totalHours += stats.hoursAvoided;
    });

    const totalLiquida = Math.max(0, totalBruta - totalRealizado - totalAbsorvida);

    return {
      totalBruta: parseFloat(totalBruta.toFixed(2)),
      totalRealizado: parseFloat(totalRealizado.toFixed(2)),
      totalAbsorvida: parseFloat(totalAbsorvida.toFixed(2)),
      totalLiquida: parseFloat(totalLiquida.toFixed(2)),
      totalHours: parseFloat(totalHours.toFixed(1))
    };
  }, [resources]);

  // Dynamic Efficiency Score (Gamification)
  const efficiencyIndex = useMemo(() => {
    const baseScore = 634.0;
    // Every custom added resource triggers +0.5
    const addedResourcesCount = Math.max(0, resources.length - 4);
    const addedResourcesBonus = addedResourcesCount * 0.5;

    // Every manager accountability registry triggers +0.8
    let decisionsCount = 0;
    resources.forEach(res => {
      if (res.realizedFTE > 0) decisionsCount += Math.ceil(res.realizedFTE / 0.1);
      if (res.absorbedFTE > 0) decisionsCount += Math.ceil(res.absorbedFTE / 0.1);
    });
    const decisionsBonus = decisionsCount * 0.08; // calibrated for fine increments

    // Month simulator advances add bonus points
    const monthBonus = currentMonthIndex * 0.6;

    return parseFloat((baseScore + addedResourcesBonus + decisionsBonus + monthBonus).toFixed(1));
  }, [resources, currentMonthIndex]);

  // Current selected active resource object if not 'all'
  const activeResource = useMemo(() => {
    return resources.find(r => r.id === selectedResourceId) || null;
  }, [resources, selectedResourceId]);

  // Handle adding new resource
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim()) return;

    const newRes: ResourceSaving = {
      id: `res-${Date.now()}`,
      name: newResName,
      area: newResArea,
      platform: 'Luna',
      minutesAvoided: Number(newResMinutes),
      executions: Number(newResExecutions),
      realizedFTE: 0,
      absorbedFTE: 0
    };

    setResources(prev => [...prev, newRes]);
    setIsAddModalOpen(false);
    setNewResName('');
    // Prompt visually
    alert(`Sucesso! Recurso "${newResName}" adicionado ao Luna. Capacidade Bruta gerada de ${((newResExecutions * newResMinutes / 60) / HOURS_LIMIT).toFixed(2)} FTE.`);
  };

  // Handle registering manager accountability decision
  const handleRegisterDecision = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = decisionResourceId || selectedResourceId;
    if (targetId === 'all') {
      alert('Selecione um recurso específico para aplicar a decisão de headcount.');
      return;
    }

    setResources(prev => prev.map(res => {
      if (res.id === targetId) {
        const stats = calculateResourceStats(res);
        const maxAvailableToBurn = stats.liquidaFTE;

        let appliedVal = parseFloat(decisionValue.toFixed(2));
        if (appliedVal > maxAvailableToBurn) {
          appliedVal = maxAvailableToBurn;
        }

        if (decisionType === 'realized') {
          return {
            ...res,
            realizedFTE: parseFloat((res.realizedFTE + appliedVal).toFixed(2))
          };
        } else {
          return {
            ...res,
            absorbedFTE: parseFloat((res.absorbedFTE + appliedVal).toFixed(2))
          };
        }
      }
      return res;
    }));

    setIsDecisionModalOpen(false);
  };

  // Simulating Next Month Loop
  const handleAdvanceMonth = () => {
    // 1. Save current month's aggregates to historical list
    const currentHist: MonthlyHistory = {
      monthName: currentMonthName,
      totalBruta: aggregatedMetrics.totalBruta,
      totalRealizado: aggregatedMetrics.totalRealizado,
      totalAbsorvida: aggregatedMetrics.totalAbsorvida,
      totalLiquida: aggregatedMetrics.totalLiquida,
      efficiencyIndex: efficiencyIndex
    };

    setHistory(prev => {
      // Prevent duplicates of the same month
      if (prev.some(h => h.monthName === currentMonthName)) {
        return prev.map(h => h.monthName === currentMonthName ? currentHist : h);
      }
      return [...prev, currentHist];
    });

    // 2. Advance the month index
    setCurrentMonthIndex(prev => prev + 1);

    // 3. Slightly simulate variations in executions for next month (+/- 12%)
    setResources(prev => prev.map(res => {
      const variation = 0.88 + Math.random() * 0.24; // multiplier between 0.88 and 1.12
      const newExecutions = Math.max(50, Math.round(res.executions * variation));
      return {
        ...res,
        executions: newExecutions
      };
    }));
  };

  // Quick reset to defaults
  const handleResetSimulator = () => {
    if (confirm('Tem certeza que deseja reiniciar o simulador de economia para os dados originais do documento?')) {
      localStorage.removeItem('saving_resources');
      localStorage.removeItem('saving_history');
      localStorage.removeItem('saving_month_idx');
      window.location.reload();
    }
  };

  // Chart data formatting
  const chartData = useMemo(() => {
    const historicalData = history.map(h => ({
      name: h.monthName,
      'Capac. Bruta': h.totalBruta,
      'Saving Realizado': h.totalRealizado,
      'Capac. Absorvida': h.totalAbsorvida,
      'Capac. Líquida': h.totalLiquida,
    }));

    // Add current month in progress
    historicalData.push({
      name: currentMonthName + ' (Atual)',
      'Capac. Bruta': aggregatedMetrics.totalBruta,
      'Saving Realizado': aggregatedMetrics.totalRealizado,
      'Capac. Absorvida': aggregatedMetrics.totalAbsorvida,
      'Capac. Líquida': aggregatedMetrics.totalLiquida,
    });

    return historicalData;
  }, [history, currentMonthName, aggregatedMetrics]);

  // Leaderboard rating
  const leaderboardResources = useMemo(() => {
    return [...resources].map(res => {
      const stats = calculateResourceStats(res);
      return {
        ...res,
        brutaFTE: stats.brutaFTE,
        hoursAvoided: stats.hoursAvoided
      };
    }).sort((a, b) => b.brutaFTE - a.brutaFTE);
  }, [resources]);

  // Dynamic Badges based on performance
  const badgesEarned = useMemo(() => {
    const list = [];
    const totalHours = aggregatedMetrics.totalHours;
    const totalRealizado = aggregatedMetrics.totalRealizado;

    if (totalHours >= 100) {
      list.push({
        id: 'b1',
        title: 'Guardião do Tempo',
        desc: 'Evitou mais de 100 horas de trabalho manual.',
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-800'
      });
    }
    if (totalHours >= 500) {
      list.push({
        id: 'b2',
        title: 'Mestre da Eficiência',
        desc: 'Alcançou o marco de 500h evitadas na organização.',
        icon: <Award className="w-5 h-5 text-purple-500" />,
        color: 'from-purple-50 to-indigo-50 border-purple-200 text-purple-800'
      });
    }
    if (totalRealizado >= 1.0) {
      list.push({
        id: 'b3',
        title: 'Accountability Ativa',
        desc: 'Gestor reduziu ou realocou com sucesso pelo menos 1 FTE real.',
        icon: <Check className="w-5 h-5 text-emerald-500" />,
        color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800'
      });
    }
    if (aggregatedMetrics.totalLiquida === 0 && resources.length > 0) {
      list.push({
        id: 'b4',
        title: 'Desperdício Zero',
        desc: 'Toda a capacidade líquida de saving foi absorvida ou realizada!',
        icon: <Sparkles className="w-5 h-5 text-sky-500 animate-pulse" />,
        color: 'from-sky-50 to-indigo-50 border-sky-200 text-sky-800'
      });
    }

    // Default always present
    list.push({
      id: 'b-default',
      title: 'Luna Inovador',
      desc: 'Iniciou a governança ativa com agentes inteligentes.',
      icon: <Droplet className="w-5 h-5 text-sky-500" />,
      color: 'from-sky-50 to-blue-50 border-sky-200 text-sky-800'
    });

    return list;
  }, [aggregatedMetrics, resources]);

  // Visual for the active display (selected single or aggregated)
  const displayBruta = activeResource ? calculateResourceStats(activeResource).brutaFTE : aggregatedMetrics.totalBruta;
  const displayRealizado = activeResource ? activeResource.realizedFTE : aggregatedMetrics.totalRealizado;
  const displayAbsorvida = activeResource ? activeResource.absorbedFTE : aggregatedMetrics.totalAbsorvida;
  const displayLiquida = activeResource ? calculateResourceStats(activeResource).liquidaFTE : aggregatedMetrics.totalLiquida;
  const displayHours = activeResource ? calculateResourceStats(activeResource).hoursAvoided : aggregatedMetrics.totalHours;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header with Title & Gamified Efficiency Index */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Métricas Operacionais de Governança</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Capacidade de Saving <span className="font-light text-slate-400">| Luna</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulador corporativo de eficiência operacional, FTEs evitados e liberação de capacidade produtiva.
          </p>
        </div>

        {/* Gamified Index Indicator */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Zap className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Índice Operacional Zucchetti</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight">{efficiencyIndex.toFixed(1)}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                +{(0.5 + currentMonthIndex * 0.1).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Sobe com novos agentes e decisões de gestores</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Simulation Controller & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 p-5 rounded-2xl border border-indigo-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-indigo-100 text-indigo-600 shadow-sm">
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Ciclo de Gestão</span>
            <span className="text-base font-extrabold text-slate-800">{currentMonthName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetSimulator}
            title="Reiniciar dados do simulador"
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Resetar Protótipo
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Recurso de IA</span>
          </button>

          <button
            onClick={handleAdvanceMonth}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:-translate-y-0.5"
          >
            <span>Avançar Mês</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. The 4 Parallel Metrics Cards (Exactly as required) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Metric 1: Capacidade de Saving Bruta */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-indigo-500/10 group-hover:scale-110 transition-transform">
            <BarChart2 className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">1. Capacidade Bruta (FTE)</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{displayBruta.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-400 font-mono">FTE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Equivalente a <strong className="text-slate-700">{Math.round(displayHours)} horas</strong> de gargalo manual resolvido neste mês.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Recalculada todo mês</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fórmula Doc</span>
          </div>
        </div>

        {/* Metric 2: Saving Realizado (Cumulative Headcount Reductions) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">2. Saving Realizado</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">{displayRealizado.toFixed(2)}</span>
            <span className="text-xs font-bold text-emerald-500 font-mono">FTE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Redução real de headcount vinculada à folha de pagamento corporativa.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Ledger Cumulativo</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Folha de Pagamento</span>
          </div>
        </div>

        {/* Metric 3: Capacidade Absorvida (Contratações Evitadas) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-sky-500/10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">3. Capacidade Absorvida</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-sky-600 tracking-tight">{displayAbsorvida.toFixed(2)}</span>
            <span className="text-xs font-bold text-sky-500 font-mono">FTE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Capacidade livre que evitou a contratação de novos colaboradores.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Ledger Cumulativo</span>
            <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Crescimento de Escala</span>
          </div>
        </div>

        {/* Metric 4: Capacidade de Saving Líquida (Remaining available to resolve) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-amber-500/10 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-12 h-12" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">4. Capacidade Líquida</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-3xl font-black tracking-tight ${displayLiquida > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {displayLiquida.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">FTE</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Folga restante disponível para a decisão de headcount do gestor da BU.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Líquida = Bruta - Realizado - Absorvida</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Disponível</span>
          </div>
        </div>

      </div>

      {/* 4. Filter Selector to view Aggregated Tank vs Individual Tank */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Filtrar Visão:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedResourceId('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedResourceId === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Visão Agregada (Empresa)
            </button>
            {resources.map(res => (
              <button
                key={res.id}
                onClick={() => setSelectedResourceId(res.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedResourceId === res.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {res.name} ({res.area})
              </button>
            ))}
          </div>
        </div>

        {/* Manager Action Trigger */}
        {selectedResourceId !== 'all' && (
          <button
            onClick={() => {
              setDecisionResourceId(selectedResourceId);
              setIsDecisionModalOpen(true);
            }}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl border border-indigo-200 shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
            <span>Registrar Ação do Gestor</span>
          </button>
        )}
      </div>

      {/* 5. Central Visual: Water Tank & Headcount Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Water Tank Visual Simulation */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          {/* Falling water droplets decorative header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-ping shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Canal de Entrada de Demanda (Água)</span>
            </div>
            <div className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md">
              Capacidade de Saving Bruta: <span className="text-sky-400 font-bold">{displayBruta.toFixed(2)} FTE</span>
            </div>
          </div>

          {/* WATER TANK LAYOUT */}
          <div className="my-8 flex-1 flex flex-col md:flex-row items-center gap-8 relative z-10">
            
            {/* The Visual Water Tank */}
            <div className="w-full md:w-52 h-64 bg-slate-950/60 rounded-3xl border-2 border-slate-700 relative overflow-hidden shadow-inner flex flex-col justify-end">
              
              {/* Trigger Threshold Line (1.0 FTE) */}
              <div 
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-500 z-30"
                style={{ bottom: '50%' }} // Calibrated so 1.0 FTE is exactly in the middle representing the target
              >
                <div className="absolute right-2 -top-2.5 bg-red-600/90 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-red-400 shadow flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>GATILHO DE HEADCOUNT (1.0 FTE)</span>
                </div>
              </div>

              {/* Water level height calculation */}
              {/* Max level represented in tank is 2.0 FTE. So 1.0 FTE fills 50% of the tank. */}
              {(() => {
                const percentage = Math.min(100, (displayBruta / 2.0) * 100);
                return (
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600/95 via-sky-500/90 to-sky-400/80 relative transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    style={{ height: `${Math.max(8, percentage)}%` }}
                  >
                    {/* Animated water waves */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-white/25 blur-[1px] animate-pulse" />
                    
                    {/* Dynamic label indicating current water height */}
                    <div className="absolute inset-x-0 bottom-4 text-center">
                      <span className="text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-slate-950/40 px-2 py-0.5 rounded-full inline-block">
                        {displayBruta.toFixed(2)} FTE
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Simulated Figures next to tank representing the FTEs saved */}
            <div className="flex-1 space-y-4 w-full">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Simulação de Impacto Humano</span>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {/* Render solid stick figures for whole FTEs */}
                    {Array.from({ length: Math.floor(displayBruta) }).map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300 shadow-sm animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                        <User className="w-5 h-5 fill-indigo-300" />
                      </div>
                    ))}
                    {/* Render dotted transparent stick figure for fractional FTE */}
                    {displayBruta % 1 > 0.1 && (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500 animate-pulse">
                        <div className="relative">
                          <User className="w-5 h-5" />
                          <div className="absolute inset-0 bg-slate-900/60" />
                        </div>
                      </div>
                    )}
                    {displayBruta === 0 && (
                      <div className="text-xs text-slate-500 italic py-2">Nenhuma capacidade liberada neste filtro.</div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {Math.floor(displayBruta)} {Math.floor(displayBruta) === 1 ? 'FTE completo' : 'FTEs completos'} liberados
                    </span>
                    <span className="text-[11px] text-indigo-400 block font-medium">
                      Equivale a {(displayBruta * HOURS_LIMIT).toFixed(0)} horas de foco de equipe poupadas.
                    </span>
                  </div>
                </div>
              </div>

              {/* Threshold indicator trigger highlights */}
              {displayBruta >= 1.0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200 text-xs font-extrabold block">Ponto de Gatilho Ultrapassado (&gt;= 1.0 FTE)</strong>
                    <p className="text-[11px] text-amber-300/90 leading-relaxed mt-0.5">
                      Gargalos superaram 1 FTE inteiro. Gestor deve avaliar ativamente a redução de headcount real ou realocar o tempo livre para canais de crescimento acelerado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 flex items-start gap-3">
                  <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-300 text-xs font-bold block">Capacidade abaixo do Gatilho</span>
                    <p className="text-[11px] leading-relaxed mt-0.5">
                      Atividade útil poupada ainda não ultrapassa 1.0 FTE. A capacidade líquida fica disponível como pequenos blocos de folga operacional pro time focar em melhorias do produto.
                    </p>
                  </div>
                </div>
              )}

              {/* Decisão Recomendada Section */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Decisão Operacional Recomendada</span>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-300 font-medium block">Liquidado (Cortado ou Absorvido):</span>
                    <span className="text-slate-400">Capacidade restante para resolver:</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-400 font-black block">{(displayRealizado + displayAbsorvida).toFixed(2)} FTE</span>
                    <span className="text-amber-400 font-bold block">{displayLiquida.toFixed(2)} FTE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom indicator notes */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-500 relative z-10">
            <span>Demanda contínua monitorada pela IA</span>
            <span className="font-mono text-slate-400">Governança de Saving Ativo</span>
          </div>
        </div>

        {/* Right Column: Gamified Leaderboard & Badges */}
        <div className="space-y-8">
          
          {/* Leaderboard */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Leaderboard de Economia</h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Por Bruta</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {leaderboardResources.map((res, idx) => (
                <div key={res.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-slate-150 text-slate-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block truncate max-w-[130px]">{res.name}</span>
                      <span className="text-[10px] text-slate-400 block">{res.area}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-800 font-mono block">{res.brutaFTE.toFixed(2)} FTE</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{res.hoursAvoided}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gamified Badges */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="font-extrabold text-slate-800 text-sm">Medalhas de Governança</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {badgesEarned.map(badge => (
                <div key={badge.id} className={`p-3 rounded-2xl border flex items-start gap-3 bg-gradient-to-r ${badge.color} transition-all hover:scale-[1.01]`}>
                  <div className="p-1.5 bg-white/80 rounded-lg shadow-sm shrink-0">
                    {badge.icon}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold block">{badge.title}</span>
                    <p className="text-[10px] opacity-90 leading-normal">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 6. Historical Saving Capacity Trend Line Chart */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">Evolução de Saving (Ciclo a Ciclo)</h3>
          <p className="text-xs text-slate-500">Mapeamento da governança de economia produtiva e headcount ideal da empresa.</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBruta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsorvida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="Capac. Bruta" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBruta)" />
              <Area type="monotone" dataKey="Saving Realizado" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRealizado)" />
              <Area type="monotone" dataKey="Capac. Absorvida" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorAbsorvida)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Individual Resource Management Table (Editable & Interactive) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Controle Detalhado por Agente</h3>
            <p className="text-xs text-slate-500">Ajuste individual de minutos evitados e execuções no mês.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agente</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-6">Agente / Recurso</th>
                <th className="py-3 px-6">Área / BU</th>
                <th className="py-3 px-6">Minutos Evitados</th>
                <th className="py-3 px-6">Execuções Mês</th>
                <th className="py-3 px-6">Capacidade Bruta</th>
                <th className="py-3 px-6">Saving Realizado</th>
                <th className="py-3 px-6">Capac. Absorvida</th>
                <th className="py-3 px-6">Ações de Headcount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {resources.map(res => {
                const stats = calculateResourceStats(res);
                return (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">{res.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {res.area}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <input
                        type="number"
                        value={res.minutesAvoided}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          setResources(prev => prev.map(item => item.id === res.id ? { ...item, minutesAvoided: val } : item));
                        }}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                      />
                      <span className="text-slate-400 ml-1">min</span>
                    </td>
                    <td className="py-4 px-6">
                      <input
                        type="number"
                        value={res.executions}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setResources(prev => prev.map(item => item.id === res.id ? { ...item, executions: val } : item));
                        }}
                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                      />
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-800 font-mono">
                      {stats.brutaFTE.toFixed(2)} FTE
                    </td>
                    <td className="py-4 px-6 font-mono text-emerald-600 font-bold">
                      {res.realizedFTE.toFixed(2)} FTE
                    </td>
                    <td className="py-4 px-6 font-mono text-sky-600 font-bold">
                      {res.absorbedFTE.toFixed(2)} FTE
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setDecisionResourceId(res.id);
                            setIsDecisionModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-100 transition-all cursor-pointer"
                        >
                          Aplicar Decisão
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir governança de saving do agente "${res.name}"?`)) {
                              setResources(prev => prev.filter(item => item.id !== res.id));
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                          title="Remover recurso"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Nenhum agente cadastrado no simulador de economia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Novo Recurso de IA no Luna</h3>
            <p className="text-xs text-slate-500 mb-4">Insira os parâmetros operacionais para calcular a capacidade produtiva em FTE.</p>
            
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nome do Agente</label>
                <input
                  type="text"
                  placeholder="Ex: Resumo de Tickets Luna"
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Área / BU</label>
                  <select
                    value={newResArea}
                    onChange={(e) => setNewResArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold bg-white"
                  >
                    <option value="Comercial">Comercial</option>
                    <option value="Suporte">Suporte</option>
                    <option value="Vendas">Vendas</option>
                    <option value="Produto">Produto</option>
                    <option value="TI & Infra">TI &amp; Infra</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Minutos por Execução</label>
                  <input
                    type="number"
                    value={newResMinutes}
                    onChange={(e) => setNewResMinutes(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono font-bold"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Execuções Estimadas no Mês</label>
                <input
                  type="number"
                  value={newResExecutions}
                  onChange={(e) => setNewResExecutions(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono font-bold"
                  min="0"
                  required
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-[10.5px] leading-relaxed text-slate-600">
                <span className="font-bold block text-slate-800 mb-0.5">Cálculo de Capacidade:</span>
                FTE = (({newResExecutions} execuções × {newResMinutes} min) ÷ 60) ÷ 176h úteis/mês = <strong className="text-indigo-600 font-bold">{((newResExecutions * newResMinutes / 60) / HOURS_LIMIT).toFixed(2)} FTE</strong> de economia bruta.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Salvar Agente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision / Headcount Action Modal */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Registrar Decisão de Headcount</h3>
            <p className="text-xs text-slate-500 mb-4">Escolha como queimar/exercer a capacidade líquida de saving acumulada para este agente de IA.</p>
            
            <form onSubmit={handleRegisterDecision} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Destinação do Saving</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecisionType('realized')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      decisionType === 'realized'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Saving Realizado</span>
                    <span className="text-[9px] opacity-80 font-medium">Vinculado à Folha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionType('absorbed')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      decisionType === 'absorbed'
                        ? 'border-sky-500 bg-sky-50 text-sky-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 text-sky-600" />
                    <span className="text-xs font-bold">Absorvida (Crescimento)</span>
                    <span className="text-[9px] opacity-80 font-medium">Evitou Contratação</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Valor a Aplicar (FTE)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={decisionValue}
                    onChange={(e) => setDecisionValue(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-mono font-black text-base text-slate-800 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    {decisionValue.toFixed(2)} FTE
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Limite dinâmico máximo de saving de acordo com a capacidade líquida restante do agente.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirmar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
