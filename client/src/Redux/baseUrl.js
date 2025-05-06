// Base url
let BASE_URL;
if(import.meta.VITE_ === "production") {
  BASE_URL = import.meta.env.VITE_PROD_URL;
} else if(import.meta.env.VITE_ === "development") {
  BASE_URL = import.meta.env.VITE_DEV_URL;
} else if(import.meta.env.VITE_ === "test") {
  BASE_URL = import.meta.env.VITE_TEST_URL;
} else {
  BASE_URL = import.meta.env.VITE_LOCAL_URL;
}

export default BASE_URL;
