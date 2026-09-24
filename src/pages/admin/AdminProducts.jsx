import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useCategories, useConfig } from '../../lib/queries';
import { formatPrice, productImage } from '../../lib/format';
import { AdminPageHeader } from './AdminLayout';
import Button from '../../components/ui/Button';
import { Badge, StockBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import Pagination from '../../components/ui/Pagination';

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: config } = useConfig();
  const [search, setSearch] = useState(params.get('search') || '');
  const [toDelete, setToDelete] = useState(null);

  const filters = {
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    status: params.get('status') || undefined,
    stock: params.get('stock') || undefined,
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page')) || 1,
    limit: 15,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: async () => (await api.get('/admin/products', { params: filters })).data,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setSearch(params.get('search') || '');
  }, [params]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted.');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const threshold = config?.lowStockThreshold ?? 5;

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={data ? `${data.pagination.total} products` : 'Manage your catalogue'}
        actions={
          <Button to="/admin/products/create">
            <Plus className="h-4 w-4" /> New product
          </Button>
        }
      />

      <div className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_150px_150px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: search.trim() });
          }}
          className="relative"
          role="search"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input className="input pl-10" type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
        </form>
        <select className="input select" value={filters.category || ''} onChange={(e) => update({ category: e.target.value })} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input select" value={filters.status || ''} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <select className="input select" value={filters.stock || ''} onChange={(e) => update({ stock: e.target.value })} aria-label="Filter by stock">
          <option value="">Any stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
          <option value="in">Well stocked</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isError ? (
          <ErrorState title="Unable to load products." message={errorMessage(error)} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : data.products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Try different filters, or add your first product." action={<Button to="/admin/products/create">New product</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-ink-50/60 text-left text-xs text-ink-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {data.products.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={productImage(p)} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-ink-50 object-cover" />
                        <div className="min-w-0">
                          <Link to={`/admin/products/${p.id}/edit`} className="line-clamp-1 font-semibold hover:text-brand-700">
                            {p.name}
                          </Link>
                          {p.featured && <span className="text-xs text-brand-600">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{p.category?.name || '—'}</td>
                    <td className="px-5 py-3 text-right font-medium whitespace-nowrap">{formatPrice(p.price, config?.currency)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-semibold tabular-nums">{p.stock}</span>
                        <StockBadge stock={p.stock} threshold={threshold} />
                      </div>
                    </td>
                    <td className="px-5 py-3">{p.isActive ? <Badge tone="teal">Active</Badge> : <Badge>Hidden</Badge>}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/products/${p.id}/edit`} className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900" aria-label={`Edit ${p.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button type="button" onClick={() => setToDelete(p)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${p.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        onConfirm={() => remove.mutate(toDelete.id)}
        loading={remove.isPending}
        title="Delete product?"
        message={
          <>
            <strong className="text-ink-900">{toDelete?.name}</strong> will be permanently deleted along with its uploaded images. Past orders keep their own copy
            of the product details. To stop selling it without deleting, set it to hidden instead.
          </>
        }
        confirmLabel="Delete product"
      />
    </>
  );
}
