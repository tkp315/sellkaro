import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';

export async function createOrUpdateReview(
  reviewerId: string,
  sellerId: string,
  rating: number,
  comment?: string,
  adId?: string,
) {
  if (reviewerId === sellerId) throw ApiError.badRequest('Cannot review yourself');

  const seller = await prisma.user.findUnique({ where: { id: sellerId } });
  if (!seller) throw ApiError.notFound('Seller not found');

  return prisma.review.upsert({
    where: { reviewerId_sellerId: { reviewerId, sellerId } },
    create: { reviewerId, sellerId, rating, comment: comment ?? null, adId: adId ?? null },
    update: { rating, comment: comment ?? null },
    include: {
      reviewer: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
    },
  });
}

export async function getSellerReviews(sellerId: string) {
  const reviews = await prisma.review.findMany({
    where: { sellerId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
    },
  });

  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return { reviews, total, avg: Math.round(avg * 10) / 10, breakdown };
}

export async function getMyReviewForSeller(reviewerId: string, sellerId: string) {
  return prisma.review.findUnique({
    where: { reviewerId_sellerId: { reviewerId, sellerId } },
  });
}

export async function deleteReview(reviewerId: string, sellerId: string) {
  const review = await prisma.review.findUnique({
    where: { reviewerId_sellerId: { reviewerId, sellerId } },
  });
  if (!review) throw ApiError.notFound('Review not found');
  await prisma.review.delete({ where: { reviewerId_sellerId: { reviewerId, sellerId } } });
}
