import type { EditorFieldDef, SidebarNode } from './create-theme-sidebar.types';

const SLIDE_LAYOUT_KEYS = [
  'imageUrl',
  'direction',
  'alignment',
  'position',
  'gap',
  'backgroundColor',
  'mediaOverlay',
  'cornerRadius',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
] as const;

const SLIDE_CONTENT_KEYS = [
  'title',
  'body',
  'buttonLabel',
  'buttonHref',
  'peekVariant',
] as const;

const SLIDE_HEADING_KEYS = [
  'title',
  'headingWidth',
  'headingMaxWidth',
  'headingAlignment',
  'headingTypographyPreset',
  'headingFont',
  'headingFontSize',
  'headingLineHeight',
  'headingLetterSpacing',
  'headingTextCase',
  'headingWrap',
  'headingColor',
  'headingBackgroundEnabled',
  'headingBackgroundColor',
  'headingCornerRadius',
  'headingPaddingTop',
  'headingPaddingBottom',
  'headingPaddingLeft',
  'headingPaddingRight',
] as const;

const SLIDE_TEXT_KEYS = [
  'body',
  'bodyWidth',
  'bodyMaxWidth',
  'bodyAlignment',
  'bodyTypographyPreset',
  'bodyFont',
  'bodyFontSize',
  'bodyLineHeight',
  'bodyLetterSpacing',
  'bodyTextCase',
  'bodyWrap',
  'bodyColor',
  'bodyBackgroundEnabled',
  'bodyBackgroundColor',
  'bodyCornerRadius',
  'bodyPaddingTop',
  'bodyPaddingBottom',
  'bodyPaddingLeft',
  'bodyPaddingRight',
] as const;

const SLIDE_BUTTON_KEYS = [
  'buttonLabel',
  'buttonHref',
  'buttonOpenInNewTab',
  'buttonStyle',
  'buttonLinkTextColor',
  'buttonCustomBackground',
  'buttonCustomText',
  'buttonDesktopWidth',
  'buttonDesktopCustomWidth',
  'buttonMobileWidth',
  'buttonMobileCustomWidth',
] as const;

const SLIDE_DEFAULTS: Record<string, string | boolean | number> = {
  imageUrl: '',
  direction: 'vertical',
  alignment: 'left',
  position: 'top',
  gap: 12,
  backgroundColor: '',
  mediaOverlay: false,
  cornerRadius: 0,
  paddingTop: 40,
  paddingBottom: 40,
  paddingLeft: 36,
  paddingRight: 36,
  title: '',
  body: '',
  buttonLabel: 'Shop now',
  buttonHref: '/collections/all',
  peekVariant: 'figure',
  headingWidth: 'fit',
  headingMaxWidth: 'normal',
  headingAlignment: 'left',
  headingTypographyPreset: 'heading-1',
  headingFont: 'heading',
  headingFontSize: '32px',
  headingLineHeight: 'normal',
  headingLetterSpacing: 'normal',
  headingTextCase: 'default',
  headingWrap: 'pretty',
  headingColor: 'heading',
  headingBackgroundEnabled: false,
  headingBackgroundColor: '#00000026',
  headingCornerRadius: 0,
  headingPaddingTop: 0,
  headingPaddingBottom: 0,
  headingPaddingLeft: 0,
  headingPaddingRight: 0,
  bodyWidth: 'fit',
  bodyMaxWidth: 'normal',
  bodyAlignment: 'left',
  bodyTypographyPreset: 'paragraph',
  bodyFont: 'body',
  bodyFontSize: '16px',
  bodyLineHeight: 'normal',
  bodyLetterSpacing: 'normal',
  bodyTextCase: 'default',
  bodyWrap: 'pretty',
  bodyColor: '#4b5563',
  bodyBackgroundEnabled: false,
  bodyBackgroundColor: '#00000026',
  bodyCornerRadius: 0,
  bodyPaddingTop: 0,
  bodyPaddingBottom: 0,
  bodyPaddingLeft: 0,
  bodyPaddingRight: 0,
  buttonOpenInNewTab: false,
  buttonStyle: 'primary',
  buttonLinkTextColor: '',
  buttonCustomBackground: '#111827',
  buttonCustomText: '#ffffff',
  buttonDesktopWidth: 'fit',
  buttonDesktopCustomWidth: 50,
  buttonMobileWidth: 'fit',
  buttonMobileCustomWidth: 50,
};

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export function isSlideshowSlideBlockField(field: EditorFieldDef): boolean {
  return (
    /\.blocks\.[^.]+\.settings\.(title|body|buttonLabel|buttonHref|imageUrl|peekVariant|direction|alignment|position|gap|backgroundColor|mediaOverlay|cornerRadius|paddingTop|paddingBottom|paddingLeft|paddingRight)$/.test(
      field.path
    ) && field.sidebar !== false
  );
}

