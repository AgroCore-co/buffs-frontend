import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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
      const sessionData = localStorage.getItem('@Buffs:session');
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const token = session.access_token;
          
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Erro ao ler a sessão do usuário:', error);
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
// INTERCEPTOR DE RESPOSTA (Trata o 401 e faz o Refresh)
// ---------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Pegamos a requisição original para poder refazê-la depois
    // Estendemos a tipagem para incluir a flag _retry e não entrar em loop infinito
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se o erro for 401 e ainda não tentamos fazer retry nesta requisição específica
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Evita o endpoint de login ou o próprio refresh de entrarem no fluxo de retry
      if (originalRequest.url?.includes('/auth/signin') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Se já existe uma renovação em andamento, jogamos a requisição na fila
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

      // Bloqueia novas requisições 401 e inicia o processo de refresh
      isRefreshing = true;

      try {
        const sessionData = localStorage.getItem('@Buffs:session');
        if (!sessionData) throw new Error('Sessão não encontrada localmente.');

        const session = JSON.parse(sessionData);
        const refreshToken = session.refresh_token;

        if (!refreshToken) throw new Error('Refresh token não encontrado.');

        // Chamamos o endpoint de refresh
        // IMPORTANTE: usamos uma instância limpa do axios para não cair nos interceptors deste arquivo e causar loop
        const { data: newSession } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Atualiza a sessão inteira no LocalStorage com o novo access_token e refresh_token
        localStorage.setItem('@Buffs:session', JSON.stringify(newSession));

        // Atualiza o header da requisição que falhou lá no começo
        originalRequest.headers.Authorization = `Bearer ${newSession.access_token}`;

        // Libera a fila injetando o novo token nas requisições aguardando
        processQueue(null, newSession.access_token);

        // Refaz a requisição original com o token válido
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Se a renovação falhar (refresh token expirado ou inválido)
        processQueue(refreshError, null);
        
        // Mata a sessão
        if (typeof window !== 'undefined') {
          localStorage.removeItem('@Buffs:session');
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      } finally {
        // Libera o lock independente de sucesso ou erro
        isRefreshing = false;
      }
    }

    // Retorna qualquer outro erro (400, 404, 500) normalmente
    return Promise.reject(error);
  }
);

export default apiClient;