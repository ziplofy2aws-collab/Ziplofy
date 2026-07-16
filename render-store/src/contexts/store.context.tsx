import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { axiosi } from "../config/axios.config";
import { StorefrontProductProvider } from "./product.context";
import { ThemeConfigProvider } from "./theme-config.context";

type ThemeRuntimePayload = {
  themeId: string;
  themeName: string;
  themeKind?: 'store-custom' | 'catalog';
  runtimeBaseUrl?: string;
  entryHtml?: string | null;
  htmlUrls?: string[];
  cssUrls?: string[];
  jsUrls?: string[];
  liquid?: { enabled?: boolean; renderPagePath?: string; templates?: string[] };
  remoteThemeJsUrl?: string | null;
  remoteThemeCssUrl?: string | null;
  themeConfig?: Record<string, unknown> | null;
  isStoreCustomTheme?: boolean;
};

function clearInstalledThemeRuntimeState(setters: {
  setActiveThemeEntryHtmlUrl: (v: string | null) => void;
  setActiveThemeCssUrls: (v: string[]) => void;
  setActiveThemeJsUrls: (v: string[]) => void;
  setActiveThemeHtmlUrls: (v: string[]) => void;
  setThemeRuntimeBaseUrl: (v: string | null) => void;
  setRemoteThemeJsUrl: (v: string | null) => void;
  setRemoteThemeCssUrl: (v: string | null) => void;
  setLiquidThemeEnabled: (v: boolean) => void;
  setLiquidRenderPagePath: (v: string | null) => void;
  setLiquidTemplateNames: (v: string[]) => void;
  setLiquidTemplatesListProvided: (v: boolean) => void;
  setActiveReactThemePackId: (v: "theme1" | "theme2" | null) => void;
  setReactThemePacks: (v: StorefrontContextType["reactThemePacks"]) => void;
}) {
  setters.setActiveThemeEntryHtmlUrl(null);
  setters.setActiveThemeCssUrls([]);
  setters.setActiveThemeJsUrls([]);
  setters.setActiveThemeHtmlUrls([]);
  setters.setThemeRuntimeBaseUrl(null);
  setters.setRemoteThemeJsUrl(null);
  setters.setRemoteThemeCssUrl(null);
  setters.setLiquidThemeEnabled(false);
  setters.setLiquidRenderPagePath(null);
  setters.setLiquidTemplateNames([]);
  setters.setLiquidTemplatesListProvided(false);
  setters.setActiveReactThemePackId(null);
  setters.setReactThemePacks([]);
}

