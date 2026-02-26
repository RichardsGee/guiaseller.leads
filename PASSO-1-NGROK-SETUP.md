# Passo 1: GitHub Webhooks + ngrok Setup 🔌

**Status:** ✅ Implementado | ⏳ Aguardando ngrok para webhook real

---

## 📋 O Que Você Tem

✅ Servidor rodando em `http://localhost:3000`
✅ 5 Discord bots online
✅ Webhook handler pronto
✅ Teste local funcionando (`npm run webhook:test`)
✅ Push para GitHub enviado

❌ **Falta:** Configurar ngrok para webhook real funcionar

---

## 🚀 Para Fazer Webhook Real Funcionar:

### PASSO 1: Instalar ngrok (2 min)

```bash
brew install ngrok

# Verificar instalação
ngrok --version
```

### PASSO 2: Iniciar ngrok (Terminal 2)

Seu Terminal 1 já tem:
```bash
npm run server  # ✅ Rodando em localhost:3000
```

Abra **Terminal 2** e rode:
```bash
ngrok http 3000
```

Você verá:
```
Forwarding    https://xxxx-yyyy.ngrok.io -> http://localhost:3000
```

**Copie a URL HTTPS!** (exemplo: `https://xxxx-yyyy.ngrok.io`)

### PASSO 3: Configurar Webhook no GitHub (2 min)

1. Abra: https://github.com/RichardsGee/guiaseller.leads
2. **Settings** → **Webhooks** → **Add webhook**
3. Preencha:

```
Payload URL: https://xxxx-yyyy.ngrok.io/webhook
Content type: application/json
Which events?: Let me select individual events
  ✅ Push
  ✅ Pull requests
  ✅ Releases
```

4. Clique **Add webhook**

### PASSO 4: Testar (1 min)

Em **Terminal 3**, faça um push:

```bash
echo "# ngrok webhook test" >> README.md
git add README.md
git commit -m "test: ngrok webhook validation"
git push origin main
```

Verifique **#deployments** no Discord! 🎯

---

## ⚠️ Importante

- **ngrok URL muda a cada inicialização** → Você precisa atualizar o webhook no GitHub cada vez
- Se vir erro no webhook GitHub, é porque ngrok foi reiniciado
- Solução: Usar ngrok pago ou mudar para produção (Railway/Vercel)

---

## 📚 Documentação Completa

| Arquivo | Propósito |
|---------|-----------|
| **PASSO-1-COMPLETO.md** | Status da implementação |
| **GITHUB-WEBHOOKS-SETUP.md** | Guia detalhado com ngrok |
| **WEBHOOK-SETUP-CHECKLIST.md** | Passo-a-passo |
| **DISCORD-INTENTS-FIX.md** | Como ativar MESSAGE_CONTENT |
| **DISCORD-CHANNELS-SETUP.md** | Como criar canais |

---

## 🎯 Próximo Passo Após ngrok

Quando tiver ngrok funcionando:

1. ✅ Webhook real enviando mensagens
2. ⏳ **Passo 2:** Finalizar Cron System (BD + Discord)
3. ⏳ **Passo 3:** Production Deploy (Docker/PM2)

---

**Pronto?** Instale ngrok e siga os passos acima! 🚀
