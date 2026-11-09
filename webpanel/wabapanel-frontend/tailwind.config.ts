import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/create-theme/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/theme-packs/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shims/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        /* Admin tokens — overridable via CSS vars (Orbitly shell remaps these) */
        "page-background-color": "var(--page-background-color, #f1f1f1)",
        "admin-sidebar": "var(--admin-sidebar, #e8e8e8)",
        "admin-header": "#000000",
        "admin-header-control": "#1a1a1a",
        "admin-header-control-hover": "#262626",
        "admin-surface": "var(--admin-surface, #ffffff)",
        "admin-secondary": "var(--admin-secondary, #f1f1f1)",
        "admin-border": "var(--admin-border, #e3e3e3)",
        "admin-divider": "var(--admin-divider, #ebebeb)",
        "admin-row-hover": "var(--admin-row-hover, #f6f6f7)",
        "admin-table-header": "var(--admin-table-header, #f7f7f7)",
        "admin-fill": "var(--admin-fill, #e3e3e3)",
        "admin-text": "var(--admin-text, #303030)",
        "admin-text-secondary": "var(--admin-text-secondary, #616161)",
        "admin-text-subdued": "var(--admin-text-subdued, #8a8a8a)",
        "admin-accent": "var(--admin-accent, #00896F)",
      },
    },
  },
  plugins: [],
  safelist: [
    'admin-shopify-header',
    'admin-header-control',
    'admin-header-search',
    'client-orbitly-shell',
    'client-orbitly-aside',
    'client-orbitly-header',
    'client-orbitly-main',
    'bg-black',
    'bg-admin-sidebar',
    'bg-admin-surface',
    'bg-page-background-color',
  ],
};
export default config;
