# GuiaSeller Leads — Product Requirements Document (PRD)

> **Version:** 1.0
> **Status:** Draft — Ready for Stakeholder Review
> **Created by:** Morgan (PM) — 26/02/2026
> **Last Updated:** 26/02/2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Market Context & Opportunity](#3-market-context--opportunity)
4. [Product Goals & Success Metrics](#4-product-goals--success-metrics)
5. [User Research & Personas](#5-user-research--personas)
6. [User Stories & Flows](#6-user-stories--flows)
7. [Feature Specification](#7-feature-specification)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Competitive Differentiation](#9-competitive-differentiation)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Dependency & Risk Analysis](#11-dependency--risk-analysis)
12. [Success Criteria & Launch Plan](#12-success-criteria--launch-plan)

---

## 1. Executive Summary

### What is guiaseller.leads?

**guiaseller.leads** is an **internal lead intelligence platform** for GuiaSeller's administrative team. It centralizes, enriches, and tracks the complete lifecycle of leads from initial contact through conversion to active subscriber, with AI-powered personalization and lead scoring.

### Problem Statement

**Current State:**
- Leads scattered across multiple marketplaces (Mercado Livre, Shopee, Magalu, TikTok, Amazon, Shein)
- No unified view of lead quality or conversion probability
- Manual lead segmentation causing inefficient targeting
- Limited historical data on lead interactions and purchasing behavior
- No AI-driven insights for optimal contact timing or offer matching

**Impact:**
- Lower conversion rates due to poor lead prioritization
- Wasted time on low-quality leads
- Missed upsell opportunities
- No data-driven insights for strategy improvement

### Solution Overview

A centralized **lead intelligence dashboard** that:
1. **Aggregates** leads from all marketplace sources
2. **Enriches** lead data with internal purchase history and browsing behavior
3. **Scores** leads based on conversion probability (0-100)
4. **Segments** leads by marketplace, persona, and purchase stage
5. **Personalizes** offer recommendations using AI
6. **Tracks** complete lead lifecycle with audit trail
7. **Analyzes** trends and conversion patterns

### Key Differentiators

| vs AdminPanel (/admin) | guiaseller.leads |
|---|---|
| Generic user admin | Specialized for lead management |
| No lead scoring | AI-powered lead scoring (0-100) |
| Manual tagging | Automatic segmentation + personalization |
| No marketplace context | Marketplace-specific insights |
| No lifecycle tracking | Complete lead history & audit trail |
| No real-time updates | Firebase real-time sync |

### Expected Business Impact

- **30-40% improvement** in lead conversion rate (through prioritization)
- **50% reduction** in time spent on lead management (automation)
- **2-3x higher** ROI on marketing spend (better targeting)
- **Real-time visibility** into lead quality metrics

---

## 2. Product Vision & Mission

### Vision Statement

> **To become the intelligence backbone of GuiaSeller's lead ecosystem — transforming raw marketplace leads into strategic assets through AI-powered insights, real-time personalization, and data-driven decision-making.**

### Mission Statement

> **Empower GuiaSeller's admin team to maximize lead conversion and customer lifetime value by providing unified, intelligent, and actionable lead insights.**

### Core Values

1. **Data-Driven Decisions** — Every action backed by metrics and insights
2. **Real-Time Visibility** — Instant updates on lead status and engagement
3. **User-Centric Design** — Dashboard designed for admin efficiency
4. **Scalability** — Built to handle 1M+ leads without performance degradation
5. **Integration-First** — Seamless integration with existing GuiaSeller ecosystem
6. **Privacy & Security** — GDPR-compliant data handling with encryption

---

## 3. Market Context & Opportunity

### Industry Context

**Lead Management Software Market:**
- Global market: $18B+ (2024)
- CAGR: 12-15% (2024-2030)
- Key players: HubSpot, Pipedrive, Zoho, Marketo

**GuiaSeller's Position:**
- 50K+ daily marketplace leads
- 3 primary marketplaces (ML, Shopee, Magalu) + 3 emerging (TikTok, Amazon, Shein)
- Growing need for lead prioritization as volume increases

### Addressable Market

- **Primary:** GuiaSeller internal operations (team of 10-20 admins)
- **Secondary (Future):** Marketplace sellers using GuiaSeller tools
- **TAM (Total Addressable Market):** 100K+ sellers in GuiaSeller ecosystem

### Strategic Opportunity

**Phase 1 (MVP):** Internal admin tool → Proves concept, generates insights
**Phase 2 (2026):** White-label for top sellers → Revenue stream
**Phase 3 (2027):** API-first platform for marketplace integrations → B2B SaaS

---

## 4. Product Goals & Success Metrics

### OKRs (Q1 2026 - Q4 2026)

#### Objective 1: Maximize Lead Conversion Efficiency
- **KR1.1:** Increase admin team's lead conversion rate from 12% → 18% (50% improvement)
- **KR1.2:** Reduce average time per lead from 15min → 7min (automation)
- **KR1.3:** Improve lead quality score distribution (70% of leads > 60 score)

#### Objective 2: Establish Real-Time Lead Intelligence
- **KR2.1:** 95%+ uptime of dashboard
- **KR2.2:** < 2sec latency for lead updates (real-time sync)
- **KR2.3:** 100% of marketplace leads indexed within 2 hours of capture

#### Objective 3: Drive Data-Driven Decision Making
- **KR3.1:** Weekly analytics reports with trend insights
- **KR3.2:** Segment-specific conversion rates tracked and optimized
- **KR3.3:** Lead scoring model accuracy > 85% (predictive)

#### Objective 4: Build Foundation for Marketplace-Specific Targeting
- **KR4.1:** Support all 6 marketplaces (ML, Shopee, Magalu, TikTok, Amazon, Shein)
- **KR4.2:** Marketplace-specific scoring weights implemented
- **KR4.3:** Marketplace-specific personalization engine live

### Success Metrics (North Star)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Conversion Rate** | 18% (from 12%) | Monthly: unique leads / converted leads |
| **Lead Quality Score** | 70% leads > 60pts | Distribution of lead scores |
| **Admin Efficiency** | 7min/lead (from 15min) | Time tracking in dashboard |
| **Dashboard Uptime** | 99.9% | Automated monitoring |
| **Real-Time Latency** | < 2sec | Firebase sync metrics |
| **Lead Indexing Time** | < 2 hours | From capture to searchable |
| **Score Accuracy** | > 85% | Validation against actual conversions |
| **Admin Satisfaction** | > 4.5/5 | Monthly surveys |

---

## 5. User Research & Personas

### Target Users

**Primary:** GuiaSeller administrative team (10-20 users)
- Role: Lead processor, account manager, business analyst
- Goal: Convert leads to customers efficiently
- Pain point: Too many leads, hard to prioritize
- Tech level: Intermediate to advanced

### User Persona 1: Carlos (The Lead Manager)

- **Role:** Lead Processing Manager
- **Experience:** 3 years managing GuiaSeller leads
- **Tech Skill:** Intermediate (Excel, basic SQL)
- **Goals:**
  - Process 200+ leads/day efficiently
  - Identify high-value leads quickly
  - Understand why certain leads convert
- **Pain Points:**
  - Manual lead assessment takes 15+ minutes per lead
  - No visibility into lead quality before contacting
  - No data on which marketplace sources perform best
- **Success Outcome:** Dashboard with auto-scored leads, 1-click filtering by quality

### User Persona 2: Beatriz (The Business Analyst)

- **Role:** Lead Analytics & Optimization
- **Experience:** 2 years with GuiaSeller, background in data
- **Tech Skill:** Advanced (SQL, basic Python, Tableau)
- **Goals:**
  - Identify conversion trends and patterns
  - Optimize lead targeting by marketplace
  - Build predictive models for lead quality
- **Pain Points:**
  - Monthly reports require manual data pulls
  - No historical trend analysis
  - Segmentation rules are static and outdated
- **Success Outcome:** Real-time analytics dashboard, exportable datasets, predictive insights

### User Persona 3: Roberto (The Director)

- **Role:** Operations Director
- **Experience:** 8 years at GuiaSeller, executive level
- **Tech Skill:** Low (uses dashboard-style tools)
- **Goals:**
  - Understand team productivity and conversion metrics
  - Make data-driven decisions on resource allocation
  - Monitor system health and bottlenecks
- **Pain Points:**
  - Weekly status reports lack insights
  - No visibility into team performance metrics
  - Cannot quickly identify problems or opportunities
- **Success Outcome:** Executive dashboard with KPIs, alerts for anomalies

---

## 6. User Stories & Flows

### User Story 1: Carlos Views and Filters High-Value Leads

**As a** Lead Manager,
**I want to** view all leads sorted by quality score,
**So that** I can prioritize my outreach efforts.

**Acceptance Criteria:**
- [ ] Dashboard loads with leads table in < 2 seconds
- [ ] Default sort is by lead score (highest first)
- [ ] Can filter by: marketplace, score range, segment, date range
- [ ] Table shows: name, email, score, marketplace, segment, last touched
- [ ] Can bulk-select and bulk-action (archive, re-segment, export)

**Main Flow:**
1. User logs into dashboard
2. Sees 200 leads sorted by score (85, 79, 72...)
3. Filters: marketplace=ML, score>=70
4. Gets 45 high-value leads
5. Clicks "Contact Selected" → Opens bulk email tool

---

### User Story 2: Beatriz Analyzes Conversion Trends by Marketplace

**As a** Business Analyst,
**I want to** see conversion rate trends by marketplace,
**So that** I can identify which marketplaces are most profitable.

**Acceptance Criteria:**
- [ ] Analytics page shows 6 charts (one per marketplace)
- [ ] Each chart shows conversion rate over time (7d, 30d, 90d views)
- [ ] Can toggle between: conversion rate, lead quality, volume
- [ ] Can export data as CSV for deeper analysis
- [ ] Real-time data reflects leads from last 24 hours

**Main Flow:**
1. User navigates to Analytics
2. Sees: ML 18% conversion, Shopee 15%, Magalu 12%...
3. ML trending up (+2% vs last week)
4. Clicks ML chart to see lead details
5. Exports data to analyze why ML is outperforming

---

### User Story 3: Roberto Reviews Executive KPI Dashboard

**As a** Director,
**I want to** see key metrics at a glance (conversion, volume, quality),
**So that** I can understand team performance and make strategic decisions.

**Acceptance Criteria:**
- [ ] Dashboard loads with 5 metric cards: conversion rate, new leads, avg score, qualified %, quality trend
- [ ] Each card shows current value + trend (↑↓) vs previous period
- [ ] Can switch between: today, this week, this month, this quarter
- [ ] Alerts trigger if conversion drops > 5% or system downtime occurs
- [ ] Can access detailed drill-down for each metric

**Main Flow:**
1. User opens dashboard
2. Sees: Conversion 18% ↑, New Leads 1,240 ↓, Avg Score 71 ↑
3. Notices: Quality Trend ↑ (good), but Volume ↓ (investigate)
4. Clicks Volume metric
5. Sees: Shopee leads down 20% (technical issue? marketplace change?)
6. Escalates to tech team if needed

---

### User Story 4: System Auto-Scores and Segments New Leads

**As a** Lead Scoring Engine,
**I want to** automatically score each lead 0-100 based on: purchase history, browsing behavior, engagement, marketplace profile,
**So that** Admins can prioritize high-value leads without manual assessment.

**Acceptance Criteria:**
- [ ] New lead arrives from marketplace
- [ ] System pulls enrichment data from guiaseller DB (purchase history, etc.)
- [ ] Calculates score using weighted factors:
  - Purchase value history: 30%
  - Browsing frequency: 25%
  - Product interest match: 25%
  - Engagement (email opens, clicks): 20%
- [ ] Assigns segment: founder, seller, buyer, heavy-user
- [ ] Updates Firebase in < 5 seconds
- [ ] Admin sees updated score in dashboard instantly

**Main Flow:**
1. Lead submitted from Mercado Livre
2. System queries: `SELECT purchase_history, browsing, engagement FROM guiaseller WHERE email=?`
3. Calculates: score = (history×0.3) + (browsing×0.25) + (interest×0.25) + (engagement×0.2)
4. Result: 76 (High) | Segment: Heavy User
5. Firebase syncs to dashboard
6. Carlos sees new lead appear with score 76

---

### User Story 5: AI Recommends Best Offer for High-Value Lead

**As a** Personalization Engine,
**I want to** analyze lead profile and recommend optimal offer/discount,
**So that** Admin can maximize conversion probability.

**Acceptance Criteria:**
- [ ] When admin clicks "View Recommendations" on lead detail:
  - [ ] System analyzes: purchase history, browsing patterns, competitor pricing
  - [ ] Recommends: Best product category, optimal discount (5-30%), best contact timing
  - [ ] Shows conversion probability if offer accepted
- [ ] Example: "Lead Carlos is 78% likely to convert if offered 15% discount on Shopify Premium on Tuesday 2pm"

**Main Flow:**
1. Admin opens lead detail: João Silva, score 85
2. Clicks "AI Recommendations"
3. System analyzes profile:
   - Purchased Shopify starter 2 months ago
   - Browsing Shopify advanced features daily
   - Email opens: 80% (highly engaged)
4. Recommendation: "Upgrade to Shopify Pro - 15% discount - Contact Tuesday 2pm for 81% conversion likelihood"
5. Admin sends offer via platform
6. Conversion tracked in history

---

## 7. Feature Specification

### Phase 1 (MVP) — Core Intelligence

#### 1.1 Lead Dashboard
- **Leads Table**: All leads with sortable/filterable columns
  - Columns: Name, Email, Marketplace, Score, Segment, Status, Last Touched
  - Sorting: By score (default), date, marketplace, conversion
  - Filtering: Score range, marketplace, segment, status, date range
  - Pagination: 50 / 100 / 250 leads per page
  - Bulk actions: Archive, re-segment, export, send offer

#### 1.2 Lead Detail View
- **Profile Card**: Name, email, phone, marketplace, company (if business)
- **Score & Segment**: Visual gauge (0-100), segment badge
- **Enrichment Data**: Purchase history, browsing activity, previous interactions
- **Engagement Timeline**: Events chronologically (email opened, link clicked, offer viewed, etc.)
- **Lead History**: All status changes, notes, actions taken
- **Actions Panel**: Update segment, recalculate score, send offer, archive

#### 1.3 Lead Scoring
- **Auto-Scoring**: On lead creation or periodic recalc
- **Scoring Model**: Weighted factors (purchase history 30%, browsing 25%, interest 25%, engagement 20%)
- **Score Display**: Visual gauge (0-100) with color coding (red <30, yellow 30-70, green >70)
- **Score History**: Track score changes over time for trend analysis

#### 1.4 Lead Segmentation
- **Auto-Segmentation**: Based on behavior and marketplace
- **Segments**: founder, seller, buyer, heavy-user, inactive
- **Marketplace-Specific**: ML-founder, Shopee-seller, etc.
- **Manual Override**: Admin can manually reassign segment

#### 1.5 Analytics Dashboard
- **KPI Cards**: Conversion rate, new leads (24h), avg score, quality %, growth trend
- **Conversion Funnel**: Leads → Contacted → Interested → Converted (by stage)
- **Lead Quality Distribution**: Chart showing % of leads in each score range
- **Marketplace Comparison**: Conversion rate by marketplace (bar chart)
- **Timeline**: Conversion rate trend (7d, 30d, 90d)
- **Exportable**: Download data as CSV

#### 1.6 Search & Filter
- **Full-Text Search**: Search by name, email, phone, company
- **Advanced Filters**: Marketplace, score range, segment, status, date range, engagement level
- **Saved Filters**: Save filter combinations for reuse
- **Quick Filters**: "High-Value Leads" (>70), "New Today", "Inactive", "Conversion Ready"

#### 1.7 Real-Time Updates
- **Firebase Sync**: Lead changes sync to dashboard in < 2 seconds
- **Live Badges**: Admin count, notification count update in real-time
- **Presence**: Shows which admins are currently viewing dashboard

### Phase 2 (Post-MVP) — AI Personalization

#### 2.1 Lead Scoring AI
- **Predictive Model**: ML model trained on historical conversion data
- **Accuracy**: > 85% precision on conversion prediction
- **Retraining**: Monthly automated retraining on new conversion data
- **Explainability**: Show top 3 factors contributing to score

#### 2.2 Offer Recommendation
- **Recommendation Engine**: Analyze lead profile and recommend:
  - Best product category for lead
  - Optimal discount (5-30% range)
  - Best contact timing (day + hour)
  - Conversion probability if offer accepted
- **A/B Testing**: Track which recommendations convert best

#### 2.3 Churn Prediction
- **Early Warning**: Flag leads at risk of churn
- **Intervention**: Recommend re-engagement offers
- **Lifecycle Stage**: Classify lead as: consideration, trial, mature, at-risk

### Phase 3 (Growth) — Scale & Integration

#### 3.1 Marketplace Expansion
- **New Marketplaces**: Add TikTok, Amazon, Shein marketplace-specific features
- **API Integration**: Auto-sync leads from all 6 marketplaces
- **Webhook Ingestion**: Real-time lead capture from marketplace webhooks

#### 3.2 Admin Tools
- **User Management**: Add/remove admins, assign roles (admin, manager, viewer)
- **Permission Levels**: Read-only vs full CRUD by user role
- **Audit Logs**: Track all admin actions for compliance

#### 3.3 Export & Reporting
- **Scheduled Reports**: Email weekly/monthly conversion reports
- **Custom Reports**: Build custom report builder
- **API Access**: Expose leads data via REST API for external tools

---

## 8. Non-Functional Requirements

### Performance
- **Dashboard Load Time**: < 2 seconds (initial load)
- **Lead Table Pagination**: < 500ms (50-250 rows)
- **Search**: < 1 second (full-text index)
- **Real-Time Sync**: < 2 seconds (Firebase updates)
- **Analytics Queries**: < 5 seconds (materialized views)

### Scalability
- **Lead Volume**: Support 1M+ leads without performance degradation
- **Concurrent Users**: 20+ simultaneous admins
- **Database**: Horizontal read replicas for analytics
- **API**: Stateless, horizontally scalable, load-balanced

### Reliability
- **Uptime**: 99.9% (43.2 minutes downtime/month)
- **Data Backup**: Daily backups, 90-day retention
- **Disaster Recovery**: RTO 4 hours, RPO 1 hour
- **Error Handling**: User-friendly error messages, no technical jargon

### Security
- **Authentication**: Firebase Auth + JWT
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS for transit, AES-256 for sensitive data at rest
- **Data Privacy**: GDPR-compliant, PII anonymization after 90 days
- **Rate Limiting**: 100 requests/minute per IP
- **Database Security**: SELECT-only user for guiaseller DB, full CRUD for leads DB

### Accessibility
- **WCAG 2.1 AA**: Compliant with web accessibility standards
- **Dark Mode**: Full support for dark mode
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader**: Semantic HTML for screen reader compatibility

### Internationalization
- **Language**: Portuguese (primary), English (future)
- **Currencies**: BRL (primary), USD (future)
- **Formatting**: Locale-specific date/number formatting

---

## 9. Competitive Differentiation

### vs HubSpot Lead Management

| Feature | HubSpot | guiaseller.leads |
|---------|---------|------------------|
| Cost | $50-5000/month | Internal tool (free) |
| Lead Scoring | Basic (limited) | AI-powered + marketplace-specific |
| Marketplace Integration | Limited | Native 6-marketplace sync |
| Real-Time Sync | API-based | Firebase real-time |
| Customization | Low | High (internal tool) |
| Setup Time | Weeks | Days |

### vs Pipedrive

| Feature | Pipedrive | guiaseller.leads |
|---------|-----------|------------------|
| Focus | Sales CRM | Lead Intelligence |
| Learning Curve | Steep | Low (admin-focused) |
| Marketplace Integration | None | All 6 GuiaSeller marketplaces |
| Personalization | Minimal | AI-driven recommendations |
| Real-Time Insights | Limited | Full real-time analytics |

### Unique Selling Points (USPs)

1. **Marketplace-Native**: Built for multi-marketplace sellers (not generic CRM)
2. **AI Personalization**: Every lead gets personalized offer recommendations
3. **Real-Time Intelligence**: Firebase sync for instant dashboard updates
4. **Internal Integration**: Deep integration with guiaseller.back/front ecosystem
5. **Cost**: Zero licensing cost (internal tool)
6. **Privacy**: Full control over data (no 3rd party vendor risk)

---

## 10. Implementation Roadmap

### Phase 1: MVP (8 weeks) — Q1 2026

**Goal:** Launch internal beta with core intelligence features

**Milestones:**

| Week | Epic | Deliverable |
|------|------|------------|
| 1-2 | Infrastructure | DB schema, API setup, Firebase config |
| 2-3 | Authentication | Login, JWT auth, role-based access |
| 3-4 | Lead Ingestion | Marketplace sync, data enrichment, scoring |
| 4-5 | Dashboard UI | Table, filters, detail view, actions |
| 5-6 | Analytics | KPI cards, charts, trend analysis |
| 6-7 | Real-Time Sync | Firebase integration, live updates |
| 7-8 | Testing & Launch | QA, performance testing, internal beta launch |

**Team:**
- Backend: 2 devs
- Frontend: 2 devs
- QA: 1 tester
- PM: 1 (Morgan)

**Budget Estimate:** 160 engineer-hours ($8,000-12,000 depending on rates)

---

### Phase 2: AI Personalization (6 weeks) — Q2 2026

**Goal:** Launch predictive lead scoring and offer recommendations

**Milestones:**

| Week | Epic | Deliverable |
|------|------|------------|
| 1-2 | ML Model | Build/train lead scoring model, 85%+ accuracy |
| 2-3 | Recommendation API | Offer recommendation engine |
| 3-4 | UI Integration | Add AI insights to lead detail view |
| 4-5 | A/B Testing | Track recommendation effectiveness |
| 5-6 | Optimization | Retrain model, optimize recommendations |

**Team:** 2 backend devs, 1 ML engineer, 1 frontend dev

**Budget:** $10,000-15,000

---

### Phase 3: Scale & Growth (ongoing) — Q3+ 2026

**Goal:** Expand marketplace support, add admin tools, prepare for B2B offering

**Roadmap:**
- Q3: User management, audit logs, custom reports
- Q4: TikTok, Amazon, Shein integration + API
- 2027+: White-label offering for marketplace sellers

---

## 11. Dependency & Risk Analysis

### Critical Dependencies

| Dependency | Owner | Risk | Mitigation |
|-----------|-------|------|-----------|
| guiaseller.back data access | Backend team | Data access delays | Early coordination, test accounts |
| Firebase project setup | DevOps | Configuration errors | Pre-setup checklist, documentation |
| Marketplace APIs | Marketplace teams | Rate limits, outages | Fallback queuing, error handling |
| Team availability | HR | Resource constraints | Early communication, prioritization |

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Dual DB complexity** | Medium | High | Careful Prisma setup, early testing |
| **Real-time sync lag** | Low | High | Firebase optimization, Redis caching |
| **Marketplace API changes** | Medium | Medium | Abstraction layer, monitoring |
| **Data volume growth** | High | Medium | Index optimization, query caching |
| **Security breach** | Low | Critical | Encryption, GDPR compliance, audits |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Low admin adoption** | Medium | High | User research, training, UX focus |
| **Scoring inaccuracy** | Medium | Medium | Continuous model improvement, A/B testing |
| **Integration complexity** | High | Medium | Phased rollout, fallback to manual |
| **Resource constraints** | Medium | High | Clear prioritization, phased approach |

---

## 12. Success Criteria & Launch Plan

### Launch Criteria (MVP)

**Technical:**
- [ ] 99.9% API uptime (7-day baseline)
- [ ] Dashboard load time < 2s (p95)
- [ ] All 6 marketplaces syncing leads
- [ ] Real-time updates < 2s latency
- [ ] Zero critical bugs (P0)

**Business:**
- [ ] 100% of admin team trained
- [ ] 95%+ adoption rate (daily active users)
- [ ] > 4/5 user satisfaction score
- [ ] Conversion rate improvement > 10%

**Quality:**
- [ ] 80%+ test coverage (unit + integration)
- [ ] CodeRabbit review: zero CRITICAL issues
- [ ] Security audit: zero vulnerabilities
- [ ] Accessibility: WCAG 2.1 AA compliant

### Launch Timeline

**Pre-Launch (Week 7-8):**
1. Internal testing with Carlos, Beatriz, Roberto
2. Feedback incorporation + bug fixes
3. Documentation + training materials
4. Staging environment validation

**Launch Day:**
1. Deploy to production
2. Email announcement to admin team
3. Kick-off training session
4. On-call support (24/7 for first week)

**Post-Launch (Weeks 9+):**
1. Daily monitoring + support
2. Weekly feedback sessions
3. Rapid iteration on top pain points
4. Plan Phase 2 AI features

### Success Metrics (First 30 Days)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Conversion Rate | +15% | 12% | 🔄 Monitor |
| Lead Processing Time | < 7min | 15min | 🔄 Monitor |
| Dashboard Usage | 95% daily active | 0% (new) | 🔄 Track |
| User Satisfaction | > 4/5 | N/A | 🔄 Survey |
| System Uptime | 99.9% | N/A | 🔄 Monitor |

---

## Appendix A: Feature Priority Matrix (MoSCoW)

### MUST HAVE (MVP)
- ✅ Lead table with scoring + segmentation
- ✅ Dashboard with KPI metrics
- ✅ Real-time Firebase sync
- ✅ Lead detail view + history
- ✅ Basic filtering + search
- ✅ User authentication + RBAC
- ✅ Bulk actions (archive, export)

### SHOULD HAVE (Phase 2)
- 🟡 AI offer recommendations
- 🟡 Predictive lead scoring
- 🟡 Custom reports + scheduling
- 🟡 User management admin panel

### COULD HAVE (Phase 3)
- 🔵 API access for external tools
- 🔵 Marketplace-specific features (TikTok, Amazon, Shein)
- 🔵 Churn prediction
- 🔵 Mobile app

### WON'T HAVE (Out of Scope)
- ❌ Sales pipeline management
- ❌ Email campaign automation
- ❌ Customer support tickets
- ❌ Billing/payment processing

---

## Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **Lead** | Prospect interested in GuiaSeller products/services |
| **Lead Score** | Numerical value (0-100) indicating conversion likelihood |
| **Segment** | Category of lead (founder, seller, buyer, heavy-user, inactive) |
| **Marketplace** | Platform where lead originated (ML, Shopee, Magalu, TikTok, Amazon, Shein) |
| **Enrichment** | Adding purchase/behavioral data from guiaseller DB |
| **Conversion** | Lead becoming paying subscriber |
| **Real-Time Sync** | Firebase syncing lead updates to dashboard instantly |
| **RBAC** | Role-Based Access Control (admin, manager, viewer permissions) |
| **MoSCoW** | Prioritization method: Must, Should, Could, Won't have |

---

## Appendix C: Success Stories (Projected)

### Story 1: Carlos Saves 2 Hours/Day

**Before:** Processing 200 leads/day took 3 hours (manual scoring)
**After:** Auto-scoring + dashboard filtering → 1 hour
**Impact:** +2 hours for high-value lead outreach

### Story 2: Beatriz Discovers ML Opportunity

**Insight:** Dashboard shows ML converting at 22% vs Shopee 15%
**Action:** Shifts resources to ML sourcing
**Impact:** +30% quarterly revenue from optimized allocation

### Story 3: Roberto Makes Faster Decisions

**Before:** Weekly reports took 2 days to compile
**After:** Real-time dashboard with trends
**Impact:** Can respond to issues within hours, not days

---

**Document Status:** Ready for Stakeholder Review
**Next Step:** Approval → Proceed to Epic Breakdown (by @sm)

