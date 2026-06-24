type FrontendEnv = {
  apiUrl: string;
  socketUrl: string;
  authMicroserviceFrontendUrl: string;
  appEnv: 'development' | 'staging' | 'production';
};

const requireEnv = (value: string | undefined, key: string, devFallback?: string): string => {
  if (value?.trim()) return value.trim();
  if (import.meta.env.DEV && devFallback) return devFallback;
  throw new Error(`Missing required frontend env variable: ${key}`);
};

export const frontendEnv: FrontendEnv = {
  apiUrl: requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL', 'http://127.0.0.1:5000/api'),
  socketUrl: requireEnv(import.meta.env.VITE_SOCKET_URL, 'VITE_SOCKET_URL', 'http://127.0.0.1:5000'),
  authMicroserviceFrontendUrl: requireEnv(
    import.meta.env.VITE_AUTH_MICROSERVICE_FRONTEND_URL,
    'VITE_AUTH_MICROSERVICE_FRONTEND_URL',
    'http://localhost:5173'
  ),
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};
