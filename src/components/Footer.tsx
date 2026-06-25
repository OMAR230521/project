import { Link } from 'react-router-dom';
import { Github, MessageCircle, Sword } from 'lucide-react';

const LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Discord', path: '/discord' },
  { label: 'Modpack', path: '/modpack' },
  { label: 'Rangos', path: '/rangos' },
  { label: 'Nosotros', path: '/nosotros' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-violet-900/20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-10"
          style={{
            background: 'radial-gradient(ellipse, rgba(147, 51, 234, 0.8) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-violet-500/40 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1060 50%, #0a0018 100%)' }}>
                <img src="/bolaland.png" alt="BolaLand logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-orbitron font-bold text-xl tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #c96bff 60%, #ffd700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                BOLALAND
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs text-center md:text-left">
              El servidor de Minecraft premium con mods. Una aventura sin límites te espera.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-gray-400 hover:text-violet-300 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/3kDC2ZbnA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-gray-400 hover:text-violet-300 transition-all duration-200 hover:border-violet-500/40"
              aria-label="Discord"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-gray-400 hover:text-violet-300 transition-all duration-200 hover:border-violet-500/40"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © 2026 BolaLand. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-700">
            No estamos afiliados con Mojang Studios o Microsoft.
          </p>
        </div>
      </div>
    </footer>
  );
}
