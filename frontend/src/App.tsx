import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShopkeeperDashboard } from './pages/ShopkeeperDashboard';
import { DeliveryPartnerDashboard } from './pages/DeliveryPartnerDashboard';
import { useAuthStore } from './store/authStore';

function RoleBasedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const user = useAuthStore((s) => s.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/shops/:id" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <RequireAuth>
              <OrderDetailsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            </RequireAuth>
          }
        />

        {/* Shopkeeper Routes */}
        <Route
          path="/shopkeeper/dashboard"
          element={
            <RequireAuth>
              <RoleBasedRoute allowedRoles={['shop_owner']}>
                <ShopkeeperDashboard />
              </RoleBasedRoute>
            </RequireAuth>
          }
        />

        {/* Delivery Partner Routes */}
        <Route
          path="/delivery/dashboard"
          element={
            <RequireAuth>
              <RoleBasedRoute allowedRoles={['delivery_person']}>
                <DeliveryPartnerDashboard />
              </RoleBasedRoute>
            </RequireAuth>
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

