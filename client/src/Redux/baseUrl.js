// Base URL resolution supporting development and production environments
const isProd = import.meta.env.VITE_ENVIRONMENT === "production" || import.meta.env.PROD;

export const BASE_URL = isProd
  ? (import.meta.env.VITE_BASE_URL_PROD || "https://instagram-xbht.onrender.com/api")
  : (import.meta.env.VITE_BASE_URL_DEV || "http://localhost:8000/api");

export default BASE_URL;
