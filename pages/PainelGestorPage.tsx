import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Coins, 
  TrendingUp, 
  Flame, 
  HelpCircle, 
  History, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Send,
  Building2
} from 'lucide-react';
import { deptXpService, BADGES_TABLE, DeptBadge, XpRedemption, MOCK_USERS_LIST } from '../services/deptXpService';
import { User } from '../types';

interface PainelGestorPageProps {
  user: User;
  onAddSystemNotification?: (title: string, desc: string, agentName: string) => void;
}

export default function PainelGestorPage({ user, onAddSystemNotification }: PainelGestorPageProps) {
  const [managedDepts, setManagedDepts] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  
  // State for loaded department XP
  const [historicoXp, setHistoricoXp] = useState(0);
  const [disponivelXp, setDisponivelXp] = useState(0);
  const [resgatadoXp, setResgatadoXp] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<DeptBadge[]>([]);
  const [latestBadge, setLatestBadge] = useState<DeptBadge | null>(null);
  const [redemptions, setRedemptions] = useState<XpRedemption[]>([]);

  // Redemption Form State
  const [redeemAmount, setRedeemAmount] = useState<string>('10560');
  const [actionType, setActionType] = useState<'Compactar Squad' | 'Elevar Padrão' | 'Escalar Operação'>('Elevar Padrão');
  const [details, setDetails] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Badge Congratulation State
  const [badgeToCelebrate, setBadgeToCelebrate] = useState<DeptBadge | null>(null);

  // Load departments managed by the logged-in user
  useEffect(() => {
    const depts = deptXpService.getDepartmentsForGestor(user.name);
    setManagedDepts(depts);
    if (depts.length > 0) {
      setSelectedDept(depts[0]);
    }
  }, [user.name]);

  // Load department metrics whenever selected department changes
  useEffect(() => {
    if (!selectedDept) return;
    refreshMetrics();

    // Check for new, unnotified badges to trigger celebratory animation/notif
    const unnotified = deptXpService.getUnnotifiedBadgesForGestor(user.name, selectedDept);
    if (unnotified.length > 0) {
      // Celebrate the highest newly unlocked badge
      const highestBadge = unnotified[unnotified.length - 1];
      setBadgeToCelebrate(highestBadge);
      
      // Mark all as notified
      unnotified.forEach(b => {
        deptXpService.markBadgeAsNotified(user.name, selectedDept, b.cycle);
        
        // Add a header notification
        if (onAddSystemNotification) {
          onAddSystemNotification(
            `Novo Emblema Desbloqueado: ${b.name}! 🏆`,
            `O departamento ${selectedDept} acumulou ${b.xpRequired} XP Histórico e conquistou um novo emblema!`,
            'Sistema Luna'
          );
        }
      });
    }
  }, [selectedDept]);

  const refreshMetrics = () => {
    if (!selectedDept) return;
    const data = deptXpService.getDeptXpData(selectedDept);
    setHistoricoXp(data.historico);
    setDisponivelXp(data.disponivel);
    setResgatadoXp(data.resgatado);
    setUnlockedBadges(deptXpService.getBadgesForDept(selectedDept));
    setLatestBadge(deptXpService.getLatestBadgeForDept(selectedDept));
    setRedemptions(deptXpService.getRedemptionsForDept(selectedDept));
  };

  const handleConfirmRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    const amount = Number(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Por favor, informe uma quantidade de XP válida.');
      return;
    }

    if (!details || details.trim().length === 0) {
      setFormError('O detalhamento da justificativa é de preenchimento obrigatório para auditar o resgate.');
      return;
    }

    const result = deptXpService.requestRedemption(user.name, selectedDept, amount, actionType, details);
    if (result.success) {
      setFormSuccess(`Resgate de ${amount} XP realizado com sucesso para a ação "${actionType}"!`);
      setDetails('');
      setRedeemAmount('10560');
      refreshMetrics();
    } else {
      setFormError(result.error || 'Falha ao realizar o resgate.');
    }
  };

  // Helper to calculate next badge goal
  const nextBadgeXpNeeded = latestBadge 
    ? (latestBadge.cycle < 10 ? BADGES_TABLE[latestBadge.cycle].xpRequired : 105600)
    : 10560;

  const currentCycleProgress = latestBadge
    ? Math.min(100, ((historicoXp - latestBadge.xpRequired) / 10560) * 100)
    : Math.min(100, (historicoXp / 10560) * 100);

  const xpRemainingForNextBadge = nextBadgeXpNeeded - historicoXp;

  if (managedDepts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[80vh] max-w-lg mx-auto select-none">
        <div className="w-16 h-16 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sem Departamentos Vinculados</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Seu perfil **({user.name})** ainda não está vinculado a nenhum departamento sob sua gestão.
        </p>
        <p className="text-xs text-slate-400 mt-3 bg-slate-50 border border-slate-150 p-3.5 rounded-xl leading-relaxed">
          💡 **Atenção Administrador:** Use o menu **Vínculos de Gestores** no painel administrativo para vincular este perfil aos departamentos correspondentes de sua organização.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      
      {/* Header com Seletor de Departamento se houver múltiplos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Coins className="w-8 h-8" />
            </span>
            Painel de Luna XP
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie o Luna XP acumulado e os emblemas conquistados pelos seus departamentos.
          </p>
        </div>

        {/* Seletor */}
        {managedDepts.length > 1 ? (
          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">Departamento:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-sm font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 cursor-pointer focus:outline-none"
            >
              {managedDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            Gestão do Departamento: <span className="text-indigo-600">{selectedDept}</span>
          </div>
        )}
      </div>

      {/* Cartões de Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Luna XP Histórico */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Luna XP Histórico</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{historicoXp.toLocaleString()} <span className="text-xs text-sky-500 font-bold uppercase">XP</span></div>
            <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
              Total de economia gerada pela IA acumulada pelo seu departamento.
            </p>
          </div>
        </div>

        {/* Luna XP Disponível */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
          <div className="z-10">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Luna XP Disponível</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{disponivelXp.toLocaleString()} <span className="text-xs text-emerald-500 font-bold uppercase">XP</span></div>
            <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
              Saldo disponível para resgatar em ações de reorganização ou expansão de squads.
            </p>
          </div>

          {/* Indicador XP a Resgatar (glow se >= 10.560 XP) */}
          {disponivelXp >= 10560 && (
            <div className="absolute right-3 top-3 animate-pulse">
              <span className="inline-flex items-center gap-1 text-[9px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-emerald-250 border border-emerald-400">
                <Flame className="w-2.5 h-2.5 fill-current" />
                XP A RESGATAR
              </span>
            </div>
          )}
        </div>

        {/* Total Resgatado */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Resgatado</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{resgatadoXp.toLocaleString()} <span className="text-xs text-amber-500 font-bold uppercase">XP</span></div>
            <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
              XP total convertido em conquistas de otimização operacional.
            </p>
          </div>
        </div>

      </div>

      {/* Grid Principal: Resgate + Progresso de Emblemas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulário de Resgate (Esquerda, 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between h-full space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Solicitar Resgate de XP
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Cada resgate converte a eficiência da IA em decisões estratégicas de gestão operacional.
              </p>
            </div>

            <form onSubmit={handleConfirmRedeem} className="space-y-4">
              {/* Quantidade */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Quantidade (Luna XP)</label>
                  <span className="text-[10px] text-slate-450 font-bold">Máx: {disponivelXp.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={disponivelXp}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50 transition-all font-mono"
                  placeholder="Ex: 10560"
                />
              </div>

              {/* Tipo da Ação */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo da Ação Operacional</label>
                <select
                  value={actionType}
                  onChange={(e: any) => setActionType(e.target.value)}
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                >
                  <option value="Compactar Squad">Compactar Squad (Reorganização de escopo)</option>
                  <option value="Elevar Padrão">Elevar Padrão (Melhoria de SLA/Qualidade)</option>
                  <option value="Escalar Operação">Escalar Operação (Aumento de capacidade/volume)</option>
                </select>
              </div>

              {/* Justificativa / Detalhamento */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Justificativa Detalhada (Obrigatório)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 bg-slate-50 hover:bg-slate-100/10 transition-colors leading-relaxed placeholder:italic"
                  placeholder="Descreva detalhadamente como a capacidade liberada pela IA está sendo aplicada no time..."
                />
                <p className="text-[9px] text-slate-400 leading-relaxed italic">
                  * Este detalhamento é obrigatório e será registrado de forma permanente no livro de auditoria do sistema (RF04).
                </p>
              </div>

              {/* Botão de Resgate */}
              <button
                type="submit"
                disabled={disponivelXp <= 0}
                className={`w-full p-3 text-sm font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  disponivelXp > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 hover:scale-[1.01]' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Confirmar Resgate
              </button>
            </form>

            {/* Alertas */}
            <AnimatePresence mode="wait">
              {formSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-700 font-medium flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}

              {formError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{formError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dinâmica de Emblemas (Direita, 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            
            {/* Cabeçalho */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Conquista de Emblemas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Os emblemas pertencem à estrutura do departamento e celebram os ciclos de eficiência.
                </p>
              </div>

              {latestBadge && (
                <div className="flex flex-col items-end select-none">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selo Atual</span>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-lg px-2 py-1 mt-1">
                    🏅 Ciclo {latestBadge.cycle} Concluído
                  </span>
                </div>
              )}
            </div>

            {/* Destaque do Emblema Mais Recente Conquistado */}
            {latestBadge ? (
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row items-center gap-5 shadow-xl relative overflow-hidden select-none border border-indigo-900/40">
                {/* Background stars decor */}
                <div className="absolute right-0 top-0 opacity-20 text-[120px] pointer-events-none transform translate-x-12 translate-y-6 font-black leading-none">🌙</div>
                
                <div className="w-16 h-16 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center border-2 border-indigo-400/50 shrink-0 shadow-lg shadow-indigo-950 animate-pulse">
                  <Award className="w-9 h-9" />
                </div>
                
                <div className="space-y-1 text-center sm:text-left z-10">
                  <span className="text-[9px] font-black tracking-widest uppercase bg-indigo-500 text-white px-2 py-0.5 rounded-full">Selo em Destaque</span>
                  <h3 className="text-lg font-black tracking-tight">{latestBadge.name}</h3>
                  <p className="text-xs text-indigo-200/85 leading-relaxed font-medium">
                    "{latestBadge.description}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center text-slate-500 select-none">
                <Lock className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-bold">Nenhum emblema conquistado ainda por este departamento.</p>
                <p className="text-[10px] text-slate-400 mt-1">O primeiro emblema **Primeira Luz** é conquistado ao acumular 10.560 XP Histórico.</p>
              </div>
            )}

            {/* Barra de Progresso até o próximo emblema */}
            <div className="space-y-2 select-none">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Eficiência para o Próximo Emblema</span>
                <span className="font-mono font-black text-slate-700">
                  {historicoXp.toLocaleString()} / {nextBadgeXpNeeded.toLocaleString()} XP
                </span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${currentCycleProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                <span>Progresso: {currentCycleProgress.toFixed(1)}%</span>
                {xpRemainingForNextBadge > 0 ? (
                  <span>Faltam {xpRemainingForNextBadge.toLocaleString()} XP</span>
                ) : (
                  <span className="text-amber-600">Selo Máximo Atingido! ⭐</span>
                )}
              </div>
            </div>

            {/* Histórico Completo de Emblemas (Scroll horizontal ou grid compacto) */}
            <div className="space-y-3 select-none">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lista Completa de Emblemas (Gamificação)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {BADGES_TABLE.map((badge) => {
                  const isUnlocked = historicoXp >= badge.xpRequired;
                  return (
                    <div 
                      key={badge.cycle}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        isUnlocked 
                        ? 'bg-slate-50 border-indigo-150 hover:bg-slate-100/50' 
                        : 'bg-slate-50/50 border-slate-150/70 opacity-60'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                        isUnlocked 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                        : 'bg-slate-100 border-slate-200 text-slate-350'
                      }`}>
                        {isUnlocked ? <Award className="w-5 h-5 animate-pulse" /> : <Lock className="w-4 h-4" />}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-800 truncate">{badge.name}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded-full ${
                            isUnlocked ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            Lvl {badge.cycle}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{badge.description}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">Mínimo: {badge.xpRequired.toLocaleString()} XP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Histórico de Justificativas e Resgates Realizados (RF04 Ledger) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden select-none">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Livro de Registro de Resgates (Ledger de Auditoria)
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {redemptions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 italic">
              Nenhum resgate de XP registrado para o departamento de {selectedDept}.
            </div>
          ) : (
            redemptions.map((red) => (
              <div key={red.id} className="p-6 hover:bg-slate-50/20 transition-colors flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded text-[10px] font-bold uppercase tracking-wider">
                      -{red.amount} Luna XP
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Justificativa: <span className="text-indigo-600">{red.actionType}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">• {red.timestamp}</span>
                  </div>
                  
                  <p className="text-xs text-slate-650 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{red.details}"
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end shrink-0 justify-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gestor Responsável</span>
                  <span className="text-xs font-bold text-slate-700 mt-1">{red.gestorName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Celebratory Modal Overlay for Unlocked Badge */}
      <AnimatePresence>
        {badgeToCelebrate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setBadgeToCelebrate(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-indigo-200 relative z-10 p-8 text-center flex flex-col items-center space-y-6"
            >
              {/* Particle sparks decor */}
              <div className="absolute right-6 top-6 text-2xl text-amber-400 animate-bounce">✨</div>
              <div className="absolute left-6 bottom-6 text-2xl text-indigo-400 animate-pulse">⭐</div>

              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                <Award className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full px-3 py-1 uppercase tracking-widest">
                  Novo Emblema Desbloqueado!
                </span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{badgeToCelebrate.name}</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                  Nível {badgeToCelebrate.cycle} • {selectedDept}
                </p>
              </div>

              <p className="text-sm text-slate-500 italic leading-relaxed px-4">
                "{badgeToCelebrate.description}"
              </p>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>E-mail de Notificação Disparado</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">✓ ENVIADO</span>
                </div>
                <div className="text-xs font-bold text-slate-700">Para: {MOCK_USERS_LIST.find(u => u.name === user.name)?.email || 'gabrielli.carvalho@zucchetti.com.br'}</div>
                <div className="text-[10px] text-slate-450 leading-relaxed mt-1">
                  Um e-mail de congratulações foi enviado automaticamente para todos os gestores vinculados ao departamento de **{selectedDept}**.
                </div>
              </div>

              <button
                onClick={() => setBadgeToCelebrate(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
