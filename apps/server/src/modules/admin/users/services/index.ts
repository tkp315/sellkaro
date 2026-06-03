import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';

export async function getUsers({ page = 1, limit = 20, search = '', role = '' }: { page?: number; limit?: number; search?: string; role?: string }) {
  const where: any = {};
  if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { profile: { name: { contains: search, mode: 'insensitive' } } }];
  if (role) where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, phone: true, role: true, isVerified: true, isBanned: true, createdAt: true,
        profile: { select: { name: true, avatar: true, city: true } },
        _count: { select: { ads: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function banUser(adminId: string, userId: string, note?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'ADMIN') throw ApiError.badRequest('Cannot ban an admin');

  await prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
  await prisma.adminLog.create({ data: { adminId, action: 'BAN_USER', targetType: 'user', targetId: userId, note } });
  return { banned: true };
}

export async function unbanUser(adminId: string, userId: string, note?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
  await prisma.adminLog.create({ data: { adminId, action: 'UNBAN_USER', targetType: 'user', targetId: userId, note } });
  return { unbanned: true };
}

export async function changeUserRole(adminId: string, userId: string, role: string) {
  if (adminId === userId) throw ApiError.badRequest('Cannot change your own role');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  await prisma.adminLog.create({ data: { adminId, action: 'CHANGE_ROLE', targetType: 'user', targetId: userId, note: `Role changed to ${role}` } });
  return { role };
}
