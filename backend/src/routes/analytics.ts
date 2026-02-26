import { Router, type Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { leadsDB } from '../lib/prisma.js';

const router = Router();

router.use(authenticate as any);

// GET /api/v1/analytics/overview — KPI overview
router.get('/overview', async (_req: AuthenticatedRequest, res: Response) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


  const [
    totalLeads,
    activeLeads,
    convertedLeads,
    newLeadsToday,
    avgScore,
    leadsByStatus,
  ] = await Promise.all([
    leadsDB.lead.count(),
    leadsDB.lead.count({ where: { status: 'active' } }),
    leadsDB.lead.count({ where: { convertedAt: { not: null } } }),
    leadsDB.lead.count({ where: { createdAt: { gte: today } } }),
    leadsDB.lead.aggregate({ _avg: { leadScore: true } }),
    leadsDB.lead.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  res.json({
    success: true,
    data: {
      kpis: {
        totalLeads,
        activeLeads,
        convertedLeads,
        newLeadsToday,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgScore: Math.round(avgScore._avg.leadScore || 0),
      },
      leadsByStatus,
    },
  });
});

// GET /api/v1/analytics/marketplace — Breakdown by marketplace
router.get('/marketplace', async (_req: AuthenticatedRequest, res: Response) => {
  const byMarketplace = await leadsDB.lead.groupBy({
    by: ['primaryMarketplace'],
    _count: true,
    _avg: { leadScore: true },
  });

  const convertedByMarketplace = await leadsDB.lead.groupBy({
    by: ['primaryMarketplace'],
    where: { convertedAt: { not: null } },
    _count: true,
  });

  const data = byMarketplace.map((mp) => {
    const converted = convertedByMarketplace.find(
      (c) => c.primaryMarketplace === mp.primaryMarketplace
    );
    return {
      marketplace: mp.primaryMarketplace,
      totalLeads: mp._count,
      avgScore: Math.round(mp._avg.leadScore || 0),
      converted: converted?._count || 0,
      conversionRate:
        mp._count > 0
          ? Math.round(((converted?._count || 0) / mp._count) * 10000) / 100
          : 0,
    };
  });

  res.json({ success: true, data: { marketplaces: data } });
});

// GET /api/v1/analytics/segments — Breakdown by segment
router.get('/segments', async (_req: AuthenticatedRequest, res: Response) => {
  const bySegment = await leadsDB.lead.groupBy({
    by: ['segment'],
    _count: true,
    _avg: { leadScore: true },
  });

  res.json({
    success: true,
    data: {
      segments: bySegment.map((s) => ({
        segment: s.segment || 'unassigned',
        count: s._count,
        avgScore: Math.round(s._avg.leadScore || 0),
      })),
    },
  });
});

// GET /api/v1/analytics/trends — Lead trends over time
router.get('/trends', async (req: AuthenticatedRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get daily lead counts for the period
  const leads = await leadsDB.lead.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true, leadScore: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by day
  const dailyData: Record<string, { count: number; totalScore: number; converted: number }> = {};

  leads.forEach((lead) => {
    const day = lead.createdAt.toISOString().split('T')[0];
    if (!dailyData[day]) {
      dailyData[day] = { count: 0, totalScore: 0, converted: 0 };
    }
    dailyData[day].count++;
    dailyData[day].totalScore += lead.leadScore;
    if (lead.status === 'converted') dailyData[day].converted++;
  });

  const trends = Object.entries(dailyData).map(([date, data]) => ({
    date,
    newLeads: data.count,
    avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    converted: data.converted,
  }));

  res.json({ success: true, data: { trends, period: `${days}d` } });
});

// GET /api/v1/analytics/funnel — Conversion funnel
router.get('/funnel', async (_req: AuthenticatedRequest, res: Response) => {
  const [total, active, engaged, qualified, converted] = await Promise.all([
    leadsDB.lead.count(),
    leadsDB.lead.count({ where: { status: 'active' } }),
    leadsDB.lead.count({ where: { leadScore: { gte: 20 } } }),
    leadsDB.lead.count({ where: { leadScore: { gte: 60 } } }),
    leadsDB.lead.count({ where: { convertedAt: { not: null } } }),
  ]);

  res.json({
    success: true,
    data: {
      funnel: [
        { stage: 'Total Leads', count: total, percentage: 100 },
        { stage: 'Active', count: active, percentage: total > 0 ? Math.round((active / total) * 100) : 0 },
        { stage: 'Engaged (Score ≥ 20)', count: engaged, percentage: total > 0 ? Math.round((engaged / total) * 100) : 0 },
        { stage: 'Qualified (Score ≥ 60)', count: qualified, percentage: total > 0 ? Math.round((qualified / total) * 100) : 0 },
        { stage: 'Converted', count: converted, percentage: total > 0 ? Math.round((converted / total) * 100) : 0 },
      ],
    },
  });
});

export default router;
