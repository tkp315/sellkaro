import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createAdSchema, type CreateAdFormValues } from '../validators';
import { useCreateAd, useUpdateAd } from '../hooks/useSellerAds';
import { useCategories } from '@/modules/shared/categories/hooks/useCategories';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { getApiError } from '@/utils/apiError';
import { uploadFiles } from '@/lib/uploadApi';
import type { SellerAd } from '../types';

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

interface MediaItem {
  id: string;
  file?: File;
  preview: string;
  isVideo: boolean;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  error?: string;
}

interface Props {
  mode: 'create' | 'edit';
  ad?: SellerAd;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url) || url.includes('/video/upload/');
}

export default function AdForm({ mode, ad }: Props) {
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { theme } = useTheme();
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createAd = useCreateAd();
  const updateAd = useUpdateAd(ad?.id ?? '');

  // Pre-populate existing media in edit mode
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() =>
    (ad?.images ?? []).map((img) => ({
      id: img.id,
      preview: img.url,
      isVideo: isVideoUrl(img.url),
      status: 'done' as const,
      url: img.url,
    })),
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  // Reset subcategory whenever category changes (stale id would silently submit wrong value)
  useEffect(() => {
    if (mode === 'create') setValue('subcategoryId', '');
  }, [selectedCategoryId, mode, setValue]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    e.target.value = '';
    setFileError(null);

    const remaining = MAX_FILES - mediaItems.length;
    if (remaining <= 0) {
      setFileError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const toProcess = selected.slice(0, remaining);
    const errors: string[] = [];

    const valid = toProcess.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errors.push(`"${f.name}" — unsupported format`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        errors.push(`"${f.name}" exceeds 10 MB`);
        return false;
      }
      return true;
    });

    if (errors.length) setFileError(errors.join(' · '));
    if (!valid.length) return;

    // Create placeholder items immediately for instant feedback
    const newItems: MediaItem[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/'),
      status: 'uploading' as const,
    }));

    setMediaItems((prev) => [...prev, ...newItems]);

    // Upload in one batch
    try {
      const results = await uploadFiles(valid);
      setMediaItems((prev) =>
        prev.map((item) => {
          const idx = newItems.findIndex((n) => n.id === item.id);
          if (idx === -1) return item;
          return { ...item, status: 'done' as const, url: results[idx]!.url };
        }),
      );
    } catch {
      setMediaItems((prev) =>
        prev.map((item) =>
          newItems.find((n) => n.id === item.id)
            ? { ...item, status: 'error' as const, error: 'Upload failed' }
            : item,
        ),
      );
    }
  };

  const removeMedia = (id: string) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview);
      return prev.filter((m) => m.id !== id);
    });
  };

  const onSubmit = async (data: CreateAdFormValues) => {
    const stillUploading = mediaItems.some((m) => m.status === 'uploading');
    if (stillUploading) {
      showToast('Please wait — files are still uploading', 'error');
      return;
    }

    const imageUrls = mediaItems.filter((m) => m.status === 'done' && m.url).map((m) => m.url!);

    if (mode === 'edit') {
      await updateAd.mutateAsync({ ...data, imageUrls: imageUrls.length ? imageUrls : undefined });
      showToast('Ad updated!', 'success');
    } else {
      await createAd.mutateAsync({ ...data, imageUrls: imageUrls.length ? imageUrls : undefined });
      showToast('Ad posted!', 'success');
    }
    navigate('/seller');
  };

  const isPending = mode === 'edit' ? updateAd.isPending : createAd.isPending;
  const mutationError = mode === 'edit' ? updateAd.error : createAd.error;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mutationError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
          {getApiError(mutationError)}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input {...register('area')} className="input-field" placeholder="Andheri West" />
        </div>
      </div>

      {/* ─── Photos & Videos ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Photos & Videos
            <span className="ml-1 text-gray-400 font-normal text-xs">
              (max {MAX_FILES} files · 10 MB each · jpg, png, webp, gif, mp4, webm, mov)
            </span>
          </label>
          <span className="text-xs text-gray-400">{mediaItems.length}/{MAX_FILES}</span>
        </div>

        {fileError && (
          <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{fileError}</p>
        )}

        {/* Grid: existing + new files + add button */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {mediaItems.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50"
            >
              {/* Cover badge */}
              {idx === 0 && (
                <span className="absolute top-1 left-1 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
                  Cover
                </span>
              )}

              {/* Preview */}
              {item.isVideo ? (
                <video src={item.preview} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
              )}

              {/* Status overlay */}
              {item.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <svg className="h-6 w-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}
              {item.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 px-1 text-center">
                  <span className="text-lg">⚠️</span>
                  <span className="text-[10px] text-white">Failed</span>
                </div>
              )}
              {item.isVideo && item.status === 'done' && (
                <div className="absolute bottom-1 right-1 rounded-md bg-black/50 px-1 py-0.5 text-[10px] text-white">
                  VIDEO
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-red-600 transition"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add files button */}
          {mediaItems.length < MAX_FILES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[11px] font-medium">Add</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={handleFilesSelected}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate('/seller')}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn-primary flex-1">
          {isPending
            ? mode === 'edit' ? 'Saving...' : 'Posting...'
            : mode === 'edit' ? 'Save Changes' : 'Post Ad'}
        </button>
      </div>
    </form>
  );
}
