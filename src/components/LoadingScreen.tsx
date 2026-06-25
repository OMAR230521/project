import { useEffect, useRef } from 'react';

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
};

const PARTICLE_COUNT = 130;
const COLORS = ['#ffffff', '#ffe29c', '#9d52ff'];
const PHASE_DURATIONS = [1500, 500, 500, 400];

const easeOutQuad = (t: number) => t * (2 - t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const createParticle = (width: number, height: number): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.02 + Math.random() * 0.05;
  const colorChance = Math.random();
  let color = COLORS[0];

  if (colorChance > 0.96) color = COLORS[2];
  else if (colorChance > 0.75) color = COLORS[1];

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 1 + Math.random() * 2,
    color,
    alpha: 1,
    explosionVx: 0,
    explosionVy: 0,
  };
};

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef(0);
  const startTimeRef = useRef(0);
  const phaseStartRef = useRef(0);
  const fadeAlphaRef = useRef(1);
  const resizeObserverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => createParticle(window.innerWidth, window.innerHeight));
    };

    setCanvasSize();
    const onResize = () => setCanvasSize();
    window.addEventListener('resize', onResize);
    phaseRef.current = 0;
    startTimeRef.current = 0;
    phaseStartRef.current = 0;
    fadeAlphaRef.current = 1;

    let rafId: number;
    let explosionInitialized = false;

    const drawParticles = (particles: Particle[]) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      particles.forEach((particle) => {
        context.beginPath();
        context.fillStyle = particle.color;
        context.globalAlpha = particle.alpha;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      if (phaseRef.current === 3) {
        context.fillStyle = `rgba(6, 6, 16, ${fadeAlphaRef.current})`;
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const updateFrame = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        phaseStartRef.current = timestamp;
      }

      const particles = particlesRef.current;
      const elapsedTotal = timestamp - startTimeRef.current;
      const elapsedPhase = timestamp - phaseStartRef.current;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const currentPhase = phaseRef.current;

      if (currentPhase === 0) {
        const duration = PHASE_DURATIONS[0];
        particles.forEach((particle) => {
          particle.x += particle.vx * window.innerWidth;
          particle.y += particle.vy * window.innerHeight;

          if (particle.x <= 0 || particle.x >= window.innerWidth) particle.vx *= -1;
          if (particle.y <= 0 || particle.y >= window.innerHeight) particle.vy *= -1;
        });

        if (elapsedPhase >= duration) {
          phaseRef.current = 1;
          phaseStartRef.current = timestamp;
        }
      } else if (currentPhase === 1) {
        const duration = PHASE_DURATIONS[1];
        const t = easeOutQuad(Math.min(elapsedPhase / duration, 1));
        particles.forEach((particle) => {
          particle.x = lerp(particle.x, centerX, t);
          particle.y = lerp(particle.y, centerY, t);
          particle.alpha = 1 - t * 0.2;
        });

        if (elapsedPhase >= duration) {
          phaseRef.current = 2;
          phaseStartRef.current = timestamp;
        }
      } else if (currentPhase === 2) {
        if (!explosionInitialized) {
          explosionInitialized = true;
          particles.forEach((particle) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.7 + Math.random() * 0.7;
            particle.explosionVx = Math.cos(angle) * speed;
            particle.explosionVy = Math.sin(angle) * speed;
            particle.x = centerX;
            particle.y = centerY;
          });
        }

        const duration = PHASE_DURATIONS[2];
        particles.forEach((particle) => {
          particle.x += particle.explosionVx * window.innerWidth * 0.0025;
          particle.y += particle.explosionVy * window.innerHeight * 0.0025;
          particle.alpha = Math.max(0, 1 - elapsedPhase / duration);
        });

        if (elapsedPhase >= duration) {
          phaseRef.current = 3;
          phaseStartRef.current = timestamp;
        }
      } else {
        const duration = PHASE_DURATIONS[3];
        const t = Math.min(elapsedPhase / duration, 1);
        fadeAlphaRef.current = 1 - easeOutQuad(t);

        if (elapsedPhase >= duration) {
          window.removeEventListener('resize', onResize);
          cancelAnimationFrame(rafId);
          onFinish();
          return;
        }
      }

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = '#060610';
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      drawParticles(particles);
      rafId = requestAnimationFrame(updateFrame);
    };

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05060e] text-white">
      <div className="absolute inset-0 bg-black/90" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
        <div className="text-sm uppercase tracking-[0.35em] text-slate-300">Cargando experiencia</div>
        <div className="text-2xl font-semibold sm:text-3xl">Bienvenido</div>
      </div>
    </div>
  );
}
