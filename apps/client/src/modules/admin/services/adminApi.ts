import api from '@/lib/axios';

const BASE = '/admin';

export const adminApi = {
  getStats: () => api.get(`${BASE}/stats`).then((r) => r.data.data),

  getUsers: (params?: Record<string, unknown>) =>
    api.get(`${BASE}/users`, { params }).then((r) => r.data.data),
  banUser: (userId: string, note?: string) =>
    api.patch(`${BASE}/users/${userId}/ban`, { note }).then((r) => r.data.data),
  unbanUser: (userId: string, note?: string) =>
    api.patch(`${BASE}/users/${userId}/unban`, { note }).then((r) => r.data.data),
  changeRole: (userId: string, role: string) =>
    api.patch(`${BASE}/users/${userId}/role`, { role }).then((r) => r.data.data),

  getListings: (params?: Record<string, unknown>) =>
    api.get(`${BASE}/listings`, { params }).then((r) => r.data.data),
  removeAd: (adId: string, note?: string) =>
    api.patch(`${BASE}/listings/${adId}/remove`, { note }).then((r) => r.data.data),
  featureAd: (adId: string) =>
    api.patch(`${BASE}/listings/${adId}/feature`).then((r) => r.data.data),

  getReports: (params?: Record<string, unknown>) =>
    api.get(`${BASE}/reports`, { params }).then((r) => r.data.data),
  resolveReport: (reportId: string, adminNote?: string) =>
    api.patch(`${BASE}/reports/${reportId}/resolve`, { adminNote }).then((r) => r.data.data),
  dismissReport: (reportId: string, adminNote?: string) =>
    api.patch(`${BASE}/reports/${reportId}/dismiss`, { adminNote }).then((r) => r.data.data),
};
