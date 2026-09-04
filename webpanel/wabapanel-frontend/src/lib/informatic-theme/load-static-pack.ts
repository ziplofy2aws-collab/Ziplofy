import { THEME_EDITOR_STATIC_CONFIG } from '@/config/informatic-theme-editor-static.config';
import { patchInformaticRuntimeTemplates } from '@/lib/informatic-theme/runtime-templates.util';

export type InformaticThemeSchema = {
  version?: string;
  themeId?: string;
  globalSettings?: Record<string, unknown>;
  layout?: Record<
    string,
    {
      label?: string;
      settingsFields?: EditorFieldDef[];
      blocks?: Array<{ id: string; label?: string; settingsFields?: EditorFieldDef[] }>;
    }
  >;
  templates?: Array<{
    id: string;
    label?: string;
    sections?: Array<{
      id: string;
      type?: string;
      label?: string;
      settingsFields?: EditorFieldDef[];
      blocks?: Array<{ id: string; label?: string; settingsFields?: EditorFieldDef[] }>;
    }>;
  }>;
  sectionCatalog?: Array<{
    type: string;
    label?: string;
    insertable?: boolean;
    settingsFields?: Array<EditorFieldDef & { pathSuffix?: string }>;
  }>;
};

export type EditorFieldDef = {
  path: string;
  type?: string;
  label?: string;
  widget?: string;
  group?: string;
  sidebar?: boolean;
};

export type InformaticThemePack = {
  manifest: Record<string, unknown>;
  schema: InformaticThemeSchema;
  /** Active config (localStorage draft merged over pack defaults). */
  config: Record<string, unknown>;
  /** Pristine pack defaults — used by Reset to defaults. */
  packDefaultConfig: Record<string, unknown>;
};

