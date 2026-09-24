import { Check } from 'lucide-react';
import { capitalize, formatDate, formatPrice } from '../../lib/format';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

/** Visual progress for the fulfilment workflow. */
export function OrderProgress({ order }) {
  if (order.orderStatus === 'cancelled') {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        This order was cancelled{order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ''}.
      </div>
    );
  }
  const current = STEPS.indexOf(order.orderStatus);
  const labels = { pending: order.paymentStatus === 'paid' ? 'Confirmed' : 'Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };

  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={`absolute top-4 right-1/2 -z-0 h-0.5 w-full ${i <= current ? 'bg-brand-500' : 'bg-ink-100'}`} aria-hidden />}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done ? 'bg-brand-500 text-white' : 'bg-white text-ink-300 ring-2 ring-ink-100'
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`mt-2 text-xs font-semibold ${done ? 'text-ink-900' : 'text-ink-300'}`} aria-current={i === current ? 'step' : undefined}>
              {labels[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsTable({ order }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs text-ink-400">
            <th className="pb-3 font-medium">Product</th>
            <th className="pb-3 text-center font-medium">Qty</th>
            <th className="pb-3 text-right font-medium">Unit price</th>
            <th className="pb-3 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
              </td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right whitespace-nowrap">{formatPrice(item.price, order.currency)}</td>
              <td className="py-3 text-right font-semibold whitespace-nowrap">{formatPrice(item.subtotal, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 ml-auto max-w-xs space-y-2 border-t border-ink-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Subtotal</dt>
          <dd className="font-medium">{formatPrice(order.subtotal, order.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Delivery</dt>
          <dd className="font-medium">{order.shippingFee ? formatPrice(order.shippingFee, order.currency) : 'Free'}</dd>
        </div>
        <div className="flex justify-between text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display font-bold">{formatPrice(order.totalAmount, order.currency)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ShippingBlock({ address }) {
  return (
    <address className="text-sm leading-relaxed text-ink-600 not-italic">
      <span className="font-semibold text-ink-900">{address.fullName}</span>
      <br />
      {address.address}
      <br />
      {address.city}, {address.state}, {address.country}
      <br />
      {address.phone}
      <br />
      <span className="break-all">{address.email}</span>
    </address>
  );
}

const HISTORY_LABELS = { payment_failed: 'Payment failed', paid: 'Payment confirmed' };

export function StatusTimeline({ history }) {
  return (
    <ol className="space-y-4 border-l-2 border-ink-100 pl-5">
      {history.map((h, i) => (
        <li key={i} className="relative">
          <span className="absolute top-1 -left-[27px] h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" aria-hidden />
          <p className="text-sm font-semibold">{HISTORY_LABELS[h.status] || capitalize(h.status)}</p>
          <p className="text-xs text-ink-400">{formatDate(h.createdAt, true)}</p>
          {h.note && <p className="mt-0.5 text-sm text-ink-500">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}
