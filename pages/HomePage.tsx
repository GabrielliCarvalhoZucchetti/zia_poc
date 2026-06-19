import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { LevelUpAnimation } from '../components/LevelUpAnimation';
import { StarfieldCanvas } from '../components/StarfieldCanvas';
import { motion } from 'motion/react';

const RANKING_AI_USERS = [
  { rank: '1º', name: 'Alice Castro', count: 154, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/alice/100/100' },
  { rank: '2º', name: 'Gabriel Ricardo', count: 142, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/gabrie/100/100' },
  { rank: '3º', name: 'Ana Costa', count: 128, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/ana/100/100' },
  { rank: '4º', name: 'Marcos Oliveira', count: 85, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/marcos/100/100' },
  { rank: '5º', name: 'Danielle Aris', count: 80, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/danielle/100/100' },
];

const RANKING_AI_STARTER = [
  { rank: '1º', name: 'Lucas Lima', count: 45, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/lucas/100/100' },
  { rank: '2º', name: 'Tiago Souza', count: 38, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/tiago/100/100' },
  { rank: '3º', name: 'Beatriz Santos', count: 22, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/beatriz/100/100' },
  { rank: '4º', name: 'Daniel Pinto', count: 18, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/dpinto/100/100' },
  { rank: '5º', name: 'Camila Reis', count: 10, type: 'INTERAÇÕES', avatar: 'https://picsum.photos/seed/camila/100/100' },
];

const RANKING_AI_BUILDER = [
  { rank: '1º', name: 'Gabrielli Marques', count: 12, type: 'RECURSOS', avatar: 'https://picsum.photos/seed/gabrielli/100/100' },
  { rank: '2º', name: 'Carlos Eduardo', count: 8, type: 'RECURSOS', avatar: 'https://picsum.photos/seed/carlos/100/100' },
  { rank: '3º', name: 'Renata Meireles', count: 5, type: 'RECURSOS', avatar: 'https://picsum.photos/seed/renata/100/100' },
  { rank: '4º', name: 'Fábio Junior', count: 3, type: 'RECURSOS', avatar: 'https://picsum.photos/seed/fabio/100/100' },
  { rank: '5º', name: 'Mariana Pires', count: 2, type: 'RECURSOS', avatar: 'https://picsum.photos/seed/mariana/100/100' },
];

const RANKING_AI_CHAMPION = [
  { rank: '1º', name: 'Rodrigo Faro', count: 15, type: 'HOMOLOGADOS', avatar: 'https://picsum.photos/seed/rodrigo/100/100' },
  { rank: '2º', name: 'Eliana Michael', count: 10, type: 'HOMOLOGADOS', avatar: 'https://picsum.photos/seed/eliana/100/100' },
  { rank: '3º', name: 'Silvio Santos', count: 7, type: 'HOMOLOGADOS', avatar: 'https://picsum.photos/seed/silvio/100/100' },
  { rank: '4º', name: 'Fausto Silva', count: 4, type: 'HOMOLOGADOS', avatar: 'https://picsum.photos/seed/fausto/100/100' },
  { rank: '5º', name: 'Luciano Huck', count: 2, type: 'HOMOLOGADOS', avatar: 'https://picsum.photos/seed/luciano/100/100' },
];

const HomePage: React.FC = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNews, setSelectedNews] = useState<{ title: string; date: string; content: string; tag: string } | null>(null);
  const [levelUpState, setLevelUpState] = useState<{ active: boolean; level: string }>({
    active: false,
    level: 'AI Builder'
  });

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const completed = localStorage.getItem('luna_onboarding_completed');
    if (!completed) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('luna_onboarding_completed', 'true');
    setIsOnboardingOpen(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsOnboardingOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#030712] p-8 relative transition-colors duration-300">
      <StarfieldCanvas />

      <div className="max-w-[1550px] mx-auto space-y-8 pb-12 relative z-10">
        
        {/* TOP WELCOME BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Início
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Acompanhe suas missões, níveis de maturidade IA e novidades da Luna.
            </p>
          </div>
          <button 
            type="button"
            id="btn-restart-onboarding"
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900/80 dark:hover:bg-slate-850 dark:border-slate-800 dark:text-sky-400 rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-200 cursor-pointer"
          >
            <Icons.Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
            <span>Onboarding Inicial da Luna</span>
          </button>
        </header>

        {/* JOAO SILVA PROFILE HEADER CARD */}
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/joaosilva/150/150" 
                alt="Joao Silva" 
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-inner"
              />
              <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                <Icons.Check className="w-3" />
              </div>
            </div>
            <div className="space-y-1.5 flex-1">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Joao Silva</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 font-extrabold text-[10px] uppercase rounded-full tracking-wider border border-sky-100 dark:border-sky-900/40">
                  AI STARTER
                </span>
                
                {/* Level Up Simulator buttons */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Simular Upgrade:</span>
                  <button
                    type="button"
                    onClick={() => setLevelUpState({ active: true, level: "AI User" })}
                    className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all"
                  >
                    AI User ⚡
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevelUpState({ active: true, level: "AI Builder" })}
                    className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/5 dark:hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded border border-amber-500/20 dark:border-amber-500/10 cursor-pointer active:scale-95 transition-all"
                  >
                    AI Builder 🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevelUpState({ active: true, level: "AI Champion" })}
                    className="px-2 py-0.5 text-[9px] font-bold bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-500/5 dark:hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded border border-purple-500/20 dark:border-purple-500/10 cursor-pointer active:scale-95 transition-all"
                  >
                    AI Champion 👑
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none min-w-[140px] bg-slate-50/60 dark:bg-slate-950/60 border border-slate-100/60 dark:border-slate-800/60 rounded-2xl p-4 text-left">
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interações Luna</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-105 mt-1">15</div>
            </div>
            
            <div className="flex-1 lg:flex-none min-w-[140px] bg-slate-50/60 dark:bg-slate-950/60 border border-slate-100/60 dark:border-slate-800/60 rounded-2xl p-4 text-left">
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Recursos Criados</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-105 mt-1">2</div>
            </div>
            
            <div className="flex-1 lg:flex-none min-w-[140px] bg-slate-50/60 dark:bg-slate-950/60 border border-slate-100/60 dark:border-slate-800/60 rounded-2xl p-4 text-left">
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Em Produção</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-105 mt-1">1</div>
            </div>
          </div>
        </div>

        {/* PRÓXIMAS MISSÕES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Icons.Sparkle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Próximas Missões</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-not-allowed" disabled>
                <Icons.ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-not-allowed" disabled>
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Mission Card 1 */}
            <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[24px] p-6 flex flex-col justify-between space-y-6 relative overflow-hidden transition-all hover:shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-bl-[50px] flex items-center justify-center pl-6 pb-6">
                <Icons.Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    <Icons.Audio className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md">
                    CONCLUÍDA
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-850 dark:text-slate-200">AI Starter</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    Converse ao menos uma vez com a Luna e inicie sua jornada até ser um AI Champion
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Card 2 */}
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 flex flex-col justify-between space-y-6 transition-all hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-sky-50 dark:bg-sky-950/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-450 border border-sky-100 dark:border-sky-900/40">
                    <Icons.Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-555 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/40">
                    ATUAL
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-850 dark:text-slate-200">AI User</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    Alcance mais de 10 interações com a Luna e se torne um AI User
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Card 3 */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 flex flex-col justify-between space-y-6 opacity-85">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Icons.AgentBuilder className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    PRÓXIMA
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-600 dark:text-slate-350">AI Builder</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-2">
                    Crie um assistente ou agente de IA via Gestão de Recursos e se torne um AI Builder
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Card 4 */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-6 flex flex-col justify-between space-y-6 opacity-85">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-slate-105 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Icons.Lab className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                    PRÓXIMA
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-600 dark:text-slate-350">AI Champion</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-2">
                    Tenha ao menos um recurso de IA homologado pelo time de Innovation & Research e se torne um AI Champion
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* RANKINGS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">🏅</span>
            <h3 className="text-base font-black text-slate-805 dark:text-white tracking-tight">Mural de Rankings & Líderes de IA</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Ranking 2: AI Starter (Indigo Theme) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.05)' }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-indigo-100 dark:border-indigo-950/70 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="p-5 border-b border-indigo-50/80 dark:border-indigo-900/30 bg-gradient-to-r from-indigo-50/80 dark:from-indigo-950/20 via-purple-50/10 dark:via-purple-950/5 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Icons.Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Ranking AI Starter</span>
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Passo Inicial</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">User Level 1</span>
                </div>
                
                <div className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                  {RANKING_AI_STARTER.map((user, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(244, 245, 248, 0.65)' }}
                      className={`px-5 py-4 flex items-center justify-between transition-all ${
                        i === 0 ? (isDark ? 'bg-indigo-950/20' : 'bg-indigo-50/15') : i === 1 ? (isDark ? 'bg-slate-800/10' : 'bg-slate-50/10') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 font-black text-xs text-center">
                          {i === 0 ? (
                            <span className="text-sm" title="Primeiro Lugar">🥇</span>
                          ) : i === 1 ? (
                            <span className="text-sm" title="Segundo Lugar">🥈</span>
                          ) : i === 2 ? (
                            <span className="text-sm" title="Terceiro Lugar">🥉</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{user.rank}</span>
                          )}
                        </div>
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className={`w-9 h-9 rounded-full object-cover border-2 shadow-inner ${
                            i === 0 ? 'border-amber-400 ring-4 ring-amber-400/15' : 'border-slate-100 dark:border-slate-800'
                          }`} />
                          {i === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-750 dark:text-slate-200 block">{user.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Iniciante</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{user.count}</div>
                        <div className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user.type}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between">
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40" disabled>◀</button>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest font-mono">Página 1/1</span>
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40" disabled>▶</button>
              </div>
            </motion.div>

            {/* Ranking 1: AI Users (Sky Theme) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(14, 165, 233, 0.15), 0 8px 10px -6px rgba(14, 165, 233, 0.05)' }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-sky-100 dark:border-sky-950/70 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="p-5 border-b border-sky-50/80 dark:border-sky-900/30 bg-gradient-to-r from-sky-50/80 dark:from-sky-950/20 via-indigo-50/10 dark:via-indigo-950/5 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-105 dark:shadow-none">
                      <Icons.Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Ranking AI Users</span>
                      <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Ativos no Chat</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">User Level 2</span>
                </div>
                
                <div className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                  {RANKING_AI_USERS.map((user, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(244, 245, 248, 0.65)' }}
                      className={`px-5 py-4 flex items-center justify-between transition-all ${
                        i === 0 ? (isDark ? 'bg-sky-950/20' : 'bg-sky-50/15') : i === 1 ? (isDark ? 'bg-slate-800/10' : 'bg-slate-50/10') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 font-black text-xs text-center">
                          {i === 0 ? (
                            <span className="text-sm" title="Primeiro Lugar">🥇</span>
                          ) : i === 1 ? (
                            <span className="text-sm" title="Segundo Lugar">🥈</span>
                          ) : i === 2 ? (
                            <span className="text-sm" title="Terceiro Lugar">🥉</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{user.rank}</span>
                          )}
                        </div>
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className={`w-9 h-9 rounded-full object-cover border-2 shadow-inner ${
                            i === 0 ? 'border-amber-400 ring-4 ring-amber-400/15' : 'border-slate-100 dark:border-slate-800'
                          }`} />
                          {i === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-750 dark:text-slate-200 block">{user.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Explorador</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-sky-600 dark:text-sky-400 font-mono">{user.count}</div>
                        <div className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user.type}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between">
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-40" disabled>◀</button>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest font-mono">Página 1/1</span>
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-40" disabled>▶</button>
              </div>
            </motion.div>

            {/* Ranking 3: AI Builder (Teal/Emerald Theme) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(20, 184, 166, 0.15), 0 8px 10px -6px rgba(20, 184, 166, 0.05)' }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-teal-100 dark:border-teal-950/70 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="p-5 border-b border-teal-50/80 dark:border-teal-900/30 bg-gradient-to-r from-teal-50/80 dark:from-teal-950/20 via-emerald-50/10 dark:via-emerald-950/5 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-150 dark:shadow-none">
                      <Icons.AgentBuilder className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Ranking AI Builder</span>
                      <span className="text-[9px] font-bold text-teal-650 dark:text-teal-400 uppercase tracking-wider">Criadores</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-teal-100 dark:bg-teal-955 bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-305 text-teal-700 dark:text-teal-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">User Level 3</span>
                </div>
                
                <div className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                  {RANKING_AI_BUILDER.map((user, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(244, 245, 248, 0.65)' }}
                      className={`px-5 py-4 flex items-center justify-between transition-all ${
                        i === 0 ? (isDark ? 'bg-teal-950/20' : 'bg-teal-50/15') : i === 1 ? (isDark ? 'bg-slate-800/10' : 'bg-slate-50/10') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 font-black text-xs text-center">
                          {i === 0 ? (
                            <span className="text-sm" title="Primeiro Lugar">🥇</span>
                          ) : i === 1 ? (
                            <span className="text-sm" title="Segundo Lugar">🥈</span>
                          ) : i === 2 ? (
                            <span className="text-sm" title="Terceiro Lugar">🥉</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{user.rank}</span>
                          )}
                        </div>
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className={`w-9 h-9 rounded-full object-cover border-2 shadow-inner ${
                            i === 0 ? 'border-amber-400 ring-4 ring-amber-400/15' : 'border-slate-100 dark:border-slate-800'
                          }`} />
                          {i === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-750 dark:text-slate-200 block">{user.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Arquiteto</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400 font-mono">{user.count}</div>
                        <div className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user.type}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between">
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-40" disabled>◀</button>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest font-mono">Página 1/1</span>
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-40" disabled>▶</button>
              </div>
            </motion.div>

            {/* Ranking 4: AI Champion (Gold/Purple Theme) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 8px 10px -6px rgba(245, 158, 11, 0.05)' }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-amber-100 dark:border-amber-950/70 shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="p-5 border-b border-amber-50/80 dark:border-amber-900/30 bg-gradient-to-r from-amber-50/80 dark:from-amber-950/20 via-yellow-50/10 dark:via-yellow-950/5 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-100 dark:shadow-none">
                      <Icons.Sparkle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Ranking AI Champion</span>
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Homologadores</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">User Level 4</span>
                </div>
                
                <div className="divide-y divide-slate-100/55 dark:divide-slate-800/40">
                  {RANKING_AI_CHAMPION.map((user, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 4, backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(244, 245, 248, 0.65)' }}
                      className={`px-5 py-4 flex items-center justify-between transition-all ${
                        i === 0 ? (isDark ? 'bg-amber-950/20' : 'bg-amber-50/15') : i === 1 ? (isDark ? 'bg-slate-800/10' : 'bg-slate-50/10') : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 font-black text-xs text-center">
                          {i === 0 ? (
                            <span className="text-sm" title="Primeiro Lugar">🥇</span>
                          ) : i === 1 ? (
                            <span className="text-sm" title="Segundo Lugar">🥈</span>
                          ) : i === 2 ? (
                            <span className="text-sm" title="Terceiro Lugar">🥉</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">{user.rank}</span>
                          )}
                        </div>
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className={`w-9 h-9 rounded-full object-cover border-2 shadow-inner ${
                            i === 0 ? 'border-amber-400 ring-4 ring-amber-400/15' : 'border-slate-100 dark:border-slate-800'
                          }`} />
                          {i === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs animate-bounce" style={{ animationDuration: '2s' }}>👑</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-750 dark:text-slate-200 block">{user.name}</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Campeão</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">{user.count}</div>
                        <div className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user.type}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between">
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-450 disabled:opacity-40" disabled>◀</button>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest font-mono">Página 1/1</span>
                <button className="text-[10px] text-slate-405 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-450 disabled:opacity-40" disabled>▶</button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* LUNA NEWS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-pulse">📢</span>
            <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Luna News</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* News 1 */}
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">INOVAÇÃO</span>
                  <span>2026-04-20</span>
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug">Novo Modelo GPT-5 Liberado!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  A OpenAI acaba de liberar acesso ao novo modelo GPT-5 para parceiros Enterprise.
                </p>
              </div>
              <button 
                onClick={() => setSelectedNews({
                  title: 'Novo Modelo GPT-5 Liberado!',
                  date: '2026-04-20',
                  tag: 'INOVAÇÃO',
                  content: 'A OpenAI anunciou o lançamento do aguardado GPT-5 para parceiros corporativos selecionados. O novo modelo demonstra saltos qualitativos substanciais em raciocínio complexo, coding avançado e suporte nativo a contexto estendido de múltiplos milhões de tokens com latência reduzida.'
                })}
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-305 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ler mais</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* News 2 */}
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                  <span className="bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-md">EDUCAÇÃO</span>
                  <span>2026-04-18</span>
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug">Workshop de Prompt Engineering</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Participe do nosso workshop semanal sobre como criar assistentes mais eficientes.
                </p>
              </div>
              <button 
                onClick={() => setSelectedNews({
                  title: 'Workshop de Prompt Engineering',
                  date: '2026-04-18',
                  tag: 'EDUCAÇÃO',
                  content: 'Aprenda as principais técnicas de engenharia de prompts (Few-Shot, Chain-of-Thought, Meta-Prompts) para maximizar o retorno dos assistentes virtuais de sua equipe. O workshop ocorrerá nesta quarta-feira às 14h, com vagas abertas no Zoom da Zucchetti.'
                })}
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-305 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ler mais</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* News 3 */}
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                  <span className="bg-brand-50 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-md">NOVOS RECURSOS</span>
                  <span>2026-04-15</span>
                </div>
                <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-snug">Luna agora fala com seu ERP</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Novas integrações devem permitir consultar dados de faturamento diretamente via chat.
                </p>
              </div>
              <button 
                onClick={() => setSelectedNews({
                  title: 'Luna agora fala com seu ERP',
                  date: '2026-04-15',
                  tag: 'NOVOS RECURSOS',
                  content: 'Integrar os dados do ERP às LLMs corporativas agora é realidade. Com as novas skills de banco de dados, você poderá disparar relatórios financeiros, conferir status de contratos e emitir resumos fiscais em segundos simplesmente digitando comandos intuitivos no chat.'
                })}
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-305 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Ler mais</span>
                <Icons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* LUNA NEWS DETAIL MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-6">
            <button 
              type="button" 
              onClick={() => setSelectedNews(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
            >
              <Icons.X className="w-4 h-4" />
            </button>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 px-2 rounded-md py-0.5">{selectedNews.tag}</span>
                <span>{selectedNews.date}</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight pt-1">
                {selectedNews.title}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedNews.content}
            </p>
            <div className="pt-2">
              <button 
                type="button"
                onClick={() => setSelectedNews(null)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs font-black tracking-wide transition-all shadow-md shadow-slate-100 dark:shadow-none cursor-pointer"
              >
                Fechar Artigo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL OVERLAY */}
      {isOnboardingOpen && (
        <div id="luna-onboarding-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div id="luna-onboarding-modal" className="w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[90vh] md:h-[620px] transition-all border border-slate-100 animate-slide-up">
            
            {/* Left Column: Interactive Visuals according to Step */}
            <div className="w-full md:w-5/12 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
              {/* Background galaxy stars decoration */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-950/60 px-3 py-1.5 rounded-full border border-sky-800">
                  Slide {currentStep + 1} de 8
                </span>
              </div>

              {/* Step Illustrations with beautiful, clean dynamic simulation designs */}
              <div className="my-auto relative z-10 py-6 min-h-[180px] flex items-center justify-center">
                {currentStep === 0 && (
                  <div className="space-y-4 text-center animate-fade-in">
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>
                      <span className="text-7xl animate-bounce">🌙</span>
                    </div>
                    <div className="text-xs text-sky-300 font-bold tracking-widest uppercase">Zucchetti AI Platform</div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6 text-center animate-fade-in w-full">
                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 shadow-xl max-w-xs mx-auto">
                      <div className="flex items-center gap-2 mb-2 text-emerald-400 justify-center">
                        <Icons.ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">Governança Integrada</span>
                      </div>
                      <p className="text-[11px] text-slate-300">Todas as conexões passam pela camada de segurança Trust Agent.</p>
                    </div>
                    <div className="text-[11px] font-mono py-1.5 px-3 bg-slate-800 text-sky-300 rounded-lg inline-block border border-slate-700 font-bold uppercase tracking-wide">
                      “Linking Users to Networked Agents”
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 w-full max-w-[240px] animate-fade-in">
                    <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Modelo Selecionado</span>
                        <span className="text-emerald-400 font-bold">GPT-4o</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-emerald-500"></div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Modelo de Resposta</span>
                        <span className="text-sky-400 font-bold font-mono">Claude 3.5</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-sky-500"></div>
                      </div>
                    </div>
                    <p className="text-[9px] text-center text-slate-400 italic">“A melhor forma de aprender a usar IA é experimentando.”</p>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 w-full max-w-[260px] animate-fade-in text-left">
                    <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[9px] font-bold">1</div>
                        <span className="text-xs font-bold text-slate-200">Comportamento/Persona</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-[9px] font-bold">2</div>
                        <span className="text-xs font-bold text-slate-200">Adicionar Base SQL/RAG</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-bold">3</div>
                        <span className="text-xs font-bold text-slate-200">Skills e Webhooks</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-3 w-full max-w-[240px] animate-fade-in">
                    <div className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-2">Seus Níveis de Maturidade</div>
                    <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-705 flex items-center justify-between text-xs opacity-50">
                      <span>AI Starter</span>
                      <Icons.Check className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-400">AI User</span>
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="p-2.5 bg-slate-800/30 rounded-xl border border-slate-800/50 flex items-center justify-between text-xs opacity-30">
                      <span>AI Builder</span>
                      <span>--</span>
                    </div>
                    <div className="p-2.5 bg-slate-800/30 rounded-xl border border-slate-800/50 flex items-center justify-between text-xs opacity-30">
                      <span>AI Champion</span>
                      <span>--</span>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4 text-center w-full max-w-[230px] animate-fade-in">
                    <div className="p-4 bg-indigo-950/50 border border-indigo-700/60 rounded-2xl flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                        <Icons.Lab className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-200">Submeta Novas Ideias</div>
                      <div className="text-[10px] text-indigo-300">Qualquer colaborador pode propor projetos e agentes inteligentes.</div>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4 text-center w-full max-w-[230px] animate-fade-in">
                    <div className="relative p-5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-3xl space-y-3 transition-all self-center text-left">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-red-400">
                        <Icons.Lock className="w-4 h-4" />
                        <span>Trust Agent: Ativo</span>
                      </div>
                      <div className="text-[9px] font-mono space-y-1 text-slate-400">
                        <div>&gt;_ Analisando integridade...</div>
                        <div className="text-emerald-400">&gt;_ Filtros confidenciais OK</div>
                        <div className="text-emerald-400">&gt;_ Bloqueador vazamentos OK</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4 text-center animate-fade-in">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-2xl animate-pulse"></div>
                      <span className="text-5xl animate-bounce">🌙</span>
                    </div>
                    <div className="text-xs text-sky-300 font-extrabold uppercase tracking-widest">Tudo Pronto!</div>
                  </div>
                )}
              </div>

              {/* Left Column Footer */}
              <div className="relative z-10 text-center md:text-left">
                <span className="text-[11px] font-bold tracking-tight text-slate-500 font-mono">
                  LUNA • ECOSSISTEMA SEGURO
                </span>
              </div>
            </div>

            {/* Right Column: Detailed slide text and buttons */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-between h-full bg-white relative">
              {/* Skip button at top right */}
              <button 
                type="button"
                id="btn-skip-onboarding"
                onClick={handleClose}
                className="absolute top-6 right-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Pular
              </button>

              {/* Main Text Content */}
              <div className="my-auto space-y-6">
                <div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-md font-extrabold tracking-widest uppercase">
                    {currentStep === 0 && 'Apresentação'}
                    {currentStep === 1 && 'Segurança'}
                    {currentStep === 2 && 'Playground'}
                    {currentStep === 3 && 'Copilots'}
                    {currentStep === 4 && 'Gamificação'}
                    {currentStep === 5 && 'Brainstorm'}
                    {currentStep === 6 && 'Privacidade'}
                    {currentStep === 7 && 'Conclusão'}
                  </span>
                </div>

                {currentStep === 0 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      🌙 Bem-vindo à LUNA
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        A Luna é a plataforma oficial de Inteligência Artificial da Zucchetti. 
                        Ela conecta pessoas, agentes e modelos de IA em um único ecossistema seguro, rastreável e colaborativo.
                      </p>
                      <p>
                        Aqui você poderá explorar modelos premium de IA, criar assistentes especializados, compartilhar conhecimento e acelerar sua produtividade com segurança.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 text-xs font-bold text-slate-400 italic">
                      “Vamos começar sua jornada em IA”
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      IA com Governança, Segurança e Escala
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>Luna foi criada para democratizar o uso de Inteligência Artificial dentro da Zucchetti, garantindo:</p>
                      <ul className="space-y-2 text-xs font-medium text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Segurança no uso de IA corporativa
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Controle e rastreabilidade das interações
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Compartilhamento de conhecimento entre times
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Criação de assistentes sem necessidade de código
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span> Evolução contínua da maturidade em IA
                        </li>
                      </ul>
                      <p className="text-xs text-slate-500">
                        Toda interação realizada na Luna passa por mecanismos de auditoria e proteção via Trust Agent.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 text-xs font-black text-sky-600 font-mono tracking-tight uppercase">
                      “Linking Users to Networked Agents”
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      Converse com modelos de IA de última geração
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        No Playground você pode interagir com modelos premium como GPT, Claude e Gemini, além de utilizar assistentes especializados criados pela organização.
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> Fazer perguntas e gerar conteúdo
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> Analisar documentos e arquivos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> Utilizar skills prontas
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> Conversar com agentes conectados
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" /> Experimentar novas ideias rapidamente
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-slate-50 text-xs font-bold text-slate-400 italic">
                      “A melhor forma de aprender a usar IA é experimentando.”
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      Transforme conhecimento em copilots
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        A Luna permite criar assistentes personalizados para sua área sem precisar programar.
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span> Definir comportamento e persona do assistente
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span> Enviar documentos e bases de conhecimento
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span> Compartilhar copilots com seu time
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span> Criar skills reutilizáveis
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-violet-500 font-bold">•</span> Integrar agentes externos
                        </li>
                      </ul>
                      <p className="text-xs text-slate-500 font-medium">
                        A ideia é transformar conhecimento interno em inteligência acessível para toda a organização.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      Sua jornada de evolução começa agora
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        A Luna possui um sistema de maturidade gamificado que acompanha sua evolução no uso de IA.
                      </p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nível 1</span>
                          <span className="text-sm font-bold text-slate-700">AI Starter</span>
                        </div>
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-150 flex flex-col">
                          <span className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">Nível 2</span>
                          <span className="text-sm font-bold text-indigo-700">AI User</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nível 3</span>
                          <span className="text-sm font-bold text-slate-700">AI Builder</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nível 4</span>
                          <span className="text-sm font-bold text-slate-700">AI Champion</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Quanto mais você explora, cria e compartilha, maior será seu impacto dentro do ecossistema de IA da Zucchetti.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-50 text-xs font-bold text-slate-400 italic">
                      “IA não é apenas uma ferramenta. É uma nova forma de trabalhar.”
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      Toda ideia pode virar uma iniciativa de IA
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        No Laboratório da Luna, qualquer colaborador pode propor iniciativas de IA para otimizar processos, criar novos produtos ou acelerar operações.
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700 font-medium">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span> Submeter ideias de recursos de IA diretamente
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span> Acompanhar status das iniciativas do time
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span> Colaborar com engenheiros e especialistas
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span> Transformar problemas cotidianos em soluções inteligentes
                        </li>
                      </ul>
                      <p className="text-xs text-slate-500">
                        A Luna foi criada para construir uma cultura de inovação contínua.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      IA corporativa com proteção integrada
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                      <p>
                        A Luna utiliza o Trust Agent, uma camada proprietária de segurança de dados para mitigar riscos, prevenir vazamentos e monitorar as interações com IA.
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Proteção robusta contra vazamento de dados confidenciais
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Monitoramento auditável de uso
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Controle inteligente de custos e orçamentos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Auditorias de conformidade com políticas internas
                        </li>
                      </ul>
                      <p className="text-xs text-slate-500">
                        Você pode explorar todas as capacidades das LLMs com máxima segurança e confiança corporativa.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-4 animate-fade-in">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      Sua jornada na Luna começa aqui
                    </h2>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-2">
                      <p>
                        Explore o Playground, descubra assistentes, crie suas primeiras skills e ajude a construir o futuro da IA dentro da Zucchetti.
                      </p>
                    </div>
                    <div className="pt-6 text-xs text-slate-500 font-black tracking-widest font-mono uppercase bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-2">
                      <span>🌙</span> Luna — Linking Users to Networked Agents
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Nav / Actions */}
              <div className="flex items-center justify-between mt-8 border-t border-slate-100 pt-6">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button 
                      key={num}
                      type="button"
                      onClick={() => setCurrentStep(num)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${num === currentStep ? 'bg-sky-600 w-6' : 'bg-slate-200 hover:bg-slate-300'}`}
                    />
                  ))}
                </div>

                {/* Back and Next / Submit CTAs */}
                <div className="flex items-center gap-3">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      id="btn-onboarding-prev"
                      onClick={handlePrev}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Voltar
                    </button>
                  )}

                  <button
                    type="button"
                    id="btn-onboarding-next"
                    onClick={handleNext}
                    className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer ${
                      currentStep === 7 
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-100' 
                        : 'bg-slate-900 hover:bg-slate-850 text-white shadow-slate-100'
                    }`}
                  >
                    {currentStep === 7 ? 'Entrar na Luna' : 'Avançar'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {levelUpState.active && (
        <LevelUpAnimation
          newLevel={levelUpState.level}
          onComplete={() => setLevelUpState(prev => ({ ...prev, active: false }))}
        />
      )}
    </div>
  );
};

export default HomePage;
