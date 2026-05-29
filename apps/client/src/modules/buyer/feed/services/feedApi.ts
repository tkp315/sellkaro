import api from '@/lib/axios';
import type { FeedFilters, FeedResponse, AdDetail } from '../types';

export async function fetchFeed(filters: FeedFilters = {}): Promise<FeedResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const res = await api.get<{ data: FeedResponse }>('/ads', { params });
  return res.data.data;
}

export async function fetchAdDetail(id: string): Promise<AdDetail> {
  const res = await api.get<{ data: AdDetail }>(`/ads/${id}`);
  return res.data.data;
}

export async function revealPhone(adId: string): Promise<{ phone: string }> {
  const res = await api.post<{ data: { phone: string } }>(`/ads/${adId}/reveal-phone`);
  return res.data.data;
}
