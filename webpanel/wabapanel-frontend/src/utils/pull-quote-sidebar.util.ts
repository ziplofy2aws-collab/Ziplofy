import type { EditorFieldDef, SidebarIcon, SidebarNode } from '../create-theme/sidebar/create-theme-sidebar.types';

export const PULL_QUOTE_SECTION_BLOCK_ORDER = ['text', 'button'] as const;

export type PullQuoteBlockKind = (typeof PULL_QUOTE_SECTION_BLOCK_ORDER)[number];

const BLOCK_LABELS: Record<PullQuoteBlockKind, string> = {
  text: 'Text',
  button: 'Button',
};

function previewFromValues(
  values: Record<string, string | boolean>,
  path: string
): string | undefined {
  const raw = values[path];
  if (raw === undefined || raw === null || raw === '') return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

function reorderSidebarChildren(
  children: SidebarNode[],
  listKey: string,
  itemOrder: Record<string, string[]>
): SidebarNode[] {
  const order = itemOrder[listKey];
  if (!order?.length) return children;
  const byId = new Map(children.map((c) => [c.id, c]));
  const out: SidebarNode[] = [];
  for (const id of order) {
    const node = byId.get(id);
    if (node) out.push(node);
  }
  for (const c of children) {
    if (!order.includes(c.id)) out.push(c);
  }
  return out;
}

function blockIcon(kind: PullQuoteBlockKind): SidebarIcon {
  return kind === 'button' ? 'button' : 'text';
}

/** Field defs backing a Pull quote block panel (Content-first, Shopify layout). */
export function pullQuoteBlockFieldDefs(
  sectionBase: string,
  kind: PullQuoteBlockKind
): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  if (kind === 'text') {
    return [
      {
        path: s('quote'),
        type: 'textarea',
        label: 'Text',
        widget: 'richtext',
        group: 'Content',
        sidebar: true,
      },
      {
        path: s('quoteWidth'),
        type: 'select',
        label: 'Width',
        group: 'Layout',
        widget: 'segmented',
        options: [
          { value: 'fit', label: 'Fit' },
          { value: 'fill', label: 'Fill' },
        ],
      },
      {
        path: s('quoteMaxWidth'),
        type: 'select',
        label: 'Max width',
        group: 'Layout',
        widget: 'select-inline',
        options: [
          { value: 'narrow', label: 'Narrow' },
          { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Wide' },
        ],
      },
      {
        path: s('quoteAlignment'),
        type: 'select',
        label: 'Alignment',
        group: 'Layout',
        widget: 'segmented',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      {
        path: s('quoteTypographyPreset'),
        type: 'select',
        label: 'Preset',
        group: 'Typography',
        widget: 'select-inline',
        description: 'Edit presets in theme settings',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'heading-1', label: 'Heading 1' },
          { value: 'heading-2', label: 'Heading 2' },
          { value: 'heading-3', label: 'Heading 3' },
          { value: 'heading-4', label: 'Heading 4' },
          { value: 'heading-5', label: 'Heading 5' },
          { value: 'heading-6', label: 'Heading 6' },
          { value: 'custom', label: 'Custom' },
        ],
      },
      {
        path: s('quoteFont'),
        type: 'select',
        label: 'Font',
        group: 'Typography',
        widget: 'select',
        options: [
          { value: 'body', label: 'Body' },
          { value: 'subheading', label: 'Subheading' },
          { value: 'heading', label: 'Heading' },
          { value: 'accent', label: 'Accent' },
        ],
      },
      {
        path: s('quoteFontSize'),
        type: 'select',
        label: 'Size',
        group: 'Typography',
        widget: 'select',
        options: [
          '10px',
          '12px',
          '14px',
          '16px',
          '18px',
          '20px',
          '24px',
          '28px',
          '32px',
          '36px',
          '40px',
          '48px',
          '56px',
          '64px',
          '72px',
        ].map((value) => ({ value, label: value })),
      },
      {
        path: s('quoteLineHeight'),
        type: 'select',
        label: 'Line height',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Loose' },
        ],
      },
      {
        path: s('quoteLetterSpacing'),
        type: 'select',
        label: 'Letter spacing',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'loose', label: 'Loose' },
        ],
      },
      {
        path: s('quoteTextCase'),
        type: 'select',
        label: 'Case',
        group: 'Typography',
        widget: 'segmented',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'uppercase', label: 'Uppercase' },
        ],
      },
      {
        path: s('quoteWrap'),
        type: 'select',
        label: 'Wrap',
        group: 'Typography',
        widget: 'select',
        options: [
          { value: 'pretty', label: 'Pretty' },
          { value: 'balance', label: 'Balance' },
          { value: 'nowrap', label: 'No wrap' },
        ],
      },
      {
        path: s('quoteColor'),
        type: 'color',
        label: 'Text color',
        group: 'Appearance',
        widget: 'color',
      },
      {
        path: s('quoteBackgroundEnabled'),
        type: 'boolean',
        label: 'Background',
        group: 'Appearance',
      },
      {
        path: s('quoteBackgroundColor'),
        type: 'color',
        label: 'Background color',
        group: 'Appearance',
        widget: 'color',
      },
      {
        path: s('quotePaddingTop'),
        type: 'number',
        label: 'Top',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('quotePaddingBottom'),
        type: 'number',
        label: 'Bottom',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('quotePaddingLeft'),
        type: 'number',
        label: 'Left',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
      {
        path: s('quotePaddingRight'),
        type: 'number',
        label: 'Right',
        group: 'Padding',
        widget: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
      },
    ];
  }
  return [
    {
      path: s('linkLabel'),
      type: 'text',
      label: 'Label',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('linkUrl'),
      type: 'text',
      label: 'Link',
      group: 'Content',
      widget: 'link',
      sidebar: true,
    },
    {
      path: s('linkOpenInNewTab'),
      type: 'boolean',
      label: 'Open link in new tab',
      group: 'Content',
      sidebar: true,
    },
    {
      path: s('buttonStyle'),
      type: 'select',
      label: 'Style',
      group: 'Content',
      widget: 'select',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'link', label: 'Link' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonLinkTextColor'),
      type: 'color',
      label: 'Link text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonCustomBackground'),
      type: 'color',
      label: 'Background',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonCustomText'),
      type: 'color',
      label: 'Text color',
      group: 'Content',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('buttonDesktopWidth'),
      type: 'select',
      label: 'Desktop width',
      group: 'Size',
      widget: 'segmented',
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonDesktopCustomWidth'),
      type: 'number',
      label: 'Desktop custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('buttonMobileWidth'),
      type: 'select',
      label: 'Mobile width',
      group: 'Size',
      widget: 'segmented',
      options: [
        { value: 'fit', label: 'Fit' },
        { value: 'custom', label: 'Custom' },
      ],
      sidebar: true,
    },
    {
      path: s('buttonMobileCustomWidth'),
      type: 'number',
      label: 'Mobile custom width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
  ];
}

