import { CODIIC_PRODUCTION, isCodiicProductionHost } from './codiic-domains';
import { viteEnv } from '../shims/vite-env';

type FrontendEnv = {
  apiUrl: string;
  socketUrl: string;
  authMicroserviceFrontendUrl: string;
  googleClientId: string;
  appEnv: 'development' | 'staging' | 'production';
};

function codiicRuntimeFallbacks(): Partial<FrontendEnv> | null {
  if (typeof window === 'undefined') return null;
  if (!isCodiicProductionHost(window.location.hostname)) return null;
  return {
    apiUrl: CODIIC_PRODUCTION.apiUrl,
    socketUrl: CODIIC_PRODUCTION.apiOrigin,
    authMicroserviceFrontendUrl: CODIIC_PRODUCTION.authOrigin,
    appEnv: 'production',
  };
}

const requireEnv = (
  value: string | undefined,
  key: keyof FrontendEnv,
  devFallback?: string,
  runtimeFallback?: string,
): string => {
  if (value?.trim()) return value.trim();
  if (runtimeFallback?.trim()) return runtimeFallback.trim();
  if (viteEnv.DEV && devFallback) return devFallback;
  throw new Error(`Missing required frontend env variable: ${key}`);
};

const runtime = codiicRuntimeFallbacks();

export const frontendEnv: FrontendEnv = {
  apiUrl: requireEnv(
    viteEnv.VITE_API_URL,
    'apiUrl',
    'http://127.0.0.1:5000/api',
    runtime?.apiUrl,
  ),
  socketUrl: requireEnv(
    viteEnv.VITE_SOCKET_URL,
    'socketUrl',
    'http://127.0.0.1:5000',
    runtime?.socketUrl,
  ),
  authMicroserviceFrontendUrl: requireEnv(
    viteEnv.VITE_AUTH_MICROSERVICE_FRONTEND_URL,
    'authMicroserviceFrontendUrl',
    'http://localhost:3000',
    runtime?.authMicroserviceFrontendUrl,
  ),
  googleClientId: viteEnv.VITE_GOOGLE_CLIENT_ID ?? '',
  appEnv:
  (viteEnv.VITE_APP_ENV as FrontendEnv['appEnv'] | undefined) ||
    runtime?.appEnv ||
    'development',
};
