/**
 * Explore guiaseller database structure
 * Run: npx tsx scripts/explore-guiaseller-db.ts
 */
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '../.env' });

const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

interface TableInfo { table_name: string }
interface ColumnInfo { table_name: string; column_name: string; data_type: string; is_nullable: string }
interface CountResult { count: bigint }

async function main() {
  console.log('📊 Exploring guiaseller database...\n');

  // 1. List all tables
  const tables = await db.$queryRaw<TableInfo[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log(`Found ${tables.length} tables:\n`);

  for (const t of tables) {
    // Row count
    const countResult = await db.$queryRawUnsafe<CountResult[]>(`SELECT count(*) as count FROM "${t.table_name}"`);
    const rowCount = Number(countResult[0]?.count ?? 0);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 ${t.table_name} (${rowCount} rows)`);
    console.log('═'.repeat(60));

    // Columns
    const cols = await db.$queryRaw<ColumnInfo[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position
    `;
    for (const c of cols) {
      console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(20)} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    }

    // Sample row (first 1)
    if (rowCount > 0) {
      const sample = await db.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM "${t.table_name}" LIMIT 1`);
      console.log(`\n  📝 Sample row:`);
      for (const [key, val] of Object.entries(sample[0] || {})) {
        let str: string;
        if (val === null || val === undefined) str = 'null';
        else if (typeof val === 'bigint') str = val.toString();
        else if (val instanceof Date) str = val.toISOString();
        else if (typeof val === 'object') str = JSON.stringify(val);
        else str = String(val);
        console.log(`     ${key}: ${str.substring(0, 120)}${str.length > 120 ? '...' : ''}`);
      }
    }
  }

  await db.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
