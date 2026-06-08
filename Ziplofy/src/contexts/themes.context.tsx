import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface ThemeItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  thumbnailUrl: string | null;
  rating: { average: number; count: number };
  uploadBy: string;
  createdAt: string;
  updatedAt: string;
  downloads: number;
}

interface FetchThemesResponse {
  success: boolean;
  data: ThemeItem[];
}

interface ThemesContextType {
  themes: ThemeItem[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
}

const ThemesContext = createContext<ThemesContextType | undefined>(undefined);

export const ThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosi.get<FetchThemesResponse>('/themes/themesStatic');
      if (data.success) setThemes(data.data || []);
      else setThemes([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch themes');
      setThemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: ThemesContextType = useMemo(() => ({
    themes,
    loading,
    error,
    fetchAll,
  }), [themes, loading, error, fetchAll]);

  return (
    <ThemesContext.Provider value={value}>
      {children}
    </ThemesContext.Provider>
  );
};

export function useThemes(): ThemesContextType {
  const ctx = useContext(ThemesContext);
  if (!ctx) throw new Error('useThemes must be used within ThemesProvider');
  return ctx;
}


