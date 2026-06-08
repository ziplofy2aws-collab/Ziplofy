import { axiosi } from '../config/axios.config';
import { getStaticDevPackId, isThemeEditorStaticMode } from '../config/theme-editor-static.config';
import { loadStaticThemeEditorPack } from './theme-editor-static-pack';

export type ThemeBlockCatalogPayload = {
  categories: Array<{ id: string; label: string }>;
  blocks: Array<{
    id: string;
    label: string;
    category: string;
    icon?: string;
    extendedOnly?: boolean;
  }>;
  sectionBlockAllowlist?: Record<string, string[]>;
};

export type ThemeEditorLoadResult = {
  themeName: string;
  themePath: string;
  editorSchema: unknown;
  defaultConfig: Record<string, unknown> | null;
  manifest: Record<string, unknown> | null;
  blockCatalog: ThemeBlockCatalogPayload | null;
  packLoadedFromS3: boolean;
  storeOverrides: Record<string, unknown>;
  config: Record<string, unknown>;
  values: Record<string, string | boolean>;
  configMode: 'sections' | 'flat';
  themeRuntime: { jsUrl?: string | null; cssUrl?: string | null };
  installed: boolean;
  canPersist: boolean;
  notice: string | null;
  /** Set when loading a bundled static dev pack (horizon | studio). */
  staticPackId?: string;
};

type StoreConfigResponse = {
  success: boolean;
  message?: string;
  data?: {
    themeName: string;
    themePath?: string;
    editorSchema: unknown;
    defaultConfig: Record<string, unknown> | null;
    manifest?: Record<string, unknown> | null;
    storeOverrides?: Record<string, unknown>;
    config?: Record<string, unknown>;
    values: Record<string, string | boolean>;
    configMode?: string;
    themeRuntime?: { jsUrl?: string | null; cssUrl?: string | null };
    blockCatalog?: ThemeBlockCatalogPayload | null;
    packLoadedFromS3?: boolean;
    installed?: boolean;
    canPersist?: boolean;
    notice?: string | null;
  };
};

type EditorPackResponse = {
  success: boolean;
  message?: string;
  data?: {
    themeName: string;
    themePath: string;
    editorSchema: unknown;
    defaultConfig: Record<string, unknown> | null;
    manifest?: Record<string, unknown> | null;
    values?: Record<string, string | boolean>;
    configMode?: string;
    themeRuntime?: { jsUrl?: string | null; cssUrl?: string | null };
    blockCatalog?: ThemeBlockCatalogPayload | null;
    packLoadedFromS3?: boolean;
  };
};

function mapStoreConfig(data: NonNullable<StoreConfigResponse['data']>): ThemeEditorLoadResult {
  return {
    themeName: data.themeName,
    themePath: data.themePath ?? '',
    editorSchema: data.editorSchema,
    defaultConfig: data.defaultConfig ?? null,
    manifest: data.manifest ?? null,
    blockCatalog: data.blockCatalog ?? null,
    packLoadedFromS3: Boolean(data.packLoadedFromS3),
    storeOverrides: data.storeOverrides ?? {},
    config: data.config ?? data.defaultConfig ?? {},
    values: data.values ?? {},
    configMode: data.configMode === 'sections' ? 'sections' : 'flat',
    themeRuntime: {
      jsUrl: data.themeRuntime?.jsUrl ?? null,
      cssUrl: data.themeRuntime?.cssUrl ?? null,
    },
    installed: Boolean(data.installed),
    canPersist: Boolean(data.canPersist),
    notice: data.notice ?? null,
  };
}

function mapCatalogPack(
  data: NonNullable<EditorPackResponse['data']>,
  notice: string | null
): ThemeEditorLoadResult {
  return {
    themeName: data.themeName,
    themePath: data.themePath,
    editorSchema: data.editorSchema,
    defaultConfig: data.defaultConfig ?? null,
    manifest: data.manifest ?? null,
    blockCatalog: data.blockCatalog ?? null,
    packLoadedFromS3: Boolean(data.packLoadedFromS3),
    storeOverrides: {},
    config: data.defaultConfig ?? {},
    values: data.values ?? {},
    configMode: data.configMode === 'sections' ? 'sections' : 'flat',
    themeRuntime: {
      jsUrl: data.themeRuntime?.jsUrl ?? null,
      cssUrl: data.themeRuntime?.cssUrl ?? null,
    },
    installed: false,
    canPersist: false,
    notice,
  };
}

async function fetchStoreThemeConfig(
  themeId: string,
  storeId: string
): Promise<StoreConfigResponse | null> {
  try {
    const { data } = await axiosi.get<StoreConfigResponse>(
      `/store-theme-config/${storeId}/${themeId}`
    );
    return data;
  } catch {
    try {
      const { data } = await axiosi.get<StoreConfigResponse>(`/themes/${themeId}/store-config`, {
        params: { storeId },
      });
      return data;
    } catch {
      return null;
    }
  }
}

async function fetchCatalogEditorPack(themeId: string): Promise<EditorPackResponse | null> {
  try {
    const { data } = await axiosi.get<EditorPackResponse>(`/themes/${themeId}/editor-pack`);
    return data;
  } catch {
    return null;
  }
}

/** Load editor schema, defaults, overrides, and theme.js URLs for the theme open in the editor. */
export async function loadThemeEditorData(
  themeId: string,
  storeId: string
): Promise<ThemeEditorLoadResult> {
  if (isThemeEditorStaticMode()) {
    return loadStaticThemeEditorPack(getStaticDevPackId());
  }

  const storeBody = await fetchStoreThemeConfig(themeId, storeId);
  if (storeBody?.success && storeBody.data) {
    return mapStoreConfig(storeBody.data);
  }

  const packBody = await fetchCatalogEditorPack(themeId);
  if (packBody?.success && packBody.data) {
    return mapCatalogPack(
      packBody.data,
      'Install this theme on your store to save customizations. Preview uses catalog defaults.'
    );
  }

  const message =
    storeBody && !storeBody.success
      ? storeBody.message
      : packBody && !packBody.success
        ? packBody.message
        : undefined;

  throw new Error(
    message ||
      'Could not load theme editor files. Ensure theme.schema.json, theme.default-config.json, and theme.manifest.json are uploaded with this theme.'
  );
}
