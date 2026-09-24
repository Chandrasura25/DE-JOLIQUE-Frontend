import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, errorMessage } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useCartStore } from '../store/cartStore';
import { useConfig } from '../lib/queries';
import { startPayment } from './Checkout';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Feedback';

const MAX_POLLS = 5;

/**
 * Landing page after Paystack/Flutterwave. It never trusts the query string: it asks
 * our API, which verifies the transaction directly with the provider.
 */
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);
  const { data: config } = useConfig();
  const [result, setResult] = useState(null); // { state, message, order }
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const polls = useRef(0);

  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('jolique-pending-payment')) || {};
    } catch {
      return {};
    }
  })();
  const provider = params.get('provider') || saved.provider;
  const orderId = params.get('order') || saved.orderId;

  const verify = useCallback(async () => {
    let url;
    if (provider === 'paystack') {
      const reference = params.get('reference') || params.get('trxref') || saved.reference;
      if (!reference) throw new Error('Missing payment reference.');
      url = `/payments/paystack/verify/${encodeURIComponent(reference)}`;
    } else if (provider === 'flutterwave') {
      const txRef = params.get('tx_ref') || saved.reference;
      const transactionId = params.get('transaction_id');
      if (transactionId) url = `/payments/flutterwave/verify/${encodeURIComponent(transactionId)}?tx_ref=${encodeURIComponent(txRef || '')}`;
      else if (txRef) url = `/payments/flutterwave/verify-reference/${encodeURIComponent(txRef)}`;
      else throw new Error('Missing payment reference.');
    } else {
      throw new Error('Unknown payment provider.');
    }
    const { data } = await api.get(url);
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, params]);

  useEffect(() => {
    let timer;
    let cancelled = false;

    const run = async () => {
      try {
        const data = await verify();
        if (cancelled) return;
        setResult(data);
        if (data.state === 'paid') {
          clearCart();
          sessionStorage.removeItem('jolique-pending-payment');
          queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          queryClient.invalidateQueries({ queryKey: ['products'] });
          toast.success('Your order was successfully placed.');
        } else if (data.state === 'pending' && params.get('status') !== 'cancelled' && polls.current < MAX_POLLS) {
          polls.current += 1;
          timer = setTimeout(run, 3000);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, err.message));
      }
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [verify, clearCart, queryClient, params]);

  const retry = async (p) => {
    if (!orderId) return;
    setRetrying(true);
    try {
      await startPayment(orderId, p);
    } catch (err) {
      setRetrying(false);
      toast.error(errorMessage(err, 'Payment failed. Please try again.'));
    }
  };

  const order = result?.order;
  const cancelledByUser = params.get('status') === 'cancelled';
  const waiting = !result && !error;
  const stillPending = result?.state === 'pending';

  let icon;
  let title;
  let text;
  if (waiting || (stillPending && polls.current < MAX_POLLS && !cancelledByUser)) {
    icon = <Spinner className="h-10 w-10" />;
    title = 'Confirming your payment…';
    text = 'Please don’t close this page. We’re checking with the payment provider.';
  } else if (error) {
    icon = <XCircle className="h-12 w-12 text-red-500" />;
    title = 'We couldn’t confirm your payment';
    text = error;
  } else if (result.state === 'paid') {
    icon = <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
    title = 'Your order was successfully placed.';
    text = `Thank you! Order ${order.orderNumber} is confirmed. We’ll let you know as it moves along.`;
  } else if (result.state === 'failed' || cancelledByUser) {
    icon = <XCircle className="h-12 w-12 text-red-500" />;
    title = cancelledByUser ? 'Payment cancelled' : 'Payment failed. Please try again.';
    text = cancelledByUser ? 'You cancelled the payment. Your order is saved — you can pay whenever you’re ready.' : result.message;
  } else if (stillPending) {
    icon = <Clock className="h-12 w-12 text-amber-500" />;
    title = 'Payment not confirmed yet';
    text = 'If you completed the payment, it will be confirmed shortly — check your orders in a few minutes. Otherwise you can try again.';
  } else {
    icon = <RotateCcw className="h-12 w-12 text-ink-400" />;
    title = result.state === 'refunded' ? 'Payment refunded' : 'We’re reviewing your order';
    text = result.message;
  }

  const canRetry = order && order.orderStatus === 'pending' && ['pending', 'failed'].includes(order.paymentStatus) && !waiting;
  const providers = ['paystack', 'flutterwave'].filter((p) => config?.paymentProviders?.[p]);

  return (
    <div className="container-page flex justify-center py-16">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="flex justify-center">{icon}</div>
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">{text}</p>

        {order && (
          <div className="mt-6 rounded-xl bg-ink-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Order</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-ink-500">Total</span>
              <span className="font-semibold">{formatPrice(order.totalAmount, order.currency)}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2">
          {canRetry &&
            (stillPending || result?.state === 'failed' || cancelledByUser) &&
            providers.map((p) => (
              <Button key={p} onClick={() => retry(p)} loading={retrying} variant={p === order.paymentMethod ? 'primary' : 'secondary'}>
                {p === order.paymentMethod ? 'Try again' : 'Pay'} with {p === 'paystack' ? 'Paystack' : 'Flutterwave'}
              </Button>
            ))}
          {order && (
            <Button to={`/account/orders/${order.id}`} variant={result?.state === 'paid' ? 'primary' : 'secondary'}>
              View order details
            </Button>
          )}
          {!waiting && (
            <Link to="/products" className="mt-2 text-sm font-semibold text-ink-500 hover:text-ink-900">
              Continue shopping
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
