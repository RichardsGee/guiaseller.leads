/**
 * Server - Discord Bots + GitHub Webhooks Integration
 * Combina orquestrador de bots Discord com handler de webhooks GitHub
 * Roda em localhost:3000 para dev, pronto para produção
 */

import express from 'express';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import AgentBotOrchestrator from './bots/index.js';
import { GitHubWebhookHandler } from './webhooks/github-webhook.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Inicializar sistema
async function initializeSystem() {
  try {
    logger.info('🚀 Starting GuiaSeller Leads - AIOS Discord + GitHub Integration');

    // 1. Inicializar bots Discord
    logger.info('📡 Starting Discord bots...');
    const orchestrator = new AgentBotOrchestrator();
    await orchestrator.startAll();
    logger.info('✅ All Discord bots started successfully');

    // 2. Registrar webhook handler
    logger.info('🔌 Setting up GitHub webhook handler...');
    const webhookHandler = new GitHubWebhookHandler(orchestrator.bots.dex.client);
    app.use('/', webhookHandler.getRouter());
    logger.info('✅ GitHub webhook handler registered');

    // 3. Iniciar servidor Express
    const server = app.listen(PORT, () => {
      logger.info(`🌐 Server running on http://localhost:${PORT}`);
      logger.info('📊 Endpoints:');
      logger.info('   GET  /health              - Health check');
      logger.info('   POST /webhook             - GitHub webhook receiver');
      logger.info('   GET  /webhook/health      - Webhook health check');
      logger.info('');
      logger.info('🎯 Ready for GitHub webhooks!');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('⏹️  Shutting down gracefully...');
      server.close(async () => {
        await orchestrator.stopAll();
        logger.info('✅ Server stopped');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to initialize system:', error);
    process.exit(1);
  }
}

// Iniciar se executado diretamente
if (process.argv[1].includes('server.js')) {
  initializeSystem();
}

export default app;
export { initializeSystem };
