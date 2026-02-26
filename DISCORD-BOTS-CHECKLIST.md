# Discord Bots Setup Checklist ✓

## Phase 1: Discord Developer Portal Setup

### Create 5 Bot Applications

- [ ] **Dex Bot** (@dev)
  - [ ] Create application in Discord Developer Portal
  - [ ] Create bot user
  - [ ] Copy token → `.env` as `DISCORD_DEV_BOT_TOKEN`
  - [ ] Set permissions: Send Messages, Read Messages, Manage Messages, Embed Links

- [ ] **Quinn Bot** (@qa)
  - [ ] Create application in Discord Developer Portal
  - [ ] Create bot user
  - [ ] Copy token → `.env` as `DISCORD_QA_BOT_TOKEN`
  - [ ] Set permissions (same as Dex)

- [ ] **Aria Bot** (@architect)
  - [ ] Create application in Discord Developer Portal
  - [ ] Create bot user
  - [ ] Copy token → `.env` as `DISCORD_ARCHITECT_BOT_TOKEN`
  - [ ] Set permissions (same as Dex)

- [ ] **Morgan Bot** (@pm)
  - [ ] Create application in Discord Developer Portal
  - [ ] Create bot user
  - [ ] Copy token → `.env` as `DISCORD_PM_BOT_TOKEN`
  - [ ] Set permissions (same as Dex)

- [ ] **Gage Bot** (@devops)
  - [ ] Create application in Discord Developer Portal
  - [ ] Create bot user
  - [ ] Copy token → `.env` as `DISCORD_DEVOPS_BOT_TOKEN`
  - [ ] Set permissions (same as Dex)

---

## Phase 2: Discord Server Setup

### Create Discord Server

- [ ] Create new Discord server "GuiaSeller Leads"
- [ ] Get Server ID (Developer Mode: Right-click → Copy ID)
- [ ] Add Server ID to `.env` as `DISCORD_SERVER_ID`

### Create Channels

**Team Channels:**
- [ ] #general → Save ID as `DISCORD_GENERAL_CHANNEL_ID`
- [ ] #announcements → Save ID as `DISCORD_ANNOUNCEMENTS_CHANNEL_ID`
- [ ] #random → Save ID as `DISCORD_RANDOM_CHANNEL_ID`

**Agent Channels:**
- [ ] #dev → Save ID as `DISCORD_DEV_CHANNEL_ID`
- [ ] #qa → Save ID as `DISCORD_QA_CHANNEL_ID`
- [ ] #architecture → Save ID as `DISCORD_ARCHITECTURE_CHANNEL_ID`
- [ ] #pm → Save ID as `DISCORD_PM_CHANNEL_ID`
- [ ] #devops → Save ID as `DISCORD_DEPLOYMENTS_CHANNEL_ID`

**Operations Channels:**
- [ ] #standup → Save ID as `DISCORD_STANDUP_CHANNEL_ID`
- [ ] #monitoring → Save ID as `DISCORD_MONITORING_CHANNEL_ID`
- [ ] #notifications → Save ID as `DISCORD_NOTIFICATIONS_CHANNEL_ID`

### Invite Bots to Server

Generate OAuth2 URLs for each bot:

1. Go to Discord Developer Portal → Application
2. OAuth2 → URL Generator
3. Scopes: `bot`
4. Permissions: Copy all checkboxes
5. Copy generated URL
6. Paste in browser and select server

- [ ] Dex Bot invited
- [ ] Quinn Bot invited
- [ ] Aria Bot invited
- [ ] Morgan Bot invited
- [ ] Gage Bot invited

---

## Phase 3: Environment Configuration

### Fill `.env` File

```bash
# Copy .env.example to .env
cp .env.example .env
```

- [ ] `DISCORD_DEV_BOT_TOKEN` - Dex bot token
- [ ] `DISCORD_QA_BOT_TOKEN` - Quinn bot token
- [ ] `DISCORD_ARCHITECT_BOT_TOKEN` - Aria bot token
- [ ] `DISCORD_PM_BOT_TOKEN` - Morgan bot token
- [ ] `DISCORD_DEVOPS_BOT_TOKEN` - Gage bot token
- [ ] `DISCORD_SERVER_ID` - Your server ID
- [ ] `DISCORD_GENERAL_CHANNEL_ID` - #general channel ID
- [ ] `DISCORD_DEV_CHANNEL_ID` - #dev channel ID
- [ ] `DISCORD_QA_CHANNEL_ID` - #qa channel ID
- [ ] `DISCORD_ARCHITECTURE_CHANNEL_ID` - #architecture channel ID
- [ ] `DISCORD_PM_CHANNEL_ID` - #pm channel ID
- [ ] `DISCORD_DEPLOYMENTS_CHANNEL_ID` - #devops channel ID
- [ ] `DISCORD_STANDUP_CHANNEL_ID` - #standup channel ID
- [ ] `NODE_ENV=development` (or production)

