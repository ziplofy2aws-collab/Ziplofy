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
 * Some published catalog `theme.js` builds call `useFeaturedCollectionProducts({ limit })`
 * in the same `const` list before `limit` is bound from `useMemo` → TDZ
 * (`Cannot access 'f' before initialization` in Featured Collection).
 * Inline the `productsToShow` read when that pattern is detected.
 */
export function patchRemoteThemeFeaturedCollectionLimitTdZ(source: string): string {
  return source.replace(
    /(\w+)\(\{\s*collectionHandle:\s*(\w+),\s*limit:\s*(\w+)\s*\}\)/g,
    (full, hookFn: string, handleVar: string, limitVar: string, offset: number) => {
      const after = source.slice(offset + full.length, offset + full.length + 4000);
      if (!new RegExp(`\\blimit:\\s*${limitVar}\\b`).test(after)) return full;

      const productsToShow = after.match(
        /Math\.max\(\s*1\s*,\s*(\w+)\(\s*(\w+)\s*,\s*`\$\{(\w+)\}\.productsToShow`\s*,\s*8\s*\)\s*\)/
      );
      if (!productsToShow) {
        return `${hookFn}({ collectionHandle: ${handleVar}, limit: 8 })`;
      }
      const [, numFn, cfgVar, settingsVar] = productsToShow;
      return `${hookFn}({ collectionHandle: ${handleVar}, limit: Math.max(1, ${numFn}(${cfgVar}, \`\${${settingsVar}}.productsToShow\`, 8)) })`;
    }
  );
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
  const reactDom = dev
    ? `${root}/src/themes/remote-runtime-shims/react-dom.ts`
    : `${root}/remote-theme-runtime/react-dom.js`;
  const rrd = dev
    ? `${root}/src/themes/remote-runtime-shims/react-router-dom.ts`
    : `${root}/remote-theme-runtime/react-router-dom.js`;
  const sdk = dev ? `${root}/src/sdk/index.ts` : `${root}/remote-theme-runtime/sdk.js`;

  const patched = patchRemoteThemeFeaturedCollectionLimitTdZ(source);

  return patched
    .replaceAll('from "react/jsx-runtime"', `from "${jsx}"`)
    .replaceAll("from 'react/jsx-runtime'", `from "${jsx}"`)
    .replaceAll('from "react-dom/client"', `from "${reactDom}"`)
    .replaceAll("from 'react-dom/client'", `from "${reactDom}"`)
    .replaceAll('from "react-dom"', `from "${reactDom}"`)
    .replaceAll("from 'react-dom'", `from "${reactDom}"`)
    .replaceAll('from "react-router-dom"', `from "${rrd}"`)
    .replaceAll("from 'react-router-dom'", `from "${rrd}"`)
    .replaceAll('from "@render-store/sdk"', `from "${sdk}"`)
    .replaceAll("from '@render-store/sdk'", `from "${sdk}"`)
    .replaceAll('from "react"', `from "${react}"`)
    .replaceAll("from 'react'", `from "${react}"`);
}
