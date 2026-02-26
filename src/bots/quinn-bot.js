/**
 * Quinn Bot - QA & Quality Assurance Discord Integration
 * Handles test results, quality gates, bug reports, and QA discussions
 *
 * Persona: Meticulous Tester & Quality Guardian
 * Focus: Testing validation, quality assurance, bug tracking
 */

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export class QuinnBot {
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
    logger.info(`✅ Quinn Bot ready! Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);

    await this.client.user.setPresence({
      activities: [{ name: '✅ Quality Assurance', type: 'CUSTOM' }],
      status: 'online'
    });

    try {
      const guild = await this.client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      const channel = await guild.channels.fetch(process.env.DISCORD_QA_CHANNEL_ID);
      logger.info(`✅ Connected to server ${guild.name} | Channel #${channel.name}`);
    } catch (error) {
      logger.warn('Could not verify QA channel:', error.message);
    }
  }

  async onMessageCreate(message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    logger.debug(`QA Message from ${message.author.username}: ${message.content}`);

    if (message.mentions.has(this.client.user)) {
      await this.handleMention(message);
    }

    if (message.content.startsWith('!qa')) {
      await this.handleCommand(message);
    }
  }

  async handleMention(message) {
    try {
      const embed = new EmbedBuilder()
        .setColor('#00aa00')
        .setTitle('✅ Quinn - QA Agent')
        .setDescription('I ensure quality through rigorous testing and validation.')
        .addFields(
          {
            name: '🧪 My Capabilities',
            value: [
              '• Test case creation & execution',
              '• Bug identification & reporting',
              '• Quality gate validation',
              '• Performance testing',
              '• Security testing'
            ].join('\n')
          },
          {
            name: '📋 QA Workflow',
            value: [
              '1. Review PR/Story for testing needs',
              '2. Execute test cases',
              '3. Report findings in #qa channel',
              '4. Block or approve for deployment',
              '5. Monitor post-deployment issues'
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
      case 'report':
        await this.handleReportCommand(message);
        break;
      case 'help':
        await this.handleHelpCommand(message);
        break;
      default:
        await message.reply('Unknown command. Use `!qa help` for available commands.');
    }
  }

  async handleStatusCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🟢 Quinn Status')
      .addFields(
        { name: 'Status', value: 'Online & Testing', inline: true },
        { name: 'Tests Running', value: '0', inline: true },
        { name: 'Uptime', value: `${Math.floor(this.client.uptime / 1000)}s`, inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleReportCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('📋 QA Report')
      .addFields(
        { name: 'Test Coverage', value: '82%', inline: true },
        { name: 'Bugs Found', value: '3', inline: true },
        { name: 'Tests Passed', value: '45/50', inline: true }
      );

    await message.reply({ embeds: [embed] });
  }

  async handleHelpCommand(message) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Quinn Commands')
      .addFields(
        { name: '!qa status', value: 'Show current test status' },
        { name: '!qa report', value: 'Show QA report' },
        { name: '!qa help', value: 'Show this message' }
      );

    await message.reply({ embeds: [embed] });
  }

  onError(error) {
    logger.error('Quinn Bot Error:', error);
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_QA_BOT_TOKEN);
    } catch (error) {
      logger.error('Failed to start Quinn Bot:', error);
      throw error;
    }
  }

  async stop() {
    await this.client.destroy();
  }
}


export default QuinnBot;