---

## Phase 4: Installation & Testing

### Install Dependencies

```bash
npm install discord.js dotenv
```

- [ ] discord.js installed
- [ ] dotenv installed

### Run Test Script

```bash
node scripts/test-discord-bot.js
```

Expected output:
```
✅ Bot logged in as: Dex#XXXX
✅ Connected to server: GuiaSeller Leads
✅ Connected to channel: #dev
🎉 All tests passed!
```

- [ ] Test script passes for Dex bot
- [ ] Bot connects to Discord server
- [ ] Bot can access #dev channel
- [ ] Test message sent and deleted successfully

---

## Phase 5: Start Bots

### Launch All Bots

```bash
npm run bots:start
```

Expected output:
```
✅ Dex Bot ready! Logged in as Dex#XXXX
✅ Connected to server GuiaSeller Leads | Channel #dev
🎉 All bots are running!
```

- [ ] All bots start successfully
- [ ] No errors in console
- [ ] Bots show as "Online" in Discord

### Test Bot in Discord

1. Go to #dev channel in Discord
2. Type: `@Dex`
3. Bot should respond with capabilities message

- [ ] Dex bot responds to mentions
- [ ] Embed message displays correctly
- [ ] Bot can send messages to channels

---

## Phase 6: Implementation (For @dev)

### Complete Implementation

These files are created but need full implementation:

- [ ] `src/bots/quinn-bot.js` - Implement Quinn (QA) bot
- [ ] `src/bots/aria-bot.js` - Implement Aria (Architect) bot
- [ ] `src/bots/morgan-bot.js` - Implement Morgan (PM) bot
- [ ] `src/bots/gage-bot.js` - Implement Gage (DevOps) bot
- [ ] Update `src/bots/index.js` to start all 5 bots
- [ ] Add npm scripts to `package.json`
- [ ] Implement daily standup automation
- [ ] Implement story assignment flow

---

## Phase 7: Verification & Troubleshooting

### Connectivity

- [ ] Run `node scripts/test-discord-bot.js` successfully
- [ ] All 5 bots show as Online in Discord
- [ ] Bots can send messages to channels
- [ ] Bots can read messages from channels

### Functionality

- [ ] `@dex` responds in #dev
- [ ] `!dev status` returns bot status
- [ ] `!dev help` shows available commands
- [ ] Mention other bots work (when implemented)

### Error Handling

- [ ] No authentication errors
- [ ] No permission errors
- [ ] No timeout errors
- [ ] Graceful shutdown with Ctrl+C

---

## Current Status

### ✅ Completed

- [x] Created test script (`scripts/test-discord-bot.js`)
- [x] Implemented Dex bot (`src/bots/dex-bot.js`)
- [x] Created orchestrator (`src/bots/index.js`)
- [x] Created logger utility (`src/utils/logger.js`)
- [x] Created setup guide (`docs/guides/DISCORD-BOTS-SETUP.md`)
- [x] Created this checklist

### 📝 In Progress

- [ ] User fills `.env` with bot tokens and channel IDs
- [ ] User creates Discord server and channels
- [ ] User runs test script to validate

### ⏳ Pending

- [ ] Implement remaining 4 bots
- [ ] Setup daily standup automation
- [ ] Implement story assignment flow
- [ ] Deploy to production

---

## Quick Start (TL;DR)

1. **Create 5 bots** in Discord Developer Portal (get tokens)
2. **Create Discord server** and channels (get IDs)
3. **Fill `.env`** with all tokens and channel IDs
4. **Run test:** `node scripts/test-discord-bot.js`
5. **Start bots:** `npm run bots:start`
6. **Test in Discord:** Type `@Dex` in #dev channel

---

## Support

- Full guide: `docs/guides/DISCORD-BOTS-SETUP.md`
- Bot code: `src/bots/`
- Logger: `src/utils/logger.js`
- Test script: `scripts/test-discord-bot.js`

Need help? Check the guide or ask @dev to implement the remaining features!

---

*Created: 2026-02-26*
*Status: Ready for Phase 3 (Environment Configuration)*
