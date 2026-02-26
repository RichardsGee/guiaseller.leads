/**
 * Lead Segmentation Service
 *
 * Auto-assigns segment based on lead data:
 * - founder: Has business, sells on multiple marketplaces, high value
 * - seller: Active seller on at least one marketplace
 * - buyer: Only buys, no selling activity
 * - heavy-user: Extremely active (high page views, frequent purchases)
 * - inactive: No activity in 90+ days
 */

interface LeadForSegmentation {
  id: string;
  purchaseCount: number;
  listingCount: number;
  primaryMarketplace: string | null;
  marketplaces: string[];
  userLevel: string | null;
  subscriptionPlan: string | null;
  status: string;
  createdAt: Date;
  enrichment?: {
    totalOrderValue: unknown;
    totalOrderCount: number;
    totalProductCount: number;
    mlIntegrations: number;
    shopeeIntegrations: number;
    magaluIntegrations: number;
    lastActiveAt: Date | null;
    businessType: string | null;
    subscriptionValue: unknown;
  } | null;
  events?: Array<{
    eventType: string;
    createdAt: Date;
  }>;
}

type Segment = 'founder' | 'seller' | 'buyer' | 'heavy-user' | 'inactive';

export function assignSegment(lead: LeadForSegmentation): Segment {
  const enrichment = lead.enrichment;
  const level = lead.userLevel?.toUpperCase();

  // Founder: vitalicio or has business + multi-marketplace + products
  if (level === 'VITALICIO') return 'founder';
  if (
    enrichment?.businessType === 'business' &&
    lead.marketplaces.length >= 2 &&
    (enrichment?.totalProductCount || 0) >= 5
  ) {
    return 'founder';
  }

  // Premium/Pro paying user
  const subValue = Number(enrichment?.subscriptionValue ?? 0);
  if (subValue > 0 || level === 'PREMIUM' || level === 'PRO') {
    return 'seller';
  }

  // Check inactive (no activity in 90+ days)
  if (enrichment?.lastActiveAt) {
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(enrichment.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive >= 90) return 'inactive';
  } else if (!enrichment) {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated >= 90) return 'inactive';
  }

  // Active seller: has products or orders
  if ((enrichment?.totalProductCount || 0) >= 1 || lead.purchaseCount > 0) {
    return 'seller';
  }

  // Heavy-user: high listing count + orders
  if (lead.listingCount >= 50 && lead.purchaseCount >= 10) {
    return 'heavy-user';
  }

  // Default: buyer
  return 'buyer';
}

// Segment display metadata
export const SEGMENT_META: Record<Segment, { label: string; color: string; description: string }> = {
  founder: {
    label: 'Founder',
    color: '#8b5cf6', // purple
    description: 'Business owner selling on multiple marketplaces',
  },
  seller: {
    label: 'Seller',
    color: '#3b82f6', // blue
    description: 'Active seller on at least one marketplace',
  },
  buyer: {
    label: 'Buyer',
    color: '#10b981', // green
    description: 'Primarily a buyer / consumer',
  },
  'heavy-user': {
    label: 'Heavy User',
    color: '#f59e0b', // amber
    description: 'Extremely active user with high engagement',
  },
  inactive: {
    label: 'Inactive',
    color: '#6b7280', // gray
    description: 'No activity in 90+ days',
  },
};
