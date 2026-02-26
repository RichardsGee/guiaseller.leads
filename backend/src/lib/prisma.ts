import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

// Leads DB — Full CRUD
export const leadsDB = new PrismaClient({
  datasources: {
    db: { url: env.LEADS_DB_URL },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// GuiaSeller DB — READ-ONLY (SELECT only)
// Uses the same Prisma client but with read-only connection
// In production, this user has SELECT-only permissions
export const guiasellerDB = new PrismaClient({
  datasources: {
    db: { url: env.DATABASE_URL },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Graceful shutdown
async function disconnectAll(): Promise<void> {
  await leadsDB.$disconnect();
  await guiasellerDB.$disconnect();
}

process.on('SIGINT', disconnectAll);
process.on('SIGTERM', disconnectAll);

export default { leadsDB, guiasellerDB };
