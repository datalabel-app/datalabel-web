import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5245";
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || "50000", 10);

const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
