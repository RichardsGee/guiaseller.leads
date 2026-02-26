# Discord Bot Intents Fix ⚙️

**Erro:** `Used disallowed intents`

**Causa:** Bots precisam de permissão para ler mensagens (MessageContent Intent)

---

## 🔧 Solução Rápida (5 minutos)

Para **CADA BOT** (Dex, Quinn, Aria, Morgan, Gage):

1. Abra https://discord.com/developers/applications
2. Clique no bot (ex: "Dex Agent")
3. **Vá a "Bot"** (menu esquerdo)
4. Procure por **"PRIVILEGED GATEWAY INTENTS"**
5. **Ative essas 4 intents:**
   - ✅ GUILDS
   - ✅ GUILD_MESSAGES
   - ✅ DIRECT_MESSAGES
   - ✅ MESSAGE_CONTENT ← **CRUCIAL**

6. Clique **Save Changes**

---

## 📋 Quais Bots Precisam?

```
1. Dex Agent         (DISCORD_DEV_BOT_TOKEN)
2. Quinn            (DISCORD_QA_BOT_TOKEN)
3. Aria             (DISCORD_ARCHITECT_BOT_TOKEN)
4. Morgan           (DISCORD_PM_BOT_TOKEN)
5. Gage             (DISCORD_DEVOPS_BOT_TOKEN)
```

---

## ✅ Passo-a-Passo Visual

### Para o Dex Bot:

```
Discord Developer Portal
  ↓
Applications
  ↓
Dex Agent (Clique)
  ↓
Bot (menu esquerdo)
  ↓
PRIVILEGED GATEWAY INTENTS
  ├─ ☑️ GUILDS
  ├─ ☑️ GUILD_MESSAGES
  ├─ ☑️ DIRECT_MESSAGES
  └─ ☑️ MESSAGE_CONTENT ← IMPORTANTE!
  ↓
Save Changes
```

**Repita para Quinn, Aria, Morgan, Gage**

---

## 🧪 Testar Depois

Quando tiver ativado os intents, rode:

```bash
npm run server
```

Esperado ver:
```
✅ Dex (@dev) - Development
✅ Quinn (@qa) - Quality Assurance
✅ Aria (@architect) - Architecture
✅ Morgan (@pm) - Product Management
✅ Gage (@devops) - Deployment
```

---

## 💡 Dica: Usar Scope de Intents Correto

Se Discord disser "Esta intent requer gateway connection", significa que:
- O bot precisa estar **online** no servidor Discord
- Quando o bot se conecta (npm run server), Discord verifica as intents
- Se não estiverem habilitadas, conecta falha

**Solução:** Ativar intents → Testar novamente

---

## 🚀 Próximo Passo

Depois que todos os bots estiverem online, vamos testar webhooks:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run webhook:test
```

---

Já ativou os intents? Se sim, rode novamente: `npm run server` 🚀
