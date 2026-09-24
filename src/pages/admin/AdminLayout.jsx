import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, FolderTree, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Users, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/layout/Logo';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/users', label: 'Users', icon: Users },
];

function Sidebar({ onNavigate }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-ink-900 text-ink-200">
      <div className="flex h-16 items-center px-5">
        <Logo to="/admin/dashboard" inverted />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`
            }
          >
            <Icon className="h-5 w-5" aria-hidden /> {label}
          </NavLink>
        ))}
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-5 w-5" aria-hidden /> View store
        </a>
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
        <p className="truncate text-xs text-ink-400">{user?.email}</p>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/admin/login', { replace: true });
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </aside>

      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="-ml-2 rounded-lg p-2 hover:bg-ink-50" aria-label="Open admin menu">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-display text-sm font-bold">Admin</span>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate('/admin/login', { replace: true });
          }}
          className="-mr-2 rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-4 -right-12 rounded-lg bg-white p-2" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
