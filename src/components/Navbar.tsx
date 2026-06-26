import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Discord', path: '/discord' },
  { label: 'Modpack', path: '/modpack' },
  { label: 'Rangos', path: '/rangos' },
  { label: 'Nosotros', path: '/nosotros' },
];

function DiamondSword({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`diamond-sword p-1 ${isOpen ? 'active' : ''}`}
      aria-label="Abrir menú"
    >
      <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Diamond sword pixel art */}
        <rect x="2" y="1" width="2" height="2" fill="#5CE8F5" />
        <rect x="4" y="1" width="2" height="2" fill="#7AEEFF" />
        <rect x="4" y="3" width="2" height="2" fill="#5CE8F5" />
        <rect x="2" y="3" width="2" height="2" fill="#3BC9DA" />
        <rect x="6" y="3" width="2" height="2" fill="#7AEEFF" />
        <rect x="6" y="5" width="2" height="2" fill="#5CE8F5" />
        <rect x="4" y="5" width="2" height="2" fill="#3BC9DA" />
        <rect x="8" y="5" width="2" height="2" fill="#7AEEFF" />
        <rect x="8" y="7" width="2" height="2" fill="#5CE8F5" />
        <rect x="6" y="7" width="2" height="2" fill="#3BC9DA" />
        <rect x="10" y="7" width="2" height="2" fill="#5CE8F5" />
        <rect x="10" y="9" width="2" height="2" fill="#3BC9DA" />
        {/* Handle */}
        <rect x="9" y="11" width="2" height="2" fill="#8B6914" />
        <rect x="7" y="11" width="2" height="2" fill="#C49A28" />
        <rect x="7" y="13" width="2" height="2" fill="#8B6914" />
        <rect x="9" y="13" width="2" height="2" fill="#C49A28" />
      </svg>
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cosmic-black/80 backdrop-blur-xl border-b border-violet-900/30 shadow-lg shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-violet-500/40 shadow-lg shadow-violet-900/40 transition-all duration-300 group-hover:border-violet-400/70 group-hover:shadow-violet-500/50">
                <img src="/bolaland.png" alt="BolaLand logo" className="w-full h-full object-cover" />
              </div>
              <span
                className="font-orbitron font-bold text-xl tracking-widest transition-all duration-300 group-hover:tracking-[0.2em]"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #c96bff 60%, #ffd700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                BOLALAND
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                      isActive ? 'text-violet-300' : 'text-gray-300 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute inset-0 rounded-lg bg-violet-500/10 border border-violet-500/20" />
                      )}
                      <span className="relative">{link.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                aria-label="Carrito"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #9333ea, #7c10d0)' }}>
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile sword */}
              <div className="md:hidden">
                <DiamondSword isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(6, 6, 16, 0.85)', backdropFilter: 'blur(8px)' }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden transition-all duration-400 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(10, 8, 22, 0.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(179, 71, 255, 0.2)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-violet-900/30">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-violet-500/40 shadow-lg shadow-violet-900/40 transition-all duration-300">
                <img src="/bolaland.png" alt="BolaLand logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-orbitron font-bold text-lg"
                style={{
                  background: 'linear-gradient(135deg, #fff 0%, #c96bff 60%, #ffd700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                BOLALAND
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 p-4 flex-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-violet-500/15 border border-violet-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isActive(link.path)
                      ? 'linear-gradient(135deg, #c96bff, #ffd700)'
                      : 'rgba(255,255,255,0.2)',
                  }}
                />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="px-6 py-5 border-t border-violet-900/30">
            <p className="text-xs text-gray-500 text-center">© 2026 BolaLand</p>
          </div>
        </div>
      </div>
    </>
  );
}
