import { CheckCircle2, Home, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PagoRealizado() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-lg w-full text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            }}>
            <CheckCircle2 size={44} className="text-green-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>

        <h1 className="font-orbitron font-bold text-3xl sm:text-4xl mb-3"
          style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
          ¡Pago Exitoso!
        </h1>

        <p className="text-gray-300 text-base mb-2">
          Tu compra ha sido procesada correctamente.
        </p>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          Nuestro equipo está procesando tu pedido. Recibirás tu rango/accesorio en tu cuenta de Minecraft en los próximos minutos.
        </p>

        <div className="glass rounded-2xl p-6 mb-8 text-left space-y-3">
          <p className="font-semibold text-white text-sm mb-3">¿Qué sigue?</p>
          {[
            { step: '1', text: 'Tu compra ha sido confirmada y registrada.' },
            { step: '2', text: 'El equipo de staff recibirá la notificación automáticamente.' },
            { step: '3', text: 'Tu rango/accesorio se activará en el servidor.' },
            { step: '4', text: '¡Conéctate a play.bolaland.net y disfruta!' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-orbitron"
                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399' }}>
                {s.step}
              </span>
              <p className="text-sm text-gray-300 pt-0.5">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary px-6 py-3 rounded-xl">
            <Home size={15} />
            Inicio
          </Link>
          <a href="https://discord.gg/3kDC2ZbnA" target="_blank" rel="noopener noreferrer"
            className="btn-outline px-6 py-3 rounded-xl"
            style={{
              borderColor: 'rgba(88, 101, 242, 0.4)',
              color: 'rgba(255,255,255,0.8)',
            }}>
            <MessageCircle size={15} />
            Discord
          </a>
          <Link to="/rangos" className="btn-outline px-6 py-3 rounded-xl">
            Seguir comprando
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-600">
          ¿Problemas con tu compra? Contáctanos en Discord o escribe a soporte.bolaland@gmail.com
        </p>
      </div>
    </div>
  );
}
