import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import StoreLayout from './components/layout/StoreLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { RequireAdmin, RequireAuth, ScrollToTop } from './components/routing/Guards';
import { EmptyState, PageLoader } from './components/ui/Feedback';
import Button from './components/ui/Button';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { ForgotPassword, ResetPassword } from './pages/auth/PasswordReset';

// Less-visited areas are split into their own chunks.
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const Account = lazy(() => import('./pages/account/Account'));
const OrderDetails = lazy(() => import('./pages/account/OrderDetails'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminChangePassword = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminChangePassword })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));

function NotFound() {
  return (
    <div className="container-page">
      <EmptyState title="Page not found" description="The page you’re looking for doesn’t exist or has moved." action={<Button to="/">Back to the store</Button>} />
    </div>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const location = useLocation();
  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <ScrollToTop />
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="payment/callback" element={<RequireAuth><PaymentCallback /></RequireAuth>} />
              <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
              <Route path="account/orders/:id" element={<RequireAuth><OrderDetails /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
  
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin/change-password" element={<RequireAdmin allowPasswordChange><AdminChangePassword /></RequireAdmin>} />
            <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/create" element={<ProductForm key="create" />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
