import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, LogOut, Package } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useMyOrders } from '../../lib/queries';
import { formatDate, formatPrice } from '../../lib/format';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import ChangePasswordForm from '../../components/account/ChangePasswordForm';

function ProfileCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your full name.';
    if (form.phone && !/^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim())) found.phone = 'Enter a valid phone number.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', { name: form.name.trim(), phone: form.phone.trim() });
      setUser(data.user);
      setEditing(false);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Profile</h2>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-sm font-semibold text-brand-700 hover:underline">
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <form onSubmit={save} noValidate className="mt-4 space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ['Name', user.name || '—'],
            ['Email', user.email],
            ['Phone', user.phone || '—'],
            ['Member since', formatDate(user.createdAt)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-400">{k}</dt>
              <dd className="mt-0.5 font-medium break-all">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function OrderHistory() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page')) || 1;
  const { data, isLoading, isError, error, refetch } = useMyOrders(page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState title="Unable to load your orders." message={errorMessage(error)} onRetry={refetch} />;
  if (!data.orders.length) {
    return <EmptyState icon={Package} title="No orders yet" description="When you place an order, it will appear here." action={<Button to="/products">Start shopping</Button>} />;
  }

  return (
    <>
      <ul className="space-y-3">
        {data.orders.map((o) => (
          <li key={o.id}>
            <Link to={`/account/orders/${o.id}`} className="card flex items-center gap-4 p-4 transition hover:border-ink-200 hover:shadow-md sm:p-5">
              <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-50 sm:block">
                {o.preview?.image && <img src={o.preview.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{o.orderNumber}</p>
                  <OrderStatusBadge status={o.orderStatus} />
                  <PaymentStatusBadge status={o.paymentStatus} />
                </div>
                <p className="mt-1 truncate text-sm text-ink-400">
                  {formatDate(o.createdAt)} · {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                  {o.preview?.name ? ` · ${o.preview.name}${o.itemCount > 1 ? ' and more' : ''}` : ''}
                </p>
              </div>
              <p className="shrink-0 font-display font-bold">{formatPrice(o.totalAmount, o.currency)}</p>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination page={page} pages={data.pagination.pages} onChange={(p) => setParams({ page: String(p) })} />
    </>
  );
}

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My account</h1>
          <p className="mt-1 text-sm text-ink-400">Hello {user.name?.split(' ')[0] || 'there'} — here are your orders and details.</p>
        </div>
        <Button variant="secondary" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <h2 className="mb-4 text-lg font-bold">Order history</h2>
          <OrderHistory />
        </section>
        <div className="space-y-6">
          <ProfileCard />
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Change password</h2>
            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </div>
  );
}
