import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Loader2, LogOut, Menu, Package, Search, ShoppingBag, User, X } from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';
import { useAuthStore } from '../../store/authStore';
import { selectCartCount, useCartStore } from '../../store/cartStore';
import { useCategories } from '../../lib/queries';

function SearchBox({ className = '', autoFocus = false, onSubmitted }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [term, setTerm] = useState(params.get('search') || '');

  useEffect(() => {
    setTerm(params.get('search') || '');
  }, [params]);

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = term.trim();
        navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
        onSubmitted?.();
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden />
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        autoFocus={autoFocus}
        className="h-11 w-full rounded-xl border border-ink-100 bg-ink-50/60 pr-4 pl-10 text-sm placeholder:text-ink-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
      />
    </form>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useCartStore(selectCartCount);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { data: categories } = useCategories();

  const logOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setMenuOpen(false);
    toast.success('You’ve been logged out.');
    navigate('/', { replace: true });
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center gap-4 lg:gap-8">
        <button
          type="button"
          className="-ml-2 rounded-lg p-2 text-ink-700 hover:bg-ink-50 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Logo />

        <SearchBox className="hidden max-w-md flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 sm:flex">
                  <LayoutDashboard className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link to="/account" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 sm:px-3">
                <User className="h-5 w-5" aria-hidden />
                <span className="hidden max-w-28 truncate sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                <span className="sr-only sm:hidden">My account</span>
              </Link>
              <button
                type="button"
                onClick={logOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 sm:px-3"
                title="Log out"
              >
                {signingOut ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <LogOut className="h-5 w-5" aria-hidden />}
                <span className="hidden md:inline">Log out</span>
                <span className="sr-only md:hidden">Log out</span>
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Log in
              </Link>
              <Link to="/register" className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800">
                Register
              </Link>
            </div>
          )}

          <Link to="/cart" className="relative rounded-lg p-2.5 text-ink-700 hover:bg-ink-50" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag className="h-6 w-6" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-ink-100/70 lg:block" aria-label="Categories">
        <div className="container-page flex h-12 items-center gap-1 overflow-x-auto scrollbar-none">
          <NavLink to="/products" end className={navClass}>
            All products
          </NavLink>
          {categories?.map((c) => (
            <NavLink key={c.id} to={`/products?category=${c.slug}`} className={() => navClass({ isActive: location.search.includes(`category=${c.slug}`) })}>
              {c.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-ink-100/70 px-4 py-2.5 md:hidden">
        <SearchBox />
      </div>

      {/* Mobile drawer. Portalled to <body>: the header's backdrop-filter would otherwise
          become the containing block for position:fixed and trap the drawer inside the header. */}
      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl">
              <div className="flex h-[72px] items-center justify-between border-b border-ink-100 px-4">
                <Logo />
                <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 hover:bg-ink-50" aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-5">
                <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-ink-300 uppercase">Shop</p>
                <Link to="/products" className="block rounded-lg px-3 py-2.5 font-medium hover:bg-ink-50">
                  All products
                </Link>
                {categories?.map((c) => (
                  <Link key={c.id} to={`/products?category=${c.slug}`} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-ink-50">
                    {c.name}
                  </Link>
                ))}
                <p className="mt-6 mb-2 px-3 text-xs font-semibold tracking-wider text-ink-300 uppercase">Account</p>
                {user ? (
                  <>
                    <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-ink-50">
                      <Package className="h-4 w-4" /> My orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-ink-50">
                        <LayoutDashboard className="h-4 w-4" /> Admin dashboard
                      </Link>
                    )}
                    <button type="button" onClick={logOut} disabled={signingOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <Link to="/login" className="rounded-xl border border-ink-200 py-2.5 text-center text-sm font-semibold">
                      Log in
                    </Link>
                    <Link to="/register" className="rounded-xl bg-ink-900 py-2.5 text-center text-sm font-semibold text-white">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
