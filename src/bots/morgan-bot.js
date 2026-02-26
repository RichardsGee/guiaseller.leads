/**
 * Morgan Bot - Product Management Discord Integration
 * Handles product planning, epic management, requirements, and strategy
 *
 * Persona: Strategic Product Manager & Orchestrator
 * Focus: Product vision, requirements, epic coordination, success metrics
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export class MorganBot {
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
    logger.info(`✅ Morgan Bot ready! Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);

    await this.client.user.setPresence({
      activities: [{ name: '📊 Product Planning', type: 'CUSTOM' }],
      status: 'online'
    });

    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const channel = await guild.channels.fetch(process.env.DISCORD_PM_CHANNEL_ID);
      logger.info(`✅ Connected to server ${guild.name} | Channel #${channel.name}`);
    } catch (error) {
      logger.warn('Could not verify PM channel:', error.message);
    }
  }

  async onMessageCreate(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    logger.debug(`PM Message from ${message.author.username}: ${message.content}`);

    if (message.mentions.has(this.client.user)) {
      await this.handleMention(message);
    }

    if (message.content.startsWith('!pm')) {
      await this.handleCommand(message);
    }
  }

  async handleMention(message) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#ff6699')
        .setTitle('📋 Morgan - Product Manager Agent')
        .setDescription('I strategize, plan, and orchestrate product success.')
        .addFields(
          {
            name: '📊 My Capabilities',
            value: [
              '• Product roadmap planning',
              '• Epic creation & management',
              '• Requirements gathering',
              '• Success metrics tracking',
              '• Stakeholder communication'
            ].join('\n')
          },
          {
            name: '🎯 Current Product Phase',
            value: [
              '**Phase:** 1 - MVP (8 weeks)',
              '**Status:** Wave 1 - Foundation',
              '**Target:** 50% conversion improvement',
              '**Team Size:** 5 FTE'
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
      case 'roadmap':
        await this.handleRoadmapCommand(message);
        break;
      case 'metrics':
        await this.handleMetricsCommand(message);
        break;
      case 'help':
        await this.handleHelpCommand(message);
        break;
      default:
        await message.reply('Unknown command. Use `!pm help` for available commands.');
    }
  }

  async handleRoadmapCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ff6699')
      .setTitle('🗺️ Product Roadmap')
      .addFields(
        { name: 'Phase 1 (W1-W8)', value: 'MVP - Internal Lead Intelligence', inline: true },
        { name: 'Phase 2 (W9-W14)', value: 'AI Personalization & Scoring', inline: true },
        { name: 'Phase 3 (W15+)', value: 'Scale & B2B SaaS', inline: true },
        { name: 'Wave 1 (W1-W2)', value: '✅ Foundation: DB, Auth, CI/CD', inline: true },
        { name: 'Wave 2 (W3-W5)', value: '⏳ Features: API, Dashboard, Analytics', inline: true },
        { name: 'Wave 3 (W6-W7)', value: '⏳ Testing & Polish', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleMetricsCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('📈 Success Metrics')
      .addFields(
        { name: 'Conversion Rate', value: '12% → 18% (+50%)', inline: true },
        { name: 'Processing Time', value: '15min → 7min (-50%)', inline: true },
        { name: 'Admin Satisfaction', value: '> 4.5/5', inline: true },
        { name: 'Dashboard Load', value: '< 2 seconds', inline: true },
        { name: 'API Uptime', value: '99.9%', inline: true },
        { name: 'Test Coverage', value: '> 80%', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHelpCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ff6699')
      .setTitle('Morgan Commands')
      .addFields(
        { name: '!pm roadmap', value: 'Show product roadmap' },
        { name: '!pm metrics', value: 'Show success metrics' },
        { name: '!pm help', value: 'Show this message' }
      );

    await message.reply({ embeds: [embed] });
  }

  onError(error) {
    logger.error('Morgan Bot Error:', error);
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_PM_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start Morgan Bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
  }
}


export default MorganBot;