/** True when the given block fields are the Pull quote Button block. */
export function isPullQuoteButtonPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('linkLabel') && keys.has('buttonStyle') && path.includes('pull_quote');
}

/** True when the given block fields are the Pull quote Text block. */
export function isPullQuoteTextPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return (
    path.includes('pull_quote') &&
    (keys.has('quote') || keys.has('quoteWidth') || keys.has('quoteTypographyPreset'))
  );
}

export function isPullQuoteSectionInstanceId(secId: string): boolean {
  return secId.includes('pull_quote');
}

export function pullQuoteSectionBaseFromBlockNodeId(nodeId: string): string | null {
  const layout = nodeId.match(/^layout:(.+):block:(?:text|button)$/);
  if (layout) {
    const secId = layout[1]!;
    if (!isPullQuoteSectionInstanceId(secId)) return null;
    return `sections.${secId}`;
  }
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:(?:text|button)$/);
  if (tpl) {
    const secId = tpl[2]!;
    if (!isPullQuoteSectionInstanceId(secId)) return null;
    return `templates.${tpl[1]}.sections.${secId}`;
  }
  return null;
}

export function isPullQuoteTextBlockNodeId(nodeId: string): boolean {
  return /:block:text$/.test(nodeId) && pullQuoteSectionBaseFromBlockNodeId(nodeId) !== null;
}

export function isPullQuoteButtonBlockNodeId(nodeId: string): boolean {
  return /:block:button$/.test(nodeId) && pullQuoteSectionBaseFromBlockNodeId(nodeId) !== null;
}

export function preparePullQuoteTextBlockSettingsNode(node: SidebarNode): SidebarNode {
  const sectionBase = pullQuoteSectionBaseFromBlockNodeId(node.id);
  const fields = sectionBase
    ? pullQuoteBlockFieldDefs(sectionBase, 'text')
    : (node.fields ?? []).filter((f) => {
        const key = f.path.split('.').pop() ?? '';
        return key === 'quote' || key.startsWith('quote');
      });
  return { ...node, label: 'Text', kind: 'block', fields };
}

export function preparePullQuoteButtonBlockSettingsNode(node: SidebarNode): SidebarNode {
  const sectionBase = pullQuoteSectionBaseFromBlockNodeId(node.id);
  const fields = sectionBase
    ? pullQuoteBlockFieldDefs(sectionBase, 'button')
    : (node.fields ?? []).filter((f) => {
        const key = f.path.split('.').pop() ?? '';
        return (
          key === 'linkLabel' ||
          key === 'linkUrl' ||
          key === 'linkOpenInNewTab' ||
          key.startsWith('button')
        );
      });
  return { ...node, label: 'Button', kind: 'block', fields };
}

function pullQuoteBlockNode(
  prefix: string,
  sectionBase: string,
  kind: PullQuoteBlockKind,
  values: Record<string, string | boolean>
): SidebarNode {
  const settingsBase = `${sectionBase}.settings`;
  const previewPath = kind === 'text' ? `${settingsBase}.quote` : null;
  const preview = previewPath ? previewFromValues(values, previewPath) : undefined;

  return {
    id: `${prefix}:block:${kind}`,
    label: BLOCK_LABELS[kind],
    kind: 'block',
    icon: blockIcon(kind),
    fields: pullQuoteBlockFieldDefs(sectionBase, kind),
    preview,
    showVisibilityToggle: false,
    showDeleteButton: false,
  };
}

/** Shopify Pull quote sidebar: Add block → Text → Button (settings-backed). */
export function mapPullQuoteBlockNodes(
  prefix: string,
  sectionBase: string,
  values: Record<string, string | boolean>,
  itemOrder: Record<string, string[]>,
  sectionChildrenListKey: string
): SidebarNode[] {
  const blockNodes = PULL_QUOTE_SECTION_BLOCK_ORDER.map((kind) =>
    pullQuoteBlockNode(prefix, sectionBase, kind, values)
  );
  const addBlock: SidebarNode = { id: `${prefix}:add-block`, label: 'Add block', kind: 'add-block' };
  return reorderSidebarChildren([addBlock, ...blockNodes], sectionChildrenListKey, itemOrder);
}

export function pullQuoteStructureOrder(
  prefix: string,
  sectionChildrenListKey: string
): Record<string, string[]> {
  return {
    [sectionChildrenListKey]: [
      `${prefix}:add-block`,
      ...PULL_QUOTE_SECTION_BLOCK_ORDER.map((kind) => `${prefix}:block:${kind}`),
    ],
  };
}
