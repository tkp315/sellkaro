import prisma from '@utils/prisma.js';
import ApiError from '@utils/apiError.js';

export async function getReports({ page = 1, limit = 20, status = '' }: { page?: number; limit?: number; status?: string }) {
  const where: any = {};
  if (status) where.status = status;
  else where.status = 'PENDING';

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reportedBy: { select: { id: true, email: true, profile: { select: { name: true } } } },
        reportedUser: { select: { id: true, email: true, profile: { select: { name: true } } } },
        ad: { select: { id: true, title: true, images: { where: { isCover: true }, take: 1 } } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  return { reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function createReport(adminId: string, dto: {
  type: 'AD' | 'USER';
  reason: string;
  adId?: string;
  reportedUserId?: string;
}) {
  if (dto.type === 'AD' && !dto.adId) throw ApiError.badRequest('Ad ID required for AD report');
  if (dto.type === 'USER' && !dto.reportedUserId) throw ApiError.badRequest('User ID required for USER report');

  if (dto.adId) {
    const ad = await prisma.sellerAd.findUnique({ where: { id: dto.adId } });
    if (!ad) throw ApiError.notFound('Ad not found');
  }
  if (dto.reportedUserId) {
    const user = await prisma.user.findUnique({ where: { id: dto.reportedUserId } });
    if (!user) throw ApiError.notFound('User not found');
  }

  return prisma.report.create({
    data: {
      type: dto.type,
      reason: dto.reason,
      reportedById: adminId,
      adId: dto.adId ?? null,
      reportedUserId: dto.reportedUserId ?? null,
      status: 'PENDING',
    },
  });
}

export async function resolveReport(adminId: string, reportId: string, adminNote?: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw ApiError.notFound('Report not found');
  if (report.status === 'RESOLVED') return { resolved: true }; // already resolved — idempotent

  await prisma.report.update({ where: { id: reportId }, data: { status: 'RESOLVED', adminNote } });
  await prisma.adminLog.create({ data: { adminId, action: 'RESOLVE_REPORT', targetType: 'report', targetId: reportId, note: adminNote } });
  return { resolved: true };
}

export async function dismissReport(adminId: string, reportId: string, adminNote?: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw ApiError.notFound('Report not found');
  if (report.status === 'DISMISSED') return { dismissed: true }; // already dismissed — idempotent

  await prisma.report.update({ where: { id: reportId }, data: { status: 'DISMISSED', adminNote } });
  await prisma.adminLog.create({ data: { adminId, action: 'DISMISS_REPORT', targetType: 'report', targetId: reportId, note: adminNote } });
  return { dismissed: true };
}
