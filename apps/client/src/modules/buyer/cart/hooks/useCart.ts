import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { cartApi } from '../services/cartApi';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });
}

export function useCartCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['cart', 'count'],
    queryFn: cartApi.getCount,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useCartAdIds() {
  const { data } = useCart();
  return data?.items.map((i) => i.adId) ?? [];
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => cartApi.add(adId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => cartApi.remove(adId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
