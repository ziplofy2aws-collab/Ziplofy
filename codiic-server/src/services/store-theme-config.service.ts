import { Types } from "mongoose";
import { Theme } from "../models/theme.model";
import { InstalledThemes } from "../models/installed-themes.model";
import { StoreThemeConfig } from "../models/store-theme-config.model";
import { CustomError } from "../utils/error.utils";
import {
  REACT_THEME_CONFIG_SCHEMA,
  formValuesFromConfig,
  readStoreThemeConfigFile,
  writeStoreThemeConfigFile,
} from "../utils/theme-config.util";
import {
  computeStoreOverrides,
  flattenEditorSchema,
  formValuesFromPackConfig,
  hasSectionEditorPack,
  loadThemePack,
  mergeThemePackConfig,
  mergedConfigFromFormValues,
  normalizeStoreOverrides,
  resolveStoreThemeConfig,
  type ThemePack,
  type ThemePackS3Refs,
} from "../utils/theme-pack.util";
import { canonicalStoreRef, storeAndUserScopeOr } from "../utils/installed-themes-query.util";
import {
  buildBlockCatalogFromPack,
  prepareThemePackForEditor,
  type ThemeBlockCatalog,
} from "../utils/theme-pack-editor.util";
import { publicObjectUrlForKey } from "../utils/theme-s3-ingest";

function withResolvedS3Urls(s3: Record<string, unknown>) {
  const out = { ...s3 };
  for (const field of [
    "reactThemeJs",
    "reactThemeCss",
    "reactThemeSchema",
    "reactThemeDefaultConfig",
    "reactThemeManifest",
  ] as const) {
    const part = out[field] as { key?: string; url?: string } | undefined;
    if (part?.key && !part.url) {
      out[field] = { ...part, url: publicObjectUrlForKey(part.key) };
    }
  }
  return out;
}

async function isThemeInstalled(storeId: string, themeId: string): Promise<boolean> {
  const installed = await InstalledThemes.findOne({
    $and: [
      { $or: storeAndUserScopeOr(storeId) },
      { theme: new Types.ObjectId(themeId) },
      { uninstalledAt: null },
    ],
  }).lean();
  return Boolean(installed);
}

async function assertThemeInstalled(storeId: string, themeId: string) {
  if (!(await isThemeInstalled(storeId, themeId))) {
    throw new CustomError(
      "Theme is not installed for this store. Install it from Themes, then save your changes.",
      404
    );
  }
}

function normalizePack(pack: ThemePack | null): {
  pack: ThemePack | null;
  blockCatalog: ThemeBlockCatalog | null;
} {
  if (!pack) return { pack: null, blockCatalog: null };
  const prepared = prepareThemePackForEditor(pack);
  return {
    pack: prepared,
    blockCatalog: buildBlockCatalogFromPack(prepared),
  };
}

async function loadThemeAndPack(themeId: string): Promise<{
  theme: { name?: string; themePath?: string };
  themePath: string;
  s3: Record<string, unknown>;
  s3Refs: ThemePackS3Refs;
  pack: ThemePack | null;
  blockCatalog: ThemeBlockCatalog | null;
  packLoadedFromS3: boolean;
}> {
  let theme = await Theme.findById(themeId).lean();
  if (!theme) {
    theme = await Theme.findOne({ themePath: themeId }).lean();
  }
  if (!theme) throw new CustomError("Theme not found", 404);

  const themePath = String((theme as { themePath?: string }).themePath ?? "");
  const s3 = withResolvedS3Urls(
    ((theme as { s3Assets?: Record<string, unknown> }).s3Assets ?? {}) as Record<string, unknown>
  );
  const s3Refs = s3 as ThemePackS3Refs;
  const rawPack = await loadThemePack(themePath, s3Refs);
  const packLoadedFromS3 = Boolean(
    rawPack &&
      s3Refs.reactThemeSchema?.key &&
      s3Refs.reactThemeDefaultConfig?.key
  );
  const { pack, blockCatalog } = normalizePack(rawPack);

  if (!pack && !hasSectionEditorPack(null, s3Refs)) {
    throw new CustomError(
      "Theme editor pack not found. Upload theme.schema.json, theme.default-config.json, and theme.manifest.json with the theme.",
      404
    );
  }

  return {
    theme: theme as { name?: string; themePath?: string },
    themePath,
    s3,
    s3Refs,
    pack,
    blockCatalog,
    packLoadedFromS3,
  };
}

