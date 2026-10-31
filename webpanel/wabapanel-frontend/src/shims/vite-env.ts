/**
 * import.meta.env compatibility shim for ported codiic code.
 * Maps Vite env names onto Next.js env conventions (NEXT_PUBLIC_*).
 */

const VITE_KEYMAP: Record<string, string | undefined> = {
  VITE_API_URL: process.env.NEXT_PUBLIC_API_URL,
  VITE_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  VITE_AUTH_MICROSERVICE_FRONTEND_URL:
    process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
  VITE_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  VITE_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
  VITE_THEME_EDITOR_STATIC_MODE:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_MODE,
  VITE_STATIC_CATALOG_THEME_EDITOR_MODE:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_MODE,
  VITE_THEME_EDITOR_STATIC_PACK: process.env.NEXT_PUBLIC_THEME_EDITOR_PACK,
  VITE_THEME_EDITOR_STATIC_BASE_URL:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_BASE_URL,
  VITE_THEME_EDITOR_STATIC_THEME_ID:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_THEME_ID,
  VITE_THEME_EDITOR_STATIC_THEME_NAME:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_THEME_NAME,
  VITE_THEME_EDITOR_STATIC_JS_URL:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_JS_URL,
  VITE_THEME_EDITOR_STATIC_CSS_URL:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_CSS_URL,
  VITE_THEME_EDITOR_STATIC_STORE_ID:
    process.env.NEXT_PUBLIC_THEME_EDITOR_STATIC_STORE_ID,
  VITE_THEME_EDITOR_LOCAL_REMOTE_THEME:
    process.env.NEXT_PUBLIC_THEME_EDITOR_LOCAL_REMOTE_THEME,
  VITE_THEME_EDITOR_LOCAL_HORIZON:
    process.env.NEXT_PUBLIC_THEME_EDITOR_LOCAL_REMOTE_THEME,
  VITE_THEME_EDITOR_STOREFRONT_URL:
    process.env.NEXT_PUBLIC_STOREFRONT_URL,
  VITE_STOREFRONT_BASE_URL: process.env.NEXT_PUBLIC_STOREFRONT_BASE_URL,
};

export function viteEnvGet(key: string): string | undefined {
  if (key in VITE_KEYMAP) return VITE_KEYMAP[key];
  if (key.startsWith('VITE_')) {
    return process.env[`NEXT_PUBLIC_${key.slice(5)}`];
  }
  return undefined;
}

const VITE_ENV_TARGET: Record<string, string | boolean | undefined> = {
  DEV: process.env.NODE_ENV === 'development',
  PROD: process.env.NODE_ENV === 'production',
  MODE: process.env.NODE_ENV ?? 'development',
};

export const viteEnv: Record<string, string | boolean | undefined> & {
  DEV: boolean;
  PROD: boolean;
  MODE: string;
} = new Proxy(VITE_ENV_TARGET, {
  get(target, prop: string) {
    if (prop in target) return target[prop];
    return viteEnvGet(prop);
  },
}) as typeof viteEnv;
