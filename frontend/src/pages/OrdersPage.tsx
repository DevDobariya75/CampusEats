import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/endpoints';
import type { Order } from '../types/api';
import { formatMoney } from '../utils/money';
import { ChevronRight, Loader } from 'lucide-react';

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
        <h1 className="text-2xl font-black text-slate-900">Orders</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track your recent orders and their status.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader className="animate-spin" size={16} /> Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-slate-500">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm text-slate-500">Order</div>
                  <div className="text-base font-extrabold text-slate-900">
                    #{o._id.slice(-8).toUpperCase()}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                    {o.status.toUpperCase()}
                  </div>
                  <div className="mt-2 text-sm font-extrabold text-slate-900">
                    {formatMoney(o.totalPrice)}
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-700">
                {o.orderItems.slice(0, 3).map((i) => (
                  <div key={i.name} className="flex items-center justify-between gap-3">
                    <span>
                      {i.name} <span className="text-slate-500">×</span> {i.quantity}
                    </span>
                    <span className="font-bold text-slate-900">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

