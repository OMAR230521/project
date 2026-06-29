import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, User, AlertTriangle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function CartSidebar() {
  const { items, isOpen, setCartOpen, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState<'cart' | 'nickname' | 'payment'>('cart');
  const [nick, setNick] = useState('');
  const [nickError, setNickError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const validateNick = (value: string) => {
    if (!value.trim()) return 'El NickName es obligatorio.';
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(value)) return 'NickName inválido (3-16 caracteres, solo letras, números y _).';
    return '';
  };

  const handleNickSubmit = () => {
    const err = validateNick(nick);
    if (err) { setNickError(err); return; }
    setNickError('');
    setStep('payment');
  };

  const handleCheckout = async (method: 'stripe' | 'paypal') => {
    setLoading(true);
    setCheckoutError('');
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category, server: i.server })),
          minecraft_nick: nick.trim(),
          payment_method: method,
        },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || 'Error al crear sesión de pago');
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setCheckoutError(msg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={() => { setCartOpen(false); setStep('cart'); }}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col animate-slide-in"
        style={{
          background: 'rgba(8, 8, 20, 0.98)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(179, 71, 255, 0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-900/30">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-violet-400" />
            <span className="font-orbitron font-semibold text-sm text-white tracking-wide">
              {step === 'cart' ? 'CARRITO' : step === 'nickname' ? 'TU NICK' : 'PAGAR'}
            </span>
          </div>
          <button
            onClick={() => { setCartOpen(false); setStep('cart'); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <ShoppingBag size={40} className="text-gray-700" />
                  <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
                  <p className="text-gray-600 text-xs">Explora los rangos y accesorios</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="glass rounded-xl p-3 flex gap-3">
                      <div className="flex-1 min-w-0">
                        {item.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium mb-1 inline-block"
                            style={{
                              background: 'rgba(147, 51, 234, 0.2)',
                              color: '#c96bff',
                              border: '1px solid rgba(179, 71, 255, 0.25)',
                            }}>
                            {item.badge}
                          </span>
                        )}
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                        {item.server && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block"
                            style={{
                              background: item.server === 'Vanilla' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                              color: item.server === 'Vanilla' ? '#86efac' : '#c96bff',
                              border: item.server === 'Vanilla' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(179, 71, 255, 0.3)',
                            }}>
                            {item.server === 'Vanilla' ? '🌿 Vanilla' : '⚡ Mods'}
                          </span>
                        )}
                        <p className="text-sm font-bold mt-1 text-gradient-gold"
                          style={{
                            background: 'linear-gradient(135deg, #ffe44d, #f0b429)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeItem(item.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-all">
                            <Minus size={10} />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold text-white">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-all">
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'nickname' && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-gold-400 mt-0.5 flex-shrink-0" style={{ color: '#ffd700' }} />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    <span className="font-semibold text-yellow-300">Importante:</span> Verifica que el NickName esté correcto. Los productos se entregarán a ese jugador y no se podrán reasignar.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={14} className="inline mr-1.5 text-violet-400" />
                  NickName de Minecraft
                </label>
                <input
                  type="text"
                  value={nick}
                  onChange={e => { setNick(e.target.value); setNickError(''); }}
                  placeholder="TuNickName"
                  maxLength={16}
                  className={`w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${
                    nickError ? 'border border-red-500/50' : 'border border-violet-500/30'
                  }`}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                  }}
                />
                {nickError && <p className="mt-1.5 text-xs text-red-400">{nickError}</p>}
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Entregando a:</p>
                <p className="font-bold text-white font-orbitron tracking-wide">{nick}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Método de pago</p>
                <button
                  onClick={() => handleCheckout('stripe')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #635bff 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 20px rgba(99, 91, 255, 0.3)',
                    color: '#fff',
                    border: '1px solid rgba(99, 91, 255, 0.3)',
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Pagar con Tarjeta Débito/Crédito
                </button>
              </div>

              {checkoutError && (
                <div className="rounded-xl p-3 text-xs text-red-300 border border-red-500/20 bg-red-900/10">
                  {checkoutError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-violet-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-lg font-bold font-orbitron"
                style={{
                  background: 'linear-gradient(135deg, #ffe44d, #f0b429)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {step === 'cart' && (
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="flex-none px-3 py-2.5 rounded-xl text-xs text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all border border-white/5"
                >
                  Vaciar
                </button>
                <button
                  onClick={() => setStep('nickname')}
                  className="flex-1 btn-primary text-sm py-2.5"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 'nickname' && (
              <div className="flex gap-2">
                <button onClick={() => setStep('cart')}
                  className="flex-none px-3 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 transition-all">
                  Atrás
                </button>
                <button onClick={handleNickSubmit} className="flex-1 btn-primary text-sm py-2.5">
                  Confirmar Nick
                </button>
              </div>
            )}

            {step === 'payment' && (
              <button onClick={() => setStep('nickname')}
                className="w-full py-2.5 rounded-xl text-xs text-gray-400 hover:text-white border border-white/5 hover:bg-white/5 transition-all">
                Cambiar Nick
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
