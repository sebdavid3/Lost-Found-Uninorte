import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ObjectClientService } from './clients/object-client.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectClient: ObjectClientService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats() {
    const objectsData = await this.objectClient.findAll({ limit: 10000 });
    const objects = objectsData.items || [];
    const objectsTotal = objects.length;

    const objectsByCategoryRaw: Record<string, number> = {};
    const objectsByLocationRaw: Record<string, number> = {};
    for (const obj of objects) {
      objectsByCategoryRaw[obj.category] = (objectsByCategoryRaw[obj.category] || 0) + 1;
      objectsByLocationRaw[obj.location] = (objectsByLocationRaw[obj.location] || 0) + 1;
    }

    const [claimsTotal, claimsByStatus, claimsByObjectCategory, claimsByLostLocationRaw, recentClaimsRaw] =
      await Promise.all([
        this.prisma.claim.count(),
        this.prisma.claim.groupBy({ by: ['status'], _count: { id: true } }),
        this.prisma.claim.findMany({
          where: { status: { not: 'PENDING' } },
          select: { objectId: true },
        }),
        this.prisma.claim.groupBy({ by: ['lostLocation'], _count: { id: true }, where: { lostLocation: { not: null } } }),
        this.prisma.claim.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { evidences: true },
        }),
      ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [recentObjects, recentClaims, recentApproved, recentRejected] = await Promise.all([
      objects.filter((o: any) => new Date(o.createdAt) >= sevenDaysAgo).length,
      this.prisma.claim.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.claim.count({ where: { status: 'APPROVED', updatedAt: { gte: sevenDaysAgo } } }),
      this.prisma.claim.count({ where: { status: 'REJECTED', updatedAt: { gte: sevenDaysAgo } } }),
    ]);

    const statusMap: Record<string, number> = {};
    claimsByStatus.forEach(s => { statusMap[s.status] = s._count.id; });

    const categoryClaimsMap: Record<string, number> = {};
    for (const c of claimsByObjectCategory) {
      const obj = objects.find((o: any) => o.id === c.objectId);
      const cat = obj?.category || 'OTHER';
      categoryClaimsMap[cat] = (categoryClaimsMap[cat] || 0) + 1;
    }

    const byCategory = Object.entries(objectsByCategoryRaw).map(([category, count]) => ({
      category,
      count,
      claims: categoryClaimsMap[category] || 0,
    }));

    const byLocation = Object.entries(objectsByLocationRaw)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    const byLostLocation = claimsByLostLocationRaw
      .map(l => ({ location: l.lostLocation || 'Desconocido', count: l._count.id }))
      .sort((a, b) => b.count - a.count);

    const claimsByDay = this.computeClaimsByDay(recentClaimsRaw, sevenDaysAgo);

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
        user: c.userId,
        object: objects.find((o: any) => o.id === c.objectId)?.name || 'Objeto',
        category: objects.find((o: any) => o.id === c.objectId)?.category || 'OTHER',
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
