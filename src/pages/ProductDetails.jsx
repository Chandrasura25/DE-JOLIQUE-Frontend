import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, PackageX, ShieldCheck, ShoppingBag, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig, useProduct, useProducts } from '../lib/queries';
import { errorMessage } from '../lib/api';
import { formatPrice, productImage } from '../lib/format';
import { useCartStore } from '../store/cartStore';
import Button from '../components/ui/Button';
import QuantitySelector from '../components/ui/QuantitySelector';
import { StockBadge } from '../components/ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import { ProductGrid } from '../components/product/ProductCard';

function DetailsSkeleton() {
  return (
    <div className="container-page grid grid-cols-1 gap-10 py-10 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: config } = useConfig();
  const { data: product, isLoading, isError, error, refetch } = useProduct(slug);
  const add = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.items.find((i) => i.productId === product?.id)?.quantity || 0);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const related = useProducts(
    { category: product?.category?.slug, limit: 5, inStock: 'true' },
    { enabled: Boolean(product?.category) },
  );

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [slug]);

  if (isLoading) return <DetailsSkeleton />;
  if (isError) {
    if (error?.response?.status === 404) {
      return (
        <div className="container-page">
          <EmptyState icon={PackageX} title="Product not found" description="It may have been removed or is no longer available." action={<Button to="/products">Browse products</Button>} />
        </div>
      );
    }
    return (
      <div className="container-page">
        <ErrorState title="Unable to load this product." message={errorMessage(error)} onRetry={refetch} />
      </div>
    );
  }

  const currency = config?.currency;
  const available = Math.max(0, product.stock - inCart);
  const soldOut = product.stock <= 0;
  const images = product.images.length ? product.images : [{ url: productImage(product) }];

  const addToCart = () => {
    if (quantity > available) {
      toast.error(available ? `Only ${available} more available.` : 'You already have all available stock in your cart.');
      return 0;
    }
    const added = add(product, quantity);
    if (added) toast.success(`${added} × ${product.name} added to cart`);
    return added;
  };

  const buyNow = () => {
    if (available > 0 && addToCart() === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-400" aria-label="Breadcrumb">
        <Link to="/products" className="hover:text-ink-700">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-ink-700">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-ink-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100">
            <img src={images[activeImage]?.url} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${i === activeImage ? 'ring-brand-500' : 'ring-transparent hover:ring-ink-200'}`}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={i === activeImage}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:py-4">
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`} className="text-xs font-semibold tracking-wider text-brand-600 uppercase hover:text-brand-700">
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-display text-3xl font-bold">{formatPrice(product.price, currency)}</p>
            <StockBadge stock={product.stock} threshold={config?.lowStockThreshold} />
          </div>

          <p className="mt-6 leading-relaxed whitespace-pre-line text-ink-600">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 text-sm ring-1 ring-ink-100">
            <div>
              <dt className="text-ink-400">Available stock</dt>
              <dd className="mt-0.5 font-semibold">{soldOut ? 'Out of stock' : `${product.stock} unit${product.stock === 1 ? '' : 's'}`}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Category</dt>
              <dd className="mt-0.5 font-semibold">{product.category?.name || 'Uncategorised'}</dd>
            </div>
          </dl>

          {soldOut ? (
            <div className="mt-8 rounded-2xl bg-ink-50 p-5 text-sm text-ink-600">This product is out of stock. Please check back soon.</div>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={Math.max(1, available)} />
                <p className="text-xs text-ink-400">
                  {inCart > 0 ? `${inCart} already in your cart · ` : ''}
                  {available > 0 ? `max ${available}` : 'all available stock is in your cart'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button size="lg" variant="dark" onClick={addToCart} disabled={available <= 0}>
                  <ShoppingBag className="h-5 w-5" /> Add to cart
                </Button>
                <Button size="lg" onClick={buyNow}>
                  <Zap className="h-5 w-5" /> Buy now
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 flex items-center gap-2 text-xs text-ink-400">
            <ShieldCheck className="h-4 w-4 text-brand-500" /> Secure checkout with Paystack or Flutterwave
          </p>
        </div>
      </div>

      {related.data?.products.filter((p) => p.id !== product.id).length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
          <ProductGrid products={related.data.products.filter((p) => p.id !== product.id).slice(0, 4)} currency={currency} />
        </section>
      )}
    </div>
  );
}
