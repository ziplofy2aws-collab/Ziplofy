"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichEditorSchemaFromDefaultConfig = enrichEditorSchemaFromDefaultConfig;
exports.buildBlockCatalogFromPack = buildBlockCatalogFromPack;
exports.prepareThemePackForEditor = prepareThemePackForEditor;
function humanize(id) {
    return id
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
function blocksFromConfigRecord(blocks, order) {
    if (!blocks || typeof blocks !== "object")
        return [];
    const ids = order?.length ? order : Object.keys(blocks);
    return ids
        .filter((id) => blocks[id])
        .map((id) => ({
        id,
        label: blocks[id].label ?? humanize(blocks[id].type ?? id),
        settingsFields: [],
    }));
}
function mergeSectionBlocks(schemaSection, configSection) {
    if (schemaSection.blocks?.length)
        return schemaSection.blocks;
    if (!configSection?.blocks)
        return schemaSection.hasBlocks ? [] : undefined;
    const fromConfig = blocksFromConfigRecord(configSection.blocks, configSection.block_order);
    return fromConfig.length ? fromConfig : undefined;
}
/** Merge block trees from theme.default-config.json into theme.schema.json for the sidebar. */
function enrichEditorSchemaFromDefaultConfig(schema, defaultConfig) {
    const out = JSON.parse(JSON.stringify(schema));
    const cfgSections = (defaultConfig.sections ?? {});
    const cfgTemplates = (defaultConfig.templates ?? {});
    if (out.layout) {
        for (const [key, layoutPart] of Object.entries(out.layout)) {
            const cfgLayout = cfgSections[key];
            if (!layoutPart || !cfgLayout)
                continue;
            const merged = mergeSectionBlocks(layoutPart, cfgLayout);
            if (merged)
                layoutPart.blocks = merged;
            if (cfgLayout.settings?.announcement && layoutPart.settingsFields) {
                const hasAnnouncement = layoutPart.settingsFields.some((f) => f.path.toLowerCase().includes("announcement"));
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
        if (!cfgTpl?.sections)
            continue;
        for (const sec of tpl.sections ?? []) {
            const secId = sec.id ?? "";
            const cfgSec = cfgTpl.sections[secId];
            if (!cfgSec)
                continue;
            const merged = mergeSectionBlocks(sec, cfgSec);
            if (merged?.length) {
                sec.blocks = merged;
                sec.hasBlocks = true;
            }
            if (cfgTpl.name && !tpl.label)
                tpl.label = cfgTpl.name;
        }
    }
    return out;
}
function collectBlockTypesFromConfig(defaultConfig) {
    const types = new Map();
    const visit = (blocks) => {
        if (!blocks)
            return;
        for (const [id, b] of Object.entries(blocks)) {
            const type = b.type ?? id;
            if (!types.has(type))
                types.set(type, b.label ?? humanize(type));
        }
    };
    const sections = (defaultConfig.sections ?? {});
    for (const sec of Object.values(sections))
        visit(sec.blocks);
    const templates = (defaultConfig.templates ?? {});
    for (const tpl of Object.values(templates)) {
        for (const sec of Object.values(tpl.sections ?? {}))
            visit(sec.blocks);
    }
    return types;
}
function categoryForBlockType(type) {
    const t = type.toLowerCase();
    if (t.includes("link") || t.includes("menu"))
        return "links";
    if (t.includes("product") ||
        t.includes("price") ||
        t.includes("buy") ||
        t.includes("cart") ||
        t.includes("review") ||
        t.includes("sku") ||
        t.includes("variant") ||
        t.includes("inventory")) {
        return "product";
    }
    if (t.includes("icon") || t.includes("marquee") || t.includes("jumbo"))
        return "decorative";
    if (t.includes("group") || t.includes("spacer"))
        return "layout";
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
function buildBlockCatalogFromPack(pack) {
    const manifest = (pack.manifest ?? {});
    const blocks = [];
    const categoryIds = new Set();
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
    }
    else {
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
    const sectionBlockAllowlist = { ...(manifest.sectionBlocks ?? {}) };
    for (const tpl of pack.editorSchema.templates ?? []) {
        for (const sec of tpl.sections ?? []) {
            const secType = sec.type ?? sec.id ?? "";
            if (sectionBlockAllowlist[secType]?.length)
                continue;
            if (sec.blocks?.length) {
                sectionBlockAllowlist[secType] = sec.blocks.map((b) => b.id ?? "").filter(Boolean);
            }
            else if (sec.hasBlocks) {
                sectionBlockAllowlist[secType] = blocks.filter((b) => !b.extendedOnly).map((b) => b.id);
            }
        }
    }
    return { categories, blocks, sectionBlockAllowlist };
}
function prepareThemePackForEditor(pack) {
    const editorSchema = enrichEditorSchemaFromDefaultConfig(pack.editorSchema, pack.defaultConfig);
    return { ...pack, editorSchema };
}
