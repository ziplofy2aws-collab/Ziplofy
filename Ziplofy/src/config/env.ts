type FrontendEnv = {
  apiUrl: string;
  socketUrl: string;
  authMicroserviceFrontendUrl: string;
  appEnv: 'development' | 'staging' | 'production';
};

const requireEnv = (value: string | undefined, key: string): string => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required frontend env variable: ${key}`);
  }
  return value;
};

export const frontendEnv: FrontendEnv = {
  apiUrl: requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL'),
  socketUrl: requireEnv(import.meta.env.VITE_SOCKET_URL, 'VITE_SOCKET_URL'),
  authMicroserviceFrontendUrl: requireEnv(
    import.meta.env.VITE_AUTH_MICROSERVICE_FRONTEND_URL,
    'VITE_AUTH_MICROSERVICE_FRONTEND_URL'
  ),
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};
