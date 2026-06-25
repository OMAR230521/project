import { XCircle, Home, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PagoFallido() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-lg w-full text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)',
            }}>
            <XCircle size={44} className="text-red-400" />
          </div>
        </div>

        <h1 className="font-orbitron font-bold text-3xl sm:text-4xl mb-3"
          style={{
            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
          Pago Fallido
        </h1>

        <p className="text-gray-300 text-base mb-2">
          No se pudo completar el pago.
        </p>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          Tu compra no fue procesada y no se realizó ningún cargo. Puedes intentarlo de nuevo o contactar a soporte.
        </p>

        <div className="glass rounded-2xl p-6 mb-8 text-left">
          <p className="font-semibold text-white text-sm mb-3">Posibles causas:</p>
          <ul className="space-y-2">
            {[
              'Fondos insuficientes en la tarjeta.',
              'La tarjeta fue rechazada por el banco.',
              'Datos de tarjeta incorrectos.',
              'El pago fue cancelado manualmente.',
              'Error temporal del procesador de pagos.',
            ].map((cause, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                {cause}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/rangos" className="btn-primary px-6 py-3 rounded-xl">
            <ArrowLeft size={15} />
            Intentar de nuevo
          </Link>
          <a href="https://discord.gg/3kDC2ZbnA" target="_blank" rel="noopener noreferrer"
            className="btn-outline px-6 py-3 rounded-xl"
            style={{ borderColor: 'rgba(88, 101, 242, 0.4)', color: 'rgba(255,255,255,0.8)' }}>
            <MessageCircle size={15} />
            Contactar soporte
          </a>
          <Link to="/" className="btn-outline px-6 py-3 rounded-xl">
            <Home size={15} />
            Inicio
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-600">
          Si el problema persiste, contáctanos en Discord. No se realizó ningún cargo a tu cuenta.
        </p>
      </div>
    </div>
  );
}
