import type { EditorFieldDef } from './create-theme-sidebar.types';

export const STORYTELLING_VIDEO_MEDIA_PANEL_GROUP_ORDER = [
  'General',
  'Size',
  'Borders',
  'Padding',
] as const;

const PANEL_GROUPS = new Set<string>(STORYTELLING_VIDEO_MEDIA_PANEL_GROUP_ORDER);

export const STORYTELLING_VIDEO_MEDIA_FIELD_KEYS = new Set([
  'videoUrl',
  'coverImageUrl',
  'videoAutoplay',
  'videoLoop',
  'videoWidth',
  'videoMobileWidth',
  'videoBorderStyle',
  'videoBorderThickness',
  'videoBorderOpacity',
  'videoBorderColor',
  'videoCornerRadius',
  'videoPaddingTop',
  'videoPaddingBottom',
  'videoPaddingLeft',
  'videoPaddingRight',
]);

export function storytellingVideoMediaDefaultSettings(): Record<string, string | number | boolean> {
  return {
    videoUrl: '',
    coverImageUrl: '',
    videoAutoplay: false,
    videoLoop: true,
    videoWidth: 100,
    videoMobileWidth: 100,
    videoBorderStyle: 'none',
    videoBorderThickness: 1,
    videoBorderOpacity: 100,
    videoBorderColor: '',
    videoCornerRadius: 0,
    videoPaddingTop: 0,
    videoPaddingBottom: 0,
    videoPaddingLeft: 0,
    videoPaddingRight: 0,
  };
}

export function storytellingVideoMediaFieldDefs(sectionBase: string): EditorFieldDef[] {
  const s = (key: string) => `${sectionBase}.settings.${key}`;
  return [
    {
      path: s('videoUrl'),
      type: 'text',
      label: 'Video URL',
      group: 'General',
      sidebar: true,
      placeholder: 'Paste a YouTube/Vimeo link or embed URL',
    },
    {
      path: s('coverImageUrl'),
      type: 'text',
      label: 'Cover image',
      group: 'General',
      widget: 'image',
      sidebar: true,
    },
    {
      path: s('videoAutoplay'),
      type: 'boolean',
      label: 'Autoplay',
      description: 'Videos will be muted by default.',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('videoLoop'),
      type: 'boolean',
      label: 'Loop video',
      group: 'General',
      sidebar: true,
    },
    {
      path: s('videoWidth'),
      type: 'number',
      label: 'Width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('videoMobileWidth'),
      type: 'number',
      label: 'Mobile width',
      group: 'Size',
      widget: 'slider',
      min: 1,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('videoBorderStyle'),
      type: 'select',
      label: 'Style',
      group: 'Borders',
      widget: 'segmented',
      sidebar: true,
      options: [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
      ],
    },
    {
      path: s('videoBorderThickness'),
      type: 'number',
      label: 'Thickness',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 10,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('videoBorderOpacity'),
      type: 'number',
      label: 'Opacity',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      sidebar: true,
    },
    {
      path: s('videoBorderColor'),
      type: 'color',
      label: 'Color',
      group: 'Borders',
      widget: 'color',
      sidebar: true,
    },
    {
      path: s('videoCornerRadius'),
      type: 'number',
      label: 'Corner radius',
      group: 'Borders',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('videoPaddingTop'),
      type: 'number',
      label: 'Top',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('videoPaddingBottom'),
      type: 'number',
      label: 'Bottom',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('videoPaddingLeft'),
      type: 'number',
      label: 'Left',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
    {
      path: s('videoPaddingRight'),
      type: 'number',
      label: 'Right',
      group: 'Padding',
      widget: 'slider',
      min: 0,
      max: 100,
      step: 1,
      unit: 'px',
      sidebar: true,
    },
  ];
}

function fieldSortKey(path: string): number {
  const key = path.split('.').pop() ?? '';
  const rank: Record<string, number> = {
    videoUrl: 0,
    coverImageUrl: 1,
    videoAutoplay: 2,
    videoLoop: 3,
    videoWidth: 10,
    videoMobileWidth: 11,
    videoBorderStyle: 20,
    videoBorderThickness: 21,
    videoBorderOpacity: 22,
    videoBorderColor: 23,
    videoCornerRadius: 24,
    videoPaddingTop: 30,
    videoPaddingBottom: 31,
    videoPaddingLeft: 32,
    videoPaddingRight: 33,
  };
  return rank[key] ?? 50;
}

export function isStorytellingVideoMediaPanelField(field: EditorFieldDef): boolean {
  const key = field.path.split('.').pop() ?? '';
  if (!STORYTELLING_VIDEO_MEDIA_FIELD_KEYS.has(key)) return false;
  if (!/storytelling_video/.test(field.path) || field.path.includes('.blocks.')) return false;
  if (!field.group || !PANEL_GROUPS.has(field.group)) return false;
  return true;
}

export function isStorytellingVideoMediaPanelFields(fields: EditorFieldDef[]): boolean {
  if (!fields.length) return false;
  const keys = new Set(fields.map((f) => f.path.split('.').pop() ?? ''));
  const path = fields[0]?.path ?? '';
  return keys.has('videoUrl') && keys.has('videoAutoplay') && path.includes('storytelling_video');
}

export function groupStorytellingVideoMediaPanelFields(
  fields: EditorFieldDef[]
): Map<string, EditorFieldDef[]> {
  const map = new Map<string, EditorFieldDef[]>();
  for (const field of fields.filter(isStorytellingVideoMediaPanelField)) {
    const group = field.group ?? 'General';
    const list = map.get(group) ?? [];
    list.push(field);
    map.set(group, list);
  }
  for (const [group, list] of map) {
    map.set(
      group,
      [...list].sort((a, b) => fieldSortKey(a.path) - fieldSortKey(b.path))
    );
  }
  return map;
}

export const STORYTELLING_VIDEO_MEDIA_DEFAULTS: Record<string, string | boolean> = Object.fromEntries(
  Object.entries(storytellingVideoMediaDefaultSettings()).map(([k, v]) => [
    k,
    typeof v === 'boolean' ? v : String(v),
  ])
) as Record<string, string | boolean>;

function getNested(obj: Record<string, unknown> | null | undefined, path: string[]): unknown {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function extendStorytellingVideoMediaBlockValues(
  values: Record<string, string | boolean>,
  fields: EditorFieldDef[],
  config: Record<string, unknown> | null
): Record<string, string | boolean> {
  const next = { ...values };
  for (const field of fields) {
    if (next[field.path] !== undefined) continue;
    const raw = getNested(config, field.path.split('.'));
    if (raw !== undefined && raw !== null) {
      next[field.path] = field.type === 'boolean' ? Boolean(raw) : String(raw);
      continue;
    }
    const key = field.path.split('.').pop() ?? '';
    const fallback = STORYTELLING_VIDEO_MEDIA_DEFAULTS[key];
    if (fallback !== undefined) next[field.path] = fallback;
  }
  return next;
}
