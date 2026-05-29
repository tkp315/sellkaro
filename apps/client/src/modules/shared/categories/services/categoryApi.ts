import api from '@/lib/axios';
import type { Category } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get<{ data: Category[] }>('/categories');
  return res.data.data;
}
