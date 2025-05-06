// Base url
let BASE_URL;

if (import.meta.env.VITE_ENVIRONMENT === "production") {
  BASE_URL = import.meta.env.VITE_BASE_URL_PROD;
} else {
  BASE_URL = import.meta.env.VITE_BASE_URL_DEV;
}

export default BASE_URL;
