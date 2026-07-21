import { layoutBlueprintKey } from '../../utils/theme-editor-insert-section';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';

export type CodiixEditPlan = {
  path: string;
  fieldType: ThemeEditorFieldType;
  value: string | boolean;
  label: string;
  summary: string;
  /** Select this sidebar node after editing (optional). */
  selectNodeId?: string;
};

export type CodiixEditMatch = {
  mode: 'edit' | 'help' | 'missing';
  answer: string;
  plan?: CodiixEditPlan;
  helpHints?: { id: string; label: string }[];
};

export type CodiixAnnouncementContext = {
  instanceId: string;
  blockId: string;
  nodeId: string;
  blockNodeId: string;
  current: {
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
    enabled: boolean;
    sectionWidth: string;
    font: string;
    fontSize: string;
    fontWeight: string;
    letterSpacing: string;
    textCase: string;
    paddingTop: string;
    paddingBottom: string;
    timeToNext: string;
  };
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s#]/g, ' ')
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

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#ea580c',
  purple: '#7c3aed',
  pink: '#db2777',
  gray: '#6b7280',
  grey: '#6b7280',
  navy: '#1e3a8a',
  teal: '#0d9488',
  brown: '#92400e',
};

function parseColor(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) return t;
  if (COLOR_MAP[t]) return COLOR_MAP[t]!;
  // "color red" / "bg blue"
  for (const [name, hex] of Object.entries(COLOR_MAP)) {
    if (t === name || t.endsWith(` ${name}`) || t.startsWith(`${name} `)) return hex;
  }
  return null;
}

