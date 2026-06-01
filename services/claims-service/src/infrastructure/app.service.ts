import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats() {
    const [objectsTotal, objectsByCategoryRaw, objectsByLocationRaw, claimsTotal, claimsByStatus, claimsByObjectCategory, claimsByLostLocationRaw, recentClaimsRaw, recentActivity] = await Promise.all([
      this.prisma.object.count(),
      this.prisma.object.groupBy({ by: ['category'], _count: { id: true } }),
      this.prisma.object.groupBy({ by: ['location'], _count: { id: true } }),
      this.prisma.claim.count(),
      this.prisma.claim.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.claim.findMany({
        where: { status: { not: 'PENDING' } },
        include: { object: { select: { category: true } } }
      }),
      this.prisma.claim.groupBy({ by: ['lostLocation'], _count: { id: true }, where: { lostLocation: { not: null } } }),
      this.prisma.claim.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          object: { select: { name: true, category: true } }
        }
      }),
      this.prisma.claim.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: { object: { select: { name: true } } }
      })
    ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [recentObjects, recentClaims, recentApproved, recentRejected] = await Promise.all([
      this.prisma.object.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.claim.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.claim.count({ where: { status: 'APPROVED', updatedAt: { gte: sevenDaysAgo } } }),
      this.prisma.claim.count({ where: { status: 'REJECTED', updatedAt: { gte: sevenDaysAgo } } }),
    ]);

    const statusMap: Record<string, number> = {};
    claimsByStatus.forEach(s => { statusMap[s.status] = s._count.id; });

    const categoryClaimsMap: Record<string, number> = {};
    claimsByObjectCategory.forEach(c => {
      const cat = c.object?.category || 'OTHER';
      categoryClaimsMap[cat] = (categoryClaimsMap[cat] || 0) + 1;
    });

    const byCategory = objectsByCategoryRaw.map(c => ({
      category: c.category,
      count: c._count.id,
      claims: categoryClaimsMap[c.category] || 0,
    }));

    const byLocation = objectsByLocationRaw
      .map(l => ({ location: l.location, count: l._count.id }))
      .sort((a, b) => b.count - a.count);

    const byLostLocation = claimsByLostLocationRaw
      .map(l => ({ location: l.lostLocation || 'Desconocido', count: l._count.id }))
      .sort((a, b) => b.count - a.count);

    const claimsByDay = this.computeClaimsByDay(
      [...recentActivity, ...recentClaimsRaw.filter(c => !recentActivity.some(rc => rc.id === c.id))],
      sevenDaysAgo,
    );

    return {
      objects: {
        total: objectsTotal,
        byCategory,
        byLocation,
        recentAdded: recentObjects,
      },
      claims: {
        total: claimsTotal,
        pending: statusMap['PENDING'] || 0,
        approved: statusMap['APPROVED'] || 0,
        rejected: statusMap['REJECTED'] || 0,
        recentCreated: recentClaims,
        recentApproved,
        recentRejected,
        byDay: claimsByDay,
        byLostLocation,
      },
      recentActivity: recentClaimsRaw.map(c => ({
        id: c.id,
        user: c.user?.name || c.user?.email || 'Desconocido',
        object: c.object?.name || 'Objeto',
        category: (c.object as any)?.category || 'OTHER',
        status: c.status,
        date: c.createdAt,
      })),
    };
  }

  private computeClaimsByDay(
    claims: any[],
    since: Date,
  ): { date: string; created: number; approved: number; rejected: number }[] {
    const days: Record<string, { created: number; approved: number; rejected: number }> = {};
    const d = new Date(since);
    const now = new Date();
    while (d <= now) {
      const key = d.toISOString().split('T')[0];
      days[key] = { created: 0, approved: 0, rejected: 0 };
      d.setDate(d.getDate() + 1);
    }

    for (const claim of claims) {
      const dayKey = new Date(claim.createdAt).toISOString().split('T')[0];
      if (days[dayKey]) {
        days[dayKey].created++;
      }
      if (claim.status === 'APPROVED' || claim.status === 'REJECTED') {
        const resolvedKey = new Date(claim.updatedAt).toISOString().split('T')[0];
        if (days[resolvedKey]) {
          if (claim.status === 'APPROVED') days[resolvedKey].approved++;
          else days[resolvedKey].rejected++;
        }
      }
    }

    return Object.entries(days).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }
}
