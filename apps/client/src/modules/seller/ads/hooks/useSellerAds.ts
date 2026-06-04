import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/sellerAdsApi';
import type { CreateAdDto, UpdateAdDto } from '../types';

export function useMyAds() {
  return useQuery({ queryKey: ['seller-ads'], queryFn: api.fetchMyAds });
}

export function useMyAdById(id: string) {
  return useQuery({ queryKey: ['seller-ad', id], queryFn: () => api.fetchMyAdById(id), enabled: !!id });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAdDto) => api.createAd(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-ads'] }),
  });
}

export function useUpdateAd(adId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAdDto) => api.updateAd(adId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-ads'] });
      qc.invalidateQueries({ queryKey: ['seller-ad', adId] });
    },
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAd(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-ads'] }),
  });
}

export function useChangeAdStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.changeAdStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seller-ads'] }),
  });
}
