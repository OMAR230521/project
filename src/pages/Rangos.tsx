import { useState } from 'react';
import { Trophy, Star, Crown, Sparkles, Shield, Check, ShoppingCart, Sword, Package, Tag } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';

interface Rank {
  id: string;
  name: string;
  price: number;
  color: string;
  glowColor: string;
  icon: typeof Trophy;
  badge: string;
  popular?: boolean;
  benefits: string[];
}

const RANKS: Rank[] = [
  {
    id: 'rank-aventurero',
    name: 'Aventurero',
    price: 4.99,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: Shield,
    badge: 'AVENTURERO',
    benefits: [
      'Prefijo [Aventurero] verde',
      'Kit de bienvenida',
      'Acceso a /fly en lobby',
      '3 homes adicionales',
      'Color en el chat',
      'Prioridad de cola',
    ],
  },
  {
    id: 'rank-guerrero',
    name: 'Guerrero',
    price: 9.99,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    icon: Sword,
    badge: 'GUERRERO',
    benefits: [
      'Todo lo de Aventurero',
      'Prefijo [Guerrero] azul',
      'Kit especial diario',
      '6 homes adicionales',
      'Partículas básicas',
      'Acceso a arena PvP VIP',
      'Mascota básica',
    ],
  },
  {
    id: 'rank-legendario',
    name: 'Legendario',
    price: 19.99,
    color: '#c96bff',
    glowColor: 'rgba(201, 107, 255, 0.4)',
    icon: Star,
    badge: 'LEGENDARIO',
    popular: true,
    benefits: [
      'Todo lo de Guerrero',
      'Prefijo [Legendario] violeta',
      'Kit premium semanal',
      '12 homes adicionales',
      'Partículas épicas',
      'Mascota legendaria',
      'Título personalizable',
      'Acceso beta de eventos',
      'Discord VIP',
    ],
  },
  {
    id: 'rank-supremo',
    name: 'Supremo',
    price: 34.99,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    icon: Crown,
    badge: 'SUPREMO',
    benefits: [
      'Todo lo de Legendario',
      'Prefijo [Supremo] dorado',
      'Kit Supremo mensual',
      'Homes ilimitados',
      'Partículas exclusivas',
      'Aura cosmica única',
      'Mascota mítica',
      'Efectos de titulo',
      'Canal privado Discord',
      'Nombre en el servidor',
      'Soporte prioritario',
    ],
  },
  {
    id: 'rank-eterno',
    name: 'Eterno',
    price: 49.99,
    color: '#ff4444',
    glowColor: 'rgba(255, 68, 68, 0.4)',
    icon: Sparkles,
    badge: 'ETERNO',
    benefits: [
      'Todo lo de Supremo',
      'Prefijo [Eterno] rojo',
      'Kit Eterno semanal',
      'Efecto especial único',
    ],
  },
];

interface Accessory {
  id: string;
  name: string;
  price: number;
  category: string;
  desc: string;
  icon: string;
}

const ACCESSORIES: Accessory[] = [
  { id: 'acc-particulas-fuego', name: 'Partículas de Fuego', price: 2.99, category: 'Partículas', desc: 'Efecto de llamas a tu alrededor', icon: '🔥' },
  { id: 'acc-particulas-hielo', name: 'Partículas de Hielo', price: 2.99, category: 'Partículas', desc: 'Cristales de hielo flotantes', icon: '❄️' },
  { id: 'acc-particulas-galaxia', name: 'Partículas Galaxia', price: 4.99, category: 'Partículas', desc: 'Estrellas y nebulosas cósmicas', icon: '✨' },
  { id: 'acc-mascota-dragon', name: 'Mascota Dragón', price: 7.99, category: 'Mascotas', desc: 'Un dragón bebé te acompaña', icon: '🐉' },
  { id: 'acc-mascota-lobo', name: 'Mascota Lobo Cósmico', price: 5.99, category: 'Mascotas', desc: 'Lobo con aura estelar', icon: '🐺' },
  { id: 'acc-titulo-heroe', name: 'Título: Héroe', price: 1.99, category: 'Títulos', desc: 'Mostrar "Héroe" sobre tu cabeza', icon: '🏆' },
  { id: 'acc-titulo-guardian', name: 'Título: Guardián', price: 1.99, category: 'Títulos', desc: 'Mostrar "Guardián" sobre tu cabeza', icon: '🛡️' },
  { id: 'acc-cosmetic-wings', name: 'Alas de Angel', price: 6.99, category: 'Cosméticos', desc: 'Alas decorativas blancas', icon: '👼' },
  { id: 'acc-efecto-rainbow', name: 'Efecto Arcoíris', price: 3.99, category: 'Efectos', desc: 'Colores de arcoíris en tu nombre', icon: '🌈' },
];

const ACC_CATEGORIES = ['Todos', 'Partículas', 'Mascotas', 'Títulos', 'Cosméticos', 'Efectos'];

const INFO_ITEMS = [
  { icon: Shield, label: 'Pago seguro', desc: 'Transacciones protegidas con SSL', color: '#10b981' },
  { icon: Package, label: 'Entrega inmediata', desc: 'Rangos activados en segundos', color: '#3b82f6' },
  { icon: Tag, label: 'Sin suscripción', desc: 'Pago único, beneficios permanentes', color: '#ffd700' },
];

