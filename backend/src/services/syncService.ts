/**
 * GuiaSeller → Leads DB Sync Service
 * 
 * Pulls all users from guiaseller DB and creates/updates leads in leads DB
 * with enrichment data (company, orders, listings, integrations, subscriptions).
 * 
 * Usage:
 *   - Manual:  POST /api/v1/admin/sync  (admin only)
 *   - Script:  npx tsx src/services/syncService.ts
 *   - Cron:    every 6h via node-cron in index.ts
 */
import { guiasellerDB, leadsDB } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

// ─── Types ──────────────────────────────────────────────────────────────────
interface GsUser {
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  user_level: string;
  createdAt: Date;
  updatedAt: Date;
  isAlpha: boolean;
  SubscriptionId: string | null;
  cnpj_cpf: string | null;
  nome_assinatura: string | null;
  status: string | null;
  celular: string | null;
}

interface GsCompany {
  userId: string;
  company_name: string;
  fantasy_name: string | null;
  cnpj: string;
}

interface GsIntegration {
  userId: string;
  marketplace: string;
  is_active: boolean;
  nickname: string;
}

interface GsSubscription {
  userId: string;
  status: string;
  value: number;
  description: string | null;
  cycle: string;
}

interface OrderCount { userId: string; order_count: bigint; total_amount: number | null }

interface ListingCount { userId: string; listing_count: bigint }

export interface SyncResult {
  totalUsers: number;
  created: number;
  updated: number;
  enriched: number;
  errors: number;
  durationMs: number;
}

