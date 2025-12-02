import axios from 'axios';

// Variáveis de controle para o Refresh Token (Singleton no módulo)
let isRefreshing = false;
let failedQueue = [];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado para 30s (redes móveis)
});

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
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data, // Mantendo seu padrão de retornar data direto
  async (error) => {
    const originalRequest = error.config;

    // Caso 1: Erro genérico ou sem response (Network Error)
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
    }

    // Caso 2: Não é 401 ou já tentou retry -> Rejeita
    if (error.response.status !== 401 || originalRequest._retry) {
      // Retorna o objeto de erro completo para tratamento no componente
      return Promise.reject(error);
    }

    // Caso 3: É 401. Tenta Refresh Token.
    if (isRefreshing) {
      // Se já está rodando um refresh, coloca essa requisição na fila
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

      // Faz a chamada de refresh
      // NOTA: Usei axios.post puro para não cair nos interceptors da instância 'api'
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, 
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token: newRefreshToken } = data;

      setAuthTokens(access_token, newRefreshToken);
      
      // Processa a fila de requisições pausadas com o novo token
      processQueue(null, access_token);

      // Refaz a requisição original
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Se o refresh falhar, processa a fila com erro e desloga
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