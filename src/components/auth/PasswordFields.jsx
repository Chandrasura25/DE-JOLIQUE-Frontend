import { useId, useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { Field } from '../ui/Field';

// Keep in step with the server's `password` schema (server/src/validators/schemas.js).
export const PASSWORD_RULES = [
  { label: '8+ chars', test: (v) => v.length >= 8, problem: 'Use at least 8 characters.' },
  { label: 'Uppercase', test: (v) => /[A-Z]/.test(v), problem: 'Include at least one uppercase letter.' },
  { label: 'Lowercase', test: (v) => /[a-z]/.test(v), problem: 'Include at least one lowercase letter.' },
  { label: 'Number', test: (v) => /[0-9]/.test(v), problem: 'Include at least one number.' },
  { label: 'Special', test: (v) => /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/.test(v), problem: 'Include at least one special character (e.g. ! @ # $ %).' },
];

export function passwordProblem(password) {
  return PASSWORD_RULES.find((rule) => !rule.test(password || ''))?.problem ?? null;
}

const MISMATCH = 'Passwords do not match.';

const stateClass = (bad, good) => (bad ? 'input-error' : good ? 'border-green-500 focus:border-green-500 focus:ring-green-500/15' : '');

function PasswordControl({ id, value, onChange, autoComplete, invalid, valid, describedBy }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`input pr-11 ${stateClass(invalid, valid)}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700"
      >
        {visible ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
      </button>
    </div>
  );
}

/** New-password input with a live checklist: unmet rules are red, met rules turn green. */
export function NewPasswordInput({ label = 'Password', value, onChange, error }) {
  const id = useId();
  const passed = PASSWORD_RULES.map((rule) => rule.test(value));
  const allMet = passed.every(Boolean);
  // Rule failures from submit are already shown live by the checklist, so only other errors show as text.
  const shownError = PASSWORD_RULES.some((rule) => rule.problem === error) ? null : error;
  return (
    <Field label={label} error={shownError} htmlFor={id}>
      <PasswordControl
        id={id}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        invalid={Boolean(shownError) || (Boolean(error) && !allMet) || (value.length > 0 && !allMet)}
        valid={allMet}
        describedBy={`${id}-rules`}
      />
      <ul id={`${id}-rules`} aria-live="polite" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
        {PASSWORD_RULES.map((rule, i) => (
          <li key={rule.label} className={`flex items-center gap-1 ${passed[i] ? 'text-green-600' : 'text-red-600'}`}>
            {passed[i] ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
            {rule.label}
            <span className="sr-only">{passed[i] ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>
    </Field>
  );
}

/** Confirm input that shows straight away whether it matches the new password. */
export function ConfirmPasswordInput({ label = 'Confirm password', value, password, onChange, error }) {
  const id = useId();
  const typed = value.length > 0;
  const matches = typed && value === password;
  const mismatch = typed ? !matches : error === MISMATCH;
  const message = mismatch ? MISMATCH : error === MISMATCH ? null : error;
  return (
    <Field label={label} error={message} htmlFor={id}>
      <PasswordControl id={id} value={value} onChange={onChange} autoComplete="new-password" invalid={Boolean(message)} valid={matches} />
      {matches && !message && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
          <Check className="h-3.5 w-3.5" aria-hidden /> Passwords match
        </p>
      )}
    </Field>
  );
}
