import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PageLoader } from '../ui/Feedback';

/** Customer routes: must be signed in. */
export function RequireAuth({ children }) {
  const { status, user } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') return <PageLoader />;
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

/**
 * Admin pages. This only controls what the browser shows — every admin API call is
 * independently authorised by the server.
 */
export function RequireAdmin({ children, allowPasswordChange = false }) {
  const { status, user } = useAuthStore();
  const location = useLocation();

  if (status === 'loading') return <PageLoader />;
  if (!user || user.role !== 'admin') {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (user.mustChangePassword && !allowPasswordChange) return <Navigate to="/admin/change-password" replace />;
  return children;
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
