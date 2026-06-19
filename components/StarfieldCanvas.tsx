import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = container.clientWidth;
    let height = canvas.height = container.clientHeight;

    // Create stars
    const maxStars = 150;
    const stars: Star[] = [];
    
    // Star speed - extremely slow as requested (slow-mo)
    const speed = 0.5;
    const maxDepth = 1000;

    const colorsDark = [
      'rgba(255, 255, 255, 0.95)', // White
      'rgba(238, 242, 255, 0.9)',  // Light Indigo
      'rgba(224, 242, 254, 0.95)', // Cyan
      'rgba(253, 244, 215, 0.85)', // Pale Yellow
      'rgba(244, 63, 94, 0.6)',    // Soft Rose Nebula star
      'rgba(168, 85, 247, 0.65)',  // Soft Violet
    ];

    const colorsLight = [
      'rgba(14, 165, 233, 0.75)',  // Sky Blue
      'rgba(79, 70, 229, 0.75)',   // Indigo
      'rgba(168, 85, 247, 0.75)',  // Purple
      'rgba(244, 63, 94, 0.75)',   // Rose
      'rgba(12, 148, 136, 0.7)',   // Teal
    ];

    const generateStar = (isInitial = false): Star => {
      const isDark = document.documentElement.classList.contains('dark');
      const palette = isDark ? colorsDark : colorsLight;
      return {
        // x and y centered around 0
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        // z represents depth (1000 is background, 10 is very close)
        z: isInitial ? Math.random() * maxDepth : 10 + Math.random() * 50,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
      };
    };

    // Initialize stars
    for (let i = 0; i < maxStars; i++) {
      stars.push(generateStar(true));
    }

    // Handles container resize matching Responsive Design instructions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        // Update canvas sizing smoothly without resetting everything
        width = canvas.width = newWidth;
        height = canvas.height = newHeight;
      }
    });
    
    resizeObserver.observe(container);

    // Animation Loop
    const render = () => {
      const isDark = document.documentElement.classList.contains('dark');

      // Clear with background color or soft cosmic gradient
      ctx.clearRect(0, 0, width, height);

      // Create beautiful nebula gradients in the background
      if (isDark) {
        // Dark Galactic Background Glow
        const gradient = ctx.createRadialGradient(
          width / 2, height / 3, 10,
          width / 2, height / 2, Math.max(width, height)
        );
        gradient.addColorStop(0, '#090d1e');     // central deep celestial navy
        gradient.addColorStop(0.3, '#050814');   // soft obsidian indigo
        gradient.addColorStop(0.7, '#03050a');   // deep space violet-black
        gradient.addColorStop(1, '#020306');     // deep black void
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Subtly simulated glowing nebulae (cosmic dust clouds)
        const nebulaPink = ctx.createRadialGradient(
          width * 0.3, height * 0.4, 0,
          width * 0.3, height * 0.4, Math.min(width, height) * 0.5
        );
        nebulaPink.addColorStop(0, 'rgba(168, 85, 247, 0.05)'); // Soft violet glow
        nebulaPink.addColorStop(1, 'transparent');
        ctx.fillStyle = nebulaPink;
        ctx.fillRect(0, 0, width, height);

        const nebulaBlue = ctx.createRadialGradient(
          width * 0.7, height * 0.6, 0,
          width * 0.7, height * 0.6, Math.min(width, height) * 0.6
        );
        nebulaBlue.addColorStop(0, 'rgba(14, 165, 233, 0.04)'); // Soft cyan glow
        nebulaBlue.addColorStop(1, 'transparent');
        ctx.fillStyle = nebulaBlue;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Light Galactic Background Glow (Very clean, elegant, pastel space/nebula vibe)
        const gradient = ctx.createRadialGradient(
          width / 2, height / 3, 10,
          width / 2, height / 2, Math.max(width, height)
        );
        gradient.addColorStop(0, '#f0f4ff');     // light radiant sky blue
        gradient.addColorStop(0.5, '#f8fafc');   // off-white slate/silver space
        gradient.addColorStop(1, '#f1f5f9');     // light gray edge
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Light mode auroras (very subtle cosmic pastel dust)
        const lightAuroraPurple = ctx.createRadialGradient(
          width * 0.2, height * 0.3, 0,
          width * 0.2, height * 0.3, Math.min(width, height) * 0.7
        );
        lightAuroraPurple.addColorStop(0, 'rgba(219, 234, 254, 0.55)'); // Pale blue aurora
        lightAuroraPurple.addColorStop(1, 'transparent');
        ctx.fillStyle = lightAuroraPurple;
        ctx.fillRect(0, 0, width, height);

        const lightAuroraPink = ctx.createRadialGradient(
          width * 0.8, height * 0.7, 0,
          width * 0.8, height * 0.7, Math.min(width, height) * 0.6
        );
        lightAuroraPink.addColorStop(0, 'rgba(251, 207, 232, 0.18)'); // Pastel pink aurora
        lightAuroraPink.addColorStop(1, 'transparent');
        ctx.fillStyle = lightAuroraPink;
        ctx.fillRect(0, 0, width, height);
      }

      // Projection field calculations
      const fov = 350; // Field of view focal length
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move the star towards the background (increasing depth z for recession, decreasing speed for slow mo)
        // Stars sink into the background
        star.z += speed;

        // Reset star if it gets too far away (receded fully into the background)
        if (star.z >= maxDepth) {
          stars[i] = generateStar(false);
          continue;
        }

        // Project 3D coordinate to 2D
        // coordinate ranges from center towards edges.
        const px = (star.x / star.z) * fov + centerX;
        const py = (star.y / star.z) * fov + centerY;

        // If offscreen, do not draw
        if (px < 0 || px > width || py < 0 || py > height) {
          continue;
        }

        // Twinkling effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = (Math.sin(star.twinklePhase) + 1) / 2; // 0 to 1
        const currentAlpha = star.alpha * (0.3 + twinkleFactor * 0.7);

        // Size decreases as it goes deeper to represent infinite space recession
        const sizeProjection = Math.max(0.1, star.size * (1 - star.z / maxDepth));

        const isHexOrRgba = star.color.startsWith('rgba');
        let drawColor = star.color;
        
        if (isHexOrRgba) {
          // Adjust opacity dynamically
          drawColor = star.color.replace(/[\d.]+\)$/, `${currentAlpha.toFixed(2)})`);
        }

        // Render Projected Star
        ctx.beginPath();
        ctx.arc(px, py, sizeProjection, 0, Math.PI * 2);
        ctx.fillStyle = drawColor;
        
        if (isDark && sizeProjection > 1.2) {
          // Adding a nice glow effect for bigger stars in dark mode
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      }

      // Reset shadow blur to preserve memory and performance
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
    </div>
  );
};