function extractQuotedOrTail(query: string, afterPattern: RegExp): string | null {
  const quoted = query.match(/["“]([^"”]+)["”]/) || query.match(/'([^']+)'/);
  if (quoted?.[1]?.trim()) return quoted[1].trim();

  const m = query.match(afterPattern);
  if (!m?.[1]) return null;
  return m[1].replace(/\s+/g, ' ').trim() || null;
}

function mentionsAnnouncement(query: string): boolean {
  return /\b(announcement(\s+bar)?|annoucement(\s+bar)?|promo\s+bar|top\s+bar)\b/.test(query);
}

function isEdity(query: string): boolean {
  return /\b(change|set|update|edit|make|turn|hide|show|enable|disable|write|put)\b/.test(query);
}

/** Resolve the announcement bar instance from theme config (layout header). */
export function resolveAnnouncementContext(
  config: Record<string, unknown> | null | undefined,
): CodiixAnnouncementContext | null {
  if (!config) return null;
  const sections = (config.sections ?? {}) as Record<string, unknown>;
  const layoutOrder = getNested(config, ['layout_order', 'header']);
  const candidates = Array.isArray(layoutOrder)
    ? layoutOrder.map(String)
    : Object.keys(sections);

  const instanceId = candidates.find((id) => layoutBlueprintKey(id) === 'announcement_bar');
  if (!instanceId || !sections[instanceId]) return null;

  const sec = sections[instanceId] as {
    settings?: Record<string, unknown>;
    blocks?: Record<string, { settings?: Record<string, unknown> }>;
    block_order?: string[];
  };
  const blockId =
    sec.block_order?.[0] ||
    (sec.blocks && Object.keys(sec.blocks)[0]) ||
    'announcement';
  const blockSettings = sec.blocks?.[blockId]?.settings ?? {};
  const settings = sec.settings ?? {};

  const textRaw = String(blockSettings.text ?? settings.message ?? '');
  const link = String(blockSettings.link ?? settings.linkHref ?? '');

  return {
    instanceId,
    blockId,
    nodeId: `layout:${instanceId}`,
    blockNodeId: `layout:${instanceId}:block:${blockId}`,
    current: {
      text: stripHtml(textRaw),
      link,
      backgroundColor: String(settings.backgroundColor ?? ''),
      textColor: String(blockSettings.textColor ?? ''),
      enabled: settings.enabled !== false,
      sectionWidth: String(settings.sectionWidth ?? 'page'),
      font: String(blockSettings.font ?? 'body'),
      fontSize: String(blockSettings.fontSize ?? 'default'),
      fontWeight: String(blockSettings.fontWeight ?? 'default'),
      letterSpacing: String(blockSettings.letterSpacing ?? 'normal'),
      textCase: String(blockSettings.textCase ?? 'default'),
      paddingTop: String(settings.paddingTop ?? '0'),
      paddingBottom: String(settings.paddingBottom ?? '0'),
      timeToNext: String(settings.timeToNext ?? '5'),
    },
  };
}

function sectionPath(ctx: CodiixAnnouncementContext, key: string): string {
  return `sections.${ctx.instanceId}.settings.${key}`;
}

function blockPath(ctx: CodiixAnnouncementContext, key: string): string {
  return `sections.${ctx.instanceId}.blocks.${ctx.blockId}.settings.${key}`;
}

const HELP_HINTS = [
  { id: 'ann-text', label: 'Change announcement text' },
  { id: 'ann-bg', label: 'Change announcement background' },
  { id: 'ann-color', label: 'Change announcement text color' },
  { id: 'ann-hide', label: 'Hide announcement bar' },
  { id: 'ann-show', label: 'Show announcement bar' },
  { id: 'ann-link', label: 'Set announcement link' },
];

/** Match natural-language edits for the announcement bar only. */
export function matchAnnouncementEditCommand(
  raw: string,
  ctx: CodiixAnnouncementContext | null,
): CodiixEditMatch | null {
  const query = normalize(raw);
  if (!query) return null;

  const aboutAnn = mentionsAnnouncement(query);

  // Help / what can I edit
  if (
    aboutAnn &&
    /\b(what can i (edit|change)|how (do i|to) (edit|change)|announcement (settings|options)|edit announcement)\b/.test(
      query,
    )
  ) {
    return {
      mode: 'help',
      answer:
        'I can edit the **Announcement bar** by chat. Try:\n\n' +
        '• **change announcement text to Free shipping today**\n' +
        '• **set announcement background to black**\n' +
        '• **change announcement text color to white**\n' +
        '• **set announcement link to /collections/all**\n' +
        '• **hide announcement bar** / **show announcement bar**\n' +
        '• **make announcement uppercase**\n' +
        '• **set announcement width to full**',
      helpHints: HELP_HINTS,
    };
  }

  if (!aboutAnn || (!isEdity(query) && !/\b(uppercase|lowercase|full width|page width)\b/.test(query))) {
    return null;
  }

  if (!ctx) {
    return {
      mode: 'missing',
      answer:
        'There’s no **Announcement bar** on this theme yet.\n\n' +
        'Add one first (Agentic: **“add announcement bar”**), then tell me what to change.',
    };
  }

  // Hide / show
  if (/\b(hide|disable|turn off)\b/.test(query) && mentionsAnnouncement(query)) {
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, 'enabled'),
        fieldType: 'boolean',
        value: false,
        label: 'Show announcement',
        summary: 'Hiding the announcement bar',
        selectNodeId: ctx.nodeId,
      },
      answer: 'Hiding the **Announcement bar**.',
    };
  }
  if (/\b(show|enable|turn on|unhide)\b/.test(query) && mentionsAnnouncement(query)) {
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, 'enabled'),
        fieldType: 'boolean',
        value: true,
        label: 'Show announcement',
        summary: 'Showing the announcement bar',
        selectNodeId: ctx.nodeId,
      },
      answer: 'Showing the **Announcement bar**.',
    };
  }

  // Uppercase / case
  if (/\b(uppercase|upper case|all caps)\b/.test(query) && mentionsAnnouncement(query)) {
    return {
      mode: 'edit',
      plan: {
        path: blockPath(ctx, 'textCase'),
        fieldType: 'text',
        value: 'uppercase',
        label: 'Case',
        summary: 'Setting announcement text to uppercase',
        selectNodeId: ctx.blockNodeId,
      },
      answer: 'Setting announcement text to **uppercase**.',
    };
  }
  if (/\b(normal case|default case|lowercase|lower case)\b/.test(query) && mentionsAnnouncement(query)) {
    return {
      mode: 'edit',
      plan: {
        path: blockPath(ctx, 'textCase'),
        fieldType: 'text',
        value: 'default',
        label: 'Case',
        summary: 'Resetting announcement text case',
        selectNodeId: ctx.blockNodeId,
      },
      answer: 'Resetting announcement text case to **default**.',
    };
  }

  // Width
  if (/\b(full(\s+width)?|edge[\s-]?to[\s-]?edge)\b/.test(query) && mentionsAnnouncement(query)) {
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, 'sectionWidth'),
        fieldType: 'text',
        value: 'full',
        label: 'Section width',
        summary: 'Setting announcement width to full',
        selectNodeId: ctx.nodeId,
      },
      answer: 'Setting announcement bar width to **full**.',
    };
  }
  if (/\b(page(\s+width)?|contained)\b/.test(query) && mentionsAnnouncement(query) && /\b(width|set|change|make)\b/.test(query)) {
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, 'sectionWidth'),
        fieldType: 'text',
        value: 'page',
        label: 'Section width',
        summary: 'Setting announcement width to page',
        selectNodeId: ctx.nodeId,
      },
      answer: 'Setting announcement bar width to **page**.',
    };
  }

  // Background color
  if (
    /\b(background|bg|back ground)\b/.test(query) &&
    (mentionsAnnouncement(query) || /\bannouncement\b/.test(query))
  ) {
    const colorRaw =
      extractQuotedOrTail(
        query,
        /\b(?:to|as|=)\s+(.+)$/,
      ) ||
      query.match(/\b(?:background|bg)\s+(?:color\s+)?(?:to\s+)?([#a-z0-9]+)\b/)?.[1] ||
      null;
    const color = colorRaw ? parseColor(colorRaw) : null;
    if (!color) {
      return {
        mode: 'help',
        answer:
          'Tell me the color — e.g. **set announcement background to black** or **#111111**.',
        helpHints: HELP_HINTS,
      };
    }
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, 'backgroundColor'),
        fieldType: 'text',
        value: color,
        label: 'Background color',
        summary: `Setting announcement background to ${color}`,
        selectNodeId: ctx.nodeId,
      },
      answer: `Setting announcement background to **${color}**.`,
    };
  }

  // Text color
  if (
    /\b(text\s+color|font\s+color|colour)\b/.test(query) &&
    (mentionsAnnouncement(query) || /\bannouncement\b/.test(query))
  ) {
    const colorRaw = extractQuotedOrTail(query, /\b(?:to|as|=)\s+(.+)$/);
    const color = colorRaw ? parseColor(colorRaw) : null;
    if (!color) {
      return {
        mode: 'help',
        answer:
          'Tell me the text color — e.g. **change announcement text color to white**.',
        helpHints: HELP_HINTS,
      };
    }
    return {
      mode: 'edit',
      plan: {
        path: blockPath(ctx, 'textColor'),
        fieldType: 'text',
        value: color,
        label: 'Text color',
        summary: `Setting announcement text color to ${color}`,
        selectNodeId: ctx.blockNodeId,
      },
      answer: `Setting announcement text color to **${color}**.`,
    };
  }

  // Link
  if (/\blink\b/.test(query) && mentionsAnnouncement(query)) {
    const link =
      extractQuotedOrTail(query, /\b(?:to|as|=)\s+(.+)$/) ||
      query.match(/\bhttps?:\/\/\S+/)?.[0] ||
      query.match(/(\/[a-z0-9\-/_]+)/i)?.[1] ||
      null;
    if (!link || /^(to|as|the|a|an)$/i.test(link)) {
      return {
        mode: 'help',
        answer:
          'Tell me the URL — e.g. **set announcement link to /collections/all**.',
        helpHints: HELP_HINTS,
      };
    }
    return {
      mode: 'edit',
      plan: {
        path: blockPath(ctx, 'link'),
        fieldType: 'text',
        value: link,
        label: 'Link',
        summary: `Setting announcement link to ${link}`,
        selectNodeId: ctx.blockNodeId,
      },
      answer: `Setting announcement link to **${link}**.`,
    };
  }

  // Text / message (most common) — keep after more specific color/link matches
  if (
    /\b(text|message|copy|headline|wording)\b/.test(query) ||
    /\b(change|set|update|edit|write)\s+(the\s+)?announcement\b/.test(query)
  ) {
    // Prefer original casing from the user's message
    const text = (() => {
      const quoted =
        raw.match(/["“]([^"”]+)["”]/)?.[1]?.trim() ||
        raw.match(/'([^']+)'/)?.[1]?.trim();
      if (quoted) return quoted;
      const m = raw.match(/\b(?:to|as|=|:)\s+(.+)$/i);
      return m?.[1]?.replace(/\s+/g, ' ').trim() || null;
    })();

    if (!text || text.length < 1) {
      return {
        mode: 'help',
        answer:
          `Current text: **${ctx.current.text || '(empty)'}**\n\n` +
          'Say e.g. **change announcement text to Free shipping on orders over $50**.',
        helpHints: HELP_HINTS,
      };
    }

    // Avoid treating "to black" as text when they meant color without saying background
    if (parseColor(text) && !/\b(text|message|copy|say|write)\b/.test(query)) {
      return null;
    }

    return {
      mode: 'edit',
      plan: {
        path: blockPath(ctx, 'text'),
        fieldType: 'textarea',
        value: text,
        label: 'Text',
        summary: `Updating announcement text`,
        selectNodeId: ctx.blockNodeId,
      },
      answer: `Updating announcement text to **${text}**.`,
    };
  }

  // Padding shortcuts
  const pad = query.match(
    /\b(?:set|change)\s+(?:announcement\s+)?(?:bar\s+)?(?:padding|top padding|bottom padding)\s+(?:to\s+)?(\d+)\b/,
  );
  if (pad && mentionsAnnouncement(query)) {
    const n = pad[1]!;
    const isBottom = /\bbottom\b/.test(query);
    const key = isBottom ? 'paddingBottom' : 'paddingTop';
    return {
      mode: 'edit',
      plan: {
        path: sectionPath(ctx, key),
        fieldType: 'number',
        value: n,
        label: isBottom ? 'Bottom' : 'Top',
        summary: `Setting announcement ${isBottom ? 'bottom' : 'top'} padding to ${n}`,
        selectNodeId: ctx.nodeId,
      },
      answer: `Setting announcement **${isBottom ? 'bottom' : 'top'} padding** to **${n}**.`,
    };
  }

  if (mentionsAnnouncement(query) && isEdity(query)) {
    return {
      mode: 'help',
      answer:
        'I can edit the announcement bar — try being specific:\n\n' +
        '• **change announcement text to …**\n' +
        '• **set announcement background to black**\n' +
        '• **hide announcement bar**',
      helpHints: HELP_HINTS,
    };
  }

  return null;
}
