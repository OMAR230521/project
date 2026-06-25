import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Discord from './pages/Discord';
import Modpack from './pages/Modpack';
import Rangos from './pages/Rangos';
import Nosotros from './pages/Nosotros';
import PagoRealizado from './pages/PagoRealizado';
import PagoFallido from './pages/PagoFallido';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  return (
    <div className="relative min-h-screen" style={{ background: '#060610' }}>
      <CosmicBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
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
      <ScrollToTop />
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
