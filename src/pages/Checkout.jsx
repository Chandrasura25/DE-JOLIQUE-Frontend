import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../lib/api';
import { useConfig } from '../lib/queries';
import { formatPrice } from '../lib/format';
import { useAuthStore } from '../store/authStore';
import { selectCartHasIssues, selectCartSubtotal, useCartStore } from '../store/cartStore';
import { useCartSync } from './Cart';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { Alert, PageLoader } from '../components/ui/Feedback';

const PROVIDERS = {
  paystack: { name: 'Paystack', text: 'Card, bank transfer, USSD' },
  flutterwave: { name: 'Flutterwave', text: 'Card, bank transfer, USSD, mobile money' },
};

const SAVED_ADDRESS_KEY = 'jolique-shipping';

function loadSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESS_KEY)) || {};
  } catch {
    return {};
  }
}

export function validateShipping(v) {
  const e = {};
  if (!v.fullName || v.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(v.email || '')) e.email = 'Enter a valid email address.';
  if (!/^\+?[0-9\s()-]{7,20}$/.test((v.phone || '').trim())) e.phone = 'Enter a valid phone number.';
  if (!v.address || v.address.trim().length < 5) e.address = 'Enter your delivery address.';
  if (!v.city || v.city.trim().length < 2) e.city = 'Enter your city.';
  if (!v.state || v.state.trim().length < 2) e.state = 'Enter your state.';
  if (!v.country || v.country.trim().length < 2) e.country = 'Enter your country.';
  return e;
}

/** Starts a hosted payment for an existing order and redirects the browser. */
export async function startPayment(orderId, provider) {
  const { data } = await api.post(`/payments/${provider}/initialize`, { orderId });
  sessionStorage.setItem('jolique-pending-payment', JSON.stringify({ orderId, provider, reference: data.reference }));
  window.location.assign(data.authorizationUrl);
}

export default function Checkout() {
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasIssues = useCartStore(selectCartHasIssues);
  const { checking } = useCartSync();
  const { data: config, isLoading: configLoading } = useConfig();

  const [form, setForm] = useState(() => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    ...loadSavedAddress(),
  }));
  const [errors, setErrors] = useState({});
  const enabledProviders = Object.keys(PROVIDERS).filter((p) => config?.paymentProviders?.[p]);
  const [provider, setProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedProvider = provider && enabledProviders.includes(provider) ? provider : enabledProviders[0];
  const currency = config?.currency;
  const shippingFee = config?.shippingFee ?? 0;

  if (!items.length && !submitting) return <Navigate to="/cart" replace />;
  if (configLoading) return <PageLoader />;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validateShipping(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    if (!selectedProvider) {
      setFormError('Online payment is not available right now. Please try again later.');
      return;
    }

    setSubmitting(true);
    try {
      const shippingAddress = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
      localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify({ ...shippingAddress, email: undefined }));
      const { data } = await api.post('/orders', {
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        shippingAddress,
        paymentMethod: selectedProvider,
      });
      await startPayment(data.order.id, selectedProvider);
    } catch (err) {
      setSubmitting(false);
      const message = errorMessage(err, 'Unable to start payment. Please try again.');
      setFormError(message);
      toast.error(message);
    }
  };

  const blocked = hasIssues || checking;

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>

      <form onSubmit={submit} noValidate className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-8">
          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Delivery details</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full name" autoComplete="name" value={form.fullName} onChange={set('fullName')} error={errors.fullName} fieldClassName="sm:col-span-2" />
              <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+234 801 234 5678" />
              <Input label="Delivery address" autoComplete="street-address" value={form.address} onChange={set('address')} error={errors.address} fieldClassName="sm:col-span-2" placeholder="House number, street, area" />
              <Input label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
              <Input label="State" autoComplete="address-level1" value={form.state} onChange={set('state')} error={errors.state} />
              <Input label="Country" autoComplete="country-name" value={form.country} onChange={set('country')} error={errors.country} />
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Payment method</h2>
            <p className="mt-1 text-sm text-ink-400">You’ll be redirected to complete payment securely.</p>
            {enabledProviders.length === 0 ? (
              <Alert tone="warning" className="mt-5">
                Online payment is not available right now. Please try again later.
              </Alert>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                {enabledProviders.map((key) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                      selectedProvider === key ? 'border-brand-500 bg-brand-50/60' : 'border-ink-100 hover:border-ink-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={key}
                      checked={selectedProvider === key}
                      onChange={() => setProvider(key)}
                      className="mt-1 accent-brand-500"
                    />
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        <CreditCard className="h-4 w-4 text-brand-600" aria-hidden /> {PROVIDERS[key].name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-400">{PROVIDERS[key].text}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 lg:sticky lg:top-36">
          <h2 className="text-lg font-bold">Order summary</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs text-ink-400">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Unit price</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {items.map((i) => (
                  <tr key={i.productId} className={i.stock <= 0 ? 'text-red-600' : ''}>
                    <td className="py-2.5 pr-2">
                      <span className="line-clamp-2">{i.name}</span>
                      {i.issue && <span className="block text-xs">{i.issue}</span>}
                    </td>
                    <td className="py-2.5 text-center">{i.quantity}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">{formatPrice(i.price, currency)}</td>
                    <td className="py-2.5 text-right font-semibold whitespace-nowrap">{formatPrice(i.price * i.quantity, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Delivery</dt>
              <dd className="font-semibold">{shippingFee ? formatPrice(shippingFee, currency) : 'Free'}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-xl font-bold">{formatPrice(subtotal + shippingFee, currency)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink-400">Final prices are confirmed by our server when you place the order.</p>

          {hasIssues && (
            <Alert tone="warning" className="mt-4">
              Some items are unavailable. <Link to="/cart" className="font-semibold underline">Update your cart</Link> to continue.
            </Alert>
          )}
          {formError && (
            <Alert tone="error" className="mt-4">
              {formError}
            </Alert>
          )}

          <Button type="submit" size="lg" className="mt-5 w-full" loading={submitting} disabled={blocked || !enabledProviders.length}>
            <Lock className="h-4 w-4" aria-hidden />
            {submitting ? 'Redirecting to payment…' : `Pay ${formatPrice(subtotal + shippingFee, currency)}`}
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-400">
            By placing your order you agree to our{' '}
            <Link to="/terms" className="font-medium text-ink-600 underline underline-offset-2">
              Terms of Service
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
