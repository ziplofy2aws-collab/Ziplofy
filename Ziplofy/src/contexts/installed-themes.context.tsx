import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';

export interface PopulatedTheme {
  _id: string;
  name: string;
  description: string;
  category: string;
  plan?: string;
  price?: number;
  version?: string;
  tags?: string[];
  isActive?: boolean;
  downloads?: number;
  rating?: { average: number; count: number };
  uploadBy?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailUrl?: string | null;
}

export interface InstalledThemeDoc {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string | null;
  installedThemeId: string;
  installedAt?: string;
  uninstalledAt?: string | null;
  isCustomTheme?: boolean;
}

interface ApiListResponse {
  success: boolean;
  data: InstalledThemeDoc[];
}

interface ApiSingleResponse {
  success: boolean;
  data: InstalledThemeDoc;
}

interface InstalledThemesContextType {
  installedThemes: InstalledThemeDoc[];
  loading: boolean;
  /** Theme catalog id currently being installed (null when idle). */
  installingThemeId: string | null;
  /** Theme id currently being applied to the store (null when idle). */
  applyingThemeId: string | null;
  error: string | null;
  fetchByStoreId: (storeId: string) => Promise<void>;
  installTheme: (storeId: string, themeId: string) => Promise<void>;
  applyTheme: (storeId: string, themeId: string, themeName?: string) => Promise<boolean>;
  uninstallTheme: (installedThemeId: string) => Promise<void>;
}

const InstalledThemesContext = createContext<InstalledThemesContextType | undefined>(undefined);

export const InstalledThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [installedThemes, setInstalledThemes] = useState<InstalledThemeDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [installingThemeId, setInstallingThemeId] = useState<string | null>(null);
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null);
  const installInFlightRef = useRef(false);
  const applyInFlightRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstalledThemes = useCallback(async (storeId: string) => {
    const { data: body } = await axiosi.get<ApiListResponse>(
      `/installed-themes/store/${storeId}?_t=${Date.now()}`
    );
    setInstalledThemes(body?.data ?? []);
  }, []);

  const fetchByStoreId = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await loadInstalledThemes(storeId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch installed themes');
      setInstalledThemes([]);
    } finally {
      setLoading(false);
    }
  }, [loadInstalledThemes]);

  const installTheme = useCallback(async (storeId: string, themeId: string) => {
    if (installInFlightRef.current) return;

    installInFlightRef.current = true;
    setInstallingThemeId(themeId);
    setError(null);
    const toastId = toast.loading('Installing theme...');

    try {
      const { data } = await axiosi.post(`/themes/install`, { storeId, themeId });
      if (data.success) {
        localStorage.removeItem('ziplofy.appliedCustomThemeId');
        localStorage.removeItem('ziplofy.appliedCustomThemeStoreId');
        await loadInstalledThemes(storeId);
        toast.success('Theme installed', { id: toastId });
      } else {
        const message = data?.message || 'Failed to install theme';
        setError(message);
        toast.error(message, { id: toastId });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to install theme';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      installInFlightRef.current = false;
      setInstallingThemeId(null);
    }
  }, [loadInstalledThemes]);

  const uninstallTheme = useCallback(async (installedThemeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await axiosi.delete(`/themes/uninstall`, { data: { installedThemeId } });
      setInstalledThemes(prev => prev.filter(it => it.installedThemeId !== installedThemeId));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to uninstall theme');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyTheme = useCallback(async (storeId: string, themeId: string, themeName?: string): Promise<boolean> => {
    if (applyInFlightRef.current) return false;

    const resolvedName =
      themeName?.trim() ||
      installedThemes.find((t) => String(t._id) === String(themeId))?.name ||
      'Theme';

    applyInFlightRef.current = true;
    setApplyingThemeId(themeId);
    setError(null);
    const toastId = toast.loading(`Applying ${resolvedName}...`);

    try {
      const { data } = await axiosi.post(`/themes/apply`, { storeId, themeId });
      if (data?.success !== false) {
        await loadInstalledThemes(storeId);
        toast.success(`${resolvedName} has been applied to your store`, { id: toastId });
        return true;
      }
      const message = data?.message || 'Failed to apply theme';
      setError(message);
      toast.error(message, { id: toastId });
      return false;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to apply theme';
      setError(message);
      toast.error(message, { id: toastId });
      return false;
    } finally {
      applyInFlightRef.current = false;
      setApplyingThemeId(null);
    }
  }, [installedThemes, loadInstalledThemes]);

  const value: InstalledThemesContextType = useMemo(() => ({
    installedThemes,
    loading,
    installingThemeId,
    applyingThemeId,
    error,
    fetchByStoreId,
    installTheme,
    applyTheme,
    uninstallTheme,
  }), [
    installedThemes,
    loading,
    installingThemeId,
    applyingThemeId,
    error,
    fetchByStoreId,
    installTheme,
    applyTheme,
    uninstallTheme,
  ]);

  return (
    <InstalledThemesContext.Provider value={value}>
      {children}
    </InstalledThemesContext.Provider>
  );
};

export function useInstalledThemes(): InstalledThemesContextType {
  const ctx = useContext(InstalledThemesContext);
  if (!ctx) throw new Error('useInstalledThemes must be used within InstalledThemesProvider');
  return ctx;
}


