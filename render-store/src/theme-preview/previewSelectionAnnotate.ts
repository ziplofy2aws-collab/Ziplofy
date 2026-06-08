import type { ThemePreviewSelectionHint } from './previewBridge';

const TEXT_SELECTOR =
  'h1,h2,h3,h4,h5,h6,p,button,a,span,label,figcaption,li,strong,em';

const SECTION_SELECTOR =
  'section,header,footer,main,article,[data-section-id],[data-ziplofy-section]';

const PRESERVED_ANNOTATION_KINDS = new Set(['field', 'section', 'block']);

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function clearAnnotations(root: ParentNode): void {
  root.querySelectorAll('[data-ziplofy-node]').forEach((el) => {
    const kind = el.getAttribute('data-ziplofy-kind');
    // Keep precise markers from theme components — do not re-tag by fuzzy matchText.
    if (kind && PRESERVED_ANNOTATION_KINDS.has(kind)) return;
    el.removeAttribute('data-ziplofy-node');
    el.removeAttribute('data-ziplofy-label');
    el.removeAttribute('data-ziplofy-kind');
  });
}

function tagElement(el: Element, hint: ThemePreviewSelectionHint): void {
  if (el.getAttribute('data-ziplofy-node')) return;
  if (el.closest('[data-ziplofy-node]')) return;
  el.setAttribute('data-ziplofy-node', hint.nodeId);
  el.setAttribute('data-ziplofy-label', hint.label);
  el.setAttribute('data-ziplofy-kind', hint.kind);
}

function sectionInstanceIdFromNodeId(nodeId: string): string | null {
  if (nodeId.startsWith('layout:')) {
    return nodeId.slice('layout:'.length).split(':')[0] ?? null;
  }
  if (nodeId.startsWith('template:')) {
    const parts = nodeId.split(':');
    return parts.length >= 3 ? parts[2]! : null;
  }
  return null;
}

/** Exact DOM match for a section instance (never fuzzy class/id contains). */
function findSectionRootsByInstanceId(
  instanceId: string,
  expectedNodeId?: string
): HTMLElement[] {
  const escaped = CSS.escape(instanceId);
  const roots = document.querySelectorAll(
    `[data-ziplofy-section="${escaped}"],[data-section-id="${escaped}"]`
  );
  const out: HTMLElement[] = [];
  for (const root of roots) {
    if (!(root instanceof HTMLElement)) continue;
    const node = root.getAttribute('data-ziplofy-node');
    if (expectedNodeId && node && node !== expectedNodeId) continue;
    out.push(root);
  }
  return out;
}

function findBySectionId(sectionId: string, expectedNodeId?: string): HTMLElement | null {
  const matches = findSectionRootsByInstanceId(sectionId, expectedNodeId);
  if (matches.length) return matches[0]!;
  if (expectedNodeId) {
    const marked = document.querySelector(
      `[data-ziplofy-node="${CSS.escape(expectedNodeId)}"]`
    );
    if (marked instanceof HTMLElement) return marked;
  }
  return null;
}

function sectionRootForHint(hint: ThemePreviewSelectionHint): HTMLElement | null {
  if (hint.sectionId) {
    return findBySectionId(hint.sectionId, hint.kind === 'section' ? hint.nodeId : undefined);
  }
  if (hint.fieldPath) {
    const layout = hint.fieldPath.match(/^sections\.([^.]+)/);
    if (layout) return findBySectionId(layout[1]!);
    const tpl = hint.fieldPath.match(/^templates\.[^.]+\.sections\.([^.]+)/);
    if (tpl) return findBySectionId(tpl[1]!);
  }
  return null;
}

