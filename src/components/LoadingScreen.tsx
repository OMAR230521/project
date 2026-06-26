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
  isLetter?: boolean;
};

const PARTICLE_COUNT = 130;
const COLORS = ['#ffffff', '#ffe29c', '#9d52ff'];
const WORD = 'BolaLand';

// Fase 0: flotación + letras aparecen | Fase 1: convergencia | Fase 2: explosión | Fase 3: fade
const PHASE_DURATIONS = [3200, 1700, 800, 500];

// Cada letra aparece cada N ms durante la fase 0
const LETTER_INTERVAL = 180;

const easeOutQuad = (t: number) => t * (2 - t);
const easeInQuad  = (t: number) => t * t;

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
    attraction: 0.00022 + Math.random() * 0.0001,
  };
};

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const canvasRef       = useRef<HTMLCanvasElement | null>(null);
  const particlesRef    = useRef<Particle[]>([]);
  const phaseRef        = useRef(0);
  const startTimeRef    = useRef(0);
  const phaseStartRef   = useRef(0);
  const fadeAlphaRef    = useRef(1);
  const lastTSRef       = useRef(0);
  const explodedRef     = useRef(false);

  // letras visibles en la UI (fase 0)
  const [visibleLetters, setVisibleLetters] = useState(0);
  // cuándo empezar a ocultar el texto (al arrancar convergencia)
  const [textAlpha, setTextAlpha] = useState(1);
  const [showText, setShowText]   = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initParticles = () => {
      const stars = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(window.innerWidth, window.innerHeight)
      );
      particlesRef.current = stars;
    };

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    phaseRef.current    = 0;
    startTimeRef.current  = 0;
    phaseStartRef.current = 0;
    fadeAlphaRef.current  = 1;
    lastTSRef.current     = 0;
    explodedRef.current   = false;

    // Aparición de letras: una cada LETTER_INTERVAL ms
    let letterCount = 0;
    const letterTimer = setInterval(() => {
      if (phaseRef.current !== 0) { clearInterval(letterTimer); return; }
      letterCount++;
      setVisibleLetters(letterCount);
      if (letterCount >= WORD.length) clearInterval(letterTimer);
    }, LETTER_INTERVAL);

    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current  = timestamp;
        phaseStartRef.current = timestamp;
        lastTSRef.current     = timestamp;
      }

      const dt          = Math.min(timestamp - lastTSRef.current, 40);
      lastTSRef.current = timestamp;

      const particles   = particlesRef.current;
      const elapsedPhase = timestamp - phaseStartRef.current;
      const centerX     = window.innerWidth  / 2;
      const centerY     = window.innerHeight / 2;
      const phase       = phaseRef.current;

      // ── FASE 0: estrellas flotan, letras van apareciendo ─────────────────
      if (phase === 0) {
        particles.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x <= 0 || p.x >= window.innerWidth)  p.vx *= -1;
          if (p.y <= 0 || p.y >= window.innerHeight)  p.vy *= -1;
        });

        if (elapsedPhase >= PHASE_DURATIONS[0]) {
          clearInterval(letterTimer);
          // Fade out del texto HTML en 300ms mientras empieza la convergencia
          setTextAlpha(0);
          setTimeout(() => setShowText(false), 350);
          phaseRef.current    = 1;
          phaseStartRef.current = timestamp;
        }

      // ── FASE 1: convergencia acelerada ────────────────────────────────────
      } else if (phase === 1) {
        const duration = PHASE_DURATIONS[1];
        const t = easeInQuad(Math.min(elapsedPhase / duration, 1));

        particles.forEach((p) => {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const attraction = p.attraction * (1 + t * 8);
          p.vx += (dx / dist) * attraction * dt;
          p.vy += (dy / dist) * attraction * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.x  += p.vx * dt;
          p.y  += p.vy * dt;
          p.alpha = Math.max(0.1, 1 - t * 0.4);
        });

        if (elapsedPhase >= duration) {
          phaseRef.current    = 2;
          phaseStartRef.current = timestamp;
        }

      // ── FASE 2: EXPLOSIÓN ────────────────────────────────────────────────
      } else if (phase === 2) {
        if (!explodedRef.current) {
          explodedRef.current = true;
          particles.forEach((p) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.0 + Math.random() * 2.5;
            p.explosionVx = Math.cos(angle) * speed;
            p.explosionVy = Math.sin(angle) * speed;
            p.x     = centerX;
            p.y     = centerY;
            p.alpha = 1;
          });
        }

        const duration = PHASE_DURATIONS[2];
        const t = Math.min(elapsedPhase / duration, 1);
        const speedFactor = Math.pow(1 - t, 0.4);

        particles.forEach((p) => {
          p.x    += p.explosionVx * dt * speedFactor;
          p.y    += p.explosionVy * dt * speedFactor;
          p.alpha = Math.max(0, 1 - t * 1.2);
        });

        if (elapsedPhase >= duration) {
          phaseRef.current    = 3;
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
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      if (phase === 3) {
        ctx.fillStyle = `rgba(6, 6, 16, ${1 - fadeAlphaRef.current})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      clearInterval(letterTimer);
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(rafId);
    };
  }, [onFinish]);

  const letters = WORD.split('');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#060610]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Texto BolaLand letra por letra */}
      {showText && (
        <div
          className="relative z-10 flex items-center select-none"
          style={{
            opacity: textAlpha,
            transition: 'opacity 0.35s ease',
          }}
        >
          {letters.map((char, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: 700,
                fontFamily: "'Segoe UI', system-ui, sans-serif",
                letterSpacing: '0.04em',
                // Bola → dorado, Land → blanco/violeta suave
                color: i < 4 ? '#ffe29c' : '#e8e0ff',
                textShadow:
                  i < 4
                    ? '0 0 18px #ffe29c99, 0 0 40px #ffe29c44'
                    : '0 0 18px #9d52ff66, 0 0 40px #9d52ff22',
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}
            >
              {char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}