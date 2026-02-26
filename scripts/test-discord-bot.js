#!/usr/bin/env node

/**
 * Discord Bot Connection Test
 * Validates Dex bot token and connection to Discord server
 *
 * Usage: node scripts/test-discord-bot.js
 */

import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'DISCORD_DEV_BOT_TOKEN',
  'DISCORD_SERVER_ID',
  'DISCORD_GENERAL_CHANNEL_ID'
];

// Validate environment variables
function validateEnv() {
  console.log('🔍 Validating environment variables...\n');

  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    return false;
  }

  console.log('✅ All required environment variables found\n');
  return true;
}

// Test Discord connection
async function testDiscordConnection() {
  console.log('🚀 Starting Discord Bot Connection Test\n');

  if (!validateEnv()) {
    process.exit(1);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
    ]
  });

  client.once('ready', async () => {
    console.log(`✅ Bot logged in as: ${client.user.username}#${client.user.discriminator}`);
    console.log(`   User ID: ${client.user.id}\n`);

    try {
      // Validate server access
      const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
      console.log(`✅ Connected to server: ${guild.name}`);
      console.log(`   Server ID: ${guild.id}`);
      console.log(`   Members: ${guild.memberCount}\n`);

      // Validate channel access
      const channel = await guild.channels.fetch(process.env.DISCORD_GENERAL_CHANNEL_ID);
      console.log(`✅ Connected to channel: #${channel.name}`);
      console.log(`   Channel ID: ${channel.id}`);
      console.log(`   Type: ${channel.type}\n`);

      // Test message sending (optional)
      if (channel.isTextBased()) {
        console.log('💬 Attempting to send test message...');
        try {
          const msg = await channel.send('🤖 **Dex Bot Online** - Test connection successful!');
          console.log(`✅ Message sent successfully (ID: ${msg.id})\n`);

          // Clean up test message after 5 seconds
          setTimeout(() => {
            msg.delete().catch(() => {});
          }, 5000);
        } catch (error) {
          console.warn(`⚠️  Could not send message: ${error.message}\n`);
        }
      }

      console.log('🎉 All tests passed! Discord bot is ready.\n');
      console.log('📋 Summary:');
      console.log(`   • Bot: ${client.user.username}`);
      console.log(`   • Server: ${guild.name}`);
      console.log(`   • Channel: #${channel.name}`);
      console.log(`   • Status: Ready for deployment\n`);

    } catch (error) {
      console.error('❌ Test failed:', error.message);
    } finally {
      await client.destroy();
      process.exit(0);
    }
  });

  client.on('error', error => {
    console.error('❌ Discord Client Error:', error.message);
    process.exit(1);
  });

  try {
    await client.login(process.env.DISCORD_DEV_BOT_TOKEN);
    console.log('🔐 Authenticating with Discord...\n');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.error('\n💡 Make sure DISCORD_DEV_BOT_TOKEN is valid');
    process.exit(1);
  }

  // Timeout after 30 seconds
  setTimeout(() => {
    console.error('\n❌ Connection timeout (30s)');
    process.exit(1);
  }, 30000);
}

// Run test
(async () => {
  await testDiscordConnection();
})();
