import type { ThemePreviewPage } from '../components/themes/ThemeLivePreviewFrame';
import type {
  EditorFieldDef,
  EditorSchemaDoc,
  SidebarNode,
} from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import { expandedIdsFromSidebarTree } from '../components/themes/theme-editor-sidebar/theme-editor-sidebar.tree';
import {
  defaultFooterSectionOrder,
  defaultHeaderSectionOrder,
  ensureLayoutOrder,
  getLayoutOrder,
  layoutBlueprintKey,
  remapLayoutSchemaPath,
  remapTemplateHeroSchemaPath,
  remapTemplateSchemaPath,
  templateBlueprintKey,
} from './theme-editor-insert-section';

type SchemaBlock = {
  id?: string;
  label?: string;
  settingsFields?: EditorFieldDef[];
  blocks?: SchemaBlock[];
};

function remappedLayoutSchemaBlock(block: SchemaBlock, instanceId: string, blockInstanceId: string): SchemaBlock {
  return {
    ...block,
    id: blockInstanceId,
    settingsFields: block.settingsFields?.map((f) => ({
      ...f,
      path: f.path
        ? remapLayoutSchemaPath(f.path, instanceId).replace(
            /\.blocks\.[^.]+\./,
            `.blocks.${blockInstanceId}.`
          )
        : f.path,
    })),
    blocks: block.blocks?.map((child) => remappedLayoutSchemaBlock(child, instanceId, blockInstanceId)),
  };
}

function pushSchemaBlockHintsForInstance(
  hints: ThemePreviewSelectionHint[],
  seen: Set<string>,
  config: Record<string, unknown>,
  block: SchemaBlock,
  instanceId: string,
  blueprint: string,
  blockInstanceId?: string
): void {
  const nodePrefix = `layout:${instanceId}`;
  const remappedBlock = blockInstanceId
    ? remappedLayoutSchemaBlock(block, instanceId, blockInstanceId)
    : {
        ...block,
        settingsFields: block.settingsFields?.map((f) => ({
          ...f,
          path: f.path ? remapLayoutSchemaPath(f.path, instanceId) : f.path,
        })),
        blocks: block.blocks?.map((child) => ({
          ...child,
          settingsFields: child.settingsFields?.map((f) => ({
            ...f,
            path: f.path ? remapLayoutSchemaPath(f.path, instanceId) : f.path,
          })),
        })),
      };
  pushSchemaBlockHints(hints, seen, config, remappedBlock, nodePrefix, instanceId);
  void blueprint;
}

function pushLayoutAnnouncementBlockHints(
  hints: ThemePreviewSelectionHint[],
  seen: Set<string>,
  config: Record<string, unknown>,
  layout: { blocks?: SchemaBlock[] },
  instanceId: string
): void {
  const secCfg = getNested(config, `sections.${instanceId}`) as
    | { block_order?: string[] }
    | undefined;
  const template = layout.blocks?.find((b) => b.id === 'announcement');
  if (!template) return;
  const order = secCfg?.block_order?.length ? secCfg.block_order : ['announcement'];
  for (const blockInstanceId of order) {
    pushSchemaBlockHintsForInstance(
      hints,
      seen,
      config,
      template,
      instanceId,
      'announcement_bar',
      blockInstanceId
    );
  }
}

/** Footer/header layout heroes clone the index template hero schema under `sections.{id}`. */
function pushLayoutHeroHintsFromTemplate(
  hints: ThemePreviewSelectionHint[],
  seen: Set<string>,
  config: Record<string, unknown>,
  heroSection: { label?: string; settingsFields?: EditorFieldDef[]; blocks?: SchemaBlock[] },
  instanceId: string
): void {
  const nodePrefix = `layout:${instanceId}`;
  pushHint(hints, seen, {
    nodeId: nodePrefix,
    label: heroSection.label ?? 'Hero',
    kind: 'section',
    sectionId: instanceId,
  });
  for (const field of heroSection.settingsFields ?? []) {
    if (!field.path) continue;
    const path = remapTemplateHeroSchemaPath(field.path, instanceId);
    const raw = getNested(config, path);
    const text = typeof raw === 'string' ? raw.trim() : '';
    pushHint(hints, seen, {
      nodeId: `field:${path}`,
      label: fieldLabelFromPath(path, field.label),
      kind: fieldKindFromPath(path, field.type),
      matchText: text.length >= 2 ? text : undefined,
      fieldPath: path,
      fieldType: field.type as ThemePreviewSelectionHint['fieldType'],
    });
  }
  for (const block of heroSection.blocks ?? []) {
    const remappedBlock: SchemaBlock = {
      ...block,
      settingsFields: block.settingsFields?.map((f) => ({
        ...f,
        path: f.path ? remapTemplateHeroSchemaPath(f.path, instanceId) : f.path,
      })),
      blocks: block.blocks?.map((child) => ({
        ...child,
        settingsFields: child.settingsFields?.map((f) => ({
          ...f,
          path: f.path ? remapTemplateHeroSchemaPath(f.path, instanceId) : f.path,
        })),
      })),
    };
    pushSchemaBlockHints(hints, seen, config, remappedBlock, nodePrefix, instanceId);
  }
}

