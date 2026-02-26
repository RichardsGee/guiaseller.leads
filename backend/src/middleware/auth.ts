import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { firebaseAuth } from '../config/firebase.js';
import { AppError } from './errorHandler.js';
import { leadsDB } from '../lib/prisma.js';

// ─── GuiaSeller API user lookup ─────────────────────────────────────────────
interface GuiasellerUser {
  id?: string;
  email?: string;
  name?: string | null;
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  avatar?: string | null;
  image?: string | null;
  photo?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  profileImage?: string | null;
  profile_image?: string | null;
  [key: string]: unknown;
}

async function fetchGuiasellerUser(firebaseUid: string): Promise<GuiasellerUser | null> {
  const { env: appEnv } = await import('../config/env.js');
  if (!appEnv.GUIASELLER_API_TOKEN) return null;

  try {
    const url = `${appEnv.GUIASELLER_API_URL}/api/users/${firebaseUid}/complete`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${appEnv.GUIASELLER_API_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[AUTH] guiaseller API returned ${res.status} for uid=${firebaseUid}`);
      return null;
    }

    const body = (await res.json()) as { data?: GuiasellerUser } | GuiasellerUser;
    // Support both { data: {...} } and flat response shapes
    const user = (body as { data?: GuiasellerUser }).data ?? (body as GuiasellerUser);
    console.info(`[AUTH] Fetched guiaseller profile for uid=${firebaseUid}`);
    return user;
  } catch (err) {
    console.warn('[AUTH] guiaseller API unreachable:', (err as Error).message);
    return null; // graceful fallback — never break login
  }
}

/** Resolve first/last name from guiaseller user, Firebase claim or email prefix */
function resolveName(
  gs: GuiasellerUser | null,
  firebaseName: string | undefined,
  email: string
): { firstName: string; lastName: string } {
  if (gs) {
    const first =
      (gs.firstName as string | null) ||
      (gs.first_name as string | null) ||
      (gs.name as string | null)?.split(' ')[0] ||
      null;
    const last =
      (gs.lastName as string | null) ||
      (gs.last_name as string | null) ||
      (gs.name as string | null)?.split(' ').slice(1).join(' ') ||
      null;
    if (first) return { firstName: first, lastName: last ?? '' };
  }
  if (firebaseName) {
    return {
      firstName: firebaseName.split(' ')[0],
      lastName: firebaseName.split(' ').slice(1).join(' '),
    };
  }
  return { firstName: email.split('@')[0], lastName: '' };
}

function resolveAvatar(gs: GuiasellerUser | null, firebasePicture?: string): string | null {
  return (
    (gs?.avatar as string | null) ??
    (gs?.image as string | null) ??
    (gs?.photo as string | null) ??
    (gs?.photoUrl as string | null) ??
    (gs?.photo_url as string | null) ??
    (gs?.profileImage as string | null) ??
    (gs?.profile_image as string | null) ??
    firebasePicture ??
    null
  );
}

// Extended request with user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firebaseUid: string;
    role: string;
    permissions: string[];
  };
}

// JWT payload interface
interface JWTPayload {
  sub: string;
  email: string;
  firebaseUid: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY as string,
  } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

// Authentication middleware — verifies JWT
export function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      firebaseUid: decoded.firebaseUid,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    }
  }
}

// Authorization middleware — checks role/permission
export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Not authenticated', 401, 'NOT_AUTHENTICATED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
      return;
    }

    next();
  };
}

// Firebase token verification + JWT exchange
export async function verifyFirebaseToken(idToken: string) {
  if (!firebaseAuth) {
    throw new AppError('Firebase not configured', 503, 'FIREBASE_UNAVAILABLE');
  }

  const decodedToken = await firebaseAuth.verifyIdToken(idToken);
  const email = decodedToken.email || '';

  // Fetch user profile from guiaseller API using Firebase UID (graceful — falls back if token missing)
  const gsUser = await fetchGuiasellerUser(decodedToken.uid);

  const { firstName, lastName } = resolveName(gsUser, decodedToken.name, email);
  const avatar = resolveAvatar(gsUser, decodedToken.picture);

  // Find or create admin user in leads DB
  let adminUser = await leadsDB.adminUser.findUnique({
    where: { firebaseUid: decodedToken.uid },
  });

  if (!adminUser) {
    // First login — seed from guiaseller DB (or Firebase fallback)
    adminUser = await leadsDB.adminUser.create({
      data: {
        email,
        firebaseUid: decodedToken.uid,
        firstName,
        lastName,
        avatar,
        role: 'viewer',
        permissions: ['read:leads'],
      },
    });
    console.info(`[AUTH] New admin user seeded from ${gsUser ? 'guiaseller API' : 'Firebase'}: ${email}`);
  }

  // Sync name/avatar on every login (keeps data fresh if user updated profile)
  await leadsDB.adminUser.update({
    where: { id: adminUser.id },
    data: {
      firstName,
      lastName,
      avatar,
      lastLoginAt: new Date(),
    },
  });

  // Refresh adminUser with synced values
  adminUser = { ...adminUser, firstName, lastName, avatar: avatar ?? adminUser.avatar };

  // Generate JWT
  const token = generateToken({
    sub: adminUser.id,
    email: adminUser.email,
    firebaseUid: adminUser.firebaseUid,
    role: adminUser.role,
    permissions: adminUser.permissions,
  });

  return { token, user: adminUser };
}
