import { useEffect, useState } from 'react';
import { Trophy, Crown, Star } from 'lucide-react';
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

      // Filter by server type based on item id prefix
      const filtered = data.filter((order) => {
        const items = order.items as Array<{ id: string }>;
        if (!items || items.length === 0) return false;
        const firstId: string = items[0].id ?? '';
        if (serverType === 'vanilla') {
          return firstId.startsWith('v-');
        } else {
          return !firstId.startsWith('v-');
        }
      });

      if (filtered.length === 0) {
        setLoading(false);
        return;
      }

      // Sum totals per nick
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
    <section className="py-20 px-4 relative">
      <div className="max-w-2xl mx-auto">
        <div ref={ref} className="reveal text-center mb-10">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{
              background: `rgba(${accentColorRgb}, 0.1)`,
              border: `1px solid rgba(${accentColorRgb}, 0.25)`,
              color: accentColor,
            }}
          >
            <Crown size={12} />
            Mayor Donante
          </span>
          <h2
            className="font-orbitron font-bold text-3xl sm:text-4xl mb-2"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #c96bff 50%, #ffd700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Top Donante
          </h2>
          <p className="text-gray-400 text-sm capitalize">
            El jugador más generoso de {monthName}
          </p>
        </div>

        <div
          ref={ref}
          className="reveal relative rounded-3xl overflow-hidden p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(15,10,35,0.95) 0%, rgba(25,10,50,0.95) 50%, rgba(10,8,25,0.95) 100%)',
            border: `1px solid rgba(${accentColorRgb}, 0.3)`,
            boxShadow: `0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(${accentColorRgb}, 0.08), inset 0 1px 0 rgba(${accentColorRgb}, 0.1)`,
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, rgba(${accentColorRgb}, 0.12) 0%, transparent 65%)`,
            }}
          />

          {/* Particle stars */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                width: `${(i % 2) + 1}px`,
                height: `${(i % 2) + 1}px`,
                top: `${10 + (i * 7) % 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                opacity: 0.08 + (i % 5) * 0.06,
                animation: `twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}

          {loading ? (
            <div className="relative z-10 py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
                style={{ background: `rgba(${accentColorRgb}, 0.2)` }}
              />
              <p className="text-gray-500 text-sm">Cargando...</p>
            </div>
          ) : !donor ? (
            <div className="relative z-10 py-8">
              <Trophy size={48} className="mx-auto mb-4 opacity-30" style={{ color: accentColor }} />
              <p className="text-gray-400 font-orbitron text-sm">
                ¡Sé el primero en donar este mes!
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              {/* Crown icon */}
              <div className="mb-2">
                <Crown
                  size={28}
                  style={{
                    color: '#ffd700',
                    filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.7))',
                    animation: 'swordGlow 2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Skin container with glow rings */}
              <div className="relative mb-6">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, rgba(${accentColorRgb}, 0.25) 0%, transparent 70%)`,
                    transform: 'scale(1.4)',
                  }}
                />
                {/* Gold ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '2px solid rgba(255,215,0,0.5)',
                    transform: 'scale(1.12)',
                    animation: 'spin-slow 8s linear infinite',
                    borderRadius: '50%',
                    background: 'transparent',
                  }}
                />
                {/* Skin image */}
                <div
                  className="relative w-36 h-36 rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.15), rgba(0,0,0,0.4))`,
                    border: `2px solid rgba(${accentColorRgb}, 0.6)`,
                    boxShadow: `0 0 30px rgba(${accentColorRgb}, 0.4), 0 0 60px rgba(${accentColorRgb}, 0.15), inset 0 0 20px rgba(0,0,0,0.3)`,
                  }}
                >
                  <img
                   src={`https://mc-heads.net/body/${donor.minecraft_nick}/256`}
                   alt={`Skin de ${donor.minecraft_nick}`}
                   className="w-full h-full object-contain scale-110"
                   onError={(e) => {
                   (e.target as HTMLImageElement).src = 
                 `https://mc-heads.net/avatar/${donor.minecraft_nick}/256`;
                     }}
                   />
                </div>
              </div>

              {/* Nick */}
              <h3
                className="font-orbitron font-bold text-2xl sm:text-3xl mb-1"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #ffe44d 60%, #ffd700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.4))',
                }}
              >
                {donor.minecraft_nick}
              </h3>

              {/* Stars decoration */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill="#ffd700"
                    style={{
                      color: '#ffd700',
                      filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.8))',
                      animation: `twinkle ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Amount */}
              <div
                className="px-6 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.15), rgba(255,215,0,0.1))`,
                  border: `1px solid rgba(${accentColorRgb}, 0.3)`,
                  color: '#e5e7eb',
                }}
              >
                Donó{' '}
                <span
                  style={{
                    color: '#ffd700',
                    fontWeight: 700,
                    filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))',
                  }}
                >
                  ${donor.total_spent.toFixed(2)} USD
                </span>{' '}
                este mes
              </div>

              {/* Thank you text */}
              <p
                className="mt-4 text-xs tracking-widest uppercase"
                style={{ color: `rgba(${accentColorRgb}, 0.7)` }}
              >
                ¡Gracias por apoyar el servidor!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}