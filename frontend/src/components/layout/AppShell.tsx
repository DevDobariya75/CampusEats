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
          isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'
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
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 font-black text-white">
              CE
            </div>
            <div>
              <div className="text-sm font-bold text-white">CampusEats</div>
              <div className="text-xs text-slate-400">Fast food, on-campus</div>
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
                <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs">
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
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <User size={18} className="text-brand-300" />
            <span className="font-semibold text-white">{user.name}</span>
            <span className="text-slate-400">({user.role})</span>
          </div>
        ) : null}
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="container-page text-sm text-slate-400">
          © {new Date().getFullYear()} CampusEats. Built with MERN.
        </div>
      </footer>
    </div>
  );
}

