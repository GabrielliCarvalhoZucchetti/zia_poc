import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Mouse hover tracking for the grid
  const [mousePos, setMousePos] = useState({ x: -250, y: -250 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('gabrielli.carvalho@zucchetti.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBU, setRegBU] = useState('');
  const [regSector, setRegSector] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotSuccess, setShowForgotSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    
    // Simulate real user payload
    const mockUser: User = {
      id: `u-${Date.now()}`,
      name: loginEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      role: UserRole.ADMINISTRATOR,
      avatar: `https://picsum.photos/seed/${loginEmail.split('@')[0]}/100/100`,
      bu: 'Desenvolvimento'
    };
    onLogin(mockUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regBU || !regSector || !regPassword || !regConfirmPassword) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!regEmail.endsWith('@zucchetti.com') && !regEmail.endsWith('@elofy.com.br')) {
      alert('Por favor, utilize um email corporativo válido (@zucchetti.com ou @elofy.com.br).');
      return;
    }
    if (regPassword.length < 6) {
      alert('A senha deve conter no mínimo de 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regName,
      role: UserRole.BASIC,
      avatar: `https://picsum.photos/seed/${regEmail.split('@')[0]}/100/100`,
      bu: regBU
    };
    onLogin(newUser);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert('Por favor, informe seu email.');
      return;
    }
    setShowForgotSuccess(true);
  };

  // Motion variants for letters streaming (typing effect)
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
  };

  const tagVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.8,
      },
    },
  };

  const tagLetterVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.12,
        ease: "easeOut"
      },
    }
  };

  return (
    <div id="login-layout-container" className="min-h-screen bg-[#f4f7fe] flex flex-col md:flex-row select-none overflow-x-hidden font-sans">
      
      {/* Left side: LUNA brand & concept showcase */}
      <motion.div 
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full md:w-1/2 bg-gradient-to-tr from-[#edf2fd] via-[#f4f7ff] to-[#ebf0fc] flex flex-col justify-between p-8 md:p-16 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 min-h-[340px] md:min-h-screen cursor-default"
      >
        {/* Subtle decorative grid/network overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.22]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern-login" width="35" height="35" patternUnits="userSpaceOnUse">
                <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#3b66f5" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-login)" />
          </svg>
        </div>

        {/* Dynamic Highlight Cell snapping to the 35px grid */}
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none bg-[#3b66f5]/10 border border-[#3b66f5]/25 rounded-md"
            style={{
              width: '35px',
              height: '35px',
              left: Math.floor(mousePos.x / 35) * 35,
              top: Math.floor(mousePos.y / 35) * 35,
            }}
            layoutId="active-grid-cell"
            transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          />
        )}

        {/* Dynamic interactive glowing spotlight and radar indicator */}
        {isHovered && (
          <>
            <motion.div
              className="absolute pointer-events-none rounded-full blur-2xl bg-[#3b66f5]/15"
              style={{
                width: '180px',
                height: '180px',
                left: mousePos.x - 90,
                top: mousePos.y - 90,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            />
            <motion.div
              className="absolute pointer-events-none border border-blue-500/20 rounded-full flex items-center justify-center bg-blue-500/[0.04] backdrop-blur-[0.5px]"
              style={{
                width: '50px',
                height: '50px',
                left: mousePos.x - 25,
                top: mousePos.y - 25,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#3b66f5] shadow-md shadow-blue-500/40" />
              <motion.div 
                className="absolute inset-0 border border-blue-400/25 rounded-full"
                initial={{ scale: 0.6, opacity: 1 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
              />
            </motion.div>
          </>
        )}

        {/* Orbit/Constellation background lines */}
        <div className="absolute top-[25%] right-[-15%] w-[380px] h-[380px] rounded-full border border-blue-200/30 pointer-events-none hidden md:block" />
        <div className="absolute top-[15%] right-[-20%] w-[540px] h-[540px] rounded-full border border-blue-100/20 pointer-events-none hidden md:block" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-blue-400/8 to-transparent blur-3xl pointer-events-none" />

        {/* Top brand header: Official Zucchetti Logo */}
        <motion.div 
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 relative z-10 select-none"
        >
          <svg className="h-10 w-auto" viewBox="0 0 350 85" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="zucchetti-arrows-contour">
                {/* Two symmetric arrowheads/chevrons pointing in toward the central Z */}
                <polygon points="2,12 48,45 2,78" />
                <polygon points="98,12 52,45 98,78" />
              </clipPath>
            </defs>
            
            {/* The Emblem: Striped background with solid Z overlay */}
            <g transform="translate(2, 0)">
              <g clipPath="url(#zucchetti-arrows-contour)">
                {Array.from({ length: 19 }).map((_, i) => (
                  <rect key={i} x="0" y={2 + i * 4.0} width="95" height="2.3" fill="#0069b4" />
                ))}
              </g>
              {/* Solid White "Z" overlaid on top, perfectly centered and oriented */}
              <polygon 
                points="25,18 75,18 75,30 41,60 75,60 75,72 25,72 25,60 59,30 25,30" 
                fill="#ffffff" 
              />
            </g>

            {/* The brand typography: ZUCCHETTI in bold blue */}
            <text 
              x="100" 
              y="54" 
              fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', 'Arial Black', sans-serif" 
              fontWeight="900" 
              fontSize="45" 
              fill="#0069b4" 
              letterSpacing="-0.035em"
            >
              ZUCCHETTI
            </text>
          </svg>
        </motion.div>

        {/* Middle content alignment: Title LUNA with custom visual */}
        <motion.div 
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="my-auto py-10 md:py-20 relative z-10 max-w-md"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3b66f5]"></span>
            </span>
            <span className="text-[10px] font-black text-slate-705 uppercase tracking-widest font-mono">LUNA Ecosystem</span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-5 flex items-center justify-start"
          >
            <svg 
              className="h-16 md:h-20 w-auto" 
              viewBox="0 0 295 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Logomark */}
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Outer Crescent */}
                <path
                  d="M 35.5,23.7 A 28,28 0 1,0 66.4,32.0"
                  stroke="#000c3a"
                  strokeWidth="13"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Center Planet */}
                <circle cx="45" cy="50" r="11.5" fill="#000c3a" />
                {/* Top Right Dot */}
                <circle cx="71.3" cy="18.6" r="7.5" fill="#000c3a" />
              </motion.g>

              {/* Letter L */}
              <motion.path
                variants={letterVariants}
                d="M 110,32 V 58 A 12,12 0 0,0 122,70 H 138"
                stroke="#000c3a"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Letter U */}
              <motion.g variants={letterVariants}>
                <path
                  d="M 154,32 V 58 A 14,14 0 0,0 182,58 V 32"
                  stroke="#000c3a"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="168" cy="46" r="5.5" fill="#000c3a" />
              </motion.g>

              {/* Letter N */}
              <motion.path
                variants={letterVariants}
                d="M 198,70 V 44 A 14,14 0 0,1 226,44 V 70"
                stroke="#000c3a"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Letter A */}
              <motion.g variants={letterVariants}>
                <path
                  d="M 242,70 V 44 A 14,14 0 0,1 270,44 V 70"
                  stroke="#000c3a"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="256" cy="57" r="5.5" fill="#000c3a" />
              </motion.g>
            </svg>
          </motion.div>
          
          <motion.p 
            variants={tagVariants}
            initial="hidden"
            animate="visible"
            className="text-xl md:text-2xl font-bold text-slate-600 tracking-tight leading-snug flex flex-wrap"
          >
            {Array.from("Linking Users and Networked Agents.").map((char, index) => (
              <motion.span 
                key={index} 
                variants={tagLetterVariants} 
                style={{ display: char === ' ' ? 'inline-block' : 'inline' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* Bottom copyright on the left panel */}
        <div className="text-[11px] font-bold text-slate-400 relative z-10 pl-1">
          2026 © Zucchetti
        </div>
      </motion.div>

      {/* Right side: Login & Form Actions Column */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto min-h-[520px]">
        
        <div className="w-full max-w-md my-auto py-8">
          
          {/* Header specific to the form view */}
          <div className="flex flex-col items-center text-center w-full mb-8 animate-in fade-in duration-500">
            {view === 'login' && (
              <>
                <h1 className="text-2.5xl font-black text-[#030d26] tracking-tight mb-2">Bem-vindo de volta</h1>
                 <p className="text-xs font-bold text-slate-500">Entre na sua conta para continuar</p>
              </>
            )}
            {view === 'register' && (
              <>
                <h1 className="text-2.5xl font-black text-[#030d26] tracking-tight mb-2">Criar sua conta</h1>
                <p className="text-xs font-bold text-slate-500">Comece a usar nossa plataforma hoje mesmo</p>
              </>
            )}
            {view === 'forgot' && (
              <>
                <h1 className="text-2.5xl font-black text-[#030d26] tracking-tight mb-2">Esqueceu sua senha?</h1>
                <p className="text-xs font-bold text-slate-500">Digite seu email para receber um código de recuperação</p>
              </>
            )}
          </div>

          {/* Seamless inputs container without the floating modal style */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full select-none"
          >
            
            {/* VIEW: LOGIN */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Email</label>
                  <div className="relative flex items-center bg-[#edf2fd] rounded-lg border border-transparent focus-within:border-[#3b66f5]/40 transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@zucchetti.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 block">Senha</label>
                  </div>
                  <div className="relative flex items-center bg-[#edf2fd] rounded-lg border border-transparent focus-within:border-[#3b66f5]/40 transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-12 pr-12 py-3.5 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showLoginPassword ? (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm and Enter */}
                <button 
                  type="submit"
                  className="w-full bg-[#3b66f5] hover:bg-[#2b54e3] active:bg-[#1e42c2] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/15 cursor-pointer mt-2"
                >
                  <svg className="w-5 h-5 stroke-[2] rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  <span>Entrar</span>
                </button>

                {/* Forgot password */}
                <div className="text-center pt-1">
                  <button 
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-[#3b66f5] hover:text-[#2b54e3] hover:underline"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                {/* Create account section */}
                <div className="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4 mt-2">
                  Não tem uma conta?{' '}
                  <button 
                    type="button"
                    onClick={() => setView('register')}
                    className="text-xs font-bold text-[#3b66f5] hover:text-[#2b54e3] hover:underline ml-1"
                  >
                    Criar conta
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: REGISTER */}
            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4.5">
                
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Nome Completo *</label>
                  <div className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-[#3b66f5] transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input 
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="João Silva"
                      className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Email Corporativo */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Email Corporativo *</label>
                  <div className="relative flex items-center bg-[#edf2fd] rounded-lg border border-transparent focus-within:border-[#3b66f5]/40 transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <input 
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="seu.email@zucchetti.com"
                      className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 block pl-1">
                    Emails @zucchetti.com ou @elofy.com.br
                  </span>
                </div>

                {/* BU */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">BU *</label>
                  <div className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-[#3b66f5] transition-all pr-3">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                        <path d="M9 22V12h6v10"/>
                      </svg>
                    </div>
                    <select 
                      value={regBU}
                      onChange={(e) => setRegBU(e.target.value)}
                      className="w-full pl-12 pr-8 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Selecione sua BU</option>
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="ERP">ERP</option>
                      <option value="POS">POS</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Staff">Staff</option>
                      <option value="Administração">Administração</option>
                      <option value="HR TECH">HR TECH</option>
                      <option value="IA & Inovação">IA & Inovação</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 text-slate-400">
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Setor */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Setor *</label>
                  <div className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-[#3b66f5] transition-all pr-3">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-3-3.87"/>
                        <circle cx="14" cy="4" r="3"/>
                      </svg>
                    </div>
                    <select 
                      value={regSector}
                      onChange={(e) => setRegSector(e.target.value)}
                      className="w-full pl-12 pr-8 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Selecione seu Setor</option>
                      <option value="TI / Infraestrutura">TI / Infraestrutura</option>
                      <option value="Desenvolvimento de Softwares">Desenvolvimento de Softwares</option>
                      <option value="Produto & Qualidade">Produto & Qualidade</option>
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Comercial & Vendas">Comercial & Vendas</option>
                      <option value="Qualidade (QA)">Qualidade (QA)</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Inovação / IA">Inovação / IA</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 text-slate-400">
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Senha *</label>
                  <div className="relative flex items-center bg-[#edf2fd] rounded-lg border border-transparent focus-within:border-[#3b66f5]/40 transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input 
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Confirmar Senha *</label>
                  <div className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-[#3b66f5] transition-all">
                    <div className="absolute left-4 text-slate-400">
                      <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input 
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full pl-12 pr-12 py-3 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600"
                    >
                      {showRegConfirmPassword ? (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Criar Conta Button */}
                <button 
                  type="submit"
                  className="w-full bg-[#3b66f5] hover:bg-[#2b54e3] active:bg-[#1e42c2] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/15 cursor-pointer mt-4"
                >
                  <svg className="w-5 h-5 text-white stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>Criar Conta</span>
                </button>

                {/* Back to Login trigger */}
                <div className="text-center text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100 mt-4">
                  Já tem uma conta?{' '}
                  <button 
                    type="button"
                    onClick={() => setView('login')}
                    className="text-xs font-bold text-[#3b66f5] hover:text-[#2b54e3] hover:underline ml-1"
                  >
                    Fazer login
                  </button>
                </div>
              </form>
            )}

            {/* VIEW: FORGOT PASSWORD */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                {showForgotSuccess ? (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                      <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Email enviado!</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Enviamos as instruções para <strong>{forgotEmail}</strong>.
                    </p>
                    <button 
                      type="button"
                      onClick={() => {
                        setView('login');
                        setShowForgotSuccess(false);
                        setForgotEmail('');
                      }}
                      className="mt-2 text-xs font-bold text-[#3b66f5] hover:underline"
                    >
                      Voltar ao login
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Email</label>
                      <div className="relative flex items-center bg-white rounded-lg border border-slate-200 focus-within:border-[#3b66f5] transition-all">
                        <div className="absolute left-4 text-slate-400">
                          <svg className="w-5 h-5 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </div>
                        <input 
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full pl-12 pr-4 py-3.5 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <button 
                      type="submit"
                      className="w-full bg-[#3b66f5] hover:bg-[#2b54e3] active:bg-[#1e42c2] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/15 cursor-pointer"
                    >
                      <span>Enviar código</span>
                    </button>

                    {/* Back to login trigger */}
                    <div className="text-center pt-2">
                      <button 
                        type="button"
                        onClick={() => setView('login')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
                        </svg>
                        <span>Voltar ao login</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </motion.div>
          
        </div>

        {/* Small copyright at bottom offset on mobile view */}
        <div className="text-[10px] font-bold text-slate-400 md:hidden mt-4 pb-2">
          2026 © Zucchetti
        </div>

      </div>
    </div>
  );
};
