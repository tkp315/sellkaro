import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { reviewApi } from '../services/reviewApi';

export function useSellerReviews(sellerId: string) {
  return useQuery({
    queryKey: ['reviews', sellerId],
    queryFn: () => reviewApi.getForSeller(sellerId),
    enabled: !!sellerId,
  });
}

export function useMyReview(sellerId: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['my-review', sellerId],
    queryFn: () => reviewApi.getMyReview(sellerId),
    enabled: !!sellerId && isAuthenticated,
  });
}

export function useSubmitReview(sellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', sellerId] });
      qc.invalidateQueries({ queryKey: ['my-review', sellerId] });
      qc.invalidateQueries({ queryKey: ['seller-profile'] });
    },
  });
}

export function useDeleteReview(sellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.delete(sellerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', sellerId] });
      qc.invalidateQueries({ queryKey: ['my-review', sellerId] });
    },
  });
}
