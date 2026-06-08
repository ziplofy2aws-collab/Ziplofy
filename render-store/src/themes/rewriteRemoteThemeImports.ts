/**
 * Public origin + optional Vite `base` path (e.g. storefront at `/store/`).
 * `appOrigin` should be scheme+host only (no path), e.g. `https://shop.example.com`.
 */
function storefrontPublicBase(appOrigin: string): string {
  const o = appOrigin.replace(/\/$/, '');
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') return o;
  const pathOnly = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${o}${pathOnly}`;
}

/**
 * Rewrites bare imports in a built remote theme `theme.js` so it can run in the browser
 * when loaded from the API (same transforms the old Vite `localRemoteThemePlugin` applied).
 *
 * @param appOrigin — e.g. `window.location.origin` so imports work when the theme runs from a `blob:` module URL.
 */
export function rewriteRemoteThemeImports(source: string, appOrigin: string): string {
  const root = storefrontPublicBase(appOrigin);
  const dev = import.meta.env.DEV;
  const jsx = dev
    ? `${root}/src/themes/remote-runtime-shims/react-jsx-runtime.ts`
    : `${root}/remote-theme-runtime/react-jsx-runtime.js`;
  const react = dev ? `${root}/src/themes/remote-runtime-shims/react.ts` : `${root}/remote-theme-runtime/react.js`;
  const rrd = dev
    ? `${root}/src/themes/remote-runtime-shims/react-router-dom.ts`
    : `${root}/remote-theme-runtime/react-router-dom.js`;
  const sdk = dev ? `${root}/src/sdk/index.ts` : `${root}/remote-theme-runtime/sdk.js`;

  return source
    .replaceAll('from "react/jsx-runtime"', `from "${jsx}"`)
    .replaceAll('from "react-router-dom"', `from "${rrd}"`)
    .replaceAll('from "@render-store/sdk"', `from "${sdk}"`)
    .replaceAll('from "react"', `from "${react}"`);
}
