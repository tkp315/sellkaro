import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';
import { notifyNewMessage } from '@modules/shared/notification/services/index.js';
import { getIo } from '@lib/services/socket/index.js';

export async function getOrCreateChat(buyerId: string, adId: string) {
  const ad = await prisma.sellerAd.findFirst({
    where: { id: adId, status: 'ACTIVE' },
    select: { userId: true, title: true },
  });
  if (!ad) throw ApiError.notFound('Ad not found');
  if (ad.userId === buyerId) throw ApiError.badRequest('Cannot chat with yourself');

  const existing = await prisma.chat.findUnique({
    where: { buyerId_sellerId_adId: { buyerId, sellerId: ad.userId, adId } },
    include: { messages: { orderBy: { createdAt: 'asc' } }, ad: { include: { images: { where: { isCover: true }, take: 1 } } }, seller: { select: { id: true, profile: { select: { name: true, avatar: true } } } } },
  });
  if (existing) return existing;

  return prisma.chat.create({
    data: { buyerId, sellerId: ad.userId, adId },
    include: { messages: { orderBy: { createdAt: 'asc' } }, ad: { include: { images: { where: { isCover: true }, take: 1 } } }, seller: { select: { id: true, profile: { select: { name: true, avatar: true } } } } },
  });
}

export async function getChat(chatId: string, userId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      ad: { include: { images: { where: { isCover: true }, take: 1 } } },
      buyer: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
      seller: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
    },
  });
  if (!chat) throw ApiError.notFound('Chat not found');

  await prisma.message.updateMany({
    where: { chatId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return chat;
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string,
  media?: { mediaUrl?: string; mediaType?: string; awsUrl?: string },
) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, OR: [{ buyerId: senderId }, { sellerId: senderId }] },
  });
  if (!chat) throw ApiError.notFound('Chat not found');

  const message = await prisma.message.create({
    data: { chatId, senderId, content, ...(media ?? {}) },
  });

  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  // Emit real-time event to chat room
  getIo()?.to(`chat:${chatId}`).emit('new_message', message);

  const fullChat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      buyerId: true, sellerId: true,
      ad: { select: { title: true } },
      buyer: { select: { profile: { select: { name: true } } } },
      seller: { select: { profile: { select: { name: true } } } },
    },
  });
  if (fullChat) {
    const receiverId = fullChat.buyerId === senderId ? fullChat.sellerId : fullChat.buyerId;
    const senderProfile = fullChat.buyerId === senderId ? fullChat.buyer.profile : fullChat.seller.profile;
    const senderName = senderProfile?.name ?? 'Someone';
    void notifyNewMessage(receiverId, senderName, fullChat.ad.title, chatId, content.slice(0, 80));
  }

  return message;
}

export async function getMyChats(userId: string) {
  const chats = await prisma.chat.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      ad: { select: { id: true, title: true, images: { where: { isCover: true }, take: 1 } } },
      buyer: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
      seller: { select: { id: true, profile: { select: { name: true, avatar: true } } } },
    },
  });

  return chats.map((chat) => ({
    ...chat,
    unreadCount: 0,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      senderId: { not: userId },
      isRead: false,
      chat: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}
