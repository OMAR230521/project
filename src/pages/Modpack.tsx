import { Download, BookOpen, Monitor, Cpu, HardDrive, Wifi, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const MODS = [
  { name: 'Create', category: 'Tecnología', desc: 'Maquinaria y automatización rotacional' },
  { name: 'Bor in Chaos', category: 'Terror y Supervivencia ', desc: 'Criaturas, Gefes, Armamento y Estructuras nuevas' },
  { name: 'Chipped', category: 'Herramientas', desc: 'Herramientas y bloques Personalizables' },
  { name: 'Armageddon', category: 'Gefes, Desafios', desc: 'Desafios y Criaturas desafiantes' },
  { name: 'Artifacts', category: 'Accesorios especiales', desc: 'Objetos con habilidades únicas' },
  { name: 'Camera Mod', category: 'Tecnología', desc: 'Saca Fotos en el Servidor' },
  { name: 'EvilCraft', category: 'Magia', desc: 'Rituales y magia de sangre' },
  { name: 'Simple Voice Chat', category: 'Comunicación', desc: 'Chat de voz en vivo durante el juego' },
  { name: 'Mekanism', category: 'Tecnología', desc: 'Tecnología avanzada y energía' },
  
];

const CATEGORY_COLORS: Record<string, string> = {
  'Tecnología': '#3b82f6',
  'Magia': '#9333ea',
  'Herramientas': '#f0b429',
  'Storage': '#10b981',
  'Exploración': '#ec4899',
  'Agricultura': '#84cc16',
};

const REQUIREMENTS = [
  { icon: Cpu, label: 'Procesador', min: 'Core i5 8a gen', rec: 'Core i7 8a gen+', color: '#3b82f6' },
  { icon: Monitor, label: 'RAM', min: '7 GB libres', rec: '8 GB+ libres', color: '#9333ea' },
  { icon: HardDrive, label: 'Almacenamiento', min: '2 GB libres', rec: '4 GB+ libres', color: '#f0b429' },
];

const STEPS = [
  { step: '01', title: 'Descarga CurseForge o FTB App', desc: 'Instala el launcher de tu preferencia. Recomendamos CurseForge App para una instalación sencilla.' },
  { step: '02', title: 'Descarga el modpack', desc: 'Haz clic en el botón de descarga de arriba. El archivo .zip contiene todo lo necesario.' },
  { step: '03', title: 'Importa el modpack', desc: 'En CurseForge, ve a "Create Custom Profile" > "Import" y selecciona el archivo descargado.' },
  { step: '04', title: 'Configura la RAM', desc: 'Asigna mínimo 7 GB de RAM en los ajustes del perfil para un rendimiento óptimo.' },
  { step: '05', title: '¡Conecta y juega!', desc: 'Inicia el perfil y conecta al servidor play.bolaland.net. ¡La aventura comienza!' },
];

function RequirementCard({ req }: { req: typeof REQUIREMENTS[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 glass-hover">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${req.color}15`, border: `1px solid ${req.color}30` }}>
        <req.icon size={18} style={{ color: req.color }} />
      </div>
      <p className="font-semibold text-white text-sm mb-2">{req.label}</p>
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Mínimo: <span className="text-gray-200">{req.min}</span></p>
        <p className="text-xs text-gray-400">Recomendado: <span className="text-green-400">{req.rec}</span></p>
      </div>
    </div>
  );
}

function StepCard({ s }: { s: typeof STEPS[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 glass-hover flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-orbitron font-bold text-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0.05))',
          border: '1px solid rgba(179, 71, 255, 0.3)',
          color: '#c96bff',
        }}>
        {s.step}
      </div>
      <div>
        <p className="font-semibold text-white mb-1">{s.title}</p>
        <p className="text-sm text-gray-400">{s.desc}</p>
      </div>
    </div>
  );
}

function ModCard({ mod }: { mod: typeof MODS[0] }) {
  const ref = useReveal();
  const color = CATEGORY_COLORS[mod.category] || '#9333ea';
  return (
    <div ref={ref} className="reveal glass rounded-xl p-4 glass-hover">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-white text-sm">{mod.name}</p>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
          {mod.category}
        </span>
      </div>
      <p className="text-xs text-gray-400">{mod.desc}</p>
    </div>
  );
}

