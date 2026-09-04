import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { axiosi } from '@/config/axios.config';

export type StorefrontMeta = {
  storeId: string;
  name: string;
  description: string;
  subdomain?: string | null;
  customDomain?: string | null;
  status?: string;
  storeCode?: string | null;
  appliedTheme?: string | null;
};

export type InformaticThemeRuntime = {
  storeId: string;
  themeId: string;
  themeName: string;
  themeKind: 'catalog';
  isStoreCustomTheme: false;
  themeConfig: Record<string, unknown>;
  remoteThemeJsUrl: string | null;
  remoteThemeCssUrl: string | null;
  hasSavedConfig: boolean;
};

type StorefrontContextType = {
  isStoreFront: boolean;
  storeFrontChecked: boolean;
  storeFrontMeta: StorefrontMeta | null;
  resolveError: string | null;
  themeRuntime: InformaticThemeRuntime | null;
  themeRuntimeLoading: boolean;
  themeRuntimeError: string | null;
  themeRuntimeChecked: boolean;
  reloadThemeRuntime: () => Promise<void>;
};

const StorefrontContext = createContext<StorefrontContextType | null>(null);

const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'dashboard',
  'preview',
  'www',
  'api',
  'backend',
  'auth',
  'crm-360',
  'informatic',
  'app',
]);

function isLocalhostHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1'
  );
}

/** Platform hosts that use subdomain labels (not custom-domain host lookup). */
function isPlatformHost(hostname: string): boolean {
  return (
    hostname === 'crm-360.codiic.com' ||
    hostname.endsWith('.crm-360.codiic.com') ||
    hostname === 'codiic.com' ||
    hostname.endsWith('.codiic.com') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost')
  );
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [isStoreFront, setIsStoreFront] = useState(false);
  const [storeFrontChecked, setStoreFrontChecked] = useState(false);
  const [storeFrontMeta, setStoreFrontMeta] = useState<StorefrontMeta | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [themeRuntime, setThemeRuntime] = useState<InformaticThemeRuntime | null>(null);
  const [themeRuntimeLoading, setThemeRuntimeLoading] = useState(false);
  const [themeRuntimeError, setThemeRuntimeError] = useState<string | null>(null);
  const [themeRuntimeChecked, setThemeRuntimeChecked] = useState(false);

  const loadThemeRuntime = useCallback(async (storeId: string) => {
    setThemeRuntimeLoading(true);
    setThemeRuntimeError(null);
    try {
      const { data } = await axiosi.get<{
        success: boolean;
        message?: string;
        data?: InformaticThemeRuntime | null;
      }>(`/storefront/${storeId}/informatic-theme-runtime`);

      if (data.success && data.data?.themeConfig) {
        setThemeRuntime(data.data);
        setThemeRuntimeError(null);
      } else {
        setThemeRuntime(null);
        setThemeRuntimeError(data.message || 'No live Informatic theme is applied to this store.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to load store theme';
      setThemeRuntime(null);
      setThemeRuntimeError(message);
    } finally {
      setThemeRuntimeLoading(false);
      setThemeRuntimeChecked(true);
    }
  }, []);

  const reloadThemeRuntime = useCallback(async () => {
    if (!storeFrontMeta?.storeId) return;
    setThemeRuntimeChecked(false);
    await loadThemeRuntime(storeFrontMeta.storeId);
  }, [loadThemeRuntime, storeFrontMeta?.storeId]);

  const resolveStore = useCallback(async () => {
    const hostname = window.location.hostname.toLowerCase();
    const parts = hostname.split('.');
    let possibleSub = parts.length > 1 ? parts[0].toLowerCase() : '';

    const localhost = isLocalhostHost(hostname);
    const platform = isPlatformHost(hostname);

    if (
      (!possibleSub || (localhost && hostname === 'localhost')) &&
      import.meta.env.VITE_STORE_SUBDOMAIN
    ) {
      possibleSub = String(import.meta.env.VITE_STORE_SUBDOMAIN).toLowerCase();
    }

    const isReserved = RESERVED_SUBDOMAINS.has(possibleSub);
    const useHostLookup = !platform && !localhost && hostname.includes('.');
    const useSubdomainLookup =
      Boolean(possibleSub) && !isReserved && (platform || localhost);

    if (!useHostLookup && !useSubdomainLookup) {
      setIsStoreFront(false);
      setStoreFrontMeta(null);
      setResolveError(
        'Open via {subdomain}.localhost:3003, or set VITE_STORE_SUBDOMAIN for bare localhost.'
      );
      setStoreFrontChecked(true);
      return;
    }

    try {
      const { data } = await axiosi.get<{
        success: boolean;
        message?: string;
        data?: StorefrontMeta;
      }>('/store-subdomain/check', {
        params: useHostLookup ? { host: hostname } : { subdomain: possibleSub },
      });

      if (data.success && data.data?.storeId) {
        setIsStoreFront(true);
        setStoreFrontMeta(data.data);
        setResolveError(null);
        setThemeRuntimeChecked(false);
        await loadThemeRuntime(data.data.storeId);
      } else {
        setIsStoreFront(false);
        setStoreFrontMeta(null);
        setResolveError(data.message || 'Store not found for this hostname.');
        setThemeRuntime(null);
        setThemeRuntimeChecked(true);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to resolve store';
      setIsStoreFront(false);
      setStoreFrontMeta(null);
      setResolveError(message);
      setThemeRuntime(null);
      setThemeRuntimeChecked(true);
    } finally {
      setStoreFrontChecked(true);
    }
  }, [loadThemeRuntime]);

  useEffect(() => {
    void resolveStore();
  }, [resolveStore]);

  const value = useMemo(
    () => ({
      isStoreFront,
      storeFrontChecked,
      storeFrontMeta,
      resolveError,
      themeRuntime,
      themeRuntimeLoading,
      themeRuntimeError,
      themeRuntimeChecked,
      reloadThemeRuntime,
    }),
    [
      isStoreFront,
      storeFrontChecked,
      storeFrontMeta,
      resolveError,
      themeRuntime,
      themeRuntimeLoading,
      themeRuntimeError,
      themeRuntimeChecked,
      reloadThemeRuntime,
    ]
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront(): StorefrontContextType {
  const ctx = useContext(StorefrontContext);
  if (!ctx) {
    throw new Error('useStorefront must be used within StorefrontProvider');
  }
  return ctx;
}
