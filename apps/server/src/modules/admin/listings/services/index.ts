import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';
import { notifyAdRemoved } from '@modules/shared/notification/services/index.js';

export async function getAds({ page = 1, limit = 20, search = '', status = '' }: { page?: number; limit?: number; search?: string; status?: string }) {
  const where: any = {};
  if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { city: { contains: search, mode: 'insensitive' } }];
  if (status) where.status = status;

  const [ads, total] = await Promise.all([
    prisma.sellerAd.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isCover: true }, take: 1 },
        product: { include: { category: true } },
        user: { select: { id: true, email: true, profile: { select: { name: true } } } },
        _count: { select: { interests: true } },
      },
    }),
    prisma.sellerAd.count({ where }),
  ]);

  return { ads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function removeAd(adminId: string, adId: string, note?: string) {
  const ad = await prisma.sellerAd.findUnique({ where: { id: adId } });
  if (!ad) throw ApiError.notFound('Ad not found');
  if (ad.status === 'REMOVED') return { removed: true }; // idempotent — no duplicate log or notification

  await prisma.sellerAd.update({ where: { id: adId }, data: { status: 'REMOVED' as any } });
  await prisma.adminLog.create({ data: { adminId, action: 'REMOVE_AD', targetType: 'ad', targetId: adId, note } });
  void notifyAdRemoved(ad.userId, ad.title, note);
  return { removed: true };
}

export async function featureAd(adminId: string, adId: string) {
  const ad = await prisma.sellerAd.findUnique({ where: { id: adId } });
  if (!ad) throw ApiError.notFound('Ad not found');

  const isFeatured = !ad.isFeatured;
  await prisma.sellerAd.update({ where: { id: adId }, data: { isFeatured } });
  await prisma.adminLog.create({ data: { adminId, action: isFeatured ? 'FEATURE_AD' : 'UNFEATURE_AD', targetType: 'ad', targetId: adId } });
  return { isFeatured };
}
