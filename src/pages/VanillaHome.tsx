import { Link } from 'react-router-dom';
import { Users, Package, Zap, Sword, Star, Globe, ChevronRight, Server, Trophy, Sparkles } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Users }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center">
      <div className="glass rounded-2xl p-6 glass-hover">
        <Icon size={24} className="mx-auto mb-3 text-violet-400" />
        <p className="font-orbitron font-bold text-3xl" style={{
          background: 'linear-gradient(135deg, #ffe44d, #f0b429)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: typeof Users; title: string; desc: string; color: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-6 glass-hover">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}20`, border: `1px solid ${color}35` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal inline-block w-full text-center">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
        style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(179, 71, 255, 0.25)', color: '#c96bff' }}>
        <Sparkles size={12} />
        {badge}
      </span>
      <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl font-orbitron mb-4">{title}</h2>
      <p className="text-gray-400 text-base max-w-xl mx-auto">{subtitle}</p>
    </div>
  );
}

function CtaBanner() {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal relative rounded-3xl overflow-hidden p-10 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.9) 0%, rgba(30, 12, 60, 0.9) 50%, rgba(10, 8, 25, 0.9) 100%)',
        border: '1px solid rgba(179, 71, 255, 0.3)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(179,71,255,0.1)',
      }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(147, 51, 234, 0.15) 0%, transparent 60%)' }} />
      <Trophy size={40} className="mx-auto mb-4 relative z-10" style={{ color: '#ffd700' }} />
      <h2 className="font-orbitron font-bold text-3xl sm:text-4xl mb-4 relative z-10"
        style={{
          background: 'linear-gradient(135deg, #fff 0%, #c96bff 50%, #ffd700 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
        Únete a la aventura
      </h2>
      <p className="text-gray-300 max-w-md mx-auto mb-8 relative z-10">
        Conecta al servidor ahora mismo y descubrí por qué los jugadores eligen BolaLand.
      </p>
      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        <Link to="/vanilla/discord" className="btn-primary px-8 py-3.5 rounded-2xl">
          Entrar al Discord
          <ChevronRight size={16} />
        </Link>
        <div className="glass rounded-2xl px-6 py-3.5 flex items-center gap-2">
          <Server size={16} className="text-green-400" />
          <span className="text-sm font-mono text-gray-200">play.vanilla.bolaland.net</span>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Users, title: 'Comunidad Activa', desc: 'Jugadores de habla hispana que comparten tu pasión por el survival clásico. Eventos semanales y torneos regulares.', color: '#9333ea' },
  { icon: Globe, title: 'Survival Puro', desc: 'Sin mods, sin distracciones. La experiencia Minecraft como fue diseñada originalmente. Volvé a lo esencial.', color: '#22c55e' },
  { icon: Zap, title: 'Eventos Épicos', desc: 'Competencias, hunts y eventos de temporada con recompensas exclusivas. Siempre algo nuevo que descubrir.', color: '#10b981' },
  { icon: Server, title: 'Optimización Total', desc: 'Servidor de alto rendimiento para que tu experiencia sea fluida independientemente de tu PC.', color: '#3b82f6' },
  { icon: Sword, title: 'Mundo Persistente', desc: 'Mapa que evoluciona con la comunidad. Cada construcción cuenta la historia del servidor.', color: '#ec4899' },
  { icon: Star, title: 'Rangos Premium', desc: 'Sistema de rangos exclusivos con beneficios únicos en el servidor vanilla.', color: '#c96bff' },
];

export default function VanillaHome() {
  const heroRef = useReveal();

  return (
    <div className="relative">
      {/* Hero section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
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

        <div ref={heroRef} className="reveal text-center max-w-4xl mx-auto z-10 pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-medium"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#86efac',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Servidor Online — play.vanilla.bolaland.net
          </div>

          <div className="mb-6">
            <div className="inline-block relative mb-4">
              <div className="w-72 h-72 sm:w-96 sm:h-96 mx-auto rounded-[3rem] overflow-hidden border border-green-500/40 flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #0a1e0a 0%, #0d2e0d 50%, #060f06 100%)',
                  boxShadow: '0 0 80px rgba(34, 197, 94, 0.45), 0 0 160px rgba(34, 197, 94, 0.18)',
                }}>
                <img src="/bolaland-vanilla.png" alt="BolaLand Vanilla logo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400/20 border border-green-400/50 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>

            <p className="text-xl sm:text-2xl text-gray-300 font-light tracking-wide">
              Una aventura sin límites te espera.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/vanilla/discord" className="btn-primary px-8 py-4 text-base rounded-2xl">
              <span>Discord</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/vanilla/ranks" className="btn-gold px-8 py-4 text-base rounded-2xl">
              <Trophy size={16} />
              <span>Rangos</span>
            </Link>
          </div>

          <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
            <p className="text-xs text-gray-500 tracking-widest uppercase">Explorar</p>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="500+" label="Jugadores" icon={Users} />
          <StatCard value="100%" label="Vanilla puro" icon={Star} />
          <StatCard value="99.9%" label="Uptime garantizado" icon={Server} />
          <StatCard value="24/7" label="Soporte activo" icon={Zap} />
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <SectionHeader
              badge="Por qué elegirnos"
              title="Una experiencia épica"
              subtitle="Diseñado para quienes buscan la aventura definitiva en Minecraft con mods."
            />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} color={f.color} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <CtaBanner />
        </div>
      </section>
    </div>
  );
}