# GuiaSeller Leads — Quick Start

## Architecture

```
guiaseller.leads/
├── src/               # Discord bots + webhook handler (port 3000)
├── backend/           # Leads API — Express + Prisma (port 3001)
├── frontend/          # Admin panel — React + Vite (port 5173)
├── shared/types/      # Shared TypeScript types
└── docs/              # PRD, architecture, stories
```

## Prerequisites

- Node.js 18+
- Access to PostgreSQL at `easypanel.guiaseller.com:62345`
- Firebase project `guia-seller` (for auth)

## Setup

```bash
# 1. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Generate Prisma client
cd backend && npx prisma generate && cd ..

# 3. Apply schema to leads DB (CREATE permission required on schema public)
cd backend && npx prisma db push && cd ..

# 4. (Optional) Seed minimal admin user
npm run db:seed

# 5. Trigger real-data sync from guiaseller DB
# Via script (direct):
cd backend && npx tsx src/services/syncService.ts && cd ..
# Via API (after server is running):
# POST http://localhost:3001/api/v1/admin/sync  [Authorization: Bearer <jwt>]
```

## Development

```bash
# Start API server (port 3001)
npm run dev:api

# Start frontend dev server (port 5173)
npm run dev:web

# Start both simultaneously
npm run dev:all

# Start Discord bots + webhook (port 3000)
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/signin` | Firebase token → JWT |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/leads` | List leads (paginated, filterable) |
| GET | `/api/v1/leads/:id` | Lead detail |
| POST | `/api/v1/leads` | Create lead manually |
| PATCH | `/api/v1/leads/:id` | Update lead |
| DELETE | `/api/v1/leads/:id` | Archive lead |
| POST | `/api/v1/leads/:id/score` | Recalculate lead score |
| POST | `/api/v1/leads/:id/segment` | Recalculate lead segment |
| POST | `/api/v1/leads/bulk` | Bulk archive/activate/rescore |
| GET | `/api/v1/analytics/*` | KPIs, marketplace, segments, funnel |
| GET | `/api/v1/admin/users` | Admin users (admin only) |
| POST | `/api/v1/admin/sync` | Trigger guiaseller → leads sync |
| GET | `/api/v1/admin/sync/status` | Last sync log + counts per segment |

## Database

Two PostgreSQL databases on the same server:

- **guiaseller** (`DATABASE_URL`) — READ-ONLY, source data
- **leads** (`LEADS_DB_URL`) — FULL CRUD, our application data

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 4, TypeScript, Prisma ORM, Zod, JWT |
| Frontend | React 18, Vite, TanStack Query, Tailwind CSS, Zustand |
| Auth | Firebase Auth → JWT exchange |
| Database | PostgreSQL (dual, via Prisma) |
| Deploy | Railway (backend) + Vercel (frontend) |