function configStorageKey(): string {
  return `${THEME_EDITOR_STATIC_CONFIG.localStorageKey}:${THEME_EDITOR_STATIC_CONFIG.packId}`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Load pack from `/remote-themes/informatic` or bundled theme-packs fallback. */
export async function loadStaticInformaticThemePack(): Promise<InformaticThemePack> {
  const base = THEME_EDITOR_STATIC_CONFIG.staticBaseUrl.replace(/\/$/, '');

  let schema = await fetchJson<InformaticThemeSchema>(`${base}/theme.schema.json`);
  let config = await fetchJson<Record<string, unknown>>(`${base}/theme.default-config.json`);
  let manifest = await fetchJson<Record<string, unknown>>(`${base}/theme.manifest.json`);

  if (!schema || !config) {
    const [s, c, m] = await Promise.all([
      import('@/theme-packs/informatic/theme.schema.json'),
      import('@/theme-packs/informatic/theme.default-config.json'),
      import('@/theme-packs/informatic/theme.manifest.json'),
    ]);
    schema = (s as { default?: InformaticThemeSchema }).default ?? (s as InformaticThemeSchema);
    config = (c as { default?: Record<string, unknown> }).default ?? (c as Record<string, unknown>);
    manifest =
      (m as { default?: Record<string, unknown> }).default ?? (m as Record<string, unknown>);
  }

  if (!schema || !config) {
    throw new Error('Failed to load Informatic theme pack (schema/config).');
  }

  const packDefaultConfig = structuredClone(config);

  try {
    const raw = localStorage.getItem(configStorageKey());
    if (raw) {
      const draft = JSON.parse(raw) as Record<string, unknown>;
      if (draft && typeof draft === 'object') {
        config = draft;
      }
    }
  } catch {
    /* ignore */
  }

  return {
    manifest: manifest || { id: 'informatic', name: 'Informatic' },
    schema,
    config,
    packDefaultConfig,
  };
}

export function saveStaticInformaticThemeConfig(config: Record<string, unknown>): void {
  localStorage.setItem(configStorageKey(), JSON.stringify(config));
}

export function clearStaticInformaticThemeConfig(): void {
  localStorage.removeItem(configStorageKey());
}

function catalogConfigStorageKey(catalogThemeId: string): string {
  return `webpanel-informatic-theme-editor-catalog-config:${catalogThemeId}`;
}

/** Load editor pack from webpanel API (proxied Codiic catalog). */
export async function loadCatalogInformaticThemePack(
  catalogThemeId: string,
  storeId?: string | null
): Promise<InformaticThemePack & { saved?: boolean; canPersist?: boolean }> {
  if (storeId) {
    const { informaticThemeConfigApi } = await import('@/lib/api');
    try {
      const res = await informaticThemeConfigApi.get(storeId, catalogThemeId);
      const payload = res.data?.data;
      if (!payload?.schema || !payload.config) {
        throw new Error('Failed to load saved Informatic theme config for this store.');
      }
      return {
        manifest: payload.manifest || { id: catalogThemeId, name: payload.themeName || 'Informatic' },
        schema: payload.schema as InformaticThemeSchema,
        config: patchInformaticRuntimeTemplates(payload.config),
        packDefaultConfig: patchInformaticRuntimeTemplates(
          payload.packDefaultConfig || payload.config
        ),
        saved: payload.saved,
        canPersist: payload.canPersist,
      };
    } catch (e) {
      const apiMessage = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      throw new Error(apiMessage || (e as Error)?.message || 'Failed to load store theme config.');
    }
  }

  const { informaticThemesApi } = await import('@/lib/api');
  const res = await informaticThemesApi.editorPack(catalogThemeId);
  const payload = res.data?.data as {
    schema?: InformaticThemeSchema;
    config?: Record<string, unknown>;
    manifest?: Record<string, unknown>;
    theme?: { name?: string; id?: string };
  } | undefined;

  const schema = payload?.schema;
  const config = payload?.config;
  if (!schema || !config) {
    throw new Error('Failed to load Informatic theme editor pack from catalog.');
  }

  const packDefaultConfig = structuredClone(config);
  const storageKey = catalogConfigStorageKey(catalogThemeId);

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const draft = JSON.parse(raw) as Record<string, unknown>;
      if (draft && typeof draft === 'object') {
        return {
          manifest: payload?.manifest || { id: catalogThemeId, name: payload?.theme?.name || 'Informatic' },
          schema,
          config: draft,
          packDefaultConfig,
          saved: true,
          canPersist: false,
        };
      }
    }
  } catch {
    /* ignore */
  }

  return {
    manifest: payload?.manifest || { id: catalogThemeId, name: payload?.theme?.name || 'Informatic' },
    schema,
    config,
    packDefaultConfig,
    saved: false,
    canPersist: false,
  };
}

export async function saveStoreInformaticThemeConfig(
  storeId: string,
  catalogThemeId: string,
  config: Record<string, unknown>
): Promise<void> {
  const { informaticThemeConfigApi } = await import('@/lib/api');
  await informaticThemeConfigApi.save(storeId, catalogThemeId, config);
}

export async function resetStoreInformaticThemeConfig(
  storeId: string,
  catalogThemeId: string
): Promise<void> {
  const { informaticThemeConfigApi } = await import('@/lib/api');
  await informaticThemeConfigApi.reset(storeId, catalogThemeId);
}

export function saveCatalogInformaticThemeConfig(
  catalogThemeId: string,
  config: Record<string, unknown>
): void {
  localStorage.setItem(catalogConfigStorageKey(catalogThemeId), JSON.stringify(config));
}

export function clearCatalogInformaticThemeConfig(catalogThemeId: string): void {
  localStorage.removeItem(catalogConfigStorageKey(catalogThemeId));
}

export function setConfigPath(root: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const next = structuredClone(root);
  const parts = path.split('.');
  let cur: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const existing = cur[key];
    if (existing == null || typeof existing !== 'object' || Array.isArray(existing)) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

export function getConfigPath(root: Record<string, unknown> | null, path: string): unknown {
  if (!root || !path) return undefined;
  const parts = path.split('.');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}
