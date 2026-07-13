import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

// 🔒 FLAG TEMPORAL — poné esto en `false` cuando el server Vanilla esté listo

const VANILLA_COMING_SOON = true;

export default function ServerSelect() {
  const ref = useReveal();
  const ref2 = useReveal();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleVanillaClick = (e: React.MouseEvent) => {
    if (VANILLA_COMING_SOON) {
      e.preventDefault();
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + (i % 7) * 0.08,
              animation: `twinkle ${2 + (i % 4)}s ease-in-out ${(i % 3) * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* 🔒 CARTEL "PRÓXIMAMENTE" — borrar este bloque completo cuando Vanilla esté listo */}
      {showComingSoon && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 glass"
          style={{
            border: '1px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.25)',
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          <Clock size={20} style={{ color: '#86efac' }} />
          <span className="text-white font-semibold text-sm">
            Próximamente será habilitado
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 w-full px-4 flex flex-col items-center">
        <h1 className="section-title font-orbitron text-3xl sm:text-4xl lg:text-5xl leading-[1.25] pb-2 mb-3 text-center">
          Elegí tu experiencia
        </h1>
        <p className="text-gray-400 text-base mb-12 text-center max-w-lg">
          Dos experiencias únicas, una sola comunidad
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* BolaLand MODS card */}
          <div ref={ref} className="reveal glass glass-hover rounded-3xl p-8 text-center flex flex-col items-center"
            style={{ border: '1px solid rgba(179, 71, 255, 0.25)' }}>
            <div className="w-44 h-44 mx-auto mb-5 rounded-[2rem] overflow-hidden"
              style={{
                border: '1px solid rgba(179, 71, 255, 0.4)',
                boxShadow: '0 0 60px rgba(147, 51, 234, 0.4), 0 0 120px rgba(147, 51, 234, 0.15)',
                background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1060 50%, #0a0018 100%)',
              }}>
              <img src="/bolaland.png" alt="BolaLand Mods" className="w-full h-full object-cover" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold font-orbitron mb-3"
              style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#c96bff', border: '1px solid rgba(179, 71, 255, 0.3)' }}>
              MODS
            </span>

            <h2 className="section-title font-orbitron font-bold text-2xl mb-2">BolaLand MODS</h2>

            <p className="text-gray-400 text-sm mb-6">140+ mods · Survival épico · Comunidad activa</p>

            <Link to="/mods" className="btn-primary px-8 py-3 rounded-2xl w-full justify-center">
              Entrar
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* BolaLand VANILLA card */}
          <div ref={ref2} className="reveal glass glass-hover rounded-3xl p-8 text-center flex flex-col items-center"
            style={{ border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div className="w-44 h-44 mx-auto mb-5 rounded-[2rem] overflow-hidden"
              style={{
                border: '1px solid rgba(34, 197, 94, 0.4)',
                boxShadow: '0 0 60px rgba(34, 197, 94, 0.35), 0 0 120px rgba(34, 197, 94, 0.12)',
                background: 'linear-gradient(135deg, #0a1e0a 0%, #0d2e0d 50%, #060f06 100%)',
              }}>
              <img src="/bolaland.png" alt="BolaLand Vanilla" className="w-full h-full object-cover" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold font-orbitron mb-3"
              style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#86efac', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              VANILLA
            </span>

            <h2 className="font-orbitron font-bold text-2xl mb-2"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #86efac 50%, #22c55e 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
              BolaLand VANILLA
            </h2>

            <p className="text-gray-400 text-sm mb-6">Survival puro · Sin mods · La experiencia clásica</p>

            <Link
              to="/vanilla"
              onClick={handleVanillaClick}
              className="w-full justify-center inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
              }}>
              Entrar
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}