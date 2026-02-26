-- ============================================================
-- GuiaSeller Leads — Database Setup
-- ============================================================
-- Run this ONCE in EasyPanel:
--   PostgreSQL service → "leads" database → SQL Console
-- ============================================================

-- Step 1: Grant permissions to user_leads (needed for PG 15+)
GRANT CREATE ON SCHEMA public TO user_leads;
GRANT ALL PRIVILEGES ON SCHEMA public TO user_leads;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_leads;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_leads;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO user_leads;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO user_leads;

-- Step 2: Create all application tables
-- CreateTable
CREATE TABLE IF NOT EXISTS "leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "guiasellerUserId" TEXT,
    "purchaseCount" INTEGER NOT NULL DEFAULT 0,
    "browsingHistory" JSONB,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "conversionProb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreCalculatedAt" TIMESTAMP(3),
    "scoreReason" TEXT,
    "segment" TEXT,
    "primaryMarketplace" TEXT NOT NULL,
    "marketplaces" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastTouchedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "convertedAt" TIMESTAMP(3),
    "conversionValue" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_enrichments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "companyName" TEXT,
    "website" TEXT,
    "businessType" TEXT,
    "totalOrderValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "avgOrderValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastOrderAt" TIMESTAMP(3),
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "avgProductRating" DOUBLE PRECISION,
    "pageViewCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "emailEngagement" INTEGER NOT NULL DEFAULT 0,
    "clickThroughRate" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "lead_enrichments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "fieldChanged" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "adminUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_events" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "marketplace" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_scores" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT,
    "components" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "integration_events" (
    "id" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "leadCount" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sync_logs" (
    "id" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "leadsProcessed" INTEGER NOT NULL DEFAULT 0,
    "leadsCreated" INTEGER NOT NULL DEFAULT 0,
    "leadsUpdated" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- Step 3: Unique constraints & indexes
CREATE UNIQUE INDEX IF NOT EXISTS "leads_email_key" ON "leads"("email");
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads"("email");
CREATE INDEX IF NOT EXISTS "leads_leadScore_idx" ON "leads"("leadScore");
CREATE INDEX IF NOT EXISTS "leads_segment_idx" ON "leads"("segment");
CREATE INDEX IF NOT EXISTS "leads_primaryMarketplace_idx" ON "leads"("primaryMarketplace");
CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status");
CREATE INDEX IF NOT EXISTS "leads_createdAt_idx" ON "leads"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "lead_enrichments_leadId_key" ON "lead_enrichments"("leadId");
CREATE INDEX IF NOT EXISTS "lead_enrichments_leadId_idx" ON "lead_enrichments"("leadId");

CREATE INDEX IF NOT EXISTS "lead_history_leadId_idx" ON "lead_history"("leadId");
CREATE INDEX IF NOT EXISTS "lead_history_eventType_idx" ON "lead_history"("eventType");
CREATE INDEX IF NOT EXISTS "lead_history_createdAt_idx" ON "lead_history"("createdAt");

CREATE INDEX IF NOT EXISTS "lead_events_leadId_idx" ON "lead_events"("leadId");
CREATE INDEX IF NOT EXISTS "lead_events_eventType_idx" ON "lead_events"("eventType");
CREATE INDEX IF NOT EXISTS "lead_events_marketplace_idx" ON "lead_events"("marketplace");
CREATE INDEX IF NOT EXISTS "lead_events_createdAt_idx" ON "lead_events"("createdAt");

CREATE INDEX IF NOT EXISTS "lead_scores_leadId_idx" ON "lead_scores"("leadId");
CREATE INDEX IF NOT EXISTS "lead_scores_score_idx" ON "lead_scores"("score");
CREATE INDEX IF NOT EXISTS "lead_scores_createdAt_idx" ON "lead_scores"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_firebaseUid_key" ON "admin_users"("firebaseUid");
CREATE INDEX IF NOT EXISTS "admin_users_email_idx" ON "admin_users"("email");
CREATE INDEX IF NOT EXISTS "admin_users_firebaseUid_idx" ON "admin_users"("firebaseUid");

CREATE INDEX IF NOT EXISTS "integration_events_marketplace_idx" ON "integration_events"("marketplace");
CREATE INDEX IF NOT EXISTS "integration_events_eventType_idx" ON "integration_events"("eventType");
CREATE INDEX IF NOT EXISTS "integration_events_createdAt_idx" ON "integration_events"("createdAt");

CREATE INDEX IF NOT EXISTS "sync_logs_marketplace_idx" ON "sync_logs"("marketplace");
CREATE INDEX IF NOT EXISTS "sync_logs_syncType_idx" ON "sync_logs"("syncType");
CREATE INDEX IF NOT EXISTS "sync_logs_status_idx" ON "sync_logs"("status");
CREATE INDEX IF NOT EXISTS "sync_logs_startedAt_idx" ON "sync_logs"("startedAt");

-- Step 4: Foreign Keys
ALTER TABLE "lead_enrichments"
    ADD CONSTRAINT IF NOT EXISTS "lead_enrichments_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_history"
    ADD CONSTRAINT IF NOT EXISTS "lead_history_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_history"
    ADD CONSTRAINT IF NOT EXISTS "lead_history_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lead_events"
    ADD CONSTRAINT IF NOT EXISTS "lead_events_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_scores"
    ADD CONSTRAINT IF NOT EXISTS "lead_scores_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Done!
SELECT 'Setup complete! Tables created: ' || count(*)::text || ' tables'
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('leads','lead_enrichments','lead_history','lead_events','lead_scores','admin_users','integration_events','sync_logs');
