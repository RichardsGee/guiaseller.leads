import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth.js';
import { leadsDB } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateScore } from '../services/scoringService.js';
import { assignSegment } from '../services/segmentationService.js';

const router = Router();

// All lead routes require authentication
router.use(authenticate as any);

// --- Validation Schemas ---

const listLeadsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'leadScore', 'firstName', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  segment: z.string().optional(),
  marketplace: z.string().optional(),
  scoreMin: z.coerce.number().min(0).max(100).optional(),
  scoreMax: z.coerce.number().min(0).max(100).optional(),
});

const createLeadSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  primaryMarketplace: z.enum(['ML', 'Shopee', 'Magalu', 'TikTok', 'Amazon', 'Shein']).nullable().optional(),
  marketplaces: z.array(z.string()).optional(),
  segment: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

const updateLeadSchema = createLeadSchema.partial();

// --- Routes ---

// GET /api/v1/leads — List leads with pagination, sorting, filtering
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const params = listLeadsSchema.parse(req.query);
  const skip = (params.page - 1) * params.limit;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.segment) where.segment = params.segment;
  if (params.marketplace) where.primaryMarketplace = params.marketplace;
  if (params.scoreMin !== undefined || params.scoreMax !== undefined) {
    where.leadScore = {
      ...(params.scoreMin !== undefined && { gte: params.scoreMin }),
      ...(params.scoreMax !== undefined && { lte: params.scoreMax }),
    };
  }
  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [leads, total] = await Promise.all([
    leadsDB.lead.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { [params.sort]: params.order },
      include: {
        enrichment: true,
        _count: {
          select: { events: true, history: true },
        },
      },
    }),
    leadsDB.lead.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      leads,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    },
  });
});

// GET /api/v1/leads/:id — Get lead detail with relations
router.get('/:id', async (req: Request, res: Response) => {
  const lead = await leadsDB.lead.findUnique({
    where: { id: req.params.id },
    include: {
      enrichment: true,
      history: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { adminUser: { select: { firstName: true, lastName: true } } },
      },
      events: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!lead) {
    throw new AppError('Lead not found', 404, 'NOT_FOUND');
  }

  res.json({ success: true, data: { lead } });
});

// POST /api/v1/leads — Create lead
router.post('/', authorize('admin', 'manager') as any, async (req: AuthenticatedRequest, res: Response) => {
  const data = createLeadSchema.parse(req.body);

  const lead = await leadsDB.lead.create({
    data: {
      ...data,
      marketplaces: data.marketplaces || (data.primaryMarketplace ? [data.primaryMarketplace] : []),
    },
  });

  // Create history entry
  await leadsDB.leadHistory.create({
    data: {
      leadId: lead.id,
      eventType: 'created',
      adminUserId: req.user?.id,
      metadata: { source: 'manual' },
    },
  });

  res.status(201).json({ success: true, data: { lead } });
});

// PATCH /api/v1/leads/:id — Update lead
router.patch('/:id', authorize('admin', 'manager') as any, async (req: AuthenticatedRequest, res: Response) => {
  const data = updateLeadSchema.parse(req.body);

  // Get current lead for history
  const currentLead = await leadsDB.lead.findUnique({ where: { id: req.params.id } });
  if (!currentLead) throw new AppError('Lead not found', 404, 'NOT_FOUND');

  const lead = await leadsDB.lead.update({
    where: { id: req.params.id },
    data,
    include: { enrichment: true },
  });

  // Track changes in history
  const changedFields = Object.keys(data).filter(
    (key) => (currentLead as Record<string, unknown>)[key] !== (data as Record<string, unknown>)[key]
  );

  if (changedFields.length > 0) {
    await leadsDB.leadHistory.create({
      data: {
        leadId: lead.id,
        eventType: 'updated',
        fieldChanged: changedFields.join(', '),
        oldValue: changedFields.reduce((acc, key) => ({ ...acc, [key]: (currentLead as Record<string, unknown>)[key] }), {}),
        newValue: changedFields.reduce((acc, key) => ({ ...acc, [key]: (data as Record<string, unknown>)[key] }), {}),
        adminUserId: req.user?.id,
      },
    });
  }

  res.json({ success: true, data: { lead } });
});

// DELETE /api/v1/leads/:id — Soft delete (archive)
router.delete('/:id', authorize('admin') as any, async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadsDB.lead.update({
    where: { id: req.params.id },
    data: { status: 'archived' },
  });

  await leadsDB.leadHistory.create({
    data: {
      leadId: lead.id,
      eventType: 'archived',
      adminUserId: req.user?.id,
    },
  });

  res.json({ success: true, data: { lead } });
});

