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
  const token = await storage.getToken()
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//TRATAMENTO DE TOKEN EXPIRADO
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor de Resposta: Trata o Token Expirado
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
export default api;