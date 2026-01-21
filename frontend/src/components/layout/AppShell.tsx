import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

function NavItem({
  to,
  children
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'rounded-xl px-3 py-2 text-sm font-semibold transition',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
        )
      }
    >
      {children}
    </NavLink>
  );
}

import clsx from 'clsx';

export function AppShell() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const cartCount = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0)
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 font-black text-white shadow">
              CE
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">CampusEats</div>
              <div className="text-xs text-slate-500">Fast food, on-campus</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavItem to="/">Shops</NavItem>
            <NavItem to="/orders">Orders</NavItem>
            <NavItem to="/profile">Profile</NavItem>
          </nav>

          <div className="flex items-center gap-2">
            <button
              className="btn-ghost"
              onClick={() => navigate('/cart')}
              type="button"
              title="Cart"
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              {cartCount > 0 ? (
                <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  {cartCount}
                </span>
              ) : null}
            </button>

            {token ? (
              <button
                className="btn-ghost"
                onClick={() => logout()}
                type="button"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link className="btn-primary" to="/login">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {user ? (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <User size={18} className="text-brand-500" />
            <span className="font-semibold text-slate-900">{user.name}</span>
            <span className="text-slate-500">({user.role})</span>
          </div>
        ) : null}
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-10">
        <div className="container-page text-sm text-slate-500">
          © {new Date().getFullYear()} CampusEats. Built with MERN.
        </div>
      </footer>
    </div>
  );
}

