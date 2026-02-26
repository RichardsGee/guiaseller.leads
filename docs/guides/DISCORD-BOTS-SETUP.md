# Discord Bots Setup Guide

## Overview

GuiaSeller Leads uses 5 Discord bots to represent each AIOS agent. Each bot handles specific responsibilities and communicates with the team in dedicated channels.

### The 5 Agents

| Bot | Agent ID | Persona | Focus |
|-----|----------|---------|-------|
| **Dex** | @dev | Developer | Code implementation, debugging, testing |
| **Quinn** | @qa | QA Specialist | Quality assurance, test validation |
| **Aria** | @architect | Architect | System design, architecture decisions |
| **Morgan** | @pm | Product Manager | Planning, requirements, epic management |
| **Gage** | @devops | DevOps | CI/CD, deployment, infrastructure |

---

## Prerequisites

### Required Tools
- Node.js 18+ with discord.js library
- Discord Bot Applications (created in Discord Developer Portal)
- Discord Server (created or existing)
- Environment file `.env` with bot tokens

### Discord Developer Portal Setup

1. **Create Bot Applications** (one for each agent):
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name: `Dex Bot`, `Quinn Bot`, `Aria Bot`, `Morgan Bot`, `Gage Bot`
   - Go to "Bot" section
   - Click "Add Bot"
   - Copy token and save to `.env`

2. **Configure Bot Permissions**:
   - OAuth2 → URL Generator
   - Scopes: `bot`
   - Permissions:
     - `Send Messages`
     - `Read Messages/View Channels`
     - `Manage Messages`
     - `Embed Links`
     - `Attach Files`
     - `Read Message History`
   - Copy generated URL and invite bot to Discord server

3. **Get IDs** (Discord Developer Mode):
   - Enable Developer Mode in Discord (User Settings → Advanced)
   - Right-click Server → Copy Server ID
   - Right-click Channel → Copy Channel ID

---

## Environment Configuration

### Required Environment Variables

```env
# Discord Bot Tokens (get from Discord Developer Portal)
DISCORD_DEV_BOT_TOKEN=your_dex_bot_token
DISCORD_QA_BOT_TOKEN=your_quinn_bot_token
DISCORD_ARCHITECT_BOT_TOKEN=your_aria_bot_token
DISCORD_PM_BOT_TOKEN=your_morgan_bot_token
DISCORD_DEVOPS_BOT_TOKEN=your_gage_bot_token

# Discord Server Configuration
DISCORD_SERVER_ID=1476636850692161699

# Discord Channels (create these in your Discord server)
DISCORD_GENERAL_CHANNEL_ID=1476636857898111127
DISCORD_DEV_CHANNEL_ID=channel_id_here
DISCORD_QA_CHANNEL_ID=channel_id_here
DISCORD_ARCHITECTURE_CHANNEL_ID=channel_id_here
DISCORD_PM_CHANNEL_ID=channel_id_here
DISCORD_DEPLOYMENTS_CHANNEL_ID=channel_id_here
DISCORD_STANDUP_CHANNEL_ID=channel_id_here
DISCORD_NOTIFICATIONS_CHANNEL_ID=channel_id_here

# Optional: Logging
LOG_LEVEL=info
NODE_ENV=development
```

---

## Discord Server Channel Structure

Create these channels in your Discord server:

### Team Communication
- **#general** - General announcements and discussions
- **#announcements** - Important project announcements
- **#random** - Off-topic discussions

### Agent Channels
- **#dev** - Dex bot (Development discussions)
- **#qa** - Quinn bot (QA and testing)
- **#architecture** - Aria bot (Architecture decisions)
- **#pm** - Morgan bot (Product management)
- **#devops** - Gage bot (Deployment and CI/CD)

### Operations
- **#standup** - Daily standup reports
- **#deployments** - Deployment notifications
- **#notifications** - System alerts and monitoring
- **#monitoring** - Performance and error logs

