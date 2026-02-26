/**
 * Aria Bot - Architecture & Design Discord Integration
 * Handles architecture decisions, design reviews, and technical discussions
 *
 * Persona: Visionary Architect & Technical Leader
 * Focus: System design, architecture validation, technical decisions
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export class AriaBot {
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
    logger.info(`✅ Aria Bot ready! Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);

    await this.client.user.setPresence({
      activities: [{ name: '🏗️ System Architecture', type: 'CUSTOM' }],
      status: 'online'
    });

    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const channel = await guild.channels.fetch(process.env.DISCORD_ARCHITECTURE_CHANNEL_ID);
      logger.info(`✅ Connected to server ${guild.name} | Channel #${channel.name}`);
    } catch (error) {
      logger.warn('Could not verify architecture channel:', error.message);
    }
  }

  async onMessageCreate(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    logger.debug(`Architecture Message from ${message.author.username}: ${message.content}`);

    if (message.mentions.has(this.client.user)) {
      await this.handleMention(message);
    }

    if (message.content.startsWith('!arch')) {
      await this.handleCommand(message);
    }
  }

  async handleMention(message) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#9933ff')
        .setTitle('🏛️ Aria - Architect Agent')
        .setDescription('I design systems that scale, perform, and endure.')
        .addFields(
          {
            name: '🏗️ My Capabilities',
            value: [
              '• System architecture design',
              '• Technology stack selection',
              '• API & integration design',
              '• Performance optimization',
              '• Security architecture review'
            ].join('\n')
          },
          {
            name: '📐 Current Architecture',
            value: [
              '**Stack:** Node.js + React + PostgreSQL + Firebase',
              '**Pattern:** REST API + Real-time Sync',
              '**Scalability:** Horizontal (microservices ready)',
              '**Load Targets:** <2s dashboard, 99.9% uptime'
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
      case 'design':
        await this.handleDesignCommand(message);
        break;
      case 'review':
        await this.handleReviewCommand(message);
        break;
      case 'help':
        await this.handleHelpCommand(message);
        break;
      default:
        await message.reply('Unknown command. Use `!arch help` for available commands.');
    }
  }

  async handleDesignCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#9933ff')
      .setTitle('📐 Architecture Design')
      .addFields(
        { name: 'Frontend', value: 'React 18 + Vite + Tailwind CSS', inline: true },
        { name: 'Backend', value: 'Node.js + Express.js + Prisma', inline: true },
        { name: 'Database', value: 'PostgreSQL (dual: guiaseller + leads)', inline: true },
        { name: 'Real-time', value: 'Firebase Realtime DB', inline: true },
        { name: 'Auth', value: 'Firebase Auth + JWT', inline: true },
        { name: 'API', value: 'REST (v1) - GraphQL (Phase 2)', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleReviewCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('🔍 Architecture Review')
      .addFields(
        { name: 'Complexity', value: 'STANDARD (score: 12/25)', inline: true },
        { name: 'Risk Level', value: 'MEDIUM', inline: true },
        { name: 'Status', value: '✅ Approved', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHelpCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#9933ff')
      .setTitle('Aria Commands')
      .addFields(
        { name: '!arch design', value: 'Show architecture design' },
        { name: '!arch review', value: 'Show architecture review' },
        { name: '!arch help', value: 'Show this message' }
      );

    await message.reply({ embeds: [embed] });
  }

  onError(error) {
    logger.error('Aria Bot Error:', error);
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_ARCHITECT_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start Aria Bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
  }
}


export default AriaBot;
