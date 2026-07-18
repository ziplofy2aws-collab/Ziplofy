import type { ThemePreviewPage } from '../chrome/CreateThemeLivePreview';
import { getElementForSectionType, getCreateThemeElement } from '../registry';
import {
  listKeyFooterSections,
  listKeyHeaderSections,
  listKeyTemplateSections,
  readStructureOrderFromConfig,
  computeSidebarReorderOrder,
} from '../sidebar/create-theme-structure-order';
import { previewPageToTemplateId } from '../utils/page-menu';
import { CODIX_AGENTIC_COMMANDS } from './codiix-elements-catalog';

export type CodiixStructureSection = {
  nodeId: string;
  instanceId: string;
  listKey: string;
  group: 'header' | 'template' | 'footer';
  label: string;
  elementId?: string;
  sectionType?: string;
  aliases: string[];
};

export type CodiixReorderPlan = {
  listKey: string;
  orderedIds: string[];
  moveLabel: string;
  targetLabel: string;
  edge: 'before' | 'after';
};

export type CodiixReorderMatch = {
  mode: 'reorder' | 'suggest' | 'list';
  answer: string;
  plan?: CodiixReorderPlan;
  /** Optional section chips for disambiguation / listing. */
  structureHints?: { id: string; label: string }[];
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getNested(obj: Record<string, unknown>, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function unique(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const n = normalize(v);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function aliasesForElement(elementId: string | undefined, label: string): string[] {
  const el = elementId ? getCreateThemeElement(elementId) : undefined;
  const cmd = elementId
    ? CODIX_AGENTIC_COMMANDS.find((c) => c.elementId === elementId)
    : undefined;
  return unique([
    label,
    el?.label ?? '',
    elementId?.replace(/-/g, ' ') ?? '',
    ...(cmd?.phrases ?? []),
    ...(cmd?.keywords ?? []),
  ]);
}

function sectionMetaFromConfig(
  config: Record<string, unknown>,
  nodeId: string,
): { instanceId: string; sectionType?: string; elementId?: string; label: string } | null {
  if (nodeId.startsWith('layout:')) {
    const instanceId = nodeId.slice('layout:'.length);
    const sec = getNested(config, ['sections', instanceId]) as { type?: string } | undefined;
    const sectionType = sec?.type;
    const element = sectionType ? getElementForSectionType(sectionType) : undefined;
    const label =
      element?.label ??
      instanceId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      instanceId,
      sectionType,
      elementId: element?.id,
      label,
    };
  }

  const m = nodeId.match(/^template:([^:]+):(.+)$/);
  if (!m) return null;
  const [, tplId, instanceId] = m;
  const sec = getNested(config, ['templates', tplId, 'sections', instanceId]) as
    | { type?: string }
    | undefined;
  const sectionType = sec?.type;
  const element = sectionType ? getElementForSectionType(sectionType) : undefined;
  const label =
    element?.label ??
    instanceId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    instanceId,
    sectionType,
    elementId: element?.id,
    label,
  };
}

/** Flat list of reorderable sections on the current page (header / template / footer). */
export function buildCodiixStructure(
  config: Record<string, unknown> | null | undefined,
  previewPage: ThemePreviewPage,
  itemOrder?: Record<string, string[]>,
): CodiixStructureSection[] {
  if (!config) return [];
  const tplId = previewPageToTemplateId(previewPage);
  const order = itemOrder && Object.keys(itemOrder).length
    ? itemOrder
    : readStructureOrderFromConfig(config, previewPage);

  const groups: { listKey: string; group: CodiixStructureSection['group'] }[] = [
    { listKey: listKeyHeaderSections(), group: 'header' },
    { listKey: listKeyTemplateSections(tplId), group: 'template' },
    { listKey: listKeyFooterSections(), group: 'footer' },
  ];

  const out: CodiixStructureSection[] = [];
  for (const { listKey, group } of groups) {
    const ids = order[listKey] ?? [];
    for (const nodeId of ids) {
      const meta = sectionMetaFromConfig(config, nodeId);
      if (!meta) continue;
      out.push({
        nodeId,
        instanceId: meta.instanceId,
        listKey,
        group,
        label: meta.label,
        elementId: meta.elementId,
        sectionType: meta.sectionType,
        aliases: aliasesForElement(meta.elementId, meta.label),
      });
    }
  }
  return out;
}

function scoreSection(query: string, section: CodiixStructureSection): number {
  const q = normalize(query);
  if (!q) return 0;
  let score = 0;
  const label = normalize(section.label);

  for (const alias of section.aliases) {
    if (!alias) continue;
    if (q === alias) score = Math.max(score, 40);
    else if (q.includes(alias) || alias.includes(q)) score = Math.max(score, alias.length >= 4 ? 28 : 16);
  }
  if (q === label) score = Math.max(score, 40);
  else if (label.includes(q) && q.length >= 3) score = Math.max(score, 22);

  if (section.elementId) {
    const idWords = normalize(section.elementId.replace(/-/g, ' '));
    if (q === idWords) score = Math.max(score, 38);
    else if (q.includes(idWords) || idWords.includes(q)) score = Math.max(score, 20);
  }

  return score;
}

function bestSections(
  name: string,
  sections: CodiixStructureSection[],
  minScore = 14,
): CodiixStructureSection[] {
  return sections
    .map((s) => ({ s, score: scoreSection(name, s) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}

function wantsStructureList(query: string): boolean {
  return (
    /\b(what('s| is) on (this|the) page|list (the )?sections|show (me )?(the )?sections|what sections|page structure|current sections)\b/.test(
      query,
    ) || /^(sections|structure)$/.test(query)
  );
}

function hasReorderIntent(query: string): boolean {
  return /\b(move|reorder|put|place|bring|swap)\b/.test(query) &&
    /\b(above|before|below|after|under|over|top|bottom|start|end)\b/.test(query);
}

/** Parse “move contact form above email signup” style commands. */
export function matchReorderCommand(
  raw: string,
  sections: CodiixStructureSection[],
): CodiixReorderMatch | null {
  const query = normalize(raw);
  if (!query) return null;

  if (wantsStructureList(query)) {
    if (!sections.length) {
      return {
        mode: 'list',
        answer:
          'This page doesn’t have any sections I can reorder yet.\n\n' +
          'Add a few sections first (or turn on **Agentic** and say “add hero”).',
      };
    }
    const lines = sections.map((s, i) => `${i + 1}. **${s.label}** (${s.group})`);
    return {
      mode: 'list',
      answer:
        `Here’s what’s on this page right now:\n\n${lines.join('\n')}\n\n` +
        'You can say things like **“move Contact form above Email signup”**.',
      structureHints: sections.slice(0, 8).map((s) => ({
        id: s.nodeId,
        label: s.label,
      })),
    };
  }

  if (!hasReorderIntent(query) && !/\b(move|reorder)\b/.test(query)) {
    return null;
  }

  if (!sections.length) {
    return {
      mode: 'suggest',
      answer:
        'I don’t see any sections to reorder on this page yet.\n\n' +
        'Add sections first, then say e.g. **“move Contact form above Email signup”**.',
    };
  }

  // move X to the top/bottom
  const toEnd = query.match(
    /\b(?:move|put|place|bring)\s+(.+?)\s+to\s+(?:the\s+)?(top|bottom|start|end)\b/,
  );
  if (toEnd) {
    const moveName = toEnd[1].trim();
    const end = toEnd[2];
    const edge: 'before' | 'after' = end === 'top' || end === 'start' ? 'before' : 'after';
    const candidates = bestSections(moveName, sections);
    if (!candidates.length) {
      return {
        mode: 'suggest',
        answer: `I couldn’t find **${moveName}** on this page.\n\nHere are the sections I can move:`,
        structureHints: sections.slice(0, 8).map((s) => ({ id: s.nodeId, label: s.label })),
      };
    }
    const move = candidates[0]!;
    const siblings = sections.filter((s) => s.listKey === move.listKey);
    if (siblings.length < 2) {
      return {
        mode: 'suggest',
        answer: `**${move.label}** is the only section in its group — nothing to reorder there.`,
      };
    }
    const target = edge === 'before' ? siblings[0]! : siblings[siblings.length - 1]!;
    if (move.nodeId === target.nodeId) {
      return {
        mode: 'suggest',
        answer: `**${move.label}** is already at the ${edge === 'before' ? 'top' : 'bottom'}.`,
      };
    }
    const orderedIds = computeSidebarReorderOrder(
      siblings.map((s) => s.nodeId),
      move.nodeId,
      target.nodeId,
      edge,
    );
    if (!orderedIds) {
      return {
        mode: 'suggest',
        answer: `**${move.label}** is already at the ${edge === 'before' ? 'top' : 'bottom'}.`,
      };
    }
    return {
      mode: 'reorder',
      plan: {
        listKey: move.listKey,
        orderedIds,
        moveLabel: move.label,
        targetLabel: target.label,
        edge,
      },
      answer:
        edge === 'before'
          ? `Moving **${move.label}** to the top of ${move.group}.`
          : `Moving **${move.label}** to the bottom of ${move.group}.`,
    };
  }

  const rel = query.match(
    /\b(?:move|put|place|bring|reorder)\s+(.+?)\s+(above|before|below|after|under|over)\s+(.+)$/,
  );
  if (!rel) {
    if (/\b(move|reorder)\b/.test(query)) {
      return {
        mode: 'suggest',
        answer:
          'Tell me which section to move, and where.\n\n' +
          'Examples:\n' +
          '• **move Contact form above Email signup**\n' +
          '• **put Hero below Announcement bar**\n' +
          '• **move FAQ to the top**',
        structureHints: sections.slice(0, 8).map((s) => ({ id: s.nodeId, label: s.label })),
      };
    }
    return null;
  }

  const moveName = rel[1].trim();
  const relation = rel[2];
  const targetName = rel[3]
    .replace(/\b(the|section|element|block)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const edge: 'before' | 'after' =
    relation === 'above' || relation === 'before' || relation === 'over' ? 'before' : 'after';

  const moveHits = bestSections(moveName, sections);
  const targetHits = bestSections(targetName, sections);

  if (!moveHits.length || !targetHits.length) {
    const missing = !moveHits.length ? moveName : targetName;
    return {
      mode: 'suggest',
      answer:
        `I couldn’t find **${missing}** on this page.\n\n` +
        'Here are the sections currently loaded:',
      structureHints: sections.slice(0, 8).map((s) => ({ id: s.nodeId, label: s.label })),
    };
  }

  // Prefer pairs in the same group/listKey.
  let move = moveHits[0]!;
  let target = targetHits[0]!;
  const sameGroupPair = moveHits
    .flatMap((m) => targetHits.filter((t) => t.listKey === m.listKey).map((t) => ({ m, t })))[0];
  if (sameGroupPair) {
    move = sameGroupPair.m;
    target = sameGroupPair.t;
  }

  if (move.nodeId === target.nodeId) {
    return {
      mode: 'suggest',
      answer: 'Those look like the same section — pick two different ones to reorder.',
      structureHints: sections.slice(0, 8).map((s) => ({ id: s.nodeId, label: s.label })),
    };
  }

  if (move.listKey !== target.listKey) {
    return {
      mode: 'suggest',
      answer:
        `I can only reorder within the same group.\n\n` +
        `**${move.label}** is in **${move.group}**, and **${target.label}** is in **${target.group}**.\n` +
        'Header, Template, and Footer stay separate.',
    };
  }

  const siblings = sections.filter((s) => s.listKey === move.listKey).map((s) => s.nodeId);
  const orderedIds = computeSidebarReorderOrder(siblings, move.nodeId, target.nodeId, edge);
  if (!orderedIds) {
    return {
      mode: 'suggest',
      answer:
        edge === 'before'
          ? `**${move.label}** is already above **${target.label}**.`
          : `**${move.label}** is already below **${target.label}**.`,
    };
  }

  return {
    mode: 'reorder',
    plan: {
      listKey: move.listKey,
      orderedIds,
      moveLabel: move.label,
      targetLabel: target.label,
      edge,
    },
    answer:
      edge === 'before'
        ? `Moving **${move.label}** above **${target.label}**.`
        : `Moving **${move.label}** below **${target.label}**.`,
  };
}
