/**
 * Dex Bot - Development Agent Discord Integration
 * Handles code reviews, implementation discussions, and technical decisions
 *
 * Persona: Investigative Developer & Implementation Expert
 * Focus: Code development, debugging, architecture implementation
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

class DexBot {
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
    logger.info(`✅ Dex Bot ready! Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);

    // Set bot status
    await this.client.user.setPresence({
      activities: [{ name: '🔧 Code Development', type: 'CUSTOM' }],
      status: 'online'
    });

    // Verify server connection
    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const channel = await guild.channels.fetch(process.env.DISCORD_DEV_CHANNEL_ID);
      logger.info(`✅ Connected to server ${guild.name} | Channel #${channel.name}`);
    } catch (error) {
      logger.error('Failed to connect to Discord server:', error.message);
    }
  }

  async onMessageCreate(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore non-guild messages for now
    if (!message.guild) return;

    // Log message
    logger.debug(`Message from ${message.author.username}: ${message.content}`);

    // Handle @dex mentions
    if (message.mentions.has(this.client.user)) {
      await this.handleMention(message);
    }

    // Handle specific commands
    if (message.content.startsWith('!dev')) {
      await this.handleCommand(message);
    }
  }

  async handleMention(message) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🔧 Dex - Developer Agent')
        .setDescription('I\'m here to help with code implementation, debugging, and technical decisions.')
        .addFields(
          {
            name: '📋 My Capabilities',
            value: [
              '• Code implementation & development',
              '• Bug identification and fixes',
              '• Test writing and validation',
              '• Architecture evaluation',
              '• Performance optimization'
            ].join('\n')
          },
          {
            name: '💬 How to Work with Me',
            value: [
              '1. Create a story in `docs/stories/`',
              '2. Assign to me with `@dex`',
              '3. I\'ll implement with tests & documentation',
              '4. Pass QA gate before merge'
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
      case 'help':
        await this.handleHelpCommand(message);
        break;
      default:
        await message.reply('Unknown command. Use `!dev help` for available commands.');
    }
  }

  async handleStatusCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🟢 Dex Status')
      .addFields(
        { name: 'Status', value: 'Online', inline: true },
        { name: 'Uptime', value: `${Math.floor(this.client.uptime / 1000)}s`, inline: true },
        { name: 'Server', value: process.env.DISCORD_SERVER_ID, inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHelpCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Dex Commands')
      .addFields(
        { name: '!dev status', value: 'Show bot status' },
        { name: '!dev help', value: 'Show this message' }
      );

    await message.reply({ embeds: [embed] });
  }

  onError(error) {
    logger.error('Discord Client Error:', error);
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_DEV_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start Dex Bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
  }
}


export default DexBot;
