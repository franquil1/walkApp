import axios from "axios";

// Detecta automáticamente si estás en PC o móvil en la red local
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) { cerrarSesion(); return Promise.reject(error); }

      try {
        const res = await axios.post(`${API_BASE}/api/auth/token/refresh/`, { refresh: refreshToken });
        const nuevoAccessToken = res.data.access;
        const nuevoRefreshToken = res.data.refresh;

        localStorage.setItem("access_token", nuevoAccessToken);
        if (nuevoRefreshToken) localStorage.setItem("refresh_token", nuevoRefreshToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${nuevoAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${nuevoAccessToken}`;

        processQueue(null, nuevoAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        cerrarSesion();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function cerrarSesion() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export default api;