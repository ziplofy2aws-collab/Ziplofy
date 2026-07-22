/** Admin theme status + quick-switch helpers for Codiix. */

export type CodiixThemeKind = 'custom' | 'catalog' | 'legacy-custom';

export type CodiixAppliedThemeInfo = {
  name: string;
  kind: CodiixThemeKind;
  kindLabel: string;
  description?: string;
  themeId: string;
};

export type CodiixThemePickOption = {
  id: string;
  label: string;
  kind: CodiixThemeKind;
  kindLabel: string;
  themeId: string;
  /** True when this theme is currently live on the store. */
  live?: boolean;
};

export type CodiixPanelAction = {
  id: string;
  label: string;
  action: 'show-theme-picker' | 'edit-current-theme';
  primary?: boolean;
};

/** Editor URL for the store’s live theme (custom creator vs catalog editor). */
export function themeEditorPathForApplied(info: CodiixAppliedThemeInfo): string {
  if (info.kind === 'custom' || info.kind === 'legacy-custom') {
    return `/themes/create?id=${encodeURIComponent(info.themeId)}`;
  }
  return `/themes/${encodeURIComponent(info.themeId)}/editor`;
}

export function formatEditCurrentThemeAnswer(info: CodiixAppliedThemeInfo): string {
  return (
    `Opening the theme editor for **${info.name}** in a new tab.\n\n` +
    `• Type: **${info.kindLabel}**\n\n` +
    'Edit there, then **Save** and **Apply** when you’re ready. You can keep chatting here.'
  );
}

export function kindLabelForTheme(kind: CodiixThemeKind): string {
  switch (kind) {
    case 'custom':
      return 'Custom theme';
    case 'legacy-custom':
      return 'Custom theme (legacy)';
    default:
      return 'Catalog theme';
  }
}

export function formatAppliedThemeAnswer(info: CodiixAppliedThemeInfo | null): string {
  if (!info) {
    return (
      'No theme is applied on your store right now.\n\n' +
      'Tap **Change theme?** below to pick one from your installed and custom themes, ' +
      'or say **“take me to themes”** to open Online Store → Themes.'
    );
  }

  return (
    `Your store’s live theme is **${info.name}**.\n\n` +
    `• Type: **${info.kindLabel}**\n` +
    (info.description?.trim()
      ? `• About: ${info.description.trim().slice(0, 160)}${info.description.trim().length > 160 ? '…' : ''}\n\n`
      : '\n') +
    'Tap **Edit this theme** to open the editor in a new tab, or **Change theme?** for a quick switch list.'
  );
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s'#?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** “Edit my current theme” / “open theme editor” — action, not FAQ. */
export function matchEditCurrentThemeCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  // Explanatory “how do I edit…” stays on the FAQ intent.
  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain)\b/.test(query) &&
    !/\b(take me|go to|open|edit|customize)\b/.test(query)
  ) {
    return false;
  }
  if (/\b(how (do|does|to)|where (is|are|do)|why|explain)\b/.test(query)) {
    return false;
  }

  if (matchChangeThemeCommand(raw)) return false;

  if (
    /\b(edit|customize|customise|open|launch)\b/.test(query) &&
    /\b(current|live|active|applied|my)\b/.test(query) &&
    /\bthemes?\b/.test(query)
  ) {
    return true;
  }

  if (
    /\b(edit|customize|customise)\b/.test(query) &&
    /\b(theme editor|my theme|this theme|the theme)\b/.test(query)
  ) {
    return true;
  }

  if (/\b(open|launch)\b/.test(query) && /\btheme editor\b/.test(query)) {
    return true;
  }

  return /^(edit theme|edit my theme|customize my theme|customise my theme)\??$/.test(query);
}

/** “Which theme is applied?” / “what’s my live theme?” */
export function matchAppliedThemeCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  if (matchChangeThemeCommand(raw)) return false;
  if (matchEditCurrentThemeCommand(raw)) return false;

  if (
    /\b(which|what|whats|what's|current|live|active|applied)\b/.test(query) &&
    /\bthemes?\b/.test(query)
  ) {
    return true;
  }

  if (/\b(theme (on|for) (my )?store|store'?s? theme|my theme)\b/.test(query)) {
    return true;
  }

  return false;
}

/** “Change theme” / “switch theme” / “apply another theme” */
export function matchChangeThemeCommand(raw: string): boolean {
  const query = normalize(raw);
  if (!query) return false;

  if (
    /\b(how (do|does|to)|what (is|are|does)|where (is|are|do)|why|explain)\b/.test(query) &&
    !/\b(change|switch|apply)\b/.test(query)
  ) {
    return false;
  }

  if (
    /\b(change|switch|swap|replace|update)\b/.test(query) &&
    /\bthemes?\b/.test(query)
  ) {
    return true;
  }

  if (/\b(apply|use)\b/.test(query) && /\b(another|different|new)\b/.test(query) && /\bthemes?\b/.test(query)) {
    return true;
  }

  return /^(change theme|switch theme|change my theme)\??$/.test(query);
}
