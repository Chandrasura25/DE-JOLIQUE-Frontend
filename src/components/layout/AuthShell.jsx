import Logo from './Logo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <h1 className="text-center text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-center text-sm text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  );
}
