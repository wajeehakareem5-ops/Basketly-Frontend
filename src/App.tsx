import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PlannerPage } from './features/planner/PlannerPage';
import { CatalogPage } from './features/catalog/CatalogPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';
import { DeliveryPage } from './features/delivery/DeliveryPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminOrdersPage } from './features/admin/AdminOrdersPage';
import { AdminInventoryPage } from './features/admin/AdminInventoryPage';
import { AdminSlotsPage } from './features/admin/AdminSlotsPage';
import { Leaf } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-sage">
        <div className="w-14 h-14 rounded-2xl bg-forest text-lime flex items-center justify-center animate-pulse mb-3">
          <Leaf className="w-8 h-8 fill-lime" />
        </div>
        <div className="text-sm font-bold text-forest">Loading Basketly...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-sage">
        <div className="w-14 h-14 rounded-2xl bg-forest text-lime flex items-center justify-center animate-pulse mb-3">
          <Leaf className="w-8 h-8 fill-lime" />
        </div>
        <div className="text-sm font-bold text-forest">Loading Basketly Admin...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Guard (redirects to /dashboard or /admin if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-sage">
        <div className="w-14 h-14 rounded-2xl bg-forest text-lime flex items-center justify-center animate-pulse mb-3">
          <Leaf className="w-8 h-8 fill-lime" />
        </div>
        <div className="text-sm font-bold text-forest">Loading Basketly...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#FFFFFF',
                  color: '#15291F',
                  border: '1px solid #E2EADF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(21, 41, 31, 0.08)',
                  fontSize: '13px',
                  fontWeight: 600,
                },
              }}
            />

            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="planner" element={<PlannerPage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="delivery" element={<DeliveryPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* Admin Management Routes */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/inventory"
                  element={
                    <AdminRoute>
                      <AdminInventoryPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/slots"
                  element={
                    <AdminRoute>
                      <AdminSlotsPage />
                    </AdminRoute>
                  }
                />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
