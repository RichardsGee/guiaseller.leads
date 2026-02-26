# GuiaSeller Leads — Arquitetura e Planejamento Técnico

> **Documento de referência para a equipe de desenvolvimento do `guiaseller.leads`**
> Versão 2.0 — 26/02/2026
> Baseado em análise direta dos repositórios `guiaseller.back` e `guiaseller.front`

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Princípios da Plataforma](#2-princípios-da-plataforma)
3. [Ciclo de Vida do Lead](#3-ciclo-de-vida-do-lead)
4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)
5. [Banco de Dados Dedicado](#5-banco-de-dados-dedicado)
6. [Schema Prisma Proposto](#6-schema-prisma-proposto)
7. [Perfil com Dados Internos](#7-perfil-com-dados-internos)
8. [IA Generativa para Personalização](#8-ia-generativa-para-personalização)
9. [Lead Score e Qualidade de Conversão](#9-lead-score-e-qualidade-de-conversão)
10. [Conversão Personalizada por Lead](#10-conversão-personalizada-por-lead)
11. [Painel Admin Interno (guiaseller.leads front)](#11-painel-admin-interno-guiaselllerleads-front)
12. [Segmentação e Filtros](#12-segmentação-e-filtros)
13. [Integrações com o Ecossistema Atual](#13-integrações-com-o-ecossistema-atual)
14. [Stack e Estrutura de Pastas](#14-stack-e-estrutura-de-pastas)
15. [Roadmap de Implementação](#15-roadmap-de-implementação)
16. [Critérios de Sucesso](#16-critérios-de-sucesso)

---

## 1. Visão Geral

O `guiaseller.leads` é uma **plataforma interna de inteligência de leads** exclusiva para o time administrativo do GuiaSeller. Seu objetivo é centralizar, enriquecer e acompanhar o ciclo de vida de cada lead — desde o primeiro contato anônimo até a conversão em assinante ativo e sua retenção de longo prazo.

### Diferença do AdminPanel atual

| AdminPanel (guiaseller.front `/admin`) | guiaseller.leads (novo projeto) |
|---|---|
| Monitora usuários online em tempo real | Monitora todo o funil — inclusive antes do cadastro |
| Impersonation para suporte | Conversão e nutrição individualizadas |
| Ausência de histórico de comportamento estruturado | Histórico completo com timeline de eventos |
| Sem scoring ou qualidade de lead | Lead Score + Conversion Quality Score |
| Sem geração de conteúdo | IA gera emails, WhatsApp e notificações personalizados por lead |
| Sem segmentação por perfil | Segmentação por marketplace, comportamento, estágio no funil |

### O que esta plataforma **não é**

- Não é um CRM externo (é nossa, integrada ao nosso ecossistema)
- Não substitui o banco principal do `guiaseller.back`
- Não é acessível para os usuários finais — é **somente interna**

---

## 2. Princípios da Plataforma

1. **Banco separado** — O `guiaseller.leads` roda em um banco PostgreSQL exclusivo, paralelo ao banco principal. Nunca lê diretamente do banco de produção via ORM. Consome dados exclusivamente via API REST/webhooks ou sincronização agendada.

2. **Não-intrusivo** — Não existe nenhuma migration ou alteração nos projetos `guiaseller.back` ou `guiaseller.front` para a plataforma de leads funcionar. Tudo é read-only via endpoints existentes.

3. **Dados internos como fonte de verdade** — O perfil de cada lead é construído 100% a partir dos dados já existentes no ecossistema GuiaSeller (usuário, assinatura, integrações, comportamento no app, Firebase presence, eventos de pagamento do Asaas). Não há dependência de APIs externas na fase inicial.

4. **IA generativa para personalização** — Um motor de IA (OpenAI / Anthropic) usa o contexto completo do lead para gerar emails, mensagens WhatsApp, notificações e estratégias de abordagem individualizadas. O admin revisa e envia.

5. **Conversão personalizada por dados reais** — O sistema usa o comportamento observado dentro da plataforma (marketplaces conectados, páginas visitadas, frequência de acesso, uso de ferramentas) para segmentar e personalizar cada abordagem.

6. **Auditoria total** — Toda geração de conteúdo por IA, toda nota, todo status change e toda abordagem do time comercial ficam registrados na timeline do lead.

---

## 3. Ciclo de Vida do Lead

O ciclo de vida está diretamente mapeado nos campos reais do `guiaseller.back`:

```
ANONYMOUS ──→ VISITOR ──→ REGISTERED ──→ TRIAL ──→ ACTIVE ──→ CHAMPION
                                  ↓              ↓         ↓
                              COLD_LEAD      PROSPECT   CHURNED
```

### Estados do Lead

| Estado | Trigger | Campo de origem no back |
|---|---|---|
| `ANONYMOUS` | Acesso à landing page sem cadastro (GA4 / click tracking) | GA4 session |
| `VISITOR` | Clicou em link de referral `?ref=ABC123` | `User.influencerIndicacaoId` / GA4 |
| `REGISTERED` | Criou conta | `User.createdAt` + `user_level = 'basic'` |
| `TRIAL` | Conta ativa com acesso early-access | `User.isAlpha = true` |
| `PROSPECT` | Visualizou página de planos / checkout sem assinar | GA4 events + `Plans.tsx` |
| `SUBSCRIBER` | Assinatura ativa | `Subscription.status = 'ACTIVE'` + `user_level` em `pro/premium` |
| `CHAMPION` | Assinante ativo + tem indicações convertidas | `ReferralCode.totalConversions > 0` |
| `AT_RISK` | Assinatura próxima do vencimento ou inadimplente | `Subscription.nextDueDate` iminente / `status = 'OVERDUE'` |
| `CHURNED` | Cancelou assinatura | `Subscription.status = 'CANCELLED'` + `CancellationRequest` |
| `COLD_LEAD` | Registrou mas nunca assinou e está inativo há > 30 dias | `User.status + createdAt delta` |
| `REACTIVATION` | Ex-assinante sem plano ativo | `Subscription.cancelled_at` existente |

### Transições válidas

```
ANONYMOUS      → VISITOR        (quando clica em link rastreado)
VISITOR        → REGISTERED     (quando completa signup)
REGISTERED     → TRIAL          (quando recebe acesso alpha)
REGISTERED     → PROSPECT       (quando visita /plans sem assinar)
REGISTERED     → COLD_LEAD      (30 dias sem ação)
PROSPECT       → SUBSCRIBER     (pagamento confirmado)
TRIAL          → SUBSCRIBER     (pagamento confirmado)
SUBSCRIBER     → AT_RISK        (vencimento < 5 dias ou OVERDUE)
SUBSCRIBER     → CHAMPION       (indicação convertida)
AT_RISK        → SUBSCRIBER     (pagamento regularizado)
AT_RISK        → CHURNED        (cancelamento confirmado)
CHURNED        → REACTIVATION   (reengajamento detectado)
COLD_LEAD      → PROSPECT       (retorno ao site)
```

---

## 4. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GUIASELLER ECOSYSTEM                         │
│                                                                     │
│  ┌──────────────┐    webhooks/REST    ┌──────────────────────────┐  │
│  │guiaseller.   │ ─────────────────→  │   guiaseller.leads       │  │
│  │back          │                     │   (serviço próprio)      │  │
│  │(prod DB)     │                     │                          │  │
│  └──────────────┘                     │  ┌────────────────────┐  │  │
│                                       │  │  leads DB          │  │  │
│  ┌──────────────┐    Firebase RTDB     │  │  (PostgreSQL       │  │  │
│  │Firebase      │ ─────────────────→  │  │   separado)        │  │  │
│  │(presence)    │                     │  └────────────────────┘  │  │
│  └──────────────┘                     │                          │  │
│                                       │  ┌────────────────────┐  │  │
│  ┌──────────────┐                     │  │  Queue (BullMQ     │  │  │
│  │Asaas         │ ─── webhooks ─────→ │  │  + Redis)          │  │  │
│  │(pagamentos)  │                     │  └────────────────────┘  │  │
│  └──────────────┘                     │                          │  │
│                                       │  ┌────────────────────┐  │  │
│                                       │  │  AI Engine         │  │  │
│                                       │  │  (OpenAI/Anthropic)│  │  │
│                                       │  └────────────────────┘  │  │
│                                       └──────────────────────────┘  │
│                                                   │                 │
│               ┌───────────────────────────────────┘                 │
│               ↓                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  guiaseller.leads.front (Admin Panel — Next.js interno)    │     │
│  │  • Funil kanban  • Timeline  • Score  • IA ↗ Gera conteúdo│     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| `leads-api` | Node.js + Express/Fastify + TypeScript | API REST do serviço de leads |
| `leads-db` | PostgreSQL (banco exclusivo) | Persistência de leads, eventos, scores |
| `leads-queue` | BullMQ + Redis | Processamento assíncrono de geração de conteúdo IA |
| `leads-ai` | OpenAI SDK / Anthropic SDK + TypeScript | Motor de geração de conteúdo personalizado |
| `leads-front` | Next.js 14 + App Router + shadcn/ui | Painel admin interno |
| `leads-sync` | Cron jobs internos | Sincroniza eventos do back via API admin |

---

## 5. Banco de Dados Dedicado

### Por que banco separado?

- **Isolamento** — Falha no serviço de leads não afeta produção
- **Performance** — Queries analíticas complexas (funil, cohort) não concorrem com queries transacionais
- **Dados enriquecidos** — Estrutura própria otimizada para leitura e análise, não para transações
- **Privacidade** — Dados de prospecção (externos, enriquecidos) nunca entram no banco de usuários reais
- **Escalabilidade independente** — Pode crescer com índices e caching próprios

### Variável de ambiente

```env
# No .env do guiaseller.leads
DATABASE_URL_LEADS="postgresql://user:pass@host:5432/guiaseller_leads"

# Conexão de leitura ao back (via API, nunca via DB direto)
GUIASELLER_API_URL="https://back.guiaseller.com"
GUIASELLER_ADMIN_TOKEN="<token gerado via GET /admin/generate-token>"
```

### Sincronização (nunca acesso direto ao DB de produção)

```
                    leads-sync (cron a cada 5 min)
                           |
                    GET /admin/users        → sincroniza User → Lead
                    GET /subscription/all   → sincroniza status
                    GET /referral/history   → enriquece com origem
                           |
                    Webhook do Asaas (replicado)
                           → payment_received → leadEvent
                           → subscription_cancelled → atualiza status
```

---

## 6. Schema Prisma Proposto

> Arquivo: `prisma/schema.prisma` (banco `guiaseller_leads`)

```prisma
// ─────────────────────────────────────────────
// LEAD — entidade central
// ─────────────────────────────────────────────

model Lead {
  id                String   @id @default(cuid())
  
  // Referência ao sistema principal (sem FK real — banco diferente)
  userId            String?  @unique   // user_id do guiaseller.back (se já cadastrado)
  firebaseUid       String?  @unique   // UID Firebase
  
  // Identidade básica
  email             String?  @unique
  firstName         String?
  lastName          String?
  phone             String?
  
  // Status no funil
  status            LeadStatus  @default(ANONYMOUS)
  substatus         String?     // ex: "aguardando_cpf", "email_bounced"
  
  // Origem
  source            LeadSource  @default(ORGANIC)
  sourceDetail      String?     // ex: código de referral, nome do influenciador, campanha
  utmSource         String?
  utmMedium         String?
  utmCampaign       String?
  utmTerm           String?
  utmContent        String?
  referralCode      String?     // código ?ref= usado no signup
  referrerId        String?     // userId do referrer (banco principal)
  
  // Nível no sistema principal
  userLevel         String?     // basic, pro, premium, vitalicio, fundador
  subscriptionStatus String?    // ACTIVE, INACTIVE, CANCELLED, OVERDUE
  
  // Scores (calculados pelo engine)
  leadScore         Float    @default(0)   // 0–100: qualidade geral do lead
  conversionScore   Float    @default(0)   // 0–100: probabilidade de converter
  retentionScore    Float    @default(0)   // 0–100: probabilidade de permanecer ativo
  engagementScore   Float    @default(0)   // 0–100: nível de engajamento com a plataforma
  
  // Perfil (construído com dados internos)
  profile           LeadProfile?
  
  // Personalização de conversão
  conversionProfile ConversionProfile?
  
  // Flags de controle
  isQualified       Boolean  @default(false)
  isDisqualified    Boolean  @default(false)
  disqualifiedReason String?
  doNotContact      Boolean  @default(false)
  
  // Timestamps
  firstSeenAt       DateTime @default(now())  // primeira vez que o sistema soube dele
  registeredAt      DateTime?                 // data de cadastro no back
  trialStartedAt    DateTime?
  subscribedAt      DateTime?
  churnedAt         DateTime?
  lastActiveAt      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relacionamentos
  events            LeadEvent[]
  activities        LeadActivity[]
  notes             LeadNote[]
  tags              LeadTagAssignment[]
  touchpoints       LeadTouchpoint[]
  aiJobs            AIContentJob[]
  aiGenerations     AIGeneratedContent[]
  conversionActions ConversionAction[]
  
  @@index([status])
  @@index([leadScore])
  @@index([conversionScore])
  @@index([userLevel])
  @@index([source])
  @@index([createdAt])
}

// ─────────────────────────────────────────────
// PERFIL ENRIQUECIDO
// ─────────────────────────────────────────────

model LeadProfile {
  id                String   @id @default(cuid())
  leadId            String   @unique
  lead              Lead     @relation(fields: [leadId], references: [id])
  
  // Dados pessoais/empresa (preenchidos pelo usuário ou inferidos internamente)
  cnpj              String?
  cpf               String?
  companyName       String?
  fantasyName       String?
  companySize       CompanySize?       // MEI, ME, EPP, MEDIO, GRANDE
  estimatedRevenue  RevenueRange?      // inferida pelo volume de pedidos nas integrações
  industry          String?            // inferida das categorias de produtos conectados
  
  // Localização (IP do Firebase presence + dados cadastrais)
  city              String?
  state             String?
  country           String?  @default("BR")
  region            String?            // Sul, Sudeste, Nordeste, etc.
  timezone          String?
  
  // Marketplaces ativos (derivado das integrações conectadas no guiaseller.back)
  sellsOnMl         Boolean  @default(false)  // Integrations table
  sellsOnShopee     Boolean  @default(false)  // IntegrationShopee table
  sellsOnMagalu     Boolean  @default(false)  // IntegrationsMagalu table
  sellsOnShein      Boolean  @default(false)  // IntegrationsShein table
  
  // Conhecimento/experiência (inferido via comportamento na plataforma)
  ecommerceExperience ExperienceLevel? // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  mainProducts      String?            // categoria principal de produtos (das listings/pedidos)
  businessModel     BusinessModel?     // DROPSHIPPING, ESTOQUE_PROPRIO, INDUSTRIA, DISTRIBUIDOR, MISTO
  
  // Contato (do perfil do User no guiaseller.back)
  whatsapp          String?            // celular do User
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ─────────────────────────────────────────────
// PERFIL DE CONVERSÃO PERSONALIZADA
// ─────────────────────────────────────────────

model ConversionProfile {
  id                 String   @id @default(cuid())
  leadId             String   @unique
  lead               Lead     @relation(fields: [leadId], references: [id])
  
  // Preferências detectadas/definidas pelo time
  preferredChannel   ContactChannel?   // EMAIL, WHATSAPP, TELEFONE, INSTAGRAM_DM
  preferredTime      String?           // ex: "manhã", "tarde", "noite"
  preferredDayOfWeek String?           // ex: "segunda", "terça"
  communicationTone  CommunicationTone? // FORMAL, INFORMAL, TECNICO, COMERCIAL
  languageLevel      LanguageLevel?     // SIMPLES, INTERMEDIARIO, TECNICO
  
  // Pain points detectados
  mainPainPoints     String[]          // ex: ["calculo_lucro", "shopee_fee", "concorrencia"]
  mainObjectives     String[]          // ex: ["aumentar_margem", "escalar_vendas"]
  
  // Plano recomendado para esse lead
  recommendedPlan    String?           // basic, pro, premium
  recommendedCycle   String?           // MONTHLY, ANNUAL
  estimatedValueLTV  Float?            // LTV estimado no momento
  
  // Abordagem comercial
  approachStrategy   String?           // texto livre — estratégia sugerida pelo time
  competitorContext  String?           // ferramentas que usa hoje (ex: Olist, Bling, etc.)
  decisionMakerScore Int?              // 1-5: o lead é quem decide a compra?
  urgencyLevel       Int?              // 1-5: quão urgente é a solução para ele
  
  // Histórico de abordagens
  approachCount      Int      @default(0)
  lastApproachAt     DateTime?
  nextFollowUpAt     DateTime?
  followUpOwner      String?           // email do responsável interno
  
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

// ─────────────────────────────────────────────
// EVENTOS DO LEAD (timeline imutável)
// ─────────────────────────────────────────────

model LeadEvent {
  id          String    @id @default(cuid())
  leadId      String
  lead        Lead      @relation(fields: [leadId], references: [id])
  
  type        LeadEventType
  source      String?       // "guiaseller.back", "asaas_webhook", "enrichment", "manual", "ga4"
  payload     Json?         // dados brutos do evento
  description String?       // descrição legível
  
  occurredAt  DateTime  @default(now())
  
  @@index([leadId])
  @@index([type])
  @@index([occurredAt])
}

// ─────────────────────────────────────────────
// ATIVIDADES (ações do time interno)
// ─────────────────────────────────────────────

model LeadActivity {
  id           String        @id @default(cuid())
  leadId       String
  lead         Lead          @relation(fields: [leadId], references: [id])
  
  type         ActivityType
  channel      ContactChannel?
  description  String
  outcome      ActivityOutcome?  // RESPONDEU, NAO_RESPONDEU, INTERESSADO, NAO_INTERESSOU, CONVERTEU
  performedBy  String            // email do admin que realizou
  
  scheduledAt  DateTime?
  performedAt  DateTime      @default(now())
  createdAt    DateTime      @default(now())
  
  @@index([leadId])
  @@index([performedBy])
}

// ─────────────────────────────────────────────
// NOTAS INTERNAS
// ─────────────────────────────────────────────

model LeadNote {
  id          String    @id @default(cuid())
  leadId      String
  lead        Lead      @relation(fields: [leadId], references: [id])
  
  content     String    @db.Text
  authorEmail String
  isPinned    Boolean   @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([leadId])
}

// ─────────────────────────────────────────────
// TAGS
// ─────────────────────────────────────────────

model LeadTag {
  id          String    @id @default(cuid())
  name        String    @unique
  color       String    @default("#6366f1")
  description String?
  
  assignments LeadTagAssignment[]
  
  createdAt   DateTime  @default(now())
}

model LeadTagAssignment {
  id        String    @id @default(cuid())
  leadId    String
  lead      Lead      @relation(fields: [leadId], references: [id])
  tagId     String
  tag       LeadTag   @relation(fields: [tagId], references: [id])
  
  assignedBy String   // email do admin
  createdAt  DateTime @default(now())
  
  @@unique([leadId, tagId])
}

// ─────────────────────────────────────────────
// TOUCHPOINTS (pontos de contato rastreados)
// ─────────────────────────────────────────────

model LeadTouchpoint {
  id         String    @id @default(cuid())
  leadId     String
  lead       Lead      @relation(fields: [leadId], references: [id])
  
  type       TouchpointType  // PAGE_VIEW, EMAIL_OPEN, EMAIL_CLICK, WHATSAPP_SENT, etc.
  page       String?
  source     String?
  referrer   String?
  device     String?
  city       String?
  country    String?
  ipHash     String?   // hash do IP (nunca salvar IP puro — LGPD)
  userAgent  String?
  
  occurredAt DateTime  @default(now())
  
  @@index([leadId])
  @@index([type])
  @@index([occurredAt])
}

// ─────────────────────────────────────────────
// JOBS DE GERAÇÃO IA (fila assíncrona)
// ─────────────────────────────────────────────

model AIContentJob {
  id          String   @id @default(cuid())
  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id])
  
  type        AIContentType   // EMAIL_FULL, WHATSAPP_MESSAGE, NOTIFICATION_TEXT, etc.
  channel     ContactChannel?
  prompt      String   @db.Text  // prompt construído com contexto do lead
  model       String?            // "gpt-4o", "claude-3-5-sonnet", etc.
  
  status      AIJobStatus  @default(PENDING)
  requestedBy String?      // email do admin que solicitou
  
  startedAt   DateTime?
  completedAt DateTime?
  failedAt    DateTime?
  errorLog    String?
  tokensUsed  Int?
  
  result      AIGeneratedContent?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([leadId])
  @@index([status])
  @@index([type])
}

// ─────────────────────────────────────────────
// CONTEÚDD GERADO PELA IA
// ─────────────────────────────────────────────

model AIGeneratedContent {
  id           String   @id @default(cuid())
  leadId       String
  lead         Lead     @relation(fields: [leadId], references: [id])
  jobId        String?  @unique
  job          AIContentJob?  @relation(fields: [jobId], references: [id])
  
  type         AIContentType
  channel      ContactChannel?
  subject      String?              // para emails
  body         String   @db.Text   // conteúdo gerado pela IA
  contextUsed  Json?                // snapshot do perfil usado no prompt
  model        String?              // modelo de IA utilizado
  tokensUsed   Int?
  
  // Revisão e uso pelo admin
  wasUsed      Boolean  @default(false)
  usedAt       DateTime?
  wasEdited    Boolean  @default(false)
  editedBody   String?  @db.Text   // versão editada antes de enviar
  rating       Int?                 // 1–5: avaliação do admin sobre a qualidade
  
  // Resultado após envio
  convertedLead Boolean @default(false)  // lead converteu após uso deste conteúdo
  
  generatedBy  String               // email do admin que solicitou
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([leadId])
  @@index([type])
}

// ─────────────────────────────────────────────
// AÇÕES DE CONVERSÃO
// ─────────────────────────────────────────────

model ConversionAction {
  id          String    @id @default(cuid())
  leadId      String
  lead        Lead      @relation(fields: [leadId], references: [id])
  
  type        ConversionActionType    // UPGRADE_LINK_SENT, DISCOUNT_APPLIED, DEMO_SCHEDULED, etc.
  channel     ContactChannel?
  content     String?   // ex: corpo do email enviado, texto do whatsapp
  templateId  String?   // referência ao template usado
  scheduledAt DateTime?
  sentAt      DateTime?
  openedAt    DateTime?
  clickedAt   DateTime?
  convertedAt DateTime?
  
  performedBy String    // email do admin
  outcome     String?
  
  createdAt   DateTime  @default(now())
  
  @@index([leadId])
  @@index([type])
}

// ─────────────────────────────────────────────
// CAMPANHAS / SEGMENTOS
// ─────────────────────────────────────────────

model Campaign {
  id          String    @id @default(cuid())
  name        String
  description String?
  type        CampaignType      // NURTURING, REACTIVATION, UPSELL, REFERRAL, COLD_OUTREACH
  status      CampaignStatus    @default(DRAFT)
  
  // Critérios de segmentação (JSON flexível para filtros)
  segmentCriteria Json?   // ex: { "status": ["COLD_LEAD"], "state": ["SP"], "leadScore": { "gte": 60 } }
  
  // Templates de mensagem
  emailTemplate    String? @db.Text
  whatsappTemplate String?
  
  startedAt   DateTime?
  endedAt     DateTime?
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum LeadStatus {
  ANONYMOUS
  VISITOR
  REGISTERED
  TRIAL
  PROSPECT
  SUBSCRIBER
  CHAMPION
  AT_RISK
  CHURNED
  COLD_LEAD
  REACTIVATION
  DISQUALIFIED
}

enum LeadSource {
  ORGANIC
  REFERRAL        // indicação de outro usuário
  INFLUENCER      // link de influenciador
  PAID_ADS        // Google Ads, Meta Ads
  SOCIAL_ORGANIC  // redes sociais sem pagar
  CONTENT         // blog, youtube, SEO
  PARTNERSHIP     // parceria externa
  DIRECT          // digitou a URL direto
  EVENT           // evento / webinar
  UNKNOWN
}

enum LeadEventType {
  ACCOUNT_CREATED
  EMAIL_VERIFIED
  FIRST_LOGIN
  INTEGRATION_CONNECTED
  PLAN_PAGE_VISITED
  SUBSCRIPTION_CREATED
  PAYMENT_RECEIVED
  PAYMENT_OVERDUE
  SUBSCRIPTION_CANCELLED
  CANCELLATION_REQUESTED
  REFERRAL_CODE_USED
  REFERRAL_CONVERTED
  TOOL_FIRST_USED
  DASHBOARD_FIRST_ACCESS
  REACTIVATION_DETECTED
  ENRICHMENT_COMPLETED
  STATUS_CHANGED
  SCORE_UPDATED
  NOTE_ADDED
  TAG_ADDED
  MANUAL_CONTACT
}

enum ActivityType {
  EMAIL_SENT
  WHATSAPP_SENT
  PHONE_CALL
  INSTAGRAM_DM
  MEETING_SCHEDULED
  MEETING_OCCURRED
  DEMO_GIVEN
  FOLLOW_UP
  DISCOUNT_OFFERED
  UPGRADE_OFFERED
  MANUAL_STATUS_CHANGE
}

enum ActivityOutcome {
  RESPONDEU
  NAO_RESPONDEU
  INTERESSADO
  NAO_INTERESSOU
  CONVERTEU
  ERRO_CONTATO
  AGENDADO_FOLLOW_UP
}

enum ContactChannel {
  EMAIL
  WHATSAPP
  TELEFONE
  INSTAGRAM_DM
  LINKEDIN
  PLATAFORMA
}

enum TouchpointType {
  PAGE_VIEW
  EMAIL_OPEN
  EMAIL_CLICK
  WHATSAPP_SENT
  WHATSAPP_READ
  FORM_SUBMITTED
  CHECKOUT_STARTED
  CHECKOUT_ABANDONED
  REFERRAL_LINK_CLICKED
}

enum EnrichmentStatus {
  PENDING
  RUNNING
  COMPLETED
  PARTIAL     // nem todas as fontes retornaram
  FAILED
  SKIPPED
}

enum ConversionActionType {
  UPGRADE_LINK_SENT
  DISCOUNT_APPLIED
  DEMO_SCHEDULED
  AI_EMAIL_SENT
  AI_WHATSAPP_SENT
  AI_NOTIFICATION_SENT
  WHATSAPP_SEQUENCE_STARTED
  REACTIVATION_OFFER_SENT
  REFERRAL_INCENTIVE_SENT
}

enum CampaignType {
  NURTURING
  REACTIVATION
  UPSELL
  REFERRAL
  COLD_OUTREACH
  ONBOARDING
  WIN_BACK
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

enum CompanySize {
  MEI
  ME
  EPP
  MEDIO
  GRANDE
}

enum RevenueRange {
  ATE_10K       // até R$ 10k/mês
  DE_10K_A_50K
  DE_50K_A_200K
  DE_200K_A_1M
  ACIMA_1M
}

enum ExperienceLevel {
  BEGINNER        // < 1 ano em e-commerce
  INTERMEDIATE    // 1-3 anos
  ADVANCED        // 3-7 anos
  EXPERT          // > 7 anos / operação própria
}

enum BusinessModel {
  DROPSHIPPING
  ESTOQUE_PROPRIO
  INDUSTRIA
  DISTRIBUIDOR
  MISTO
}

enum CommunicationTone {
  FORMAL
  INFORMAL
  TECNICO
  COMERCIAL
}

enum LanguageLevel {
  SIMPLES
  INTERMEDIARIO
  TECNICO
}

// Enums de IA

enum AIContentType {
  EMAIL_FULL              // email completo (assunto + corpo)
  EMAIL_SUBJECT           // apenas linha de assunto
  WHATSAPP_MESSAGE        // mensagem WhatsApp
  NOTIFICATION_TEXT       // notificação in-app
  APPROACH_STRATEGY       // texto de estratégia para o admin
  FOLLOW_UP_MESSAGE       // follow-up de contato anterior
  WIN_BACK_MESSAGE        // reativação de churned
  UPSELL_MESSAGE          // oferta de upgrade de plano
  ONBOARDING_TIP          // dica de onboarding personalizada
}

enum AIJobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## 7. Perfil com Dados Internos

Na fase inicial, o perfil de cada lead é construído **exclusivamente com dados já disponíveis no ecossistema GuiaSeller**. Não há chamada a nenhuma API externa. Isso garante velocidade de implementação, zero custo adicional e confiabilidade nos dados.

### 7.1 Fontes de dados internas

| Fonte | Endpoint/Origem | Dados extraídos para o Lead |
|---|---|---|
| `GET /admin/users` | guiaseller.back | `email`, `first_name`, `last_name`, `celular`, `cnpj_cpf`, `user_level`, `status`, `isAlpha`, `isInfluencer`, `influencerIndicacaoId`, `createdAt` |
| `GET /admin/users/:id/details` | guiaseller.back | integrações conectadas, assinatura ativa, ferramentas compradas |
| `GET /subscription/all` | guiaseller.back | `Subscription.status`, `cycle`, `value`, `nextDueDate`, `billingType`, `cancelled_at` |
| `GET /referral/history/:userId` | guiaseller.back | `referralCode` usado no cadastro, `referrerId`, dados do `ReferralUse` |
| Firebase RTDB `presence/:uid` | Firebase Admin SDK (read-only) | `current_page`, `current_path`, `last_activity`, `user_level` em tempo real |
| Asaas webhooks | Webhook replicado | `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_CANCELLED` |
| `Integrations` / `IntegrationShopee` / etc. | via details endpoint | quais marketplaces o usuário conectou (ML, Shopee, Magalu, Shein) |
| `CancellationRequest` | via admin API | motivo de churn, feedback detalhado, prioridade |
| `Logs` | via admin API | histórico de ações realizadas na plataforma |

### 7.2 Como o perfil é populado automaticamente

```
BackSyncService (cron a cada 5 min)
        │
        ├── GET /admin/users
        │       └── Para cada user:
        │             1. Cria ou atualiza Lead
        │             2. Atualiza Lead.userLevel, Lead.subscriptionStatus
        │             3. Calcula transição de status (LeadStatusService)
        │             4. Recalcula scores (LeadScoreService)
        │             5. Gera LeadEvent se houve mudança
        │
        ├── GET /admin/users/:id/details (para leads novos ou com mudança)
        │       └── Popula LeadProfile:
        │             • sellsOnMl / sellsOnShopee / sellsOnMagalu / sellsOnShein
        │             • ecommerceExperience (inferida pela qtd de integrações + pedidos)
        │             • estimatedRevenue (inferida pelo volume médio de pedidos)
        │             • mainProducts (da categoria dominante nas listings)
        │
        └── GET /referral/history/:userId (se source=REFERRAL)
                └── Popula Lead.referralCode, Lead.referrerId

FirebaseSyncService (tempo real — listener)
        └── presence/:uid.current_path
              └── Se /plans ou /checkout:
                    → Gera LeadTouchpoint(CHECKOUT_STARTED)
                    → Recalcula conversionScore

Webhook Asaas (por evento)
        ├── PAYMENT_RECEIVED    → LeadEvent + muda status para SUBSCRIBER
        ├── PAYMENT_OVERDUE     → LeadEvent + muda status para AT_RISK
        └── SUBSCRIPTION_CANCELLED → LeadEvent + muda status para CHURNED
                                   → busca CancellationRequest para motivo
```

### 7.3 Regras de inferência de perfil (sem APIs externas)

| Campo | Lógica de inferência |
|---|---|
| `estimatedRevenue` | Conta pedidos dos últimos 30 dias via tabelas `orders/*`; mapeia faixa |
| `ecommerceExperience` | `createdAt` do User + nº de integrações ativas + qtd de listings |
| `mainProducts` | Categoria mais frequente nas listings conectadas |
| `sellsOn*` | Boolean direto das tabelas `Integrations`, `IntegrationShopee`, etc. |
| `city` / `state` | Timezone do `Consent` + DDD do campo `celular` |
| `businessModel` | Se tem `ProductCost` registrado → `ESTOQUE_PROPRIO`, senão `DESCONHECIDO` |
| `companySize` | `cnpj_cpf` preenchido → `MEI`/`ME` (default até informação manual) |

---

## 8. IA Generativa para Personalização

O **AI Engine** é o diferencial competitivo do `guiaseller.leads`. Para cada lead, a IA recebe um contexto completo do perfil interno e gera conteúdo personalizado para o canal mais adequado. O admin revisa, edita se necessário, e envia.

### 8.1 Fluxo de geração

```
Admin abre perfil do lead no painel
        │
        └── Clica em "Gerar Conteúdo com IA"
                │
                ├── Escolhe tipo: Email / WhatsApp / Notificação / Estratégia
                │
                └── AIPromptBuilder monta o contexto do lead:
                        • Nome, marketplaces conectados
                        • Status no funil + dias nesse status
                        • Últimas páginas visitadas (Firebase presence)
                        • Plano atual e histórico de pagamentos
                        • Se veio via referral ou influenciador
                        • Motivo de churn (se CHURNED, via CancellationRequest)
                        • Tom preferido + canal preferido (do ConversionProfile)
                        • Cidade/estado (se disponível)
                        • Número de integrações ativas
                        • Última interação registrada
                                │
                                └── AI envia prompt → OpenAI / Anthropic API
                                        │
                                        └── Resultado salvo em AIGeneratedContent
                                                │
                                                ├── Admin vê, edita (opcional) e envia
                                                ├── wasUsed=true / wasEdited=true
                                                └── Se lead converte: convertedLead=true
```

### 8.2 Tipos de conteúdo gerados pela IA

| Tipo (`AIContentType`) | O que a IA gera | Canal |
|---|---|---|
| `EMAIL_FULL` | Email completo (assunto + corpo HTML) personalizado pelo perfil | Email |
| `EMAIL_SUBJECT` | Só a linha de assunto (para A/B test) | Email |
| `WHATSAPP_MESSAGE` | Mensagem curta e natural para WhatsApp, no tom do lead | WhatsApp |
| `NOTIFICATION_TEXT` | Notificação push in-app (máx. 120 chars) | Plataforma |
| `APPROACH_STRATEGY` | Texto interno para o admin: estratégia de abordagem sugerida | Interno |
| `FOLLOW_UP_MESSAGE` | Follow-up baseado na última interação registrada | WhatsApp/Email |
| `WIN_BACK_MESSAGE` | Mensagem de reativação para CHURNED com contexto do motivo de saída | Email/WhatsApp |
| `UPSELL_MESSAGE` | Oferta de upgrade de plano baseada no uso atual | WhatsApp/Email |
| `ONBOARDING_TIP` | Dica personalizada de próxima ação na plataforma | Plataforma |

### 8.3 Estrutura do prompt (exemplo para WhatsApp)

```typescript
// src/ai/AIPromptBuilder.ts

function buildWhatsAppPrompt(lead: LeadWithProfile): string {
  return `
Você é um especialista em vendas B2B de SaaS para vendedores de marketplace.
Sua tarefa é criar UMA mensagem de WhatsApp personalizada e natural.

PERFIL DO LEAD:
- Nome: ${lead.firstName} ${lead.lastName ?? ''}
- Status: ${lead.status} há ${daysSinceStatus(lead)} dias
- Marketplaces: ${getMarketplacesList(lead.profile)}
- Última página visitada: ${lead.lastPage ?? 'não disponível'}
- Plano atual: ${lead.userLevel}
- Localização: ${lead.profile?.city ?? 'não identificada'}, ${lead.profile?.state ?? ''}
- Motivo de saída (se CHURNED): ${getCancellationReason(lead) ?? 'nenhum registrado'}
- Tom preferido: ${lead.conversionProfile?.communicationTone ?? 'INFORMAL'}

REGRAS:
- Máximo 3 linhas
- Sem emojis excessivos (máx. 2)
- Mencione ao menos 1 detalhe específico do perfil acima
- Termine com uma pergunta aberta
- Idioma: Português brasileiro (tom conversacional)

Gere APENAS o texto da mensagem, sem explicações adicionais.
  `;
}
```

### 8.4 Exemplos de output da IA por perfil

**Lead: basic, conectou Shopee, visitou /plans há 2 dias, não assinou | Tom: informal**
```
Oi João! Vi que você já conectou sua loja Shopee no GuiaSeller 🚀
Que tal dar o próximo passo e ver o quanto você tá lucrando de verdade?
O que trava você hoje em migrar pro plano Pro?
```

**Lead: churned, motivo: "preço alto", plano premium anterior | Tom: comercial**
```
Olá Maria, tudo bem?
Sabemos que o preço foi um ponto importante na sua decisão de sair.
Temos uma condição especial de retorno esse mês — posso te apresentar?
```

**Lead: subscriber pro, sem referral ativo, 3 integrações | Tom: formal**
```
Assunto: Multiplique seus resultados indicando o GuiaSeller

Olá, Carlos.
Com três marketplaces integrados, você já sabe o valor da plataforma.
Nosso programa de indicações remunera por cada assinante que você nos trouxer —
valeria conferir as condições?
```

### 8.5 Configurações de IA no painel

- **Modelo selecionável por tipo**: `EMAIL_FULL` usa GPT-4o; `WHATSAPP_MESSAGE` usa GPT-4o-mini (mais barato e rápido)
- **Temperatura por tipo**: `EMAIL_FULL` = 0.7 / `WIN_BACK_MESSAGE` = 0.9 / `APPROACH_STRATEGY` = 0.5
- **Sistema de rating**: Admin dá nota 1–5 para cada conteúdo gerado → alimenta fine-tuning futuro
- **Histórico visível**: Todo conteúdo gerado fica salvo em `AIGeneratedContent` para rastreabilidade
- **Toggle de produção**: Flag por tipo — `NOTIFICATION_TEXT` pode ser enviado automaticamente; `EMAIL_FULL` sempre requer revisão humana

---

## 9. Lead Score e Qualidade de Conversão

### 9.1 Lead Score (0–100)

O `leadScore` mede a **qualidade geral do lead** — quanto mais sabemos sobre ele e mais ele se encaixa no perfil ideal de cliente.

```
leadScore = Σ (peso × pontos)
```

| Critério | Pontos | Peso |
|---|---|---|
| Email preenchido | 8 | `1.0` |
| Telefone/WhatsApp preenchido | 6 | `1.0` |
| CNPJ/CPF preenchido | 8 | `1.0` |
| Integração conectada no GuiaSeller | 18 | `1.0` |
| Vende em > 1 marketplace (multimarcetplace) | 10 | `1.0` |
| Veio via indicação qualificada | 10 | `1.0` |
| Nível experiência Intermediário ou mais (inferido) | 6 | `0.8` |
| Cidade mapeada | 4 | `0.5` |
| Já teve assinatura anterior (reativação) | 8 | `1.0` |

**Classificação do Lead Score:**

| Score | Tier | Ação sugerida |
|---|---|---|
| 80–100 | 🔥 `HOT` | Contato imediato, personalizado |
| 60–79 | ✅ `WARM` | Sequência de nutrição + oferta |
| 40–59 | ⚠️ `LUKEWARM` | Newsletter + conteúdo educativo |
| 20–39 | 🌀 `COLD` | Sequência automatizada longa |
| 0–19 | ❄️ `FROZEN` | Sem ação ativa — aguardar sinal |

### 9.2 Conversion Score (0–100)

O `conversionScore` mede a **probabilidade de converter para assinante pago** baseada em comportamento observado.

| Critério comportamental | Pontos |
|---|---|
| Visitou `/plans` | 15 |
| Visitou `/plans/checkout` | 25 |
| Completou onboarding de integração | 20 |
| Usou calculadora de preços | 10 |
| Criou primeiro anúncio / viu lucro | 15 |
| Voltou ao produto em > 3 sessões | 10 |
| Referral ativo gerou código | 5 |
| Mais de 10 min no dashboard | 8 |
| Completou tutorial | 5 |

**Diminuem o conversion score:**

| Critério negativo | Penalidade |
|---|---|
| Inativo há > 15 dias | -15 |
| Email bounced | -20 |
| Solicitou remoção de conta | -50 |
| Abriu `/plans` mas saiu em < 30 segundos | -5 |

### 9.3 Retention Score (0–100) — apenas para assinantes

| Critério | Pontos |
|---|---|
| Acesso ativo nos últimos 7 dias | 20 |
| Integração ativa em > 1 marketplace | 20 |
| Usa ferramentas de IA | 10 |
| Tem indicações ativas no referral | 15 |
| Viu relatório de lucro no mês | 15 |
| Não houve cobrança overdue nos últimos 60 dias | 10 |
| Abriu notificações nos últimos 14 dias | 5 |
| Comentou/curtiu em Novidades | 5 |

**Classificação de retenção:**

| Score | Status | Ação |
|---|---|---|
| 80–100 | 💚 `HEALTHY` | Monitoramento passivo |
| 60–79 | 🟡 `STABLE` | Oferecer upsell / referral |
| 40–59 | 🟠 `AT_RISK` | Promoção de renovação |
| 0–39 | 🔴 `CRITICAL` | Intervenção manual urgente |

---

## 10. Conversão Personalizada por Lead

A filosofia central do `guiaseller.leads` é que **cada lead é abordado de forma diferente** com base em seu perfil comportamental observado dentro da própria plataforma. O `ConversionProfile` orienta o time comercial e alimenta o AI Engine da seção anterior.

### 10.1 Variáveis de personalização (todas derivadas de dados internos)

| Dimensão | Variável | Como é detectada |
|---|---|---|
| **Canal preferido** | Email / WhatsApp / Plataforma | Histórico de resposta às `LeadActivity` anteriores |
| **Horário ideal** | Manhã / Tarde / Noite | `last_activity` via Firebase RTDB presence |
| **Tom de comunicação** | Formal / Informal / Técnico | `ecommerceExperience` do perfil + tempo como usuário |
| **Nível de conhecimento** | Iniciante / Intermediário / Avançado | `ExperienceLevel` inferido (integrações + pedidos) |
| **Dor principal** | Lucro / Gestão / Escala / Taxas | Páginas mais visitadas + ferramentas usadas no sistema |
| **Plataformas usadas** | ML / Shopee / Magalu / Shein | Integrações conectadas (`sellsOn*`) |
| **Modelo de negócio** | Dropshipping / Estoque | `BusinessModel` do perfil |
| **Urgência** | Alta / Média / Baixa | Frequência de acesso ao `/plans` + `conversionScore` |

### 10.2 ConversionProfile e AI Engine trabalhando juntos

O `ConversionProfile` alimenta diretamente o `AIPromptBuilder`. Cada campo do perfil vira uma variável no contexto enviado à IA:

```
ConversionProfile.preferredChannel   → IA escolhe tom e estrutura para aquele canal
ConversionProfile.communicationTone  → IA ajusta registro (formal/informal)
ConversionProfile.mainPainPoints     → IA menciona a dor específica no conteúdo
ConversionProfile.recommendedPlan    → IA faz oferta do plano adequado
ConversionProfile.urgencyLevel       → IA ajusta força do CTA (call to action)
ConversionProfile.nextFollowUpAt     → Sistema agenda lembrete para o admin
Lead.status + Lead.churnedAt         → IA monta win-back com contexto de tempo fora
```

### 10.3 Templates base de mensagem (sem IA — fallback manual)

```prisma
model MessageTemplate {
  id           String    @id @default(cuid())
  name         String
  channel      ContactChannel
  tone         CommunicationTone?
  targetStatus LeadStatus?          // para qual status do funil é esse template
  subject      String?              // para email
  body         String    @db.Text
  variables    String[]             // ex: ["firstName", "mainPlatform", "daysSinceRegistered"]
  
  useCount     Int       @default(0)
  successRate  Float?               // % de conversões quando usado
  
  createdBy    String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

---

## 11. Painel Admin Interno (guiaseller.leads front)

### 11.1 Páginas e funcionalidades

```
/leads                    → Lista de leads com filtros, busca, score visual
/leads/[id]               → Perfil completo do lead (timeline, scores, perfil interno)
/leads/[id]/ai            → Gerar e ver conteúdo com IA (email, WhatsApp, notificação)
/leads/[id]/convert       → Registrar ação de conversão, enviar mensagem
/funnel                   → Visualização kanban do funil por status
/segments                 → Segmentos salvos + criação de novo segmento
/campaigns                → Gestão de campanhas de nurturing/reativação
/analytics                → Métricas: funil, cohort, conversão por fonte, por região
/ai/history               → Histórico de conteúdos gerados por IA + ratings
/settings                 → Configurações de modelo IA, templates base, thresholds de score
```

### 11.2 Visualização do funil (Kanban)

```
┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐
│REGISTERED│  │  PROSPECT  │  │SUBSCRIBER│  │ CHAMPION  │  │ CHURNED  │
│  1.243   │  │    348     │  │   892    │  │    127    │  │    431   │
│          │  │            │  │          │  │           │  │          │
│ João S.  │  │ Maria O.   │  │ Carlos M.│  │ Ana P.    │  │ Pedro L. │
│ Score:34 │  │ Score:72   │  │ Ret.:88  │  │ Ret.:95   │  │ [win-back│
│          │  │            │  │          │  │           │  │  signal] │
│ ...      │  │ ...        │  │ ...      │  │ ...       │  │ ...      │
└──────────┘  └────────────┘  └──────────┘  └───────────┘  └──────────┘
```

### 11.3 Perfil do Lead (timeline)

```
[João Silva] ● WARM (Score: 72) ● PROSPECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Fortaleza - CE  |  📦 Shopee (integrado)  |  🏢 MEI  |  ⏱ 45 dias como REGISTERED

[Perfil Interno] ✅ Populado via dados do back
  • Marketplace: Shopee conectado ✓
  • user_level: basic — nunca assinou
  • Última visita: /plans há 2 dias (2min 30s)
  • Celular preenchido ✓
  • Origem: referral código ABC123

[Scores — 100% calculados com dados internos]
  Lead Score:        ████████░░ 72/100 (WARM)
  Conversion Score:  ██████░░░░ 58/100
  Engagement Score:  ███████░░░ 68/100

[IA]
  🤖 3 conteúdos gerados  |  1 enviado  |  Rating médio: ⭐⭐⭐⭐
  └── Último: WhatsApp enviado 27/02/2026 → Lead respondeu ✓

[Timeline]
  📅 26/02/2026 10:32 — Cadastrou-se via referral código ABC123
  📅 26/02/2026 10:35 — Conectou integração Shopee
  📅 26/02/2026 11:00 — Visited /plans (2min 30s)
  📅 26/02/2026 11:02 — Abandoned /plans/checkout
  📅 27/02/2026 09:00 — [IA] WhatsApp gerado por admin@guiaseller.com
  📅 27/02/2026 09:15 — [MANUAL] WhatsApp enviado por admin@guiaseller.com
  📅 27/02/2026 09:40 — Respondeu no WhatsApp — status: INTERESSADO

[Notas]
  📌 "Perguntou sobre plano anual com desconto, enviar proposta"
     — admin@guiaseller.com — 27/02/2026

[Próxima ação]
  ⏰ Follow-up em 01/03/2026 — Responsável: admin@guiaseller.com
```

### 11.4 Analytics globais do funil

- **Taxa de conversão por fonte** (referral vs. orgânico vs. influenciador)
- **Tempo médio de conversão** (REGISTERED → SUBSCRIBER)
- **Cohort de retenção** (assinantes por mês de adesão — quantos permanecem após 1, 3, 6, 12 meses)
- **Mapa de calor geográfico** (leads por estado/cidade — derivado do DDD/timezone)
- **Score médio por estágio do funil**
- **Efetividade do AI Engine** (% de conteúdos gerados por IA que resultaram em resposta; taxa de conversão após uso de IA vs. abordagem manual)
- **Rating médio dos conteúdos por tipo** (`EMAIL_FULL` vs. `WHATSAPP_MESSAGE` vs. `WIN_BACK_MESSAGE`)
- **ROI do programa de referral** (leads via indicação vs. leads orgânicos — tempo e taxa de conversão)

---

## 12. Segmentação e Filtros

O sistema permite criar **segmentos dinâmicos** salvos com critérios combinados. Todos os critérios são baseados em dados internos.

### Segmentos pré-definidos (out-of-the-box)

| Nome | Critérios | Ação sugerida |
|---|---|---|
| `hot_leads_now` | leadScore ≥ 80 + visitou /plans nos últimos 7 dias | Gerar conteúdo com IA + contato imediato |
| `basic_with_integration` | userLevel=basic + integração conectada + não assinou | IA: oferta de upgrade focada no marketplace |
| `cold_30_days` | status=COLD_LEAD + lastActiveAt > 30 dias | IA: sequência win-back |
| `trial_no_integration` | status=TRIAL + nenhuma integração conectada | IA: dica de onboarding personalizada |
| `at_risk_subscribers` | retentionScore < 40 + SUBSCRIBER | IA: mensagem de engajamento/renovação |
| `churned_subscribers` | status=CHURNED + churnedAt < 90 dias | IA: win-back com contexto do motivo |
| `referral_converts_fast` | source=REFERRAL + converteu em < 7 dias | Análise de padrão |
| `influencer_leads` | source=INFLUENCER | Análise de performance por influenciador |
| `multi_marketplace` | sellsOnMl=true + sellsOnShopee=true | IA: oferta plano Premium multi-canal |
| `subscriber_no_referral` | status=SUBSCRIBER + sem ReferralCode ativo | IA: ativar programa de indicações |

### Filtros disponíveis no painel

- Status do funil (multi-select)
- Lead Score (range slider)
- Conversion Score (range slider)
- Fonte de origem
- Nível no sistema (`user_level`)
- Marketplace(s) conectado(s)
- Modelo de negócio (inferido)
- Faixa de receita estimada (inferida)
- Data de cadastro (range)
- Responsável interno (follow-up owner)
- Tags
- Com/sem conteúdo IA gerado
- Com/sem nota
- `doNotContact = false` (padrão nos filtros de ação)

---

## 13. Integrações com o Ecossistema Atual

### 13.1 Sincronização com guiaseller.back

| Dado | Endpoint no back | Frequência | Destino no leads |
|---|---|---|---|
| Lista de usuários | `GET /admin/users` | A cada 5 min | `Lead.userId`, `Lead.status` sincronizado |
| Detalhes do usuário | `GET /admin/users/:id/details` | On-demand ou ao criar lead | `Lead`, `LeadProfile` parcial |
| Assinaturas | `GET /subscription/all` | A cada 5 min | `Lead.subscriptionStatus`, `Lead.userLevel` |
| Planos disponíveis | `GET /subscription/plans` | Diário | Referência para `ConversionProfile.recommendedPlan` |
| Referrals | `GET /referral/history/:userId` | On demand | `Lead.referralCode`, `Lead.source = REFERRAL` |

### 13.2 Webhooks do Asaas (replicados)

O `guiaseller.back` já processa webhooks do Asaas. O `guiaseller.leads` precisa de **um segundo endpoint** registrado no painel do Asaas (ou o back re-emite o evento via fila):

| Evento Asaas | LeadEvent gerado | Mudança de status |
|---|---|---|
| `PAYMENT_RECEIVED` | `PAYMENT_RECEIVED` | `REGISTERED/PROSPECT → SUBSCRIBER` |
| `PAYMENT_OVERDUE` | `PAYMENT_OVERDUE` | `SUBSCRIBER → AT_RISK` |
| `SUBSCRIPTION_CANCELLED` | `SUBSCRIPTION_CANCELLED` | `SUBSCRIBER → CHURNED` |

### 13.3 Firebase Realtime Database (presença)

O `guiaseller.front` já escreve em `presence/` via `useOnlinePresence.ts`. O `guiaseller.leads` pode **consumir esse dado** (read-only com service account):

```typescript
// Campos disponíveis em presence/:uid
{
  state: "online",
  name: "João Silva",
  user_level: "basic",
  email: "joao@email.com",
  current_page: "/plans",
  current_path: "/plans/checkout?plan=pro",
  last_activity: 1740000000000,
  last_changed: 1740000000000
}
```

Quando `current_path` inclui `/plans` ou `/plans/checkout`, gerar automaticamente um `LeadTouchpoint` do tipo `CHECKOUT_STARTED` e recalcular o `conversionScore`.

### 13.4 Autenticação do painel admin

O `guiaseller.leads` usa os mesmos Firebase custom claims (`admin: true`) do ecossistema atual. O middleware valida o token Firebase e verifica a claim antes de autorizar acesso.

---

## 14. Stack e Estrutura de Pastas

### Stack recomendada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Runtime** | Node.js 20 LTS + TypeScript | Consistência com guiaseller.back |
| **Framework API** | Fastify (ou Express) | Leveza + TypeScript nativo |
| **ORM** | Prisma 5 | Consistência com guiaseller.back |
| **Banco** | PostgreSQL 15 (instância própria) | Isolamento total do banco de produção |
| **Cache** | Redis | Cache de scores + rate limiting |
| **Queue** | BullMQ + Redis | Jobs assíncronos de geração de conteúdo IA |
| **Agendador** | node-cron | Sincronização periódica com o back |
| **Frontend admin** | Next.js 14 App Router + TypeScript | SSR para tabelas grandes |
| **UI** | shadcn/ui + Tailwind CSS | Consistência visual com o ecossistema |
| **Tabelas** | TanStack Table v8 | Filtros e sort avançados |
| **Charts** | Recharts ou Tremor | Visualizações do funil e cohort |
| **IA** | OpenAI SDK (`openai`) + Anthropic SDK (`@anthropic-ai/sdk`) | Geração de conteúdo personalizado |
| **Validação** | Zod | Consistência com o ecossistema |
| **Autenticação** | Firebase Admin SDK | Reutiliza claims do ecossistema |

### Estrutura de pastas (`guiaseller.leads`)

```
guiaseller.leads/
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── .env.example
│
├── prisma/
│   ├── schema.prisma          # Schema do banco de leads
│   └── migrations/
│
├── src/
│   ├── index.ts               # Entry point (API + workers)
│   ├── app.ts                 # Fastify/Express app
│   │
│   ├── config/
│   │   ├── environment.ts     # Variáveis de ambiente tipadas
│   │   ├── firebase.ts        # Firebase Admin SDK
│   │   ├── redis.ts           # Conexão Redis
│   │   └── openai.ts          # OpenAI / Anthropic client
│   │
│   ├── prisma/
│   │   └── prismaClient.ts    # Prisma Client para leads DB
│   │
│   ├── routes/
│   │   ├── leads/
│   │   │   ├── leadsRoutes.ts          # CRUD leads
│   │   │   ├── aiRoutes.ts             # Gerar conteúdo com IA
│   │   │   ├── activitiesRoutes.ts     # Atividades/contatos
│   │   │   └── analyticsRoutes.ts      # Métricas do funil
│   │   ├── campaigns/
│   │   │   └── campaignsRoutes.ts
│   │   ├── segments/
│   │   │   └── segmentsRoutes.ts
│   │   └── webhooks/
│   │       ├── asaasLeadsWebhook.ts    # Webhook Asaas dedicado
│   │       └── backSyncWebhook.ts      # Push do guiaseller.back
│   │
│   ├── services/
│   │   ├── LeadService.ts              # CRUD e lógica de Lead
│   │   ├── LeadStatusService.ts        # Transições de status
│   │   ├── LeadScoreService.ts         # Cálculo e recálculo de scores
│   │   ├── sync/
│   │   │   ├── BackSyncService.ts      # Consome API do guiaseller.back
│   │   │   └── FirebaseSyncService.ts  # Lê presence do Firebase RTDB
│   │   └── ai/
│   │       ├── AIPromptBuilder.ts      # Monta contexto do lead para o prompt
│   │       ├── AIContentService.ts     # Orquestra chamadas à API de IA
│   │       ├── AIFeedbackService.ts    # Processa ratings e aprendizado
│   │       └── providers/
│   │           ├── OpenAIProvider.ts   # Integração OpenAI
│   │           └── AnthropicProvider.ts # Integração Anthropic (fallback)
│   │
│   ├── workers/
│   │   ├── aiWorker.ts                 # Processa jobs de geração IA (BullMQ)
│   │   ├── syncWorker.ts               # Sincroniza com o back
│   │   └── scoreRecalcWorker.ts        # Recalcula scores em lote
│   │
│   ├── middleware/
│   │   ├── adminAuth.ts                # Verifica Firebase admin claim
│   │   └── rateLimiter.ts              # Rate limit para API de IA
│   │
│   ├── cron/
│   │   ├── syncCron.ts                 # Cron de sincronização com back
│   │   └── scoresCron.ts               # Recalcula scores diariamente
│   │
│   └── utils/
│       └── logger.ts
│
└── front/                              # Next.js app (painel admin)
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                    # Redirect → /leads
    │   ├── leads/
    │   │   ├── page.tsx               # Lista de leads
    │   │   └── [id]/
    │   │       ├── page.tsx           # Perfil do lead
    │   │       ├── ai/page.tsx        # Geração de conteúdo com IA
    │   │       └── convert/page.tsx   # Registrar ação de conversão
    │   ├── funnel/page.tsx            # Kanban
    │   ├── analytics/page.tsx         # Métricas
    │   ├── campaigns/page.tsx         # Campanhas
    │   ├── ai/history/page.tsx        # Histórico de conteúdos IA
    │   └── settings/page.tsx
    ├── components/
    │   ├── leads/
    │   │   ├── LeadsTable.tsx
    │   │   ├── LeadProfile.tsx
    │   │   ├── LeadTimeline.tsx
    │   │   ├── LeadScoreBar.tsx
    │   │   ├── AIContentPanel.tsx      # Painel de geração IA
    │   │   ├── AIGeneratedContentCard.tsx # Card de conteúdo gerado
    │   │   └── ConversionPanel.tsx
    │   ├── funnel/
    │   │   └── FunnelKanban.tsx
    │   └── analytics/
    │       ├── FunnelChart.tsx
    │       ├── CohortTable.tsx
    │       └── AIEffectivenessChart.tsx
    └── lib/
        ├── api.ts                     # Client para leads-api
        └── auth.ts                    # Firebase auth no front
```

---

## 15. Roadmap de Implementação

### Fase 0 — Infraestrutura (Semana 1)
- [x] Criar repositório `guiaseller.leads`
- [x] Setup PostgreSQL dedicado (`guiaseller_leads`) — via EasyPanel
- [x] Criar schema Prisma inicial (Lead + LeadEnrichment + LeadHistory + LeadScore + SyncLog)
- [ ] Configurar Redis + BullMQ
- [x] Autenticação com Firebase Admin SDK (email/password + Google popup)
- [ ] Docker Compose local com PostgreSQL + Redis
- [ ] Configurar OpenAI SDK (chave de API + wrapper client)

### Fase 1 — MVP Interno (Semanas 2–4)

**Backend:**
- [x] `syncService.ts` — sincroniza 3.218 usuários diretamente do guiaseller DB (ML, Shopee, Magalu, Shein, assinaturas, anuncios)
- [x] `LeadStatusService` — status e segmento derivados no sync (`founder/premium/pro/paying/churned/free-active/free-inactive`)
- [x] `scoringService.ts` — scoring 0-100 baseado em dados reais (pedidos, listings, integrações, assinatura, marketplace spread)
- [ ] Webhook do Asaas para capturar `PAYMENT_RECEIVED` e `SUBSCRIPTION_CANCELLED`
- [ ] Cron de sincronização a cada 6h (pendente — `node-cron` em `index.ts`)

**Frontend (básico):**
- [ ] Lista de leads com filtros (status, score, userLevel)
- [ ] Perfil básico do lead (dados do back + timeline de eventos)
- [ ] Painel de notas
- [ ] Tags

**Resultado:** Time admin consegue ver todos os usuários no funil com status e score calculados 100% com dados internos.

---

### Fase 2 — IA para Personalização (Semanas 5–7)

- [ ] `AIPromptBuilder` — monta contexto completo do lead para o prompt
- [ ] `AIContentService` — integração com OpenAI GPT-4o
- [ ] `AnthropicProvider` — fallback com Claude Sonnet
- [ ] `aiWorker` (BullMQ) — processa jobs de geração assincronamente
- [ ] Modelos `AIContentJob` e `AIGeneratedContent` no banco + migrations
- [ ] Geração de `WHATSAPP_MESSAGE` e `EMAIL_FULL` no painel
- [ ] Página `/leads/[id]/ai` — visualizar, editar e marcar como usado
- [ ] Sistema de rating 1–5 por conteúdo gerado
- [ ] Toggle por tipo (revisão obrigatória para `EMAIL_FULL`)

**Resultado:** Admin gera mensagem personalizada para qualquer lead em < 5 segundos com um clique.

---

### Fase 3 — Conversão e Segmentação (Semanas 8–10)

- [ ] `ConversionProfile` completo
- [ ] `FirebaseSyncService` — lê presença em tempo real para `LeadTouchpoint`
- [ ] Todos os tipos de `AIContentType` implementados
- [ ] Segmentos dinâmicos salvos
- [ ] `ConversionAction` tracking (gerou → enviou → respondeu → converteu)
- [ ] Histórico de IA `/ai/history` com filtros por tipo e rating

**Resultado:** Time comercial rastreia toda a jornada de abordagem por lead, com IA em cada etapa.

---

### Fase 4 — Analytics e Campanhas (Semanas 11–13)

- [ ] Dashboard de funil com métricas de conversão por fonte
- [ ] Tabela de cohort de retenção
- [ ] `AIEffectivenessChart` — efetividade da IA vs. abordagem manual
- [ ] `Campaign` management (criar, configurar segmento, gerar conteúdo IA em lote)
- [ ] Integração com email transacional (Resend ou SendGrid)
- [ ] Integração com WhatsApp Business API (Z-API ou Twilio)
- [ ] Exportação CSV de segmentos

**Resultado:** Plataforma completa com campanhas alimentadas por IA e métricas claras de efetividade.

---

### Fase 5 — Inteligência Avançada (Futuro)

- [ ] Fine-tuning de modelo próprio com base nos ratings do time
- [ ] A/B testing de conteúdo gerado pela IA (qual versão converte mais)
- [ ] Score preditivo: modelo ML para classificar probabilidade de conversão
- [ ] Automações de fluxo (se status mudou para AT_RISK → gerar AI conteúdo automaticamente)
- [ ] Lead magnet rastreável (calculadora pública com captura de email → entrada no funil)
- [ ] Integração com Google Ads / Meta Ads (importar leads de campanhas pagas)

---

## 16. Critérios de Sucesso

### Métricas de produto (a medir após Fase 1)

| Métrica | Baseline (hoje) | Meta (90 dias) |
|---|---|---|
| % de leads com status mapeado | ~0% | 100% |
| % de leads com perfil interno completo | ~0% | > 80% |
| Tempo médio de identificação de lead HOT | N/A | < 24h após cadastro |
| Taxa de conversão REGISTERED → SUBSCRIBER | Desconhecida | Medida e visível |
| Conteúdos IA gerados por semana | 0 | > 100 |
| Rating médio dos conteúdos gerados | N/A | ≥ 4.0 / 5.0 |
| Leads COLD_LEAD com mensagem IA enviada/semana | 0 | > 50 |
| Leads CHURNED com win-back IA ativado | ~0% | > 60% |

### Critérios de qualidade técnicos

- [ ] Banco de leads nunca faz query direta ao banco de produção
- [ ] Todo conteúdo gerado por IA fica registrado em `AIGeneratedContent` com `model`, `tokensUsed` e `generatedBy`
- [ ] Conteúdo de tipo `EMAIL_FULL` sempre requer revisão humana antes do envio
- [ ] Hash do IP (nunca salvar IP puro) — conformidade LGPD
- [ ] `doNotContact = true` bloqueia qualquer geração ou envio automatizado (opt-out)
- [ ] Admin autenticado via Firebase custom claims para cada ação
- [ ] Rate limiting nas chamadas à API de IA para controle de custo
- [ ] Fallback de provider: se OpenAI falhar → Anthropic automaticamente

---

> **Status atual (26/02/2026):** Fase 0 e Fase 1 backend estão concluídas. O sync service importa 3.218 leads reais do guiaseller DB com enriquecimento completo (marketplaces, pedidos, assinaturas, scores). **Próximos passos:** (1) Cron auto-sync a cada 6h em `index.ts`, (2) Frontend — lista de leads com filtros + perfil detalhado (Epic 1.4), (3) Webhook do Asaas para eventos de pagamento em tempo real.
