/**
 * Error Logger - Rastreamento e Monitoramento de Erros
 *
 * Captura erros não tratados e envia para serviços de monitoramento
 */

import { logger } from './logger';

class ErrorLogger {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Inicializa listeners globais de erro
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Captura erros não tratados
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'unhandledError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Captura promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandledRejection',
        promise: event.promise,
      });
    });

    this.isInitialized = true;
    logger.info('ErrorLogger initialized');
  }

  /**
   * Captura erro manualmente
   */
  captureError(error, context = {}) {
    if (!(error instanceof Error)) {
      error = new Error(String(error));
    }

    logger.errorWithStack('Error captured', error, context);

    // Integração com Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  /**
   * Captura erro de API
   */
  captureApiError(error, requestConfig = {}) {
    const context = {
      type: 'apiError',
      method: requestConfig.method,
      url: requestConfig.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    };

    this.captureError(error, context);
  }

  /**
   * Captura erro de validação
   */
  captureValidationError(message, fields = {}) {
    const error = new Error(message);
    error.name = 'ValidationError';

    this.captureError(error, {
      type: 'validationError',
      fields,
    });
  }

  /**
   * Captura erro de autenticação
   */
  captureAuthError(message, context = {}) {
    const error = new Error(message);
    error.name = 'AuthenticationError';

    this.captureError(error, {
      type: 'authError',
      ...context,
    });
  }

  /**
   * Captura erro de carregamento de recurso
   */
  captureResourceError(resource, context = {}) {
    const error = new Error(`Failed to load resource: ${resource}`);
    error.name = 'ResourceError';

    this.captureError(error, {
      type: 'resourceError',
      resource,
      ...context,
    });
  }

  /**
   * Wrapper para try-catch com logging automático
   */
  async withErrorLogging(fn, context = {}) {
    try {
      return await fn();
    } catch (error) {
      this.captureError(error, context);
      throw error;
    }
  }

  /**
   * Higher-order function para adicionar logging a funções
   */
  wrapWithErrorLogging(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.captureError(error, {
          ...context,
          arguments: args,
        });
        throw error;
      }
    };
  }
}

// Exporta instância singleton
export const errorLogger = new ErrorLogger();

// Inicializa automaticamente no lado do cliente
if (typeof window !== 'undefined') {
  errorLogger.init();
}

export default errorLogger;
