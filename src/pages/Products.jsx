import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import { useCategories, useConfig, useProducts } from '../lib/queries';
import { errorMessage } from '../lib/api';
import { ProductGrid } from '../components/product/ProductCard';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';

const SORTS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['name', 'Name (A–Z)'],
];

function Filters({ params, update, categories }) {
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const activeCategory = params.get('category') || '';

  useEffect(() => {
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
  }, [params]);

  const priceInvalid = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <ul className="space-y-1">
          {[{ slug: '', name: 'All categories', id: 'all' }, ...(categories || [])].map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => update({ category: c.slug || null })}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeCategory === c.slug ? 'bg-brand-50 font-semibold text-brand-800' : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                {c.name}
                {c.productCount != null && <span className="text-xs text-ink-300">{c.productCount}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!priceInvalid) update({ minPrice: minPrice || null, maxPrice: maxPrice || null });
        }}
      >
        <h3 className="mb-3 text-sm font-semibold">Price (₦)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        {priceInvalid && <p className="mt-1.5 text-xs text-red-600">Minimum cannot be more than maximum.</p>}
        <Button type="submit" variant="secondary" size="sm" className="mt-3 w-full" disabled={priceInvalid}>
          Apply price
        </Button>
      </form>

      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-ink-300 accent-brand-500"
          checked={params.get('inStock') === 'true'}
          onChange={(e) => update({ inStock: e.target.checked ? 'true' : null })}
        />
        In stock only
      </label>
    </div>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: config } = useConfig();
  const { data: categories } = useCategories();

  const query = {
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    minPrice: params.get('minPrice') || undefined,
    maxPrice: params.get('maxPrice') || undefined,
    inStock: params.get('inStock') || undefined,
    featured: params.get('featured') || undefined,
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page')) || 1,
    limit: 12,
  };
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts(query);

  const update = (changes, { resetPage = true } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v == null || v === '' ? next.delete(k) : next.set(k, v)));
    if (resetPage) next.delete('page');
    setParams(next);
    setFiltersOpen(false);
  };

  const categoryName = categories?.find((c) => c.slug === query.category)?.name;
  const title = query.search ? `Results for “${query.search}”` : query.featured ? 'Featured products' : categoryName || 'All products';
  const activeChips = [
    query.search && ['search', `“${query.search}”`],
    categoryName && ['category', categoryName],
    query.minPrice && ['minPrice', `From ₦${Number(query.minPrice).toLocaleString()}`],
    query.maxPrice && ['maxPrice', `Up to ₦${Number(query.maxPrice).toLocaleString()}`],
    query.inStock && ['inStock', 'In stock'],
    query.featured && ['featured', 'Featured'],
  ].filter(Boolean);

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-ink-400" aria-live="polite">
            {data ? `${data.pagination.total} product${data.pagination.total === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <label className="sr-only" htmlFor="sort">
            Sort by
          </label>
          <select id="sort" className="input select w-auto min-w-48" value={query.sort} onChange={(e) => update({ sort: e.target.value })}>
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {activeChips.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ [key]: null })}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-ink-200 hover:ring-ink-300"
            >
              {label} <X className="h-3.5 w-3.5 text-ink-400" aria-label="Remove filter" />
            </button>
          ))}
          <button type="button" className="text-xs font-semibold text-brand-700 hover:underline" onClick={() => setParams({})}>
            Clear all
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Filters params={params} update={update} categories={categories} />
        </aside>

        <section aria-busy={isFetching} className={isFetching && !isLoading ? 'opacity-70 transition' : ''}>
          {isError ? (
            <ErrorState title="Unable to load products." message={errorMessage(error)} onRetry={refetch} />
          ) : !isLoading && data.products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try a different search term or remove some filters."
              action={<Button variant="secondary" onClick={() => setParams({})}>Clear filters</Button>}
            />
          ) : (
            <>
              <ProductGrid products={data?.products || []} loading={isLoading} count={9} currency={config?.currency} className="lg:grid-cols-3" />
              <Pagination
                page={query.page}
                pages={data?.pagination.pages}
                onChange={(page) => {
                  update({ page: String(page) }, { resetPage: false });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </section>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-lg p-2 hover:bg-ink-50" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Filters params={params} update={update} categories={categories} />
          </div>
        </div>
      )}
    </div>
  );
}