function duplicateMatchTexts(hints: ThemePreviewSelectionHint[]): Set<string> {
  const counts = new Map<string, number>();
  for (const hint of hints) {
    if (!hint.matchText) continue;
    const key = normalizeText(hint.matchText);
    if (key.length < 2) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const dupes = new Set<string>();
  for (const [key, count] of counts) {
    if (count > 1) dupes.add(key);
  }
  return dupes;
}

/** Stamp data-ziplofy-node attributes so hover/click selection can resolve sidebar nodes. */
export function annotatePreviewSelectionHints(
  hints: ThemePreviewSelectionHint[],
  options?: { incremental?: boolean }
): void {
  if (typeof document === 'undefined') return;
  if (!options?.incremental) {
    clearAnnotations(document);
  }

  const duplicateTexts = duplicateMatchTexts(hints);
  const textHints = hints.filter((h) => h.matchText && h.matchText.trim().length >= 2);
  const sectionHints = hints.filter((h) => h.sectionId && h.kind === 'section');

  for (const hint of textHints) {
    const existing = document.querySelector(`[data-ziplofy-node="${CSS.escape(hint.nodeId)}"]`);
    if (existing) continue;

    const target = normalizeText(hint.matchText!);
    if (duplicateTexts.has(target) && !hint.sectionId && !hint.fieldPath) continue;

    const scopeRoot = sectionRootForHint(hint);
    const nodes = scopeRoot
      ? scopeRoot.querySelectorAll(TEXT_SELECTOR)
      : duplicateTexts.has(target)
        ? []
        : document.querySelectorAll(TEXT_SELECTOR);

    let best: { el: Element; score: number } | null = null;

    for (const el of nodes) {
      if (el.closest('[data-ziplofy-node]')) continue;
      const content = normalizeText(el.textContent ?? '');
      if (!content) continue;

      const exact = content === target;
      const contains = target.length >= 4 && content.includes(target);
      if (!exact && !contains) continue;

      const score = exact ? content.length : content.length + 1000;
      if (!best || score < best.score) {
        best = { el, score };
      }
    }

    if (best) tagElement(best.el, hint);
  }

  for (const hint of sectionHints) {
    if (!hint.sectionId) continue;
    const root = findBySectionId(hint.sectionId, hint.nodeId);
    if (root && !root.hasAttribute('data-ziplofy-node')) {
      tagElement(root, hint);
    }
  }

  for (const hint of hints.filter((h) => h.nodeId.startsWith('layout:') && h.kind === 'section')) {
    const id = hint.nodeId.replace(/^layout:/, '').split(':')[0];
    const root =
      findBySectionId(id, hint.nodeId) ??
      (id === 'footer' ? document.querySelector('footer,[role="contentinfo"]') : null);
    if (root instanceof HTMLElement && !root.hasAttribute('data-ziplofy-node')) {
      tagElement(root, hint);
    }
  }
}

export function findEditableTargetFromPoint(x: number, y: number): HTMLElement | null {
  const stack = document.elementsFromPoint(x, y) as HTMLElement[];
  for (const el of stack) {
    if (el.id === 'ziplofy-preview-selection-root') continue;
    const selfNode = el.getAttribute('data-ziplofy-node');
    if (selfNode) return el;
    const marked = el.closest('[data-ziplofy-node]') as HTMLElement | null;
    if (marked) return marked;
    const semantic = el.closest(TEXT_SELECTOR) as HTMLElement | null;
    if (semantic && semantic !== document.body) return semantic;
    const section = el.closest(SECTION_SELECTOR) as HTMLElement | null;
    if (section && section !== document.body) return section;
  }
  return null;
}

function resolveHintForSectionElement(
  section: HTMLElement,
  hints: ThemePreviewSelectionHint[]
): { nodeId: string; label: string; kind: ThemePreviewSelectionHint['kind'] } | null {
  const markedSectionNode = section.getAttribute('data-ziplofy-node');
  if (markedSectionNode) {
    const hint = hints.find((h) => h.nodeId === markedSectionNode);
    if (hint) return { nodeId: hint.nodeId, label: hint.label, kind: hint.kind };
    return {
      nodeId: markedSectionNode,
      label: section.getAttribute('data-ziplofy-label') ?? 'Section',
      kind: (section.getAttribute('data-ziplofy-kind') as ThemePreviewSelectionHint['kind']) ?? 'section',
    };
  }

  const domSectionId =
    section.getAttribute('data-section-id') ?? section.getAttribute('data-ziplofy-section');
  if (domSectionId) {
    const exactHint = hints.find((h) => h.kind === 'section' && h.sectionId === domSectionId);
    if (exactHint) {
      return { nodeId: exactHint.nodeId, label: exactHint.label, kind: 'section' };
    }
  }

  return null;
}

function resolveHintForText(
  el: HTMLElement,
  text: string,
  hints: ThemePreviewSelectionHint[]
): { nodeId: string; label: string; kind: ThemePreviewSelectionHint['kind'] } | null {
  const candidates = hints.filter((h) => h.matchText && normalizeText(h.matchText) === text);
  if (!candidates.length) return null;
  if (candidates.length === 1) {
    const hint = candidates[0]!;
    return { nodeId: hint.nodeId, label: hint.label, kind: hint.kind };
  }

  const section = el.closest(SECTION_SELECTOR) as HTMLElement | null;
  const domSectionId =
    section?.getAttribute('data-section-id') ?? section?.getAttribute('data-ziplofy-section');
  if (domSectionId) {
    const scoped = candidates.find(
      (h) =>
        h.sectionId === domSectionId ||
        h.fieldPath?.includes(`.sections.${domSectionId}.`) ||
        h.fieldPath?.startsWith(`sections.${domSectionId}.`)
    );
    if (scoped) return { nodeId: scoped.nodeId, label: scoped.label, kind: scoped.kind };
  }

  return null;
}

export function resolveSelectionFromElement(
  el: HTMLElement,
  hints: ThemePreviewSelectionHint[]
): { nodeId: string; label: string; kind: ThemePreviewSelectionHint['kind'] } | null {
  const selfNode = el.getAttribute('data-ziplofy-node');
  if (selfNode) {
    return {
      nodeId: selfNode,
      label: el.getAttribute('data-ziplofy-label') ?? 'Element',
      kind: (el.getAttribute('data-ziplofy-kind') as ThemePreviewSelectionHint['kind']) ?? 'element',
    };
  }

  const containingSection = el.closest(SECTION_SELECTOR) as HTMLElement | null;
  if (containingSection) {
    const fromSection = resolveHintForSectionElement(containingSection, hints);
    if (fromSection && el === containingSection) return fromSection;
  }

  const marked = el.closest('[data-ziplofy-node]') as HTMLElement | null;
  if (marked) {
    const nodeId = marked.getAttribute('data-ziplofy-node');
    if (nodeId) {
      return {
        nodeId,
        label: marked.getAttribute('data-ziplofy-label') ?? 'Element',
        kind: (marked.getAttribute('data-ziplofy-kind') as ThemePreviewSelectionHint['kind']) ?? 'element',
      };
    }
  }

  const text = normalizeText(el.textContent ?? '');
  if (text.length >= 2) {
    const fromText = resolveHintForText(el, text, hints);
    if (fromText) return fromText;
  }

  if (containingSection) {
    const fromSection = resolveHintForSectionElement(containingSection, hints);
    if (fromSection) return fromSection;
  }

  return null;
}

function resolveSectionElementForNodeId(nodeId: string): HTMLElement | null {
  if (nodeId.startsWith('field:')) {
    const marked = document.querySelector(`[data-ziplofy-node="${CSS.escape(nodeId)}"]`);
    return (marked?.closest(SECTION_SELECTOR) as HTMLElement | null) ?? null;
  }

  const instanceId = sectionInstanceIdFromNodeId(nodeId);
  if (instanceId) {
    const byInstance = findBySectionId(instanceId, nodeId);
    if (byInstance) return byInstance;
  }

  if (nodeId.startsWith('layout:')) {
    const layoutKey = nodeId.slice('layout:'.length).split(':')[0];
    if (layoutKey === 'header') {
      return document.querySelector('header,[role="banner"]') as HTMLElement | null;
    }
    if (layoutKey === 'footer' || layoutKey === 'footer_utilities') {
      const footer = document.querySelector('footer,[role="contentinfo"]');
      if (footer) return footer as HTMLElement;
    }
  }

  return null;
}

function scrollTargetForElement(el: HTMLElement): HTMLElement {
  if (el.matches(SECTION_SELECTOR) || el.hasAttribute('data-ziplofy-section')) {
    return el;
  }
  const section = el.closest(SECTION_SELECTOR) as HTMLElement | null;
  return section ?? el;
}

/** Smoothly scroll the preview so the selected sidebar node is visible. */
export function scrollPreviewToNodeId(nodeId: string): boolean {
  const el = findElementForNodeId(nodeId);
  if (!el?.isConnected) return false;

  const target = scrollTargetForElement(el);
  target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  return true;
}

export function findElementForNodeId(nodeId: string): HTMLElement | null {
  const marked = document.querySelector(`[data-ziplofy-node="${CSS.escape(nodeId)}"]`);
  if (marked instanceof HTMLElement) return marked;

  return resolveSectionElementForNodeId(nodeId);
}
