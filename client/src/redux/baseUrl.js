// Base URL resolution supporting development and production environments
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0");

const isProd =
  !isLocalhost &&
  (import.meta.env.VITE_ENVIRONMENT === "production" ||
    (import.meta.env.PROD && import.meta.env.VITE_ENVIRONMENT !== "development"));

export const BASE_URL = isProd
  ? import.meta.env.VITE_BASE_URL_PROD || "https://instagram-xbht.onrender.com/api"
  : import.meta.env.VITE_BASE_URL_DEV || "http://localhost:8000/api";

export default BASE_URL;

