/**
 * GitHub Webhook Handler
 * Processa eventos do GitHub (push, PR, releases) e envia mensagens ao Discord
 */

import { Router } from 'express';
import logger from '../utils/logger.js';
import GitHubWebhookUtils from './utils.js';

export class GitHubWebhookHandler {
  constructor(discordClient) {
    this.client = discordClient;
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    /**
     * POST /webhook
     * Recebe eventos do GitHub e roteia para handlers específicos
     */
    this.router.post('/webhook', async (req, res) => {
      try {
        const eventType = req.headers['x-github-event'];
        const deliveryId = req.headers['x-github-delivery'];

        logger.info(`🔔 GitHub Webhook Event: ${eventType} (Delivery: ${deliveryId})`);

        // Validar payload
        if (!req.body || !req.body.repository) {
          logger.warn('❌ Invalid webhook payload');
          return res.status(400).json({ error: 'Invalid payload' });
        }

        // Rotear para handlers específicos
        switch (eventType) {
          case 'push':
            await this.handlePushEvent(req.body);
            break;
          case 'pull_request':
            await this.handlePullRequestEvent(req.body);
            break;
          case 'release':
            await this.handleReleaseEvent(req.body);
            break;
          default:
            logger.debug(`⏭️  Skipping unhandled event type: ${eventType}`);
        }

        res.status(200).json({ success: true, event: eventType });
      } catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    /**
     * GET /webhook/health
     * Health check endpoint
     */
    this.router.get('/webhook/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        clientConnected: this.client?.isReady?.() ?? false
      });
    });
  }

  /**
   * Handler para eventos de Push
   */
  async handlePushEvent(payload) {
    try {
      const { embed, branch } = GitHubWebhookUtils.formatPushEvent(payload);
      const channelId = process.env.DISCORD_DEPLOYMENTS_CHANNEL_ID;

      await this.sendToDiscord(channelId, { embeds: [embed] }, 'Push');
      logger.info(`✅ Push event processed: ${branch}`);
    } catch (error) {
      logger.error('Error handling push event:', error);
      throw error;
    }
  }

  /**
   * Handler para eventos de Pull Request
   */
  async handlePullRequestEvent(payload) {
    try {
      const { action, pull_request } = payload;
      const { embed } = GitHubWebhookUtils.formatPullRequestEvent(payload);
      const channelId = process.env.DISCORD_DEV_CHANNEL_ID;

      await this.sendToDiscord(channelId, { embeds: [embed] }, 'Pull Request');
      logger.info(`✅ PR event processed: #${pull_request.number} (${action})`);
    } catch (error) {
      logger.error('Error handling pull request event:', error);
      throw error;
    }
  }

  /**
   * Handler para eventos de Release
   */
  async handleReleaseEvent(payload) {
    try {
      const { action, release } = payload;

      // Apenas processar releases publicadas
      if (action !== 'published') {
        logger.debug(`⏭️  Skipping release action: ${action}`);
        return;
      }

      const { embed } = GitHubWebhookUtils.formatReleaseEvent(payload);
      const channelId = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID;

      await this.sendToDiscord(channelId, { embeds: [embed] }, 'Release');
      logger.info(`✅ Release event processed: ${release.tag_name}`);
    } catch (error) {
      logger.error('Error handling release event:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem formatada para o Discord
   */
  async sendToDiscord(channelId, message, eventType) {
    if (!channelId) {
      logger.warn(`⚠️  No channel configured for ${eventType} events`);
      return;
    }

    if (!this.client?.isReady?.()) {
      logger.warn(`⚠️  Discord client not ready, cannot send ${eventType} message`);
      return;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      await channel.send(message);
      logger.info(`📤 Message sent to Discord: ${eventType} → #${channel.name}`);
    } catch (error) {
      logger.error(`Failed to send ${eventType} message to Discord:`, error);
      throw error;
    }
  }

  /**
   * Obtém o router Express para integração em servidor
   */
  getRouter() {
    return this.router;
  }
}

export default GitHubWebhookHandler;
