import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, PackageX } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useConfig, useOrder } from '../../lib/queries';
import { capitalize, formatDate } from '../../lib/format';
import { startPayment } from '../Checkout';
import Button from '../../components/ui/Button';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/ui/Badge';
import { OrderItemsTable, OrderProgress, ShippingBlock, StatusTimeline } from '../../components/order/OrderParts';

export default function OrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: config } = useConfig();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const [paying, setPaying] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError) {
    return (
      <div className="container-page py-10">
        {error?.response?.status === 404 ? (
          <EmptyState icon={PackageX} title="Order not found" action={<Button to="/account">Back to my orders</Button>} />
        ) : (
          <ErrorState title="Unable to load this order." message={errorMessage(error)} onRetry={refetch} />
        )}
      </div>
    );
  }

  const unpaid = order.orderStatus === 'pending' && ['pending', 'failed'].includes(order.paymentStatus);
  const providers = ['paystack', 'flutterwave'].filter((p) => config?.paymentProviders?.[p]);

  const pay = async (provider) => {
    setPaying(provider);
    try {
      await startPayment(order.id, provider);
    } catch (err) {
      toast.error(errorMessage(err, 'Payment failed. Please try again.'));
      setPaying(null);
      refetch();
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${order.id}/cancel`);
      queryClient.setQueryData(['order', id], data.order);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order cancelled.');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/account" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> My orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-400">Placed {formatDate(order.createdAt, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {unpaid && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-900">{order.paymentStatus === 'failed' ? 'Payment failed. Please try again.' : 'This order is awaiting payment.'}</p>
            <p className="mt-0.5 text-sm text-amber-800">Complete payment to confirm your order. Stock is only reserved once payment succeeds.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <Button key={p} size="sm" onClick={() => pay(p)} loading={paying === p} disabled={Boolean(paying)}>
                Pay with {capitalize(p)}
              </Button>
            ))}
            <Button size="sm" variant="danger-outline" onClick={() => setConfirmCancel(true)} disabled={Boolean(paying)}>
              Cancel order
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <OrderProgress order={order} />
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Items</h2>
            <OrderItemsTable order={order} />
          </section>
        </div>
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-bold">Delivery address</h2>
            <ShippingBlock address={order.shippingAddress} />
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-bold">Payment</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-400">Method</dt>
                <dd className="font-medium">{capitalize(order.paymentMethod)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-400">Status</dt>
                <dd>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </dd>
              </div>
              {order.paidAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-400">Paid</dt>
                  <dd className="font-medium">{formatDate(order.paidAt, true)}</dd>
                </div>
              )}
              {order.paymentReference && (
                <div>
                  <dt className="text-ink-400">Reference</dt>
                  <dd className="mt-0.5 font-mono text-xs break-all">{order.paymentReference}</dd>
                </div>
              )}
            </dl>
          </section>
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">History</h2>
            <StatusTimeline history={order.statusHistory} />
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancel this order?"
        message="The order will be cancelled and can’t be paid for afterwards. You haven’t been charged."
        confirmLabel="Cancel order"
      />
    </div>
  );
}
