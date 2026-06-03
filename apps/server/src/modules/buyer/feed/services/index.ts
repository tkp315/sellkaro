import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';
import { notifyInterestShown } from '@modules/shared/notification/services/index.js';
import type { FeedFilters } from '../types/index.js';
import type { Prisma } from '../../../../generated/prisma/index.js';

export async function getFeed(filters: FeedFilters) {
  const {
    categoryId,
    subcategoryId,
    city,
    condition,
    minPrice,
    maxPrice,
    search,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const where: Prisma.SellerAdWhereInput = { status: 'ACTIVE' };

  const productWhere: Prisma.ProductWhereInput = {};
  if (categoryId) productWhere.categoryId = categoryId;
  if (subcategoryId) productWhere.subcategoryId = subcategoryId;
  if (categoryId || subcategoryId) where.product = { is: productWhere };
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (condition) where.condition = condition as any;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  if (search) {
    // Split into words → every word must appear (partial, case-insensitive)
    // in title OR description. So "iphone black" matches "iPhone 14 - Black".
    const terms = search.trim().split(/\s+/).filter(Boolean);
    where.AND = terms.map((term) => ({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    }));
  }

  const orderBy: Prisma.SellerAdOrderByWithRelationInput =
    sortBy === 'price_asc'
      ? { price: 'asc' }
      : sortBy === 'price_desc'
        ? { price: 'desc' }
        : { createdAt: 'desc' };

  const skip = (page - 1) * limit;

  const [ads, total] = await Promise.all([
    prisma.sellerAd.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { where: { isCover: true }, take: 1 },
        product: { include: { category: true, subcategory: true } },
        user: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
      },
    }),
    prisma.sellerAd.count({ where }),
  ]);

  return {
    ads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  };
}

export async function revealPhone(adId: string, userId: string) {
  const ad = await prisma.sellerAd.findFirst({
    where: { id: adId, status: 'ACTIVE' },
    select: { userId: true, title: true, user: { select: { phone: true } } },
  });
  if (!ad) throw ApiError.notFound('Ad not found');

  const phone = ad.user.phone;
  if (!phone) throw ApiError.notFound('Seller has not added a phone number');

  const wasNew = await prisma.interestedUser.findUnique({ where: { userId_adId: { userId, adId } } });
  await prisma.interestedUser.upsert({
    where: { userId_adId: { userId, adId } },
    create: { userId, adId },
    update: {},
  });

  // Notify only on the FIRST reveal (wasNew is null means no prior record)
  if (!wasNew) {
    const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { profile: { select: { name: true } } } });
    void notifyInterestShown(ad.userId, buyer?.profile?.name ?? 'Someone', adId, ad.title);
  }

  return { phone };
}

export async function reportAd(adId: string, userId: string, reason: string) {
  const ad = await prisma.sellerAd.findUnique({ where: { id: adId } });
  if (!ad) throw ApiError.notFound('Ad not found');
  if (ad.userId === userId) throw ApiError.badRequest('Cannot report your own ad');

  await prisma.report.create({
    data: { type: 'AD', reason, reportedById: userId, adId },
  });
}

export async function getAdDetail(adId: string) {
  const ad = await prisma.sellerAd.findFirst({
    where: { id: adId, status: 'ACTIVE' },
    include: {
      images: { orderBy: { order: 'asc' } },
      product: { include: { category: true, subcategory: true } },
      user: {
        select: {
          id: true,
          createdAt: true,
          profile: { select: { name: true, avatar: true, city: true } },
        },
      },
    },
  });

  if (!ad) throw ApiError.notFound('Ad not found');

  await prisma.sellerAd.update({ where: { id: adId }, data: { viewCount: { increment: 1 } } });

  return ad;
}
