import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatMoney } from '../utils/money';

export function CartPage() {
  const navigate = useNavigate();
  const shop = useCartStore((s) => s.shop);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const subtotal = items.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Your Cart</h1>
            <p className="mt-2 text-sm text-slate-300">
              {shop ? (
                <>
                  Ordering from <b className="text-white">{shop.name}</b>
                </>
              ) : (
                'Add items from a shop to start.'
              )}
            </p>
          </div>

          {items.length > 0 ? (
            <button className="btn-ghost" type="button" onClick={() => clear()}>
              <Trash2 size={18} /> Clear
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-400">
          Cart is empty. Go back to <Link className="text-brand-200 underline" to="/">shops</Link>.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((ci) => (
              <div key={ci.menuItem._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-extrabold text-white">
                      {ci.menuItem.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      {formatMoney(ci.menuItem.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => setQty(ci.menuItem._id, ci.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <div className="min-w-8 text-center text-sm font-bold text-white">
                      {ci.quantity}
                    </div>
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={() => setQty(ci.menuItem._id, ci.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => removeItem(ci.menuItem._id)}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <div className="text-lg font-black text-white">Summary</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-300">Subtotal</span>
              <span className="font-extrabold text-white">{formatMoney(subtotal)}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Delivery fee + tax will be calculated by the backend when you place the order.
            </div>
            <button
              className="btn-primary mt-4 w-full"
              type="button"
              onClick={() => navigate('/checkout')}
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

