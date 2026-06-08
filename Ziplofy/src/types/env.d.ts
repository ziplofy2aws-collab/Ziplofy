/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SOCKET_URL: string;
    readonly VITE_AUTH_MICROSERVICE_FRONTEND_URL: string;
    readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
    /** When "true", theme editor uses local static pack — see theme-editor-static.config.ts */
    readonly VITE_THEME_EDITOR_STATIC_MODE?: string;
    readonly VITE_THEME_EDITOR_STATIC_PACK?: string;
    readonly VITE_THEME_EDITOR_STATIC_BASE_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_JS_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_CSS_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_THEME_NAME?: string;
    readonly VITE_THEME_EDITOR_STATIC_THEME_ID?: string;
    readonly VITE_THEME_EDITOR_STATIC_STORE_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}