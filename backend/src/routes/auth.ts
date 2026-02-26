import { Router, type Request, type Response } from 'express';
import { verifyFirebaseToken, generateToken, type AuthenticatedRequest, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { env } from '../config/env.js';
import { leadsDB } from '../lib/prisma.js';

const router = Router();

// POST /api/v1/auth/signin — Exchange Firebase ID token for JWT
router.post('/signin', authLimiter, async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Firebase ID token is required' },
      });
      return;
    }

    const { token, user } = await verifyFirebaseToken(idToken);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
          permissions: user.permissions,
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    const isDbError = err.message?.includes('does not exist') || err.message?.includes('connect');
    const isFbError = err.message?.includes('Firebase') || err.message?.includes('auth/');
    const code = isDbError ? 'DB_NOT_READY' : isFbError ? 'FIREBASE_ERROR' : 'AUTH_FAILED';
    const message = isDbError
      ? 'Database not ready — run migration first'
      : isFbError
      ? `Firebase error: ${err.message}`
      : 'Authentication failed';
    console.error(`[AUTH] ${code}:`, err.message);
    res.status(401).json({ success: false, error: { code, message } });
  }
});

// POST /api/v1/auth/dev-login — Dev-only login (no Firebase required)
router.post('/dev-login', authLimiter, async (req: Request, res: Response) => {
  if (env.NODE_ENV === 'production') {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
    return;
  }

  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Email is required' },
      });
      return;
    }

    // Find or create admin user
    let adminUser = await leadsDB.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      adminUser = await leadsDB.adminUser.create({
        data: {
          email,
          firebaseUid: `dev-${Date.now()}`,
          firstName: email.split('@')[0],
          lastName: 'Dev',
          role: 'admin',
          permissions: ['read:leads', 'write:leads', 'delete:leads', 'admin:users', 'view:analytics'],
        },
      });
    }

    // Update last login
    await leadsDB.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({
      sub: adminUser.id,
      email: adminUser.email,
      firebaseUid: adminUser.firebaseUid,
      role: adminUser.role,
      permissions: adminUser.permissions,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          avatar: adminUser.avatar,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DEV_LOGIN_FAILED', message: 'Dev login failed' },
    });
  }
});

// GET /api/v1/auth/me — Get current user info
router.get('/me', authenticate as any, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// POST /api/v1/auth/refresh — Refresh JWT (client sends Firebase token again)
router.post('/refresh', authLimiter, async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Firebase ID token is required' },
      });
      return;
    }

    const { token, user } = await verifyFirebaseToken(idToken);

    res.json({
      success: true,
      data: { token, user },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'REFRESH_FAILED', message: 'Token refresh failed' },
    });
  }
});

export default router;
