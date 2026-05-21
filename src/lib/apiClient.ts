import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/constants';

// Variáveis para controle da fila de requisições durante o refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Processa as requisições que ficaram pendentes enquanto o token era renovado
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

const clearLocalSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  document.cookie = 'buffs_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO (Injeta o Token)
// ---------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const token = session.access_token;

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Sessão corrompida — ignora silenciosamente; o interceptor de 401 limpará
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------
// INTERCEPTOR DE RESPOSTA (Refresh Token + Erros Centralizados)
// ---------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // ---- 401: tenta renovar o token antes de qualquer outra coisa ----
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Endpoints de auth não entram no fluxo de refresh para evitar loop infinito
      if (
        originalRequest.url?.includes('/auth/signin') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Se já existe uma renovação em andamento, enfileira a requisição atual
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (!sessionData) throw new Error('Sessão não encontrada localmente.');

        const session = JSON.parse(sessionData);
        const refreshToken = session.refresh_token;
        if (!refreshToken) throw new Error('Refresh token não encontrado.');

        // Instância limpa para não cair nos interceptors e causar loop
        const { data: newSession } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Persiste nova sessão no localStorage e atualiza o cookie de rota
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
        if (typeof window !== 'undefined') {
          const expires = new Date(newSession.expires_at * 1000).toUTCString();
          document.cookie = `buffs_auth_token=1; path=/; SameSite=Lax; expires=${expires}`;
        }

        originalRequest.headers.Authorization = `Bearer ${newSession.access_token}`;
        processQueue(null, newSession.access_token);
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearLocalSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ---- Feedback centralizado para todos os demais erros ----
    if (!error.response) {
      // Sem resposta: timeout, sem rede ou servidor inacessível
      toast.error('Verifique sua conexão');
    } else if (status === 403) {
      toast.error('Você não tem permissão para isso');
    } else if (status !== undefined && status >= 500) {
      toast.error('Erro no servidor, tente novamente');
    }
    // 400, 404 e outros 4xx são erros de negócio tratados pelos componentes

    return Promise.reject(error);
  }
);

export default apiClient;
