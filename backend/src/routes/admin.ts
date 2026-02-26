import { Router, type Response } from 'express';
import { authenticate, authorize, type AuthenticatedRequest } from '../middleware/auth.js';
import { leadsDB } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { syncGuiasellerToLeads } from '../services/syncService.js';

const router = Router();

router.use(authenticate as any);

// GET /api/v1/admin/users — List admin users
router.get('/users', authorize('admin') as any, async (_req: AuthenticatedRequest, res: Response) => {
  const users = await leadsDB.adminUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      permissions: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  res.json({ success: true, data: { users } });
});

// POST /api/v1/admin/users — Create admin user
router.post('/users', authorize('admin') as any, async (req: AuthenticatedRequest, res: Response) => {
  const { email, firstName, lastName, role, permissions, firebaseUid } = req.body;

  if (!email || !firstName || !firebaseUid) {
    throw new AppError('email, firstName, and firebaseUid are required', 400, 'BAD_REQUEST');
  }

  const user = await leadsDB.adminUser.create({
    data: {
      email,
      firstName,
      lastName: lastName || '',
      firebaseUid,
      role: role || 'viewer',
      permissions: permissions || ['read:leads'],
    },
  });

  res.status(201).json({ success: true, data: { user } });
});

// PUT /api/v1/admin/users/:id — Update user role/permissions
router.put('/users/:id', authorize('admin') as any, async (req: AuthenticatedRequest, res: Response) => {
  const { role, permissions, isActive } = req.body;

  const user = await leadsDB.adminUser.update({
    where: { id: req.params.id },
    data: {
      ...(role !== undefined && { role }),
      ...(permissions !== undefined && { permissions }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({ success: true, data: { user } });
});

// DELETE /api/v1/admin/users/:id — Deactivate user
router.delete('/users/:id', authorize('admin') as any, async (req: AuthenticatedRequest, res: Response) => {
  // Don't delete — just deactivate
  const user = await leadsDB.adminUser.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  res.json({ success: true, data: { user } });
});

// ─── Sync ─────────────────────────────────────────────────────────────────
// POST /api/v1/admin/sync — Trigger full guiaseller → leads sync
router.post('/sync', authorize('admin') as any, async (_req: AuthenticatedRequest, res: Response) => {
  const result = await syncGuiasellerToLeads();
  res.json({ success: true, data: result });
});

// GET /api/v1/admin/sync/status — Get last sync info
router.get('/sync/status', authorize('admin') as any, async (_req: AuthenticatedRequest, res: Response) => {
  const lastSync = await leadsDB.syncLog.findFirst({
    where: { syncType: 'full-sync' },
    orderBy: { startedAt: 'desc' },
  });
  const leadCount = await leadsDB.lead.count();
  const segmentCounts = await leadsDB.lead.groupBy({
    by: ['segment'],
    _count: true,
  });

  res.json({
    success: true,
    data: {
      lastSync,
      totalLeads: leadCount,
      segments: segmentCounts.map(s => ({ segment: s.segment, count: s._count })),
    },
  });
});

export default router;