async function readSavedOverrides(storeId: string, themeId: string) {
  const storeRef = canonicalStoreRef(storeId);
  const themeRef = new Types.ObjectId(themeId);
  const row = await StoreThemeConfig.findOne({ store: storeRef, theme: themeRef }).lean();
  const fromFile = readStoreThemeConfigFile(storeId, themeId);
  return (row?.config as Record<string, unknown>) ?? fromFile ?? undefined;
}

export type StoreThemeConfigPayload = {
  storeId: string;
  themeId: string;
  themeName: string;
  themePath: string;
  configMode: "sections" | "flat";
  editorSchema: unknown;
  defaultConfig: Record<string, unknown> | null;
  manifest: Record<string, unknown> | null;
  blockCatalog: ThemeBlockCatalog | null;
  packLoadedFromS3: boolean;
  storeOverrides: Record<string, unknown>;
  schema: ReturnType<typeof flattenEditorSchema>;
  config: Record<string, unknown>;
  values: Record<string, string | boolean>;
  themeRuntime: { jsUrl: string | null; cssUrl: string | null };
  installed: boolean;
  canPersist: boolean;
  notice: string | null;
};

export type CatalogThemeEditorPackPayload = {
  themeId: string;
  themeName: string;
  themePath: string;
  configMode: "sections" | "flat";
  editorSchema: unknown;
  defaultConfig: Record<string, unknown> | null;
  manifest: Record<string, unknown> | null;
  blockCatalog: ThemeBlockCatalog | null;
  packLoadedFromS3: boolean;
  values: Record<string, string | boolean>;
  themeRuntime: { jsUrl: string | null; cssUrl: string | null };
};

function themeRuntimeFromS3(s3: Record<string, unknown>) {
  return {
    jsUrl: (s3?.reactThemeJs as { url?: string })?.url ?? null,
    cssUrl: (s3?.reactThemeCss as { url?: string })?.url ?? null,
  };
}

function buildPayloadFromPack(
  base: Omit<
    StoreThemeConfigPayload,
    "schema" | "config" | "values" | "storeOverrides" | "installed" | "canPersist" | "notice"
  >,
  pack: ThemePack | null,
  storeOverrides: Record<string, unknown>,
  installed: boolean
): StoreThemeConfigPayload {
  const merged = pack
    ? mergeThemePackConfig(storeOverrides, pack)
    : (storeOverrides as Record<string, unknown>);
  const schema = pack ? flattenEditorSchema(pack.editorSchema) : REACT_THEME_CONFIG_SCHEMA;
  const values = pack
    ? formValuesFromPackConfig(merged, schema, pack.editorSchema)
    : formValuesFromConfig(merged);

  return {
    ...base,
    storeOverrides: storeOverrides ?? {},
    schema,
    config: merged,
    values,
    installed,
    canPersist: installed && Boolean(pack),
    notice: installed
      ? null
      : "Theme is not installed on this store — preview uses catalog defaults. Install the theme to save changes.",
  };
}

/** Catalog-only editor assets (schema, defaults, manifest, runtime URLs) for a theme id. */
export async function loadCatalogThemeEditorPack(
  themeId: string
): Promise<CatalogThemeEditorPackPayload> {
  const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } =
    await loadThemeAndPack(themeId);

  const schema = pack ? flattenEditorSchema(pack.editorSchema) : REACT_THEME_CONFIG_SCHEMA;
  const values = pack
    ? formValuesFromPackConfig(pack.defaultConfig, schema, pack.editorSchema)
    : formValuesFromConfig({});

  return {
    themeId,
    themeName: String(theme.name ?? "Theme"),
    themePath,
    configMode: pack ? "sections" : "flat",
    editorSchema: pack?.editorSchema ?? null,
    defaultConfig: pack?.defaultConfig ?? null,
    manifest: pack?.manifest ?? null,
    blockCatalog,
    packLoadedFromS3,
    values,
    themeRuntime: themeRuntimeFromS3(s3),
  };
}