function pushSchemaBlockHints(
  hints: ThemePreviewSelectionHint[],
  seen: Set<string>,
  config: Record<string, unknown>,
  block: SchemaBlock,
  nodePrefix: string,
  sectionId: string
): void {
  const blockId = block.id ?? 'block';
  const blockNodeId = `${nodePrefix}:block:${blockId}`;
  pushHint(hints, seen, {
    nodeId: blockNodeId,
    label: block.label ?? blockId,
    kind: 'block',
    sectionId,
  });
  for (const field of block.settingsFields ?? []) {
    if (!field.path) continue;
    const raw = getNested(config, field.path);
    const text = typeof raw === 'string' ? raw.trim() : '';
    pushHint(hints, seen, {
      nodeId: `field:${field.path}`,
      label: field.label,
      kind: fieldKindFromPath(field.path, field.type),
      matchText: text.length >= 2 ? text : undefined,
      fieldPath: field.path,
      fieldType: field.type as ThemePreviewSelectionHint['fieldType'],
    });
  }
  for (const nested of block.blocks ?? []) {
    const nestedId = nested.id ?? 'nested';
    pushHint(hints, seen, {
      nodeId: `${blockNodeId}:nested:${nestedId}`,
      label: nested.label ?? nestedId,
      kind: 'block',
      sectionId,
    });
    for (const field of nested.settingsFields ?? []) {
      if (!field.path) continue;
      const raw = getNested(config, field.path);
      const text = typeof raw === 'string' ? raw.trim() : '';
      pushHint(hints, seen, {
        nodeId: `field:${field.path}`,
        label: nested.label ?? field.label,
        kind: fieldKindFromPath(field.path, field.type),
        matchText: text.length >= 2 ? text : undefined,
        fieldPath: field.path,
        fieldType: field.type as ThemePreviewSelectionHint['fieldType'],
      });
    }
  }
}

export type ThemePreviewSelectionKind = 'section' | 'block' | 'field' | 'element';

export type ThemePreviewSelectionHint = {
  nodeId: string;
  label: string;
  kind: ThemePreviewSelectionKind;
  matchText?: string;
  sectionId?: string;
  fieldPath?: string;
  fieldType?: 'text' | 'textarea' | 'color' | 'boolean' | 'number';
};

function templateIdForPage(page: ThemePreviewPage): string {
  return page || 'index';
}

