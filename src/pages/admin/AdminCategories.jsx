import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, FolderTree, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useCategories } from '../../lib/queries';
import { AdminPageHeader } from './AdminLayout';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const [form, setForm] = useState({ name: '', description: '' });
  const [nameError, setNameError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null); // { id, name }
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError('Enter a category name.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/admin/categories', { name: form.name.trim(), description: form.description.trim() });
      toast.success('Category created.');
      setForm({ name: '', description: '' });
      setNameError('');
      refresh();
    } catch (err) {
      setNameError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const rename = async () => {
    if (!editing.name.trim()) return;
    setBusy(true);
    try {
      await api.put(`/admin/categories/${editing.id}`, { name: editing.name.trim() });
      toast.success('Category renamed.');
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete(`/admin/categories/${toDelete.id}`);
      toast.success(data.message);
      setToDelete(null);
      refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Categories" description="Organise products so customers can browse and filter." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card overflow-hidden">
          {isError ? (
            <ErrorState title="Unable to load categories." message={errorMessage(error)} onRetry={refetch} />
          ) : isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState icon={FolderTree} title="No categories yet" description="Create your first category using the form." />
          ) : (
            <ul className="divide-y divide-ink-50">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                  {editing?.id === c.id ? (
                    <form
                      className="flex flex-1 items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        rename();
                      }}
                    >
                      <input className="input h-9 py-1.5" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} autoFocus aria-label="Category name" maxLength={80} />
                      <button type="submit" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" aria-label="Save" disabled={busy}>
                        <Check className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg p-2 text-ink-400 hover:bg-ink-50" aria-label="Cancel" onClick={() => setEditing(null)}>
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-ink-400">
                          /{c.slug} · {c.productCount} active product{c.productCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      <button type="button" onClick={() => setEditing({ id: c.id, name: c.name })} className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900" aria-label={`Rename ${c.name}`}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setToDelete(c)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${c.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card h-fit p-5 sm:p-6">
          <h2 className="mb-4 font-bold">New category</h2>
          <form onSubmit={create} noValidate className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={nameError} maxLength={80} />
            <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
            <Button type="submit" loading={creating} className="w-full">
              Create category
            </Button>
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete category?"
        message={
          <>
            <strong className="text-ink-900">{toDelete?.name}</strong> will be deleted. Its {toDelete?.productCount} product(s) will stay in the store as uncategorised.
          </>
        }
        confirmLabel="Delete category"
      />
    </>
  );
}
