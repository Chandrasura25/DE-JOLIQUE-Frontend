import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig } from '../lib/queries';
import { formatPrice } from '../lib/format';
import { selectCartCount, selectCartHasIssues, selectCartSubtotal, useCartStore } from '../store/cartStore';
import Button from '../components/ui/Button';
import QuantitySelector from '../components/ui/QuantitySelector';
import { Alert, EmptyState } from '../components/ui/Feedback';

/** Refreshes cart prices/stock from the server. Returns { checking, failed }. */
export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const sync = useCartStore((s) => s.sync);
  const [state, setState] = useState({ checking: items.length > 0, failed: false });
  const key = items.map((i) => i.productId).sort().join(',');

  useEffect(() => {
    const current = useCartStore.getState().items;
    if (!current.length) {
      setState({ checking: false, failed: false });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, checking: true }));
    api
      .post('/cart/validate', { items: current.map(({ productId, quantity }) => ({ productId, quantity })) })
      .then(({ data }) => {
        if (!cancelled) {
          sync(data.items);
          setState({ checking: false, failed: false });
        }
      })
      .catch(() => !cancelled && setState({ checking: false, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [key, sync]);

  return state;
}

export default function Cart() {
  const { data: config } = useConfig();
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasIssues = useCartStore(selectCartHasIssues);
  const { setQuantity, remove } = useCartStore.getState();
  const { checking, failed } = useCartSync();
  const currency = config?.currency;
  const shipping = config?.shippingFee ?? 0;

  if (!items.length) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the store and add something you love."
          action={<Button to="/products">Start shopping</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Shopping cart</h1>
      <p className="mt-1 text-sm text-ink-400">
        {count} item{count === 1 ? '' : 's'}
      </p>

      {failed && (
        <Alert tone="warning" className="mt-6">
          We couldn’t confirm current prices and stock. They will be checked again at checkout.
        </Alert>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
          {items.map((item) => {
            const unavailable = item.stock <= 0;
            return (
              <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link to={`/products/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:h-28 sm:w-28">
                  <img src={item.image} alt={item.name} className={`h-full w-full object-cover ${unavailable ? 'opacity-50 grayscale' : ''}`} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/products/${item.slug}`} className="line-clamp-2 font-semibold hover:text-brand-700">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink-400">{formatPrice(item.price, currency)} each</p>
                    </div>
                    <p className="shrink-0 font-display font-bold">{formatPrice(item.price * item.quantity, currency)}</p>
                  </div>
                  {item.issue && <p className={`mt-1 text-xs font-medium ${unavailable ? 'text-red-600' : 'text-amber-700'}`}>{item.issue}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    {unavailable ? (
                      <span className="text-sm text-ink-400">Unavailable</span>
                    ) : (
                      <QuantitySelector size="sm" value={item.quantity} min={1} max={item.stock} onChange={(q) => setQuantity(item.productId, q)} />
                    )}
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-6 lg:sticky lg:top-36">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery</dt>
              <dd className="font-semibold">{shipping ? formatPrice(shipping, currency) : 'Free'}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-xl font-bold">{formatPrice(subtotal + shipping, currency)}</dd>
            </div>
          </dl>
          {hasIssues && (
            <Alert tone="warning" className="mt-5">
              Remove unavailable items to continue.
            </Alert>
          )}
          <Button to={hasIssues || checking ? undefined : '/checkout'} disabled={hasIssues || checking} size="lg" className="mt-6 w-full">
            {checking ? 'Checking stock…' : 'Proceed to checkout'} <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/products" className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
