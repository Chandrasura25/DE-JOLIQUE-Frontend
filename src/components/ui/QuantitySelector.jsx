import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max, size = 'md', label = 'Quantity' }) {
  const h = size === 'sm' ? 'h-9' : 'h-11';
  const w = size === 'sm' ? 'w-9' : 'w-11';
  const atMax = max != null && value >= max;

  return (
    <div className={`inline-flex ${h} items-stretch overflow-hidden rounded-xl border border-ink-200 bg-white`} role="group" aria-label={label}>
      <button
        type="button"
        className={`${w} flex items-center justify-center text-ink-600 hover:bg-ink-50 disabled:opacity-30`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="w-12 border-x border-ink-100 text-center text-sm font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (Number.isNaN(n)) return;
          onChange(Math.max(min, max != null ? Math.min(max, n) : n));
        }}
      />
      <button
        type="button"
        className={`${w} flex items-center justify-center text-ink-600 hover:bg-ink-50 disabled:opacity-30`}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
