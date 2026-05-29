import api from '@/lib/axios';
import type { SellerAd, CreateAdDto, UpdateAdDto } from '../types';

const BASE = '/seller/ads';

export async function createAd(dto: CreateAdDto): Promise<SellerAd> {
  const res = await api.post<{ data: SellerAd }>(BASE, dto);
  return res.data.data;
}

export async function fetchMyAds(): Promise<SellerAd[]> {
  const res = await api.get<{ data: SellerAd[] }>(BASE);
  return res.data.data;
}

export async function fetchMyAdById(id: string): Promise<SellerAd> {
  const res = await api.get<{ data: SellerAd }>(`${BASE}/${id}`);
  return res.data.data;
}

export async function updateAd(id: string, dto: UpdateAdDto): Promise<SellerAd> {
  const res = await api.patch<{ data: SellerAd }>(`${BASE}/${id}`, dto);
  return res.data.data;
}

export async function deleteAd(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export async function changeAdStatus(id: string, status: string): Promise<SellerAd> {
  const res = await api.patch<{ data: SellerAd }>(`${BASE}/${id}/status`, { status });
  return res.data.data;
}

export async function fetchSellerPublicProfile(userId: string) {
  const res = await api.get<{ data: {
    seller: { id: string; createdAt: string; activeAdsCount: number; profile: { name: string; avatar: string | null; city: string | null; bio: string | null } | null };
    ads: SellerAd[];
  } }>(`/users/${userId}/profile`);
  return res.data.data;
}
