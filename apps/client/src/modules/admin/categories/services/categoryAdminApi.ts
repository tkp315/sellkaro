import api from '@/lib/axios';

export interface AdminSubCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  isActive: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  subcategories: AdminSubCategory[];
  _count: { products: number };
}

const base = '/admin/categories';

export const categoryAdminApi = {
  getAll: () => api.get<{ data: AdminCategory[] }>(base).then((r) => r.data.data),

  createCategory: (dto: { name: string; slug: string; icon?: string; order?: number }) =>
    api.post<{ data: AdminCategory }>(base, dto).then((r) => r.data.data),

  updateCategory: (id: string, dto: Partial<{ name: string; slug: string; icon: string; order: number; isActive: boolean }>) =>
    api.patch<{ data: AdminCategory }>(`${base}/${id}`, dto).then((r) => r.data.data),

  deleteCategory: (id: string) => api.delete(`${base}/${id}`),

  createSubcategory: (categoryId: string, dto: { name: string; slug: string; icon?: string; order?: number }) =>
    api.post<{ data: AdminSubCategory }>(`${base}/${categoryId}/subcategories`, dto).then((r) => r.data.data),

  updateSubcategory: (categoryId: string, subId: string, dto: Partial<{ name: string; slug: string; icon: string; order: number; isActive: boolean }>) =>
    api.patch<{ data: AdminSubCategory }>(`${base}/${categoryId}/subcategories/${subId}`, dto).then((r) => r.data.data),

  deleteSubcategory: (categoryId: string, subId: string) =>
    api.delete(`${base}/${categoryId}/subcategories/${subId}`),
};
