import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { notificationApi } from '../services/notificationApi';

export function useNotifications(page = 1) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getAll(page),
    enabled: isAuthenticated,
  });
}

export function useNotificationUnreadCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