export interface StorefrontContextType {
  isStoreFront: boolean;
  storeFrontChecked: boolean;
  storeFrontMeta: {
    name: string;
    description: string;
    storeId: string;
    seoHomePageTitle?: string;
    seoMetaDescription?: string;
    seoSocialImageUrl?: string;
  } | null;
  /** Set when the store has a JSON theme creator theme applied (Store.appliedCustomThemeId). */
  appliedCustomThemeId: string | null;
  appliedCustomThemeName: string | null;
  /** Set when a catalog theme from the theme library is applied (Store.appliedTheme). */
  appliedCatalogThemeId: string | null;
  appliedCatalogThemeName: string | null;
  /** Resolved active theme kind from the storefront API. */
  themeKind: 'store-custom' | 'catalog' | 'none';
  /** True when theme-runtime serves StoreCustomTheme JSON (create-theme composer, no theme.js). */
  isStoreCustomTheme: boolean;
  activeThemeId: string | null;
  activeThemeName: string | null;
  activeThemeEntryHtmlUrl: string | null;
  activeThemeCssUrls: string[];
  activeThemeJsUrls: string[];
  activeThemeHtmlUrls: string[];
  /** `/api/themes/installed/.../remoteThemeDist/theme.js` when the installed theme includes a React bundle. */
  remoteThemeJsUrl: string | null;
  /** `/api/themes/installed/.../remoteThemeDist/theme.css` when present. */
  remoteThemeCssUrl: string | null;
  /** Public base URL for installed theme files (same as theme-runtime `runtimeBaseUrl`). */
  themeRuntimeBaseUrl: string | null;
  /** Phase 2: server-side Liquid render endpoint is available for this theme */
  liquidThemeEnabled: boolean;
  /** Path after /api, e.g. /storefront/{storeId}/render/page */
  liquidRenderPagePath: string | null;
  /**
   * Basenames from theme `templates/*.liquid` — used to avoid requesting missing templates.
   * Empty array means the API did not send the list (legacy); client then allows any template name.
   */
  liquidTemplateNames: string[];
  /** True when theme-runtime returned an explicit `liquid.templates` array (may be empty). */
  liquidTemplatesListProvided: boolean;
  /** Active React pack resolved from network payload (/storefront/:storeId/react-theme-pack). */
  activeReactThemePackId: "theme1" | "theme2" | null;
  /** Full list of network theme packs available to this store. */
  reactThemePacks: Array<{
    id: "theme1" | "theme2";
    name: string;
    version: string;
    description: string;
    homeEntry: "theme1" | "theme2";
    productEntry: "theme1" | "theme2";
    profileEntry: "theme1" | "theme2";
    ordersEntry: "theme1" | "theme2";
    preferencesEntry: "theme1" | "theme2";
  }>;
  /** Merchant overrides from theme editor (merged with defaults on API). */
  themeConfig: Record<string, unknown> | null;
  storeAssetsLoading: boolean;
  storeAssetsReady: boolean;
  loadStoreAssets: () => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStoreFront, setIsStoreFront] = useState<boolean>(false);
  const [storeFrontChecked, setStoreFrontChecked] = useState<boolean>(false);
  const [storeFrontMeta, setStoreFrontMeta] = useState<StorefrontContextType['storeFrontMeta']>(null);
  const [appliedCustomThemeId, setAppliedCustomThemeId] = useState<string | null>(null);
  const [appliedCustomThemeName, setAppliedCustomThemeName] = useState<string | null>(null);
  const [appliedCatalogThemeId, setAppliedCatalogThemeId] = useState<string | null>(null);
  const [appliedCatalogThemeName, setAppliedCatalogThemeName] = useState<string | null>(null);
  const [themeKind, setThemeKind] = useState<'store-custom' | 'catalog' | 'none'>('none');
  const [isStoreCustomTheme, setIsStoreCustomTheme] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [activeThemeName, setActiveThemeName] = useState<string | null>(null);
  const [activeThemeEntryHtmlUrl, setActiveThemeEntryHtmlUrl] = useState<string | null>(null);
  const [activeThemeCssUrls, setActiveThemeCssUrls] = useState<string[]>([]);
  const [activeThemeJsUrls, setActiveThemeJsUrls] = useState<string[]>([]);
  const [activeThemeHtmlUrls, setActiveThemeHtmlUrls] = useState<string[]>([]);
  const [themeRuntimeBaseUrl, setThemeRuntimeBaseUrl] = useState<string | null>(null);
  const [remoteThemeJsUrl, setRemoteThemeJsUrl] = useState<string | null>(null);
  const [remoteThemeCssUrl, setRemoteThemeCssUrl] = useState<string | null>(null);
  const [liquidThemeEnabled, setLiquidThemeEnabled] = useState<boolean>(false);
  const [liquidRenderPagePath, setLiquidRenderPagePath] = useState<string | null>(null);
  const [liquidTemplateNames, setLiquidTemplateNames] = useState<string[]>([]);
  const [liquidTemplatesListProvided, setLiquidTemplatesListProvided] = useState(false);
  const [activeReactThemePackId, setActiveReactThemePackId] = useState<"theme1" | "theme2" | null>(null);
  const [reactThemePacks, setReactThemePacks] = useState<StorefrontContextType["reactThemePacks"]>([]);
  const [themeConfig, setThemeConfig] = useState<Record<string, unknown> | null>(null);
  const [storeAssetsLoading, setStoreAssetsLoading] = useState(false);
  const [storeAssetsReady, setStoreAssetsReady] = useState(false);
  const storeAssetsLoadingRef = useRef(false);
  const storeAssetsReadyRef = useRef(false);
  /** Shared in-flight promise so parallel callers await the same load. */
  const storeAssetsPromiseRef = useRef<Promise<void> | null>(null);
  /** Hint from subdomain resolve — lets catalog pack fetch run in parallel with theme-runtime. */
  const themeKindHintRef = useRef<'store-custom' | 'catalog' | 'none'>('none');
  const resolvedStoreRef = useRef<{
    storeId: string;
    name: string;
    description: string;
  } | null>(null);

  const applyThemeRuntimePayload = (
    rt: ThemeRuntimePayload | null | undefined,
    installedRuntimeClear: Parameters<typeof clearInstalledThemeRuntimeState>[0]
  ): 'store-custom' | 'catalog' | 'none' => {
    if (!rt?.themeId) {
      setThemeKind('none');
      setAppliedCustomThemeId(null);
      setAppliedCustomThemeName(null);
      setAppliedCatalogThemeId(null);
      setAppliedCatalogThemeName(null);
      setActiveThemeId(null);
      setActiveThemeName(null);
      setThemeConfig(null);
      setIsStoreCustomTheme(false);
      clearInstalledThemeRuntimeState(installedRuntimeClear);
      return 'none';
    }

    const isCustom = Boolean(rt.isStoreCustomTheme || rt.themeKind === 'store-custom');
    const resolvedKind: 'store-custom' | 'catalog' = isCustom ? 'store-custom' : 'catalog';
    setThemeKind(resolvedKind);
    setIsStoreCustomTheme(isCustom);
    setActiveThemeId(rt.themeId);
    setActiveThemeName(rt.themeName || null);

    const tc = rt.themeConfig;
    setThemeConfig(tc && typeof tc === 'object' ? tc : null);

    if (isCustom) {
      setAppliedCustomThemeId(rt.themeId);
      setAppliedCustomThemeName(rt.themeName || null);
      setAppliedCatalogThemeId(null);
      setAppliedCatalogThemeName(null);
      clearInstalledThemeRuntimeState(installedRuntimeClear);
      return 'store-custom';
    }

    setAppliedCustomThemeId(null);
    setAppliedCustomThemeName(null);
    setAppliedCatalogThemeId(rt.themeId);
    setAppliedCatalogThemeName(rt.themeName || null);

    const entryHtml = rt.entryHtml;
    const runtimeBaseUrl = rt.runtimeBaseUrl;
    setActiveThemeEntryHtmlUrl(
      entryHtml && runtimeBaseUrl ? `${runtimeBaseUrl}/${entryHtml}` : null
    );
    setActiveThemeCssUrls(rt.cssUrls || []);
    setActiveThemeJsUrls(rt.jsUrls || []);
    setActiveThemeHtmlUrls(rt.htmlUrls || []);
    const rb = rt.runtimeBaseUrl;
    setThemeRuntimeBaseUrl(typeof rb === 'string' && rb.length > 0 ? rb.replace(/\/$/, '') : null);
    const liq = rt.liquid;
    setLiquidThemeEnabled(Boolean(liq?.enabled));
    setLiquidRenderPagePath(
      typeof liq?.renderPagePath === 'string' && liq.renderPagePath.length > 0
        ? liq.renderPagePath.startsWith('/')
          ? liq.renderPagePath
          : `/${liq.renderPagePath}`
        : null
    );
    if (Array.isArray(liq?.templates)) {
      setLiquidTemplateNames(liq.templates);
      setLiquidTemplatesListProvided(true);
    } else {
      setLiquidTemplateNames([]);
      setLiquidTemplatesListProvided(false);
    }
    setRemoteThemeJsUrl(
      typeof rt.remoteThemeJsUrl === 'string' && rt.remoteThemeJsUrl.length > 0
        ? rt.remoteThemeJsUrl
        : null
    );
    setRemoteThemeCssUrl(
      typeof rt.remoteThemeCssUrl === 'string' && rt.remoteThemeCssUrl.length > 0
        ? rt.remoteThemeCssUrl
        : null
    );
    return 'catalog';
  };

  const loadStoreAssets = useCallback(async () => {
    const resolved = resolvedStoreRef.current;
    if (!resolved) return;
    if (storeAssetsReadyRef.current) return;
    if (storeAssetsPromiseRef.current) return storeAssetsPromiseRef.current;

    const run = async () => {
      storeAssetsLoadingRef.current = true;
      setStoreAssetsLoading(true);

      const installedRuntimeClear = {
        setActiveThemeEntryHtmlUrl,
        setActiveThemeCssUrls,
        setActiveThemeJsUrls,
        setActiveThemeHtmlUrls,
        setThemeRuntimeBaseUrl,
        setRemoteThemeJsUrl,
        setRemoteThemeCssUrl,
        setLiquidThemeEnabled,
        setLiquidRenderPagePath,
        setLiquidTemplateNames,
        setLiquidTemplatesListProvided,
        setActiveReactThemePackId,
        setReactThemePacks,
      };

      try {
        let resolvedKind: 'store-custom' | 'catalog' | 'none' = 'none';
        const hint = themeKindHintRef.current;
        const runtimeUrl = `/storefront/${resolved.storeId}/theme-runtime`;
        const packUrl = `/storefront/${resolved.storeId}/react-theme-pack`;

        type PackPayload = {
          success: boolean;
          data?: {
            activePackId: 'theme1' | 'theme2';
            packs: StorefrontContextType['reactThemePacks'];
          };
        };

        const applyPack = (packRes: { data?: PackPayload } | null) => {
          setActiveReactThemePackId(packRes?.data?.data?.activePackId || null);
          setReactThemePacks(packRes?.data?.data?.packs || []);
        };

        try {
          // Catalog: fetch theme-runtime + react-theme-pack together (one RTT).
          // Custom / unknown: theme-runtime first; skip pack for store-custom.
          if (hint === 'catalog') {
            const [runtimeRes, packRes] = await Promise.all([
              axiosi.get<{ success: boolean; data?: ThemeRuntimePayload | null }>(runtimeUrl),
              axiosi.get<PackPayload>(packUrl).catch(() => null),
            ]);
            resolvedKind = applyThemeRuntimePayload(runtimeRes.data?.data, installedRuntimeClear);
            if (resolvedKind === 'store-custom') {
              setActiveReactThemePackId(null);
              setReactThemePacks([]);
            } else if (packRes) {
              applyPack(packRes);
            } else {
              setActiveReactThemePackId(null);
              setReactThemePacks([]);
            }
          } else {
            const runtimeRes = await axiosi.get<{
              success: boolean;
              data?: ThemeRuntimePayload | null;
            }>(runtimeUrl);
            resolvedKind = applyThemeRuntimePayload(runtimeRes.data?.data, installedRuntimeClear);

            if (resolvedKind === 'store-custom') {
              setActiveReactThemePackId(null);
              setReactThemePacks([]);
            } else {
              try {
                const reactPackRes = await axiosi.get<PackPayload>(packUrl);
                applyPack(reactPackRes);
              } catch {
                setActiveReactThemePackId(null);
                setReactThemePacks([]);
              }
            }
          }
        } catch {
          resolvedKind = applyThemeRuntimePayload(null, installedRuntimeClear);
          setActiveReactThemePackId(null);
          setReactThemePacks([]);
          toast.error('Failed to load store theme');
        }

        setStoreAssetsReady(true);
        storeAssetsReadyRef.current = true;
      } finally {
        storeAssetsLoadingRef.current = false;
        setStoreAssetsLoading(false);
        storeAssetsPromiseRef.current = null;
      }
    };

    const promise = run();
    storeAssetsPromiseRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    const hostname = window.location.hostname;
    let parts = hostname.split(".");
    let possibleSub = parts.length > 1 ? parts[0].toLowerCase() : "";
    // Dev: allow VITE_STORE_SUBDOMAIN when running on localhost
    if (!possibleSub && typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_STORE_SUBDOMAIN) {
      possibleSub = ((import.meta as any).env.VITE_STORE_SUBDOMAIN as string).toLowerCase();
    }
    const isAdmin = possibleSub === "admin";

    if (!possibleSub || isAdmin) {
      setStoreFrontChecked(true);
      return;
    }

    (async () => {
      try {
        const { data } = await axiosi.get<{
          success: boolean;
          data?: {
            storeId: string;
            name: string;
            description: string;
            seoHomePageTitle?: string;
            seoMetaDescription?: string;
            seoSocialImageUrl?: string;
            appliedCustomThemeId?: string | null;
            appliedCustomThemeName?: string | null;
            appliedThemeId?: string | null;
            appliedThemeName?: string | null;
            themeKind?: 'store-custom' | 'catalog' | 'none';
          };
        }>(
          "/store-subdomain/check",
          { params: { subdomain: possibleSub } }
        );
        if (data.success && data.data) {
          setIsStoreFront(true);
          setStoreFrontMeta({
            name: data.data.name,
            description: data.data.description,
            storeId: data.data.storeId,
            seoHomePageTitle: data.data.seoHomePageTitle,
            seoMetaDescription: data.data.seoMetaDescription,
            seoSocialImageUrl: data.data.seoSocialImageUrl,
          });
          const customId =
            data.data.appliedCustomThemeId && String(data.data.appliedCustomThemeId).length > 0
              ? String(data.data.appliedCustomThemeId)
              : null;
          const catalogId =
            data.data.appliedThemeId && String(data.data.appliedThemeId).length > 0
              ? String(data.data.appliedThemeId)
              : null;
          const resolvedThemeKind =
            data.data.themeKind === 'store-custom' || data.data.themeKind === 'catalog'
              ? data.data.themeKind
              : customId
                ? 'store-custom'
                : catalogId
                  ? 'catalog'
                  : 'none';

          setAppliedCustomThemeId(customId);
          setAppliedCustomThemeName(
            customId && data.data.appliedCustomThemeName
              ? String(data.data.appliedCustomThemeName)
              : null
          );
          setAppliedCatalogThemeId(catalogId);
          setAppliedCatalogThemeName(
            catalogId && data.data.appliedThemeName ? String(data.data.appliedThemeName) : null
          );
          setThemeKind(resolvedThemeKind);
          themeKindHintRef.current = resolvedThemeKind;

          resolvedStoreRef.current = {
            storeId: String(data.data.storeId),
            name: data.data.name,
            description: data.data.description,
          };
          // Start theme load immediately — overlaps with access check in StorefrontAccessProvider.
          void loadStoreAssets();
        }
      } catch {
        resolvedStoreRef.current = null;
        storeAssetsReadyRef.current = false;
        storeAssetsLoadingRef.current = false;
        storeAssetsPromiseRef.current = null;
        themeKindHintRef.current = 'none';
        setStoreAssetsReady(false);
        setIsStoreFront(false);
        setStoreFrontMeta(null);
        setAppliedCustomThemeId(null);
        setAppliedCustomThemeName(null);
        setAppliedCatalogThemeId(null);
        setAppliedCatalogThemeName(null);
        setThemeKind('none');
        setIsStoreCustomTheme(false);
        setActiveThemeId(null);
        setActiveThemeName(null);
        setActiveThemeEntryHtmlUrl(null);
        setActiveThemeCssUrls([]);
        setActiveThemeJsUrls([]);
        setActiveThemeHtmlUrls([]);
        setThemeRuntimeBaseUrl(null);
        setRemoteThemeJsUrl(null);
        setRemoteThemeCssUrl(null);
        setThemeConfig(null);
        setLiquidThemeEnabled(false);
        setLiquidRenderPagePath(null);
        setLiquidTemplateNames([]);
        setLiquidTemplatesListProvided(false);
        setActiveReactThemePackId(null);
        setReactThemePacks([]);
      } finally {
        setStoreFrontChecked(true);
      }
    })();
  }, [loadStoreAssets]);

  const value: StorefrontContextType = {
    isStoreFront,
    storeFrontChecked,
    storeFrontMeta,
    appliedCustomThemeId,
    appliedCustomThemeName,
    appliedCatalogThemeId,
    appliedCatalogThemeName,
    themeKind,
    isStoreCustomTheme,
    activeThemeId,
    activeThemeName,
    activeThemeEntryHtmlUrl,
    activeThemeCssUrls,
    activeThemeJsUrls,
    activeThemeHtmlUrls,
    themeRuntimeBaseUrl,
    remoteThemeJsUrl,
    remoteThemeCssUrl,
    liquidThemeEnabled,
    liquidRenderPagePath,
    liquidTemplateNames,
    liquidTemplatesListProvided,
    activeReactThemePackId,
    reactThemePacks,
    themeConfig,
    storeAssetsLoading,
    storeAssetsReady,
    loadStoreAssets,
  };

  return (
    <StorefrontContext.Provider value={value}>
      <ThemeConfigProvider config={themeConfig}>
        <StorefrontProductProvider>{children}</StorefrontProductProvider>
      </ThemeConfigProvider>
    </StorefrontContext.Provider>
  );
};

export const useStorefront = (): StorefrontContextType => {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used within a StorefrontProvider");
  return ctx;
};

export default StorefrontContext;
