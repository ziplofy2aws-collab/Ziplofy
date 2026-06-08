/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AUTH_MICROSERVICE_FRONTEND_URL: string;
  /** Public storefront origin (no trailing slash). Optional; defaults to `window.location.origin`. */
  readonly VITE_STOREFRONT_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
