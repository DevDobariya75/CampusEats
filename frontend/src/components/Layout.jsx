import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import NotificationBell from './NotificationBell'
import ShopStatusToggle from './ShopStatusToggle'

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

  return []
}

export default function Layout() {
  const { user, logout } = useAuth()
  const roleLinks = getRoleLinks(user?.role)
  const isShopkeeper = user?.role === 'shopkeeper'
  const isCustomer = user?.role === 'customer'
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
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">
          CampusEats
        </Link>

        <nav className="main-nav">
          {isCustomer && <NavLink to="/">Shops</NavLink>}
          {isCustomer && <NavLink to={cartShopId ? `/cart/${cartShopId}` : '/'}>Cart</NavLink>}
          {isCustomer && <NavLink to="/orders">Orders</NavLink>}
          {roleLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="top-actions">
          <ThemeToggle />
          {isShopkeeper && <ShopStatusToggle />}
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link className="btn btn-soft" to="/profile">
                Profile
              </Link>
              <button className="btn btn-soft" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-soft" to="/login">
                Login
              </Link>
              <Link className="btn" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  )
}
