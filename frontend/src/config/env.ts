const CODIIC = {
  backendUrl: 'https://backend.codiic.com/api',
  socketUrl: 'https://backend.codiic.com',
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

const pick = (
  envValue: string | undefined,
  key: keyof typeof CODIIC,
  devFallback: string,
): string => {
  if (envValue?.trim()) return envValue.trim();
  const runtime = runtimeFallback(key);
  if (runtime) return runtime;
  if (import.meta.env.DEV) return devFallback;
  const envKey = key === 'backendUrl' ? 'VITE_BACKEND_URL' : 'VITE_SOCKET_URL';
  throw new Error(`Missing required admin frontend env: ${envKey}`);
};

export const adminEnv = {
  backendUrl: pick(import.meta.env.VITE_BACKEND_URL, 'backendUrl', 'http://127.0.0.1:5000/api'),
  socketUrl: pick(import.meta.env.VITE_SOCKET_URL, 'socketUrl', 'http://127.0.0.1:5000'),
};
