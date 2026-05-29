import api from '@/lib/axios';
import type { AdListItem } from '@/modules/buyer/feed/types';

export interface SavedAd extends AdListItem {
  savedAt: string;
}

export const wishlistApi = {
  toggle: (adId: string) =>
    api.post<{ data: { saved: boolean } }>(`/buyer/wishlist/${adId}`).then((r) => r.data.data),

  getAll: () =>
    api.get<{ data: SavedAd[] }>('/buyer/wishlist').then((r) => r.data.data),

  getIds: () =>
    api.get<{ data: string[] }>('/buyer/wishlist/ids').then((r) => r.data.data),
};
