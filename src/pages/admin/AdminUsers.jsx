import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { capitalize, formatDate, timeAgo } from '../../lib/format';
import { AdminPageHeader } from './AdminLayout';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import Pagination from '../../components/ui/Pagination';

const PROVIDER_LABELS = { email: 'Email', google: 'Google' };

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const filters = {
    search: params.get('search') || undefined,
    page: Number(params.get('page')) || 1,
    limit: 20,
  };

  useEffect(() => {
    setSearch(params.get('search') || '');
  }, [params]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => (await api.get('/admin/users', { params: filters })).data,
    placeholderData: keepPreviousData,
  });

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const { data: result } = await api.delete(`/admin/users/${toDelete.id}`);
      toast.success(result.message);
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Users" description={data ? `${data.pagination.total} accounts` : 'Customer accounts'} />

      <form
        role="search"
        className="relative mb-4 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: search.trim() });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          type="search"
          className="input pl-10"
          placeholder="Name, email or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
        />
      </form>

      <div className="card overflow-hidden">
        {isError ? (
          <ErrorState title="Unable to load users." message={errorMessage(error)} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : data.users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Accounts matching this filter will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-ink-50/60 text-left text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Sign-in</th>
                  <th className="px-5 py-3 font-medium">Last login</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Orders</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/40">
                    <td className="px-5 py-3">
                      <p className="max-w-56 truncate font-medium">{u.name || '—'}</p>
                      <p className="max-w-56 truncate text-xs text-ink-400">{u.email}</p>
                      {u.phone && <p className="text-xs text-ink-400">{u.phone}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={u.role === 'admin' ? 'violet' : 'gray'}>{capitalize(u.role)}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.providers.map((p) => (
                          <Badge key={p} tone={p === 'google' ? 'blue' : 'gray'}>
                            {PROVIDER_LABELS[p] || capitalize(p)}
                          </Badge>
                        ))}
                        {!u.emailConfirmed && <Badge tone="amber">Unconfirmed</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {u.lastSignInAt ? (
                        <time dateTime={u.lastSignInAt} title={formatDate(u.lastSignInAt, true)} className="text-ink-700">
                          {timeAgo(u.lastSignInAt)}
                        </time>
                      ) : (
                        <span className="text-ink-400">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-medium">{u.orderCount}</td>
                    <td className="px-5 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => setToDelete(u)}
                          className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${u.email}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={filters.page} pages={data?.pagination.pages} onChange={(p) => update({ page: String(p) })} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete user?"
        message={
          <>
            <strong className="text-ink-900">{toDelete?.email}</strong> will be permanently deleted and signed out everywhere. This can’t be undone.
            {toDelete?.orderCount > 0 && ` Their ${toDelete.orderCount} order(s) will be kept for your records.`}
          </>
        }
        confirmLabel="Delete user"
      />
    </>
  );
}
