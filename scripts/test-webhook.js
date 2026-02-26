/**
 * GitHub Webhook Test Script
 * Simula eventos do GitHub para validar integração com Discord
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/webhook';

console.log('🧪 GitHub Webhook Test Suite');
console.log(`📍 Target: ${WEBHOOK_URL}\n`);

// Payload de exemplo: Push
const pushPayload = {
  pusher: { name: 'seu-usuario', email: 'user@example.com' },
  ref: 'refs/heads/main',
  commits: [
    {
      id: 'abc123',
      message: 'feat: implement GitHub webhooks integration',
      author: { name: 'seu-usuario', email: 'user@example.com' },
      url: 'https://github.com/seu-usuario/guiaseller.leads/commit/abc123'
    },
    {
      id: 'def456',
      message: 'refactor: update Discord message formatting',
      author: { name: 'seu-usuario', email: 'user@example.com' },
      url: 'https://github.com/seu-usuario/guiaseller.leads/commit/def456'
    }
  ],
  repository: {
    id: 123456,
    name: 'guiaseller.leads',
    full_name: 'seu-usuario/guiaseller.leads',
    url: 'https://github.com/seu-usuario/guiaseller.leads'
  },
  compare: 'https://github.com/seu-usuario/guiaseller.leads/compare/123...456'
};

// Payload de exemplo: Pull Request
const prPayload = {
  action: 'opened',
  number: 42,
  pull_request: {
    id: 789,
    title: 'Implement GitHub Webhooks',
    state: 'open',
    merged: false,
    user: { login: 'seu-usuario' },
    head: { ref: 'feature/github-webhooks' },
    base: { ref: 'main' },
    html_url: 'https://github.com/seu-usuario/guiaseller.leads/pull/42',
    additions: 150,
    deletions: 20
  },
  repository: {
    id: 123456,
    name: 'guiaseller.leads',
    full_name: 'seu-usuario/guiaseller.leads'
  }
};

// Payload de exemplo: Release
const releasePayload = {
  action: 'published',
  release: {
    id: 999,
    tag_name: 'v1.1.0',
    name: 'v1.1.0 - GitHub Webhooks Release',
    body: 'Major features:\n- GitHub webhook integration\n- Automated Discord notifications\n- Support for push, PR, and release events',
    prerelease: false,
    html_url: 'https://github.com/seu-usuario/guiaseller.leads/releases/tag/v1.1.0'
  },
  repository: {
    id: 123456,
    name: 'guiaseller.leads',
    full_name: 'seu-usuario/guiaseller.leads'
  }
};

async function testWebhook(eventType, payload, description) {
  try {
    console.log(`\n📤 Testing: ${description}`);
    console.log(`   Event Type: ${eventType}`);

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'X-GitHub-Event': eventType,
        'X-GitHub-Delivery': `test-${Date.now()}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ Connection refused`);
      console.log(`   ❌ Is the server running? Try: npm run server`);
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('Starting webhook tests...\n');

  // Verificar se servidor está rodando
  try {
    const health = await axios.get(`${WEBHOOK_URL.replace('/webhook', '')}/health`, {
      timeout: 2000
    });
    console.log('✅ Server is online');
    console.log(`📊 Server status: ${JSON.stringify(health.data)}\n`);
  } catch (error) {
    console.log('❌ Server appears to be offline');
    console.log('💡 Start server with: npm run server\n');
    process.exit(1);
  }

  // Executar testes
  await testWebhook(
    'push',
    pushPayload,
    'Push Event (commits to main)'
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  await testWebhook(
    'pull_request',
    prPayload,
    'Pull Request Event (PR opened)'
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  await testWebhook(
    'release',
    releasePayload,
    'Release Event (new version published)'
  );

  console.log('\n✅ All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Check Discord channels:');
  console.log('      - #deployments (for push)');
  console.log('      - #dev (for pull requests)');
  console.log('      - #announcements (for releases)');
  console.log('   2. If messages didn\'t appear, check:');
  console.log('      - Channel IDs in .env are correct');
  console.log('      - Bots have permissions in channels');
  console.log('      - Logs for errors\n');
}

runTests();
