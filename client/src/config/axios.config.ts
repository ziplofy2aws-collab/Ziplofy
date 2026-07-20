import type { AxiosInstance } from "axios";
import axios from "axios";
import { safeLocalStorage } from "../types/local-storage";


import { clientEnv } from './env';

export const axiosi: AxiosInstance = axios.create({
  baseURL: clientEnv.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies (refresh tokens)
});

// Request interceptor to add auth token
axiosi.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);