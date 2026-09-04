export type InformaticInspectorPanel =
  | { kind: 'theme-settings' }
  | { kind: 'layout'; sectionId: string }
  | { kind: 'layout-block'; sectionId: string; blockId: string }
  | { kind: 'section'; templateId: string; sectionId: string }
  | { kind: 'section-block'; templateId: string; sectionId: string; blockId: string };

const LAYOUT_SECTION_IDS = new Set(['announcement_bar', 'header', 'footer']);

/**
 * Map `data-informatic-node` values from the theme pack to sidebar panel selection.
 */
export function panelFromInformaticNodeId(
  nodeId: string,
  pageId: string,
  layoutIds: Set<string> = LAYOUT_SECTION_IDS
): InformaticInspectorPanel | null {
  const id = (nodeId || '').trim();
  if (!id) return null;

  if (id.startsWith('field:')) {
    return panelFromConfigPath(id.slice('field:'.length), pageId, layoutIds);
  }

  if (id.startsWith('layout:')) {
    const sectionId = id.slice('layout:'.length);
    if (!sectionId) return null;
    if (layoutIds.has(sectionId)) {
      return { kind: 'layout', sectionId };
    }
    return { kind: 'section', templateId: pageId, sectionId };
  }

  return panelFromConfigPath(id, pageId, layoutIds);
}

function panelFromConfigPath(
  path: string,
  pageId: string,
  layoutIds: Set<string>
): InformaticInspectorPanel | null {
  const p = path.trim();
  if (!p) return null;

  // sections.header.blocks.logo(.settings…)
  {
    const m = /^sections\.([^.]+)\.blocks\.([^.]+)/.exec(p);
    if (m) {
      return { kind: 'layout-block', sectionId: m[1], blockId: m[2] };
    }
  }

  // sections.header.settings…
  {
    const m = /^sections\.([^.]+)(?:\.|$)/.exec(p);
    if (m && layoutIds.has(m[1])) {
      return { kind: 'layout', sectionId: m[1] };
    }
  }

  // templates.index.sections.hero.blocks.f1(.settings…)
  {
    const m = /^templates\.([^.]+)\.sections\.([^.]+)\.blocks\.([^.]+)/.exec(p);
    if (m) {
      return { kind: 'section-block', templateId: m[1] || pageId, sectionId: m[2], blockId: m[3] };
    }
  }

  // templates.index.sections.hero.settings…
  {
    const m = /^templates\.([^.]+)\.sections\.([^.]+)(?:\.|$)/.exec(p);
    if (m) {
      return { kind: 'section', templateId: m[1] || pageId, sectionId: m[2] };
    }
  }

  return null;
}

export function findInformaticNodeElement(
  root: ParentNode,
  from: EventTarget | null
): HTMLElement | null {
  if (!(from instanceof Element)) return null;
  const el = from.closest('[data-informatic-node], [data-informatic-section]') as HTMLElement | null;
  if (!el || !root.contains(el)) return null;
  return el;
}

export function nodeIdFromElement(el: HTMLElement): string {
  return (
    el.getAttribute('data-informatic-node') ||
    (el.getAttribute('data-informatic-section')
      ? `layout:${el.getAttribute('data-informatic-section')}`
      : '')
  );
}
