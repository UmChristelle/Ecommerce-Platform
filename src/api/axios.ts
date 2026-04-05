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
      // Don't attach the static admin token to API calls
      if (token && token !== "admin-static-token") {
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
    // Only logout on 401 if NOT admin static session
    if (error.response?.status === 401) {
      try {
        const session = localStorage.getItem("session");
        if (session) {
          const { token } = JSON.parse(session);
          if (token !== "admin-static-token") {
            localStorage.removeItem("session");
            window.location.href = "/login";
          }
        }
      } catch {
        localStorage.removeItem("session");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;