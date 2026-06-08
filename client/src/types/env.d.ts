/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_REDIRECTION_URL: string;
  // Add other VITE_ variables here as you create them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}