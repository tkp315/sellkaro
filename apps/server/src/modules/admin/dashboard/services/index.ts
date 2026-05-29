import prisma from '@utils/prisma.js';

export async function getStats() {
  const [totalUsers, totalSellers, totalAds, activeAds, totalReports, pendingReports, recentReports, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.sellerAd.count(),
      prisma.sellerAd.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          reportedBy: { select: { id: true, email: true, profile: { select: { name: true } } } },
          reportedUser: { select: { id: true, email: true, profile: { select: { name: true } } } },
          ad: { select: { id: true, title: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, role: true, createdAt: true, profile: { select: { name: true } } },
      }),
    ]);

  return { totalUsers, totalSellers, totalAds, activeAds, totalReports, pendingReports, recentReports, recentUsers };
}
