import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryAdminApi } from '../services/categoryAdminApi';

const KEY = ['admin', 'categories'];

export function useAdminCategories() {
  return useQuery({ queryKey: KEY, queryFn: categoryAdminApi.getAll });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryAdminApi.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Parameters<typeof categoryAdminApi.updateCategory>[1]) =>
      categoryAdminApi.updateCategory(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryAdminApi.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useCreateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, ...dto }: { categoryId: string } & Parameters<typeof categoryAdminApi.createSubcategory>[1]) =>
      categoryAdminApi.createSubcategory(categoryId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, subId, ...dto }: { categoryId: string; subId: string } & Parameters<typeof categoryAdminApi.updateSubcategory>[2]) =>
      categoryAdminApi.updateSubcategory(categoryId, subId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, subId }: { categoryId: string; subId: string }) =>
      categoryAdminApi.deleteSubcategory(categoryId, subId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
