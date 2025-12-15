// Configuración de la API para PRODUCCIÓN
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Cambiar esta URL por la URL de tu backend en producción
// Ejemplo: https://tu-app.herokuapp.com/api
// Ejemplo: https://tu-app.koyeb.app/api
const API_URL = 'https://TU-BACKEND-AQUI.com/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos para conexiones lentas
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    }
    return Promise.reject(error);
  }
);

export default api;
