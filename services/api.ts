import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

const api = axios.create({

  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if(error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
}

//INJECAO DE TOKEN
api.interceptors.request.use(async config => {

  if (config.url?.includes('/users/login') || config.url?.includes('/users/refresh-token')) {
    return config;
  }

  const token = await storage.getToken()
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//TRATAMENTO DE TOKEN EXPIRADO
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se o erro for 401 e não for uma tentativa de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está renovando, adiciona à fila e aguarda
        return new Promise(function (resolve, reject) {
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
        const refreshToken = await storage.getRefreshToken();
        
        // Chamada para a rota de refresh da sua API
        const response = await api.post('/users/refresh-token', {
          refreshToken,
        });

        const { accessToken: newToken } = response.data;

        await storage.saveToken(newToken);

        // Processa a fila com o novo token
        processQueue(null, newToken);
        
        // Refaz a requisição original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // IMPORTANTE: Aqui você deve deslogar o usuário (será tratado no Contexto)
        // Vamos lançar o erro para que o Contexto perceba e deslogue
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// INTERCEPTOR PARA PADRONIZAÇÃO DE ERROS
api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso (2xx), apenas retorna
  (error: AxiosError) => {
    // Se o servidor respondeu com um status de erro (4xx, 5xx)
    if (error.response) {
      console.error('\n\n\nErro na resposta do servidor:\n', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Você pode injetar uma mensagem amigável ou tratar dados aqui
      // Exemplo: error.message = error.response.data.message || 'Erro inesperado';
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta (erro de rede)
      console.error('Erro de rede/sem resposta:', error.request);
    } else {
      // Erro na configuração da requisição
      console.error('Erro de configuração:', error.message);
    }

    // É crucial retornar Promise.reject para que o erro continue fluindo
    // para os blocos catch ou para o interceptor de refresh token
    return Promise.reject(error);
  }
);

export default api;