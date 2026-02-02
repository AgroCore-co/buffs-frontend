import axios from 'axios';

// Variáveis de controle para o Refresh Token (Singleton no módulo)
let isRefreshing = false;
let failedQueue = [];

// Variáveis de controle para Rate Limit (429)
let isRateLimited = false;
let rateLimitResetTime = 0;
const rateLimitQueue = [];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// --- Helper de Rate Limit ---
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processRateLimitQueue = () => {
  // Libera todas as requisições travadas por rate limit
  rateLimitQueue.forEach((prom) => prom.resolve());
  rateLimitQueue.length = 0;
};

// --- Gerenciamento de Tokens Seguro ---

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const setAuthTokens = (access, refresh) => {
  if (typeof window === 'undefined') return;

  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);

  // Atualiza o header padrão para requisições futuras
  api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers.common['Authorization'];
};

// Hook para injetar lógica de logout externa (ex: router.push('/login'))
let logoutCallback = null;
export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

// --- Processamento da Fila ---

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Interceptors ---

api.interceptors.request.use(
  async (config) => {
    // 1. Verificar se existe Rate Limit ativo
    if (isRateLimited) {
      const now = Date.now();
      if (now < rateLimitResetTime) {
        const waitTime = rateLimitResetTime - now;
        // Se estiver bloqueado, aguarda o tempo necessário
        await wait(waitTime + 100); // +100ms de margem
      } else {
        isRateLimited = false;
        processRateLimitQueue();
      }
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Caso 1: Tratamento de Rate Limit (429)
    if (error.response?.status === 429) {
      console.warn('Rate Limit 429 em:', originalRequest.url);
      // ... logic continues ...
      // Se já estamos em cooldown, enfileira a requisição
      if (isRateLimited) {
        return new Promise((resolve) => {
          rateLimitQueue.push({ resolve });
        }).then(() => api(originalRequest));
      }

      // Inicia novo cooldown
      isRateLimited = true;

      // Tenta ler o header Retry-After (pode ser segundos ou data)
      const retryAfterHeader = error.response.headers['retry-after'];
      let cooldownMs = 60000; // Default 60s

      if (retryAfterHeader) {
        const retrySeconds = parseInt(retryAfterHeader, 10);
        if (!isNaN(retrySeconds)) {
          cooldownMs = retrySeconds * 1000;
        } else {
          // Fallback se for data HTTP
          const retryDate = new Date(retryAfterHeader).getTime();
          if (!isNaN(retryDate)) {
            cooldownMs = retryDate - Date.now();
          }
        }
      }

      // Se o backend não mandar header, aplica backoff exponencial simples se já tiver tentado
      if (!retryAfterHeader && originalRequest._retryCount) {
        cooldownMs = Math.min(30000, 2 ** originalRequest._retryCount * 1000);
      }

      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      console.warn(
        `[API] Rate Limit atingido. Pausando requisições por ${cooldownMs}ms.`
      );
      rateLimitResetTime = Date.now() + cooldownMs;

      // Espera o cooldown e tenta novamente
      return wait(cooldownMs + 500).then(() => {
        isRateLimited = false;
        processRateLimitQueue();
        return api(originalRequest);
      });
    }

    // Caso 2: Erro genérico ou sem response (Network Error)
    if (!error.response) {
      return Promise.reject(
        new Error('Erro de conexão. Verifique sua internet.')
      );
    }

    // Caso 3: Não é 401 nem 429 -> Rejeita
    if (
      error.response &&
      (error.response.status !== 401 || originalRequest._retry)
    ) {
      if (error.response.status === 400) {
        console.error(
          '[API] 400 Bad Request:',
          originalRequest.method.toUpperCase(),
          originalRequest.url,
          originalRequest.params,
          error.response.data
        );
      }
      return Promise.reject(error);
    }

    // Caso 4: É 401. Tenta Refresh Token.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token: newRefreshToken } = data;

      setAuthTokens(access_token, newRefreshToken);

      processQueue(null, access_token);

      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthTokens();

      if (logoutCallback) {
        logoutCallback();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
