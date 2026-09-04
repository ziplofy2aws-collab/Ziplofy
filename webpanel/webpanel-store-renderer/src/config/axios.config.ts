import axios from 'axios';

/**
 * Axios client for the Web Panel Store Renderer.
 * Dev: Vite proxies `/api` → wabapanel-express (:5001).
 * Prod: prefer same-origin `/api` (nginx); optional absolute `VITE_API_URL`.
 */
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const axiosi = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  withCredentials: true,
  timeout: 30000,
});
