import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AddressesPage from './pages/AddressesPage'
import AdminPage from './pages/AdminPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import DeliveryDashboardPage from './pages/DeliveryDashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/" element={<Layout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
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
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App
