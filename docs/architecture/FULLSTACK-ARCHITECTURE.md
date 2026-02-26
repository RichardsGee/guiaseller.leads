# GuiaSeller Leads — Arquitetura Fullstack Completa

> **Documento de referência para implementação fullstack do guiaseller.leads**
> Gerado por Aria (Architect) — 26/02/2026
> Status: **DRAFT** — Pronto para revisão e refinamento

---

## Índice

1. [Visão Geral & Princípios](#1-visão-geral--princípios)
2. [Stack Técnico](#2-stack-técnico)
3. [Arquitetura de Camadas](#3-arquitetura-de-camadas)
4. [Backend — API & Serviços](#4-backend--api--serviços)
5. [Frontend — Dashboard Admin](#5-frontend--dashboard-admin)
6. [Data Layer — Schema & Integrações](#6-data-layer--schema--integrações)
7. [Segurança & Autenticação](#7-segurança--autenticação)
8. [Performance & Escalabilidade](#8-performance--escalabilidade)
9. [Deployment & CI/CD](#9-deployment--cicd)
10. [Estrutura de Pastas](#10-estrutura-de-pastas)
11. [Checklist de Implementação](#11-checklist-de-implementação)

---

## 1. Visão Geral & Princípios

### Objetivo do Sistema

**guiaseller.leads** é uma **plataforma interna de inteligência de leads** que centraliza, enriquece e acompanha leads do ecossistema GuiaSeller.

**Diferencial:**
- Integração com 2 bancos de dados: `guiaseller` (READ-ONLY para dados de contexto) + `leads` (full CRUD para histórico de leads)
- Dashboard admin em tempo real com Firebase realtime DB
- IA para personalização de ofertas e lead scoring
- Segmentação inteligente por marketplace (ML, Shopee, Magalu, TikTok, Amazon, Shein)

### Princípios de Arquitetura

| Princípio | Aplicação |
|-----------|-----------|
| **Data-Centric** | 2 bancos separados para concerns distintos; Prisma como single source of truth |
| **API-First** | Backend como API pura; frontend consome via REST/GraphQL |
| **Real-Time Ready** | Firebase Realtime DB para updates instantâneos |
| **Security by Design** | RLS policies em ambos os bancos; JWT auth; SELECT-only constraint enforced |
| **Scalability** | Stateless API; caching em Redis; CDN para assets |
| **Developer Experience** | Typescript everywhere; Type-safe Prisma; Storybook para componentes |
| **Performance** | Lazy loading frontend; index optimization backend; query caching |

---

## 2. Stack Técnico

### Backend

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| **Runtime** | Node.js 18+ | Performance, eco-sistema npm, async-first |
| **Framework** | Express.js ou Fastify | Simples, rápido, middleware ecosystem |
| **ORM** | Prisma | Type-safe, migrations, 2 database support |
| **Validation** | Zod | Runtime + TypeScript type safety |
| **Auth** | Firebase Auth + JWT | Delegado ao Firebase, JWT para API |
| **Realtime** | Firebase Realtime DB | Sincs instantâneos do dashboard |
| **Cache** | Redis (optional) | Session store, query cache |
| **Search** | PostgreSQL Full-Text | Buscas em leads, marketplace queries |
| **Logging** | Winston/Pino | Estruturado, JSON, stack traces |
| **Testing** | Jest + Supertest | Unit/integration, HTTP assertions |

### Frontend

| Camada | Tecnologia | Justificativa |
|--------|-----------|--------------|
| **Build** | Vite | 10x mais rápido que Webpack |
| **Framework** | React 18+ | JSX, hooks, large ecosystem |
| **Language** | TypeScript | Type safety, DX, autocompletion |
| **Styling** | Tailwind CSS + CSS Modules | Utility-first, zero runtime |
| **Icons** | lucide-react | Consistente com design system |
| **State** | React Context / Zustand | Simples para dashboard, não precisa Redux |
| **HTTP Client** | TanStack Query | Caching, sync, background refetch |
| **Router** | TanStack Router | Type-safe, nested layouts |
| **Forms** | React Hook Form | Lightweight, Zod integration |
| **UI Components** | shadcn/ui + custom | Headless, acessível, customizável |
| **Charting** | Recharts | React-native, responsive, interativo |
| **Realtime** | Firebase JS SDK | Sync com updates do backend |
| **Testing** | Vitest + React Testing Library | Unit/component, snapshot-safe |

### Data Layer

| Recurso | Tecnologia | Config |
|---------|-----------|--------|
| **guiaseller DB** | PostgreSQL | `DATABASE_URL` — SELECT-only user |
| **leads DB** | PostgreSQL | `LEADS_DB_URL` — Full CRUD user |
| **ORM** | Prisma | `prisma/schema.prisma` com `@@map` para routing |
| **Migrations** | Prisma Migrate | `prisma/migrations/` — versionado |
| **Realtime Sync** | Firebase Realtime DB | Espelho hot de leads ativos |

### Infrastructure

| Componente | Tecnologia | Uso |
|-----------|-----------|-----|
| **Hosting** | Railway ou Vercel | Deployment automático |
| **CDN** | Cloudflare ou Vercel Edge | Assets, caching, DDoS |
| **Monitoring** | Sentry (opcional) | Error tracking, performance |
| **CI/CD** | GitHub Actions | Lint, test, build, deploy |
| **Secrets** | GitHub Secrets | Env vars, API keys |

---

## 3. Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Vite)                  │
│  Dashboard Admin | Analytics | Lead Management | Settings  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / JSON
┌────────────────────────▼────────────────────────────────────┐
│              API GATEWAY (Express/Fastify)                  │
│  Auth | Rate Limiting | Request Logging | Error Handling   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   Leads      │ │  Analytics  │ │ Integrations│
│   Service    │ │  Service    │ │  Service    │
└───────┬──────┘ └──────┬──────┘ └──────┬──────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────────┐
        │                │                │                  │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌────────▼─┐
│ Prisma ORM   │ │ Firebase    │ │  Cache      │ │ Queue    │
│ (dual DB)    │ │  Realtime   │ │ (Redis)     │ │ (Bull)   │
└───────┬──────┘ └──────┬──────┘ └─────────────┘ └──────────┘
        │                │
        │                │
   ┌────▼────┐      ┌────▼──────────┐
   │guiaseller│      │    leads      │
   │  (READ)  │      │  (FULL CRUD)  │
   └──────────┘      └───────────────┘
```

### Fluxo de Dados

1. **Frontend** → HTTP Request (TanStack Query)
2. **API Gateway** → Auth check, validation
3. **Service Layer** → Business logic, Prisma queries
4. **Data Layer** → PostgreSQL dual DB ou Firebase sync
5. **Response** → JSON + realtime updates via Firebase
6. **Frontend** → State update + UI render

---

## 4. Backend — API & Serviços

### API Routes Structure

```
/api/v1/
├── /auth
│   ├── POST /signin           # Firebase auth + JWT
│   ├── POST /signup           # Create admin user
│   ├── POST /refresh          # Token refresh
│   └── POST /logout           # Revoke token
│
├── /leads
│   ├── GET /                  # List leads (paginated, filtered)
│   ├── GET /:id               # Get lead details + history
│   ├── POST /                 # Create lead (manual)
│   ├── PUT /:id               # Update lead
│   ├── DELETE /:id            # Archive lead
│   ├── POST /:id/score        # Recalculate lead score
│   └── POST /:id/segment      # Update segment
│
├── /analytics
│   ├── GET /dashboard         # KPIs, metrics
│   ├── GET /conversion-rate   # By marketplace, time period
│   ├── GET /lead-lifecycle    # Funnel visualization
│   └── GET /quality-score     # Score distribution
│
├── /integrations
│   ├── GET /marketplaces      # List connected marketplaces
│   ├── POST /:marketplace/sync # Manual sync trigger
│   └── GET /sync-status       # Last sync timestamps
│
└── /admin
    ├── GET /users            # List admin users
    ├── POST /users           # Create admin user
    ├── PUT /users/:id        # Update permissions
    └── DELETE /users/:id     # Deactivate user
```

### Service Layer Architecture

```typescript
// services/leadService.ts
├── getAllLeads(filters, pagination)
├── getLeadById(id)
├── createLead(data)
├── updateLead(id, data)
├── calculateLeadScore(id)
├── segmentLead(id)
└── archiveLead(id)

// services/analyticsService.ts
├── getDashboardMetrics()
├── getConversionFunnel(period)
├── getLeadLifecycle(period)
├── getQualityScore()
└── exportData(format)

// services/integrationService.ts
├── syncMarketplace(marketplace)
├── getMarketplaceStatus(marketplace)
├── validateMarketplaceConnection()
└── logIntegrationEvent()
```

### Business Logic Patterns

#### Lead Lifecycle Processing
```
Raw Lead (ML, Shopee, etc.)
  ↓ [Enrichment Service]
    - Pull from guiaseller DB (READ-only)
    - Fetch marketplace data
    - Validate email/phone
  ↓ [Scoring Service]
    - Calculate lead score (0-100)
    - Determine conversion probability
  ↓ [Segmentation Service]
    - Assign persona (founder, seller, etc.)
    - Marketplace category
  ↓ [Leads DB] (INSERT/UPDATE)
    - Store lead with score + segment
  ↓ [Firebase Realtime]
    - Sync to admin dashboard
  ↓ [Notification Service]
    - Alert admin if high-value lead
```

#### Real-Time Sync Pattern
```
Lead Updated (Leads DB)
  ↓ [Database Trigger / Webhook]
  ↓ [Firebase Write]
  ↓ [Frontend Listener]
    - TanStack Query invalidates
    - UI updates instantly
```

---

## 5. Frontend — Dashboard Admin

### Page Structure

```
/dashboard (Protected Route)
├── /overview
│   ├── KPI Cards (conversion rate, avg score, new leads today)
│   ├── Conversion Funnel Chart
│   ├── Lead Lifecycle Timeline
│   └── Quality Score Distribution
│
├── /leads
│   ├── Leads Table (sortable, filterable, paginated)
│   │   ├── Name | Email | Marketplace | Score | Segment | Status
│   │   └── Row Actions: View | Edit | Archive | Score Details
│   ├── Filters Sidebar
│   │   ├── Marketplace (multi-select)
│   │   ├── Score Range (slider)
│   │   ├── Segment (multi-select)
│   │   ├── Status (active, inactive, archived)
│   │   └── Date Range (created_at)
│   └── Bulk Actions (archive, re-segment, export)
│
├── /lead/:id (Detail View)
│   ├── Lead Profile Card
│   │   ├── Photo | Name | Contact | Marketplace
│   │   └── Score (visual gauge) | Segment | Status
│   ├── Engagement Timeline
│   │   ├── Events: visited, clicked email, viewed offer
│   │   ├── Conversion history
│   │   └── Score changes over time
│   ├── Enrichment Data (from guiaseller DB)
│   │   ├── Purchase history
│   │   ├── Browsing activity
│   │   └── Previous interactions
│   ├── AI Recommendations
│   │   ├── Best offer to send
│   │   ├── Optimal contact time
│   │   └── Churn risk assessment
│   └── Actions
│       ├── Send offer
│       ├── Update segment
│       ├── Recalculate score
│       └── Archive lead
│
├── /analytics
│   ├── Conversion Rate by Marketplace
│   ├── Lead Quality Distribution
│   ├── Lifecycle Funnel
│   ├── Score Trends (7d, 30d, 90d)
│   └── Export Data
│
├── /settings
│   ├── Users Management
│   │   ├── List admin users
│   │   ├── Add/remove users
│   │   └── Permission management
│   ├── Integrations Status
│   │   ├── Marketplace connections
│   │   ├── Last sync times
│   │   └── Manual sync triggers
│   └── System Status
│       ├── Database health
│       ├── API latency
│       └── Error logs
│
└── /profile
    ├── User settings
    ├── Change password
    └── Logout
```

### Component Architecture

```
/src/components/
├── /layout
│   ├── AppLayout.tsx (Header, Sidebar, Main)
│   ├── PageHeader.tsx (Title, breadcrumbs, actions)
│   └── Sidebar.tsx (Nav items, user menu)
│
├── /common
│   ├── Button.tsx (primary, secondary, ghost, danger)
│   ├── Card.tsx (container, header, content, footer)
│   ├── Badge.tsx (status, segment, score)
│   ├── Modal.tsx (confirm, form, info)
│   ├── Tooltip.tsx (smart positioning)
│   ├── Toggle.tsx (switch)
│   └── Table.tsx (sortable, selectable, paginated)
│
├── /leads
│   ├── LeadsTable.tsx (main component)
│   ├── LeadFilters.tsx (sidebar filters)
│   ├── LeadRow.tsx (table row)
│   ├── LeadCard.tsx (mini card)
│   └── BulkActions.tsx (select multiple)
│
├── /analytics
│   ├── KPICard.tsx (metric + trend)
│   ├── ConversionChart.tsx (Recharts)
│   ├── FunnelChart.tsx (Recharts)
│   ├── TimelineChart.tsx (Recharts area)
│   └── ExportButton.tsx
│
├── /shared
│   ├── Typography.tsx (Heading, Text, Label variants)
│   ├── Avatar.tsx (user profile)
│   └── EmptyState.tsx (no results)
│
└── /forms
    ├── LoginForm.tsx
    ├── LeadForm.tsx (create/edit)
    ├── FilterForm.tsx
    └── UserForm.tsx
```

### State Management

```typescript
// Using Zustand for simplicity (dashboard doesn't need Redux complexity)

// store/leadsStore.ts
- leads: Lead[]
- filters: Filters
- pagination: { page, limit, total }
- isLoading: boolean
- error: string | null
- actions: {
    setLeads,
    addLead,
    updateLead,
    removeLead,
    setFilters,
    setPagination,
    reset
  }

// store/authStore.ts
- user: User | null
- token: string | null
- isAuthenticated: boolean
- actions: {
    login,
    logout,
    refreshToken
  }

// store/uiStore.ts
- sidebarOpen: boolean
- theme: 'light' | 'dark'
- actions: {
    toggleSidebar,
    setTheme
  }
```

### Real-Time Updates

```typescript
// hooks/useLeadUpdates.ts
useEffect(() => {
  const unsubscribe = firebaseDB.ref('leads').on('child_changed', (snapshot) => {
    const updatedLead = snapshot.val();
    leadsStore.updateLead(updatedLead.id, updatedLead);
    queryClient.invalidateQueries('leads'); // TanStack Query refetch
  });
  return unsubscribe;
}, []);
```

---

## 6. Data Layer — Schema & Integrações

### Dual Database Strategy

```
┌──────────────────────┐          ┌──────────────────────┐
│   guiaseller DB      │          │     leads DB         │
│   (READ-ONLY)        │          │   (FULL CRUD)        │
├──────────────────────┤          ├──────────────────────┤
│ Users (sellers)      │          │ Leads                │
│ Products             │    ───▶  │ LeadHistory          │
│ Orders               │          │ LeadSegments         │
│ Marketplace Data     │          │ LeadScores           │
│ Browsing History     │          │ LeadEnrichment       │
│ Previous Purchases   │          │ AdminUsers           │
└──────────────────────┘          │ IntegrationEvents    │
                                   │ SyncLogs             │
                                   └──────────────────────┘
```

### Prisma Schema — Leads Database

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("LEADS_DB_URL")
}

// Core Lead Entity
model Lead {
  id                String    @id @default(cuid())
  email             String    @unique
  phone             String?
  firstName         String
  lastName          String
  avatarUrl         String?

  // Enrichment from guiaseller DB (denormalized)
  guiasellerUserId  String?   // Foreign key reference
  purchaseCount     Int       @default(0)
  browsingHistory   Json?     // Array of URLs visited

  // Scoring
  leadScore         Int       @default(0)  // 0-100
  conversionProb    Float     @default(0)  // 0-1
  scoreCalculatedAt DateTime?
  scoreReason       String?   // Why this score

  // Segmentation
  segment           String?   // 'founder', 'seller', 'buyer', etc.
  primaryMarketplace String   // 'ML', 'Shopee', 'Magalu', 'TikTok', 'Amazon', 'Shein'
  marketplaces      String[]  // Multi-select: ['ML', 'Shopee']

  // Status & Lifecycle
  status            String    @default("active")  // 'active', 'inactive', 'archived'
  lastTouchedAt     DateTime  @updatedAt
  convertedAt       DateTime?
  conversionValue   Decimal?

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  history           LeadHistory[]
  enrichment        LeadEnrichment?
  events            LeadEvent[]
  scores            LeadScore[]

  @@index([email])
  @@index([leadScore])
  @@index([segment])
  @@index([primaryMarketplace])
  @@index([status])
  @@index([createdAt])
  @@fulltext([email, firstName, lastName])  // PostgreSQL Full-Text Search
}

// Lead Enrichment (denormalized guiaseller data)
model LeadEnrichment {
  id                String    @id @default(cuid())
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId            String    @unique

  // From guiaseller.users
  companyName       String?
  website           String?
  businessType      String?   // 'individual', 'business', 'marketplace'

  // From guiaseller.orders
  totalOrderValue   Decimal   @default(0)
  orderCount        Int       @default(0)
  avgOrderValue     Decimal   @default(0)
  lastOrderAt       DateTime?

  // From guiaseller.products
  productCount      Int       @default(0)
  avgProductRating  Float?

  // Activity metrics
  pageViewCount     Int       @default(0)
  timeSpentMinutes  Int       @default(0)
  lastActiveAt      DateTime?

  // Engagement
  emailEngagement   Int       @default(0)  // % of opened emails
  clickThroughRate  Int       @default(0)  // % of clicked links

  updatedAt         DateTime  @updatedAt

  @@index([leadId])
}

// Lead History (audit trail + lifecycle events)
model LeadHistory {
  id                String    @id @default(cuid())
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId            String

  // What changed
  eventType         String    // 'created', 'scored', 'segmented', 'contacted', 'converted', 'archived'
  fieldChanged      String?   // 'segment', 'score', 'status'
  oldValue          Json?
  newValue          Json?

  // Who did it
  adminUser         AdminUser? @relation(fields: [adminUserId], references: [id], onDelete: SetNull)
  adminUserId       String?

  metadata          Json?     // Additional context

  createdAt         DateTime  @default(now())

  @@index([leadId])
  @@index([eventType])
  @@index([createdAt])
}

// Lead Events (user interactions)
model LeadEvent {
  id                String    @id @default(cuid())
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId            String

  eventType         String    // 'email_opened', 'link_clicked', 'offer_viewed', 'offer_purchased'
  marketplace       String?   // Where event occurred
  metadata          Json?     // Event-specific data (link clicked, offer ID, etc.)

  createdAt         DateTime  @default(now())

  @@index([leadId])
  @@index([eventType])
  @@index([marketplace])
  @@index([createdAt])
}

// Lead Scores (track score history for analytics)
model LeadScore {
  id                String    @id @default(cuid())
  lead              Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  leadId            String

  score             Int
  reason            String?
  components        Json?     // { engagement: 30, recency: 40, value: 30 }

  createdAt         DateTime  @default(now())

  @@index([leadId])
  @@index([score])
  @@index([createdAt])
}

// Admin Users
model AdminUser {
  id                String    @id @default(cuid())
  email             String    @unique
  firebaseUid       String    @unique

  firstName         String
  lastName          String
  avatar            String?

  role              String    @default("viewer")  // 'admin', 'manager', 'viewer'
  permissions       String[]  @default([])  // 'read:leads', 'write:leads', 'manage:users'

  isActive          Boolean   @default(true)
  lastLoginAt       DateTime?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  history           LeadHistory[]

  @@index([email])
  @@index([firebaseUid])
}

// Integration Logs
model IntegrationEvent {
  id                String    @id @default(cuid())
  marketplace       String    // 'ML', 'Shopee', 'Magalu', etc.
  eventType         String    // 'sync_started', 'sync_completed', 'lead_ingested', 'error'
  status            String    // 'success', 'pending', 'failed'
  leadCount         Int?

  errorMessage      String?
  metadata          Json?

  createdAt         DateTime  @default(now())

  @@index([marketplace])
  @@index([eventType])
  @@index([createdAt])
}

// Sync Logs
model SyncLog {
  id                String    @id @default(cuid())
  marketplace       String
  syncType          String    // 'full', 'incremental'
  status            String    // 'running', 'completed', 'failed'

  leadsProcessed    Int       @default(0)
  leadsCreated      Int       @default(0)
  leadsUpdated      Int       @default(0)

  startedAt         DateTime
  completedAt       DateTime?
  errorMessage      String?

  @@index([marketplace])
  @@index([syncType])
  @@index([status])
  @@index([startedAt])
}
```

### Firebase Realtime DB Schema (Hot Sync)

```json
{
  "leads": {
    "lead_id_1": {
      "id": "lead_id_1",
      "firstName": "João",
      "email": "joao@example.com",
      "leadScore": 85,
      "segment": "founder",
      "marketplace": "ML",
      "status": "active",
      "updatedAt": "timestamp",
      "lastTouched": "timestamp"
    }
  },
  "adminSessions": {
    "admin_user_1": {
      "isOnline": true,
      "lastSeen": "timestamp",
      "currentPage": "/leads"
    }
  },
  "syncStatus": {
    "ML": {
      "lastSync": "timestamp",
      "status": "completed",
      "leadsProcessed": 150
    }
  }
}
```

---

## 7. Segurança & Autenticação

### Authentication Flow

```
1. User (Admin) → Firebase Signin
2. Firebase → Returns ID Token
3. Frontend → Exchange for JWT (backend)
4. Backend → Verify ID Token + issue JWT
5. JWT in Authorization Header → All API calls
6. Backend → Verify JWT + Check Permissions
```

### Authorization Levels

| Role | Permissions |
|------|------------|
| **Admin** | Full CRUD on leads, manage users, view all analytics |
| **Manager** | CRUD on leads, view analytics, cannot manage users |
| **Viewer** | Read-only access to leads and analytics |

### Database Security

```sql
-- guiaseller DB: SELECT-only user
CREATE USER user_leads_readonly WITH PASSWORD '***';
GRANT CONNECT ON DATABASE guiaseller TO user_leads_readonly;
GRANT USAGE ON SCHEMA public TO user_leads_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO user_leads_readonly;

-- leads DB: Full access
CREATE USER user_leads WITH PASSWORD '***';
GRANT ALL PRIVILEGES ON DATABASE leads TO user_leads;
```

### Prisma Connection Security

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const guiasellerDB = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }  // SELECT-only
  }
});

const leadsDB = new PrismaClient({
  datasources: {
    db: { url: process.env.LEADS_DB_URL }  // Full CRUD
  }
});

// Usage
const leads = await leadsDB.lead.findMany();  // ✅ OK
const users = await guiasellerDB.user.findMany();  // ✅ OK (SELECT)
const created = await guiasellerDB.user.create();  // ❌ DENIED (no INSERT)
```

### Data Privacy

- **Anonymization:** Historical lead data after 90 days (GDPR)
- **Encryption:** PII at rest (email, phone) with AES-256
- **Rate Limiting:** 100 requests/min per IP
- **CORS:** Restrict to admin dashboard domain only
- **CSRF Protection:** Token-based on state-changing operations

---

## 8. Performance & Escalabilidade

### Frontend Performance

| Métrica | Target | Strategy |
|---------|--------|----------|
| FCP (First Contentful Paint) | < 1.5s | Code splitting, lazy load routes |
| LCP (Largest Contentful Paint) | < 2.5s | Optimize images, async scripts |
| CLS (Cumulative Layout Shift) | < 0.1 | Fixed heights, CSS containment |
| TTI (Time to Interactive) | < 3.5s | Minimize JavaScript, defer non-critical |

### Backend Performance

| Query | Optimization |
|-------|--------------|
| List leads (10K rows) | Index on (status, createdAt, leadScore); pagination; select specific columns |
| Get lead details | Index on id; eager load relations |
| Calculate score | Cache result; background job; Redis store |
| Analytics dashboard | Materialized views; batch pre-compute; cache for 1 hour |
| Full-text search | PostgreSQL FTS index; limit results to 100 |

### Caching Strategy

```typescript
// cache/leadCache.ts
const CACHE_TTL = {
  lead: 5 * 60,        // 5 minutes
  analytics: 60 * 60,  // 1 hour
  leaderboard: 24 * 60 * 60  // 24 hours
};

// Redis keys
redis.set(`lead:${leadId}`, leadData, 'EX', CACHE_TTL.lead);
redis.invalidate(`leads:*`);  // Invalidate on update
```

### Database Optimization

```sql
-- Critical indexes
CREATE INDEX idx_lead_status_created ON leads(status, created_at DESC);
CREATE INDEX idx_lead_score ON leads(lead_score DESC);
CREATE INDEX idx_lead_marketplace ON leads(primary_marketplace);
CREATE INDEX idx_lead_segment ON leads(segment);
CREATE INDEX idx_lead_enrichment ON lead_enrichment(lead_id);
CREATE INDEX idx_history_lead_event ON lead_history(lead_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_lead_fts ON leads USING GIN (to_tsvector('portuguese', email || ' ' || first_name || ' ' || last_name));
```

### API Rate Limiting

```typescript
// middleware/rateLimit.ts
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false
}));
```

### Scalability

- **Stateless API:** No sessions; use JWT
- **Horizontal Scaling:** Load balancer → multiple Node processes
- **Database Replicas:** Read replicas for analytics queries
- **Message Queue:** Bull for background jobs (sync, scoring)
- **CDN:** Cache static assets + API responses

---

## 9. Deployment & CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy guiaseller.leads

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

### Environment Configuration

```env
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://...  # SELECT-only
LEADS_DB_URL=postgres://...  # Full CRUD

# Firebase
FIREBASE_PROJECT_ID=guia-seller
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# JWT
JWT_SECRET=...
JWT_EXPIRY=7d

# Frontend
VITE_API_URL=https://api.guiaseller.leads/api/v1
VITE_FIREBASE_CONFIG={...}
```

### Monitoring & Logging

```typescript
// middleware/logging.ts
app.use(morgan(':method :url :status :response-time ms'));

// Sentry (optional)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

---

## 10. Estrutura de Pastas

```
guiaseller.leads/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts
│   │   │   ├── firebase.ts
│   │   │   └── env.ts
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimit.ts
│   │   ├── routes/               # API routes
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── analytics.ts
│   │   │   └── admin.ts
│   │   ├── services/             # Business logic
│   │   │   ├── leadService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── integrationService.ts
│   │   │   └── scoringService.ts
│   │   ├── lib/                  # Utilities
│   │   │   ├── prisma.ts
│   │   │   ├── firebase.ts
│   │   │   ├── validation.ts
│   │   │   └── cache.ts
│   │   └── types/                # TypeScript types
│   │       └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # Entry point
│   │   ├── App.tsx               # Root component
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── PageHeader.tsx
│   │   │   ├── common/           # Reusable components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Table.tsx
│   │   │   ├── leads/
│   │   │   │   ├── LeadsTable.tsx
│   │   │   │   ├── LeadFilters.tsx
│   │   │   │   ├── LeadDetail.tsx
│   │   │   │   └── LeadForm.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── KPICard.tsx
│   │   │   │   └── Charts.tsx
│   │   │   └── forms/
│   │   │       ├── LoginForm.tsx
│   │   │       └── FilterForm.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useLeads.ts
│   │   │   ├── useLeadUpdates.ts
│   │   │   └── useAuth.ts
│   │   ├── store/                # Zustand stores
│   │   │   ├── leadsStore.ts
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   ├── pages/                # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leads.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Login.tsx
│   │   ├── services/
│   │   │   ├── api.ts            # HTTP client (TanStack Query)
│   │   │   ├── firebase.ts       # Firebase config
│   │   │   └── auth.ts
│   │   ├── styles/
│   │   │   ├── globals.css       # Tailwind + custom
│   │   │   └── themes.css        # Dark mode
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── constants.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── components/
│   │   └── integration/
│   ├── public/
│   │   └── (static assets)
│   ├── .env.example
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── architecture/
│   │   ├── FULLSTACK-ARCHITECTURE.md (este arquivo)
│   │   ├── DATABASE-SCHEMA.md
│   │   ├── API-DESIGN.md
│   │   └── DEPLOYMENT.md
│   ├── design/
│   │   └── DESIGN-SYSTEM.md (referência do design-system/)
│   └── guides/
│       ├── SETUP.md
│       ├── CONTRIBUTING.md
│       └── DEBUGGING.md
│
├── design-system/
│   ├── brand-guidelines.md
│   ├── tokens.ts
│   ├── icon-inventory.ts
│   ├── CodeBlock.tsx
│   ├── ExampleHeader.tsx
│   ├── ExamplePlans.tsx
│   ├── ExampleSidebar.tsx
│   └── ExampleSignIn.tsx
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── deploy.yml
│       └── pr-checks.yml
│
├── .env.example
├── README.md
├── ROADMAP.md
└── package.json (workspace root)
```

---

## 11. Checklist de Implementação

### Fase 1: Setup Inicial ✓
- [ ] Repository setup (Git, GitHub, branch protection)
- [ ] Environment variables (.env)
- [ ] Node.js + package managers (npm/pnpm/yarn)
- [ ] TypeScript configuration
- [ ] ESLint + Prettier

### Fase 2: Backend Foundation
- [ ] Express/Fastify app structure
- [ ] Prisma setup (dual database)
- [ ] Database migrations (schema.prisma)
- [ ] Firebase Admin SDK integration
- [ ] JWT authentication middleware
- [ ] Error handling + logging

### Fase 3: Core API Routes
- [ ] Auth endpoints (signin, signup, refresh)
- [ ] Leads CRUD endpoints
- [ ] Lead scoring service
- [ ] Lead segmentation service
- [ ] Analytics endpoints (basic)

### Fase 4: Database Integration
- [ ] guiaseller DB connections (SELECT-only)
- [ ] leads DB connections (full CRUD)
- [ ] Prisma client instances
- [ ] Query optimization + indexes
- [ ] Migration pipeline

### Fase 5: Frontend Foundation
- [ ] React + Vite setup
- [ ] Tailwind CSS + design system
- [ ] TanStack Router setup
- [ ] Firebase JS SDK
- [ ] TanStack Query configuration
- [ ] Zustand stores

### Fase 6: Frontend Pages
- [ ] Login page
- [ ] Dashboard overview
- [ ] Leads table + filters
- [ ] Lead detail view
- [ ] Analytics dashboard
- [ ] Settings page

### Fase 7: Real-Time Features
- [ ] Firebase Realtime DB sync
- [ ] WebSocket listeners (optional)
- [ ] Dashboard live updates
- [ ] Lead status notifications

### Fase 8: Testing & QA
- [ ] Unit tests (backend services)
- [ ] Integration tests (API endpoints)
- [ ] Component tests (React components)
- [ ] E2E tests (critical user flows)
- [ ] Performance testing

### Fase 9: Deployment & CI/CD
- [ ] GitHub Actions workflows
- [ ] Railway/Vercel setup
- [ ] Database migrations (production)
- [ ] Environment secrets
- [ ] Monitoring + logging

### Fase 10: Documentation & Launch
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] User manual (admin)
- [ ] Contributing guide
- [ ] Monitoring dashboard

---

## Próximos Passos

1. ✅ **Essa arquitetura aprovada** → Proceed to Phase 2
2. **@data-engineer** → Refine Prisma schema + migrations
3. **@ux-design-expert** → Create Figma design from components
4. **@dev** → Implement backend + frontend in parallel
5. **@qa** → Testing strategy + quality gates
6. **@devops** → CI/CD + deployment automation

---

**Status:** Draft ready for team review
**Last Updated:** 26/02/2026
**Next Review:** Post-implementation validation

