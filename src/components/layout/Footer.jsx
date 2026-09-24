import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Logo from './Logo';
import { useCategories } from '../../lib/queries';

export default function Footer() {
  const { data: categories } = useCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink-900 text-ink-200">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
            Credible and Distinct. Fashion, electronics, home and beauty essentials, delivered with care.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/products" className="hover:text-white">
                All products
              </Link>
            </li>
            {categories?.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Your account</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/account" className="hover:text-white">
                Orders &amp; profile
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white">
                Shopping cart
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white">
                Create an account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Secure checkout</h3>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">
            Pay with card, bank transfer or USSD through Paystack or Flutterwave. We never see or store your card details.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-brand-200 ring-1 ring-white/10">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Payments verified server-side
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} De-Jolique Enterprise. All rights reserved.</p>
          <p>Prices in Nigerian Naira (₦).</p>
        </div>
      </div>
    </footer>
  );
}
