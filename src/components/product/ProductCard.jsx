import { Link } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, productImage } from '../../lib/format';
import { useCartStore } from '../../store/cartStore';
import { Skeleton } from '../ui/Feedback';

export function ProductCard({ product, currency = 'NGN' }) {
  const add = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.items.find((i) => i.productId === product.id)?.quantity || 0);
  const soldOut = product.stock <= 0;
  const maxedOut = !soldOut && inCart >= product.stock;

  const handleAdd = () => {
    const added = add(product, 1);
    if (added) toast.success(`${product.name} added to cart`);
    else toast.error(soldOut ? 'This product is out of stock.' : `You already have all ${product.stock} available in your cart.`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink-900/5">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ink-50" tabIndex={-1}>
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] ${soldOut ? 'opacity-60 grayscale-[40%]' : ''}`}
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-ink-900/85 px-2.5 py-1 text-[11px] font-semibold text-white">Sold out</span>
          ) : product.lowStock ? (
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-ink-900">Only {product.stock} left</span>
          ) : null}
          {product.featured && !soldOut && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700">Featured</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-[11px] font-semibold tracking-wider text-brand-600 uppercase">{product.category.name}</p>}
        <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold text-ink-900">
          <Link to={`/products/${product.slug}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="font-display text-lg font-bold text-ink-900">{formatPrice(product.price, currency)}</p>
          <p className={`text-xs font-medium ${soldOut ? 'text-red-600' : 'text-emerald-600'}`}>{soldOut ? 'Out of stock' : 'In stock'}</p>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-0">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || maxedOut}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            {soldOut ? 'Sold out' : maxedOut ? 'All in cart' : 'Add to cart'}
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
            aria-label={`View ${product.name}`}
            title="View product"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading, count = 8, currency, className = '' }) {
  const grid = `grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 ${className}`;
  if (loading) {
    return (
      <div className={grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: count }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className={grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} currency={currency} />
      ))}
    </div>
  );
}
