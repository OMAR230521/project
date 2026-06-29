import { Users, Heart, Globe, Shield, Zap, Star, Target } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const TEAM = [
  { name: 'TheBola', role: 'Fundador', emoji: '👑', desc: 'Visionario del proyecto, gestiona la infraestructura y dirección del servidor.' },
  { name: ' El Staff', role: 'Amigos del Alma', emoji: '⚡', desc: 'Personas dedicadas al servidor, para la ayuda de los jugadores dentro del server.' },
];

const VALUES = [
  { icon: Heart, label: 'Comunidad primero', desc: 'Cada decisión la tomamos pensando en nuestra comunidad y sus jugadores.', color: '#ec4899' },
  { icon: Shield, label: 'Juego justo', desc: 'Tolerancia cero al trampeo. Un entorno equilibrado para todos.', color: '#10b981' },
  { icon: Zap, label: 'Innovación constante', desc: 'Siempre buscamos mejorar y añadir contenido fresco y emocionante.', color: '#f0b429' },
  { icon: Globe, label: 'Para todos', desc: 'Hispanohablantes de todo el mundo son bienvenidos. La aventura no tiene fronteras.', color: '#3b82f6' },
];

const STORY_STATS = [
  { value: '2026', label: 'Fundado' },
  { value: '100+', label: 'Miembros' },
  { value: '100%', label: 'Vanilla puro' },
  { value: '4', label: 'Staff activo' },
];

function TeamCard({ member }: { member: typeof TEAM[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 text-center glass-hover">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
        {member.emoji}
      </div>
      <p className="font-orbitron font-bold text-sm text-white">{member.name}</p>
      <p className="text-xs text-green-400 mt-0.5 mb-2">{member.role}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{member.desc}</p>
    </div>
  );
}

function ValueCard({ val }: { val: typeof VALUES[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 glass-hover flex gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${val.color}15`, border: `1px solid ${val.color}30` }}>
        <val.icon size={20} style={{ color: val.color }} />
      </div>
      <div>
        <p className="font-semibold text-white mb-1">{val.label}</p>
        <p className="text-sm text-gray-400">{val.desc}</p>
      </div>
    </div>
  );
}

export default function VanillaAbout() {
  const heroRef = useReveal();
  const storyRef = useReveal();
  const teamTitleRef = useReveal();
  const valuesTitleRef = useReveal();
  const missionRef = useReveal();

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #0a1e0a 0%, #0d2e0d 50%, #060f06 100%)',
              border: '2px solid rgba(34, 197, 94, 0.4)',
              boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
            }}>
            <Users size={36} className="text-green-400" />
          </div>
          <h1 className="section-title font-orbitron text-4xl sm:text-5xl mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Somos un equipo apasionado por Minecraft y la creación de experiencias únicas. BolaLand nació con la visión de crear el mejor servidor de survival hispanohablante del mundo.
          </p>
        </div>

        {/* Story */}
        <section className="mb-20">
          <div ref={storyRef} className="reveal relative rounded-3xl p-8 sm:p-10 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 30, 10, 0.9) 0%, rgba(15, 40, 15, 0.9) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 60%)' }} />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="section-title font-orbitron text-2xl sm:text-3xl mb-4">Nuestra historia</h2>
                <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                  <p>BolaLand comenzó como un pequeño proyecto entre amigos que querían un lugar especial donde disfrutar Minecraft sin mods, con la experiencia survival clásica.</p>
                  <p>Lo que empezó con 5 jugadores creció hasta convertirse en una comunidad de más de 500 miembros activos. Hoy somos un referente en el mundo de los servidores hispanohablantes de survival puro.</p>
                  <p>Nuestra misión es simple: crear el mejor lugar posible para jugar Minecraft vanilla, donde cada jugador se sienta bienvenido y pueda vivir aventuras épicas.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STORY_STATS.map(s => (
                  <div key={s.label} className="glass rounded-xl p-4 text-center">
                    <p className="font-orbitron font-bold text-2xl" style={{ color: '#22c55e' }}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-20">
          <div ref={teamTitleRef} className="reveal text-center mb-10">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">El equipo</h2>
            <p className="text-gray-400 text-sm mt-2">Las personas detrás de BolaLand</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map(member => <TeamCard key={member.name} member={member} />)}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div ref={valuesTitleRef} className="reveal text-center mb-10">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">Nuestros valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map(val => <ValueCard key={val.label} val={val} />)}
          </div>
        </section>

        {/* Mission */}
        <div ref={missionRef} className="reveal relative rounded-3xl p-8 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 30, 10, 0.95) 0%, rgba(6, 15, 6, 0.95) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.12) 0%, transparent 60%)' }} />
          <Target size={36} className="mx-auto mb-3 text-green-400 relative z-10" />
          <h3 className="font-orbitron font-bold text-2xl text-white mb-3 relative z-10">Nuestra misión</h3>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm leading-relaxed relative z-10">
            Crear la experiencia definitiva de Minecraft survival para la comunidad hispanohablante. Un lugar donde cada jugador, sin importar su nivel, pueda encontrar su aventura, conectar con otros y vivir momentos épicos que recuerden para siempre.
          </p>
          <div className="mt-6 flex justify-center relative z-10">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Star size={14} style={{ fill: '#22c55e' }} />
              <span className="font-medium">Desde 2026, construyendo aventuras juntos</span>
              <Star size={14} style={{ fill: '#22c55e' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}