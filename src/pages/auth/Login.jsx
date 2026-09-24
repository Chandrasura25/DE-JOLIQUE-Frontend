import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import AuthShell from '../../components/layout/AuthShell';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Alert } from '../../components/ui/Feedback';
import GoogleButton from '../../components/auth/GoogleButton';

const safeRedirect = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/account');

// Set by the API when Google / an email link sends the browser back here.
const AUTH_NOTICES = {
  verified: ['success', 'Your email link was verified. Log in to continue.'],
  cancelled: ['info', 'Google sign-in was cancelled.'],
  expired: ['error', 'That sign-in link is invalid or has expired. Please try again.'],
  failed: ['error', 'We couldn’t sign you in with that provider. Please try again.'],
  unavailable: ['error', 'That sign-in method isn’t available right now.'],
};

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirect = safeRedirect(params.get('redirect'));
  const notice = AUTH_NOTICES[params.get('auth')];

  if (user && !loading) return <Navigate to={redirect} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Enter a valid email address.';
    if (!form.password) found.password = 'Enter your password.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setError('');
    try {
      const profile = await signIn(form.email, form.password);
      toast.success(`Welcome back${profile.name ? `, ${profile.name.split(' ')[0]}` : ''}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to check out and track your orders."
      footer={
        <>
          New to De-Jolique?{' '}
          <Link to={`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {params.get('confirmed') && (
        <Alert tone="success" className="mb-5">
          Email confirmed. You can log in now.
        </Alert>
      )}
      {notice && !error && (
        <Alert tone={notice[0]} className="mb-5">
          {notice[1]}
        </Alert>
      )}
      {error && (
        <Alert tone="error" className="mb-5">
          {error}
        </Alert>
      )}
      <GoogleButton next={redirect} />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
