import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Milestone, Flag, Sparkles, Check, Camera, Upload, Image, X, Link, Pencil } from 'lucide-react';

// Character SVG with real arm and leg walking animations via framer-motion
interface CharacterProps {
  isWalking: boolean;
  action?: 'idle' | 'typing' | 'planting' | 'lookingUp' | 'saluting';
}

export const CharacterSVG: React.FC<CharacterProps> = ({ isWalking, action }) => {
  // Rotate legs during walking phase
  const legRightAnim = isWalking ? {
    rotate: [18, -18, 18],
    transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
  } : { rotate: 0 };

  const legLeftAnim = isWalking ? {
    rotate: [-18, 18, -18],
    transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
  } : { rotate: 0 };

  // Arms rotation logic
  let armRightAnim: any = { rotate: 0 };
  let armLeftAnim: any = { rotate: 0 };

  if (isWalking) {
    armRightAnim = {
      rotate: [-25, 25, -25],
      transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
    };
    armLeftAnim = {
      rotate: [25, -25, 25],
      transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
    };
  } else if (action === 'typing') {
    armRightAnim = {
      rotate: [15, 30, 15],
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 0.25, ease: "easeInOut" }
    };
    armLeftAnim = {
      rotate: [-15, -30, -15],
      y: [0, -2, 0],
      transition: { repeat: Infinity, duration: 0.2, ease: "easeInOut" }
    };
  } else if (action === 'planting') {
    armLeftAnim = {
      rotate: [-60, -45, -60],
      transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
    };
  } else if (action === 'lookingUp') {
    armRightAnim = { rotate: -15 };
    armLeftAnim = { rotate: -15 };
  }

  return (
    <svg width="34" height="60" viewBox="0 0 40 70" className="overflow-visible select-none">
      {/* Head */}
      <motion.circle 
        cx="20" cy="14" r="7" 
        fill="#fbcfe8" 
        stroke="#1e293b" 
        strokeWidth="2.5"
        animate={action === 'lookingUp' ? { y: -1, scaleY: 0.9 } : { y: 0 }}
      />
      {/* Hair detail */}
      <path d="M14 11 C 14 7, 26 7, 26 11 C 26 12, 14 12, 14 11 Z" fill="#475569" />
      
      {/* Torso / Shirt */}
      <rect x="14" y="21" width="12" height="22" rx="3.5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2.5" />
      
      {/* Arm Left */}
      <motion.line
        x1="14" y1="23" x2="8" y2="38"
        stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
        style={{ originX: '14px', originY: '23px' }}
        animate={armLeftAnim}
        className="stroke-slate-800"
      />

      {/* Arm Right */}
      <motion.line
        x1="26" y1="23" x2="32" y2="38"
        stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
        style={{ originX: '26px', originY: '23px' }}
        animate={armRightAnim}
        className="stroke-slate-800"
      />

      {/* Leg Left */}
      <motion.line
        x1="17" y1="43" x2="15" y2="62"
        stroke="#1e3a8a" strokeWidth="5.5" strokeLinecap="round"
        style={{ originX: '17px', originY: '43px' }}
        animate={legLeftAnim as any}
        className="stroke-slate-800"
      />

      {/* Leg Right */}
      <motion.line
        x1="23" y1="43" x2="25" y2="62"
        stroke="#1e3a8a" strokeWidth="5.5" strokeLinecap="round"
        style={{ originX: '23px', originY: '43px' }}
        animate={legRightAnim as any}
        className="stroke-slate-800"
      />
    </svg>
  );
};

