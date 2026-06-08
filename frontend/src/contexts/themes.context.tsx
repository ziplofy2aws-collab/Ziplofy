import React, { createContext, useCallback, useContext, useMemo } from "react";
import type { AxiosResponse } from "axios";
import axiosi from "../config/axios";

// —— Mirrors Ziplofy3b theme.model.ts / formatThemeForClient ——

export type ThemeCategory =
  | "travel"
  | "business"
  | "portfolio"
  | "ecommerce"
  | "blog"
  | "education"
  | "health"
  | "food";

export type ThemePlan = "free" | "basic" | "premium" | "enterprise";

export type ThemePackageType = "folder" | "zip";

export interface ThemeS3AssetPart {
  key: string;
  url: string;
  contentType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface ThemeContentRoot {
  prefix: string;
  fileCount: number;
  uploadedAt?: string;
}

export interface ThemeCatalogS3Assets {
  contentRoot?: ThemeContentRoot;
  zip?: ThemeS3AssetPart;
  thumbnail?: ThemeS3AssetPart;
  reactThemeJs?: ThemeS3AssetPart;
  reactThemeCss?: ThemeS3AssetPart;
}

export interface ThemeUploadByUser {
  _id: string;
  name?: string;
  email?: string;
}

/** Shape returned by GET /themes, GET /themes/:id, POST /themes/from-s3 (after formatThemeForClient). */
export interface ThemeApiRecord {
  _id: string;
  name: string;
  description?: string;
  category: ThemeCategory;
  plan: ThemePlan;
  price?: number;
  version?: string;
  tags?: string[];
  themePath: string;
  isActive?: boolean;
  downloads?: number;
  installationCount?: number;
  rating?: { average?: number; count?: number };
  createdAt?: string;
  updatedAt?: string;
  uploadBy?: ThemeUploadByUser | string;
  s3Assets?: ThemeCatalogS3Assets;
  thumbnailUrl?: string | null;
  zipUrl?: string | null;
  packageType?: ThemePackageType | null;
  contentFileCount?: number;
  hasRemoteTheme?: boolean;
  previewUrl?: string | null;
}

/** UI-ready row for Theme Developer grid/table. */
export interface ThemeAdminListItem {
  _id: string;
  name: string;
  category: string;
  plan: string;
  uploadDate: string;
  uploadBy: string;
  description?: string;
  price?: number;
  version?: string;
  tags?: string[];
  isActive?: boolean;
  downloads?: number;
  installationCount?: number;
  themePath: string;
  thumbnailUrl: string | null;
  zipUrl: string | null;
  packageType: ThemePackageType | null;
  contentFileCount?: number;
  hasRemoteTheme: boolean;
}

export interface GetThemesListParams {
  limit?: number;
  page?: string | number;
  search?: string;
  category?: string;
  plan?: string;
  sort?: string;
  order?: string;
}

export interface GetThemesListApiResponse {
  success: boolean;
  message?: string;
  data: ThemeApiRecord[];
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface AdminThemesListResult {
  themes: ThemeAdminListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/** Body for POST /api/themes/from-s3. */
export interface CreateThemeFromS3Payload {
  name: string;
  description?: string;
  category: string;
  plan: string;
  price: number;
  version: string;
  tags: string;
  s3SessionId: string;
  s3: {
    files?: { key: string; relativePath: string }[];
    zipKey?: string;
    thumbnailKey?: string;
    reactJsKey?: string;
    reactCssKey?: string;
    themeSchemaKey?: string;
    themeDefaultConfigKey?: string;
    themeManifestKey?: string;
  };
}

export interface CreateThemeFromS3ApiResponse {
  success: boolean;
  message?: string;
  data?: ThemeApiRecord | null;
}

export interface GetThemeApiResponse {
  success: boolean;
  message?: string;
  data: ThemeApiRecord;
}

function formatUploadDate(createdAt?: string): string {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveUploadByName(uploadBy?: ThemeApiRecord["uploadBy"]): string {
  if (!uploadBy) return "Unknown";
  if (typeof uploadBy === "string") return uploadBy;
  return uploadBy.name || uploadBy.email || "Unknown";
}

/** Human-readable package label for UI badges. */
export function formatThemePackageLabel(theme: Pick<ThemeAdminListItem, "packageType" | "contentFileCount">): string | null {
  if (theme.packageType === "folder") {
    const n = theme.contentFileCount;
    return n != null && n > 0 ? `Folder · ${n} files` : "Folder";
  }
  if (theme.packageType === "zip") return "ZIP";
  return null;
}

/** Map API theme → admin list row (S3 thumbnailUrl, folder vs zip, etc.). */
export function mapThemeApiToAdminListItem(theme: ThemeApiRecord): ThemeAdminListItem {
  const thumbnailUrl =
    theme.thumbnailUrl ?? theme.s3Assets?.thumbnail?.url ?? null;

  return {
    _id: String(theme._id),
    name: theme.name,
    category: theme.category,
    plan: theme.plan,
    uploadDate: formatUploadDate(theme.createdAt),
    uploadBy: resolveUploadByName(theme.uploadBy),
    description: theme.description,
    price: theme.price,
    version: theme.version,
    tags: theme.tags,
    isActive: theme.isActive,
    downloads: theme.downloads,
    installationCount: theme.installationCount,
    themePath: theme.themePath,
    thumbnailUrl,
    zipUrl: theme.zipUrl ?? theme.s3Assets?.zip?.url ?? null,
    packageType: theme.packageType ?? (theme.s3Assets?.contentRoot?.prefix ? "folder" : theme.s3Assets?.zip?.key ? "zip" : null),
    contentFileCount: theme.contentFileCount ?? theme.s3Assets?.contentRoot?.fileCount,
    hasRemoteTheme: Boolean(
      theme.hasRemoteTheme ??
        theme.s3Assets?.reactThemeJs?.key ??
        theme.s3Assets?.reactThemeCss?.key
    ),
  };
}

type ThemesContextValue = {
  createThemeFromS3: (
    payload: CreateThemeFromS3Payload
  ) => Promise<AxiosResponse<CreateThemeFromS3ApiResponse>>;
  getThemesList: (params?: GetThemesListParams) => Promise<AxiosResponse<GetThemesListApiResponse>>;
  getThemeById: (themeId: string) => Promise<AxiosResponse<GetThemeApiResponse>>;
  /** GET /themes + map to admin UI rows. */
  fetchAdminThemesList: (params?: GetThemesListParams) => Promise<AdminThemesListResult>;
  mapThemeApiToAdminListItem: (theme: ThemeApiRecord) => ThemeAdminListItem;
};

const ThemesContext = createContext<ThemesContextValue | undefined>(undefined);

export const ThemesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const createThemeFromS3 = useCallback(async (payload: CreateThemeFromS3Payload) => {
    return axiosi.post<CreateThemeFromS3ApiResponse>("/themes/from-s3", payload);
  }, []);

  const getThemesList = useCallback(async (params?: GetThemesListParams) => {
    const { limit = 100, page, ...rest } = params ?? {};
    return axiosi.get<GetThemesListApiResponse>("/themes", {
      params: { limit, ...(page != null ? { page: String(page) } : {}), ...rest },
    });
  }, []);

  const getThemeById = useCallback(async (themeId: string) => {
    return axiosi.get<GetThemeApiResponse>(`/themes/${themeId}`);
  }, []);

  const fetchAdminThemesList = useCallback(
    async (params?: GetThemesListParams): Promise<AdminThemesListResult> => {
      const response = await getThemesList(params);
      const { success, data, total = 0, totalPages = 1, currentPage = 1 } = response.data;

      if (!success || !Array.isArray(data)) {
        return { themes: [], total: 0, totalPages: 1, currentPage: 1 };
      }

      return {
        themes: data.map(mapThemeApiToAdminListItem),
        total,
        totalPages,
        currentPage,
      };
    },
    [getThemesList]
  );

  const value = useMemo<ThemesContextValue>(
    () => ({
      createThemeFromS3,
      getThemesList,
      getThemeById,
      fetchAdminThemesList,
      mapThemeApiToAdminListItem,
    }),
    [createThemeFromS3, getThemesList, getThemeById, fetchAdminThemesList]
  );

  return <ThemesContext.Provider value={value}>{children}</ThemesContext.Provider>;
};

export const useThemes = (): ThemesContextValue => {
  const ctx = useContext(ThemesContext);
  if (!ctx) throw new Error("useThemes must be used within a ThemesProvider");
  return ctx;
};
