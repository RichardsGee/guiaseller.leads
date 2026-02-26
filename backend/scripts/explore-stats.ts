/**
 * Stats for User / Integrations / Orders / Assinaturas — aggregate view for sync planning
 */
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '../.env' });

const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  console.log('📊 guiaseller DB — Aggregate stats for leads sync\n');

  // User levels
  const levels = await db.$queryRawUnsafe<{user_level:string,count:bigint}[]>(`
    SELECT user_level, count(*) as count FROM "User" GROUP BY user_level ORDER BY count DESC
  `);
  console.log('🔹 User levels:');
  for (const r of levels) console.log(`   ${r.user_level}: ${r.count}`);

  // Users with subscriptions
  const withSub = await db.$queryRawUnsafe<{count:bigint}[]>(`
    SELECT count(*) as count FROM "User" WHERE "SubscriptionId" IS NOT NULL
  `);
  console.log(`\n🔹 Users with SubscriptionId: ${withSub[0]?.count}`);

  // Subscription statuses
  const subStats = await db.$queryRawUnsafe<{status:string,count:bigint}[]>(`
    SELECT status, count(*) as count FROM assinaturas GROUP BY status ORDER BY count DESC
  `);
  console.log('\n🔹 Subscription statuses:');
  for (const r of subStats) console.log(`   ${r.status}: ${r.count}`);

  // Subscription plan descriptions 
  const subPlans = await db.$queryRawUnsafe<{description:string,count:bigint}[]>(`
    SELECT description, count(*) as count FROM assinaturas GROUP BY description ORDER BY count DESC
  `);
  console.log('\n🔹 Subscription plan names:');
  for (const r of subPlans) console.log(`   ${r.description}: ${r.count}`);

  // Users with companies
  const withCo = await db.$queryRawUnsafe<{count:bigint}[]>(`
    SELECT count(DISTINCT "userId") as count FROM "Company"
  `);
  console.log(`\n🔹 Users with Company: ${withCo[0]?.count}`);

  // Integrations per marketplace
  const intMkt = await db.$queryRawUnsafe<{marketplace:string,count:bigint}[]>(`
    SELECT marketplace, count(*) as count FROM "Integrations" WHERE is_active = true GROUP BY marketplace ORDER BY count DESC
  `);
  console.log('\n🔹 Active Integrations by marketplace:');
  for (const r of intMkt) console.log(`   ${r.marketplace}: ${r.count}`);

  const shopeeInt = await db.$queryRawUnsafe<{count:bigint}[]>(`
    SELECT count(*) as count FROM "IntegrationShopee" WHERE status = 'ativo'
  `);
  console.log(`   shopee: ${shopeeInt[0]?.count}`);

  const magaluInt = await db.$queryRawUnsafe<{count:bigint}[]>(`
    SELECT count(*) as count FROM integrations_magalu WHERE status = 'active'
  `);
  console.log(`   magalu: ${magaluInt[0]?.count}`);

  // Orders count per marketplace
  const mlOrders = await db.$queryRawUnsafe<{count:bigint}[]>(`SELECT count(*) as count FROM orders`);
  const shopeeOrders = await db.$queryRawUnsafe<{count:bigint}[]>(`SELECT count(*) as count FROM orders_shopee`);
  const magaluOrders = await db.$queryRawUnsafe<{count:bigint}[]>(`SELECT count(*) as count FROM magalu_orders`);
  const sheinOrders = await db.$queryRawUnsafe<{count:bigint}[]>(`SELECT count(*) as count FROM orders_shein`);
  console.log('\n🔹 Total orders by marketplace:');
  console.log(`   ML: ${mlOrders[0]?.count}`);
  console.log(`   Shopee: ${shopeeOrders[0]?.count}`);
  console.log(`   Magalu: ${magaluOrders[0]?.count}`);
  console.log(`   Shein: ${sheinOrders[0]?.count}`);

  // Top 5 users by order count (ML)
  const topSellers = await db.$queryRawUnsafe<{userId:string,first_name:string,email:string,order_count:bigint}[]>(`
    SELECT u.user_id AS "userId", u.first_name, u.email, count(o.id) as order_count
    FROM "User" u
    JOIN orders o ON o."userId" = u.user_id
    GROUP BY u.user_id, u.first_name, u.email
    ORDER BY order_count DESC
    LIMIT 5
  `);
  console.log('\n🔹 Top 5 sellers by ML order count:');
  for (const r of topSellers) console.log(`   ${r.first_name} (${r.email}): ${r.order_count} orders`);

  // Anuncios per user
  const topListings = await db.$queryRawUnsafe<{userId:string,first_name:string,listing_count:bigint}[]>(`
    SELECT u.user_id AS "userId", u.first_name, count(a.id) as listing_count
    FROM "User" u
    JOIN "Anuncios" a ON a."userId" = u.user_id
    GROUP BY u.user_id, u.first_name
    ORDER BY listing_count DESC
    LIMIT 5
  `);
  console.log('\n🔹 Top 5 users by listing count:');
  for (const r of topListings) console.log(`   ${r.first_name}: ${r.listing_count} listings`);

  await db.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
