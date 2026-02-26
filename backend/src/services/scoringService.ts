/**
 * Lead Scoring Service — Rule-based scoring (Phase 1)
 *
 * Score: 0-100 based on 4 weighted factors:
 * - Purchase History (30%): past order count, total value, recency
 * - Browsing Activity (25%): page views, time spent, frequency
 * - Interest Match (25%): marketplace alignment, segment fit
 * - Engagement (20%): email opens, click-through, response rate
 */

interface LeadWithRelations {
  id: string;
  leadScore: number;
  purchaseCount: number;
  listingCount: number;
  totalRevenue: unknown;
  primaryMarketplace: string | null;
  marketplaces: string[];
  segment: string | null;
  userLevel: string | null;
  subscriptionPlan: string | null;
  status: string;
  createdAt: Date;
  enrichment?: {
    totalOrderValue: unknown;
    totalOrderCount: number;
    avgOrderValue: unknown;
    lastOrderAt: Date | null;
    mlOrderCount: number;
    shopeeOrderCount: number;
    magaluOrderCount: number;
    sheinOrderCount: number;
    totalProductCount: number;
    mlListingCount: number;
    shopeeListingCount: number;
    mlIntegrations: number;
    shopeeIntegrations: number;
    magaluIntegrations: number;
    subscriptionValue: unknown;
    lastActiveAt: Date | null;
  } | null;
  events?: Array<{
    eventType: string;
    marketplace: string | null;
    createdAt: Date;
  }>;
}

interface ScoreResult {
  score: number;
  conversionProb: number;
  reason: string;
  components: {
    purchaseHistory: number;
    browsingActivity: number;
    interestMatch: number;
    engagement: number;
  };
}

// Weight configuration
const WEIGHTS = {
  purchaseHistory: 0.30,
  browsingActivity: 0.25,
  interestMatch: 0.25,
  engagement: 0.20,
};

function scorePurchaseHistory(lead: LeadWithRelations): number {
  const enrichment = lead.enrichment;
  if (!enrichment) return 10;

  let score = 0;

  // Order count (0-35 points)
  const orderCount = enrichment.totalOrderCount;
  if (orderCount >= 50) score += 35;
  else if (orderCount >= 10) score += 25;
  else if (orderCount >= 1) score += 15;
  else score += 5;

  // Total order value (0-35 points)
  const totalValue = Number(enrichment.totalOrderValue) || 0;
  if (totalValue >= 10000) score += 35;
  else if (totalValue >= 1000) score += 25;
  else if (totalValue >= 100) score += 15;
  else score += 5;

  // Recency of last order (0-30 points)
  if (enrichment.lastOrderAt) {
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(enrichment.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastOrder <= 7) score += 30;
    else if (daysSinceLastOrder <= 30) score += 20;
    else if (daysSinceLastOrder <= 90) score += 10;
    else score += 5;
  }

  return Math.min(score, 100);
}

function scoreBrowsingActivity(lead: LeadWithRelations): number {
  const enrichment = lead.enrichment;
  if (!enrichment) return 10;

  let score = 0;

  // Listing count as proxy for platform engagement (0-35 points)
  const listings = enrichment.totalProductCount;
  if (listings >= 100) score += 35;
  else if (listings >= 20) score += 25;
  else if (listings >= 5) score += 15;
  else score += 5;

  // Multi-marketplace integrations (0-35 points)
  const integrations = enrichment.mlIntegrations + enrichment.shopeeIntegrations + enrichment.magaluIntegrations;
  if (integrations >= 3) score += 35;
  else if (integrations >= 2) score += 25;
  else if (integrations >= 1) score += 15;
  else score += 5;

  // Recency of activity (0-30 points)
  if (enrichment.lastActiveAt) {
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(enrichment.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive <= 3) score += 30;
    else if (daysSinceActive <= 14) score += 20;
    else if (daysSinceActive <= 30) score += 10;
    else score += 5;
  }

  return Math.min(score, 100);
}

function scoreInterestMatch(lead: LeadWithRelations): number {
  let score = 0;

  // Multi-marketplace presence (0-40 points)
  const marketplaceCount = lead.marketplaces?.length || 1;
  if (marketplaceCount >= 4) score += 40;
  else if (marketplaceCount >= 2) score += 25;
  else score += 10;

  // Segment alignment (0-30 points)
  const highValueSegments = ['founder', 'premium', 'pro', 'paying'];
  if (lead.segment && highValueSegments.includes(lead.segment)) score += 30;
  else if (lead.segment === 'free-active') score += 15;
  else score += 5;

  // Account age / loyalty (0-30 points)
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated >= 365) score += 30;
  else if (daysSinceCreated >= 90) score += 20;
  else if (daysSinceCreated >= 30) score += 10;
  else score += 5;

  return Math.min(score, 100);
}

function scoreEngagement(lead: LeadWithRelations): number {
  const enrichment = lead.enrichment;
  if (!enrichment) return 10;

  let score = 0;

  // Subscription value as engagement signal (0-40 points)
  const subValue = Number(enrichment.subscriptionValue) || 0;
  if (subValue >= 150) score += 40;
  else if (subValue >= 50) score += 30;
  else if (subValue > 0) score += 20;
  else score += 5;

  // Marketplace spread (0-35 points)
  const mktCount = [enrichment.mlOrderCount, enrichment.shopeeOrderCount, enrichment.magaluOrderCount, enrichment.sheinOrderCount].filter(c => c > 0).length;
  if (mktCount >= 3) score += 35;
  else if (mktCount >= 2) score += 25;
  else if (mktCount >= 1) score += 15;
  else score += 5;

  // Event count (0-25 points)
  const eventCount = lead.events?.length || 0;
  if (eventCount >= 20) score += 25;
  else if (eventCount >= 10) score += 18;
  else if (eventCount >= 3) score += 10;
  else score += 3;

  return Math.min(score, 100);
}

export function calculateScore(lead: LeadWithRelations): ScoreResult {
  const components = {
    purchaseHistory: scorePurchaseHistory(lead),
    browsingActivity: scoreBrowsingActivity(lead),
    interestMatch: scoreInterestMatch(lead),
    engagement: scoreEngagement(lead),
  };

  const weightedScore = Math.round(
    components.purchaseHistory * WEIGHTS.purchaseHistory +
    components.browsingActivity * WEIGHTS.browsingActivity +
    components.interestMatch * WEIGHTS.interestMatch +
    components.engagement * WEIGHTS.engagement
  );

  const score = Math.min(Math.max(weightedScore, 0), 100);

  // Conversion probability based on score brackets
  let conversionProb: number;
  if (score >= 80) conversionProb = 0.75;
  else if (score >= 60) conversionProb = 0.50;
  else if (score >= 40) conversionProb = 0.25;
  else if (score >= 20) conversionProb = 0.10;
  else conversionProb = 0.03;

  // Generate reason
  const topFactor = Object.entries(components)
    .sort((a, b) => b[1] - a[1])[0];

  const factorLabels: Record<string, string> = {
    purchaseHistory: 'purchase history',
    browsingActivity: 'browsing activity',
    interestMatch: 'interest alignment',
    engagement: 'engagement level',
  };

  const reason = `Score ${score}/100 — strongest factor: ${factorLabels[topFactor[0]]} (${topFactor[1]}/100)`;

  return { score, conversionProb, reason, components };
}
