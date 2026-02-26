# GitHub Webhooks Setup — Discord Integration 🔌

Integração automática entre GitHub e Discord: **push events → #deployments**, **PRs → #dev**, **releases → #announcements**.

---

## 📋 Overview

O sistema de webhooks permite que:

| Event | Discord Channel | Description |
|-------|-----------------|-------------|
| **Push** | #deployments | Notifica quando commits são enviados |
| **Pull Request** | #dev | Alerta de novas PRs, updates, merges |
| **Release** | #announcements | Publica nova releases e versões |

## 🚀 Quick Start (Development)

### 1️⃣ Verificar Canais Discord

Primeiro, você precisa ter os canais criados no seu servidor Discord:

```
📊 Guia Seller Server
├── 📤 #deployments       ← Para push events
├── 💻 #dev               ← Para PR events
└── 📢 #announcements     ← Para releases
```

Se não tiver, crie-os:
1. Abra Discord → Servidor Guia Seller
2. Clique em "+" ao lado de "CHANNELS"
3. Crie 3 canais: `deployments`, `dev`, `announcements`
4. Copie os IDs dos canais (ativar Developer Mode no Discord, depois clicar direito → Copy Channel ID)

### 2️⃣ Preencher .env com Channel IDs

Edite `.env` e substitua os `CHANNEL_ID_HERE`:

```bash
# Development Team Channels
DISCORD_DEV_CHANNEL_ID="SEU_DEV_CHANNEL_ID"
DISCORD_ANNOUNCEMENTS_CHANNEL_ID="SEU_ANNOUNCEMENTS_CHANNEL_ID"

# DevOps Channels
DISCORD_DEPLOYMENTS_CHANNEL_ID="SEU_DEPLOYMENTS_CHANNEL_ID"
```

### 3️⃣ Criar Webhook no GitHub

**Para repositório local/dev (localhost):**

#### Opção A: ngrok (Recomendado para Dev)

1. **Instalar ngrok**
   ```bash
   brew install ngrok  # macOS
   # ou download de https://ngrok.com/download
   ```

2. **Iniciar tunnel ngrok**
   ```bash
   ngrok http 3000
   ```

   Você verá:
   ```
   Forwarding   https://xxxx-yyyy.ngrok.io -> http://localhost:3000
   ```

3. **Copiar URL pública** (ex: `https://xxxx-yyyy.ngrok.io`)

#### Opção B: Localhost (Apenas para testes locais)

Se quiser testar apenas localmente, use `http://localhost:3000/webhook`.

### 4️⃣ Configurar Webhook no GitHub

1. **Abra seu repositório** (https://github.com/seu-usuario/guiaseller.leads)
2. Vá a **Settings** → **Webhooks** → **Add webhook**
3. Preencha:

| Campo | Valor |
|-------|-------|
| **Payload URL** | `https://xxxx-yyyy.ngrok.io/webhook` (ou localhost para dev) |
| **Content type** | `application/json` |
| **Which events?** | Selecione "Let me select individual events" |

4. **Selecione eventos:**
   - ✅ Pushes
   - ✅ Pull requests
   - ✅ Releases

   Desmarque os outros.

5. **Clique em "Add webhook"**

---

## ▶️ Iniciar Sistema

### Terminal 1: Servidor (Express + Webhooks)

```bash
npm run server
```

Verá:
```
✅ All Discord bots started successfully
✅ GitHub webhook handler registered
🌐 Server running on http://localhost:3000
📊 Endpoints:
   GET  /health              - Health check
   POST /webhook             - GitHub webhook receiver
   GET  /webhook/health      - Webhook health check
```

### Terminal 2: Testar Webhooks (Opcional)

```bash
npm run webhook:test
```

Isso enviará eventos de teste para validar a integração.

---

## 🧪 Testar Webhooks

### Método 1: Push Real para GitHub

1. **Faça uma alteração local:**
   ```bash
   echo "# Test webhook" >> README.md
   git add README.md
   git commit -m "test: webhook validation"
   git push origin main
   ```

2. **Verificar Discord:**
   - Vá a #deployments
   - Você deve ver uma mensagem do Gage bot com os detalhes do push

### Método 2: Reenviar Webhook do GitHub

1. **GitHub** → **Settings** → **Webhooks** → **[seu webhook]**
2. **Aba "Recent Deliveries"**
3. Clique no último evento
4. Clique em **"Redeliver"**
5. **Verificar Discord** se a mensagem aparece

### Método 3: Teste Manual (curl)

```bash
# Terminal com servidor rodando: npm run server

# Em outro terminal:
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "pusher": {"name": "seu-usuario"},
    "ref": "refs/heads/main",
    "commits": [{"message": "test commit"}],
    "repository": {"name": "guiaseller.leads", "full_name": "seu-usuario/guiaseller.leads"},
    "compare": "https://github.com/seu-usuario/guiaseller.leads/compare/abc...def"
  }'
```

---

## 📦 Estrutura de Código

```
src/
├── server.js                 ← Servidor principal (Express + Bots + Webhooks)
├── webhooks/
│   ├── github-webhook.js     ← Handler de eventos GitHub
│   └── utils.js              ← Formatação de embeds Discord
├── bots/
│   ├── index.js              ← Orquestrador (todos 5 bots)
│   ├── dex-bot.js            ← @dev
│   ├── quinn-bot.js          ← @qa
│   ├── aria-bot.js           ← @architect
│   ├── morgan-bot.js         ← @pm
│   └── gage-bot.js           ← @devops
└── utils/
    └── logger.js             ← Logging
```

---

## 🔐 Segurança

### Validação de Webhook (Opcional)

Para produção, configure um **webhook secret** no GitHub:

1. **GitHub** → **Settings** → **Webhooks** → **[seu webhook]**
2. **Secret**: Gere uma chave (ex: `your-secret-key`)
3. Atualize `src/webhooks/github-webhook.js`:

```javascript
static validateWebhookSignature(req, secret) {
  const crypto = require('crypto');
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${hash}` === signature;
}
```

4. Chame em `handleWebhook()`:
```javascript
if (!GitHubWebhookUtils.validateWebhookSignature(req, process.env.GITHUB_WEBHOOK_SECRET)) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## 📊 Eventos Suportados

