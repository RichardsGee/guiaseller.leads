/**
 * GitHub Webhook Utilities
 * Formatação e construção de mensagens Discord baseadas em eventos GitHub
 */

import { EmbedBuilder } from 'discord.js';

export class GitHubWebhookUtils {
  /**
   * Formata evento de Push para Discord Embed
   */
  static formatPushEvent(payload) {
    const { pusher, ref, commits, repository, compare } = payload;
    const branch = ref.replace('refs/heads/', '');
    const commitCount = commits.length;

    const embed = new EmbedBuilder()
      .setColor('#28a745')
      .setTitle(`📤 Push to ${repository.name}`)
      .setDescription(`${pusher.name} pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to **${branch}**`)
      .addFields(
        {
          name: '🔗 Compare',
          value: `[View changes](${compare})`,
          inline: true
        },
        {
          name: '📊 Commits',
          value: commits
            .slice(0, 3)
            .map(c => `• ${c.message.split('\n')[0]}`)
            .join('\n') + (commitCount > 3 ? `\n• +${commitCount - 3} more` : ''),
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: repository.full_name });

    return { embed, branch };
  }

  /**
   * Formata evento de Pull Request para Discord Embed
   */
  static formatPullRequestEvent(payload) {
    const { pull_request, action, repository } = payload;
    const pr = pull_request;

    let color = '#0366d6';
    let title = '🔀 ';

    switch (action) {
      case 'opened':
        title += 'PR Opened';
        color = '#28a745';
        break;
      case 'closed':
        title += 'PR Closed';
        color = pr.merged ? '#6f42c1' : '#cb2431';
        break;
      case 'synchronize':
        title += 'PR Updated';
        break;
      case 'reviewed':
        title += 'PR Reviewed';
        break;
      default:
        title += 'PR ' + action.charAt(0).toUpperCase() + action.slice(1);
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${title}: ${pr.title}`)
      .setDescription(`${pr.user.login} - #${pr.number}`)
      .addFields(
        {
          name: 'Branch',
          value: `\`${pr.head.ref}\` → \`${pr.base.ref}\``,
          inline: true
        },
        {
          name: 'Changes',
          value: `+${pr.additions} -${pr.deletions}`,
          inline: true
        },
        {
          name: 'Status',
          value: pr.state.charAt(0).toUpperCase() + pr.state.slice(1),
          inline: true
        }
      )
      .addFields(
        {
          name: '🔗 Link',
          value: `[View PR](${pr.html_url})`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: repository.full_name });

    return { embed };
  }

  /**
   * Formata evento de Release para Discord Embed
   */
  static formatReleaseEvent(payload) {
    const { release, action, repository } = payload;

    const embed = new EmbedBuilder()
      .setColor('#6f42c1')
      .setTitle(`🎉 Release: ${release.name || release.tag_name}`)
      .setDescription(release.body || 'No description provided')
      .addFields(
        {
          name: 'Version',
          value: `\`${release.tag_name}\``,
          inline: true
        },
        {
          name: 'Status',
          value: release.prerelease ? 'Pre-release' : 'Stable',
          inline: true
        }
      )
      .addFields(
        {
          name: '🔗 Link',
          value: `[View Release](${release.html_url})`,
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: repository.full_name });

    return { embed };
  }

  /**
   * Validação de webhook signature (opcional)
   * Se implementar secret no GitHub, validar aqui
   */
  static validateWebhookSignature(req, secret) {
    // Implementar validação HMAC-SHA256 se usar GitHub webhook secret
    return true;
  }

  /**
   * Determina qual canal Discord usar baseado no evento
   */
  static getTargetChannel(eventType, payload) {
    switch (eventType) {
      case 'push':
        return process.env.DISCORD_DEPLOYMENTS_CHANNEL_ID;
      case 'pull_request':
        return process.env.DISCORD_DEV_CHANNEL_ID;
      case 'release':
        return process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID;
      default:
        return process.env.DISCORD_GENERAL_CHANNEL_ID;
    }
  }
}

export default GitHubWebhookUtils;
