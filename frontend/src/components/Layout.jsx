import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  UserRoundPlus,
} from 'lucide-react'
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

const getMobileNavLinks = ({ user, isCustomer, cartShopId }) => {
  if (!user) {
    return [
      { to: '/', label: 'Shops', icon: Store, matchStartsWith: false },
      { to: '/login', label: 'Login', icon: LogIn, matchStartsWith: false },
      { to: '/register', label: 'Register', icon: UserRoundPlus, matchStartsWith: false },
    ]
  }

  if (isCustomer) {
    return [
      { to: '/', label: 'Food', icon: Home, matchStartsWith: false },
      { to: cartShopId ? `/cart/${cartShopId}` : '/', label: 'Cart', icon: ShoppingCart, matchStartsWith: true },
      { to: '/orders', label: 'Orders', icon: ClipboardList, matchStartsWith: true },
      { to: '/notifications', label: 'Alerts', icon: Bell, matchStartsWith: true },
      { to: '/profile', label: 'Profile', icon: UserRound, matchStartsWith: true },
    ]
  }

  if (user.role === 'shopkeeper') {
    return [
      { to: '/shop-dashboard', label: 'Dashboard', icon: Store, matchStartsWith: true },
      { to: '/shop-items', label: 'Items', icon: ShoppingBag, matchStartsWith: true },
      { to: '/notifications', label: 'Alerts', icon: Bell, matchStartsWith: true },
      { to: '/profile', label: 'Profile', icon: UserRound, matchStartsWith: true },
    ]
  }

  if (user.role === 'delivery') {
    return [
      { to: '/delivery-dashboard', label: 'Rides', icon: Truck, matchStartsWith: true },
      { to: '/notifications', label: 'Alerts', icon: Bell, matchStartsWith: true },
      { to: '/profile', label: 'Profile', icon: UserRound, matchStartsWith: true },
    ]
  }

  if (user.role === 'admin') {
    return [
      { to: '/admin', label: 'Admin', icon: ShieldCheck, matchStartsWith: true },
      { to: '/notifications', label: 'Alerts', icon: Bell, matchStartsWith: true },
      { to: '/profile', label: 'Profile', icon: UserRound, matchStartsWith: true },
    ]
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
  const mobileNavLinks = getMobileNavLinks({ user, isCustomer, cartShopId })

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
      <header className="sticky top-0 z-[70] w-full bg-white/88 dark:bg-[#060B13]/84 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-[0_6px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 sm:h-12 md:h-[3.4rem] flex items-center justify-between gap-2 sm:gap-4">
          <Link className="font-display font-black text-[1.35rem] sm:text-[1.5rem] text-orange-500 dark:text-orange-400 tracking-wide hover:text-orange-600 dark:hover:text-orange-300 transition-colors leading-none" to="/">
            CampusEats
          </Link>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-3.5 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to="/"
              >
                Shops
              </NavLink>
            )}
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-3.5 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to={cartShopId ? `/cart/${cartShopId}` : '/'}
              >
                Cart
              </NavLink>
            )}
            {isCustomer && (
              <NavLink 
                className={({isActive}) => `px-3.5 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to="/orders"
              >
                Orders
              </NavLink>
            )}
            {roleLinks.map((link) => (
              <NavLink 
                key={link.to} 
                className={({isActive}) => `px-3.5 py-2 font-bold text-sm rounded-xl transition-all ${isActive ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`} 
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <ThemeToggle />
            {isShopkeeper && <ShopStatusToggle />}
            {user && <NotificationBell />}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 sm:ml-1.5 sm:border-l border-slate-200 dark:border-white/10 sm:pl-3">
                <Link to="/profile" className="relative group rounded-full p-1 border border-slate-200 dark:border-white/10 hover:border-orange-500/50 transition-colors">
                  <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user.name || 'User')}</span>
                    )}
                  </motion.div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                  type="button"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 ml-2 border-l border-slate-200 dark:border-white/10 pl-4">
                <Link className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold text-sm rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all" to="/login">
                  Login
                </Link>
                <Link className="px-5 py-2.5 bg-orange-500 text-white font-black text-sm rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all uppercase tracking-wider" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`relative z-10 pb-[5.6rem] md:pb-0 ${isHomeRoute ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12'}`}>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-[80] md:hidden px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2.5 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#060B13] dark:via-[#060B13]/95 dark:to-transparent">
        <div className="mx-auto w-full max-w-[28rem] rounded-[1.2rem] border border-slate-200/90 dark:border-white/10 bg-white/92 dark:bg-[#0B1220]/92 backdrop-blur-xl shadow-[0_12px_36px_rgba(2,6,23,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.52)] px-1.5 py-1.5">
          <div className="grid items-center gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(mobileNavLinks.length, 3)}, minmax(0, 1fr))` }}>
            {mobileNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = link.matchStartsWith
                ? location.pathname.startsWith(link.to)
                : location.pathname === link.to

              return (
                <NavLink
                  key={`${link.to}-${link.label}`}
                  to={link.to}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2.5 transition-all duration-200 ${isActive ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.38)] scale-[1.01]' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-white/10'}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="text-[10px] font-bold tracking-[0.04em] uppercase leading-none text-center">{link.label}</span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

