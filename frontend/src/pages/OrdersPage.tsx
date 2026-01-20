import { useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import type { Order } from '../types/api';
import { formatMoney } from '../utils/money';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.orders.list();
        if (mounted) setOrders(res.data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.response?.data?.error || 'Failed to load orders.';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-black text-white">Orders</h1>
        <p className="mt-2 text-sm text-slate-300">
          Track your recent orders and their status.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-slate-400">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-400">Order</div>
                  <div className="text-base font-extrabold text-white">
                    #{o._id.slice(-8).toUpperCase()}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="rounded-xl bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
                    {o.status.toUpperCase()}
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-white">
                    {formatMoney(o.totalPrice)}
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-300">
                {o.orderItems.slice(0, 3).map((i) => (
                  <div key={i.name} className="flex items-center justify-between gap-3">
                    <span>
                      {i.name} <span className="text-slate-500">×</span> {i.quantity}
                    </span>
                    <span className="font-bold text-white">
                      {formatMoney(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
                {o.orderItems.length > 3 ? (
                  <div className="mt-2 text-xs text-slate-500">
                    + {o.orderItems.length - 3} more item(s)
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