### Push Event

```
📤 Push to guiaseller.leads
seu-usuario pushed 3 commits to main

🔗 Compare: [View changes](...)
📊 Commits
  • feat: implement GitHub webhooks
  • refactor: update Discord integration
  • docs: add webhook documentation
```

### Pull Request Event

```
🔀 PR Opened: Implement GitHub Webhooks
seu-usuario - #42

Branch: `feature/github-webhooks` → `main`
Changes: +150 -20
Status: Open

🔗 Link: [View PR](...)
```

### Release Event

```
🎉 Release: v1.1.0
Major features include webhook integration and improved Discord messaging...

Version: v1.1.0
Status: Stable

🔗 Link: [View Release](...)
```

---

## 🚨 Troubleshooting

### ❌ Webhook não recebe eventos

1. **Verificar servidor está rodando:**
   ```bash
   curl http://localhost:3000/health
   ```
   Deve retornar `{"status":"ok"}`

2. **Verificar webhook no GitHub:**
   - **Settings** → **Webhooks** → Seu webhook
   - Seção "Recent Deliveries"
   - Procure por status `200` (sucesso) ou erros (status vermelho)

3. **Se está usando ngrok:**
   - Verificar se tunnel está ativo: `ngrok http 3000`
   - Webhook URL no GitHub deve estar atualizada (URL muda a cada inicialização)

### ❌ Mensagens não aparecem no Discord

1. **Verificar channel IDs no .env:**
   ```bash
   echo $DISCORD_DEPLOYMENTS_CHANNEL_ID
   echo $DISCORD_DEV_CHANNEL_ID
   echo $DISCORD_ANNOUNCEMENTS_CHANNEL_ID
   ```

2. **Verificar bot tem permissão no canal:**
   - Discord → Servidor → #deployments (ou outro canal)
   - Clique em ⚙️ (settings)
   - **Roles** → Procure pelos bots (Dex, Quinn, etc.)
   - Permissões: ✅ View Channel, ✅ Send Messages, ✅ Embed Links

3. **Verificar logs:**
   ```bash
   tail -f .aios/logs/agent.log  # Se disponível
   npm run server 2>&1 | grep -i webhook
   ```

### ❌ Erro: "Discord client not ready"

1. **Bots podem estar offline:**
   - Verificar `.env` com tokens válidos
   - Executar `npm run bot:test` para validar conexão Dex

2. **Servidor não esperou bots iniciarem:**
   - Logs mostram: "Discord client not ready"
   - Solução: Aumentar delay em `src/server.js` antes de registrar webhooks

---

## 📝 Próximos Passos

1. **Conectar ao banco de dados:** Crons lerão histórias e métricas do banco
2. **Implementar CI/CD:** GitHub Actions para lint, test, build
3. **Produção:** Deployar em Railway, Vercel ou Docker
4. **Monitoramento:** Sentry para erros, Uptime para health checks

---

## 📚 Referências

- [Discord.js Webhooks](https://discordjs.guide/)
- [GitHub Webhooks API](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)
- [Express.js](https://expressjs.com/)

---

**Status:** ✅ Pronto para usar em development

**Data atualizada:** 2026-02-26

**Próximo passo:** Teste um push para GitHub e verifique se a mensagem aparece em #deployments!
