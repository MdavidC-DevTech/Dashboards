// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://apiatschool.roboticminds.ec",

});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchDatos = async () => {
  try {
    const response = await api.get("/data/datos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    throw error;
  }
};

export default api;
