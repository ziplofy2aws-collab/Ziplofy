import type { AxiosInstance } from "axios";
import axios from "axios";
import { safeLocalStorage } from "../types/local-storage";

const viteApi = import.meta.env.VITE_API_URL;
const apiBase =
  typeof viteApi === "string" && viteApi.trim() !== ""
    ? `${viteApi.replace(/\/$/, "")}/api`
    : "/api";

export const axiosi: AxiosInstance = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosi.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
