/**
 * AIOS Discord Bots Orchestration
 * Central entry point for all 5 agent bots
 *
 * Agents:
 * - Dex (@dev) - Code development and implementation
 * - Quinn (@qa) - Testing and quality assurance
 * - Aria (@architect) - Architecture and design
 * - Morgan (@pm) - Product management and planning
 * - Gage (@devops) - Deployment and CI/CD
 */

import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import DexBot from './dex-bot.js';
import QuinnBot from './quinn-bot.js';
import AriaBot from './aria-bot.js';
import MorganBot from './morgan-bot.js';
import GageBot from './gage-bot.js';

dotenv.config();

class AgentBotOrchestrator {
  constructor() {
    this.bots = {
      dex: new DexBot(),
      quinn: new QuinnBot(),
      aria: new AriaBot(),
      morgan: new MorganBot(),
      gage: new GageBot(),
    };

    this.validateEnv();
  }

  validateEnv() {
    const required = [
      'DISCORD_DEV_BOT_TOKEN',
      'DISCORD_QA_BOT_TOKEN',
      'DISCORD_ARCHITECT_BOT_TOKEN',
      'DISCORD_PM_BOT_TOKEN',
      'DISCORD_DEVOPS_BOT_TOKEN',
      'DISCORD_SERVER_ID',
      'DISCORD_GENERAL_CHANNEL_ID',
      'NODE_ENV',
    ];

    const missing = required.filter(v => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
  }

  async startAll() {
    logger.info('🚀 Starting AIOS Discord Bot Orchestration...\n');

    try {
      // Start all 5 bots in parallel (with error handling per bot)
      const botEntries = Object.entries(this.bots);
      const startPromises = [];
      const results = {};

      for (const [name, bot] of botEntries) {
        logger.info(`Starting ${name.charAt(0).toUpperCase() + name.slice(1)} Bot...`);

        // Wrap each bot start in try-catch to prevent one failure from stopping others
        startPromises.push(
          bot.start()
            .then(() => {
              results[name] = true;
            })
            .catch(error => {
              logger.warn(`⚠️  ${name} bot failed to start: ${error.message}`);
              results[name] = false;
            })
        );
      }

      await Promise.all(startPromises);

      // Check how many bots started successfully
      const successCount = Object.values(results).filter(v => v).length;
      const totalCount = Object.values(results).length;

      if (successCount === 0) {
        throw new Error('No bots could start! Check your Discord tokens.');
      }

      logger.info(`\n🎉 ${successCount}/${totalCount} bots are running!\n`);
      logger.info('📊 Agent Bots Status:');
      for (const [name, success] of Object.entries(results)) {
        const status = success ? '✅' : '❌';
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        if (name === 'dex') logger.info(`${status} Dex (@dev) - Development`);
        else if (name === 'quinn') logger.info(`${status} Quinn (@qa) - Quality Assurance`);
        else if (name === 'aria') logger.info(`${status} Aria (@architect) - Architecture`);
        else if (name === 'morgan') logger.info(`${status} Morgan (@pm) - Product Management`);
        else if (name === 'gage') logger.info(`${status} Gage (@devops) - Deployment`);
      }
      logger.info('');
      logger.info(`📍 Discord Server ID: ${process.env.DISCORD_SERVER_ID}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}\n`);

      if (successCount < totalCount) {
        logger.warn(`⚠️  ${totalCount - successCount} bot(s) failed to start. Check your Discord tokens!`);
        logger.info(`💡 See SERVER-STATUS.md for solutions\n`);
      }

    } catch (error) {
      logger.error('Failed to start bots:', error);
      process.exit(1);
    }
  }

  async stopAll() {
    logger.info('Stopping all bots...');
    const stopPromises = [];

    for (const [name, bot] of Object.entries(this.bots)) {
      try {
        stopPromises.push(bot.stop());
        logger.info(`✅ ${name} stopped`);
      } catch (error) {
        logger.error(`Failed to stop ${name}:`, error);
      }
    }

    await Promise.all(stopPromises);
  }

  getBot(name) {
    return this.bots[name.toLowerCase()];
  }

  getAllBots() {
    return this.bots;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n⏹️  Shutting down gracefully...');
  if (global.orchestrator) {
    await global.orchestrator.stopAll();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  if (global.orchestrator) {
    await global.orchestrator.stopAll();
  }
  process.exit(0);
});

export default AgentBotOrchestrator;

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new AgentBotOrchestrator();
  global.orchestrator = orchestrator;
  orchestrator.startAll().catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}
