import axios from "axios";

const api = axios.create({
  baseURL: "https://e-commas-apis-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const session = localStorage.getItem("session");
    if (session) {
      const { token } = JSON.parse(session);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    localStorage.removeItem("session");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("session");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
