/**
 * Logger Utility
 * Simple logging system for AIOS bots
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

class Logger {
  constructor(level = 'info') {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.info;
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, color, message, data) {
    const timestamp = this.getTimestamp();
    const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${color}[${level.toUpperCase()}]${COLORS.reset}`;

    if (data) {
      return `${prefix} ${message} ${COLORS.gray}${JSON.stringify(data)}${COLORS.reset}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message, data) {
    if (this.level <= LOG_LEVELS.debug) {
      console.log(this.formatMessage('debug', COLORS.blue, message, data));
    }
  }

  info(message, data) {
    if (this.level <= LOG_LEVELS.info) {
      console.log(this.formatMessage('info', COLORS.cyan, message, data));
    }
  }

  warn(message, data) {
    if (this.level <= LOG_LEVELS.warn) {
      console.warn(this.formatMessage('warn', COLORS.yellow, message, data));
    }
  }

  error(message, data) {
    if (this.level <= LOG_LEVELS.error) {
      console.error(this.formatMessage('error', COLORS.red, message, data));
    }
  }
}

export default new Logger(process.env.LOG_LEVEL || 'info');
