import axios, { InternalAxiosRequestConfig } from "axios";
import endpoints from "./endpoints";

const api = axios.create({
  baseURL: endpoints.auth.me.split("/users/me/")[0],
});

// Interceptor para agregar token JWT automáticamente
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access");

  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// Manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
    return Promise.reject(error);
  }
);

export default api;
