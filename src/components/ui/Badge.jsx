const TONES = {
  gray: 'bg-ink-50 text-ink-600 ring-ink-200',
  teal: 'bg-brand-50 text-brand-700 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export function Badge({ tone = 'gray', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const ORDER_TONES = { pending: 'amber', processing: 'blue', shipped: 'violet', delivered: 'green', cancelled: 'red' };
const PAYMENT_TONES = { pending: 'amber', paid: 'green', failed: 'red', refunded: 'gray' };
const LABELS = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' };

export const OrderStatusBadge = ({ status }) => <Badge tone={ORDER_TONES[status]}>{LABELS[status] || status}</Badge>;

export const PaymentStatusBadge = ({ status }) => (
  <Badge tone={PAYMENT_TONES[status]}>{status === 'pending' ? 'Awaiting payment' : LABELS[status] || status}</Badge>
);

export function StockBadge({ stock, threshold = 5 }) {
  if (stock <= 0) return <Badge tone="red">Out of stock</Badge>;
  if (stock <= threshold) return <Badge tone="amber">Only {stock} left</Badge>;
  return <Badge tone="green">In stock</Badge>;
}
