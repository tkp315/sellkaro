import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createAdSchema, type CreateAdFormValues } from '../validators';
import { useCreateAd, useUpdateAd } from '../hooks/useSellerAds';
import { useCategories } from '@/modules/shared/categories/hooks/useCategories';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { getApiError } from '@/utils/apiError';
import type { SellerAd } from '../types';

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
] as const;

interface Props {
  mode: 'create' | 'edit';
  ad?: SellerAd;
}

export default function AdForm({ mode, ad }: Props) {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { theme } = useTheme();
  const { data: categories = [] } = useCategories();

  const createAd = useCreateAd();
  const updateAd = useUpdateAd(ad?.id ?? '');
  const mutation = mode === 'edit' ? updateAd : createAd;

  const defaultImageUrls = ad?.images.map((i) => i.url) ?? [''];
  const [imageUrls, setImageUrls] = useState<string[]>(defaultImageUrls.length ? defaultImageUrls : ['']);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAdFormValues>({
    resolver: zodResolver(createAdSchema),
    defaultValues: ad
      ? {
          title: ad.title,
          description: ad.description,
          price: ad.price,
          condition: ad.condition,
          city: ad.city,
          area: ad.area ?? '',
          categoryId: ad.product.category.id,
          subcategoryId: ad.product.subcategory?.id ?? '',
        }
      : undefined,
  });

  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const onSubmit = async (data: CreateAdFormValues) => {
    const validUrls = imageUrls.filter((u) => u.trim().startsWith('http'));
    if (mode === 'edit') {
      await updateAd.mutateAsync({ ...data, imageUrls: validUrls.length ? validUrls : undefined });
      showToast('Ad updated successfully!', 'success');
      navigate('/seller');
    } else {
      await createAd.mutateAsync({ ...data, imageUrls: validUrls.length ? validUrls : undefined });
      showToast('Ad posted successfully!', 'success');
      navigate('/seller');
    }
  };

  const addImageUrl = () => { if (imageUrls.length < 10) setImageUrls((p) => [...p, '']); };
  const removeImageUrl = (i: number) => setImageUrls((p) => p.filter((_, idx) => idx !== i));
  const updateImageUrl = (i: number, val: string) => setImageUrls((p) => p.map((u, idx) => (idx === i ? val : u)));

  const isPending = mutation.isPending;
  const error = mutation.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {getApiError(error)}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input {...register('title')} className="input-field" placeholder="What are you selling?" />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="input-field resize-none"
          placeholder="Describe your item in detail..."
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input {...register('price', { valueAsNumber: true })} type="number" min={0} className="input-field" placeholder="0" />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select {...register('condition')} className="input-field">
            <option value="">Select condition</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors.condition && <p className="mt-1 text-xs text-red-600">{errors.condition.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select {...register('categoryId')} className="input-field" disabled={mode === 'edit'}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
          {mode === 'edit' && <p className="mt-1 text-xs text-gray-400">Category cannot be changed</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select {...register('subcategoryId')} className="input-field" disabled={!selectedCategory || mode === 'edit'}>
            <option value="">None</option>
            {selectedCategory?.subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input {...register('city')} className="input-field" placeholder="Mumbai" />
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area <span className="text-gray-400 font-normal">(optional)</span></label>
          <input {...register('area')} className="input-field" placeholder="Andheri West" />
        </div>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Photos <span className="text-gray-400 font-normal">(image URLs, max 10)</span>
          </label>
          {imageUrls.length < 10 && (
            <button type="button" onClick={addImageUrl} className="text-xs font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
              + Add photo
            </button>
          )}
        </div>
        <div className="space-y-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className="input-field flex-1"
                placeholder={i === 0 ? 'Cover photo URL (https://...)' : `Photo ${i + 1} URL`}
              />
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => removeImageUrl(i)} className="shrink-0 rounded-lg border border-gray-200 px-2 text-gray-400 hover:text-red-500">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {imageUrls.some((u) => u.startsWith('http')) && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {imageUrls.filter((u) => u.startsWith('http')).map((url, i) => (
              <img key={i} src={url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover border border-gray-200"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => navigate('/seller')} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary flex-1">
          {isPending ? (mode === 'edit' ? 'Saving...' : 'Posting...') : (mode === 'edit' ? 'Save Changes' : 'Post Ad')}
        </button>
      </div>
    </form>
  );
}
