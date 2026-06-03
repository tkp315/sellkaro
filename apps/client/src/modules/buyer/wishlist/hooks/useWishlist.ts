import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { wishlistApi } from '../services/wishlistApi';

export function useWishlistIds() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['wishlist', 'ids'],
    queryFn: wishlistApi.getIds,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getAll,
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => wishlistApi.toggle(adId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['wishlist', 'ids'] });
    },
  });
}
