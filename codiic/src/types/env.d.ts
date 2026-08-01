/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SOCKET_URL: string;
    readonly VITE_AUTH_MICROSERVICE_FRONTEND_URL: string;
    readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';
    /**
     * Static catalog theme editor mode (boolean string: "true" / "false").
     * When true: Themes page shows Open catalog editor; loads Watch from remote-themes/watch locally.
     */
    readonly VITE_STATIC_CATALOG_THEME_EDITOR_MODE?: string;
    /** Alias of VITE_STATIC_CATALOG_THEME_EDITOR_MODE — see theme-editor-static.config.ts */
    readonly VITE_THEME_EDITOR_STATIC_MODE?: string;
    readonly VITE_THEME_EDITOR_STATIC_PACK?: string;
    readonly VITE_THEME_EDITOR_STATIC_BASE_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_JS_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_CSS_URL?: string;
    readonly VITE_THEME_EDITOR_STATIC_THEME_NAME?: string;
    readonly VITE_THEME_EDITOR_STATIC_THEME_ID?: string;
    readonly VITE_THEME_EDITOR_STATIC_STORE_ID?: string;
    /** Dedicated render-store origin for theme editor iframe (e.g. https://preview.codiic.com). */
    readonly VITE_RENDER_STORE_ORIGIN?: string;
    readonly VITE_THEME_PREVIEW_ORIGIN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}