import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorMessage } from '../../lib/api';
import { useCategories } from '../../lib/queries';
import { AdminPageHeader } from './AdminLayout';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea, Toggle } from '../../components/ui/Field';
import { Alert, ErrorState, PageLoader, Spinner } from '../../components/ui/Feedback';

const EMPTY = { name: '', description: '', price: '', categoryId: '', stock: '', images: [], featured: false, isActive: true };
const MAX_IMAGES = 10;
const MAX_BYTES = 4 * 1024 * 1024;

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
  if (v.description.trim().length < 10) e.description = 'Description must be at least 10 characters.';
  if (!(Number(v.price) > 0)) e.price = 'Enter a price greater than 0.';
  if (v.stock === '' || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Stock must be a whole number, 0 or more.';
  return e;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef(null);
  const { data: categories } = useCategories();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const existing = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => (await api.get(`/admin/products/${id}`)).data.product,
    enabled: isEdit,
  });

  useEffect(() => {
    const p = existing.data;
    if (p) {
      setForm({
        name: p.name,
        description: p.description,
        price: String(p.price),
        categoryId: p.category?.id || '',
        stock: String(p.stock),
        images: p.images,
        featured: p.featured,
        isActive: p.isActive,
      });
    }
  }, [existing.data]);

  if (isEdit && existing.isLoading) return <PageLoader />;
  if (isEdit && existing.isError) return <ErrorState title="Unable to load product." message={errorMessage(existing.error)} onRetry={existing.refetch} />;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const upload = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) return toast.error(`A product can have at most ${MAX_IMAGES} images.`);
    const tooBig = files.find((f) => f.size > MAX_BYTES);
    if (tooBig) return toast.error(`"${tooBig.name}" is larger than 4MB.`);

    // One image per request: the hosting platform caps a request body at 4.5MB.
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of files.slice(0, room)) {
        const body = new FormData();
        body.append('images', file);
        const { data } = await api.post('/admin/uploads', body);
        setForm((f) => ({ ...f, images: [...f.images, ...data.images] }));
        uploaded += data.images.length;
      }
      toast.success(`${uploaded} image${uploaded === 1 ? '' : 's'} uploaded`);
    } catch (err) {
      toast.error(uploaded ? `${uploaded} uploaded, then: ${errorMessage(err, 'upload failed.')}` : errorMessage(err, 'Image upload failed.'));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
    return undefined;
  };

  const makePrimary = (index) =>
    setForm((f) => ({ ...f, images: [f.images[index], ...f.images.filter((_, i) => i !== index)] }));
  const removeImage = (index) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId || null,
      images: form.images,
      featured: form.featured,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEdit ? 'Product updated.' : 'Product created.');
      navigate('/admin/products');
    } catch (err) {
      const message = errorMessage(err);
      setFormError(message);
      const details = err.response?.data?.details;
      if (details) setErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => navigate('/admin/products')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Products
      </button>
      <AdminPageHeader title={isEdit ? 'Edit product' : 'New product'} />

      <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5 sm:p-6">
            <Input label="Name" value={form.name} onChange={set('name')} error={errors.name} maxLength={160} />
            <Textarea label="Description" rows={6} value={form.description} onChange={set('description')} error={errors.description} maxLength={5000} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Price (₦)" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} error={errors.price} />
              <Input label="Stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={set('stock')} error={errors.stock} />
              <Select label="Category" value={form.categoryId} onChange={set('categoryId')} error={errors.categoryId}>
                <option value="">Uncategorised</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Images</h2>
                <p className="text-xs text-ink-400">JPEG, PNG, WebP or GIF, up to 4MB each. The first image is the main one.</p>
              </div>
              <span className="text-xs text-ink-400">
                {form.images.length}/{MAX_IMAGES}
              </span>
            </div>
            {errors.images && <p className="mb-3 text-xs text-red-600">{errors.images}</p>}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {form.images.map((img, i) => (
                <div key={img.url} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-ink-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    {i !== 0 && (
                      <button type="button" onClick={() => makePrimary(i)} className="rounded-md bg-white/90 p-1 text-ink-700 hover:bg-white" aria-label="Make main image" title="Make main image">
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(i)} className="rounded-md bg-white/90 p-1 text-red-600 hover:bg-white" aria-label="Remove image" title="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    upload(e.dataTransfer.files);
                  }}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 text-xs font-medium text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
                >
                  {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
                  {uploading ? 'Uploading…' : 'Add images'}
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => upload(e.target.files)} />
          </section>
        </div>

        <div className="space-y-4">
          <Toggle label="Active" description="Visible and purchasable in the store." checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <Toggle label="Featured" description="Shown in Featured products on the homepage." checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
          {formError && <Alert tone="error">{formError}</Alert>}
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1" loading={saving} disabled={uploading}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
