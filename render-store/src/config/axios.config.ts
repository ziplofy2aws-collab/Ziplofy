import type { AxiosInstance } from "axios";
import axios from "axios";
import { safeLocalStorage } from "../types/local-storage";
import { getStorefrontUnlockToken } from "../utils/storefront-unlock-token";

const STOREFRONT_UNLOCK_HEADER = "x-storefront-unlock-token";

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
    const unlockToken = getStorefrontUnlockToken();
    if (unlockToken) {
      config.headers[STOREFRONT_UNLOCK_HEADER] = unlockToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
