import { useEffect, useRef, useState } from 'react';

type LoadingScreenProps = {
  onFinish: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  explosionVx: number;
  explosionVy: number;
  attraction: number;
  isDot?: boolean;
  dotPhase?: number;
};

const PARTICLE_COUNT = 130;
const COLORS = ['#ffffff', '#ffe29c', '#9d52ff'];
const DOT_COLOR = '#ffe29c';

// Fase 0: flotación | Fase 1: convergencia | Fase 2: explosión | Fase 3: fade
const PHASE_DURATIONS = [2800, 2400, 600, 500];

const easeOutQuad = (t: number) => t * (2 - t);
const easeInOutQuad = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const createParticle = (width: number, height: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.003 + Math.random() * 0.006;

  const colorChance = Math.random();
  let color = COLORS[0];
  if (colorChance > 0.96) color = COLORS[2];
  else if (colorChance > 0.78) color = COLORS[1];

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.8 + Math.random() * 2,
    color,
    alpha: 0.4 + Math.random() * 0.6,
    explosionVx: 0,
    explosionVy: 0,
    attraction: 0.00008 + Math.random() * 0.00004,
  };
};

const createDot = (index: number, width: number, height: number): Particle => {
  const spacing = 36;
  const centerX = width / 2;
  const centerY = height / 2;
  const offsetX = (index - 1) * spacing;

  return {
    x: centerX + offsetX,
    y: centerY,
    vx: 0,
    vy: 0,
    size: 6,
    color: DOT_COLOR,
    alpha: 1,
    explosionVx: 0,
    explosionVy: 0,
    attraction: 0.00018,
    isDot: true,
    dotPhase: index * (Math.PI * 2 / 3),
  };
};

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef(0);
  const startTimeRef = useRef(0);
  const phaseStartRef = useRef(0);
  const fadeAlphaRef = useRef(1);
  const lastTimestampRef = useRef(0);
  const explosionInitializedRef = useRef(false);

  const [showDots, setShowDots] = useState(true);
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const stars = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(window.innerWidth, window.innerHeight)
      );
      const dots = [0, 1, 2].map((i) =>
        createDot(i, window.innerWidth, window.innerHeight)
      );
      particlesRef.current = [...stars, ...dots];
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    phaseRef.current = 0;
    startTimeRef.current = 0;
    phaseStartRef.current = 0;
    fadeAlphaRef.current = 1;
    lastTimestampRef.current = 0;
    explosionInitializedRef.current = false;

    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        phaseStartRef.current = timestamp;
        lastTimestampRef.current = timestamp;
      }

      const dt = Math.min(timestamp - lastTimestampRef.current, 40);
      lastTimestampRef.current = timestamp;

      const particles = particlesRef.current;
      const elapsedPhase = timestamp - phaseStartRef.current;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const phase = phaseRef.current;

      // ── FASE 0: flotación libre, dots HTML visibles ───────────────────────
      if (phase === 0) {
        particles.forEach((p) => {
          if (p.isDot) return;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x <= 0 || p.x >= window.innerWidth) p.vx *= -1;
          if (p.y <= 0 || p.y >= window.innerHeight) p.vy *= -1;
        });

        if (elapsedPhase >= PHASE_DURATIONS[0]) {
          // Sincronizar posición de dots al centro antes de convergencia
          particlesRef.current.forEach((p, i) => {
            if (!p.isDot) return;
            const dotI = i - PARTICLE_COUNT;
            const spacing = 36;
            p.x = centerX + (dotI - 1) * spacing;
            p.y = centerY;
            p.vx = 0;
            p.vy = 0;
          });
          setShowDots(false);
          phaseRef.current = 1;
          phaseStartRef.current = timestamp;
        }

      // ── FASE 1: convergencia lenta y fluida ──────────────────────────────
      } else if (phase === 1) {
        const duration = PHASE_DURATIONS[1];
        const t = easeInOutQuad(Math.min(elapsedPhase / duration, 1));

        particles.forEach((p) => {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const attraction = p.attraction * (1 + t * 2.5);
          p.vx += (dx / distance) * attraction * dt;
          p.vy += (dy / distance) * attraction * dt;
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.isDot) {
            p.alpha = 1;
            p.size = 6 * (1 - t * 0.3);
          } else {
            p.alpha = Math.max(0.15, 1 - t * 0.35);
          }
        });

        if (elapsedPhase >= duration) {
          phaseRef.current = 2;
          phaseStartRef.current = timestamp;
        }

      // ── FASE 2: EXPLOSIÓN ────────────────────────────────────────────────
      } else if (phase === 2) {
        if (!explosionInitializedRef.current) {
          explosionInitializedRef.current = true;
          particles.forEach((p) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = p.isDot
              ? 1.2 + Math.random() * 0.8
              : 0.6 + Math.random() * 0.9;
            p.explosionVx = Math.cos(angle) * speed;
            p.explosionVy = Math.sin(angle) * speed;
            p.x = centerX;
            p.y = centerY;
            p.alpha = 1;
            if (p.isDot) p.size = 7;
          });
        }

        const duration = PHASE_DURATIONS[2];
        particles.forEach((p) => {
          p.x += p.explosionVx * dt * 0.6;
          p.y += p.explosionVy * dt * 0.6;
          p.alpha = Math.max(0, 1 - elapsedPhase / duration);
        });

        if (elapsedPhase >= duration) {
          phaseRef.current = 3;
          phaseStartRef.current = timestamp;
        }

      // ── FASE 3: fade out ─────────────────────────────────────────────────
      } else {
        const duration = PHASE_DURATIONS[3];
        const t = Math.min(elapsedPhase / duration, 1);
        fadeAlphaRef.current = 1 - easeOutQuad(t);

        if (elapsedPhase >= duration) {
          window.removeEventListener('resize', setCanvasSize);
          cancelAnimationFrame(rafId);
          onFinish();
          return;
        }
      }

      // ── DIBUJO ───────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#060610';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((p) => {
        if (phase === 0 && p.isDot) return;

        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.isDot) {
          ctx.shadowColor = '#ffe29c';
          ctx.shadowBlur = 16;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (phase === 3) {
        ctx.fillStyle = `rgba(6, 6, 16, ${1 - fadeAlphaRef.current})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(rafId);
    };
  }, [onFinish]);

  const dots = [0, 1, 2];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#060610]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {showDots && (
        <div className="relative z-10 flex items-center gap-[20px]">
          {dots.map((i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: DOT_COLOR,
                opacity: dotIndex === i ? 1 : 0.28,
                boxShadow:
                  dotIndex === i ? '0 0 10px 3px #ffe29c88' : 'none',
                transition: 'opacity 0.35s ease, box-shadow 0.35s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}