import prisma from '@utils/prisma.js';

export async function toggleWishlist(userId: string, adId: string) {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_adId: { userId, adId } },
  });

  if (existing) {
    // Catch P2025 (record not found) from a concurrent delete
    try {
      await prisma.wishlist.delete({ where: { id: existing.id } });
    } catch {
      // Already removed by a concurrent request — treat as removed
    }
    return { saved: false };
  }

  try {
    await prisma.wishlist.create({ data: { userId, adId } });
    return { saved: true };
  } catch {
    // P2002 (unique constraint): a concurrent request already created it — treat as saved
    return { saved: true };
  }
}

export async function getWishlist(userId: string) {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      ad: {
        include: {
          images: { where: { isCover: true }, take: 1 },
          product: { include: { category: true } },
          user: { select: { id: true, profile: { select: { name: true } } } },
        },
      },
    },
  });
  return items.map((w) => ({ ...w.ad, savedAt: w.createdAt }));
}

export async function getWishlistIds(userId: string): Promise<string[]> {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    select: { adId: true },
  });
  return items.map((w) => w.adId);
}
