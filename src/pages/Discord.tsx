import { ExternalLink, MessageCircle, Users, Headphones, Gift, Zap, Star, ChevronRight } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const CHANNELS = [
  { icon: MessageCircle, name: '#general', desc: 'Chat principal de la comunidad', color: '#9333ea' },
  { icon: Headphones, name: '#soporte', desc: 'Ayuda y resolución de problemas', color: '#3b82f6' },
  { icon: Zap, name: '#eventos', desc: 'Anuncios de eventos y torneos', color: '#f0b429' },
  { icon: Gift, name: '#sorteos', desc: 'Giveaways y regalos exclusivos', color: '#10b981' },
  { icon: Star, name: '#rangos', desc: 'Info sobre rangos y beneficios', color: '#c96bff' },
  { icon: Users, name: '#presentaciones', desc: 'Preséntate a la comunidad', color: '#ec4899' },
];

function ChannelCard({ icon: Icon, name, desc, color }: { icon: typeof Users; name: string; desc: string; color: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-xl p-4 glass-hover flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const DISCORD_STATS = [
  { value: '500+', label: 'Miembros' },
  { value: '50+', label: 'Online ahora' },
  { value: '24/7', label: 'Soporte' },
];

function StatBadge({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 text-center glass-hover"
      style={{ animationDelay: `${index * 100}ms` }}>
      <p className="font-orbitron font-bold text-2xl sm:text-3xl"
        style={{
          background: 'linear-gradient(135deg, #5865F2, #c96bff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function Discord() {
  const heroRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)',
              boxShadow: '0 0 40px rgba(88, 101, 242, 0.4)',
            }}>
            <MessageCircle size={36} className="text-white" />
          </div>
          <h1 className="section-title font-orbitron text-4xl sm:text-5xl mb-4">
            Únete al Discord
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mx-auto mb-8">
            Nuestra comunidad te espera. Conecta con cientos de jugadores, recibe soporte y enterate  de eventos exclusivos.
          </p>

          <a
            href="https://discord.gg/3kDC2ZbnA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)',
              boxShadow: '0 8px 30px rgba(88, 101, 242, 0.4)',
              border: '1px solid rgba(88, 101, 242, 0.3)',
            }}
          >
            <MessageCircle size={22} />
            ENTRAR AL DISCORD
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {DISCORD_STATS.map((s, i) => (
            <StatBadge key={i} value={s.value} label={s.label} index={i} />
          ))}
        </div>

        {/* Channels */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">Canales destacados</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {CHANNELS.map(ch => (
              <ChannelCard key={ch.name} icon={ch.icon} name={ch.name} desc={ch.desc} color={ch.color} />
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div ref={ctaRef} className="reveal relative rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.12) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '1px solid rgba(88, 101, 242, 0.25)',
          }}>
          <h3 className="font-orbitron font-bold text-xl mb-4 text-white">¿Por qué unirte?</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: '🎉', label: 'Eventos exclusivos' },
              { icon: '🛡️', label: 'Staff siempre disponible' },
              { icon: '📢', label: 'Noticias del servidor' },
              { icon: '🏆', label: 'Torneos con premios' },
              { icon: '💬', label: 'Comunidad hispanohablante' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300 justify-center">
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
          <a
            href="https://discord.gg/3kDC2ZbnA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold transition-all duration-200 hover:gap-3"
            style={{ color: '#5865F2' }}
          >
            Unirse ahora <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
