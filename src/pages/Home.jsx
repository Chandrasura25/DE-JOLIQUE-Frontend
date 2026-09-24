import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Home as HomeIcon, PackageCheck, ShieldCheck, Shirt, Sparkles, Tag, Truck, Watch } from 'lucide-react';
import { useCategories, useConfig, useProducts } from '../lib/queries';
import { ProductGrid } from '../components/product/ProductCard';
import { ErrorState, Skeleton } from '../components/ui/Feedback';
import { buttonClass } from '../components/ui/Button';

const CATEGORY_STYLE = {
  fashion: { icon: Shirt, tint: 'from-rose-100 to-rose-50 text-rose-700' },
  electronics: { icon: Headphones, tint: 'from-sky-100 to-sky-50 text-sky-700' },
  'home-living': { icon: HomeIcon, tint: 'from-amber-100 to-amber-50 text-amber-800' },
  beauty: { icon: Sparkles, tint: 'from-fuchsia-100 to-fuchsia-50 text-fuchsia-700' },
  accessories: { icon: Watch, tint: 'from-brand-100 to-brand-50 text-brand-700' },
};

function SectionHeader({ eyebrow, title, to }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">{eyebrow}</p>
        <h2 className="mt-1.5 text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-700 hover:text-brand-700">
          View all <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-24 h-[380px] w-[380px] rounded-full bg-brand-400/10 blur-3xl" />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand-200 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Credible and Distinct
          </p>
          <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
            Everyday essentials,
            <br />
            <span className="text-brand-300">thoughtfully chosen.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-200 sm:text-lg">
            Premium quality kitchen utensils and general household items from De-Jolique Enterprise. Honest prices, real
            stock levels and secure checkout with Paystack or Flutterwave.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className={buttonClass({ size: 'lg' })}>
              Shop the collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products?featured=true" className={buttonClass({ size: 'lg', variant: 'ghost', className: 'text-white ring-1 ring-white/25 hover:bg-white/10 hover:text-white' })}>
              Featured picks
            </Link>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-lg grid-cols-5 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: '1 / 0.95' }}>
          <img src="/brand/image2.jpg" alt="Kitchen utensils in brand colours" className="col-span-3 row-span-4 h-full w-full rounded-3xl object-cover ring-1 ring-white/10" />
          <img src="/brand/image1.jpg" alt="Laptop on an adjustable stand" className="col-span-2 row-span-3 h-full w-full rounded-3xl object-cover ring-1 ring-white/10" />
          <img src="/brand/image4.jpg" alt="Non-stick frying pan" className="col-span-2 row-span-3 h-full w-full rounded-3xl object-cover ring-1 ring-white/10" />
          <div className="col-span-3 row-span-2 flex items-center gap-3 rounded-3xl bg-white p-4 text-ink-900">
            <img src="/brand/logo-mark.png" alt="" className="h-11 w-11 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold">De-Jolique Enterprise</p>
              <p className="text-xs text-ink-400">Payments confirmed before we ship</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PROMISES = [
  { icon: ShieldCheck, title: 'Secure payments', text: 'Paystack & Flutterwave, verified by our server' },
  { icon: PackageCheck, title: 'Live stock levels', text: 'What you see is what we have' },
  { icon: Truck, title: 'Track every order', text: 'Follow your order from payment to delivery' },
];

export default function Home() {
  const { data: config } = useConfig();
  const categories = useCategories();
  const featured = useProducts({ featured: true, limit: 4, sort: 'newest' });
  const latest = useProducts({ limit: 8, sort: 'newest' });
  const currency = config?.currency;

  return (
    <>
      <Hero />

      <section className="border-b border-ink-100 bg-white">
        <div className="container-page grid grid-cols-1 gap-px sm:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 py-5 sm:justify-center">
              <Icon className="h-6 w-6 shrink-0 text-brand-500" aria-hidden />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-ink-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-page">
        <section className="pt-16">
          <SectionHeader eyebrow="Browse" title="Shop by category" />
          {categories.isError ? (
            <ErrorState message="Unable to load categories." onRetry={categories.refetch} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {categories.isLoading
                ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
                : categories.data.map((c) => {
                    const style = CATEGORY_STYLE[c.slug] || { icon: Tag, tint: 'from-ink-100 to-ink-50 text-ink-700' };
                    const Icon = style.icon;
                    return (
                      <Link
                        key={c.id}
                        to={`/products?category=${c.slug}`}
                        className={`group relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${style.tint}`}
                      >
                        <Icon className="h-7 w-7" aria-hidden />
                        <div>
                          <p className="font-display font-bold text-ink-900">{c.name}</p>
                          <p className="text-xs text-ink-500">{c.productCount} products</p>
                        </div>
                        <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-ink-900" />
                      </Link>
                    );
                  })}
            </div>
          )}
        </section>

        <section className="pt-16">
          <SectionHeader eyebrow="Hand-picked" title="Featured products" to="/products?featured=true" />
          {featured.isError ? (
            <ErrorState message="Unable to load products." onRetry={featured.refetch} />
          ) : featured.data?.products.length === 0 ? (
            <p className="text-sm text-ink-400">No featured products yet.</p>
          ) : (
            <ProductGrid products={featured.data?.products || []} loading={featured.isLoading} count={4} currency={currency} />
          )}
        </section>

        <section className="pt-16">
          <SectionHeader eyebrow="Just in" title="Latest arrivals" to="/products?sort=newest" />
          {latest.isError ? (
            <ErrorState message="Unable to load products." onRetry={latest.refetch} />
          ) : (
            <ProductGrid products={latest.data?.products || []} loading={latest.isLoading} currency={currency} />
          )}
        </section>
      </div>
    </>
  );
}
