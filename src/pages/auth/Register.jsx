import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import AuthShell from '../../components/layout/AuthShell';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Alert } from '../../components/ui/Feedback';
import GoogleButton from '../../components/auth/GoogleButton';
import { ConfirmPasswordInput, NewPasswordInput, passwordProblem } from '../../components/auth/PasswordFields';

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signUp = useAuthStore((s) => s.signUp);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const redirect = params.get('redirect')?.startsWith('/') ? params.get('redirect') : '/account';

  if (user && !loading) return <Navigate to={redirect} replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Enter a valid email address.';
    if (form.phone && !/^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim())) found.phone = 'Enter a valid phone number.';
    const pw = passwordProblem(form.password);
    if (pw) found.password = pw;
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setError('');
    try {
      const { needsConfirmation } = await signUp(form, redirect);
      if (needsConfirmation) {
        setSentTo(form.email.trim());
        setLoading(false);
      } else {
        toast.success('Your account has been created.');
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell title="Check your email" subtitle="One more step to finish creating your account.">
        <div className="flex flex-col items-center text-center">
          <MailCheck className="h-12 w-12 text-brand-500" aria-hidden />
          <p className="mt-4 text-sm text-ink-500">
            We sent a confirmation link to <strong className="text-ink-900">{sentTo}</strong>. Open it in this browser to activate your account and sign in.
          </p>
          <Button to="/login" variant="secondary" className="mt-6">
            Go to login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your details and follow every order."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}
      <GoogleButton next={redirect} />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Phone (optional)" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <NewPasswordInput value={form.password} onChange={set('password')} error={errors.password} />
        <ConfirmPasswordInput value={form.confirm} password={form.password} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
        <p className="text-center text-xs leading-relaxed text-ink-400">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-medium text-ink-600 underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-ink-600 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
