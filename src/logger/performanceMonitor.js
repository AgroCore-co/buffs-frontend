/**
 * Performance Monitor - Monitoramento de Performance
 *
 * Rastreia métricas de performance e tempos de carregamento
 */

import { logger } from './logger';

class PerformanceMonitor {
  constructor() {
    this.measurements = new Map();
  }

  /**
   * Inicia medição de performance
   */
  start(label) {
    this.measurements.set(label, performance.now());
  }

  /**
   * Finaliza medição e loga resultado
   */
  end(label, context = {}) {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      logger.warn(`Performance measurement not found: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    logger.performance(label, Math.round(duration));

    // Alerta se performance estiver ruim
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label}`, {
        duration: `${Math.round(duration)}ms`,
        ...context,
      });
    }

    return duration;
  }

  /**
   * Mede tempo de execução de uma função
   */
  async measure(label, fn, context = {}) {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, context);
      return result;
    } catch (error) {
      this.end(label, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Higher-order function para adicionar medição a funções
   */
  wrapWithMeasurement(label, fn, context = {}) {
    return async (...args) => {
      return this.measure(label, () => fn(...args), context);
    };
  }

  /**
   * Loga métricas de navegação (Web Vitals)
   */
  logNavigationMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;

    logger.info('Navigation Metrics', {
      domContentLoaded: Math.round(
        navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart
      ),
      loadComplete: Math.round(
        navigation.loadEventEnd - navigation.loadEventStart
      ),
      domInteractive: Math.round(navigation.domInteractive),
      totalTime: Math.round(navigation.loadEventEnd),
    });
  }

  /**
   * Loga métricas de recursos carregados
   */
  logResourceMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = performance.getEntriesByType('resource');
    const summary = {
      total: resources.length,
      scripts: resources.filter((r) => r.initiatorType === 'script').length,
      stylesheets: resources.filter(
        (r) => r.initiatorType === 'link' || r.initiatorType === 'css'
      ).length,
      images: resources.filter((r) => r.initiatorType === 'img').length,
      fetch: resources.filter(
        (r) =>
          r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest'
      ).length,
    };

    logger.debug('Resource Metrics', summary);
  }

  /**
   * Monitora Core Web Vitals
   */
  monitorWebVitals() {
    if (typeof window === 'undefined') return;

    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      logger.info('Web Vitals - LCP', {
        value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        element: lastEntry.element?.tagName,
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        logger.info('Web Vitals - FID', {
          value: Math.round(entry.processingStart - entry.startTime),
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      logger.info('Web Vitals - CLS', {
        value: clsValue.toFixed(4),
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Exporta instância singleton
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
