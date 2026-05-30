import api from '@/lib/axios';

export interface ReviewUser {
  id: string;
  profile: { name: string; avatar: string | null } | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: ReviewUser;
}

export interface ReviewsData {
  reviews: Review[];
  total: number;
  avg: number;
  breakdown: { star: number; count: number }[];
}

export const reviewApi = {
  submit: (dto: { sellerId: string; rating: number; comment?: string; adId?: string }) =>
    api.post<{ data: Review }>('/reviews', dto).then((r) => r.data.data),

  getForSeller: (sellerId: string) =>
    api.get<{ data: ReviewsData }>(`/reviews/seller/${sellerId}`).then((r) => r.data.data),

  getMyReview: (sellerId: string) =>
    api.get<{ data: Review | null }>(`/reviews/my/${sellerId}`).then((r) => r.data.data),

  delete: (sellerId: string) =>
    api.delete(`/reviews/seller/${sellerId}`),
};
