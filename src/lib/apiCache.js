import api from './api';

const cache = new Map();
const activeRequests = new Map(); // For deduplication

export const CACHE_TTL = {
  SHORT: 10000, // 10s
  MEDIUM: 60000, // 1m
  LONG: 300000, // 5m
  FOREVER: 3600000, // 1h
};

export const apiCache = {
  /**
   * Realiza um GET com cache em memória e deduplicação de requisições
   * @param {string} url - URL do endpoint
   * @param {Object} config - Configuração do Axios (params, headers, etc)
   * @param {number} ttl - Tempo de vida do cache em ms (default 1 min)
   */
  async get(url, config = {}, ttl = CACHE_TTL.MEDIUM) {
    // Generate simple key including auth token if possible, but usually cache is per session.
    // Assuming this is client-side singleton cache, separate users have separate browser memory.
    const queryString = config.params ? JSON.stringify(config.params) : '';
    const cacheKey = `${url}?${queryString}`;

    // 1. Check valid cache
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        console.debug(`[Cache] HIT: ${url}`);
        // Return a structured clone/copy to prevent mutation bugs if objects are modified by consumers
        try {
          return structuredClone(data);
        } catch {
          // Fallback for non-clonable data
          return data;
        }
      }
      cache.delete(cacheKey);
    }

    // 2. Check active request (deduplication)
    if (activeRequests.has(cacheKey)) {
      console.debug(`[Cache] DEDUP: ${url}`);
      // Wait for the in-flight request
      const data = await activeRequests.get(cacheKey);
      try {
        return structuredClone(data);
      } catch {
        return data;
      }
    }

    // 3. Make Request
    const requestPromise = api
      .get(url, config)
      .then((data) => {
        // Save to cache
        cache.set(cacheKey, { data, timestamp: Date.now() });
        activeRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        activeRequests.delete(cacheKey);
        throw err;
      });

    activeRequests.set(cacheKey, requestPromise);

    // Return result of the new request
    const result = await requestPromise;
    try {
      return structuredClone(result);
    } catch {
      return result;
    }
  },

  /**
   * Limpa o cache para URLs que correspondam ao padrão
   * @param {string} pattern - String ou Regex para match na URL
   */
  clear(pattern) {
    if (!pattern) {
      cache.clear();
      console.debug('[Cache] Cleared all');
      return;
    }
    let count = 0;
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
        count++;
      }
    }
    console.debug(`[Cache] Cleared ${count} entries matching "${pattern}"`);
  },

  /**
   * Invalida uma entrada específica (útil após mutations)
   */
  invalidate(url, config = {}) {
    const queryString = config.params ? JSON.stringify(config.params) : '';
    const cacheKey = `${url}?${queryString}`;
    cache.delete(cacheKey);
  },
};

export default apiCache;
