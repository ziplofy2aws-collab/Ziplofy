import mongoose from "mongoose";
import { Types } from "mongoose";
import { StoreCustomTheme } from "../models/store-custom-theme/store-custom-theme.model";
import { StoreThemeConfig } from "../models/store-theme-config.model";
import { Theme } from "../models/theme.model";
import { readStoreThemeConfigFile } from "./theme-config.util";
import { resolveStoreThemeConfig } from "./theme-pack.util";
import {
  isSafeLiquidTemplateName,
  listLiquidTemplateNamesFromS3,
  resolveAppliedStoreTheme,
} from "./storefront-liquid.util";
import { resolveStorefrontThemeSource } from "./storefront-theme-resolution.util";

export type CollectionThemeTemplateOption = {
  value: string;
  label: string;
};

const DEFAULT_OPTION: CollectionThemeTemplateOption = {
  value: "default",
  label: "Default collection",
};

export function isValidCollectionThemeTemplate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === "default" || normalized === "collection") return true;
  if (!normalized.startsWith("collection.")) return false;
  const slug = normalized.slice("collection.".length);
  return isSafeLiquidTemplateName(slug);
}

export function normalizeCollectionThemeTemplate(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_OPTION.value;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "collection") return DEFAULT_OPTION.value;
  return normalized;
}

export function formatCollectionThemeTemplateLabel(templateId: string): string {
  const normalized = templateId.trim().toLowerCase();
  if (normalized === "default" || normalized === "collection") {
    return DEFAULT_OPTION.label;
  }
  const suffix = normalized.startsWith("collection.")
    ? normalized.slice("collection.".length)
    : normalized;
  const words = suffix
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length ? words.join(" ") : DEFAULT_OPTION.label;
}

export function resolveCollectionLiquidTemplate(themeTemplate?: string | null): string {
  const normalized = normalizeCollectionThemeTemplate(themeTemplate ?? DEFAULT_OPTION.value);
  if (normalized === DEFAULT_OPTION.value) return "collection";
  return normalized;
}

export function resolveCollectionJsonTemplateId(themeTemplate?: string | null): string {
  return resolveCollectionLiquidTemplate(themeTemplate);
}

function addTemplateOption(
  options: CollectionThemeTemplateOption[],
  seen: Set<string>,
  templateId: string,
  label?: string
): void {
  const normalized = normalizeCollectionThemeTemplate(
    templateId === "collection" ? "default" : templateId
  );
  if (seen.has(normalized)) return;
  seen.add(normalized);
  options.push({
    value: normalized,
    label: label?.trim() || formatCollectionThemeTemplateLabel(normalized),
  });
}

function collectJsonTemplateOptions(
  themeConfig: Record<string, unknown> | null | undefined,
  options: CollectionThemeTemplateOption[],
  seen: Set<string>
): void {
  const templates = themeConfig?.templates;
  if (!templates || typeof templates !== "object") return;

  for (const [key, rawValue] of Object.entries(templates as Record<string, unknown>)) {
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey !== "collection" && !normalizedKey.startsWith("collection.")) continue;
    const label =
      rawValue && typeof rawValue === "object" && "name" in rawValue
        ? String((rawValue as { name?: unknown }).name ?? "")
        : undefined;
    addTemplateOption(options, seen, normalizedKey, label);
  }
}

export async function listCollectionThemeTemplatesForStore(
  storeId: string
): Promise<CollectionThemeTemplateOption[]> {
  const options: CollectionThemeTemplateOption[] = [DEFAULT_OPTION];
  const seen = new Set<string>([DEFAULT_OPTION.value]);

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    return options;
  }

  const source = await resolveStorefrontThemeSource(storeId);
  const storeObjectId = new Types.ObjectId(storeId);

  if (source.kind === "store-custom" && source.storeCustomThemeId) {
    const customDoc = await StoreCustomTheme.findOne({
      _id: source.storeCustomThemeId,
      storeId: storeObjectId,
    })
      .select("themeConfig")
      .lean();
    collectJsonTemplateOptions(
      (customDoc?.themeConfig as Record<string, unknown> | undefined) ?? null,
      options,
      seen
    );
  } else if (source.kind === "catalog" && source.catalogThemeId) {
    const resolved = await resolveAppliedStoreTheme(storeId);
    if (resolved?.s3Assets) {
      const liquidTemplates = await listLiquidTemplateNamesFromS3(resolved.s3Assets);
      for (const templateName of liquidTemplates) {
        if (templateName === "collection") {
          addTemplateOption(options, seen, "default");
          continue;
        }
        if (templateName.startsWith("collection.")) {
          const slug = templateName.slice("collection.".length);
          if (isSafeLiquidTemplateName(slug)) {
            addTemplateOption(options, seen, templateName);
          }
        }
      }
    }

    const configRow = await StoreThemeConfig.findOne({
      store: storeObjectId,
      theme: new Types.ObjectId(source.catalogThemeId),
    }).lean();

    const theme = await Theme.findById(source.catalogThemeId).lean();
    const themePath = theme ? String((theme as { themePath?: string }).themePath ?? "") : null;
    const s3Assets = theme ? (theme as { s3Assets?: Record<string, unknown> }).s3Assets : null;
    const configFromFile = readStoreThemeConfigFile(storeId, source.catalogThemeId);
    const themeConfig = await resolveStoreThemeConfig(
      (configRow?.config as Record<string, unknown>) ?? configFromFile ?? undefined,
      themePath,
      s3Assets as Parameters<typeof resolveStoreThemeConfig>[2]
    );
    collectJsonTemplateOptions(themeConfig, options, seen);
  }

  const customThemes = await StoreCustomTheme.find({ storeId: storeObjectId })
    .select("themeConfig")
    .sort({ updatedAt: -1 })
    .lean();
  for (const theme of customThemes) {
    collectJsonTemplateOptions(
      (theme.themeConfig as Record<string, unknown> | undefined) ?? null,
      options,
      seen
    );
  }

  return options.sort((a, b) => {
    if (a.value === DEFAULT_OPTION.value) return -1;
    if (b.value === DEFAULT_OPTION.value) return 1;
    return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  });
}
