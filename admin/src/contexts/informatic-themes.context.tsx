import React, { createContext, useCallback, useContext, useMemo } from 'react';
import type { AxiosResponse } from 'axios';
import axiosi from '../config/axios';

export type InformaticThemeRecord = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  slug: string;
  plan: string;
  price?: number;
  version?: string;
  tags?: string[];
  thumbnailUrl?: string | null;
  themeJsUrl?: string | null;
  themeCssUrl?: string | null;
  hasRemoteTheme?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

type ListResponse = {
  success: boolean;
  data: InformaticThemeRecord[];
  pagination?: { page: number; limit: number; total: number; pages: number };
};

type CreateFromS3Payload = {
  name: string;
  description?: string;
  plan: string;
  price?: number;
  version?: string;
  tags?: string;
  s3SessionId: string;
  s3: {
    files: { key: string; relativePath: string }[];
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  };
};

type CreateResponse = { success: boolean; data: InformaticThemeRecord; message?: string };

type InformaticThemesContextValue = {
  listInformaticThemes: (params?: { page?: number; limit?: number; search?: string }) => Promise<ListResponse>;
  createInformaticThemeFromS3: (payload: CreateFromS3Payload) => Promise<AxiosResponse<CreateResponse>>;
  deactivateInformaticTheme: (id: string) => Promise<AxiosResponse<{ success: boolean }>>;
};

const InformaticThemesContext = createContext<InformaticThemesContextValue | undefined>(undefined);

export const InformaticThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const listInformaticThemes = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await axiosi.get<ListResponse>('/informatic-themes', {
      params: { includeInactive: 'true', limit: 50, ...params },
    });
    return res.data;
  }, []);

  const createInformaticThemeFromS3 = useCallback(async (payload: CreateFromS3Payload) => {
    return axiosi.post<CreateResponse>('/informatic-themes/from-s3', payload);
  }, []);

  const deactivateInformaticTheme = useCallback(async (id: string) => {
    return axiosi.delete<{ success: boolean }>(`/informatic-themes/${id}`);
  }, []);

  const value = useMemo(
    () => ({ listInformaticThemes, createInformaticThemeFromS3, deactivateInformaticTheme }),
    [listInformaticThemes, createInformaticThemeFromS3, deactivateInformaticTheme]
  );

  return <InformaticThemesContext.Provider value={value}>{children}</InformaticThemesContext.Provider>;
};

export function useInformaticThemes(): InformaticThemesContextValue {
  const ctx = useContext(InformaticThemesContext);
  if (!ctx) throw new Error('useInformaticThemes must be used within InformaticThemesProvider');
  return ctx;
}
