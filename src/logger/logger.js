/**
 * Sistema de Logging Centralizado
 *
 * Fornece logs estruturados com níveis de severidade e contexto.
 * Em produção, pode ser integrado com serviços como Sentry, LogRocket, etc.
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const LOG_COLORS = {
  DEBUG: '#6B7280',
  INFO: '#3B82F6',
  WARN: '#F59E0B',
  ERROR: '#EF4444',
};

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.enableLogs =
      !this.isProduction || process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true';
  }

  /**
   * Formata timestamp para logs
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Formata mensagem de log com contexto
   */
  _formatMessage(level, message, context = {}) {
    const timestamp = this._getTimestamp();
    return {
      timestamp,
      level,
      message,
      context,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    };
  }

  /**
   * Envia logs para serviços externos (Sentry, LogRocket, etc.)
   */
  _sendToExternalService(level, formattedMessage) {
    if (this.isProduction) {
      // Integração com Sentry
      // if (window.Sentry) {
      //   window.Sentry.captureMessage(formattedMessage.message, {
      //     level: level.toLowerCase(),
      //     extra: formattedMessage.context,
      //   });
      // }
      // Integração com LogRocket
      // if (window.LogRocket) {
      //   window.LogRocket.log(formattedMessage);
      // }
      // Integração com Analytics customizado
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedMessage),
      // });
    }
  }

  /**
   * Log genérico interno
   */
  _log(level, message, context = {}) {
    if (!this.enableLogs) return;

    const formattedMessage = this._formatMessage(level, message, context);

    // Console output (desenvolvimento)
    if (!this.isProduction) {
      const color = LOG_COLORS[level];
      console.log(
        `%c[${formattedMessage.timestamp}] ${level}:`,
        `color: ${color}; font-weight: bold;`,
        message,
        context
      );
    }

    // Enviar para serviços externos
    this._sendToExternalService(level, formattedMessage);
  }

  /**
   * Log de debug (desenvolvimento apenas)
   */
  debug(message, context = {}) {
    if (!this.isProduction) {
      this._log(LOG_LEVELS.DEBUG, message, context);
    }
  }

  /**
   * Log de informação
   */
  info(message, context = {}) {
    this._log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * Log de warning
   */
  warn(message, context = {}) {
    this._log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * Log de erro
   */
  error(message, context = {}) {
    this._log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * Log de erro com stack trace
   */
  errorWithStack(message, error, context = {}) {
    const errorContext = {
      ...context,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };
    this._log(LOG_LEVELS.ERROR, message, errorContext);
  }

  /**
   * Log de requisição API
   */
  apiRequest(method, url, data = null) {
    this.debug('API Request', {
      method,
      url,
      data,
    });
  }

  /**
   * Log de resposta API
   */
  apiResponse(method, url, status, data = null) {
    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
    this._log(level, 'API Response', {
      method,
      url,
      status,
      data,
    });
  }

  /**
   * Log de ação do usuário
   */
  userAction(action, details = {}) {
    this.info('User Action', {
      action,
      ...details,
    });
  }

  /**
   * Log de navegação
   */
  navigation(from, to) {
    this.debug('Navigation', {
      from,
      to,
    });
  }

  /**
   * Log de performance
   */
  performance(label, duration) {
    this.debug('Performance', {
      label,
      duration: `${duration}ms`,
    });
  }
}

// Exporta instância singleton
export const logger = new Logger();

// Exporta também a classe para testes
export default logger;
