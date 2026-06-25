import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  originalVx: number;
  originalVy: number;
}

const COLORS = [
  'rgba(179, 71, 255, ',
  'rgba(147, 51, 234, ',
  'rgba(201, 107, 255, ',
  'rgba(255, 255, 255, ',
  'rgba(220, 180, 255, ',
  'rgba(255, 215, 0, ',
];

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const COUNT = isMobile ? 60 : 140;
    const MOUSE_RADIUS = 120;
    const MOUSE_STRENGTH = 0.04;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particlesRef.current = Array.from({ length: COUNT }, () => {
        const speed = 0.1 + Math.random() * 0.25;
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const isGold = Math.random() < 0.06;
        const colorBase = isGold ? COLORS[5] : COLORS[Math.floor(Math.random() * 5)];
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx,
          vy,
          originalVx: vx,
          originalVy: vy,
          radius: isGold ? 1.5 + Math.random() * 2 : 0.5 + Math.random() * 1.8,
          alpha: 0.15 + Math.random() * 0.7,
          color: colorBase,
        };
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollOffset = scrollRef.current * 0.3;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * MOUSE_STRENGTH * 2;
          p.vy += (dy / dist) * force * MOUSE_STRENGTH * 2;
        }

        p.vx += (p.originalVx - p.vx) * 0.015;
        p.vy += (p.originalVy - p.vy) * 0.015;

        p.x += p.vx;
        p.y += p.vy - scrollOffset * 0.001;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();

        if (p.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color + (p.alpha * 0.12) + ')';
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    function onMouse(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onTouch(e: TouchEvent) {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }

    function onScroll() {
      scrollRef.current = window.scrollY;
    }

    function onResize() {
      resize();
      createParticles();
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'transparent' }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="nebula-orb"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
            top: '-150px',
            right: '-150px',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <div
          className="nebula-orb"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(79, 22, 156, 0.3) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            animation: 'float 16s ease-in-out infinite reverse',
          }}
        />
        <div
          className="nebula-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(240, 180, 41, 0.08) 0%, transparent 70%)',
            top: '40%',
            left: '30%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
      </div>
    </>
  );
}
