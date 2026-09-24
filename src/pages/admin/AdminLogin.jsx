import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AuthShell from '../../components/layout/AuthShell';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Alert } from '../../components/ui/Feedback';
import ChangePasswordForm from '../../components/account/ChangePasswordForm';

export default function AdminLogin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirect = params.get('redirect')?.startsWith('/admin') ? params.get('redirect') : '/admin/dashboard';

  if (user?.role === 'admin' && !loading) {
    return <Navigate to={user.mustChangePassword ? '/admin/change-password' : redirect} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const profile = await signIn(form.email, form.password);
      if (profile.role !== 'admin') {
        await signOut();
        throw new Error('This account does not have admin access.');
      }
      navigate(profile.mustChangePassword ? '/admin/change-password' : redirect, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900/[0.03]">
      <AuthShell title="Admin sign in" subtitle="Manage products, orders and inventory.">
        {error && (
          <Alert tone="error" className="mb-5">
            {error}
          </Alert>
        )}
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" variant="dark" size="lg" className="w-full" loading={loading}>
            <ShieldCheck className="h-4 w-4" /> Sign in
          </Button>
        </form>
      </AuthShell>
    </div>
  );
}

/** Forced on first login for seeded/created admins (must_change_password). */
export function AdminChangePassword() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <AuthShell title="Change your password" subtitle="For security, set a new password before using the dashboard.">
      {user?.mustChangePassword && (
        <Alert tone="warning" className="mb-5">
          You’re using a temporary password. Choose a new one to continue.
        </Alert>
      )}
      <ChangePasswordForm onDone={() => navigate('/admin/dashboard', { replace: true })} />
    </AuthShell>
  );
}
