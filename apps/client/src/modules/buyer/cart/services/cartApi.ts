import api from '@/lib/axios';
import type { AdListItem } from '@/modules/buyer/feed/types';

export interface CartItem {
  id: string;
  priceAtAdded: number;
  createdAt: string;
  adId: string;
  ad: AdListItem & { user: { id: string; profile: { name: string } | null } };
}

export interface CartData {
  items: CartItem[];
  total: number;
}

export const cartApi = {
  getCart: () =>
    api.get<{ data: CartData }>('/buyer/cart').then((r) => r.data.data),

  getCount: () =>
    api.get<{ data: { count: number } }>('/buyer/cart/count').then((r) => r.data.data),

  add: (adId: string) =>
    api.post<{ data: { added: boolean; message?: string } }>(`/buyer/cart/${adId}`).then((r) => r.data.data),

  remove: (adId: string) =>
    api.delete<{ data: { removed: boolean } }>(`/buyer/cart/${adId}`).then((r) => r.data.data),

  clear: () =>
    api.delete<{ data: { cleared: boolean } }>('/buyer/cart/clear').then((r) => r.data.data),
};