function getNested(config: Record<string, unknown>, dotPath: string): unknown {
  const parts = dotPath.split('.');
  let cur: unknown = config;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function pushHint(
  hints: ThemePreviewSelectionHint[],
  seen: Set<string>,
  hint: ThemePreviewSelectionHint
): void {
  if (seen.has(hint.nodeId)) return;
  seen.add(hint.nodeId);
  hints.push(hint);
}

function fieldKindFromPath(path: string, fieldType: string): ThemePreviewSelectionKind {
  const lower = path.toLowerCase();
  if (lower.includes('button') || fieldType === 'button') return 'element';
  if (/title|heading|subtitle|eyebrow|label/.test(lower)) return 'field';
  return 'field';
}

function fieldLabelFromPath(path: string, fallback: string): string {
  const lower = path.toLowerCase();
  if (lower.includes('title') && !lower.includes('subtitle')) return 'Heading';
  if (lower.includes('subtitle')) return 'Text';
  if (lower.includes('eyebrow')) return 'Text';
  if (lower.includes('button') || lower.includes('ctalabel')) return 'Button';
  if (lower.includes('announcement')) return 'Announcement';
  return fallback;
}

/** Build DOM matching hints from schema + merged preview config. */
export function buildThemeEditorSelectionHints(
  schema: EditorSchemaDoc | null,
  config: Record<string, unknown> | null,
  page: ThemePreviewPage
): ThemePreviewSelectionHint[] {
  if (!schema || !config) return [];

  const hints: ThemePreviewSelectionHint[] = [];
  const seen = new Set<string>();
  const tplId = templateIdForPage(page);

  ensureLayoutOrder(config);
  const layoutOrder = getLayoutOrder(config);
  const headerIds = layoutOrder.header ?? defaultHeaderSectionOrder(config);
  const footerIds = layoutOrder.footer ?? defaultFooterSectionOrder(config);
  const instanceIds = [...headerIds, ...footerIds];

  const indexHeroSchema = schema.templates?.find((t) => t.id === 'index')?.sections?.find((s) => s.id === 'hero_main');
  const layoutSectionsCfg = (config.sections ?? {}) as Record<string, { type?: string } | undefined>;

  for (const instanceId of instanceIds) {
    const blueprint = layoutBlueprintKey(instanceId);
    const layoutSecType = layoutSectionsCfg[instanceId]?.type;
    const isLayoutHero = blueprint === 'hero_main' || layoutSecType === 'hero';

    if (isLayoutHero && indexHeroSchema) {
      pushLayoutHeroHintsFromTemplate(hints, seen, config, indexHeroSchema, instanceId);
      continue;
    }

    const layout = schema.layout?.[blueprint];
    if (!layout) continue;
    pushHint(hints, seen, {
      nodeId: `layout:${instanceId}`,
      label: layout.label ?? instanceId,
      kind: 'section',
      sectionId: instanceId,
    });
    for (const field of layout.settingsFields ?? []) {
      if (!field.path) continue;
      const path = remapLayoutSchemaPath(field.path, instanceId);
      const raw = getNested(config, path);
      const text = typeof raw === 'string' ? raw.trim() : '';
      pushHint(hints, seen, {
        nodeId: `field:${path}`,
        label: fieldLabelFromPath(path, field.label),
        kind: fieldKindFromPath(path, field.type),
        matchText: text.length >= 2 ? text : undefined,
        fieldPath: path,
        fieldType: field.type as ThemePreviewSelectionHint['fieldType'],
      });
    }
    if (blueprint === 'announcement_bar') {
      pushLayoutAnnouncementBlockHints(hints, seen, config, layout, instanceId);
    } else {
      for (const block of layout.blocks ?? []) {
        pushSchemaBlockHintsForInstance(hints, seen, config, block, instanceId, blueprint);
      }
    }
  }

  const tpl = schema.templates?.find((t) => t.id === tplId);
  const tplConfig = getNested(config, `templates.${tplId}`) as
    | { section_order?: string[]; sections?: Record<string, unknown> }
    | undefined;
  const templateSectionOrder = tplConfig?.section_order?.length
    ? tplConfig.section_order
    : tplConfig?.sections
      ? Object.keys(tplConfig.sections)
      : [];

  for (const instanceId of templateSectionOrder) {
    const blueprintId = templateBlueprintKey(instanceId);
    const sec = tpl?.sections?.find((s) => (s.id ?? '') === blueprintId);
    if (!sec) continue;
    pushHint(hints, seen, {
      nodeId: `template:${tplId}:${instanceId}`,
      label: sec.label ?? blueprintId,
      kind: 'section',
      sectionId: instanceId,
    });
    for (const field of sec.settingsFields ?? []) {
      if (!field.path) continue;
      const path = remapTemplateSchemaPath(field.path, tplId, instanceId);
      const raw = getNested(config, path);
      const text = typeof raw === 'string' ? raw.trim() : '';
      pushHint(hints, seen, {
        nodeId: `field:${path}`,
        label: fieldLabelFromPath(path, field.label),
        kind: fieldKindFromPath(path, field.type),
        matchText: text.length >= 2 ? text : undefined,
        fieldPath: path,
        fieldType: field.type as ThemePreviewSelectionHint['fieldType'],
      });
    }
    for (const block of sec.blocks ?? []) {
      pushSchemaBlockHints(hints, seen, config, block, `template:${tplId}:${instanceId}`, instanceId);
    }
  }

  return hints;
}

function headerGroupForLayout(layout: string): 'group:header' | 'group:footer' {
  return layout === 'announcement_bar' ||
    layout.startsWith('announcement_bar_') ||
    layout === 'header' ||
    layout.startsWith('divider')
    ? 'group:header'
    : 'group:footer';
}

/** Parse a config field path into sidebar node ids (fallback when tree lookup misses). */
function expandedIdsFromFieldPath(path: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};

  if (path.startsWith('settings.')) {
    out['group:theme-settings'] = true;
    const groupKey = path.match(/^settings\.([^.]+)/)?.[1];
    if (groupKey) out[`global:${groupKey}`] = true;
    return out;
  }

  if (path.startsWith('templates.')) {
    const head = path.match(/^templates\.([^.]+)\.sections\.([^.]+)/);
    if (!head) return out;
    const [, tpl, sec] = head;
    out['group:template'] = true;
    out[`template:${tpl}:${sec}`] = true;

    let prefix = `template:${tpl}:${sec}`;
    const tail = path.slice(`templates.${tpl}.sections.${sec}.`.length);
    const parts = tail.split('.');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'blocks' && parts[i + 1]) {
        const blockId = parts[i + 1]!;
        if (prefix.includes(':block:')) {
          prefix = `${prefix}:nested:${blockId}`;
        } else {
          prefix = `${prefix}:block:${blockId}`;
        }
        out[prefix] = true;
        i++;
      } else if (parts[i] === 'settings') {
        break;
      }
    }
    return out;
  }

  if (path.startsWith('sections.')) {
    const layout = path.match(/^sections\.([^.]+)/)?.[1];
    if (!layout) return out;
    out[headerGroupForLayout(layout)] = true;
    out[`layout:${layout}`] = true;

    let prefix = `layout:${layout}`;
    const tail = path.slice(`sections.${layout}.`.length);
    const parts = tail.split('.');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'blocks' && parts[i + 1]) {
        const blockId = parts[i + 1]!;
        if (prefix.includes(':block:')) {
          prefix = `${prefix}:nested:${blockId}`;
        } else {
          prefix = `${prefix}:block:${blockId}`;
        }
        out[prefix] = true;
        i++;
      } else if (parts[i] === 'settings') {
        break;
      }
    }
    return out;
  }

  return out;
}

