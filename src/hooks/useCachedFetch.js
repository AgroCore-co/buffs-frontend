import { useState, useEffect } from 'react';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';

/**
 * Hook personalizado para fetch de dados com cache em memória e deduplicação.
 * Ideal para evitar múltiplas requisições em Strict Mode ou re-renders.
 *
 * @param {string} url - Endpoint da API
 * @param {Object} params - Query params (objeto)
 * @param {Object} options - { ttl: number, enabled: boolean }
 */
export function useCachedFetch(url, params = {}, options = {}) {
  const { ttl = CACHE_TTL.MEDIUM, enabled = true } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!url && enabled);

  // Serializa params para evitar disparos infinitos se o objeto mudar de ref
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (!url || !enabled) {
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const result = await apiCache.get(url, { params }, ttl);
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('[useCachedFetch] Error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, enabled, ttl]);

  const revalidate = () => {
    apiCache.invalidate(url, { params });

    apiCache.invalidate(url, { params });
  };

  return { data, loading, error, revalidate };
}
