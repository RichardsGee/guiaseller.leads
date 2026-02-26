# Discord Channels Setup 📢

## 🎯 Canais Necessários para GitHub Webhooks

**Mínimo para começar (3 canais):**

| Canal | Finalidade | Type |
|-------|-----------|------|
| `#deployments` | Push events do GitHub | Text |
| `#dev` | Pull requests | Text |
| `#announcements` | Releases e announcements | Text |

**Completo (recomendado - 19 canais):**

### 🔧 Development (4 canais)
- `#dev` - PRs e commits (GitHub)
- `#dev-blockers` - Bloqueios de desenvolvimento
- `#dev-code-review` - Revisões de código
- `#general` - Chat geral (já deve existir)

### 🧪 QA (3 canais)
- `#qa` - Updates de testes
- `#qa-tests` - Resultados de testes
- `#qa-bugs` - Relatórios de bugs

### 🏗️ Architecture (2 canais)
- `#architecture` - Decisões arquiteturais
- `#architecture-reviews` - Revisão de designs

### 📋 Product Management (2 canais)
- `#pm` - Product updates
- `#product-strategy` - Estratégia

### ⚡ DevOps (3 canais)
- `#deployments` - Push events (GitHub)
- `#monitoring` - Saúde de produção
- `#devops` - Operações DevOps

### 📊 Metrics (4 canais)
- `#announcements` - Announcements gerais + Releases (GitHub)
- `#metrics` - Métricas gerais
- `#daily-standup` - Daily standup automático
- `#weekly-metrics` - Relatório semanal

### 🚀 Sprint (2 canais)
- `#sprint-planning` - Planejamento de sprint
- `#sprint-review` - Review de sprint

---

## 📝 Passo-a-Passo para Criar Canais

### 1️⃣ Abrir Discord

1. Vá ao seu servidor: **Guia Seller**
2. Clique em "+" ao lado de "CHANNELS"

### 2️⃣ Criar Cada Canal

Para cada canal da tabela acima:

1. Clique "Create Channel"
2. Digite o nome (ex: `deployments`)
3. Tipo: **Text Channel**
4. Clique "Create"

### 3️⃣ Obter Channel IDs

**Ativar Developer Mode:**
1. Discord → User Settings → Advanced
2. Ativar **Developer Mode**

**Copiar IDs:**
1. Clique direito no canal
2. **Copy Channel ID**
3. Cole em `.env` abaixo

---

## 🎯 Mapeamento env → Discord

### **Mínimo para Webhooks (preencha AGORA)**

```bash
# .env
DISCORD_DEPLOYMENTS_CHANNEL_ID="ID_do_#deployments"
DISCORD_DEV_CHANNEL_ID="ID_do_#dev"
DISCORD_ANNOUNCEMENTS_CHANNEL_ID="ID_do_#announcements"
```

### **Completo (para depois)**

```bash
# General
DISCORD_GENERAL_CHANNEL_ID="ID_do_#general"
DISCORD_ANNOUNCEMENTS_CHANNEL_ID="ID_do_#announcements"
DISCORD_RANDOM_CHANNEL_ID="ID_do_#random"

# Development
DISCORD_DEV_CHANNEL_ID="ID_do_#dev"
DISCORD_DEV_BLOCKERS_CHANNEL_ID="ID_do_#dev-blockers"
DISCORD_DEV_CODE_REVIEW_CHANNEL_ID="ID_do_#dev-code-review"

# QA
DISCORD_QA_CHANNEL_ID="ID_do_#qa"
DISCORD_QA_TESTS_CHANNEL_ID="ID_do_#qa-tests"
DISCORD_QA_BUGS_CHANNEL_ID="ID_do_#qa-bugs"

# Architecture
DISCORD_ARCHITECTURE_CHANNEL_ID="ID_do_#architecture"
DISCORD_ARCHITECTURE_REVIEWS_CHANNEL_ID="ID_do_#architecture-reviews"

# Product Management
DISCORD_PM_CHANNEL_ID="ID_do_#pm"
DISCORD_PRODUCT_STRATEGY_CHANNEL_ID="ID_do_#product-strategy"

# DevOps
DISCORD_DEVOPS_CHANNEL_ID="ID_do_#devops"
DISCORD_DEPLOYMENTS_CHANNEL_ID="ID_do_#deployments"
DISCORD_MONITORING_CHANNEL_ID="ID_do_#monitoring"

# Metrics
DISCORD_METRICS_CHANNEL_ID="ID_do_#metrics"
DISCORD_DAILY_STANDUP_CHANNEL_ID="ID_do_#daily-standup"
DISCORD_WEEKLY_METRICS_CHANNEL_ID="ID_do_#weekly-metrics"

# Sprint
DISCORD_SPRINT_PLANNING_CHANNEL_ID="ID_do_#sprint-planning"
DISCORD_SPRINT_REVIEW_CHANNEL_ID="ID_do_#sprint-review"
```

---

## ✅ Checklist

Depois de criar canais e preencher .env:

- [ ] Criar canal `#deployments`
- [ ] Criar canal `#dev`
- [ ] Criar canal `#announcements`
- [ ] Ativar Developer Mode no Discord
- [ ] Copiar 3 Channel IDs
- [ ] Preencher `.env` com os 3 IDs mínimos
- [ ] Rodar `npm run server`
- [ ] Rodar `npm run webhook:test`
- [ ] ✅ Ver mensagens em Discord!

---

## 🎉 Pronto!

Depois de fazer isso, rode:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run webhook:test
```

Você verá mensagens de teste em #deployments, #dev e #announcements!
