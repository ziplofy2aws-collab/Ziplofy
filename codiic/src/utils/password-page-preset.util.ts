import { applyEmailSignupPreset } from './email-signup-preset.util';
import { creatorTemplateHasSections } from './theme-editor-static-pack';

export const PASSWORD_TEMPLATE_ID = 'password';
export const PASSWORD_MAIN_SECTION_ID = 'password_main';
export const PASSWORD_EMAIL_SIGNUP_SECTION_ID = 'email_signup';

export const PASSWORD_MAIN_BLOCK_ORDER = [
  'logo',
  'text',
  'password_field',
  'primary_button',
] as const;

function defaultPasswordMainBlocks(
  migrated?: {
    title?: string;
    message?: string;
    passwordLabel?: string;
    passwordPlaceholder?: string;
    submitLabel?: string;
    submittingLabel?: string;
  }
): Record<string, unknown> {
  return {
    logo: {
      type: 'logo',
      settings: {
        text: migrated?.title?.trim() || '',
      },
    },
    text: {
      type: 'text',
      settings: {
        message:
          migrated?.message?.trim() ||
          'This store is password protected. Enter the password to continue shopping.',
      },
    },
    password_field: {
      type: 'password',
      settings: {
        label: migrated?.passwordLabel?.trim() || 'Password',
        placeholder: migrated?.passwordPlaceholder?.trim() || 'Enter store password',
      },
    },
    primary_button: {
      type: 'primary-button',
      settings: {
        label: migrated?.submitLabel?.trim() || 'Enter',
        loadingLabel: migrated?.submittingLabel?.trim() || 'Checking…',
      },
    },
  };
}

function defaultPasswordMainSection(): Record<string, unknown> {
  return {
    type: 'password-main',
    enabled: true,
    settings: {},
    blocks: defaultPasswordMainBlocks(),
    block_order: [...PASSWORD_MAIN_BLOCK_ORDER],
  };
}

function readSectionSettings(sec: Record<string, unknown>): Record<string, unknown> {
  return sec.settings && typeof sec.settings === 'object'
    ? (sec.settings as Record<string, unknown>)
    : {};
}

/** Upgrade an existing password_main that still has flat settings / empty blocks. */
export function ensurePasswordMainSectionBlocks(section: Record<string, unknown>): boolean {
  const blocks =
    section.blocks && typeof section.blocks === 'object'
      ? (section.blocks as Record<string, unknown>)
      : {};
  const order = Array.isArray(section.block_order)
    ? (section.block_order as unknown[]).map(String)
    : [];
  const hasLogo = Boolean(blocks.logo);
  const hasAll =
    hasLogo &&
    Boolean(blocks.text) &&
    Boolean(blocks.password_field) &&
    Boolean(blocks.primary_button) &&
    PASSWORD_MAIN_BLOCK_ORDER.every((id) => order.includes(id));

  if (hasAll) return false;

  const settings = readSectionSettings(section);
  section.blocks = defaultPasswordMainBlocks({
    title: typeof settings.title === 'string' ? settings.title : undefined,
    message: typeof settings.message === 'string' ? settings.message : undefined,
    passwordLabel: typeof settings.passwordLabel === 'string' ? settings.passwordLabel : undefined,
    passwordPlaceholder:
      typeof settings.passwordPlaceholder === 'string' ? settings.passwordPlaceholder : undefined,
    submitLabel: typeof settings.submitLabel === 'string' ? settings.submitLabel : undefined,
    submittingLabel:
      typeof settings.submittingLabel === 'string' ? settings.submittingLabel : undefined,
  });
  section.block_order = [...PASSWORD_MAIN_BLOCK_ORDER];
  // Drop obsolete eyebrow + migrate flat settings off the section shell.
  const nextSettings = { ...settings };
  delete nextSettings.eyebrow;
  delete nextSettings.title;
  delete nextSettings.message;
  delete nextSettings.passwordLabel;
  delete nextSettings.passwordPlaceholder;
  delete nextSettings.submitLabel;
  delete nextSettings.submittingLabel;
  section.settings = nextSettings;
  return true;
}

function defaultPasswordEmailSignupSection(): Record<string, unknown> {
  const section: Record<string, unknown> = {
    type: 'email-signup',
    enabled: true,
    settings: {},
    blocks: {},
    block_order: [],
  };
  applyEmailSignupPreset(section);
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.title = 'Get notified';
  settings.subtitle = 'Leave your email and we will let you know when we open.';
  settings.paddingTop = 8;
  settings.paddingBottom = 48;
  section.settings = settings;
  return section;
}

/** Seed / upgrade store password-protection page: gate form + email signup. */
export function ensurePasswordPageTemplateBlocks(config: Record<string, unknown>): boolean {
  if (!config.templates || typeof config.templates !== 'object') {
    config.templates = {};
  }
  const templates = config.templates as Record<string, Record<string, unknown>>;
  let changed = false;

  if (!creatorTemplateHasSections(config, PASSWORD_TEMPLATE_ID)) {
    templates[PASSWORD_TEMPLATE_ID] = {
      name: 'Password',
      sections: {
        [PASSWORD_MAIN_SECTION_ID]: defaultPasswordMainSection(),
        [PASSWORD_EMAIL_SIGNUP_SECTION_ID]: defaultPasswordEmailSignupSection(),
      },
      section_order: [PASSWORD_MAIN_SECTION_ID, PASSWORD_EMAIL_SIGNUP_SECTION_ID],
    };
    return true;
  }

  const tpl = templates[PASSWORD_TEMPLATE_ID];
  if (!tpl.sections || typeof tpl.sections !== 'object') {
    tpl.sections = {};
    changed = true;
  }
  const sections = tpl.sections as Record<string, Record<string, unknown>>;

  if (!sections[PASSWORD_MAIN_SECTION_ID]) {
    sections[PASSWORD_MAIN_SECTION_ID] = defaultPasswordMainSection();
    changed = true;
  } else if (ensurePasswordMainSectionBlocks(sections[PASSWORD_MAIN_SECTION_ID]!)) {
    changed = true;
  }

  if (!sections[PASSWORD_EMAIL_SIGNUP_SECTION_ID]) {
    sections[PASSWORD_EMAIL_SIGNUP_SECTION_ID] = defaultPasswordEmailSignupSection();
    changed = true;
  }

  if (!Array.isArray(tpl.section_order) || !(tpl.section_order as unknown[]).length) {
    tpl.section_order = [PASSWORD_MAIN_SECTION_ID, PASSWORD_EMAIL_SIGNUP_SECTION_ID];
    changed = true;
  }

  return changed;
}
