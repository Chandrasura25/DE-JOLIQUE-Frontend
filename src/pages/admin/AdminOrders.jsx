import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Search, ShoppingCart } from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { capitalize, formatDate, formatPrice } from '../../lib/format';
import { AdminPageHeader } from './AdminLayout';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import Pagination from '../../components/ui/Pagination';

const FILTERS = [
  ['', 'All'],
  ['pending', 'Pending'],
  ['processing', 'Processing'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled'],
  ['paid', 'Paid'],
  ['failed', 'Failed'],
  ['attention', 'Needs attention'],
];

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const filters = {
    status: params.get('status') || undefined,
    search: params.get('search') || undefined,
    page: Number(params.get('page')) || 1,
    limit: 20,
  };

  useEffect(() => {
    setSearch(params.get('search') || '');
  }, [params]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: async () => (await api.get('/admin/orders', { params: filters })).data,
    placeholderData: keepPreviousData,
  });

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  return (
    <>
      <AdminPageHeader title="Orders" description={data ? `${data.pagination.total} orders` : 'Track and fulfil orders'} />

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Filter orders">
        {FILTERS.map(([value, label]) => {
          const active = (filters.status || '') === value;
          return (
            <button
              key={value || 'all'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => update({ status: value })}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form
        role="search"
        className="relative mb-4 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: search.trim() });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          type="search"
          className="input pl-10"
          placeholder="Order number, customer, email or reference"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />
      </form>

      <div className="card overflow-hidden">
        {isError ? (
          <ErrorState title="Unable to load orders." message={errorMessage(error)} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : data.orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders found" description="Orders matching this filter will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-ink-50/60 text-left text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {data.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ink-50/40">
                    <td className="px-5 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-700">
                        {o.requiresAttention && <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Needs attention" />}
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-44 truncate font-medium">{o.customer?.name || o.shippingAddress.fullName}</p>
                      <p className="max-w-44 truncate text-xs text-ink-400">{o.customer?.email || o.shippingAddress.email}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-500">{formatDate(o.createdAt, true)}</td>
                    <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{formatPrice(o.totalAmount, o.currency)}</td>
                    <td className="px-5 py-3 text-ink-500">{capitalize(o.paymentMethod)}</td>
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
      </div>
      <Pagination page={filters.page} pages={data?.pagination.pages} onChange={(p) => update({ page: String(p) })} />
    </>
  );
}
