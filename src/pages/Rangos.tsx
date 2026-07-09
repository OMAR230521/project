import { useState } from 'react';
import { Trophy, Star, Crown, Sparkles, Shield, Check, ShoppingCart, Sword, Package, Tag } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useReveal } from '../hooks/useReveal';

interface Rank {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  color: string;
  glowColor: string;
  icon: typeof Trophy;
  badge: string;
  popular?: boolean;
  benefits: string[];
}

const RANKS: Rank[] = [
  {
    id: 'rank-lord',
    name: 'Lord',
    price: 3.99,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    icon: Shield,
    badge: 'Mi Lord',
    benefits: [
      'Prefijo [Lord] verde',
      'Acceso a /back',
      'Set home extendido a 2 homes',
      '+20 Chunks de extendido',
      '+64 Monedas de Mercado',
      '+3 BolaCoins',
      '+Kit de Caballero',
      'Acceso garantizado al servidor aunque esté lleno',
      'Anti AFK — podés estar AFK sin que te expulse el servidor',
    ],
  },
  {
    id: 'rank-vizconde',
    name: 'Vizconde',
    price: 5.99,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    icon: Sword,
    badge: 'Mi Señor',
    benefits: [
      'Todo lo que tiene el rango [Lord]',
      'Prefijo [Vizconde] Azulado',
      'Ampliación de +50 Chunks en vez de +20',
      'Ampliación de set home a 3 en vez de 2',
      'Acceso a /anvil — Abre un yunque virtual',
      '+128 Monedas de Mercado',
      '+6 BolaCoins',
      '+3 Bola Gold',
      '+Kit de Vizconde',
    ],
  },
  {
    id: 'rank-conde',
    name: 'Conde',
    price: 9.34,
    originalPrice: 10.99,
    color: '#c96bff',
    glowColor: 'rgba(201, 107, 255, 0.4)',
    icon: Star,
    badge: 'Su Excelencia',
    popular: true,
    benefits: [
      'Todo lo que tiene el rango [Vizconde]',
      'Prefijo [Conde] Violeta',
      'Ampliación de +75 Chunks en vez de +50',
      'Ampliación de set home a 4 en vez de 3',
      'Acceso a /fly — Volar donde se te antoje',
      'Acceso a /feed — Rellenado de comida',
      '+192 Monedas de Mercado',
      '+9 BolaCoins',
      '+3 Bola Gold',
      '+5 BoDolar',
      '+1 Diamante refinado',
      '+Kit de Conde',
      'Acceso a Personalización de Chat (Colores)',
      'Eliminación de Cooldown al /tp — TP ultra rápido',
    ],
  },
  {
    id: 'rank-alteza',
    name: 'Alteza',
    price: 13.59,
    originalPrice: 15.99,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    icon: Crown,
    badge: 'Su Alteza',
    benefits: [
      'Todo lo que tiene el rango [Conde]',
      'Prefijo [Alteza] Dorado',
      'Ampliación de +150 Chunks en vez de +75',
      'Ampliación de set home a 5 en vez de 4',
      'Acceso a /heal — Llenado de toda la vida',
      'Acceso a /enderchest — Acceso rápido a tu cofre de ender',
      'Acceso a /repair — Reparación completa de armadura y herramientas',
      'Acceso a /nickname — Cambiá tu nombre en el chat con colores',
      '+256 Monedas de Mercado',
      '+12 BolaCoins',
      '+6 Bola Gold',
      '+10 BoDolar',
      '+5 Diamantes Refinados',
      '+Kit de Alteza',
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
  { id: 'acc-chunks-20', name: 'Chunks x20', price: 2.99, category: 'Extensión de Chunks', desc: '+20 Chunks para tu base', icon: '🏠' },
  { id: 'acc-chunks-50', name: 'Chunks x50', price: 6.99, category: 'Extensión de Chunks', desc: '+50 Chunks para tu base', icon: '🏠' },
  { id: 'acc-chunks-100', name: 'Chunks x100', price: 9.99, category: 'Extensión de Chunks', desc: '+100 Chunks para tu base', icon: '🏠' },
];

const INFO_ITEMS = [
  { icon: Shield, label: 'Pago seguro', desc: 'Transacciones protegidas con SSL', color: '#10b981' },
  { icon: Package, label: 'Entrega inmediata', desc: 'Rangos activados en segundos', color: '#3b82f6' },
  { icon: Tag, label: 'Suscripción mensual', desc: 'Pago por mes con beneficios variados según el Rango', color: '#ffd700' },
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
      server: 'Mods',
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
          {rank.originalPrice && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 line-through">${rank.originalPrice}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,68,68,0.15)', color: '#ff6b6b', border: '1px solid rgba(255,68,68,0.3)' }}>
                -15%
              </span>
            </div>
          )}
          <span className="text-3xl font-orbitron font-bold text-white">${rank.price}</span>
          <span className="text-sm text-gray-500 ml-1">USD / x Mes</span>
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
              onClick={() => addItem({ id: acc.id, name: acc.name, price: acc.price, quantity: 1, category: acc.category, server: 'Mods' })}
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
  const heroRef = useReveal();
  const ranksTitleRef = useReveal();
  const durationRef = useReveal();
  const accTitleRef = useReveal();

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
            Potencia tu experiencia con rangos exclusivos. Pago mensual con beneficios únicos.
          </p>
        </div>

        {/* Ranks */}
        <section className="mb-20">
          <div ref={ranksTitleRef} className="reveal flex items-center gap-3 mb-4">
            <Crown size={22} style={{ color: '#ffd700' }} />
            <h2 className="section-title font-orbitron text-2xl">Rangos</h2>
          </div>

          {/* Aviso de duración 30 días */}
          <div ref={durationRef} className="reveal mb-6">
            <div
              className="rounded-xl px-5 py-3 text-sm flex items-start gap-3"
              style={{
                background: 'rgba(255, 215, 0, 0.06)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f0b429' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-gray-300 leading-relaxed">
                <span className="font-semibold" style={{ color: '#f0b429' }}>Duración de 30 días.</span>{' '}
                Cada rango tiene una validez de 30 días desde su compra. Pasado ese período, se eliminarán todas las bonificaciones del rango,{' '}
                <span className="text-gray-200">excepto los items materiales</span> como kits y economía del servidor (monedas, BolaCoins, BolaGold, BoDólares, diamantes refinados) que ya hayas recibido.{' '}
                <span className="text-gray-400">Renová tu rango cada mes para mantener los beneficios.</span>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ paddingTop: '16px' }}>
            {RANKS.map(rank => <RankCard key={rank.id} rank={rank} />)}
          </div>
        </section>

        {/* Chunks */}
        <section className="">
          <div ref={accTitleRef} className="reveal flex items-center gap-3 mb-6">
            <Sparkles size={22} className="text-violet-400" />
            <h2 className="section-title font-orbitron text-2xl">Extensión de Chunks</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACCESSORIES.map(acc => <AccessoryCard key={acc.id} acc={acc} />)}
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