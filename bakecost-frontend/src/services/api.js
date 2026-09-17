import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 
                    error.response?.data || 
                    'Error de conexión con el servidor';
    return Promise.reject(new Error(typeof message === 'string' ? message : 'Error inesperado'));
  }
);

export default api;