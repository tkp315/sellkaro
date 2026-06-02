import { useState } from 'react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from '@/modules/admin/categories/hooks/useCategoryAdmin';
import { getApiError } from '@/utils/apiError';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import type { AdminCategory, AdminSubCategory } from '@/modules/admin/categories/services/categoryAdminApi';

// ─── helpers ────────────────────────────────────────────────────────────────

function toSlug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Small modal ─────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Category form ────────────────────────────────────────────────────────────

interface CatFormState { name: string; slug: string; icon: string; order: string; }

function CategoryForm({
  initial,
  onSubmit,
  isPending,
  error,
}: {
  initial?: Partial<CatFormState>;
  onSubmit: (v: CatFormState) => void;
  isPending: boolean;
  error: unknown;
}) {
  const [form, setForm] = useState<CatFormState>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    icon: initial?.icon ?? '',
    order: initial?.order ?? '',
  });

  const set = (k: keyof CatFormState, v: string) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (k === 'name' && !initial?.slug) next.slug = toSlug(v);
      return next;
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input value={form.name} onChange={(e) => set('name', e.target.value)}
          className="input-field" placeholder="e.g. Mobiles & Tablets" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
        <input value={form.slug} onChange={(e) => set('slug', e.target.value)}
          className="input-field font-mono text-sm" placeholder="mobiles-tablets" required />
        <p className="mt-0.5 text-xs text-gray-400">Lowercase, hyphens only</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
          <input value={form.icon} onChange={(e) => set('icon', e.target.value)}
            className="input-field text-center text-xl" placeholder="📱" maxLength={4} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
          <input value={form.order} onChange={(e) => set('order', e.target.value)}
            type="number" className="input-field" placeholder="1" />
        </div>
      </div>
      {error ? <p className="text-xs text-red-600 rounded-lg bg-red-50 px-3 py-2">{getApiError(error)}</p> : null}
      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Modal =
  | { type: 'addCat' }
  | { type: 'editCat'; cat: AdminCategory }
  | { type: 'addSub'; cat: AdminCategory }
  | { type: 'editSub'; cat: AdminCategory; sub: AdminSubCategory }
  | null;

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<Modal>(null);
  const { page, goToPage, totalPages, pageItems } = usePagination(categories, 10);

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const createSub = useCreateSubcategory();
  const updateSub = useUpdateSubcategory();
  const deleteSub = useDeleteSubcategory();

  const toggle = (id: string) =>
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const close = () => setModal(null);

  const handleCatSubmit = (form: CatFormState) => {
    const dto = {
      name: form.name,
      slug: form.slug,
      icon: form.icon || undefined,
      order: form.order ? Number(form.order) : undefined,
    };
    if (modal?.type === 'editCat') {
      updateCat.mutate({ id: modal.cat.id, ...dto }, { onSuccess: close });
    } else {
      createCat.mutate(dto, { onSuccess: close });
    }
  };

  const handleSubSubmit = (form: CatFormState) => {
    if (!modal || (modal.type !== 'addSub' && modal.type !== 'editSub')) return;
    const dto = {
      name: form.name,
      slug: form.slug,
      icon: form.icon || undefined,
      order: form.order ? Number(form.order) : undefined,
    };
    if (modal.type === 'editSub') {
      updateSub.mutate({ categoryId: modal.cat.id, subId: modal.sub.id, ...dto }, { onSuccess: close });
    } else {
      createSub.mutate({ categoryId: modal.cat.id, ...dto }, { onSuccess: close });
    }
  };

  const confirmDeleteCat = (cat: AdminCategory) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    deleteCat.mutate(cat.id);
  };

  const confirmDeleteSub = (cat: AdminCategory, sub: AdminSubCategory) => {
    if (!window.confirm(`Delete subcategory "${sub.name}"?`)) return;
    deleteSub.mutate({ categoryId: cat.id, subId: sub.id });
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories total</p>
        </div>
        <button
          onClick={() => setModal({ type: 'addCat' })}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <span className="text-lg leading-none">+</span> Add Category
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">📂</p>
          <p>No categories yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map((cat) => (
            <div key={cat.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Category row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white">
                <button
                  onClick={() => toggle(cat.id)}
                  className="text-gray-400 hover:text-gray-600 transition w-5 text-center"
                >
                  {expanded.has(cat.id) ? '▼' : '▶'}
                </button>

                <span className="text-xl w-7 text-center">{cat.icon ?? '📁'}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{cat.name}</span>
                    {!cat.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                    <span className="text-xs text-gray-400">
                      {cat.subcategories.length} subcategories · {cat._count.products} ads
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setModal({ type: 'addSub', cat })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    + Sub
                  </button>
                  <button
                    onClick={() => setModal({ type: 'editCat', cat })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteCat(cat)}
                    disabled={deleteCat.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expanded.has(cat.id) && (
                <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
                  {cat.subcategories.length === 0 ? (
                    <p className="px-12 py-3 text-sm text-gray-400 italic">No subcategories</p>
                  ) : (
                    cat.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 px-12 py-2.5">
                        <span className="text-base w-6 text-center">{sub.icon ?? '•'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                            {!sub.isActive && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{sub.slug}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setModal({ type: 'editSub', cat, sub })}
                            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-white transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDeleteSub(cat, sub)}
                            disabled={deleteSub.isPending}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} className="mt-6" />
      )}

      {/* Modals */}
      {modal?.type === 'addCat' && (
        <Modal title="Add Category" onClose={close}>
          <CategoryForm
            onSubmit={handleCatSubmit}
            isPending={createCat.isPending}
            error={createCat.error}
          />
        </Modal>
      )}

      {modal?.type === 'editCat' && (
        <Modal title={`Edit — ${modal.cat.name}`} onClose={close}>
          <CategoryForm
            initial={{ name: modal.cat.name, slug: modal.cat.slug, icon: modal.cat.icon ?? '', order: String(modal.cat.order) }}
            onSubmit={handleCatSubmit}
            isPending={updateCat.isPending}
            error={updateCat.error}
          />
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={modal.cat.isActive}
                onChange={(e) =>
                  updateCat.mutate({ id: modal.cat.id, isActive: e.target.checked }, { onSuccess: close })
                }
                className="rounded"
              />
              Active (visible in app)
            </label>
          </div>
        </Modal>
      )}

      {modal?.type === 'addSub' && (
        <Modal title={`Add Subcategory → ${modal.cat.name}`} onClose={close}>
          <CategoryForm
            onSubmit={handleSubSubmit}
            isPending={createSub.isPending}
            error={createSub.error}
          />
        </Modal>
      )}

      {modal?.type === 'editSub' && (
        <Modal title={`Edit — ${modal.sub.name}`} onClose={close}>
          <CategoryForm
            initial={{ name: modal.sub.name, slug: modal.sub.slug, icon: modal.sub.icon ?? '', order: String(modal.sub.order) }}
            onSubmit={handleSubSubmit}
            isPending={updateSub.isPending}
            error={updateSub.error}
          />
          <div className="mt-3 pt-3 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={modal.sub.isActive}
                onChange={(e) =>
                  updateSub.mutate(
                    { categoryId: modal.cat.id, subId: modal.sub.id, isActive: e.target.checked },
                    { onSuccess: close },
                  )
                }
                className="rounded"
              />
              Active (visible in app)
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
