import { Link } from 'react-router-dom';
import { useConfig } from '../../lib/queries';
import { LEGAL } from './legalConfig';

/** A business detail; highlighted until it has been filled in. */
export function Fill({ value, label, hint = 'Set this in src/pages/legal/legalConfig.js' }) {
  if (value !== '' && value !== undefined && value !== null) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-100 px-1 font-semibold text-amber-900" title={hint}>
      [{label}]
    </mark>
  );
}

// Email, phone and address are edited by the admin (Admin → Store settings) and come
// from the public store config, so changes appear here without a redeploy.
const SETTINGS_HINT = 'Set this in Admin → Store settings';
const useContact = () => useConfig().data?.contact || {};

export function SupportEmail() {
  const { email } = useContact();
  return email ? (
    <a href={`mailto:${email}`} className="font-medium text-brand-700 underline underline-offset-2">
      {email}
    </a>
  ) : (
    <Fill label="support email" hint={SETTINGS_HINT} />
  );
}

/** ", +234…" when a phone number is set, otherwise nothing. */
export function SupportPhone() {
  const { phone } = useContact();
  return phone ? (
    <>
      {', '}
      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="font-medium text-brand-700 underline underline-offset-2">
        {phone}
      </a>
    </>
  ) : null;
}

export function PostalAddress() {
  const { address } = useContact();
  return <Fill value={address} label="business address" hint={SETTINGS_HINT} />;
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mt-10 text-xl font-bold text-ink-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-600 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-ink-900 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

/** Shared page shell for the Privacy Policy and Terms of Service. */
export default function LegalLayout({ title, intro, sections, children, other }) {
  return (
    <div className="container-page py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-brand-700">{LEGAL.businessName}</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-400">Effective {LEGAL.effectiveDate}</p>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-600">{intro}</p>

        <nav aria-label="On this page" className="mt-8 rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-xs font-semibold tracking-wider text-ink-400 uppercase">On this page</p>
          <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {sections.map(([id, label], i) => (
              <li key={id}>
                <a href={`#${id}`} className="text-ink-600 hover:text-brand-700">
                  {i + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {children}

        <p className="mt-12 border-t border-ink-100 pt-6 text-sm text-ink-500">
          See also our <Link to={other.to} className="font-medium text-brand-700 underline underline-offset-2">{other.label}</Link>.
        </p>
      </article>
    </div>
  );
}