export const AstronautSVG: React.FC<CharacterProps> = ({ isWalking, action }) => {
  const legRightAnim = isWalking ? {
    rotate: [15, -15, 15],
    transition: { repeat: Infinity, duration: 0.65, ease: "easeInOut" }
  } : { rotate: 0 };

  const legLeftAnim = isWalking ? {
    rotate: [-15, 15, -15],
    transition: { repeat: Infinity, duration: 0.65, ease: "easeInOut" }
  } : { rotate: 0 };

  let armRightAnim: any = { rotate: 0 };
  let armLeftAnim: any = { rotate: 0 };

  if (isWalking) {
    armRightAnim = {
      rotate: [-20, 20, -20],
      transition: { repeat: Infinity, duration: 0.65, ease: "easeInOut" }
    };
    armLeftAnim = {
      rotate: [20, -20, 20],
      transition: { repeat: Infinity, duration: 0.65, ease: "easeInOut" }
    };
  } else if (action === 'planting') {
    armLeftAnim = {
      rotate: [-55, -35, -55],
      transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
    };
  } else if (action === 'saluting') {
    armRightAnim = {
      rotate: -125,
      x: 2,
      y: -2,
      transition: { duration: 0.4 }
    };
  } else if (action === 'lookingUp') {
    armRightAnim = { rotate: -10 };
    armLeftAnim = { rotate: -10 };
  }

  return (
    <svg width="36" height="62" viewBox="0 0 44 72" className="overflow-visible select-none">
      {/* Helmet */}
      <circle cx="22" cy="15" r="9.5" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
      {/* Visor */}
      <rect x="15" y="9" width="14" height="9" rx="3" fill="#0284c7" stroke="#334155" strokeWidth="1.5" />
      {/* Glow highlight in visor */}
      <path d="M 17 11 Q 22 13, 27 11" stroke="#38bdf8" strokeWidth="1" fill="none" strokeLinecap="round" />
      
      {/* Life Support Backpack */}
      <rect x="6" y="22" width="7" height="24" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
      
      {/* Suit Torso */}
      <rect x="13" y="22" width="18" height="24" rx="4.5" fill="#f1f5f9" stroke="#334155" strokeWidth="2.5" />
      {/* Little blue brand detail on suit chest */}
      <rect x="17" y="27" width="4" height="4" rx="1" fill="#2563eb" />
      <rect x="23" y="27" width="4" height="2" rx="0.5" fill="#ef4444" />
      
      {/* Left Arm */}
      <motion.line
        x1="13" y1="24" x2="7" y2="38"
        stroke="#f1f5f9" strokeWidth="5.5" strokeLinecap="round"
        style={{ originX: '13px', originY: '24px' }}
        animate={armLeftAnim}
        className="stroke-slate-700"
      />

      {/* Right Arm */}
      <motion.line
        x1="31" y1="24" x2="37" y2="38"
        stroke="#f1f5f9" strokeWidth="5.5" strokeLinecap="round"
        style={{ originX: '31px', originY: '24px' }}
        animate={armRightAnim}
        className="stroke-slate-700"
      />

      {/* Left Leg */}
      <motion.line
        x1="17" y1="46" x2="15" y2="65"
        stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round"
        style={{ originX: '17px', originY: '46px' }}
        animate={legLeftAnim as any}
        className="stroke-slate-700"
      />

      {/* Right Leg */}
      <motion.line
        x1="27" y1="46" x2="29" y2="65"
        stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round"
        style={{ originX: '27px', originY: '46px' }}
        animate={legRightAnim as any}
        className="stroke-slate-700"
      />
    </svg>
  );
};

// Scene configs
interface SceneData {
  id: string;
  title: string;
  subtitle: string;
  isDark: boolean;
  characterType: 'normal' | 'astronaut';
}

const SCENES: SceneData[] = [
  { id: 'city', title: 'Cena 1: A Cidade', subtitle: 'A jornada de inovação começa na infraestrutura urbana', isDark: false, characterType: 'normal' },
  { id: 'computer_typing', title: 'Cena 2: O Terminal de Código', subtitle: 'Primeiras linhas de comando construindo a inteligência', isDark: true, characterType: 'normal' },
  { id: 'rocket_building', title: 'Cena 3: Montagem do Foguete', subtitle: 'Engenharia de precisão e testes estruturais no gantry', isDark: true, characterType: 'astronaut' },
  { id: 'rocket_launch', title: 'Cena 4: Lançamento Espacial', subtitle: 'Motores em potência máxima rompendo a atmosfera', isDark: true, characterType: 'astronaut' },
  { id: 'rocket_landing', title: 'Cena 5: Pouso Lunar', subtitle: 'Descida guiada por sensores e toque suave na superfície', isDark: true, characterType: 'astronaut' },
  { id: 'lunar', title: 'Cena 6: Base de Operação Zucchetti', subtitle: 'Fincando bandeira e consolidando a conquista tecnológica', isDark: true, characterType: 'astronaut' }
];

interface HeaderAnimationProps {
  setLevelUpState: (state: { active: boolean; level: string }) => void;
  user?: any;
  onUpdateUser?: (updatedUser: any) => void;
}

