import type { CodiixAgenticAction } from './codiix-elements-catalog';
import type { CodiixPageAction } from './codiix-pages';

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
};

/**
 * In-memory Codiix session — survives panel open/close (and remounts)
 * for the lifetime of the page. Cleared automatically on full reload.
 */
type CodiixSession = {
  messages: CodiixMessage[];
  agenticMode: boolean;
  draft: string;
  hasIntroduced: boolean;
};

const session: CodiixSession = {
  messages: [],
  agenticMode: false,
  draft: '',
  hasIntroduced: false,
};

export function getCodiixSessionMessages(): CodiixMessage[] {
  return session.messages;
}

export function setCodiixSessionMessages(messages: CodiixMessage[]): void {
  session.messages = messages;
}

export function getCodiixSessionAgenticMode(): boolean {
  return session.agenticMode;
}

export function setCodiixSessionAgenticMode(value: boolean): void {
  session.agenticMode = value;
}

export function getCodiixSessionDraft(): string {
  return session.draft;
}

export function setCodiixSessionDraft(value: string): void {
  session.draft = value;
}

export function getCodiixSessionHasIntroduced(): boolean {
  return session.hasIntroduced;
}

export function setCodiixSessionHasIntroduced(value: boolean): void {
  session.hasIntroduced = value;
}
