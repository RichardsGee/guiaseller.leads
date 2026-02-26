/**
 * Shared types between backend and frontend
 * These types mirror the Prisma schema and API contract
 */

// ============================================
// Lead Types
// ============================================

export type Marketplace = 'ML' | 'Shopee' | 'Magalu' | 'TikTok' | 'Amazon' | 'Shein';
export type LeadStatus = 'active' | 'inactive' | 'archived';
export type Segment = 'founder' | 'seller' | 'buyer' | 'heavy-user' | 'inactive';
export type AdminRole = 'admin' | 'manager' | 'viewer';

export interface Lead {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  guiasellerUserId: string | null;
  purchaseCount: number;
  browsingHistory: unknown;
  leadScore: number;
  conversionProb: number;
  scoreCalculatedAt: string | null;
  scoreReason: string | null;
  segment: Segment | null;
  primaryMarketplace: Marketplace;
  marketplaces: string[];
  status: LeadStatus;
  lastTouchedAt: string;
  convertedAt: string | null;
  conversionValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadEnrichment {
  id: string;
  leadId: string;
  companyName: string | null;
  website: string | null;
  businessType: string | null;
  totalOrderValue: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderAt: string | null;
  productCount: number;
  avgProductRating: number | null;
  pageViewCount: number;
  timeSpentMinutes: number;
  lastActiveAt: string | null;
  emailEngagement: number;
  clickThroughRate: number;
  updatedAt: string;
}

export interface LeadWithRelations extends Lead {
  enrichment?: LeadEnrichment | null;
  history?: LeadHistory[];
  events?: LeadEvent[];
  scores?: LeadScoreRecord[];
  _count?: { events: number; history: number };
}

export interface LeadHistory {
  id: string;
  leadId: string;
  eventType: string;
  fieldChanged: string | null;
  oldValue: unknown;
  newValue: unknown;
  adminUserId: string | null;
  metadata: unknown;
  createdAt: string;
  adminUser?: { firstName: string; lastName: string } | null;
}

export interface LeadEvent {
  id: string;
  leadId: string;
  eventType: string;
  marketplace: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface LeadScoreRecord {
  id: string;
  leadId: string;
  score: number;
  reason: string | null;
  components: {
    purchaseHistory: number;
    browsingActivity: number;
    interestMatch: number;
    engagement: number;
  } | null;
  createdAt: string;
}

// ============================================
// Admin User Types
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Analytics Types
// ============================================

export interface KPIOverview {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  newLeadsToday: number;
  conversionRate: number;
  avgScore: number;
}

export interface MarketplaceStats {
  marketplace: Marketplace;
  totalLeads: number;
  avgScore: number;
  converted: number;
  conversionRate: number;
}

export interface SegmentStats {
  segment: string;
  count: number;
  avgScore: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface TrendPoint {
  date: string;
  newLeads: number;
  avgScore: number;
  converted: number;
}