### Documentation
- **#documentation** - Links to docs and guides
- **#meeting-notes** - Meeting summaries
- **#retrospectives** - Sprint retrospectives

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install discord.js dotenv
```

### 2. Fill Environment Variables

Copy `.env.example` to `.env` and fill in all Discord bot tokens and channel IDs:

```bash
cp .env.example .env
```

Edit `.env` and add:
- All 5 bot tokens (get from Discord Developer Portal)
- Discord Server ID
- All channel IDs (get from Discord with Developer Mode enabled)

### 3. Test Bot Connection

Run the test script to validate all bot tokens and connections:

```bash
node scripts/test-discord-bot.js
```

Expected output:
```
✅ Bot logged in as: Dex#1234
✅ Connected to server: GuiaSeller Leads
✅ Connected to channel: #dev
🎉 All tests passed! Discord bot is ready.
```

### 4. Start All Bots

```bash
npm run bots:start
```

Or start individual bots:
```bash
npm run bot:dex      # Start Dex bot only
npm run bot:quinn    # Start Quinn bot only
npm run bot:aria     # Start Aria bot only
npm run bot:morgan   # Start Morgan bot only
npm run bot:gage     # Start Gage bot only
```

---

## Bot Commands

### Dex Bot (@dev)

```
@dex              Show Dex capabilities
!dev status       Show bot status
!dev help         Show available commands
```

### Quinn Bot (@qa)

*To be implemented*

### Aria Bot (@architect)

*To be implemented*

### Morgan Bot (@pm)

*To be implemented*

### Gage Bot (@devops)

*To be implemented*

---

## Workflow Integration

### Story Assignment Flow

1. **Create Story** (`docs/stories/1.x.x.story.md`)
2. **Mention Agent** in Discord channel
   ```
   @dex Story 1.3.1 ready for implementation
   ```
3. **Agent Responds** with acknowledgment
4. **Updates Channel** with progress
5. **Reports Status** in #standup

### Example Daily Standup (Automated)

Bots post daily updates to #standup at 10:00 AM:

```
✅ Yesterday: Completed database setup
🔄 Today: Starting Prisma ORM implementation
🚧 Blocker: Waiting for DB credentials
```

---

## Troubleshooting

### Bot won't connect
1. Verify bot token is correct in `.env`
2. Check Discord Developer Portal - token should match
3. Ensure bot is invited to the server
4. Check server ID in `.env`

### "Missing Permissions" error
1. Go to Discord Developer Portal
2. Bot → Permissions → Enable required permissions
3. Re-generate OAuth2 URL and re-invite bot

### "Invalid Channel ID"
1. Enable Developer Mode in Discord
2. Right-click channel → "Copy ID"
3. Verify ID is correct in `.env`

### Timeout/Connection issues
1. Check internet connection
2. Verify Discord is not rate-limiting the bot
3. Increase timeout in `src/bots/dex-bot.js` (line 78)

---

## Advanced Configuration

### Custom Bot Responses

Edit bot response templates:
- `src/bots/dex-bot.js` - Dex bot responses
- `src/bots/quinn-bot.js` - Quinn bot responses
- `src/bots/aria-bot.js` - Aria bot responses
- `src/bots/morgan-bot.js` - Morgan bot responses
- `src/bots/gage-bot.js` - Gage bot responses

### Event Logging

All bot events are logged to `src/utils/logger.js`. Change log level in `.env`:

```env
LOG_LEVEL=debug  # More verbose output
LOG_LEVEL=info   # Normal output (default)
LOG_LEVEL=warn   # Warnings only
LOG_LEVEL=error  # Errors only
```

### Rate Limiting

Discord has rate limits. Bots should:
- Cache responses where possible
- Wait between bulk operations
- Use Discord's built-in rate limiting handling

---

## Package Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "bots:start": "node src/bots/index.js",
    "bot:dex": "node scripts/test-discord-bot.js",
    "bot:test": "node scripts/test-discord-bot.js",
    "bots:stop": "kill %NODE_PID%"
  }
}
```

---

## Security Best Practices

⚠️ **IMPORTANT:**

1. **Never commit `.env`** - Add to `.gitignore`
2. **Rotate tokens regularly** - Regenerate in Discord Developer Portal
3. **Use environment variables** - Never hardcode tokens
4. **Limit bot permissions** - Only grant what's needed
5. **Audit bot access** - Review who can invoke bot commands
6. **Log all actions** - Monitor bot activity

---

## Next Steps

1. ✅ Setup Discord Server & create 5 bots
2. ✅ Fill `.env` with all tokens and channel IDs
3. ✅ Run `npm run bot:test` to validate
4. ✅ Run `npm run bots:start` to start bots
5. ⏳ Implement remaining 4 bots (Quinn, Aria, Morgan, Gage)
6. ⏳ Setup daily standup automation
7. ⏳ Configure story assignment flow

---

**Questions?** Check `.aios-core/agents/` for each agent's persona and guidelines.

---

*Last Updated: 2026-02-26*
