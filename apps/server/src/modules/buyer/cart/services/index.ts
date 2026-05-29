import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { items: true },
  });
}

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
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
      },
    },
  });
  return { items: cart?.items ?? [], total: cart?.items.reduce((sum, i) => sum + i.priceAtAdded, 0) ?? 0 };
}

export async function addToCart(userId: string, adId: string) {
  const ad = await prisma.sellerAd.findFirst({ where: { id: adId, status: 'ACTIVE' }, select: { price: true, userId: true } });
  if (!ad) throw ApiError.notFound('Ad not found or no longer active');
  if (ad.userId === userId) throw ApiError.badRequest('Cannot add your own listing to cart');

  const cart = await getOrCreateCart(userId);
  const existing = await prisma.cartItem.findUnique({ where: { cartId_adId: { cartId: cart.id, adId } } });
  if (existing) return { added: false, message: 'Already in cart' };

  await prisma.cartItem.create({ data: { cartId: cart.id, adId, priceAtAdded: ad.price } });
  return { added: true };
}

export async function removeFromCart(userId: string, adId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw ApiError.notFound('Cart not found');
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, adId } });
  return { removed: true };
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { cleared: true };
}

export async function getCartCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { _count: { select: { items: true } } } });
  return cart?._count.items ?? 0;
}