export function isSlideshowSlideBlockFieldsOnly(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  return fields.every(isSlideshowSlideBlockField);
}

/** Slide folder under layered / inset / full-frame slideshows. */
export function isSlideshowFamilySlideBlockNodeId(nodeId: string): boolean {
  return (
    (/^template:[^:]+:(?:layered_slideshow|slideshow_inset|slideshow_full_frame)(?:_\d+)?:block:[^:]+$/.test(
      nodeId
    ) ||
      /^layout:(?:layered_slideshow|slideshow_inset|slideshow_full_frame)(?:_\d+)?:block:[^:]+$/.test(
        nodeId
      )) &&
    !/:nested:/.test(nodeId)
  );
}

export function isSlideshowFamilySlideNestedNodeId(
  nodeId: string,
  kind: 'heading' | 'text' | 'button' | 'any' = 'any'
): boolean {
  const suffix =
    kind === 'any'
      ? 'slide_(heading|text|button)'
      : kind === 'heading'
        ? 'slide_heading'
        : kind === 'text'
          ? 'slide_text'
          : 'slide_button';
  return new RegExp(
    `:(?:layered_slideshow|slideshow_inset|slideshow_full_frame)(?:_\\d+)?:block:[^:]+:nested:${suffix}$`
  ).test(nodeId);
}

export function prepareSlideshowSlideBlockSettingsNode(node: SidebarNode): SidebarNode {
  const fields = [...(node.fields ?? [])]
    .map((field) => {
      const key = field.path.split('.').pop() ?? '';
      if (
        key === 'gap' ||
        key === 'cornerRadius' ||
        key.endsWith('CornerRadius') ||
        key.startsWith('padding')
      ) {
        return {
          ...field,
          type: 'number' as const,
          widget: 'slider' as const,
          min: field.min ?? 0,
          max: field.max ?? (key === 'gap' || key.startsWith('padding') ? 100 : 40),
          step: field.step ?? 1,
          unit: field.unit ?? 'px',
        };
      }
      return field;
    })
    .sort((a, b) => {
      const order: Record<string, number> = {
        title: 0,
        body: 1,
        buttonLabel: 2,
        buttonHref: 3,
        imageUrl: 4,
        peekVariant: 5,
        direction: 10,
        alignment: 11,
        position: 12,
        gap: 13,
        backgroundColor: 20,
        mediaOverlay: 21,
        cornerRadius: 22,
        paddingTop: 30,
        paddingBottom: 31,
        paddingLeft: 32,
        paddingRight: 33,
      };
      const ka = order[a.path.split('.').pop() ?? ''] ?? 9;
      const kb = order[b.path.split('.').pop() ?? ''] ?? 9;
      return ka - kb;
    });
  return { ...node, label: 'Slide', kind: 'block', fields };
}

function settingsBaseFromSlideNodeId(nodeId: string): string | null {
  const tpl = nodeId.match(/^template:([^:]+):([^:]+):block:([^:]+)/);
  if (tpl) {
    return `templates.${tpl[1]}.sections.${tpl[2]}.blocks.${tpl[3]}.settings`;
  }
  const layout = nodeId.match(/^layout:([^:]+):block:([^:]+)/);
  if (layout) {
    return `sections.${layout[1]}.blocks.${layout[2]}.settings`;
  }
  return null;
}

/** Seed slide panel values (layout + content) from config, with sensible defaults. */
export function extendValuesForSlideshowSlideBlock(
  values: Record<string, string | boolean>,
  nodeId: string,
  config: Record<string, unknown>
): Record<string, string | boolean> {
  if (!isSlideshowFamilySlideBlockNodeId(nodeId) && !isSlideshowFamilySlideNestedNodeId(nodeId)) {
    return values;
  }
  const base = settingsBaseFromSlideNodeId(nodeId);
  if (!base) return values;

  const keys = isSlideshowFamilySlideNestedNodeId(nodeId, 'heading')
    ? SLIDE_HEADING_KEYS
    : isSlideshowFamilySlideNestedNodeId(nodeId, 'text')
      ? SLIDE_TEXT_KEYS
      : isSlideshowFamilySlideNestedNodeId(nodeId, 'button')
        ? SLIDE_BUTTON_KEYS
        : ([...SLIDE_LAYOUT_KEYS, ...SLIDE_CONTENT_KEYS] as const);

  const next = { ...values };
  let changed = false;
  for (const key of keys) {
    const path = `${base}.${key}`;
    if (next[path] !== undefined) continue;
    const raw = getNested(config, path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[path] = typeof raw === 'boolean' ? raw : String(raw);
      changed = true;
      continue;
    }
    const fallback = SLIDE_DEFAULTS[key];
    if (fallback === undefined) continue;
    next[path] = typeof fallback === 'boolean' ? fallback : String(fallback);
    changed = true;
  }
  return changed ? next : values;
}
