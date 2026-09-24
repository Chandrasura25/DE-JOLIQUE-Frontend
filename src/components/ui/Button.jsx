import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm shadow-brand-900/10',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950',
  secondary: 'bg-white text-ink-900 border border-ink-200 hover:border-ink-300 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  'danger-outline': 'border border-red-200 text-red-700 bg-white hover:bg-red-50',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10',
};

export const buttonClass = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
  `inline-flex items-center justify-center rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

const Button = forwardRef(function Button(
  { variant, size, className, loading = false, disabled, children, to, type = 'button', ...props },
  ref,
) {
  const classes = buttonClass({ variant, size, className });
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export default Button;