// ─── Main Sync ──────────────────────────────────────────────────────────────
export async function syncGuiasellerToLeads(): Promise<SyncResult> {
  const start = Date.now();
  const result: SyncResult = { totalUsers: 0, created: 0, updated: 0, enriched: 0, errors: 0, durationMs: 0 };

  console.log('[SYNC] Starting guiaseller → leads sync...');

  // ── 1. Fetch all users
  const users = await guiasellerDB.$queryRaw<GsUser[]>`
    SELECT user_id, first_name, last_name, email, phone, user_level,
           "createdAt", "updatedAt", "isAlpha", "SubscriptionId",
           cnpj_cpf, nome_assinatura, status, celular
    FROM "User"
    ORDER BY "createdAt"
  `;
  result.totalUsers = users.length;
  console.log(`[SYNC] Found ${users.length} users in guiaseller DB`);

  // ── 2. Batch fetch related data
  const [companies, mlIntegrations, shopeeIntegrations, magaluIntegrations,
    subscriptions, mlOrders, shopeeOrders, magaluOrders, sheinOrders,
    mlListings, shopeeListings] = await Promise.all([
    // Companies
    guiasellerDB.$queryRaw<GsCompany[]>`
      SELECT "userId", company_name, fantasy_name, cnpj FROM "Company"
    `,
    // ML Integrations
    guiasellerDB.$queryRaw<GsIntegration[]>`
      SELECT "userId", marketplace, is_active, nickname FROM "Integrations"
    `,
    // Shopee Integrations
    guiasellerDB.$queryRaw<{ userId: string; status: string | null }[]>`
      SELECT "userId", status FROM "IntegrationShopee"
    `,
    // Magalu Integrations
    guiasellerDB.$queryRaw<{ userId: string; status: string }[]>`
      SELECT "userId", status FROM integrations_magalu
    `,
    // Subscriptions
    guiasellerDB.$queryRaw<GsSubscription[]>`
      SELECT "userId", status, value, description, cycle FROM assinaturas
    `,
    // ML Orders (aggregate per user)
    guiasellerDB.$queryRaw<OrderCount[]>`
      SELECT "userId", count(*)::bigint as order_count, sum(total_amount) as total_amount
      FROM orders GROUP BY "userId"
    `,
    // Shopee Orders
    guiasellerDB.$queryRaw<OrderCount[]>`
      SELECT o."userId", count(*)::bigint as order_count, sum(o.total_amount) as total_amount
      FROM orders_shopee o GROUP BY o."userId"
    `,
    // Magalu Orders
    guiasellerDB.$queryRaw<OrderCount[]>`
      SELECT "userId", count(*)::bigint as order_count, 0 as total_amount
      FROM magalu_orders GROUP BY "userId"
    `,
    // Shein Orders
    guiasellerDB.$queryRaw<OrderCount[]>`
      SELECT "userId", count(*)::bigint as order_count, sum("productTotalPrice") as total_amount
      FROM orders_shein GROUP BY "userId"
    `,
    // ML Listings (Anuncios)
    guiasellerDB.$queryRaw<ListingCount[]>`
      SELECT "userId", count(*)::bigint as listing_count FROM "Anuncios" GROUP BY "userId"
    `,
    // Shopee Listings
    guiasellerDB.$queryRaw<ListingCount[]>`
      SELECT "userId", count(*)::bigint as listing_count FROM "ProductsShopee" GROUP BY "userId"
    `,
  ]);

  // ── 3. Build lookup maps
  const companyMap = new Map(companies.map(c => [c.userId, c]));
  const mlIntMap = new Map<string, GsIntegration[]>();
  for (const i of mlIntegrations) {
    if (!mlIntMap.has(i.userId)) mlIntMap.set(i.userId, []);
    mlIntMap.get(i.userId)!.push(i);
  }
  const shopeeIntMap = new Map(shopeeIntegrations.map(i => [i.userId, i]));
  const magaluIntMap = new Map(magaluIntegrations.map(i => [i.userId, i]));
  const subMap = new Map(subscriptions.map(s => [s.userId, s]));

  const mlOrderMap = new Map(mlOrders.map(o => [o.userId, o]));
  const shopeeOrderMap = new Map(shopeeOrders.map(o => [o.userId, o]));
  const magaluOrderMap = new Map(magaluOrders.map(o => [o.userId, o]));
  const sheinOrderMap = new Map(sheinOrders.map(o => [o.userId, o]));
  const mlListingMap = new Map(mlListings.map(l => [l.userId, Number(l.listing_count)]));
  const shopeeListingMap = new Map(shopeeListings.map(l => [l.userId, Number(l.listing_count)]));

  // ── 4. Sync each user
  for (const user of users) {
    try {
      const company = companyMap.get(user.user_id);
      const mlInts = mlIntMap.get(user.user_id) || [];
      const shopeeInt = shopeeIntMap.get(user.user_id);
      const magaluInt = magaluIntMap.get(user.user_id);
      const sub = subMap.get(user.user_id);

      const mlO = mlOrderMap.get(user.user_id);
      const shopeeO = shopeeOrderMap.get(user.user_id);
      const magaluO = magaluOrderMap.get(user.user_id);
      const sheinO = sheinOrderMap.get(user.user_id);

      const mlListCount = mlListingMap.get(user.user_id) ?? 0;
      const shopeeListCount = shopeeListingMap.get(user.user_id) ?? 0;

      // Determine marketplaces
      const marketplaces: string[] = [];
      if (mlInts.some(i => i.is_active)) marketplaces.push('ML');
      if (shopeeInt?.status === 'ativo') marketplaces.push('Shopee');
      if (magaluInt?.status === 'active') marketplaces.push('Magalu');
      if (sheinO && Number(sheinO.order_count) > 0) marketplaces.push('Shein');

      // Total orders
      const totalOrders =
        Number(mlO?.order_count ?? 0) +
        Number(shopeeO?.order_count ?? 0) +
        Number(magaluO?.order_count ?? 0) +
        Number(sheinO?.order_count ?? 0);

      // Total revenue
      const totalRevenue =
        (mlO?.total_amount ?? 0) +
        (shopeeO?.total_amount ?? 0) +
        (magaluO?.total_amount ?? 0) +
        (sheinO?.total_amount ?? 0);

      // Determine segment
      const segment = deriveSegment(user, sub, totalOrders, marketplaces.length);

      // Primary marketplace = highest order count
      const mktOrders = [
        { name: 'ML', count: Number(mlO?.order_count ?? 0) },
        { name: 'Shopee', count: Number(shopeeO?.order_count ?? 0) },
        { name: 'Magalu', count: Number(magaluO?.order_count ?? 0) },
        { name: 'Shein', count: Number(sheinO?.order_count ?? 0) },
      ].sort((a, b) => b.count - a.count);
      const primaryMarketplace = mktOrders[0]?.count > 0 ? mktOrders[0].name : (marketplaces[0] ?? null);

      // Lead data
      const leadData = {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name ?? '',
        phone: user.celular || user.phone || null,
        guiasellerUserId: user.user_id,
        userLevel: user.user_level,
        subscriptionPlan: sub?.description ?? user.nome_assinatura ?? null,
        subscriptionStatus: sub?.status ?? null,
        cnpjCpf: user.cnpj_cpf ?? null,
        purchaseCount: totalOrders,
        totalRevenue: new Prisma.Decimal(totalRevenue),
        listingCount: mlListCount + shopeeListCount,
        segment,
        primaryMarketplace,
        marketplaces,
        status: deriveStatus(user, sub),
        lastSyncedAt: new Date(),
        syncSource: 'guiaseller-db',
      };

      // Enrichment data
      const enrichmentData = {
        companyName: company?.company_name ?? null,
        fantasyName: company?.fantasy_name ?? null,
        cnpj: company?.cnpj ?? null,
        businessType: company ? 'business' : 'individual',
        mlOrderCount: Number(mlO?.order_count ?? 0),
        mlRevenue: new Prisma.Decimal(mlO?.total_amount ?? 0),
        shopeeOrderCount: Number(shopeeO?.order_count ?? 0),
        shopeeRevenue: new Prisma.Decimal(shopeeO?.total_amount ?? 0),
        magaluOrderCount: Number(magaluO?.order_count ?? 0),
        magaluRevenue: new Prisma.Decimal(magaluO?.total_amount ?? 0),
        sheinOrderCount: Number(sheinO?.order_count ?? 0),
        sheinRevenue: new Prisma.Decimal(sheinO?.total_amount ?? 0),
        totalOrderCount: totalOrders,
        totalOrderValue: new Prisma.Decimal(totalRevenue),
        avgOrderValue: new Prisma.Decimal(totalOrders > 0 ? totalRevenue / totalOrders : 0),
        mlListingCount: mlListCount,
        shopeeListingCount: shopeeListCount,
        totalProductCount: mlListCount + shopeeListCount,
        mlIntegrations: mlInts.filter(i => i.is_active).length,
        shopeeIntegrations: shopeeInt?.status === 'ativo' ? 1 : 0,
        magaluIntegrations: magaluInt?.status === 'active' ? 1 : 0,
        subscriptionValue: new Prisma.Decimal(sub?.value ?? 0),
        subscriptionCycle: sub?.cycle ?? null,
        lastActiveAt: user.updatedAt,
      };

      // Upsert lead 
      const existing = await leadsDB.lead.findUnique({ where: { guiasellerUserId: user.user_id } });

      if (existing) {
        await leadsDB.lead.update({
          where: { id: existing.id },
          data: leadData,
        });
        await leadsDB.leadEnrichment.upsert({
          where: { leadId: existing.id },
          create: { leadId: existing.id, ...enrichmentData },
          update: enrichmentData,
        });
        result.updated++;
      } else {
        await leadsDB.lead.create({
          data: {
            ...leadData,
            enrichment: { create: enrichmentData },
          },
        });
        result.created++;
      }
      result.enriched++;
    } catch (err) {
      result.errors++;
      console.error(`[SYNC] Error syncing user ${user.email}:`, (err as Error).message);
    }
  }

  result.durationMs = Date.now() - start;

  // Log sync result
  await leadsDB.syncLog.create({
    data: {
      marketplace: 'all',
      syncType: 'full-sync',
      status: result.errors === 0 ? 'success' : 'partial',
      leadsProcessed: result.totalUsers,
      leadsCreated: result.created,
      leadsUpdated: result.updated,
      startedAt: new Date(start),
      completedAt: new Date(),
      errorMessage: result.errors > 0 ? `${result.errors} errors during sync` : null,
    },
  });

  console.log(`[SYNC] Complete: ${result.created} created, ${result.updated} updated, ${result.errors} errors (${result.durationMs}ms)`);
  return result;
}

