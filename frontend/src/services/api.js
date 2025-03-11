// src/services/api.js
import axios from "axios";

// Instancia de Axios apuntando al backend de producción
const api = axios.create({
  baseURL: "https://apin.crazy-shaw.74-208-19-154.plesk.page",
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para obtener datos (endpoint /datos)
export const fetchDatos = async () => {
  try {
    const response = await api.get("/datos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    throw error;
  }
};

export default api;
