import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';
import type { CreateAdDto, UpdateAdDto } from '../types/index.js';

const adInclude = {
  images: { orderBy: { order: 'asc' as const } },
  product: { include: { category: true, subcategory: true } },
};

export async function createAd(userId: string, dto: CreateAdDto) {
  const category = await prisma.category.findUnique({ where: { id: dto.categoryId } });
  if (!category) throw ApiError.badRequest('Category not found');

  if (dto.subcategoryId) {
    const sub = await prisma.subCategory.findFirst({
      where: { id: dto.subcategoryId, categoryId: dto.categoryId },
    });
    if (!sub) throw ApiError.badRequest('Subcategory not found');
  }

  const product = await prisma.product.create({
    data: {
      name: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      subcategoryId: dto.subcategoryId ?? null,
    },
  });

  return prisma.sellerAd.create({
    data: {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      condition: dto.condition as any,
      city: dto.city,
      area: dto.area ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      userId,
      productId: product.id,
      images: dto.imageUrls?.length
        ? {
            create: dto.imageUrls.map((url, i) => ({
              url,
              order: i,
              isCover: i === 0,
            })),
          }
        : undefined,
    },
    include: adInclude,
  });
}

export async function getMyAds(userId: string) {
  return prisma.sellerAd.findMany({
    where: { userId },
    include: adInclude,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMyAdById(userId: string, adId: string) {
  const ad = await prisma.sellerAd.findFirst({ where: { id: adId, userId }, include: adInclude });
  if (!ad) throw ApiError.notFound('Ad not found');
  return ad;
}

export async function updateAd(userId: string, adId: string, dto: UpdateAdDto) {
  const ad = await prisma.sellerAd.findFirst({ where: { id: adId, userId } });
  if (!ad) throw ApiError.notFound('Ad not found');

  if (dto.imageUrls !== undefined) {
    await prisma.adImage.deleteMany({ where: { adId } });
    if (dto.imageUrls.length) {
      await prisma.adImage.createMany({
        data: dto.imageUrls.map((url, i) => ({ adId, url, order: i, isCover: i === 0 })),
      });
    }
  }

  return prisma.sellerAd.update({
    where: { id: adId },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.condition !== undefined && { condition: dto.condition as any }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.area !== undefined && { area: dto.area }),
      ...(dto.lat !== undefined && { lat: dto.lat }),
      ...(dto.lng !== undefined && { lng: dto.lng }),
    },
    include: adInclude,
  });
}

export async function getSellerPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      createdAt: true,
      profile: { select: { name: true, avatar: true, city: true, bio: true } },
      _count: { select: { ads: { where: { status: 'ACTIVE' } } } },
    },
  });
  if (!user) throw ApiError.notFound('Seller not found');

  const ads = await prisma.sellerAd.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      images: { where: { isCover: true }, take: 1 },
      product: { include: { category: true } },
    },
  });

  return { seller: { ...user, activeAdsCount: user._count.ads }, ads };
}

export async function deleteAd(userId: string, adId: string) {
  const ad = await prisma.sellerAd.findFirst({ where: { id: adId, userId } });
  if (!ad) throw ApiError.notFound('Ad not found');
  await prisma.sellerAd.delete({ where: { id: adId } });
}

export async function changeAdStatus(userId: string, adId: string, status: string) {
  const ad = await prisma.sellerAd.findFirst({ where: { id: adId, userId } });
  if (!ad) throw ApiError.notFound('Ad not found');
  return prisma.sellerAd.update({ where: { id: adId }, data: { status: status as any }, include: adInclude });
}
