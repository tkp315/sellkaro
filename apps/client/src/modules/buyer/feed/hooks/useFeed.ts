import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchAdDetail } from '../services/feedApi';
import type { FeedFilters } from '../types';

export function useFeed(filters: FeedFilters = {}) {
  return useQuery({
    queryKey: ['feed', filters],
    queryFn: () => fetchFeed(filters),
  });
}

export function useAdDetail(id: string) {
  return useQuery({
    queryKey: ['ad', id],
    queryFn: () => fetchAdDetail(id),
    enabled: !!id,
  });
}
