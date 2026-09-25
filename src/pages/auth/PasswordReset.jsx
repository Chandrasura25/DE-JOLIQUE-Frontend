import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import AuthShell from '../../components/layout/AuthShell';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Alert, PageLoader } from '../../components/ui/Feedback';
import { ConfirmPasswordInput, NewPasswordInput, passwordProblem } from '../../components/auth/PasswordFields';

export function ForgotPassword() {
  const request = useAuthStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await request(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We’ll email you a link to choose a new one." footer={<Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to login</Link>}>
      {sent ? (
        <Alert tone="success">If an account exists for {email}, a reset link is on its way. Open it in this browser.</Alert>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

/**
 * Reached after the recovery email link: the API has already exchanged the link for a
 * recovery session (cookies) and redirected here.
 */
export function ResetPassword() {
  const navigate = useNavigate();
  const setNewPassword = useAuthStore((s) => s.setNewPassword);
  const status = useAuthStore((s) => s.status);
  const hasSession = useAuthStore((s) => Boolean(s.user));
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    const pw = passwordProblem(form.password);
    if (pw) found.password = pw;
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      await setNewPassword(form.password, form.confirm);
      toast.success('Password updated.');
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (status === 'loading') return <PageLoader />;

  return (
    <AuthShell title="Choose a new password">
      {!hasSession ? (
        <Alert tone="error">
          This reset link is invalid or has expired. <Link to="/forgot-password" className="font-semibold underline">Request a new one</Link>.
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <NewPasswordInput label="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <ConfirmPasswordInput label="Confirm new password" value={form.confirm} password={form.password} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
