import type { CodiixAgenticAction } from './codiix-elements-catalog';
import type { CodiixPageAction } from './codiix-pages';
import type { CodiixChatForm } from './codiix-chat-form';
import type { CodiixPanelAction, CodiixThemePickOption } from './codiix-admin-themes';

export type CodiixEditorAction = {
  id: string;
  label: string;
  action: 'apply';
};

export type CodiixMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: { id: string; label: string }[];
  actions?: CodiixAgenticAction[];
  relatedActions?: CodiixAgenticAction[];
  relatedCategoryLabel?: string;
  previewElementId?: string;
  pageActions?: CodiixPageAction[];
  editorActions?: CodiixEditorAction[];
  structureHints?: { id: string; label: string }[];
  /** Example announcement-edit chips (tap to draft a command). */
  editHelpHints?: { id: string; label: string }[];
  /** Admin sidebar jump chips / CTAs. */
  adminNavActions?: { id: string; label: string; path: string; primary?: boolean }[];
  /** In-chat form (e.g. create blog). */
  form?: CodiixChatForm;
  /** Panel CTAs (e.g. Change theme?). */
  panelActions?: CodiixPanelAction[];
  /** Quick theme switch list. */
  themePickActions?: CodiixThemePickOption[];
};

export type CodiixSessionScope = 'theme' | 'admin';

/**
 * In-memory Codiix session — survives panel open/close (and remounts)
 * for the lifetime of the page. Cleared automatically on full reload.
 * Theme editor and store admin keep separate conversations.
 */
type CodiixSession = {
  messages: CodiixMessage[];
  agenticMode: boolean;
  draft: string;
  hasIntroduced: boolean;
};

const sessions: Record<CodiixSessionScope, CodiixSession> = {
  theme: {
    messages: [],
    agenticMode: false,
    draft: '',
    hasIntroduced: false,
  },
  admin: {
    messages: [],
    agenticMode: false,
    draft: '',
    hasIntroduced: false,
  },
};

function bag(scope: CodiixSessionScope = 'theme'): CodiixSession {
  return sessions[scope];
}

export function getCodiixSessionMessages(scope: CodiixSessionScope = 'theme'): CodiixMessage[] {
  return bag(scope).messages;
}

export function setCodiixSessionMessages(
  messages: CodiixMessage[],
  scope: CodiixSessionScope = 'theme',
): void {
  bag(scope).messages = messages;
}

export function getCodiixSessionAgenticMode(scope: CodiixSessionScope = 'theme'): boolean {
  return bag(scope).agenticMode;
}

export function setCodiixSessionAgenticMode(
  value: boolean,
  scope: CodiixSessionScope = 'theme',
): void {
  bag(scope).agenticMode = value;
}

export function getCodiixSessionDraft(scope: CodiixSessionScope = 'theme'): string {
  return bag(scope).draft;
}

export function setCodiixSessionDraft(value: string, scope: CodiixSessionScope = 'theme'): void {
  bag(scope).draft = value;
}

export function getCodiixSessionHasIntroduced(scope: CodiixSessionScope = 'theme'): boolean {
  return bag(scope).hasIntroduced;
}

export function setCodiixSessionHasIntroduced(
  value: boolean,
  scope: CodiixSessionScope = 'theme',
): void {
  bag(scope).hasIntroduced = value;
}