/** Expand structural node ids (template:*, layout:*, field:*). */
function expandedIdsFromStructuralNodeId(nodeId: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};

  if (nodeId.startsWith('field:')) {
    return expandedIdsFromFieldPath(nodeId.slice('field:'.length));
  }

  const parts = nodeId.split(':');
  if (parts[0] === 'template' && parts.length >= 3) {
    out['group:template'] = true;
    out[`template:${parts[1]}:${parts[2]}`] = true;
    if (parts[3] === 'block' && parts[4]) {
      let prefix = `template:${parts[1]}:${parts[2]}:block:${parts[4]}`;
      out[prefix] = true;
      if (parts[5] === 'nested' && parts[6]) {
        prefix = `${prefix}:nested:${parts[6]}`;
        out[prefix] = true;
      }
    }
    return out;
  }

  if (parts[0] === 'layout' && parts.length >= 2) {
    out[headerGroupForLayout(parts[1]!)] = true;
    out[`layout:${parts[1]}`] = true;
    if (parts[2] === 'block' && parts[3]) {
      let prefix = `layout:${parts[1]}:block:${parts[3]}`;
      out[prefix] = true;
      if (parts[4] === 'nested' && parts[5]) {
        prefix = `${prefix}:nested:${parts[5]}`;
        out[prefix] = true;
      }
    }
    return out;
  }

  return out;
}

/**
 * Expand sidebar ancestors when a node is selected from the preview.
 * Prefer walking the live sidebar tree; fall back to path parsing.
 */
export function expandedIdsForPreviewNode(
  nodeId: string,
  sectionsTree?: SidebarNode[]
): Record<string, boolean> {
  if (sectionsTree?.length) {
    const fromTree = expandedIdsFromSidebarTree(nodeId, sectionsTree);
    if (Object.keys(fromTree).length > 0) return fromTree;
  }

  return expandedIdsFromStructuralNodeId(nodeId);
}


