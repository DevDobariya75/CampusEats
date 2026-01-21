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
      <div className="card overflow-hidden border-0 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="relative h-full">
            <img
              src="https://images.unsplash.com/photo-1604908177475-7467b7c1dc7f?auto=format&fit=crop&w=1600&q=80"
              className="h-full w-full object-cover"
              alt="Food"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ed3b4d]/80 via-[#ed3b4d]/40 to-transparent" />
          </div>
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              CampusEats • Light & Fast
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
              Fresh food across campus—delivered faster.
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Pick a shop, add your favorite bites, and track your order through each stage:
              Ordered → Preparing → Out for Delivery → Delivered.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Search size={18} />
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
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading shops…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-500">No shops found.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop, idx) => {
            const image = heroImages[idx % heroImages.length];
            return (
              <Link
                key={shop._id}
                to={`/shops/${shop._id}`}
                className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img src={image} alt={shop.name} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-600 shadow">
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-base font-extrabold text-slate-900">{shop.name}</div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {shop.description || 'Popular on-campus shop.'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(shop.cuisine || []).slice(0, 3).map((c) => (
                      <span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {c}
                      </span>
                    ))}
                    {shop.address?.campus ? (
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                        {shop.address.campus}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const heroImages = [
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80'
];