// POST /api/v1/leads/:id/score — Recalculate lead score
router.post('/:id/score', async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadsDB.lead.findUnique({
    where: { id: req.params.id },
    include: { enrichment: true, events: true },
  });

  if (!lead) throw new AppError('Lead not found', 404, 'NOT_FOUND');

  const scoreResult = calculateScore(lead);

  const updated = await leadsDB.lead.update({
    where: { id: req.params.id },
    data: {
      leadScore: scoreResult.score,
      conversionProb: scoreResult.conversionProb,
      scoreCalculatedAt: new Date(),
      scoreReason: scoreResult.reason,
    },
  });

  // Save score history
  await leadsDB.leadScore.create({
    data: {
      leadId: lead.id,
      score: scoreResult.score,
      reason: scoreResult.reason,
      components: scoreResult.components,
    },
  });

  res.json({ success: true, data: { lead: updated, scoreDetails: scoreResult } });
});

// POST /api/v1/leads/:id/segment — Update segment
router.post('/:id/segment', async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadsDB.lead.findUnique({
    where: { id: req.params.id },
    include: { enrichment: true, events: true },
  });

  if (!lead) throw new AppError('Lead not found', 404, 'NOT_FOUND');

  const segment = assignSegment(lead);

  const updated = await leadsDB.lead.update({
    where: { id: req.params.id },
    data: { segment },
  });

  await leadsDB.leadHistory.create({
    data: {
      leadId: lead.id,
      eventType: 'segmented',
      fieldChanged: 'segment',
      oldValue: lead.segment ?? undefined,
      newValue: segment ?? undefined,
      adminUserId: req.user?.id,
    },
  });

  res.json({ success: true, data: { lead: updated, segment } });
});

// POST /api/v1/leads/bulk — Bulk actions
router.post('/bulk', authorize('admin', 'manager') as any, async (req: AuthenticatedRequest, res: Response) => {
  const { action, leadIds } = req.body as { action: string; leadIds: string[] };

  if (!action || !leadIds?.length) {
    throw new AppError('action and leadIds are required', 400, 'BAD_REQUEST');
  }

  let result;

  switch (action) {
    case 'archive':
      result = await leadsDB.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { status: 'archived' },
      });
      break;
    case 'activate':
      result = await leadsDB.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { status: 'active' },
      });
      break;
    case 'rescore':
      // Process each lead's score
      for (const leadId of leadIds) {
        const lead = await leadsDB.lead.findUnique({
          where: { id: leadId },
          include: { enrichment: true, events: true },
        });
        if (lead) {
          const scoreResult = calculateScore(lead);
          await leadsDB.lead.update({
            where: { id: leadId },
            data: {
              leadScore: scoreResult.score,
              conversionProb: scoreResult.conversionProb,
              scoreCalculatedAt: new Date(),
              scoreReason: scoreResult.reason,
            },
          });
        }
      }
      result = { count: leadIds.length };
      break;
    default:
      throw new AppError(`Unknown bulk action: ${action}`, 400, 'BAD_REQUEST');
  }

  res.json({ success: true, data: { action, affected: result } });
});

export default router;
