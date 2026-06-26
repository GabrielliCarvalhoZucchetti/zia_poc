import React from 'react';
import { motion } from 'motion/react';

interface PremiumRankBadgeProps {
  level: string; // 'AI Starter' | 'AI User' | 'AI Builder' | 'AI Champion' (case insensitive or partial)
  size?: number; // width and height in px, defaults to 120
  className?: string;
}

export const PremiumRankBadge: React.FC<PremiumRankBadgeProps> = ({ level, size = 120, className = "" }) => {
  const normLevel = level.toLowerCase().trim();

  // Pick correct SVG render based on level
  if (normLevel.includes('starter')) {
    return <AIStarterBadge size={size} className={className} />;
  } else if (normLevel.includes('user')) {
    return <AIUserBadge size={size} className={className} />;
  } else if (normLevel.includes('builder')) {
    return <AIBuilderBadge size={size} className={className} />;
  } else if (normLevel.includes('champion') || normLevel.includes('vencedor') || normLevel.includes('campeão')) {
    return <AIChampionBadge size={size} className={className} />;
  }

  // Fallback to Starter if unknown
  return <AIStarterBadge size={size} className={className} />;
};

// ============================================================================
// 1. AI STARTER BADGE (Simple, graphite & matte silver, small blue core)
// ============================================================================
const AIStarterBadge: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
    <motion.div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(59,130,246,0.15)]"
      >
        <defs>
          {/* Metallic Gradients */}
          <linearGradient id="starterMetalDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="starterMetalSilver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <radialGradient id="starterCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </radialGradient>
          
          {/* Sheen clip-path for passing metallic reflection */}
          <clipPath id="starterClip">
            <path d="M100 25 L155 70 L140 145 L100 175 L60 145 L45 70 Z" />
          </clipPath>

          <filter id="starterSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. OUTER METALLIC FLAPS / WINGS */}
        <path
          d="M100 20 L160 65 L145 150 L100 180 L55 150 L40 65 Z"
          fill="url(#starterMetalDark)"
          stroke="url(#starterMetalSilver)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Plate */}
        <path
          d="M100 30 L150 71 L136 141 L100 168 L64 141 L50 71 Z"
          fill="#1e293b"
          stroke="url(#starterMetalSilver)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 2. SYMMETRICAL CIRCUIT PATHS */}
        <path
          d="M75 130 L90 115 L90 85 M125 130 L110 115 L110 85"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <path
          d="M100 165 L100 115"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* 3. SHINING EDGES RUNNING PATHS */}
        <motion.path
          d="M100 30 L150 71 L136 141 L100 168 L64 141 L50 71 Z"
          stroke="#60a5fa"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 5px #3b82f6)"
          initial={{ strokeDasharray: "45 175", strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -220 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M100 30 L150 71 L136 141 L100 168 L64 141 L50 71 Z"
          stroke="#93c5fd"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 8px #60a5fa)"
          initial={{ strokeDasharray: "30 190", strokeDashoffset: 110 }}
          animate={{ strokeDashoffset: -110 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />

        {/* 4. METALLIC REFLECTION SWIPE */}
        <g clipPath="url(#starterClip)">
          <motion.rect
            x="-120"
            y="0"
            width="80"
            height="220"
            fill="rgba(255, 255, 255, 0.12)"
            transform="rotate(25)"
            animate={{ x: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
          />
        </g>

        {/* 5. BLUE GLOWING CORE */}
        <g filter="url(#starterSoftGlow)">
          <motion.circle
            cx="100"
            cy="100"
            r="22"
            fill="url(#starterCoreGlow)"
            animate={{ scale: [0.93, 1.07, 0.93], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="100" cy="100" r="7" fill="#93c5fd" />
        </g>

        {/* 6. ORBITING PARTICLES */}
        <motion.g
          animate={{ rotate: 360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
        >
          <circle cx="100" cy="45" r="3.5" fill="#60a5fa" filter="drop-shadow(0 0 5px #3b82f6)" />
          <circle cx="65" cy="145" r="2.5" fill="#93c5fd" filter="drop-shadow(0 0 4px #60a5fa)" />
          <circle cx="135" cy="55" r="3" fill="#2563eb" filter="drop-shadow(0 0 4px #1d4ed8)" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

// ============================================================================
// 2. AI USER BADGE (Silver & electric blue, robust, lateral crystals)
// ============================================================================
const AIUserBadge: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
    <motion.div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_20px_rgba(6,182,212,0.25)]"
      >
        <defs>
          {/* Silver Gradients */}
          <linearGradient id="userSilverLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="userSilverDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          {/* Electric Blue Core */}
          <radialGradient id="userCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="45%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#0891b2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
          </radialGradient>
          
          <clipPath id="userClip">
            <path d="M100 15 L165 55 L150 145 L100 185 L50 145 L35 55 Z" />
          </clipPath>

          <filter id="userBrightGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. DOUBLE-LAYERED WINGS / SIDE PLATES */}
        {/* Back wings */}
        <path
          d="M40 70 L20 100 L45 135 L65 120 Z M160 70 L180 100 L155 135 L135 120 Z"
          fill="url(#userSilverDark)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Outer Robust Crest Shield */}
        <path
          d="M100 15 L165 55 L150 145 L100 185 L50 145 L35 55 Z"
          fill="url(#userSilverDark)"
          stroke="url(#userSilverLight)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Lateral Cyan Crystals */}
        <path
          d="M32 80 L18 102 L32 124 L42 102 Z"
          fill="#06b6d4"
          opacity="0.9"
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />
        <path
          d="M168 80 L182 102 L168 124 L158 102 Z"
          fill="#06b6d4"
          opacity="0.9"
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />

        {/* Inner Plate */}
        <path
          d="M100 26 L152 61 L139 135 L100 171 L61 135 L48 61 Z"
          fill="#0f172a"
          stroke="url(#userSilverLight)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 2. ELECTRIC CIRCUIT SYSTEM */}
        <path
          d="M65 80 L85 100 L100 100 M135 80 L115 100 L100 100 M100 135 L100 160"
          stroke="#0891b2"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Pulsing overlay circuit */}
        <motion.path
          d="M65 80 L85 100 L100 100"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M135 80 L115 100 L100 100"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* 3. BORDER SHINE ANIMATION */}
        <motion.path
          d="M100 26 L152 61 L139 135 L100 171 L61 135 L48 61 Z"
          stroke="#22d3ee"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 6px #06b6d4)"
          initial={{ strokeDasharray: "70 210", strokeDashoffset: 40 }}
          animate={{ strokeDashoffset: -240 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M100 26 L152 61 L139 135 L100 171 L61 135 L48 61 Z"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 10px #22d3ee)"
          initial={{ strokeDasharray: "40 240", strokeDashoffset: 160 }}
          animate={{ strokeDashoffset: -120 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* 4. METALLIC SHEEN OVERLAY */}
        <g clipPath="url(#userClip)">
          <motion.rect
            x="-130"
            y="-10"
            width="90"
            height="240"
            fill="rgba(255, 255, 255, 0.16)"
            transform="rotate(30)"
            animate={{ x: [0, 380] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
        </g>

        {/* 5. CYRILLIC CORE PULSAR */}
        <g filter="url(#userBrightGlow)">
          <motion.circle
            cx="100"
            cy="100"
            r="28"
            fill="url(#userCoreGlow)"
            animate={{ scale: [0.94, 1.06, 0.94], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Faceted Core Crystal */}
          <path
            d="M100 87 L111 95 L111 105 L100 113 L89 105 L89 95 Z"
            fill="#e2e8f0"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          <path
            d="M100 87 L100 113 M89 95 L111 105 M89 105 L111 95"
            stroke="#0891b2"
            strokeWidth="0.8"
          />
          <circle cx="100" cy="100" r="4.5" fill="#ffffff" />
        </g>

        {/* 6. ENERGY FLOW PARTICLES */}
        <motion.g
          animate={{ rotate: -360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "linear" }}
        >
          <circle cx="100" cy="35" r="4" fill="#22d3ee" filter="drop-shadow(0 0 6px #06b6d4)" />
          <circle cx="100" cy="165" r="3" fill="#e2e8f0" filter="drop-shadow(0 0 4px #22d3ee)" />
          <circle cx="35" cy="100" r="3.5" fill="#06b6d4" filter="drop-shadow(0 0 6px #0891b2)" />
          <circle cx="165" cy="100" r="3" fill="#ffffff" filter="drop-shadow(0 0 5px #ffffff)" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

// ============================================================================
// 3. AI BUILDER BADGE (Platinum/purple/cyan, large wings, tech circuits)
// ============================================================================
const AIBuilderBadge: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
    <motion.div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)]"
      >
        <defs>
          {/* Platinum / White Gold Gradients */}
          <linearGradient id="builderPlatinum" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          {/* Tech Purple & Cyan Gradients */}
          <linearGradient id="builderPurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <radialGradient id="builderCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="1" />
            <stop offset="25%" stopColor="#d8b4fe" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
          </radialGradient>

          <clipPath id="builderClip">
            <path d="M100 12 L172 52 L155 148 L100 190 L45 148 L28 52 Z" />
          </clipPath>

          <filter id="builderEpicGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. EXTENDED FUTURISTIC CYBERNETIC WINGS */}
        <g opacity="0.95">
          {/* Left Wing Upper */}
          <path d="M40 50 L10 30 L5 65 L32 82 Z" fill="url(#builderPurple)" stroke="#e2e8f0" strokeWidth="1.2" />
          <path d="M30 75 L2 70 L0 100 L25 105 Z" fill="#06b6d4" stroke="#e2e8f0" strokeWidth="1.2" />
          <path d="M25 100 L5 110 L15 135 L30 122 Z" fill="url(#builderPlatinum)" stroke="#a855f7" strokeWidth="1.2" />

          {/* Right Wing Upper */}
          <path d="M160 50 L190 30 L195 65 L168 82 Z" fill="url(#builderPurple)" stroke="#e2e8f0" strokeWidth="1.2" />
          <path d="M170 75 L198 70 L200 100 L175 105 Z" fill="#06b6d4" stroke="#e2e8f0" strokeWidth="1.2" />
          <path d="M175 100 L195 110 L185 135 L170 122 Z" fill="url(#builderPlatinum)" stroke="#a855f7" strokeWidth="1.2" />
        </g>

        {/* Shield Frame */}
        <path
          d="M100 12 L172 52 L155 148 L100 190 L45 148 L28 52 Z"
          fill="#111827"
          stroke="url(#builderPlatinum)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Symmetrical glowing neon purple inlay lines */}
        <path
          d="M48 54 L100 14 L152 54 L137 142 L100 182 L63 142 Z"
          stroke="url(#builderPurple)"
          strokeWidth="1.5"
          strokeDasharray="12 6"
          opacity="0.75"
        />

        {/* Inner Plate */}
        <path
          d="M100 24 L158 58 L143 138 L100 176 L57 138 L42 58 Z"
          fill="#030712"
          stroke="url(#builderPlatinum)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 2. ADVANCED CIRCUITS */}
        <path
          d="M60 70 L90 70 L100 85 M140 70 L110 70 L100 85 M100 120 L100 155 L75 155 M100 155 L125 155"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M70 70 L85 70 M130 70 L115 70"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Symmetrical energy dots pulsing */}
        <motion.circle cx="90" cy="70" r="2.5" fill="#22d3ee" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        <motion.circle cx="110" cy="70" r="2.5" fill="#22d3ee" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.55 }} />

        {/* 3. BORDER BEAM SHINE */}
        <motion.path
          d="M100 24 L158 58 L143 138 L100 176 L57 138 L42 58 Z"
          stroke="#a855f7"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 8px #c084fc)"
          initial={{ strokeDasharray: "80 250", strokeDashoffset: 60 }}
          animate={{ strokeDashoffset: -330 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M100 24 L158 58 L143 138 L100 176 L57 138 L42 58 Z"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 12px #06b6d4)"
          initial={{ strokeDasharray: "50 280", strokeDashoffset: 195 }}
          animate={{ strokeDashoffset: -195 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />

        {/* 4. METALLIC SWEET REFLECTION */}
        <g clipPath="url(#builderClip)">
          <motion.rect
            x="-140"
            y="-20"
            width="100"
            height="260"
            fill="rgba(255, 255, 255, 0.2)"
            transform="rotate(35)"
            animate={{ x: [0, 420] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
          />
        </g>

        {/* 5. ELABORATED HIGH-POWER CORE */}
        <g filter="url(#builderEpicGlow)">
          <motion.circle
            cx="100"
            cy="100"
            r="32"
            fill="url(#builderCoreGlow)"
            animate={{ scale: [0.93, 1.07, 0.93], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Symmetrical Gem Crystal */}
          <path
            d="M100 82 L116 100 L100 118 L84 100 Z"
            fill="#cbd5e1"
            stroke="#a855f7"
            strokeWidth="1.8"
          />
          {/* Sparkling inner Core */}
          <path
            d="M100 88 L110 100 L100 112 L90 100 Z"
            fill="url(#builderPurple)"
            stroke="#06b6d4"
            strokeWidth="1"
          />
          <circle cx="100" cy="100" r="5" fill="#ffffff" filter="drop-shadow(0 0 4px #c084fc)" />
        </g>

        {/* 6. DOUBLE ROTATING SMART PARTICLES */}
        {/* Ring 1 Clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <circle cx="100" cy="32" r="4.5" fill="#06b6d4" filter="drop-shadow(0 0 7px #22d3ee)" />
          <circle cx="45" cy="145" r="3" fill="#c084fc" filter="drop-shadow(0 0 5px #a855f7)" />
          <circle cx="145" cy="55" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        </motion.g>
        {/* Ring 2 Counter-Clockwise */}
        <motion.g
          animate={{ rotate: -360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <circle cx="100" cy="168" r="4" fill="#a855f7" filter="drop-shadow(0 0 7px #d8b4fe)" />
          <circle cx="168" cy="100" r="3" fill="#22d3ee" filter="drop-shadow(0 0 5px #06b6d4)" />
          <circle cx="32" cy="100" r="3.5" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

// ============================================================================
// 4. AI CHAMPION BADGE (Ouro polido, massive golden wings, white-gold core)
// ============================================================================
const AIChampionBadge: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
    <motion.div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_32px_rgba(234,179,8,0.45)]"
      >
        <defs>
          {/* Polished Gold Gradients */}
          <linearGradient id="champGoldLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="champGoldDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="40%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          {/* Radiant white-gold core */}
          <radialGradient id="champCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </radialGradient>

          <clipPath id="champClip">
            <path d="M100 10 L178 50 L160 152 L100 195 L40 152 L22 50 Z" />
          </clipPath>

          <filter id="champCinematicGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. ROTATING GOLDEN HALO / SUNBURST */}
        <motion.g
          animate={{ rotate: 360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          opacity="0.95"
        >
          {/* Symmetrical Sunburst Halo elements */}
          <circle cx="100" cy="100" r="70" stroke="url(#champGoldLight)" strokeWidth="2.5" strokeDasharray="20 10" filter="drop-shadow(0 0 5px #eab308)" />
          <circle cx="100" cy="100" r="76" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 25" opacity="0.6" />
          <path d="M100 20 L100 8 M100 180 L100 192 M20 100 L8 100 M180 100 L192 100" stroke="url(#champGoldLight)" strokeWidth="4" strokeLinecap="round" filter="drop-shadow(0 0 6px #ca8a04)" />
          <path d="M43 43 L34 34 M157 157 L166 166 M43 157 L34 166 M157 43 L166 34" stroke="url(#champGoldLight)" strokeWidth="3" strokeLinecap="round" filter="drop-shadow(0 0 6px #eab308)" />
        </motion.g>

        {/* 2. MAJESTIC CYBERNETIC ANGELIC WINGS */}
        <g opacity="0.95">
          {/* Symmetrical golden multi-layered wings */}
          {/* Layer 3 Back wings */}
          <path d="M28 65 L2 45 L5 85 L24 105 Z" fill="url(#champGoldDark)" stroke="#fef08a" strokeWidth="1" />
          <path d="M172 65 L198 45 L195 85 L176 105 Z" fill="url(#champGoldDark)" stroke="#fef08a" strokeWidth="1" />

          {/* Layer 2 Mid wings */}
          <path d="M24 85 L-5 70 L0 115 L22 130 Z" fill="url(#champGoldLight)" stroke="#ca8a04" strokeWidth="1.2" />
          <path d="M176 85 L205 70 L200 115 L178 130 Z" fill="url(#champGoldLight)" stroke="#ca8a04" strokeWidth="1.2" />

          {/* Layer 1 Front wings */}
          <path d="M22 110 L-10 115 L8 150 L20 142 Z" fill="url(#champGoldDark)" stroke="#fde047" strokeWidth="1.5" />
          <path d="M178 110 L210 115 L192 150 L180 142 Z" fill="url(#champGoldDark)" stroke="#fde047" strokeWidth="1.5" />
        </g>

        {/* Outer Shield Frame */}
        <path
          d="M100 10 L178 50 L160 152 L100 195 L40 152 L22 50 Z"
          fill="#0c0a09"
          stroke="url(#champGoldLight)"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Inner Deluxe Shield Inlays */}
        <path
          d="M100 20 L168 55 L151 144 L100 183 L49 144 L32 55 Z"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="18 6"
          opacity="0.8"
        />

        {/* Inner Dark Matte Plate */}
        <path
          d="M100 22 L164 56 L148 142 L100 181 L52 142 L36 56 Z"
          fill="#1c1917"
          stroke="url(#champGoldLight)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* 3. PREMIUM WHITE-GOLD CIRCUIT PATTERN */}
        <path
          d="M60 80 L80 80 L100 95 M140 80 L120 80 L100 95 M100 120 L100 162 M78 140 L100 140 L122 140"
          stroke="url(#champGoldLight)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Glowing circuit nodes */}
        <motion.circle cx="80" cy="80" r="3" fill="#ffffff" filter="drop-shadow(0 0 5px #fde047)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} />
        <motion.circle cx="120" cy="80" r="3" fill="#ffffff" filter="drop-shadow(0 0 5px #fde047)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} />

        {/* 4. CHROME SHINE RUNNING BEAM */}
        <motion.path
          d="M100 22 L164 56 L148 142 L100 181 L52 142 L36 56 Z"
          stroke="#fde047"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 10px #eab308)"
          initial={{ strokeDasharray: "100 290", strokeDashoffset: 80 }}
          animate={{ strokeDashoffset: -390 }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M100 22 L164 56 L148 142 L100 181 L52 142 L36 56 Z"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="drop-shadow(0 0 14px #fbbf24)"
          initial={{ strokeDasharray: "60 330", strokeDashoffset: 230 }}
          animate={{ strokeDashoffset: -160 }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
        />

        {/* 5. METALLIC GOLDEN SWIPE REFLECTION */}
        <g clipPath="url(#champClip)">
          <motion.rect
            x="-140"
            y="-30"
            width="110"
            height="280"
            fill="rgba(255, 255, 255, 0.25)"
            transform="rotate(32)"
            animate={{ x: [0, 440] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
        </g>

        {/* 6. CINEMATIC GLOWING WHITE-GOLD EMBODIMENT */}
        <g filter="url(#champCinematicGlow)">
          <motion.circle
            cx="100"
            cy="100"
            r="35"
            fill="url(#champCoreGlow)"
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Diamond Central Crystal Core */}
          <path
            d="M100 78 L118 100 L100 122 L82 100 Z"
            fill="#ffffff"
            stroke="url(#champGoldLight)"
            strokeWidth="2.5"
            filter="drop-shadow(0 0 8px #fde047)"
          />
          {/* Facets inside Crystal */}
          <path
            d="M100 78 L100 122 M82 100 L118 100"
            stroke="#eab308"
            strokeWidth="1.2"
          />
          <circle cx="100" cy="100" r="6" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        </g>

        {/* 7. CINEMATIC GOLD SPARKLES & PARTICLES */}
        <motion.g
          animate={{ rotate: 360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
        >
          <circle cx="100" cy="26" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 8px #ffffff)" />
          <circle cx="26" cy="100" r="3.5" fill="#fde047" filter="drop-shadow(0 0 6px #eab308)" />
          <circle cx="174" cy="100" r="3.5" fill="#fde047" filter="drop-shadow(0 0 6px #eab308)" />
        </motion.g>
        
        {/* Anti-clockwise subtle companion ring */}
        <motion.g
          animate={{ rotate: -360 }}
          style={{ originX: "100px", originY: "100px" }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        >
          <circle cx="100" cy="174" r="4" fill="#ffffff" filter="drop-shadow(0 0 8px #fef08a)" />
          <circle cx="48" cy="152" r="2.5" fill="#f59e0b" filter="drop-shadow(0 0 4px #ca8a04)" />
          <circle cx="152" cy="48" r="3" fill="#fde047" filter="drop-shadow(0 0 5px #eab308)" />
        </motion.g>
      </svg>
    </motion.div>
  );
};