export async function loadStoreThemeConfig(
  storeId: string,
  themeId: string
): Promise<StoreThemeConfigPayload> {
  if (!storeId) throw new CustomError("storeId is required", 400);

  const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } =
    await loadThemeAndPack(themeId);
  const installed = await isThemeInstalled(storeId, themeId);
  const rawSaved = installed ? await readSavedOverrides(storeId, themeId) : {};
  const storeOverrides = pack ? normalizeStoreOverrides(rawSaved, pack) : rawSaved ?? {};

  return buildPayloadFromPack(
    {
      storeId,
      themeId,
      themeName: String(theme.name ?? "Theme"),
      themePath,
      configMode: pack ? "sections" : "flat",
      editorSchema: pack?.editorSchema ?? null,
      defaultConfig: pack?.defaultConfig ?? null,
      manifest: pack?.manifest ?? null,
      blockCatalog,
      packLoadedFromS3,
      themeRuntime: themeRuntimeFromS3(s3),
    },
    pack,
    storeOverrides,
    installed
  );
}

export async function saveStoreThemeConfig(
  storeId: string,
  themeId: string,
  body: {
    config?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
    values?: Record<string, string | boolean>;
  }
): Promise<StoreThemeConfigPayload> {
  if (!storeId) throw new CustomError("storeId is required", 400);
  const { config, overrides, values } = body;
  if (!config && !overrides && !values) {
    throw new CustomError("config, overrides, or values is required", 400);
  }

  await assertThemeInstalled(storeId, themeId);

  const { theme, themePath, s3, pack, blockCatalog, packLoadedFromS3 } =
    await loadThemeAndPack(themeId);

  let storeOverridesToSave: Record<string, unknown>;
  let merged: Record<string, unknown>;

  if (pack) {
    const flatSchema = flattenEditorSchema(pack.editorSchema);
    if (overrides && typeof overrides === "object") {
      storeOverridesToSave = overrides;
      merged = mergeThemePackConfig(storeOverridesToSave, pack);
    } else if (values && typeof values === "object") {
      merged = mergedConfigFromFormValues(
        values,
        flatSchema,
        pack.defaultConfig,
        pack.editorSchema
      );
      storeOverridesToSave = computeStoreOverrides(merged, pack.defaultConfig);
    } else if (config && typeof config === "object") {
      merged = mergeThemePackConfig(config, pack);
      storeOverridesToSave = computeStoreOverrides(merged, pack.defaultConfig);
    } else {
      throw new CustomError("Invalid payload", 400);
    }
  } else {
    if (!config || typeof config !== "object") {
      throw new CustomError("config object is required for flat themes", 400);
    }
    merged = await resolveStoreThemeConfig(config, themePath, null);
    storeOverridesToSave = merged;
  }

  writeStoreThemeConfigFile(storeId, themeId, storeOverridesToSave);

  const storeRef = canonicalStoreRef(storeId);
  const themeRef = new Types.ObjectId(themeId);
  await StoreThemeConfig.findOneAndUpdate(
    { store: storeRef, theme: themeRef },
    { $set: { config: storeOverridesToSave, store: storeRef, theme: themeRef } },
    { upsert: true, new: true }
  );

  return buildPayloadFromPack(
    {
      storeId,
      themeId,
      themeName: String(theme.name ?? "Theme"),
      themePath,
      configMode: pack ? "sections" : "flat",
      editorSchema: pack?.editorSchema ?? null,
      defaultConfig: pack?.defaultConfig ?? null,
      manifest: pack?.manifest ?? null,
      blockCatalog,
      packLoadedFromS3,
      themeRuntime: themeRuntimeFromS3(s3),
    },
    pack,
    storeOverridesToSave,
    true
  );
}
