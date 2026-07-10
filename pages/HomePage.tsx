import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { LevelUpAnimation } from '../components/LevelUpAnimation';
import { StarfieldCanvas } from '../components/StarfieldCanvas';
import { motion } from 'motion/react';
import { HeaderAnimation } from '../components/HeaderAnimation';
import { PremiumRankBadge } from '../components/PremiumRankBadge';
import { generateAgentResponse } from '../services/geminiService';

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

export const getAuthorAvatar = (name: string): string => {
  const normalized = (name || '').trim().toLowerCase();
  if (normalized.includes('gabrielli')) {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
  }
  if (normalized.includes('alice')) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  }
  if (normalized.includes('ana')) {
    return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
  }
  if (normalized.includes('gabriel')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  }
  if (normalized.includes('rodrigo')) {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
};

interface HomePageProps {
  user?: any;
  onUpdateUser?: (updatedUser: any) => void;
  resources?: any[];
  setActiveResource?: (resource: any) => void;
  communityPosts?: any[];
  setCommunityPosts?: any;
}

const HomePage: React.FC<HomePageProps> = ({ 
  user, 
  onUpdateUser,
  resources = [],
  setActiveResource,
  communityPosts = [],
  setCommunityPosts
}) => {
  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Community Posts modal states
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  
  // Comment field
  const [newCommentText, setNewCommentText] = useState('');
  
  // Filter
  const [postFilter, setPostFilter] = useState<'ALL' | 'UPDATES' | 'AUTO' | 'LIKED'>('ALL');

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

  // Community post handlers
  const handleToggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    
    setCommunityPosts((prev: any[]) => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(user.name);
        const updatedLikes = hasLiked
          ? post.likes.filter((name: string) => name !== user.name)
          : [...post.likes, user.name];
        
        const updatedPost = { ...post, likes: updatedLikes };
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!user || !newCommentText.trim()) return;
    
    const newComment = {
      id: `c-${Date.now()}`,
      user: user.name || 'Joao Silva',
      content: newCommentText.trim(),
      timestamp: new Date().toLocaleString()
    };
    
    setCommunityPosts((prev: any[]) => prev.map(post => {
      if (post.id === postId) {
        const updatedPost = { ...post, comments: [...(post.comments || []), newComment] };
        setSelectedPost(updatedPost);
        return updatedPost;
      }
      return post;
    }));
    setNewCommentText('');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setCommunityPosts((prev: any[]) => prev.map(post => {
      if (post.id === postId) {
        const updatedPost = { 
          ...post, 
          comments: (post.comments || []).filter((c: any) => c.id !== commentId) 
        };
        setSelectedPost(updatedPost);
        return updatedPost;
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (user?.role !== 'ADMINISTRATOR') return;
    
    if (window.confirm('Tem certeza de que deseja remover esta publicação do Luna Community?')) {
      setCommunityPosts((prev: any[]) => prev.filter((p: any) => p.id !== postId));
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    }
  };

  const handleOpenCreateModal = () => {
    navigate('/community/new');
  };

  const handleOpenEditModal = (post: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate('/community/' + post.id);
  };

  const handleOpenPlayground = (resourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!setActiveResource) return;
    
    const resource = resources.find((r: any) => r.id === resourceId);
    if (resource) {
      setActiveResource(resource);
      navigate('/chat');
    } else {
      navigate('/chat');
    }
  };

  const filteredPosts = (communityPosts || []).filter(post => {
    if (postFilter === 'ALL') return true;
    if (postFilter === 'UPDATES') return !post.isAutoGenerated;
    if (postFilter === 'AUTO') return !!post.isAutoGenerated;
    if (postFilter === 'LIKED') return post.likes?.includes(user?.name);
    return true;
  });

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
        <HeaderAnimation 
          setLevelUpState={setLevelUpState} 
          user={user} 
          onUpdateUser={onUpdateUser} 
        />



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

        {/* LUNA COMMUNITY */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Luna Community</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notícias, novidades da plataforma e conexões com assistentes em produção.</p>
              </div>
            </div>

            {/* Actions for community: Create (if Admin) & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <button 
                  type="button"
                  onClick={() => setPostFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${postFilter === 'ALL' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Todos
                </button>
                <button 
                  type="button"
                  onClick={() => setPostFilter('UPDATES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${postFilter === 'UPDATES' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Novidades 🌟
                </button>
                <button 
                  type="button"
                  onClick={() => setPostFilter('AUTO')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${postFilter === 'AUTO' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Automáticos 🤖
                </button>
                <button 
                  type="button"
                  onClick={() => setPostFilter('LIKED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${postFilter === 'LIKED' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Curtidos ❤️
                </button>
              </div>

              {user?.role === 'ADMINISTRATOR' && (
                <button 
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl shadow-md shadow-sky-100 dark:shadow-none flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <span>+ Criar Publicação</span>
                </button>
              )}
            </div>
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(0, 6).map((post: any) => {
              const hasLiked = post.likes?.includes(user?.name);
              return (
                <motion.div 
                  key={post.id}
                  layoutId={`post-card-${post.id}`}
                  className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 group"
                >
                  {/* Image Header */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer" onClick={() => window.open('#/community/' + post.id, '_blank')}>
                    <img 
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      <span className="bg-sky-500/95 text-white font-mono text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full uppercase shadow-sm">
                        <span>🌟 NOVIDADE</span>
                      </span>
                    </div>

                    {/* Admin Options Float */}
                    {user?.role === 'ADMINISTRATOR' && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => handleOpenEditModal(post, e)}
                          title="Editar"
                          className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDeletePost(post.id, e)}
                          title="Remover"
                          className="p-1.5 hover:bg-red-500/30 text-red-200 hover:text-red-105 rounded-lg transition-colors cursor-pointer"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Author/date removed */}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 cursor-pointer" onClick={() => window.open('#/community/' + post.id, '_blank')}>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      {/* Author & Date with Portrait Photo */}
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={getAuthorAvatar(post.author)} 
                          alt={post.author}
                          className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                            {post.author}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 leading-none">
                            {post.date}
                          </span>
                        </div>
                      </div>

                      {/* Playground action / Hyperlink action */}
                      {post.resourceId ? (
                        <button 
                          type="button"
                          onClick={(e) => handleOpenPlayground(post.resourceId, e)}
                          className="text-xs font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Saiba mais</span>
                          <Icons.ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : post.hyperlink ? (
                        <a 
                          href={post.hyperlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-305 flex items-center gap-1 cursor-pointer transition-colors inline-flex"
                        >
                          <span>Ver link</span>
                          <Icons.ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => window.open('#/community/' + post.id, '_blank')}
                          className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Ler mais</span>
                          <Icons.ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <span className="text-3xl block mb-2">📭</span>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma publicação encontrada</h4>
              <p className="text-xs text-slate-400 mt-1">Seja o primeiro a publicar novidades ou promova um recurso para Produção para vê-lo listado aqui!</p>
            </div>
          )}
        </section>

      </div>

      {/* LUNA COMMUNITY DETAIL MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden my-8">
            {/* Header image background */}
            <div className="h-64 w-full relative shrink-0 bg-slate-100 dark:bg-slate-950">
              <img 
                src={selectedPost.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} 
                alt={selectedPost.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              
              {/* Close Button float */}
              <button 
                type="button" 
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-950/40 backdrop-blur-md hover:bg-slate-950/60 text-white cursor-pointer border border-white/10 transition-colors z-10"
              >
                <Icons.X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-6 left-8 right-8 space-y-2 text-white">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-300">
                  <span className={`px-2.5 py-1 rounded-md text-white font-mono ${selectedPost.isAutoGenerated ? 'bg-emerald-600/90' : 'bg-sky-600/90'}`}>
                    {selectedPost.isAutoGenerated ? 'AUTO' : 'NOVIDADE'}
                  </span>
                  <span>{selectedPost.date}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight pt-1">
                  {selectedPost.title}
                </h3>
                <p className="text-xs text-slate-300 font-bold font-mono">
                  PUBLICADO POR: {selectedPost.author.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Main Content text */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>

              {/* Action Buttons: Links / Playground */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/85">
                {selectedPost.resourceId ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPlayground(selectedPost.resourceId)}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black tracking-wide shadow-md shadow-sky-150 dark:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir no Playground 🤖</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : selectedPost.hyperlink ? (
                  <a
                    href={selectedPost.hyperlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black tracking-wide shadow-md shadow-sky-150 dark:shadow-none transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer inline-flex"
                  >
                    <span>Acessar Link de Destino</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleToggleLike(selectedPost.id)}
                  className={`px-5 py-3 rounded-2xl text-xs font-black tracking-wide transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedPost.likes?.includes(user?.name)
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-500 border-red-200/50 dark:border-red-900/50'
                      : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <span>{selectedPost.likes?.includes(user?.name) ? '❤️ Curtido' : '🤍 Curtir'}</span>
                  <span className="font-mono bg-slate-200/50 dark:bg-slate-800/60 px-2 py-0.5 rounded-full text-[10px]">
                    {selectedPost.likes?.length || 0}
                  </span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>💬 Comentários</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full text-xs">
                    {selectedPost.comments?.length || 0}
                  </span>
                </h4>

                {/* Comment list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {(selectedPost.comments || []).map((cmt: any) => (
                    <div key={cmt.id} className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 relative group">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono mb-1">
                        <span className="text-slate-700 dark:text-slate-300 font-sans text-[11px] font-bold">{cmt.user}</span>
                        <span>{cmt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                        {cmt.content}
                      </p>

                      {/* Delete comment option for author or admin */}
                      {(user?.role === 'ADMINISTRATOR' || user?.name === cmt.user) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(selectedPost.id, cmt.id)}
                          className="absolute top-4 right-4 p-1 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                          title="Excluir comentário"
                        >
                          <Icons.Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {(selectedPost.comments || []).length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Nenhum comentário publicado ainda. Seja o primeiro a comentar!
                    </div>
                  )}
                </div>

                {/* Add Comment input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Escreva um comentário público..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(selectedPost.id)}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end shrink-0">
              <button 
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-6 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer"
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
