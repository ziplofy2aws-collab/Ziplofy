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

export type ProductThemeTemplateOption = {
  value: string;
  label: string;
};

const DEFAULT_OPTION: ProductThemeTemplateOption = {
  value: "default",
  label: "Default product",
};

export function isValidProductThemeTemplate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === "default" || normalized === "product") return true;
  if (!normalized.startsWith("product.")) return false;
  const slug = normalized.slice("product.".length);
  return isSafeLiquidTemplateName(slug);
}

export function normalizeProductThemeTemplate(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_OPTION.value;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "product") return DEFAULT_OPTION.value;
  return normalized;
}

export function formatProductThemeTemplateLabel(templateId: string): string {
  const normalized = templateId.trim().toLowerCase();
  if (normalized === "default" || normalized === "product") {
    return DEFAULT_OPTION.label;
  }
  const suffix = normalized.startsWith("product.")
    ? normalized.slice("product.".length)
    : normalized;
  const words = suffix
    .split(/[-_.]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length ? words.join(" ") : DEFAULT_OPTION.label;
}

/** JSON composer / live storefront template key (`product` or `product.{slug}`). */
export function resolveProductJsonTemplateId(themeTemplate?: string | null): string {
  const normalized = normalizeProductThemeTemplate(themeTemplate ?? DEFAULT_OPTION.value);
  if (normalized === DEFAULT_OPTION.value) return "product";
  return normalized;
}

function addTemplateOption(
  options: ProductThemeTemplateOption[],
  seen: Set<string>,
  templateId: string,
  label?: string
): void {
  const normalized = normalizeProductThemeTemplate(
    templateId === "product" ? "default" : templateId
  );
  if (seen.has(normalized)) return;
  seen.add(normalized);
  options.push({
    value: normalized,
    label: label?.trim() || formatProductThemeTemplateLabel(normalized),
  });
}

function collectJsonTemplateOptions(
  themeConfig: Record<string, unknown> | null | undefined,
  options: ProductThemeTemplateOption[],
  seen: Set<string>
): void {
  const templates = themeConfig?.templates;
  if (!templates || typeof templates !== "object") return;

  for (const [key, rawValue] of Object.entries(templates as Record<string, unknown>)) {
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey !== "product" && !normalizedKey.startsWith("product.")) continue;
    const label =
      rawValue && typeof rawValue === "object" && "name" in rawValue
        ? String((rawValue as { name?: unknown }).name ?? "")
        : undefined;
    addTemplateOption(options, seen, normalizedKey, label);
  }
}

export async function listProductThemeTemplatesForStore(
  storeId: string
): Promise<ProductThemeTemplateOption[]> {
  const options: ProductThemeTemplateOption[] = [DEFAULT_OPTION];
  const seen = new Set<string>([DEFAULT_OPTION.value]);

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    return options;
  }

  const source = await resolveStorefrontThemeSource(storeId);
  const storeObjectId = new Types.ObjectId(storeId);

  // Prefer the live applied theme, then fall back to every custom theme on the store
  // so merchants can assign templates while still editing / before apply.
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
        if (templateName === "product") {
          addTemplateOption(options, seen, "default");
          continue;
        }
        if (templateName.startsWith("product.")) {
          const slug = templateName.slice("product.".length);
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

  // Always merge templates from all custom themes for this store (covers unapplied edits).
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
