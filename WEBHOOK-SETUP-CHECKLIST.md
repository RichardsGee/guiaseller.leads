# GitHub Webhooks Setup Checklist ⚡

## ✅ Problemas Resolvidos

| Problema | Solução | Status |
|----------|---------|--------|
| `npm run dev` não funcionava | Criado `src/index.js` | ✅ |
| Server offline | Implementado `src/server.js` completo | ✅ |
| src/index.js missing | Linked entry point → server.js | ✅ |

---

## 📋 Checklist Rápido (Siga Passo-a-Passo)

### 🎯 PASSO 1: Criar Canais Discord (5 minutos)

**Abra Discord e crie 3 canais:**

```
Guia Seller Server
├── 📤 #deployments     ← Push events (commits)
├── 💻 #dev             ← Pull requests
└── 📢 #announcements   ← Releases
```

**Instruções:**
1. Discord → Guia Seller → "+" ao lado de CHANNELS
2. Create Channel → Digite nome (ex: `deployments`) → Type: Text Channel → Create
3. Repita para `#dev` e `#announcements`

**Resultado esperado:**
- 3 canais criados e visíveis no servidor

---

### 🔑 PASSO 2: Obter Channel IDs (3 minutos)

**Ativar Developer Mode:**
1. Discord → User Settings → Advanced
2. Liga **Developer Mode** (toggle)

**Copiar IDs:**
1. Clique **direito** em `#deployments` → **Copy Channel ID**
2. Cole em um arquivo de texto (temporário)
3. Repita para `#dev` e `#announcements`

**Resultado esperado:**
```
ID do #deployments:    1234567890123456789
ID do #dev:            9876543210987654321
ID do #announcements:  5555666677778888999
```

---

### 📝 PASSO 3: Preencher .env (2 minutos)

**Abra `.env` e substitua:**

```bash
# Encontre essas linhas:
DISCORD_DEPLOYMENTS_CHANNEL_ID="CHANNEL_ID_HERE"
DISCORD_DEV_CHANNEL_ID="CHANNEL_ID_HERE"
DISCORD_ANNOUNCEMENTS_CHANNEL_ID="CHANNEL_ID_HERE"

# Substitua pelos IDs que copiou:
DISCORD_DEPLOYMENTS_CHANNEL_ID="1234567890123456789"
DISCORD_DEV_CHANNEL_ID="9876543210987654321"
DISCORD_ANNOUNCEMENTS_CHANNEL_ID="5555666677778888999"
```

**Salve o arquivo!**

**Resultado esperado:**
- `.env` com 3 channel IDs preenchidos

---

### ▶️ PASSO 4: Iniciar Servidor (Terminal 1)

```bash
npm run server
```

**Esperado ver:**
```
✅ All Discord bots started successfully
✅ GitHub webhook handler registered
🌐 Server running on http://localhost:3000
📊 Endpoints:
   GET  /health              - Health check
   POST /webhook             - GitHub webhook receiver
   GET  /webhook/health      - Webhook health check
```

**Se vir erro:**
- Verifique channel IDs no .env
- Verifique se bots têm permissão nos canais (Discord Settings)

---

### 🧪 PASSO 5: Testar Webhooks (Terminal 2)

```bash
npm run webhook:test
```

**Esperado ver:**
```
✅ All tests completed!
📋 Next steps:
   1. Check Discord channels:
      - #deployments (for push)
      - #dev (for pull requests)
      - #announcements (for releases)
```

**Em Discord, você verá:**

#deployments:
```
📤 Push to guiaseller.leads
seu-usuario pushed 2 commits to main
```

#dev:
```
🔀 PR Opened: Implement GitHub Webhooks
seu-usuario - #42
```

#announcements:
```
🎉 Release: v1.1.0
...
```

---

### 🚀 PASSO 6: Testar com Push Real (GitHub)

**Faça uma alteração local:**
```bash
echo "# Test webhook" >> README.md
git add README.md
git commit -m "test: webhook validation"
git push origin main
```

**Em Discord:**
- Vá a `#deployments`
- Você verá mensagem com seu commit!

---

## 📊 Estrutura Final

Depois de completar tudo:

```
npm run server        (Rodando em outro terminal)
    ↓
Express (port 3000)
    ├── Discord Bots (5)
    │   ├── Dex (@dev)
    │   ├── Quinn (@qa)
    │   ├── Aria (@architect)
    │   ├── Morgan (@pm)
    │   └── Gage (@devops)
    │
    └── GitHub Webhooks
        ├── Push → #deployments
        ├── PR → #dev
        └── Release → #announcements
```

---

## 🎯 Status Atual

| Componente | Status | O Quê |
|-----------|--------|-------|
| **src/index.js** | ✅ Criado | Entry point |
| **src/server.js** | ✅ Criado | Servidor Express |
| **src/webhooks/** | ✅ Criado | Handler GitHub |
| **Discord Bots** | ✅ Pronto | 5 bots online |
| **Canais Discord** | ⏳ VOCÊ | Criar 3 canais |
| **Channel IDs** | ⏳ VOCÊ | Preencher .env |
| **npm run dev** | ✅ Fixed | Agora funciona |
| **npm run server** | ✅ Pronto | Rodar teste |

---

## 🔧 Troubleshooting

### ❌ "npm run dev" não funciona

```bash
npm run server        # Use isso! É mais correto
```

### ❌ Server não inicia

```bash
# Verificar se há erro de sintaxe:
node -c src/server.js

# Rodar com mais detalhes:
npm run server 2>&1
```

### ❌ Mensagens não aparecem em Discord

**Checklist:**
1. [ ] Canais criados no Discord
2. [ ] Channel IDs no .env (não "CHANNEL_ID_HERE")
3. [ ] Developer Mode ativado no Discord
4. [ ] IDs corretos (copiar e colar cuidadosamente)
5. [ ] Bots têm permissão: Discord → Channel Settings → Roles → Dex/Quinn/etc

### ❌ Error: "Discord client not ready"

```bash
# Bots estão offline. Validar:
npm run bot:test

# Ou verificar .env:
grep DISCORD_DEV_BOT_TOKEN .env
grep DISCORD_QA_BOT_TOKEN .env
# etc - devem ter tokens válidos
```

---

## 📚 Referências

- **Setup Detalhado:** `docs/guides/GITHUB-WEBHOOKS-SETUP.md`
- **Canais Discord:** `DISCORD-CHANNELS-SETUP.md`
- **Template .env:** `.env.webhooks.example`
- **Resumo:** `GITHUB-WEBHOOKS-SUMMARY.md`

---

## ⏱️ Tempo Total

- Criar canais: **5 min**
- Obter IDs: **3 min**
- Preencher .env: **2 min**
- Testar: **5 min**

**Total: ~15 minutos** ⚡

---

## 🎉 Próximo Passo

Depois de tudo funcionando:

```bash
Passo 1: GitHub Webhooks ✅
    ↓
Passo 2: Cron System (daily standup, metrics, etc)
    ↓
Passo 3: Production Deployment
```

---

**Pronto?** Comece pelo **PASSO 1: Criar Canais Discord**! 🚀
