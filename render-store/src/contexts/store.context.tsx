import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosi } from "../config/axios.config";
import { StorefrontProductProvider } from "./product.context";
import { ThemeConfigProvider } from "./theme-config.context";

type ThemeRuntimePayload = {
  themeId: string;
  themeName: string;
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
  storeFrontMeta: { name: string; description: string; storeId: string } | null;
  /** Set when the store has a JSON theme creator theme applied (Store.appliedCustomThemeId). */
  appliedCustomThemeId: string | null;
  appliedCustomThemeName: string | null;
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
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStoreFront, setIsStoreFront] = useState<boolean>(false);
  const [storeFrontChecked, setStoreFrontChecked] = useState<boolean>(false);
  const [storeFrontMeta, setStoreFrontMeta] = useState<{ name: string; description: string; storeId: string } | null>(null);
  const [appliedCustomThemeId, setAppliedCustomThemeId] = useState<string | null>(null);
  const [appliedCustomThemeName, setAppliedCustomThemeName] = useState<string | null>(null);
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
            appliedCustomThemeId?: string | null;
            appliedCustomThemeName?: string | null;
          };
        }>(
          "/store-subdomain/check",
          { params: { subdomain: possibleSub } }
        );
        if (data.success && data.data) {
          setIsStoreFront(true);
          setStoreFrontMeta({ name: data.data.name, description: data.data.description, storeId: data.data.storeId });
          const customId =
            data.data.appliedCustomThemeId && String(data.data.appliedCustomThemeId).length > 0
              ? String(data.data.appliedCustomThemeId)
              : null;
          setAppliedCustomThemeId(customId);
          setAppliedCustomThemeName(
            customId && data.data.appliedCustomThemeName
              ? String(data.data.appliedCustomThemeName)
              : null
          );

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

          if (customId) {
            try {
              const runtimeRes = await axiosi.get<{
                success: boolean;
                data?: ThemeRuntimePayload | null;
              }>(`/storefront/${data.data.storeId}/theme-runtime`, {
                params: { _t: Date.now() },
              });
              const rt = runtimeRes.data?.data;
              const tc = rt?.themeConfig;
              if (rt && tc && typeof tc === "object" && rt.isStoreCustomTheme) {
                setActiveThemeId(rt.themeId || customId);
                setActiveThemeName(rt.themeName || data.data.appliedCustomThemeName || "Custom theme");
                setThemeConfig(tc);
                setIsStoreCustomTheme(true);
                clearInstalledThemeRuntimeState(installedRuntimeClear);
                toast.success("This store is using a custom theme");
              } else {
                setActiveThemeId(null);
                setActiveThemeName(null);
                setThemeConfig(null);
                setIsStoreCustomTheme(false);
                clearInstalledThemeRuntimeState(installedRuntimeClear);
                toast.error("Custom theme is applied but could not be loaded");
              }
            } catch {
              setActiveThemeId(null);
              setActiveThemeName(null);
              setThemeConfig(null);
              setIsStoreCustomTheme(false);
              clearInstalledThemeRuntimeState(installedRuntimeClear);
              toast.error("Failed to load custom theme");
            }
          } else {
            try {
              const reactPackRes = await axiosi.get<{
                success: boolean;
                data?: {
                  activePackId: "theme1" | "theme2";
                  packs: StorefrontContextType["reactThemePacks"];
                };
              }>(`/storefront/${data.data.storeId}/react-theme-pack`, {
                params: { _t: Date.now() },
              });
              setActiveReactThemePackId(reactPackRes.data?.data?.activePackId || null);
              setReactThemePacks(reactPackRes.data?.data?.packs || []);
            } catch {
              setActiveReactThemePackId(null);
              setReactThemePacks([]);
            }

            try {
              const runtimeRes = await axiosi.get<{
                success: boolean;
                data?: ThemeRuntimePayload | null;
              }>(`/storefront/${data.data.storeId}/theme-runtime`, {
                params: { _t: Date.now() },
              });
              const rt = runtimeRes.data?.data;
              if (rt?.isStoreCustomTheme) {
                setIsStoreCustomTheme(true);
                setThemeConfig(
                  rt.themeConfig && typeof rt.themeConfig === "object" ? rt.themeConfig : null
                );
                clearInstalledThemeRuntimeState(installedRuntimeClear);
                toast.success("This store is using a custom theme");
              } else {
                setActiveThemeId(rt?.themeId || null);
                setActiveThemeName(rt?.themeName || null);
                const entryHtml = rt?.entryHtml;
                const runtimeBaseUrl = rt?.runtimeBaseUrl;
                setActiveThemeEntryHtmlUrl(
                  entryHtml && runtimeBaseUrl ? `${runtimeBaseUrl}/${entryHtml}` : null
                );
                setActiveThemeCssUrls(rt?.cssUrls || []);
                setActiveThemeJsUrls(rt?.jsUrls || []);
                setActiveThemeHtmlUrls(rt?.htmlUrls || []);
                const rb = rt?.runtimeBaseUrl;
                setThemeRuntimeBaseUrl(typeof rb === "string" && rb.length > 0 ? rb.replace(/\/$/, "") : null);
                const liq = rt?.liquid;
                setLiquidThemeEnabled(Boolean(liq?.enabled));
                setLiquidRenderPagePath(
                  typeof liq?.renderPagePath === "string" && liq.renderPagePath.length > 0
                    ? liq.renderPagePath.startsWith("/")
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
                  typeof rt?.remoteThemeJsUrl === "string" && rt.remoteThemeJsUrl.length > 0
                    ? rt.remoteThemeJsUrl
                    : null
                );
                setRemoteThemeCssUrl(
                  typeof rt?.remoteThemeCssUrl === "string" && rt.remoteThemeCssUrl.length > 0
                    ? rt.remoteThemeCssUrl
                    : null
                );
                const tc = rt?.themeConfig;
                setThemeConfig(tc && typeof tc === "object" ? tc : null);
                setIsStoreCustomTheme(false);
              }
            } catch {
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
              setIsStoreCustomTheme(false);
              setLiquidThemeEnabled(false);
              setLiquidRenderPagePath(null);
              setLiquidTemplateNames([]);
              setLiquidTemplatesListProvided(false);
            }
          }
        }
      } catch {
        setIsStoreFront(false);
        setStoreFrontMeta(null);
        setAppliedCustomThemeId(null);
        setAppliedCustomThemeName(null);
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
  }, []);

  const value: StorefrontContextType = {
    isStoreFront,
    storeFrontChecked,
    storeFrontMeta,
    appliedCustomThemeId,
    appliedCustomThemeName,
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
