import type { EditorBlockDef, EditorFieldDef, EditorSchemaDoc, ThemePack } from "./theme-pack.util.js";

export type ThemeBlockCatalogItem = {
  id: string;
  label: string;
  category: string;
  icon?: string;
  extendedOnly?: boolean;
};

export type ThemeBlockCatalog = {
  categories: Array<{ id: string; label: string }>;
  blocks: ThemeBlockCatalogItem[];
  /** section type or id → allowed block type ids for "Add block" picker */
  sectionBlockAllowlist: Record<string, string[]>;
};

type BlockDef = EditorBlockDef;

function humanize(id: string): string {
  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function blocksFromConfigRecord(
  blocks: Record<string, { type?: string; label?: string }> | undefined,
  order?: string[]
): BlockDef[] {
  if (!blocks || typeof blocks !== "object") return [];
  const ids = order?.length ? order : Object.keys(blocks);
  return ids
    .filter((id) => blocks[id])
    .map((id) => ({
      id,
      label: blocks[id].label ?? humanize(blocks[id].type ?? id),
      settingsFields: [],
    }));
}

function mergeSectionBlocks(
  schemaSection: { id?: string; blocks?: BlockDef[]; hasBlocks?: boolean },
  configSection: {
    blocks?: Record<string, { type?: string; label?: string }>;
    block_order?: string[];
  } | null
): BlockDef[] | undefined {
  if (schemaSection.blocks?.length) return schemaSection.blocks;
  if (!configSection?.blocks) return schemaSection.hasBlocks ? [] : undefined;
  const fromConfig = blocksFromConfigRecord(configSection.blocks, configSection.block_order);
  return fromConfig.length ? fromConfig : undefined;
}

/** Merge block trees from theme.default-config.json into theme.schema.json for the sidebar. */
export function enrichEditorSchemaFromDefaultConfig(
  schema: EditorSchemaDoc,
  defaultConfig: Record<string, unknown>
): EditorSchemaDoc {
  const out: EditorSchemaDoc = JSON.parse(JSON.stringify(schema)) as EditorSchemaDoc;
  const cfgSections = (defaultConfig.sections ?? {}) as Record<
    string,
    { blocks?: Record<string, { type?: string; label?: string }>; block_order?: string[]; settings?: Record<string, unknown> }
  >;
  const cfgTemplates = (defaultConfig.templates ?? {}) as Record<
    string,
    {
      name?: string;
      label?: string;
      sections?: Record<
        string,
        {
          blocks?: Record<string, { type?: string; label?: string }>;
          block_order?: string[];
        }
      >;
    }
  >;

  if (out.layout) {
    for (const [key, layoutPart] of Object.entries(out.layout)) {
      const cfgLayout = cfgSections[key];
      if (!layoutPart || !cfgLayout) continue;
      const merged = mergeSectionBlocks(
        layoutPart as { blocks?: BlockDef[]; hasBlocks?: boolean },
        cfgLayout
      );
      if (merged) layoutPart.blocks = merged;
      if (cfgLayout.settings?.announcement && layoutPart.settingsFields) {
        const hasAnnouncement = layoutPart.settingsFields.some((f) =>
          f.path.toLowerCase().includes("announcement")
        );
        if (!hasAnnouncement) {
          layoutPart.settingsFields = [
            {
              path: `sections.${key}.settings.announcement`,
              type: "text",
              label: "Announcement bar",
            },
            ...layoutPart.settingsFields,
          ];
        }
      }
    }
  }

  for (const tpl of out.templates ?? []) {
    const cfgTpl = cfgTemplates[tpl.id];
    if (!cfgTpl?.sections) continue;
    for (const sec of tpl.sections ?? []) {
      const secId = sec.id ?? "";
      const cfgSec = cfgTpl.sections[secId];
      if (!cfgSec) continue;
      const merged = mergeSectionBlocks(sec as { id?: string; blocks?: BlockDef[]; hasBlocks?: boolean }, cfgSec);
      if (merged?.length) {
        sec.blocks = merged;
        sec.hasBlocks = true;
      }
      if (cfgTpl.name && !tpl.label) tpl.label = cfgTpl.name;
    }
  }

  return out;
}

function collectBlockTypesFromConfig(defaultConfig: Record<string, unknown>): Map<string, string> {
  const types = new Map<string, string>();

  const visit = (blocks: Record<string, { type?: string; label?: string }> | undefined) => {
    if (!blocks) return;
    for (const [id, b] of Object.entries(blocks)) {
      const type = b.type ?? id;
      if (!types.has(type)) types.set(type, b.label ?? humanize(type));
    }
  };

  const sections = (defaultConfig.sections ?? {}) as Record<string, { blocks?: Record<string, { type?: string; label?: string }> }>;
  for (const sec of Object.values(sections)) visit(sec.blocks);

  const templates = (defaultConfig.templates ?? {}) as Record<
    string,
    { sections?: Record<string, { blocks?: Record<string, { type?: string; label?: string }> }> }
  >;
  for (const tpl of Object.values(templates)) {
    for (const sec of Object.values(tpl.sections ?? {})) visit(sec.blocks);
  }

  return types;
}

function categoryForBlockType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("link") || t.includes("menu")) return "links";
  if (
    t.includes("product") ||
    t.includes("price") ||
    t.includes("buy") ||
    t.includes("cart") ||
    t.includes("review") ||
    t.includes("sku") ||
    t.includes("variant") ||
    t.includes("inventory")
  ) {
    return "product";
  }
  if (t.includes("icon") || t.includes("marquee") || t.includes("jumbo")) return "decorative";
  if (t.includes("group") || t.includes("spacer")) return "layout";
  return "basic";
}

