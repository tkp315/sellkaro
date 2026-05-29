import api from '@/lib/axios';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: (page = 1) =>
    api.get<{ data: { notifications: Notification[]; total: number; unread: number } }>('/notifications', { params: { page } })
       .then((r) => r.data.data),

  getUnreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread').then((r) => r.data.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),
};
