const CODIIC = {
  apiUrl: 'https://api.codiic.com/api',
  redirectionUrl: 'https://dashboard.codiic.com',
} as const;

function isCodiicHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'codiic.com' || h.endsWith('.codiic.com');
}

function runtimeFallback<K extends keyof typeof CODIIC>(key: K): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!isCodiicHost(window.location.hostname)) return undefined;
  return CODIIC[key];
}

const pick = (envValue: string | undefined, key: keyof typeof CODIIC, devFallback: string): string => {
  if (envValue?.trim()) return envValue.trim();
  const runtime = runtimeFallback(key);
  if (runtime) return runtime;
  if (import.meta.env.DEV) return devFallback;
  throw new Error(`Missing required client env: VITE_${key === 'apiUrl' ? 'API_URL' : 'REDIRECTION_URL'}`);
};

export const clientEnv = {
  apiUrl: pick(import.meta.env.VITE_API_URL, 'apiUrl', 'http://127.0.0.1:5000/api'),
  redirectionUrl: pick(import.meta.env.VITE_REDIRECTION_URL, 'redirectionUrl', 'http://localhost:5173'),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
};
