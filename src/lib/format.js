const currencyFormatters = new Map();

export function formatPrice(amount, currency = 'NGN') {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }),
    );
  }
  return currencyFormatters.get(currency).format(Number(amount) || 0);
}

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

const relativeTime = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "3 days ago", "yesterday", "just now". */
export function timeAgo(value) {
  if (!value) return '—';
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) || [];
  return unit ? relativeTime.format(Math.round(seconds / size), unit) : 'just now';
}

export const productImage = (product) => product?.images?.[0]?.url || product?.image || '/brand/logo-mark.png';

export const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);
