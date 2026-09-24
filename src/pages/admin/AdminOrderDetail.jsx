import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, CheckCircle2, PackageCheck, Truck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { capitalize, formatDate, formatPrice } from '../../lib/format';
import Button from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Field';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { Badge, OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';
import { OrderItemsTable, OrderProgress, ShippingBlock, StatusTimeline } from '../../components/order/OrderParts';

const NEXT = {
  pending: { status: 'processing', label: 'Start processing', icon: PackageCheck },
  processing: { status: 'shipped', label: 'Mark as shipped', icon: Truck },
  shipped: { status: 'delivered', label: 'Mark as delivered', icon: CheckCircle2 },
};

const PAYMENT_TONES = { success: 'green', failed: 'red', refunded: 'gray', pending: 'amber', initialized: 'gray' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(null); // { status, refund }
  const [saving, setSaving] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => (await api.get(`/admin/orders/${id}`)).data.order,
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState title="Unable to load order." message={errorMessage(error)} onRetry={refetch} />;

  const next = NEXT[order.orderStatus];
  const canAdvance = next && order.paymentStatus === 'paid';
  const canCancel = ['pending', 'processing'].includes(order.orderStatus);
  const isPaid = order.paymentStatus === 'paid';

  const apply = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/orders/${order.id}/status`, {
        status: pending.status,
        note: note.trim() || undefined,
        refund: pending.status === 'cancelled' ? Boolean(pending.refund) : undefined,
      });
      queryClient.setQueryData(['admin', 'order', id], data.order);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success(data.message);
      setPending(null);
      setNote('');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Orders
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-400">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {order.requiresAttention && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Needs attention</p>
            <p className="mt-0.5">{order.adminNote}</p>
          </div>
        </div>
      )}
      {!order.requiresAttention && order.adminNote && (
        <div className="mb-6 rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-600">{order.adminNote}</div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <OrderProgress order={order} />
          </section>

          {(canAdvance || canCancel) && (
            <section className="card p-5 sm:p-6">
              <h2 className="font-bold">Update order</h2>
              {!isPaid && order.orderStatus === 'pending' && (
                <p className="mt-1 text-sm text-ink-400">This order hasn’t been paid, so it can’t be processed yet. You can cancel it.</p>
              )}
              <Textarea label="Note (optional, visible to the customer)" rows={2} fieldClassName="mt-4" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="e.g. Shipped with GIG Logistics, tracking #12345" />
              <div className="mt-4 flex flex-wrap gap-2">
                {canAdvance && (
                  <Button onClick={() => setPending({ status: next.status })}>
                    <next.icon className="h-4 w-4" /> {next.label}
                  </Button>
                )}
                {canCancel && (
                  <Button variant="danger-outline" onClick={() => setPending({ status: 'cancelled', refund: isPaid })}>
                    <XCircle className="h-4 w-4" /> Cancel order
                  </Button>
                )}
              </div>
            </section>
          )}

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-bold">Items</h2>
            <OrderItemsTable order={order} />
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-bold">Payment attempts</h2>
            {order.payments?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-xs text-ink-400">
                    <tr className="border-b border-ink-100">
                      <th className="pb-2 font-medium">Reference</th>
                      <th className="pb-2 font-medium">Provider</th>
                      <th className="pb-2 text-right font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {order.payments.map((p) => (
                      <tr key={p.id} className="align-top">
                        <td className="py-2.5 pr-3 font-mono text-xs break-all">
                          {p.reference}
                          {p.note && <p className="mt-1 font-sans text-xs text-ink-400">{p.note}</p>}
                        </td>
                        <td className="py-2.5">{capitalize(p.provider)}</td>
                        <td className="py-2.5 text-right whitespace-nowrap">{formatPrice(p.amountPaid ?? p.amount, p.currency)}</td>
                        <td className="py-2.5">
                          <Badge tone={PAYMENT_TONES[p.status]}>{capitalize(p.status)}</Badge>
                        </td>
                        <td className="py-2.5 whitespace-nowrap text-ink-500">{formatDate(p.createdAt, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-ink-400">No payment attempts yet.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 font-bold">Customer</h2>
            <p className="font-medium">{order.customer?.name || '—'}</p>
            <p className="text-sm break-all text-ink-500">{order.customer?.email || 'Account deleted'}</p>
            <h3 className="mt-5 mb-2 text-sm font-semibold">Delivery address</h3>
            <ShippingBlock address={order.shippingAddress} />
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 font-bold">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Payment method</dt>
                <dd className="font-medium">{capitalize(order.paymentMethod)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Total</dt>
                <dd className="font-semibold">{formatPrice(order.totalAmount, order.currency)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Paid at</dt>
                <dd className="font-medium">{formatDate(order.paidAt, true)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Stock deducted</dt>
                <dd className="font-medium">{order.inventoryCommitted ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-bold">History</h2>
            <StatusTimeline history={order.statusHistory} />
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={apply}
        loading={saving}
        tone={pending?.status === 'cancelled' ? 'danger' : 'primary'}
        title={pending?.status === 'cancelled' ? 'Cancel this order?' : `Mark order as ${pending?.status}?`}
        confirmLabel={pending?.status === 'cancelled' ? 'Cancel order' : 'Confirm'}
        message={
          pending?.status === 'cancelled'
            ? isPaid
              ? 'The order will be cancelled and its items returned to stock.'
              : 'The unpaid order will be cancelled.'
            : `The customer will see the order as ${pending?.status} in their account.`
        }
      >
        {pending?.status === 'cancelled' && isPaid && (
          <label className="mt-4 flex items-start gap-3 rounded-xl bg-ink-50 p-3 text-sm">
            <input type="checkbox" className="mt-0.5 accent-brand-500" checked={Boolean(pending.refund)} onChange={(e) => setPending({ ...pending, refund: e.target.checked })} />
            <span>
              Refund {formatPrice(order.totalAmount, order.currency)} to the customer via {capitalize(order.paymentMethod)}
            </span>
          </label>
        )}
      </ConfirmDialog>
    </>
  );
}
