import prisma from '@utils/prisma.js';
import SK from '@globals/index.js';
import { sendEmail, welcomeEmail, newMessageEmail, interestShownEmail, adRemovedEmail } from './mailer.js';

function clientUrl(): string {
  const env = (SK.config.app as Record<string, unknown>)['env'] as Record<string, string>;
  return String(env['CLIENT_URL'] ?? 'http://localhost:5173');
}

async function getUserEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email ?? null;
}

export async function notifyWelcome(userId: string, name: string, email: string) {
  await Promise.all([
    prisma.notification.create({
      data: { userId, type: 'WELCOME', title: 'Welcome to OLX!', body: `Hi ${name}, your account is ready.` },
    }),
    sendEmail(email, 'Welcome to OLX! 🎉', welcomeEmail(name)),
  ]);
}

export async function notifyNewMessage(receiverId: string, senderName: string, adTitle: string, chatId: string, preview: string) {
  const email = await getUserEmail(receiverId);
  const chatUrl = `${clientUrl()}/chats/${chatId}`;
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: `New message from ${senderName}`,
        body: preview,
        data: { chatId },
      },
    }),
    email ? sendEmail(email, `New message from ${senderName} – OLX`, newMessageEmail(senderName, adTitle, preview, chatUrl)) : Promise.resolve(),
  ]);
}

export async function notifyInterestShown(sellerId: string, buyerName: string, adId: string, adTitle: string) {
  const email = await getUserEmail(sellerId);
  const adUrl = `${clientUrl()}/product/${adId}`;
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'INTEREST_SHOWN',
        title: `${buyerName} is interested in your ad`,
        body: adTitle,
        data: { adId },
      },
    }),
    email ? sendEmail(email, `Someone is interested in "${adTitle}" – OLX`, interestShownEmail(buyerName, adTitle, adUrl)) : Promise.resolve(),
  ]);
}

export async function notifyAdRemoved(sellerId: string, adTitle: string, adminNote?: string) {
  const email = await getUserEmail(sellerId);
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'AD_REMOVED_BY_ADMIN',
        title: 'Your ad was removed',
        body: adTitle,
        data: { adminNote },
      },
    }),
    email ? sendEmail(email, `Your ad "${adTitle}" was removed – OLX`, adRemovedEmail(adTitle, adminNote ?? '')) : Promise.resolve(),
  ]);
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { notifications, total, unread };
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function markRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
