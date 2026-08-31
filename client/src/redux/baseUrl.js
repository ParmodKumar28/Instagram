// Base URL resolution supporting development, local network (mobiles/LAN), and production environments
const isLocalNetwork =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0" ||
    /^192\.168\./.test(window.location.hostname) ||
    /^10\./.test(window.location.hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname) ||
    window.location.hostname.endsWith(".local"));

const isProd =
  !isLocalNetwork &&
  (import.meta.env.VITE_ENVIRONMENT === "production" ||
    (import.meta.env.PROD && import.meta.env.VITE_ENVIRONMENT !== "development"));

export const BASE_URL = isProd
  ? import.meta.env.VITE_BASE_URL_PROD || "https://instagram-xbht.onrender.com/api"
  : import.meta.env.VITE_BASE_URL_DEV ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost" && isLocalNetwork
      ? `http://${window.location.hostname}:8000/api`
      : "http://localhost:8000/api");

export const SOCKET_URL = isProd
  ? import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_BASE_URL_PROD || "https://instagram-xbht.onrender.com/api").replace(/\/api\/?$/, "")
  : typeof window !== "undefined" && isLocalNetwork
  ? `http://${window.location.hostname}:8000`
  : "http://localhost:8000";

export default BASE_URL;

