import axios from "axios";
import BASE_URL from "../redux/baseUrl";

// Create configured Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptor: Automatically attach Bearer token to all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error formatting & 401 session expiry handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, clean stale token and redirect to login
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname === "/login" ||
        window.location.pathname === "/signup" ||
        window.location.pathname === "/forgot-password" ||
        window.location.pathname.startsWith("/reset-password");

      if (!isAuthRoute && localStorage.getItem("auth-token")) {
        localStorage.removeItem("auth-token");
        window.location.href = "/login";
      }
    }

    const message =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred.";

    // Normalize error message for easier consumption in thunks/components
    error.customMessage = message;

    return Promise.reject(error);
  }
);

export default apiClient;
