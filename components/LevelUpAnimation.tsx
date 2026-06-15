import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../constants';

// ==========================================
// CENTRAL TIMING CONSTANTS (Adjust rhythm here)
// ==========================================
export const TIMING = {
  FADE_IN_DURATION: 0.4,    // Fade-in duration of the fullscreen dark backdrop (seconds)
  LAUNCH_DURATION: 1.5,     // Phase 1: Rocket launching from bottom-left to top-right (seconds)
  LANDING_DURATION: 0.7,    // Phase 2: Landing deceleration & surface impact burst (seconds)
  REVEAL_DURATION: 2.3,     // Phase 3: Golden text status scaling reveal & stellar celebration (seconds)
  FADE_OUT_DURATION: 0.8,   // Phase 4: Smooth fade-out of all elements before completion (seconds)
};

interface LevelUpAnimationProps {
  newLevel: string;
  onComplete: () => void;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  flickerSpeed: number;
  maxAlpha: number;
}

interface Particle {
  id: number;
  type: 'flame' | 'smoke' | 'impact' | 'celebration';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;      // current life remaining (seconds)
  maxLife: number;   // total life duration (seconds)
  oscillation?: number;
  oscillationSpeed?: number;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({ newLevel, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  const [hasLanded, setHasLanded] = useState(false);
  const [showLightWave, setShowLightWave] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Animation timeline tracking
  const startTime = useRef<number | null>(null);
  const lastTime = useRef<number>(performance.now());
  const animationFrameId = useRef<number | null>(null);

  // Particle list & ambient star list
  const stars = useRef<Star[]>([]);
  const particles = useRef<Particle[]>([]);
  const hasLandedTriggered = useRef(false);
  const hasLightWaveTriggered = useRef(false);
  const hasStatusTriggered = useRef(false);

  // Resize listener
  const dims = useRef({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize dynamically to update coordinates accurately
  useEffect(() => {
    const handleResize = () => {
      dims.current = { width: window.innerWidth, height: window.innerHeight };
      if (canvasRef.current) {
        canvasRef.current.width = dims.current.width;
        canvasRef.current.height = dims.current.height;
      }
      initStars();
    };

    const initStars = () => {
      const { width, height } = dims.current;
      const starCount = Math.floor((width * height) / 12000);
      const generatedStars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        generatedStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.5 + Math.random() * 1.8,
          alpha: 0.2 + Math.random() * 0.8,
          flickerSpeed: 0.005 + Math.random() * 0.015 * (Math.random() > 0.5 ? 1 : -1),
          maxAlpha: 0.4 + Math.random() * 0.6,
        });
      }
      stars.current = generatedStars;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Launch timing & loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define cubic Bezier points based on dynamic dimensions to avoid hardcoding
    const getBezierPoints = () => {
      const { width, height } = dims.current;
      return {
        P0: { x: -80, y: height + 80 },                               // bottom-left offscreen
        P1: { x: width * 0.25, y: height * 0.7 },                     // curve control point 1
        P2: { x: width * 0.55, y: height * 0.22 },                     // curve control point 2
        P3: { x: width - 150, y: 150 },                               // moon landing zone (top-right)
      };
    };

    // Ease in out cubic for beautiful, smooth acceleration and deceleration of the trajectory
    const easeInOutCubic = (x: number): number => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    const spawnTrailParticles = (x: number, y: number, angleRad: number) => {
      // Direction opposing rocket thrust (180 degrees backward + random dispersion)
      const oppositeAngle = angleRad + Math.PI;
      const count = 3;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 0.4;
        const currentAngle = oppositeAngle + spread;
        const speed = 2 + Math.random() * 5;
        particles.current.push({
          id: Math.random(),
          type: Math.random() > 0.45 ? 'flame' : 'smoke',
          x,
          y,
          vx: Math.cos(currentAngle) * speed + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(currentAngle) * speed + (Math.random() - 0.5) * 0.5,
          color: Math.random() > 0.4 ? '#f97316' : '#eab308', // orange / amber
          size: 2.5 + Math.random() * 4,
          alpha: 1,
          life: 0.3 + Math.random() * 0.4,
          maxLife: 0.7,
        });
      }
    };

    const triggerLandingImpact = (x: number, y: number) => {
      for (let i = 0; i < 75; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 8;
        particles.current.push({
          id: Math.random(),
          type: 'impact',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: i % 3 === 0 ? '#67e8f9' : i % 3 === 1 ? '#fef08a' : '#f8fafc', // cool white, yellow and soft blue-cyan
          size: 1.5 + Math.random() * 3,
          alpha: 1.0,
          life: 0.8 + Math.random() * 0.8,
          maxLife: 1.6,
        });
      }
    };

    const triggerCelebrationParticles = () => {
      // Celebration dust drifts slowly upwards from the bottom/center
      const { width, height } = dims.current;
      if (Math.random() < 0.28) {
        particles.current.push({
          id: Math.random(),
          type: 'celebration',
          x: width * 0.25 + Math.random() * width * 0.5,
          y: height + 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(1.0 + Math.random() * 2.2),
          color: Math.random() > 0.5 ? '#f59e0b' : '#c084fc', // gold and high-end purple sparkles
          size: 1.2 + Math.random() * 2.5,
          alpha: 0.85,
          life: 2.5 + Math.random() * 1.5,
          maxLife: 4.0,
          oscillation: Math.random() * Math.PI * 2,
          oscillationSpeed: 0.015 + Math.random() * 0.025,
        });
      }
    };

    // Frame-rate independent update function
    const updateAndDraw = (dt: number, elapsed: number) => {
      ctx.clearRect(0, 0, dims.current.width, dims.current.height);

      // 1. Render and twinkle starry sky
      stars.current.forEach(star => {
        star.alpha += star.flickerSpeed;
        if (star.alpha > star.maxAlpha || star.alpha < 0.1) {
          star.flickerSpeed = -star.flickerSpeed;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(star.alpha, 1))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Physics & rendering loop for all active dust particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life -= dt;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        // Apply motion vectors
        p.x += p.vx;
        p.y += p.vy;

        // Apply special sinusoidal oscillation of cosmic dust
        if (p.type === 'celebration' && p.oscillation !== undefined && p.oscillationSpeed !== undefined) {
          p.oscillation += p.oscillationSpeed;
          p.x += Math.sin(p.oscillation) * 0.6;
        }

        const lifeRatio = Math.max(0, Math.min(p.life / p.maxLife, 1));
        ctx.save();

        if (p.type === 'flame') {
          // Inner core cooling behavior
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'smoke') {
          // Grey/slate expanding smoke trail
          ctx.fillStyle = `rgba(100, 116, 139, ${lifeRatio * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (2 - lifeRatio), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'impact') {
          // Sharp impact burst particles
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'celebration') {
          // Golden floating nodes
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    // Main loops
    const tick = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = (timestamp - startTime.current) / 1000;
      
      const now = performance.now();
      const dt = Math.min((now - lastTime.current) / 1000, 0.1); // cap dt at 100ms to preserve physics stability
      lastTime.current = now;

      // Calculate screen shake for high intensity takeoff (first 0.35s)
      if (elapsed < 0.35 && containerRef.current) {
        const shakeIntensity = (1 - elapsed / 0.35) * 4.5; // Starts at 4.5px decay
        const sx = (Math.random() - 0.5) * shakeIntensity;
        const sy = (Math.random() - 0.5) * shakeIntensity;
        containerRef.current.style.transform = `translate(${sx}px, ${sy}px)`;
      } else if (containerRef.current) {
        containerRef.current.style.transform = 'translate(0px, 0px)';
      }

      const { P0, P1, P2, P3 } = getBezierPoints();

      // ==========================================
      // TIMELINE EXECUTION ORCHESTRATION
      // ==========================================

      // Phase 1: Rocket trajectory flight
      if (elapsed < TIMING.LAUNCH_DURATION) {
        const flightRatio = elapsed / TIMING.LAUNCH_DURATION;
        const t = easeInOutCubic(flightRatio);

        // Position on cubic bezier
        const mt = 1 - t;
        const posX = Math.pow(mt, 3) * P0.x + 3 * Math.pow(mt, 2) * t * P1.x + 3 * mt * Math.pow(t, 2) * P2.x + Math.pow(t, 3) * P3.x;
        const posY = Math.pow(mt, 3) * P0.y + 3 * Math.pow(mt, 2) * t * P1.y + 3 * mt * Math.pow(t, 2) * P2.y + Math.pow(t, 3) * P3.y;

        // Tangent slope of cubic bezier curve
        const dx = 3 * mt * mt * (P1.x - P0.x) + 6 * mt * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x);
        const dy = 3 * mt * mt * (P1.y - P0.y) + 6 * mt * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y);
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = (angleRad * 180) / Math.PI + 90; // Offset by 90 since rocket faces vertical UP

        if (rocketRef.current) {
          rocketRef.current.style.transform = `translate(${posX}px, ${posY}px) rotate(${angleDeg}deg) scale(1)`;
          rocketRef.current.style.opacity = '1';
        }

        spawnTrailParticles(posX, posY, angleRad);
      } 
      // Phase 2: Decelerate, Land & Impact (1.5s to 2.2s)
      else if (elapsed >= TIMING.LAUNCH_DURATION && elapsed < TIMING.LAUNCH_DURATION + TIMING.LANDING_DURATION) {
        if (!hasLandedTriggered.current) {
          hasLandedTriggered.current = true;
          setHasLanded(true);
          triggerLandingImpact(P3.x, P3.y);
        }

        // Lock rocket on Moon surface, fade out rocket flame nozzle inside the loop
        if (rocketRef.current) {
          // Park settled rocket & blend it gently
          const parkFade = Math.max(0, 1 - (elapsed - TIMING.LAUNCH_DURATION) / 0.45);
          rocketRef.current.style.transform = `translate(${P3.x}px, ${P3.y}px) rotate(45deg) scale(${0.75 + parkFade * 0.25})`;
          rocketRef.current.style.opacity = `${parkFade}`;
        }
      } 
      // Phase 3 & 4: Status golden text reveal & celebration sparkles (2.2s onwards)
      else {
        // Trigger light expansion wave
        if (!hasLightWaveTriggered.current) {
          hasLightWaveTriggered.current = true;
          setShowLightWave(true);
        }

        // Trigger major typography reveal
        if (elapsed >= TIMING.LAUNCH_DURATION + TIMING.LANDING_DURATION + 0.15 && !hasStatusTriggered.current) {
          hasStatusTriggered.current = true;
          setShowStatus(true);
        }

        // Constantly float celebration dust
        triggerCelebrationParticles();
      }

      // Check for fade out trigger before onComplete
      const totalActiveTime = TIMING.LAUNCH_DURATION + TIMING.LANDING_DURATION + TIMING.REVEAL_DURATION;
      if (elapsed >= totalActiveTime && !isFadingOut) {
        setIsFadingOut(true);
      }

      // Trigger final onComplete callback
      if (elapsed >= totalActiveTime + TIMING.FADE_OUT_DURATION) {
        onComplete();
        return;
      }

      updateAndDraw(dt, elapsed);
      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onComplete, isFadingOut]);

  // Handle sudden skip
  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isFadingOut ? 0.3 : TIMING.FADE_IN_DURATION }}
        id="level-up-container"
        className="fixed inset-0 z-[99999] bg-[#000005] overflow-hidden flex flex-col items-center justify-center font-sans select-none"
      >
        {/* Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Skip Animation Toggle */}
        <button
          type="button"
          id="btn-skip-animation"
          onClick={handleSkip}
          className="absolute top-6 right-6 z-[100000] flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/12 border border-white/10 rounded-full text-slate-350 hover:text-white text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
        >
          <span>Pular Animação</span>
          <Icons.ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Glowing Ambient Core Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#000005]/80 to-[#000005] pointer-events-none" />

        {/* ==========================================
            Moon Target (Floating Top-Right)
           ========================================== */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: 100,
            right: 100,
            transform: 'translate(50%, -50%)',
          }}
        >
          <motion.div
            animate={hasLanded ? {
              scale: 1.1,
              boxShadow: "0 0 55px rgba(56, 189, 248, 0.6)"
            } : {
              scale: 1,
              boxShadow: "0 0 25px rgba(186, 230, 253, 0.15)"
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 12,
            }}
            id="luna-moon"
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center overflow-hidden border border-slate-100/10 pointer-events-none relative shadow-2xl"
          >
            {/* Moon Surface craters details */}
            <div className="absolute top-4 left-6 w-5 h-4 rounded-full bg-slate-300 opacity-60 shadow-inner" />
            <div className="absolute top-12 left-10 w-7 h-5 rounded-full bg-slate-300 opacity-55 shadow-inner" />
            <div className="absolute top-16 left-3 w-4 h-3 rounded-full bg-slate-300 opacity-50 shadow-inner" />
            <div className="absolute top-6 left-16 w-3 h-2 rounded-full bg-slate-300 opacity-40 shadow-inner" />
            <div className="absolute top-14 left-18 w-5 h-4 rounded-full bg-slate-300 opacity-65 shadow-inner" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Elegant level tag emerging from the Moon coordinates upon landing collision */}
          <AnimatePresence>
            {hasLanded && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: 0.05
                }}
                className="mt-3 px-3 py-1.5 bg-gradient-to-r from-sky-500/30 to-indigo-500/35 border border-sky-400/40 rounded-xl flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-sky-950/40"
              >
                <Icons.Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                  NÍVEL: <span className="text-amber-350">{newLevel}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expansive shockwave ring upon impact */}
        {showLightWave && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 18, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute rounded-full border border-sky-400/40 pointer-events-none mix-blend-screen"
            style={{
              width: 100,
              height: 100,
              top: 100,
              right: 100,
              transform: 'translate(50%, -50%)',
            }}
          />
        )}

        {/* ==========================================
            Rocket SVG Model (Dynamically Managed)
           ========================================== */}
        <div
          ref={rocketRef}
          id="level-up-rocket"
          className="absolute w-12 h-16 origin-center pointer-events-none opacity-0"
          style={{ left: -24, top: -32 }}
        >
          <div className="relative flex flex-col items-center">
            {/* SVG custom rocket mesh */}
            <svg
              width="44"
              height="64"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            >
              {/* Wings */}
              <path d="M4 22L1 28C1 28 3 29 5 28L6 23" fill="#ef4444" />
              <path d="M20 22L23 28C23 28 21 29 19 28L18 23" fill="#ef4444" />
              {/* Nose cone */}
              <path d="M12 2C12 2 8 8 8 12H16C16 8 12 2 12 2Z" fill="#ef4444" />
              {/* Body */}
              <rect x="8" y="12" width="8" height="15" rx="3.5" fill="#f8fafc" />
              {/* Cabin window */}
              <circle cx="12" cy="18" r="2.2" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="0.6" />
              {/* Thruster nozzle */}
              <rect x="10" y="27" width="4" height="2" fill="#475569" />
            </svg>

            {/* Pulsing engine flame overlay */}
            <div className="absolute top-[28px]">
              <motion.svg
                width="14"
                height="28"
                viewBox="0 0 16 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{
                  scaleY: [1.0, 1.4, 0.85, 1.25, 0.95, 1.15],
                  scaleX: [1.0, 1.15, 0.9, 1.1, 0.95, 1.05],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.12,
                  ease: "easeInOut",
                }}
                className="origin-top"
              >
                <path d="M8 30C14 20 14 0 8 0C2 0 2 20 8 30Z" fill="url(#coreFlameGrad)" />
                <path d="M8 20C11 14 11 0 8 0C5 0 5 14 8 20Z" fill="url(#coreInnerFlameGrad)" />
                <defs>
                  <linearGradient id="coreFlameGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="60%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="coreInnerFlameGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </div>
        </div>

        {/* ==========================================
            Status Reveal (Phase 3 Overlay Center)
           ========================================== */}
        {showStatus && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 14,
            }}
            id="level-up-details"
            className="relative z-10 flex flex-col items-center justify-center text-center space-y-5 px-6"
          >
            {/* Small Header */}
            <motion.span
              initial={{ letterSpacing: "0.15em", opacity: 0, y: 15 }}
              animate={{ letterSpacing: "0.3em", opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.75 }}
              className="text-xs md:text-sm font-black text-sky-400 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]"
            >
              PARABÉNS! NOVO NÍVEL ALCANÇADO
            </motion.span>

            {/* Display status label with golden/ice white text gradient */}
            <motion.h2
              initial={{ filter: "blur(8px)", y: 25 }}
              animate={{ filter: "blur(0px)", y: 0 }}
              transition={{ delay: 0.45, duration: 0.9 }}
              className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-100 font-sans tracking-tight py-2 drop-shadow-[0_0_35px_rgba(251,191,36,0.4)]"
            >
              {newLevel}
            </motion.h2>

            {/* Sub-card explaining meaning of status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7 }}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg shadow-amber-950/20"
            >
              <Icons.Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs text-amber-200 font-extrabold tracking-wide uppercase">
                Você subiu na escala de maturidade IA da Luna
              </span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
