# Discord Channel IDs - Copy & Paste Template 📋

Siga estes passos **exatamente como está** para obter os IDs corretamente:

---

## 📋 Passo 1: Ativar Developer Mode

1. Abra Discord
2. Clique em seu ícone (canto inferior esquerdo) → **User Settings** (⚙️)
3. Clique em **Advanced** (em App Settings)
4. Liga o toggle **Developer Mode**
5. Feche as settings

---

## 📋 Passo 2: Criar Canais (se não tiver)

No seu servidor **Guia Seller**:

1. Clique em "**+**" ao lado de "CHANNELS"
2. Clique "**Create Channel**"
3. **Channel name:** `deployments`
4. **Channel type:** Text Channel
5. Clique "**Create**"

**Repita para:**
- `dev` (Text Channel)
- `announcements` (Text Channel)

---

## 🔑 Passo 3: Copiar Channel IDs

Para cada canal, **clique direito** nele:

```
Guia Seller
├── deployments      ← CLICK DIREITO
├── dev              ← CLICK DIREITO
├── announcements    ← CLICK DIREITO
└── ...
```

**Menu aparecerá com opção:**
```
Copy Channel ID
```

**Clique em "Copy Channel ID"**

---

## 📝 Passo 4: Forneça os IDs

Cole os 3 IDs aqui no formato abaixo:

```
ID do #deployments:    ___________________________
ID do #dev:            ___________________________
ID do #announcements:  ___________________________
```

**Exemplo de como deve parecer:**
```
ID do #deployments:    1234567890123456789
ID do #dev:            9876543210987654321
ID do #announcements:  5555666677778888999
```

---

## ✅ Checklist

- [ ] Developer Mode ativado no Discord
- [ ] 3 canais criados (#deployments, #dev, #announcements)
- [ ] 3 Channel IDs copiados
- [ ] IDs fornecidos (veja formato acima)

---

**Depois de fornecer os IDs, vou:**
1. ✅ Atualizar .env
2. ✅ Rodar `npm run server`
3. ✅ Rodar `npm run webhook:test`
4. ✅ Fazer um push real para testar

**Qualquer dúvida, leia:** `WEBHOOK-SETUP-CHECKLIST.md`
