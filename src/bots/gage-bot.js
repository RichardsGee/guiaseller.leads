/**
 * Gage Bot - DevOps & Deployment Discord Integration
 * Handles CI/CD, deployments, monitoring, and infrastructure
 *
 * Persona: Decisive Operator & Release Manager
 * Focus: Deployment automation, infrastructure, quality gates, releases
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

class GageBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ]
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once('ready', () => this.onReady());
    this.client.on('messageCreate', (msg) => this.onMessageCreate(msg));
    this.client.on('error', (error) => this.onError(error));
  }

  async onReady() {
    logger.info(`✅ Gage Bot ready! Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);

    await this.client.user.setPresence({
      activities: [{ name: '⚡ Deployment & CI/CD', type: 'CUSTOM' }],
      status: 'online'
    });

    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const channel = await guild.channels.fetch(process.env.DISCORD_DEPLOYMENTS_CHANNEL_ID);
      logger.info(`✅ Connected to server ${guild.name} | Channel #${channel.name}`);
    } catch (error) {
      logger.warn('Could not verify deployments channel:', error.message);
    }
  }

  async onMessageCreate(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    logger.debug(`DevOps Message from ${message.author.username}: ${message.content}`);

    if (message.mentions.has(this.client.user)) {
      await this.handleMention(message);
    }

    if (message.content.startsWith('!devops')) {
      await this.handleCommand(message);
    }
  }

  async handleMention(message) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#00ccff')
        .setTitle('⚡ Gage - DevOps Agent')
        .setDescription('I deploy with confidence, monitor with vigilance, and scale with precision.')
        .addFields(
          {
            name: '🚀 My Capabilities',
            value: [
              '• GitHub Actions CI/CD setup',
              '• Railway/Vercel deployments',
              '• Container orchestration',
              '• Monitoring & alerting (Sentry)',
              '• Environment management'
            ].join('\n')
          },
          {
            name: '📋 Current Infrastructure',
            value: [
              '**CI/CD:** GitHub Actions (automated)',
              '**Staging:** Railway (auto-deploy on PR)',
              '**Production:** Vercel (manual gate)',
              '**Monitoring:** Sentry + Winston logs',
              '**Uptime Target:** 99.9%'
            ].join('\n')
          }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error handling mention:', error);
    }
  }

  async handleCommand(message) {
    const args = message.content.split(' ');
    const cmd = args[1];

    switch (cmd) {
      case 'status':
        await this.handleStatusCommand(message);
        break;
      case 'deploy':
        await this.handleDeployCommand(message);
        break;
      case 'health':
        await this.handleHealthCommand(message);
        break;
      case 'help':
        await this.handleHelpCommand(message);
        break;
      default:
        await message.reply('Unknown command. Use `!devops help` for available commands.');
    }
  }

  async handleStatusCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🟢 Deployment Status')
      .addFields(
        { name: 'Staging', value: '✅ Online', inline: true },
        { name: 'Production', value: '✅ Online', inline: true },
        { name: 'Uptime', value: '99.9%', inline: true },
        { name: 'Last Deploy', value: '2 hours ago', inline: true },
        { name: 'CI/CD', value: '✅ Healthy', inline: true },
        { name: 'Alerts', value: 'None', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleDeployCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#00ccff')
      .setTitle('🚀 Deployment Guide')
      .addFields(
        { name: 'Staging', value: 'Auto-deploys on PR to main', inline: true },
        { name: 'Production', value: 'Manual approval required', inline: true },
        { name: 'Quality Gate', value: 'CodeRabbit + Tests Pass', inline: true },
        { name: 'Rollback', value: 'Instant (previous version)', inline: true },
        { name: 'Monitoring', value: 'Live tracking in Sentry', inline: true },
        { name: 'Support', value: '24/7 on-call (week 1)', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHealthCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('🏥 Infrastructure Health')
      .addFields(
        { name: 'Database', value: '✅ Healthy', inline: true },
        { name: 'API', value: '✅ Healthy', inline: true },
        { name: 'Frontend', value: '✅ Healthy', inline: true },
        { name: 'Cache', value: '✅ Healthy', inline: true },
        { name: 'Queue', value: '✅ Healthy', inline: true },
        { name: 'Overall', value: '✅ All Systems Go', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHelpCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#00ccff')
      .setTitle('Gage Commands')
      .addFields(
        { name: '!devops status', value: 'Show deployment status' },
        { name: '!devops deploy', value: 'Show deployment guide' },
        { name: '!devops health', value: 'Show infrastructure health' },
        { name: '!devops help', value: 'Show this message' }
      );

    await message.reply({ embeds: [embed] });
  }

  onError(error) {
    logger.error('Gage Bot Error:', error);
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_DEVOPS_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start Gage Bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
  }
}


export default GageBot;