export default function Modpack() {
  const heroRef = useReveal();
  const reqTitleRef = useReveal();
  const tutorialTitleRef = useReveal();
  const modsTitleRef = useReveal();
  const noteRef = useReveal();
  const ctaRef = useReveal();

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #1a3a1a 0%, #0d2e0d 100%)',
              border: '2px solid rgba(132, 204, 22, 0.4)',
              boxShadow: '0 0 40px rgba(132, 204, 22, 0.2)',
            }}>
            <Package size={36} className="text-green-400" />
          </div>
          <h1 className="section-title font-orbitron text-4xl sm:text-5xl mb-4">
            Modpack BolaLand
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mx-auto mb-8">
            Más de 140 mods seleccionados para una experiencia épica. Instalación guiada y soporte completo.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
          <a
             href="https://www.curseforge.com/minecraft/share/T1L8E88D"
             target="_blank"
             rel="noopener noreferrer"
             className="btn-primary px-8 py-3.5 rounded-2xl text-base flex items-center gap-2"
           >
           Descargar Modpack
           </a>
  <a href="#tutorial" className="btn-outline px-8 py-3.5 rounded-2xl text-base flex items-center gap-2">
    <BookOpen size={18} />
    Ver Tutorial
  </a>
</div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {[
              { label: 'Minecraft 1.21.1', color: '#84cc16' },
              { label: 'NeoForge ', color: '#f0b429' },
              { label: '140+ mods', color: '#9333ea' },
            ].map(b => (
              <span key={b.label} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${b.color}15`, border: `1px solid ${b.color}30`, color: b.color }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <section className="mb-16">
          <div ref={reqTitleRef} className="reveal text-center mb-8">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">Requisitos del sistema</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {REQUIREMENTS.map(req => <RequirementCard key={req.label} req={req} />)}
          </div>
        </section>

        {/* Tutorial */}
        <section id="tutorial" className="mb-16">
          <div ref={tutorialTitleRef} className="reveal text-center mb-8">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">Cómo instalar</h2>
          </div>
          <div className="space-y-4">
            {STEPS.map(s => <StepCard key={s.step} s={s} />)}
          </div>
        </section>

        {/* Mod list */}
        <section>
          <div ref={modsTitleRef} className="reveal text-center mb-8">
            <h2 className="section-title font-orbitron text-2xl sm:text-3xl">Mods incluidos</h2>
            <p className="text-gray-400 text-sm mt-2">Una selección cuidadosa de los mejores mods</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODS.map(mod => <ModCard key={mod.name} mod={mod} />)}
          </div>
          <div ref={noteRef} className="reveal mt-4 glass rounded-2xl p-5 flex items-center gap-3">
            <AlertCircle size={18} className="text-violet-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Lista parcial. El modpack incluye más de 140 mods. Todos son compatibles entre sí y han sido probados por nuestro equipo.
            </p>
          </div>
        </section>

        {/* Download CTA */}
        <div ref={ctaRef} className="reveal mt-16 relative rounded-3xl p-8 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 30, 15, 0.9) 0%, rgba(10, 20, 10, 0.9) 100%)',
            border: '1px solid rgba(132, 204, 22, 0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
          <CheckCircle2 size={36} className="mx-auto mb-3 text-green-400" />
          <h3 className="font-orbitron font-bold text-2xl text-white mb-2">¿Listo para jugar?</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Descarga el modpack, conéctate al servidor y comienza tu aventura en BolaLand.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
             href="https://www.curseforge.com/minecraft/share/T1L8E88D"
             target="_blank"
             rel="noopener noreferrer"
             className="btn-primary px-8 py-3.5 rounded-2xl text-base flex items-center gap-2"
           >
           Descargar Modpack
           </a>
            <div className="glass rounded-2xl px-6 py-3 flex items-center gap-2">
              <Wifi size={14} className="text-green-400" />
              <span className="text-sm font-mono text-gray-200">-</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
