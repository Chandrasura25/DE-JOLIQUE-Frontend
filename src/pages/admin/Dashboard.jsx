import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, Package, ShoppingCart, Wallet } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import { AdminPageHeader } from './AdminLayout';
import { ErrorState, Skeleton } from '../../components/ui/Feedback';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';

function StatCard({ label, value, icon: Icon, tone, to }) {
  const content = (
    <div className="card flex h-full items-start justify-between gap-3 p-5 transition hover:border-ink-200">
      <div className="min-w-0">
        <p className="text-sm text-ink-400">{label}</p>
        <p className="mt-2 truncate font-display text-2xl font-bold sm:text-3xl">{value}</p>
      </div>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.stats,
    refetchInterval: 60_000,
  });

  if (isError) return <ErrorState title="Unable to load dashboard." message={errorMessage(error)} onRetry={refetch} />;

  const cards = stats
    ? [
        { label: 'Total revenue', value: formatPrice(stats.totalRevenue, stats.currency), icon: Wallet, tone: 'bg-brand-50 text-brand-700' },
        { label: 'Total orders', value: stats.totalOrders, icon: ShoppingCart, tone: 'bg-ink-50 text-ink-700', to: '/admin/orders' },
        { label: 'Pending orders', value: stats.pendingOrders, icon: Clock, tone: 'bg-amber-50 text-amber-700', to: '/admin/orders?status=pending' },
        { label: 'Paid orders', value: stats.paidOrders, icon: CreditCard, tone: 'bg-emerald-50 text-emerald-700', to: '/admin/orders?status=paid' },
        { label: 'Completed orders', value: stats.completedOrders, icon: CheckCircle2, tone: 'bg-violet-50 text-violet-700', to: '/admin/orders?status=delivered' },
        { label: 'Total products', value: stats.totalProducts, icon: Package, tone: 'bg-sky-50 text-sky-700', to: '/admin/products' },
      ]
    : [];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="An overview of your store." />

      {stats?.ordersNeedingAttention > 0 && (
        <Link
          to="/admin/orders?status=attention"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 hover:bg-red-100/60"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <strong>{stats.ordersNeedingAttention}</strong> order{stats.ordersNeedingAttention === 1 ? ' needs' : 's need'} attention
            (e.g. a payment that could not be refunded automatically). Open the order for details.
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />) : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : stats.recentOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-ink-50/60 text-left text-xs text-ink-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {stats.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-ink-50/40">
                      <td className="px-5 py-3 font-semibold">
                        <Link to={`/admin/orders/${o.id}`} className="hover:text-brand-700">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="max-w-40 truncate px-5 py-3">{o.customer?.name || o.shippingAddress?.fullName}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-ink-500">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{formatPrice(o.totalAmount, o.currency)}</td>
                      <td className="px-5 py-3">
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={o.orderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card h-fit">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-bold">Low stock</h2>
            <Link to="/admin/products?stock=low" className="text-sm font-semibold text-brand-700 hover:underline">
              Manage
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : stats.lowStock.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-400">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {stats.lowStock.map((p) => (
                <li key={p.id}>
                  <Link to={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50/40">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock === 0 ? 'Out' : p.stock}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {stats && <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">Threshold: {stats.lowStockThreshold} units or fewer</p>}
        </section>
      </div>
    </>
  );
}
