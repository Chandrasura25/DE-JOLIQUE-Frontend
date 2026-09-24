import { useState } from 'react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { passwordProblem } from '../../pages/auth/Register';
import Button from '../ui/Button';
import { Input } from '../ui/Field';
import { Alert } from '../ui/Feedback';

/** Server-side password change: the API checks the current password first. */
export default function ChangePasswordForm({ onDone }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Enter your current password.';
    const pw = passwordProblem(form.newPassword);
    if (pw) found.newPassword = pw;
    if (form.newPassword && form.newPassword === form.currentPassword) found.newPassword = 'Choose a password different from your current one.';
    if (form.confirm !== form.newPassword) found.confirm = 'Passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setUser(data.user);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully.');
      onDone?.(data.user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <Input label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} />
      <Input label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} hint="At least 8 characters, with letters and numbers." />
      <Input label="Confirm new password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
      <Button type="submit" loading={loading}>
        Change password
      </Button>
    </form>
  );
}