export const HeaderAnimation: React.FC<HeaderAnimationProps> = ({ setLevelUpState, user, onUpdateUser }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'walkingToCenter' | 'planting' | 'walkingToEnd'>('idle');
  const [typedText, setTypedText] = useState('');
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; x: number; y: number; scale: number }[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar Modal & custom URL State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [localAvatar, setLocalAvatar] = useState(() => {
    try {
      const cached = localStorage.getItem('luna_user');
      if (cached) {
        return JSON.parse(cached).avatar;
      }
    } catch (e) {}
    return "https://picsum.photos/seed/joaosilva/150/150";
  });

  const presetAvatars = [
    { name: 'Astronauta Cósmico', url: 'https://picsum.photos/seed/cosmic-astro/150/150' },
    { name: 'Rede Neural Matrix', url: 'https://picsum.photos/seed/cyber-matrix/150/150' },
    { name: 'Núcleo Neon Orb', url: 'https://picsum.photos/seed/neon-orb/150/150' },
    { name: 'Fênix Tecnológica', url: 'https://picsum.photos/seed/tech-phoenix/150/150' },
    { name: 'Mente Digital IA', url: 'https://picsum.photos/seed/digital-mind/150/150' },
    { name: 'Cristal Holográfico', url: 'https://picsum.photos/seed/holo-crystal/150/150' },
  ];

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    setLocalAvatar(newAvatarUrl);
    
    // Update globally in App context if exists
    if (onUpdateUser && user) {
      onUpdateUser({
        ...user,
        avatar: newAvatarUrl
      });
    } else {
      // Direct LocalStorage fallback if no context prop is passed
      try {
        const cached = localStorage.getItem('luna_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.avatar = newAvatarUrl;
          localStorage.setItem('luna_user', JSON.stringify(parsed));
        }
      } catch (e) {}
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Por favor, selecione uma imagem de até 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result && typeof uploadEvent.target.result === 'string') {
          handleUpdateAvatar(uploadEvent.target.result);
          setShowPhotoModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoUrl.trim()) return;
    if (!customPhotoUrl.startsWith('http://') && !customPhotoUrl.startsWith('https://')) {
      alert("Por favor, insira uma URL válida que inicie com http:// ou https://");
      return;
    }
    handleUpdateAvatar(customPhotoUrl.trim());
    setCustomPhotoUrl('');
    setShowPhotoModal(false);
  };

  const currentScene = SCENES[sceneIndex];

  // Helper trigger helper to switch phase
  const triggerPhaseTransition = (nextPhase: 'idle' | 'walkingToCenter' | 'planting' | 'walkingToEnd', duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase(nextPhase);

    timerRef.current = setTimeout(() => {
      if (nextPhase === 'walkingToCenter') {
        triggerPhaseTransition('planting', 4500);
      } else if (nextPhase === 'planting') {
        triggerPhaseTransition('walkingToEnd', 2500);
      } else if (nextPhase === 'walkingToEnd') {
        // Go to next scene
        setSceneIndex(prev => (prev + 1) % SCENES.length);
        setPhase('idle');
      }
    }, duration);
  };

  const handleStartAnimation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (phase !== 'idle') return;
    triggerPhaseTransition('walkingToCenter', 2500);
  };

  // Reset/Restart entire story machine
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    setSceneIndex(0);
    setPhase('idle');
    setTypedText('');
    setSparkles([]);
    setSmokeParticles([]);
  };

  // Custom animations inside scenes based on timing
  useEffect(() => {
    if (phase === 'planting') {
      if (currentScene.id === 'computer_typing') {
        setTypedText('');
        const text = 'Hello World';
        let i = 0;
        const interval = setInterval(() => {
          if (i < text.length) {
            setTypedText(prev => prev + text.charAt(i));
            i++;
          } else {
            clearInterval(interval);
          }
        }, 1500 / text.length);
        return () => clearInterval(interval);
      }

      if (currentScene.id === 'rocket_building') {
        // Generate weld sparks around rocket
        const interval = setInterval(() => {
          setSparkles(prev => [
            ...prev.slice(-15),
            { id: Date.now() + Math.random(), x: 50 + (Math.random() * 12 - 6), y: 35 + (Math.random() * 20 - 10) }
          ]);
        }, 150);
        return () => clearInterval(interval);
      }

      if (currentScene.id === 'rocket_launch') {
        // Generate flame/smoke particles at base
        const interval = setInterval(() => {
          setSmokeParticles(prev => [
            ...prev.slice(-25),
            { id: Date.now() + Math.random(), x: 50 + (Math.random() * 16 - 8), y: 40 + (Math.random() * 10), scale: Math.random() * 1.5 + 0.5 }
          ]);
        }, 80);
        return () => clearInterval(interval);
      }

      if (currentScene.id === 'rocket_landing') {
        // Dust particles on moon surface landing
        const interval = setInterval(() => {
          setSmokeParticles(prev => [
            ...prev.slice(-20),
            { id: Date.now() + Math.random(), x: 50 + (Math.random() * 26 - 13), y: 45 + (Math.random() * 5), scale: Math.random() * 1.2 + 0.4 }
          ]);
        }, 120);
        return () => clearInterval(interval);
      }
    } else {
      setTypedText('');
      setSparkles([]);
      setSmokeParticles([]);
    }
  }, [phase, sceneIndex]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Determine character action
  const getCharacterAction = () => {
    if (phase === 'idle' || phase === 'walkingToCenter' || phase === 'walkingToEnd') return 'idle';
    if (currentScene.id === 'computer_typing') return 'typing';
    if (currentScene.id === 'lunar') return 'planting';
    if (currentScene.id === 'rocket_launch' || currentScene.id === 'rocket_building' || currentScene.id === 'rocket_landing') return 'lookingUp';
    return 'idle';
  };

  // Coordinates for the character based on phase
  const getCharacterX = () => {
    switch (phase) {
      case 'idle':
        return '12%';
      case 'walkingToCenter':
        return '42%';
      case 'planting':
        return '42%';
      case 'walkingToEnd':
        return '110%';
      default:
        return '12%';
    }
  };

  return (
    <div 
      onClick={() => phase === 'idle' && handleStartAnimation()}
      className={`rounded-3xl border relative flex flex-col justify-between select-none transition-all duration-700 shadow-xl group cursor-pointer overflow-hidden p-6 gap-6 min-h-[180px] ${
        currentScene.isDark 
          ? 'bg-[#040811] border-slate-800 text-white' 
          : 'bg-gradient-to-b from-sky-100 to-white border-slate-200 text-slate-800'
      }`}
      style={currentScene.isDark ? {
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1.2px, transparent 0)`,
        backgroundSize: '24px 24px'
      } : {}}
    >
      {/* Decorative sky details */}
      {!currentScene.isDark && (
        <div className="absolute top-4 left-[15%] w-16 h-8 bg-white/75 rounded-full blur-xs pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      )}
      {!currentScene.isDark && (
        <div className="absolute top-8 right-[25%] w-20 h-10 bg-white/65 rounded-full blur-xs pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      )}

      {/* FOREGROUND: Profile Card Content Overlay */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-6 pointer-events-auto">
        <div className="flex items-center gap-5 w-full lg:w-auto" onClick={(e) => e.stopPropagation()}>
          <div 
            className="relative group cursor-pointer" 
            onClick={() => setShowPhotoModal(true)} 
            title="Clique para trocar sua foto de perfil"
          >
            <img 
              src={user?.avatar || localAvatar} 
              alt={user?.name || "Joao Silva"} 
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-200"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-6 h-6 animate-pulse text-white" />
            </div>
            {/* Bottom-right Camera badge */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all">
              <Camera className="w-3 h-3 stroke-[2.5px]" />
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1">
            <h2 className={`text-2xl font-black tracking-tight ${
              currentScene.isDark ? 'text-white' : 'text-slate-850'
            }`}>
              {user?.name || "Joao Silva"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block px-3 py-1 font-black text-[10px] uppercase rounded-full tracking-wider border ${
                currentScene.isDark 
                  ? 'bg-sky-950/70 text-sky-300 border-sky-900/60' 
                  : 'bg-sky-100 text-sky-700 border-sky-200'
              }`}>
                AI STARTER
              </span>
              
              {/* Level Up Simulator buttons with click propagation stopped */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className={`text-[10px] font-bold uppercase ${
                  currentScene.isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Simular Upgrade:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLevelUpState({ active: true, level: "AI User" });
                  }}
                  className={`px-2 py-0.5 text-[9px] font-black rounded border cursor-pointer active:scale-95 transition-all ${
                    currentScene.isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  AI User ⚡
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLevelUpState({ active: true, level: "AI Builder" });
                  }}
                  className={`px-2 py-0.5 text-[9px] font-black rounded border cursor-pointer active:scale-95 transition-all ${
                    currentScene.isDark
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/20'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20'
                  }`}
                >
                  AI Builder 🚀
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLevelUpState({ active: true, level: "AI Champion" });
                  }}
                  className={`px-2 py-0.5 text-[9px] font-black rounded border cursor-pointer active:scale-95 transition-all ${
                    currentScene.isDark
                      ? 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border-purple-500/20'
                      : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border-purple-500/20'
                  }`}
                >
                  AI Champion 👑
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats grid with glassmorphic styling */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto" onClick={(e) => e.stopPropagation()}>
          <div className={`flex-1 lg:flex-none min-w-[140px] border rounded-2xl p-4 text-left transition-all backdrop-blur-md shadow-sm ${
            currentScene.isDark
              ? 'bg-slate-950/50 border-slate-800/80'
              : 'bg-white/50 border-slate-200/60'
          }`}>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${
              currentScene.isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Interações Luna
            </div>
            <div className={`text-2xl font-black mt-1 ${
              currentScene.isDark ? 'text-white' : 'text-slate-800'
            }`}>
              15
            </div>
          </div>
          
          <div className={`flex-1 lg:flex-none min-w-[140px] border rounded-2xl p-4 text-left transition-all backdrop-blur-md shadow-sm ${
            currentScene.isDark
              ? 'bg-slate-950/50 border-slate-800/80'
              : 'bg-white/50 border-slate-200/60'
          }`}>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${
              currentScene.isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Recursos Criados
            </div>
            <div className={`text-2xl font-black mt-1 ${
              currentScene.isDark ? 'text-white' : 'text-slate-800'
            }`}>
              2
            </div>
          </div>
          
          <div className={`flex-1 lg:flex-none min-w-[140px] border rounded-2xl p-4 text-left transition-all backdrop-blur-md shadow-sm ${
            currentScene.isDark
              ? 'bg-slate-950/50 border-slate-800/80'
              : 'bg-white/50 border-slate-200/60'
          }`}>
            <div className={`text-[9px] font-bold uppercase tracking-wider ${
              currentScene.isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Em Produção
            </div>
            <div className={`text-2xl font-black mt-1 ${
              currentScene.isDark ? 'text-white' : 'text-slate-800'
            }`}>
              1
            </div>
          </div>
        </div>
      </div>

      {/* STAGE AREA (Absolute bottom overlay) */}
      <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden pointer-events-none select-none z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* SCENE 1: City background buildings and street */}
            {currentScene.id === 'city' && (
              <>
                {/* Silhouette Buildings */}
                <div className="absolute bottom-[35px] left-0 right-0 h-24 flex items-end gap-1.5 opacity-25 px-4 select-none">
                  <div className="w-12 h-16 bg-slate-600 rounded-t-lg relative">
                    <div className="grid grid-cols-2 gap-1 p-1">
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs" />
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-xs" />
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs" />
                    </div>
                  </div>
                  <div className="w-16 h-20 bg-slate-500 rounded-t-lg relative">
                    <div className="grid grid-cols-3 gap-1 p-1">
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs" />
                      <div className="w-1.5 h-1.5 bg-slate-600 rounded-xs" />
                    </div>
                  </div>
                  <div className="w-10 h-12 bg-slate-600 rounded-t-lg" />
                  <div className="w-14 h-22 bg-slate-400 rounded-t-lg relative">
                    <div className="grid grid-cols-2 gap-1.5 p-1.5">
                      <div className="w-2 h-2 bg-yellow-100 rounded-xs" />
                      <div className="w-2 h-2 bg-yellow-100 rounded-xs" />
                    </div>
                  </div>
                  <div className="w-12 h-16 bg-slate-500 rounded-t-lg" />
                  <div className="w-20 h-24 bg-slate-600 rounded-t-xl relative ml-auto">
                    <div className="grid grid-cols-4 gap-1 p-1.5">
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs" />
                      <div className="w-1.5 h-1.5 bg-yellow-100 rounded-xs animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Street floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[38px] bg-slate-750 border-t-2 border-slate-850 flex items-center">
                  <div className="w-full flex justify-around gap-4 px-2">
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                    <div className="w-8 h-1 bg-yellow-400/80 rounded-full" />
                  </div>
                </div>
              </>
            )}

            {/* SCENE 2: Computer Typing desk setup */}
            {currentScene.id === 'computer_typing' && (
              <>
                {/* Desk and Computer */}
                <div className="absolute bottom-[30px] left-[55%] -translate-x-1/2 flex flex-col items-center">
                  {/* Computer Monitor */}
                  <div className="relative">
                    <div className="w-14 h-10 bg-slate-800 rounded-md border-2 border-slate-700 shadow-lg flex flex-col justify-between p-1">
                      {/* PC Screen */}
                      <div className="flex-1 bg-black rounded-xs border border-slate-900 overflow-hidden p-0.5 flex items-start">
                        <span className="font-mono text-[7px] text-green-400 font-bold leading-none break-all select-none">
                          {typedText}
                          {phase === 'planting' && (
                            <span className="animate-pulse font-black text-green-400">|</span>
                          )}
                        </span>
                      </div>
                    </div>
                    {/* PC Stand */}
                    <div className="w-3 h-3 bg-slate-700 mx-auto border-x border-slate-600" />
                    <div className="w-10 h-1 bg-slate-800 rounded-full mx-auto" />
                  </div>
                  {/* Table */}
                  <div className="w-24 h-1 bg-slate-700 shadow-sm" />
                  <div className="flex justify-between w-20 h-8">
                    <div className="w-1.5 h-full bg-slate-700 border-r border-slate-800" />
                    <div className="w-1.5 h-full bg-slate-700 border-l border-slate-800" />
                  </div>
                </div>

                {/* Cyber Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[32px] bg-slate-950 border-t border-slate-800" />
              </>
            )}

            {/* SCENE 3: Rocket Building launchpad/scaffolding */}
            {currentScene.id === 'rocket_building' && (
              <>
                {/* Launch gantry scaffolding */}
                <div className="absolute bottom-[30px] right-[25%] w-16 h-36 border-l-4 border-r-4 border-slate-700/60 border-t-4 flex flex-col justify-between opacity-30 p-1">
                  <div className="w-full h-0.5 bg-slate-700/80" />
                  <div className="w-full h-0.5 bg-slate-700/80" />
                  <div className="w-full h-0.5 bg-slate-700/80" />
                </div>

                {/* Half assembled rocket */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={phase === 'planting' ? { y: 0, opacity: 1 } : { y: 15, opacity: 0.8 }}
                  transition={{ duration: 1.5 }}
                  className="absolute bottom-[30px] left-[55%] -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Nose cone */}
                  <div className="w-7 h-8 bg-sky-400 rounded-t-full border border-slate-700" />
                  {/* Body upper */}
                  <div className="w-9 h-12 bg-white border-x border-slate-700 flex items-center justify-center relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border" />
                  </div>
                  {/* Body lower (constructed/building animation) */}
                  <motion.div 
                    animate={phase === 'planting' ? { height: '24px', opacity: 1 } : { height: '8px', opacity: 0.5 }}
                    className="w-9 bg-slate-100 border-x border-slate-700 overflow-hidden relative flex flex-col justify-end"
                  >
                    <div className="w-full h-1 bg-yellow-400 animate-pulse" />
                  </motion.div>
                  {/* Thruster base */}
                  <div className="w-10 h-2 bg-slate-800 border-t border-slate-600 rounded-b-sm" />
                </motion.div>

                {/* Weld Sparks */}
                {sparkles.map(sp => (
                  <motion.div
                    key={sp.id}
                    initial={{ scale: 2, opacity: 1 }}
                    animate={{ scale: 0, opacity: 0, y: [0, Math.random() * 20 - 10] }}
                    transition={{ duration: 0.4 }}
                    className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full"
                    style={{ left: `${sp.x}%`, bottom: `${sp.y}px` }}
                  />
                ))}

                {/* Launchpad Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-[#1e293b] border-t-2 border-slate-800" />
              </>
            )}

            {/* SCENE 4: Rocket Launch */}
            {currentScene.id === 'rocket_launch' && (
              <>
                {/* Gantry tower */}
                <div className="absolute bottom-[30px] right-[25%] w-12 h-32 border-l-2 border-r-2 border-slate-800/80 flex flex-col justify-between opacity-20 p-1">
                  <div className="w-full h-px bg-slate-800" />
                  <div className="w-full h-px bg-slate-800" />
                </div>

                {/* Flying Rocket */}
                <motion.div 
                  animate={
                    phase === 'planting'
                      ? { 
                          y: [-2, 2, -2, -250], 
                          x: [0, -1, 1, 0, 0],
                          transition: { duration: 4.5, ease: [0.6, -0.05, 0.01, 0.9] } 
                        }
                      : { y: 0 }
                  }
                  className="absolute bottom-[30px] left-[55%] -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Nose cone */}
                  <div className="w-7 h-8 bg-sky-400 rounded-t-full border border-slate-700" />
                  {/* Body */}
                  <div className="w-9 h-26 bg-white border-x border-slate-700 flex flex-col justify-between py-2 items-center relative shadow-md">
                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                    <span className="text-[10px] font-black text-blue-600 tracking-tight font-sans">Z</span>
                    <div className="w-3 h-3 rounded-full bg-slate-800" />
                  </div>
                  {/* Fins */}
                  <div className="flex justify-between w-13 -mt-1 relative z-10">
                    <div className="w-2.5 h-5 bg-sky-500 rounded-l-full border border-slate-700 transform -rotate-12" />
                    <div className="w-2.5 h-5 bg-sky-500 rounded-r-full border border-slate-700 transform rotate-12" />
                  </div>
                  {/* Fire Thruster animation */}
                  {phase === 'planting' && (
                    <motion.div 
                      animate={{ scaleY: [1, 1.6, 1], scaleX: [1, 0.9, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.15 }}
                      className="w-6 h-12 bg-gradient-to-t from-transparent via-yellow-500 to-red-600 rounded-b-full -mt-1 origin-top flex items-center justify-center"
                    >
                      <div className="w-3 h-8 bg-yellow-300 rounded-b-full" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Rocket Smoke and Fire Particles */}
                {smokeParticles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: p.scale, opacity: 0.8, x: 0 }}
                    animate={{ scale: p.scale * 3, opacity: 0, y: [0, 20], x: [0, (Math.random() * 30 - 15)] }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute w-4 h-4 bg-slate-350 dark:bg-slate-700/80 rounded-full blur-xs"
                    style={{ left: `${p.x}%`, bottom: `${p.y}px` }}
                  />
                ))}

                {/* Launch Platform floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-slate-900 border-t-2 border-slate-950" />
              </>
            )}

            {/* SCENE 5: Rocket Landing */}
            {currentScene.id === 'rocket_landing' && (
              <>
                {/* Mountains in background */}
                <div className="absolute bottom-[30px] left-0 right-0 h-16 flex items-end opacity-20 px-1 pointer-events-none">
                  <div className="w-28 h-10 bg-slate-600 rounded-t-full relative -mr-6" />
                  <div className="w-36 h-14 bg-slate-500 rounded-t-full relative -mr-4" />
                </div>

                {/* Landing pad base target */}
                <div className="absolute bottom-[30px] left-[55%] -translate-x-1/2 w-20 h-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-0.5 bg-indigo-400" />
                </div>

                {/* Landing Rocket descending */}
                <motion.div 
                  initial={{ y: -160, rotate: -5 }}
                  animate={
                    phase === 'planting'
                      ? { 
                          y: 0, 
                          rotate: 0,
                          transition: { duration: 4.2, ease: "easeOut" } 
                        }
                      : phase === 'walkingToEnd'
                      ? { y: 0, rotate: 0 }
                      : { y: -160 }
                  }
                  className="absolute bottom-[32px] left-[55%] -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Nose cone */}
                  <div className="w-7 h-8 bg-sky-400 rounded-t-full border border-slate-700" />
                  {/* Body */}
                  <div className="w-9 h-24 bg-white border-x border-slate-700 flex flex-col justify-center items-center relative shadow-sm">
                    <span className="text-[10px] font-black text-blue-600">Z</span>
                  </div>
                  {/* Landing gear deployed */}
                  <div className="flex justify-between w-12 -mt-0.5 relative z-10">
                    <div className="w-2 h-4 bg-slate-700 rounded-b-md transform -rotate-45" />
                    <div className="w-2 h-4 bg-slate-700 rounded-b-md transform rotate-45" />
                  </div>
                  {/* Landing flames flickering */}
                  {phase === 'planting' && (
                    <motion.div 
                      animate={{ scaleY: [1, 1.4, 0.8, 1.1, 0.2, 0], opacity: [1, 1, 1, 0.8, 0.2, 0] }}
                      transition={{ duration: 4.2, ease: "linear" }}
                      className="w-5 h-9 bg-gradient-to-t from-transparent via-yellow-400 to-red-500 rounded-b-full -mt-1 origin-top flex items-center justify-center"
                    >
                      <div className="w-2.5 h-5 bg-yellow-200 rounded-b-full" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Dust Smoke on touchdown */}
                {smokeParticles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ scale: p.scale, opacity: 0.6, x: 0 }}
                    animate={{ scale: p.scale * 4, opacity: 0, y: [5, 15], x: [0, (Math.random() * 40 - 20)] }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="absolute w-3 h-3 bg-slate-500/40 rounded-full blur-xs"
                    style={{ left: `${p.x}%`, bottom: `${p.y}px` }}
                  />
                ))}

                {/* Lunar surface floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-slate-800 border-t-2 border-slate-900" />
              </>
            )}

            {/* SCENE 6: Lunar final base flag plant */}
            {currentScene.id === 'lunar' && (
              <>
                {/* Mountains in background */}
                <div className="absolute bottom-[30px] left-0 right-0 h-16 flex items-end opacity-25 px-1 pointer-events-none">
                  <div className="w-32 h-12 bg-slate-700 rounded-t-full relative -mr-8" />
                  <div className="w-24 h-10 bg-slate-600 rounded-t-full relative ml-auto" />
                </div>

                {/* Landed Rocket in background */}
                <div className="absolute bottom-[30px] right-[18%] flex flex-col items-center opacity-65">
                  <div className="w-5 h-6 bg-sky-500 rounded-t-full border border-slate-700" />
                  <div className="w-7 h-16 bg-white border-x border-slate-700" />
                  <div className="w-9 h-1 bg-slate-800" />
                </div>

                {/* Flag planted at center */}
                {(phase === 'planting' || phase === 'walkingToEnd') && (
                  <motion.div 
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute bottom-[30px] left-[52%] origin-bottom flex items-start"
                  >
                    {/* Flagpole */}
                    <div className="w-1.5 h-22 bg-slate-400 rounded-t-full relative" />
                    {/* Waving flag with blue "Z" logo */}
                    <motion.div 
                      animate={{ skewY: [-3, 3, -3], rotateY: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="w-12 h-8 bg-white border border-slate-300 rounded-r-md -ml-0.5 shadow-sm p-1 flex items-center justify-center relative overflow-hidden"
                    >
                      {/* Flag design: White with blue stripes and Z */}
                      <div className="absolute left-0 right-0 top-0 h-1.5 bg-blue-600" />
                      <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-blue-600" />
                      <span className="text-xs font-black text-blue-600 font-sans tracking-tight relative z-10">Z</span>
                    </motion.div>
                  </motion.div>
                )}

                {/* Lunar grey craters floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-slate-700 border-t-2 border-slate-800 flex items-center justify-around">
                  <div className="w-6 h-1.5 bg-slate-800/50 rounded-full" />
                  <div className="w-4 h-1 bg-slate-800/40 rounded-full" />
                  <div className="w-8 h-2 bg-slate-800/60 rounded-full" />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CHARACTER CONTROLLER */}
        <motion.div
          animate={{ left: getCharacterX() }}
          transition={{ duration: 2.5, ease: "linear" }}
          className="absolute bottom-[28px] z-30 flex flex-col items-center pointer-events-none animate-in fade-in duration-300"
          style={{ transform: 'translateX(-50%)' }}
        >
          {/* Walking indicator tooltip above character when idle */}
          {phase === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-12 bg-blue-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1.5 select-none whitespace-nowrap z-50 pointer-events-auto cursor-pointer"
              onClick={handleStartAnimation}
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
              <span>CLIQUE PARA EXECUTAR</span>
            </motion.div>
          )}

          {/* Render selected character */}
          {currentScene.characterType === 'normal' ? (
            <CharacterSVG isWalking={phase === 'walkingToCenter' || phase === 'walkingToEnd'} action={getCharacterAction()} />
          ) : (
            <AstronautSVG isWalking={phase === 'walkingToCenter' || phase === 'walkingToEnd'} action={getCharacterAction()} />
          )}
        </motion.div>
      </div>

      {/* FOOTER CONTROLS OVERVIEW - SIMPLIFIED TO START BUTTON ONLY */}
      <div 
        className="mt-auto flex justify-center items-center relative z-20 pointer-events-auto py-2" 
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'idle' ? (
          <button
            onClick={handleStartAnimation}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black tracking-wider shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Iniciar Jornada Luna</span>
          </button>
        ) : (
          <div className="px-5 py-2.5 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl text-[10px] font-black text-slate-200 border border-slate-800 flex items-center gap-2 shadow-lg">
            <span className="animate-pulse text-emerald-400">●</span>
            <span className="uppercase text-emerald-400">
              {phase === 'walkingToCenter' ? 'Aproximação' : phase === 'planting' ? 'Processando' : 'Avançando'}
            </span>
          </div>
        )}
      </div>

      {/* PHOTO CHANGER MODAL */}
      <AnimatePresence>
        {showPhotoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhotoModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-900 shadow-2xl relative z-[101] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500 animate-pulse" />
                  <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Mudar Foto de Perfil</h2>
                </div>
                <button 
                  onClick={() => setShowPhotoModal(false)}
                  className="text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 transition-colors p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full cursor-pointer focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* FILE UPLOAD */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fazer Upload do seu Computador</label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-600 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-blue-500 transition-colors mb-2 animate-bounce" />
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">Arraste uma foto ou clique para procurar</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Formatos suportados: PNG, JPG ou WEBP. Máx: 2MB.</p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-900 flex justify-end">
                <button 
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