const CORE_BLOCK_TYPES = new Set([
  "button",
  "heading",
  "logo",
  "text",
  "jumbo-text",
  "marquee",
  "group",
]);

/** Build add-block picker catalog from manifest + default-config (+ optional schema). */
export function buildBlockCatalogFromPack(pack: ThemePack): ThemeBlockCatalog {
  const manifest = (pack.manifest ?? {}) as {
    blockTypes?: Record<string, Array<{ id: string; label: string; extendedOnly?: boolean }>>;
    sectionBlocks?: Record<string, string[]>;
  };

  const blocks: ThemeBlockCatalogItem[] = [];
  const categoryIds = new Set<string>();

  if (manifest.blockTypes && typeof manifest.blockTypes === "object") {
    for (const [category, items] of Object.entries(manifest.blockTypes)) {
      categoryIds.add(category);
      for (const item of items) {
        blocks.push({
          id: item.id,
          label: item.label,
          category,
          icon: item.id,
          extendedOnly: item.extendedOnly,
        });
      }
    }
  } else {
    const types = collectBlockTypesFromConfig(pack.defaultConfig);
    for (const [type, label] of types) {
      const category = categoryForBlockType(type);
      categoryIds.add(category);
      blocks.push({
        id: type,
        label,
        category,
        icon: type,
        extendedOnly: !CORE_BLOCK_TYPES.has(type) && category !== "basic",
      });
    }
    if (!blocks.length) {
      const fallback = [
        { id: "button", label: "Button", category: "basic" },
        { id: "heading", label: "Heading", category: "basic" },
        { id: "text", label: "Text", category: "basic" },
        { id: "group", label: "Group", category: "layout" },
      ];
      for (const b of fallback) {
        categoryIds.add(b.category);
        blocks.push({ ...b, icon: b.id });
      }
    }
  }

  const categories = Array.from(categoryIds).map((id) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
  }));

  const sectionBlockAllowlist: Record<string, string[]> = { ...(manifest.sectionBlocks ?? {}) };

  for (const tpl of pack.editorSchema.templates ?? []) {
    for (const sec of tpl.sections ?? []) {
      const secType = sec.type ?? sec.id ?? "";
      if (sectionBlockAllowlist[secType]?.length) continue;
      if (sec.blocks?.length) {
        sectionBlockAllowlist[secType] = sec.blocks.map((b: EditorBlockDef) => b.id ?? "").filter(Boolean);
      } else if (sec.hasBlocks) {
        sectionBlockAllowlist[secType] = blocks.filter((b) => !b.extendedOnly).map((b) => b.id);
      }
    }
  }

  return { categories, blocks, sectionBlockAllowlist };
}

export function prepareThemePackForEditor(pack: ThemePack): ThemePack {
  const editorSchema = enrichEditorSchemaFromDefaultConfig(pack.editorSchema, pack.defaultConfig);
  return { ...pack, editorSchema };
}