function RankCard({ rank }: { rank: Rank }) {
  const { addItem, items } = useCart();
  const ref = useReveal();
  const inCart = items.some(i => i.id === rank.id);

  const handleAdd = () => {
    const item: CartItem = {
      id: rank.id,
      name: `Rango ${rank.name}`,
      price: rank.price,
      quantity: 1,
      category: 'Rango',
      badge: rank.badge,
    };
    addItem(item);
  };

  return (
    <div ref={ref} className="reveal rank-card relative"
      style={{
        border: rank.popular ? `1px solid ${rank.color}50` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: rank.popular ? `0 0 30px ${rank.glowColor}` : 'none',
      }}>
      {rank.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-orbitron tracking-widest z-10"
          style={{
            background: `linear-gradient(135deg, ${rank.color}, rgba(147,51,234,0.8))`,
            color: '#fff',
            boxShadow: `0 4px 15px ${rank.glowColor}`,
          }}>
          POPULAR
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${rank.color} 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${rank.color}20`, border: `1px solid ${rank.color}35` }}>
            <rank.icon size={22} style={{ color: rank.color }} />
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg font-orbitron tracking-wider"
            style={{ background: `${rank.color}15`, color: rank.color, border: `1px solid ${rank.color}30` }}>
            {rank.badge}
          </span>
        </div>

        <h3 className="font-orbitron font-bold text-xl mb-1" style={{ color: rank.color }}>
          {rank.name}
        </h3>

        <div className="mb-5">
          <span className="text-3xl font-orbitron font-bold text-white">${rank.price}</span>
          <span className="text-sm text-gray-500 ml-1">USD / único pago</span>
        </div>

        <ul className="space-y-2 mb-6">
          {rank.benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              <Check size={13} style={{ color: rank.color, flexShrink: 0 }} />
              <span className="text-gray-300">{b}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
          style={
            inCart
              ? { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }
              : { background: `linear-gradient(135deg, ${rank.color}cc, ${rank.color}88)`, border: `1px solid ${rank.color}40`, color: '#fff', boxShadow: `0 4px 20px ${rank.glowColor}` }
          }
        >
          {inCart ? <><Check size={15} />En el carrito</> : <><ShoppingCart size={15} />Agregar al carrito</>}
        </button>
      </div>
    </div>
  );
}

function AccessoryCard({ acc }: { acc: Accessory }) {
  const { addItem, items } = useCart();
  const ref = useReveal();
  const inCart = items.some(i => i.id === acc.id);

  return (
    <div ref={ref} className="reveal glass rounded-xl p-4 glass-hover">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{acc.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{acc.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{acc.desc}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#c96bff', border: '1px solid rgba(179, 71, 255, 0.25)' }}>
              {acc.category}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-sm" style={{ color: '#ffd700' }}>${acc.price}</span>
            <button
              onClick={() => addItem({ id: acc.id, name: acc.name, price: acc.price, quantity: 1, category: acc.category })}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
              style={
                inCart
                  ? { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399' }
                  : { background: 'rgba(147, 51, 234, 0.15)', border: '1px solid rgba(179, 71, 255, 0.25)', color: '#c96bff' }
              }
            >
              {inCart ? <Check size={11} /> : <ShoppingCart size={11} />}
              {inCart ? 'Añadido' : 'Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ item }: { item: typeof INFO_ITEMS[0] }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal glass rounded-2xl p-5 flex items-center gap-3 glass-hover">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
        <item.icon size={18} style={{ color: item.color }} />
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{item.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
      </div>
    </div>
  );
}

export default function Rangos() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const heroRef = useReveal();
  const ranksTitleRef = useReveal();
  const accTitleRef = useReveal();

  const filteredAcc = activeCategory === 'Todos'
    ? ACCESSORIES
    : ACCESSORIES.filter(a => a.category === activeCategory);

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div ref={heroRef} className="reveal text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #2d1a00 0%, #1a0d00 100%)',
              border: '2px solid rgba(255, 215, 0, 0.4)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)',
            }}>
            <Trophy size={36} style={{ color: '#ffd700' }} />
          </div>
          <h1 className="section-title font-orbitron text-4xl sm:text-5xl mb-4">
            Tienda BolaLand
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mx-auto">
            Potencia tu experiencia con rangos exclusivos y accesorios únicos. Pago único, beneficios permanentes.
          </p>
        </div>

        {/* Ranks */}
        <section className="mb-20">
          <div ref={ranksTitleRef} className="reveal flex items-center gap-3 mb-8">
            <Crown size={22} style={{ color: '#ffd700' }} />
            <h2 className="section-title font-orbitron text-2xl">Rangos</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ paddingTop: '16px' }}>
            {RANKS.map(rank => <RankCard key={rank.id} rank={rank} />)}
          </div>
        </section>

        {/* Accessories - oculto, no eliminar */}
        <section className="hidden">
          <div ref={accTitleRef} className="reveal flex items-center gap-3 mb-6">
            <Sparkles size={22} className="text-violet-400" />
            <h2 className="section-title font-orbitron text-2xl">Accesorios</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {ACC_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={
                  activeCategory === cat
                    ? { background: 'rgba(147, 51, 234, 0.25)', border: '1px solid rgba(179, 71, 255, 0.45)', color: '#c96bff' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAcc.map(acc => <AccessoryCard key={acc.id} acc={acc} />)}
          </div>
        </section>

        {/* Info boxes */}
        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {INFO_ITEMS.map(item => <InfoCard key={item.label} item={item} />)}
        </div>
      </div>
    </div>
  );
}