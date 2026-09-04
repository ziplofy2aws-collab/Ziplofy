import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* Shopify-style admin tokens (Codiic parity) */
        "page-background-color": "#f1f1f1",
        "admin-sidebar": "#e8e8e8",
        "admin-header": "#000000",
        "admin-header-control": "#1a1a1a",
        "admin-header-control-hover": "#262626",
        "admin-surface": "#ffffff",
        "admin-secondary": "#f1f1f1",
        "admin-border": "#e3e3e3",
        "admin-divider": "#ebebeb",
        "admin-row-hover": "#f6f6f7",
        "admin-table-header": "#f7f7f7",
        "admin-fill": "#e3e3e3",
        "admin-text": "#303030",
        "admin-text-secondary": "#616161",
        "admin-text-subdued": "#8a8a8a",
      },
    },
  },
  plugins: [],
  safelist: [
    'admin-shopify-header',
    'admin-header-control',
    'admin-header-search',
    'bg-black',
    'bg-admin-sidebar',
    'bg-admin-surface',
    'bg-page-background-color',
  ],
};
export default config;
