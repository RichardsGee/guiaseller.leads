// Run migration SQL against the leads database
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
dotenv.config(); // loads from backend/.env (symlink to root)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.LEADS_DB_URL } },
});

async function main() {
  const sql = readFileSync('prisma/migrations/00_init/migration.sql', 'utf-8');
  
  // Remove SQL comments and split by semicolons
  const cleaned = sql.replace(/--[^\n]*/g, '');
  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`📦 Running ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt + ';');
      console.log(`  ✅ Statement ${i + 1}/${statements.length}`);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('already exists')) {
        console.log(`  ⏭️  Statement ${i + 1} — already exists, skipping`);
      } else {
        console.error(`  ❌ Statement ${i + 1} failed:`, msg);
        throw error;
      }
    }
  }
  
  console.log('✅ Migration complete!');
}

main()
  .catch(e => {
    console.error('Migration failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
