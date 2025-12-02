/**
 * Logger - Exports centralizados
 * 
 * Exporta todas as funcionalidades de logging do sistema
 */

export { logger, default as Logger } from './logger';
export { errorLogger } from './errorLogger';
export { performanceMonitor } from './performanceMonitor';

// Configuração para facilitar imports
import { logger } from './logger';
import { errorLogger } from './errorLogger';
import { performanceMonitor } from './performanceMonitor';

const loggerConfig = {
  logger,
  errorLogger,
  performanceMonitor,
};

export default loggerConfig;
