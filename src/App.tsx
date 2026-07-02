import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CosmicBackground from './components/CosmicBackground';
import Navbar from './components/Navbar';
import NavbarVanilla from './components/NavbarVanilla';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import LoadingScreen from './components/LoadingScreen';
import { CartProvider } from './context/CartContext';
import ServerSelect from './pages/ServerSelect';
import Home from './pages/Home';
import VanillaHome from './pages/VanillaHome';
import Discord from './pages/Discord';
import VanillaDiscord from './pages/VanillaDiscord';
import Modpack from './pages/Modpack';
import Rangos from './pages/Rangos';
import VanillaRangos from './pages/VanillaRangos';
import Nosotros from './pages/Nosotros';
import VanillaAbout from './pages/VanillaAbout';
import PagoRealizado from './pages/PagoRealizado';
import PagoFallido from './pages/PagoFallido';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const [showLoading, setShowLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  const isVanilla = location.pathname.startsWith('/vanilla');

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('app-loading-shown');
    if (!hasSeenLoading) {
      setShowLoading(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const handleLoadingFinish = () => {
    sessionStorage.setItem('app-loading-shown', 'true');
    setShowLoading(false);
    setIsReady(true);
  };

  return (
    <div className="relative min-h-screen" style={{ background: '#060610' }}>
      <CosmicBackground />
      <div className={`relative z-10 ${showLoading ? 'pointer-events-none' : ''}`}>
        {/* Navbar según servidor */}
        {isVanilla ? <NavbarVanilla /> : <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<ServerSelect />} />
            {/* MODS routes */}
            <Route path="/mods" element={<Home />} />
            <Route path="/mods/discord" element={<Discord />} />
            <Route path="/mods/ranks" element={<Rangos />} />
            <Route path="/mods/about" element={<Nosotros />} />
            {/* VANILLA routes */}
            <Route path="/vanilla" element={<VanillaHome />} />
            <Route path="/vanilla/discord" element={<VanillaDiscord />} />
            <Route path="/vanilla/ranks" element={<VanillaRangos />} />
            <Route path="/vanilla/about" element={<VanillaAbout />} />
            {/* Shared routes (legacy) */}
            <Route path="/discord" element={<Discord />} />
            <Route path="/modpack" element={<Modpack />} />
            <Route path="/rangos" element={<Rangos />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/pago-realizado" element={<PagoRealizado />} />
            <Route path="/pago-fallido" element={<PagoFallido />} />
          </Routes>
        </main>
        <Footer />
        <CartSidebar />
      </div>
      {showLoading && <LoadingScreen onFinish={handleLoadingFinish} />}
      {isReady && <ScrollToTop />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}