/**
 * Deep-dive into key tables for leads sync
 */
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '../.env' });

const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

interface ColumnInfo { column_name: string; data_type: string; is_nullable: string }

async function showTable(name: string, sampleCount = 2) {
  console.log(`\n${'═'.repeat(70)}`);
  const countR = await db.$queryRawUnsafe<{count: bigint}[]>(`SELECT count(*) as count FROM "${name}"`);
  console.log(`📋 ${name} (${Number(countR[0]?.count ?? 0)} rows)`);
  console.log('═'.repeat(70));

  const cols = await db.$queryRaw<ColumnInfo[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${name}
    ORDER BY ordinal_position
  `;
  for (const c of cols) {
    console.log(`  ${c.column_name.padEnd(30)} ${c.data_type.padEnd(25)} ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  }

  const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM "${name}" LIMIT ${sampleCount}`);
  for (let i = 0; i < rows.length; i++) {
    console.log(`\n  📝 Sample ${i + 1}:`);
    for (const [key, val] of Object.entries(rows[i] || {})) {
      let str: string;
      if (val === null || val === undefined) str = 'null';
      else if (typeof val === 'bigint') str = val.toString();
      else if (val instanceof Date) str = val.toISOString();
      else if (typeof val === 'object') str = JSON.stringify(val);
      else str = String(val);
      console.log(`     ${key}: ${str.substring(0, 150)}${str.length > 150 ? '...' : ''}`);
    }
  }
}

async function main() {
  console.log('🔍 Deep-dive: Key tables for leads sync\n');

  // Core user data
  await showTable('User', 3);
  
  // Subscriptions & plans
  await showTable('assinaturas', 2);
  await showTable('subscription_plans', 3);
  
  // Companies
  await showTable('Company', 2);
  
  // Integrations (marketplaces connected)
  await showTable('Integrations', 2);
  await showTable('IntegrationShopee', 1);
  await showTable('integrations_magalu', 1);
  
  // Orders summary
  await showTable('orders', 1);
  await showTable('orders_shopee', 1);
  await showTable('magalu_orders', 1);
  
  // Billing
  await showTable('asaas_customers', 1);
  await showTable('cobrancas', 1);
  await showTable('customers', 1);

  // Consents
  await showTable('consents', 1);
  
  await db.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
