import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { AdminPageHeader } from './AdminLayout';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { ErrorState, Skeleton } from '../../components/ui/Feedback';

const EMPTY = { supportEmail: '', supportPhone: '', postalAddress: '' };

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.settings,
  });

  useEffect(() => {
    if (data) setForm({ supportEmail: data.supportEmail, supportPhone: data.supportPhone, postalAddress: data.postalAddress });
  }, [data]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const dirty = data && Object.keys(EMPTY).some((k) => form[k].trim() !== (data[k] || ''));

  const save = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.supportEmail.trim() && !/^\S+@\S+\.\S+$/.test(form.supportEmail.trim())) found.supportEmail = 'Enter a valid email address.';
    if (form.supportPhone.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(form.supportPhone.trim())) found.supportPhone = 'Enter a valid phone number.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const { data: result } = await api.put('/admin/settings', {
        supportEmail: form.supportEmail.trim(),
        supportPhone: form.supportPhone.trim(),
        postalAddress: form.postalAddress.trim(),
      });
      queryClient.setQueryData(['admin', 'settings'], result.settings);
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success(result.message);
    } catch (err) {
      const details = err.response?.data?.details;
      if (details?.length) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Store settings" description="Contact details customers see in the footer and in the legal pages." />

      <section className="card max-w-2xl p-5 sm:p-6">
        {isError ? (
          <ErrorState title="Unable to load settings." message={errorMessage(error)} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <form onSubmit={save} noValidate className="space-y-5">
            <Input
              label="Support email"
              type="email"
              autoComplete="off"
              value={form.supportEmail}
              onChange={set('supportEmail')}
              error={errors.supportEmail}
              hint="Where customers send questions, returns and privacy requests."
            />
            <Input
              label="Phone / WhatsApp"
              type="tel"
              autoComplete="off"
              value={form.supportPhone}
              onChange={set('supportPhone')}
              error={errors.supportPhone}
              hint="Optional. For example +234 903 484 9610."
            />
            <Textarea
              label="Business address"
              value={form.postalAddress}
              onChange={set('postalAddress')}
              error={errors.postalAddress}
              maxLength={300}
              rows={3}
              hint="Shown in the footer and legal pages as your official address."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-50 pt-5">
              <p className="text-xs text-ink-400">
                {data?.updatedAt ? `Last saved ${formatDate(data.updatedAt, true)}` : 'Not saved yet'} · Appears on{' '}
                <Link to="/privacy" target="_blank" className="underline underline-offset-2 hover:text-ink-700">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link to="/terms" target="_blank" className="underline underline-offset-2 hover:text-ink-700">
                  Terms
                </Link>
              </p>
              <Button type="submit" loading={saving} disabled={!dirty}>
                Save changes
              </Button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
