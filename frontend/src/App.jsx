import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import './App.css'
import Layout from './components/Layout'
import WelcomeSplash from './components/WelcomeSplash'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AddressesPage from './pages/AddressesPage'
import AdminPage from './pages/AdminPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import DeliveryDashboardPage from './pages/DeliveryDashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HowItWorksPage from './pages/HowItWorksPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ShopDashboardPage from './pages/ShopDashboardPage'
import ShopDetailPage from './pages/ShopDetailPage'
import ShopItemsPage from './pages/ShopItemsPage'
import ShopsPage from './pages/ShopsPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
function RootRedirect() {
  const { user } = useAuth()
  
  if(user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (user?.role === 'shopkeeper') {
    return <Navigate to="/shop-dashboard" replace />
  }

  if (user?.role === 'delivery') {
    return <Navigate to="/delivery-dashboard" replace />
  }

  return <ShopsPage />
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Don't show splash for specific routes
    const noSplashRoutes = ['/how-it-works', '/login', '/register', '/forgot-password', '/verify-otp']
    if (noSplashRoutes.includes(location.pathname)) {
      setShowSplash(false)
      return
    }

    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1700)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <>
      <AnimatePresence>{showSplash && <WelcomeSplash />}</AnimatePresence>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

      <Route path="/" element={<Layout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route index element={<RootRedirect />} />
        <Route path="shops/:shopId" element={<ShopDetailPage />} />

        <Route
          path="cart/:shopId"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="checkout/:shopId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="addresses"
          element={
            <ProtectedRoute>
              <AddressesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="shop-dashboard"
          element={
            <ProtectedRoute roles={["shopkeeper", "admin"]}>
              <ShopDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="shop-items"
          element={
            <ProtectedRoute roles={["shopkeeper", "admin"]}>
              <ShopItemsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="delivery-dashboard"
          element={
            <ProtectedRoute roles={["delivery", "admin"]}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
