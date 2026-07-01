import { useEffect, useState } from 'react';
import { Trophy, Crown, Star, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useReveal } from '../hooks/useReveal';

interface TopDonorData {
  minecraft_nick: string;
  total_spent: number;
}

interface TopDonorProps {
  serverType: 'mods' | 'vanilla';
}

export default function TopDonor({ serverType }: TopDonorProps) {
  const [donor, setDonor] = useState<TopDonorData | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useReveal();

  useEffect(() => {
    async function fetchTopDonor() {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select('minecraft_nick, total, items')
        .eq('status', 'completed')
        .gte('created_at', startOfMonth);

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }

      const filtered = data.filter((order) => {
        const items = order.items as Array<{ id: string }>;
        if (!items || items.length === 0) return false;
        const firstId: string = items[0].id ?? '';
        return serverType === 'vanilla' ? firstId.startsWith('v-') : !firstId.startsWith('v-');
      });

      if (filtered.length === 0) {
        setLoading(false);
        return;
      }

      const totals: Record<string, number> = {};
      for (const order of filtered) {
        const nick = order.minecraft_nick;
        totals[nick] = (totals[nick] ?? 0) + Number(order.total);
      }

      const topNick = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
      setDonor({ minecraft_nick: topNick[0], total_spent: topNick[1] });
      setLoading(false);
    }

    fetchTopDonor();
  }, [serverType]);

  const accentColor = serverType === 'vanilla' ? '#22c55e' : '#b347ff';
  const accentColorRgb = serverType === 'vanilla' ? '34,197,94' : '179,71,255';
  const monthName = new Date().toLocaleString('es', { month: 'long' });

  return (
    <section className="py-8 px-4 relative">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div ref={ref} className="reveal text-center mb-6">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
            style={{
              background: `rgba(${accentColorRgb}, 0.1)`,
              border: `1px solid rgba(${accentColorRgb}, 0.3)`,
              color: accentColor,
            }}
          >
            <Crown size={12} />
            Mayor Donante del Mes
          </span>
          <h2
            className="font-orbitron font-bold text-2xl sm:text-3xl mb-1"
            style={{
              background: `linear-gradient(135deg, #fff 0%, ${accentColor} 50%, #ffd700 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Top Donante
          </h2>
          <p className="text-gray-500 text-xs capitalize tracking-widest uppercase">
            {monthName} 2026
          </p>
        </div>

        {/* Card */}
        <div
          ref={ref}
          className="reveal relative rounded-3xl text-center"
          style={{
            background: `linear-gradient(160deg, rgba(15,10,35,0.97) 0%, rgba(25,10,50,0.97) 50%, rgba(10,8,25,0.97) 100%)`,
            border: `1px solid rgba(${accentColorRgb}, 0.35)`,
            boxShadow: `0 25px 80px rgba(0,0,0,0.6), 0 0 80px rgba(${accentColorRgb}, 0.1), inset 0 1px 0 rgba(${accentColorRgb}, 0.15)`,
            paddingTop: donor ? '80px' : '32px',
            paddingBottom: '32px',
            paddingLeft: '32px',
            paddingRight: '32px',
            overflow: 'visible',
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, rgba(${accentColorRgb}, 0.15) 0%, transparent 60%)`,
            }}
          />

          {/* Particle stars */}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                width: `${(i % 2) + 1}px`,
                height: `${(i % 2) + 1}px`,
                top: `${15 + (i * 6) % 75}%`,
                left: `${5 + (i * 11) % 90}%`,
                opacity: 0.06 + (i % 5) * 0.05,
                animation: `twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}

          {loading ? (
            <div className="relative z-10 py-10">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 animate-pulse"
                style={{ background: `rgba(${accentColorRgb}, 0.2)` }}
              />
              <p className="text-gray-500 text-sm font-orbitron">Cargando...</p>
            </div>
          ) : !donor ? (
            <div className="relative z-10 py-10">
              <Trophy size={52} className="mx-auto mb-4 opacity-25" style={{ color: accentColor }} />
              <p className="text-gray-400 font-orbitron text-sm">
                ¡Sé el primero en donar este mes!
              </p>
            </div>
          ) : (
            <>
              {/* Skin que sobresale del marco */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: '-110px', zIndex: 20, width: '180px' }}
              >
                {/* Corona encima de la skin */}
                <div className="flex justify-center mb-1">
                  <Crown
                    size={32}
                    style={{
                      color: '#ffd700',
                      filter: 'drop-shadow(0 0 14px rgba(255,215,0,0.9)) drop-shadow(0 0 4px rgba(255,215,0,1))',
                      animation: 'swordGlow 2s ease-in-out infinite',
                    }}
                  />
                </div>

                {/* Glow detrás de la skin */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 60%, rgba(${accentColorRgb}, 0.35) 0%, transparent 70%)`,
                    filter: 'blur(12px)',
                    transform: 'scale(1.3)',
                  }}
                />

                {/* Skin */}
                <img
                  src={`https://mc-heads.net/body/${donor.minecraft_nick}/256`}
                  alt={`Skin de ${donor.minecraft_nick}`}
                  className="relative mx-auto"
                  style={{
                    width: '120px',
                    height: '180px',
                    objectFit: 'contain',
                    filter: `drop-shadow(0 0 20px rgba(${accentColorRgb}, 0.6)) drop-shadow(0 8px 24px rgba(0,0,0,0.8))`,
                    imageRendering: 'pixelated',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://mc-heads.net/avatar/${donor.minecraft_nick}/256`;
                  }}
                />

                {/* Sombra debajo de los pies */}
                <div
                  className="mx-auto mt-1 rounded-full"
                  style={{
                    width: '60px',
                    height: '10px',
                    background: `radial-gradient(ellipse, rgba(${accentColorRgb}, 0.4) 0%, transparent 70%)`,
                    filter: 'blur(4px)',
                  }}
                />
              </div>

              {/* Contenido de la card */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Nick */}
                <h3
                  className="font-orbitron font-bold text-2xl sm:text-3xl mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #ffe44d 60%, #ffd700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.4))',
                  }}
                >
                  {donor.minecraft_nick}
                </h3>

                {/* Estrellas */}
                <div className="flex items-center gap-1.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#ffd700"
                      style={{
                        color: '#ffd700',
                        filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.9))',
                        animation: `twinkle ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>

                {/* Separador */}
                <div
                  className="w-full mb-5 rounded-full"
                  style={{
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, rgba(${accentColorRgb}, 0.4), rgba(255,215,0,0.3), rgba(${accentColorRgb}, 0.4), transparent)`,
                  }}
                />

                {/* Monto */}
                <div
                  className="px-8 py-3 rounded-2xl text-sm font-semibold mb-4 w-full"
                  style={{
                    background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.12), rgba(255,215,0,0.08))`,
                    border: `1px solid rgba(${accentColorRgb}, 0.25)`,
                  }}
                >
                  <span className="text-gray-400">Donó </span>
                  <span
                    className="font-orbitron font-bold text-lg"
                    style={{
                      color: '#ffd700',
                      filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))',
                    }}
                  >
                    ${donor.total_spent.toFixed(2)} USD
                  </span>
                  <span className="text-gray-400"> este mes</span>
                </div>

                {/* Gracias */}
                <div className="flex items-center gap-2">
                  <Sparkles size={12} style={{ color: accentColor, opacity: 0.7 }} />
                  <p
                    className="text-xs tracking-widest uppercase font-medium"
                    style={{ color: `rgba(${accentColorRgb}, 0.8)` }}
                  >
                    ¡Gracias por apoyar el servidor!
                  </p>
                  <Sparkles size={12} style={{ color: accentColor, opacity: 0.7 }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
