import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { api } from '../api/endpoints';
import type { MenuItem, Shop } from '../types/api';
import { useCartStore } from '../store/cartStore';
import { formatMoney } from '../utils/money';

export function ShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cartShop = useCartStore((s) => s.shop);
  const cartItems = useCartStore((s) => s.items);
  const setShopForCart = useCartStore((s) => s.setShop);
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const [shopRes, itemsRes] = await Promise.all([
          api.shops.get(id),
          api.menuItems.byShop(id)
        ]);
        if (!mounted) return;
        setShop(shopRes.data);
        setItems(itemsRes.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, i) => acc + i.menuItem.price * i.quantity, 0);
  }, [cartItems]);

  if (loading) return <div className="text-sm text-slate-400">Loading…</div>;
  if (!shop) return <div className="text-sm text-slate-400">Shop not found.</div>;

  const cartIsDifferentShop = !!(
    cartShop && cartShop._id !== shop._id && cartItems.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{shop.name}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {shop.description || 'Order your favorites in minutes.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              {shop.address?.campus ? (
                <span className="rounded-xl bg-white/5 px-3 py-1">
                  {shop.address.campus}
                </span>
              ) : null}
              <span className="rounded-xl bg-white/5 px-3 py-1">
                Delivery ~ {shop.deliveryTime ?? 30} min
              </span>
              <span className="rounded-xl bg-white/5 px-3 py-1">
                Fee {formatMoney(shop.deliveryFee ?? 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setShopForCart(shop);
              }}
              title="Start cart for this shop"
            >
              <ShoppingBag size={18} />
              Use this shop
            </button>
          </div>
        </div>

        {cartIsDifferentShop ? (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Your cart has items from another shop. Click <b>Use this shop</b> to
            start a new cart.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.length === 0 ? (
            <div className="text-sm text-slate-400">No menu items yet.</div>
          ) : (
            items.map((item) => {
              const cartItem = cartItems.find((ci) => ci.menuItem._id === item._id);
              const qty = cartItem?.quantity ?? 0;
              return (
                <div key={item._id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-extrabold text-white">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {item.description || item.category}
                      </div>
                      <div className="mt-3 text-sm font-bold text-brand-200">
                        {formatMoney(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <>
                          <button
                            className="btn-ghost"
                            type="button"
                            onClick={() => setQty(item._id, qty - 1)}
                          >
                            <Minus size={16} />
                          </button>
                          <div className="min-w-8 text-center text-sm font-bold text-white">
                            {qty}
                          </div>
                          <button
                            className="btn-primary"
                            type="button"
                            onClick={() => setQty(item._id, qty + 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-primary"
                          type="button"
                          onClick={() => {
                            setShopForCart(shop);
                            addItem(item);
                          }}
                          disabled={cartIsDifferentShop}
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card p-5">
          <div className="text-lg font-black text-white">Cart</div>
          <div className="mt-1 text-sm text-slate-400">
            {cartItems.length === 0 ? 'Your cart is empty.' : 'Ready to checkout.'}
          </div>

          {cartItems.length > 0 ? (
            <>
              <div className="mt-4 space-y-2">
                {cartItems.map((ci) => (
                  <div key={ci.menuItem._id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="text-slate-200">
                      {ci.menuItem.name} <span className="text-slate-500">×</span>{' '}
                      {ci.quantity}
                    </div>
                    <div className="font-bold text-white">
                      {formatMoney(ci.menuItem.price * ci.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-sm text-slate-300">Subtotal</div>
                <div className="text-sm font-extrabold text-white">
                  {formatMoney(cartTotal)}
                </div>
              </div>
              <a className="btn-primary mt-4 w-full" href="/checkout">
                Checkout
              </a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