// ─── Segment Derivation ─────────────────────────────────────────────────────
function deriveSegment(
  user: GsUser,
  sub: GsSubscription | undefined,
  totalOrders: number,
  marketplaceCount: number
): string {
  const level = user.user_level?.toUpperCase();

  // Founders — lifetime/vitalicio
  if (level === 'VITALICIO') return 'founder';

  // Paying users (active subscription)
  if (sub?.status === 'ACTIVE') {
    const plan = sub.description?.toLowerCase() ?? '';
    if (plan.includes('premium')) return 'premium';
    if (plan.includes('pro')) return 'pro';
    return 'paying';
  }

  // Churned (had subscription but cancelled)
  if (sub && sub.status !== 'ACTIVE') return 'churned';

  // Free user with activity
  if (totalOrders > 0 || marketplaceCount > 0) return 'free-active';

  // Free user without activity
  return 'free-inactive';
}

// ─── Status Derivation ──────────────────────────────────────────────────────
function deriveStatus(user: GsUser, sub: GsSubscription | undefined): string {
  if (sub?.status === 'ACTIVE') return 'active';
  if (sub && sub.status !== 'ACTIVE') return 'churned';

  const level = user.user_level?.toUpperCase();
  if (level === 'VITALICIO') return 'active';
  if (level === 'PREMIUM' || level === 'PRO') return 'active';

  // Check if user was active recently (updated in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (user.updatedAt > thirtyDaysAgo) return 'active';

  return 'inactive';
}

// ─── Run directly ───────────────────────────────────────────────────────────
if (process.argv[1]?.endsWith('syncService.ts') || process.argv[1]?.endsWith('syncService.js')) {
  syncGuiasellerToLeads()
    .then(r => {
      console.log('\n📊 Sync Summary:', JSON.stringify(r, null, 2));
      process.exit(0);
    })
    .catch(e => {
      console.error('Sync failed:', e);
      process.exit(1);
    });
}
