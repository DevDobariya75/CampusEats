import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api/endpoints';
import type { Shop } from '../types/api';

export function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.shops.list();
        if (mounted) setShops(res.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) => (s.name || '').toLowerCase().includes(q));
  }, [shops, search]);

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-2xl font-black text-white md:text-3xl">
              Discover great campus food
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Browse shops, add items to cart, and place orders in minutes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 p-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5">
              <Search size={18} className="text-slate-300" />
            </div>
            <input
              className="input border-0 bg-transparent"
              placeholder="Search shops…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading shops…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">No shops found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop) => (
            <Link key={shop._id} to={`/shops/${shop._id}`} className="card p-5 transition hover:translate-y-[-2px] hover:border-white/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-white">
                    {shop.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-400 line-clamp-2">
                    {shop.description || 'Popular on-campus shop.'}
                  </div>
                </div>
                <div className={shop.isOpen ? 'rounded-xl bg-brand-500/15 px-3 py-1 text-xs font-bold text-brand-200' : 'rounded-xl bg-white/5 px-3 py-1 text-xs font-bold text-slate-300'}>
                  {shop.isOpen ? 'OPEN' : 'CLOSED'}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(shop.cuisine || []).slice(0, 3).map((c) => (
                  <span key={c} className="rounded-xl bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {c}
                  </span>
                ))}
                {shop.address?.campus ? (
                  <span className="rounded-xl bg-white/5 px-3 py-1 text-xs text-slate-200">
                    {shop.address.campus}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

