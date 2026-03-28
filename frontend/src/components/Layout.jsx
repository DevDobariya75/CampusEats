import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import NotificationBell from './NotificationBell'
import ShopStatusToggle from './ShopStatusToggle'
import { getInitials } from '../utils/helpers'

const getRoleLinks = (role) => {
  if (role === 'shopkeeper') {
    return [
      { to: '/shop-dashboard', label: 'Shop Dashboard' },
      { to: '/shop-items', label: 'Shop Items' },
    ]
  }

  if (role === 'delivery') {
    return [{ to: '/delivery-dashboard', label: 'Delivery Dashboard' }]
  }

  if (role === 'admin') {
    return [{ to: '/admin', label: 'Admin Dashboard' }]
  }

  return []
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const roleLinks = getRoleLinks(user?.role)
  const isShopkeeper = user?.role === 'shopkeeper'
  const isCustomer = user?.role === 'customer'
  const isHomeRoute = location.pathname === '/'
  const [cartShopId, setCartShopId] = useState(() => localStorage.getItem('activeCartShopId') || '')

  useEffect(() => {
    if (!isCustomer) {
      return undefined
    }

    const syncCartShop = () => {
      setCartShopId(localStorage.getItem('activeCartShopId') || '')
    }

    window.addEventListener('storage', syncCartShop)
    window.addEventListener('campus-cart-updated', syncCartShop)

    return () => {
      window.removeEventListener('storage', syncCartShop)
      window.removeEventListener('campus-cart-updated', syncCartShop)
    }
  }, [isCustomer])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] font-sans transition-colors duration-300">
      <header className="sticky top-0 z-[60] w-full bg-white/80 dark:bg-[#060B13]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <Link className="font-display font-black text-2xl text-sky-400 tracking-wider hover:text-sky-300 transition-colors" to="/">
            CampusEats
          </Link>

          <nav className="flex items-center gap-2">
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-4 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to="/"
              >
                Shops
              </NavLink>
            )}
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-4 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to={cartShopId ? `/cart/${cartShopId}` : '/'}
              >
                Cart
              </NavLink>
            )}
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-4 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to="/orders"
              >
                Orders
              </NavLink>
            )}
            {roleLinks.map((link) => (
              <NavLink 
                key={link.to} 
                className={({isActive}) => `px-4 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isShopkeeper && <ShopStatusToggle />}
            {user && <NotificationBell />}
            {user ? (
              <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-white/10 pl-4">
                <Link to="/profile" className="relative group rounded-full p-1 border border-slate-200 dark:border-white/10 hover:border-sky-500/50 transition-colors">
                  <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user.name || 'User')}</span>
                    )}
                  </motion.div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                  type="button"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-white/10 pl-4">
                <Link className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold text-sm rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all" to="/login">
                  Login
                </Link>
                <Link className="px-5 py-2.5 bg-sky-500 text-white font-black text-sm rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:bg-sky-400 transition-all uppercase tracking-wider" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`relative z-10 ${isHomeRoute ? '' : 'max-w-7xl mx-auto px-6 py-12'}`}>
        <Outlet />
      </main>
    </div>
  )
}
