/** postMessage contract between Ziplofy theme editor (parent) and render-store preview iframe. */

import {
  previewPageToRoute as registryPreviewPageToRoute,
  PREVIEW_PAGE_ROUTES,
} from '@ziplofy/create-theme/utils/theme-page-registry';

export const PREVIEW_MESSAGE_SOURCE = 'ziplofy-theme-editor' as const;
export const PREVIEW_FRAME_SOURCE = 'ziplofy-theme-preview' as const;

/** Theme template id for preview routing (matches manifest templates). */
export type ThemePreviewPage = string;

export { PREVIEW_PAGE_ROUTES };

export function previewPageToRoute(page: ThemePreviewPage): string {
  return registryPreviewPageToRoute(page);
}

export type ThemePreviewSelectionKind = 'section' | 'block' | 'field' | 'element';

/** Maps rendered DOM nodes to sidebar node ids (built in admin from theme.schema). */
export type ThemePreviewSelectionHint = {
  nodeId: string;
  label: string;
  kind: ThemePreviewSelectionKind;
  /** Match visible text in the preview (fields). */
  matchText?: string;
  /** Match section root by id/class (sections, layout). */
  sectionId?: string;
  /** Dot path for inline edit → sidebar values (field:* nodes). */
  fieldPath?: string;
  fieldType?: 'text' | 'textarea' | 'color' | 'boolean' | 'number';
};

export type ThemePreviewInitPayload = {
  storeId: string;
  storeName?: string;
  /** When omitted, preview uses create-theme composer (no theme.js bundle). */
  jsUrl?: string | null;
  cssUrl?: string | null;
  config: Record<string, unknown>;
  page?: ThemePreviewPage;
  selectionHints?: ThemePreviewSelectionHint[];
  /** When false, preview selection / inspector overlay is off (browse mode). */
  inspectorEnabled?: boolean;
};

export type ThemePreviewConfigPayload = {
  config: Record<string, unknown>;
  selectionHints?: ThemePreviewSelectionHint[];
  /** Sidebar reorder / structure changes — skip preview debounce. */
  immediate?: boolean;
};

export type ThemePreviewPatchPayload = {
  fieldPath: string;
  value: string;
};

export type ThemePreviewSelectPayload = {
  nodeId: string;
  label: string;
  kind: ThemePreviewSelectionKind;
};

export type ThemePreviewHighlightPayload = {
  /** Omit or null to clear preview selection and restore hover. */
  nodeId?: string | null;
};

export type ThemePreviewActionPayload = {
  action: 'hide' | 'duplicate' | 'delete';
  nodeId: string;
};

export type ThemePreviewInsertSectionPayload = {
  afterNodeId?: string;
  beforeNodeId?: string;
};

export type ThemePreviewInsertHighlightPayload = {
  afterNodeId?: string;
  beforeNodeId?: string;
} | null;

export type ParentToPreviewMessage =
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: 'ZIPLOFY_PREVIEW_INIT'; payload: ThemePreviewInitPayload }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: 'ZIPLOFY_PREVIEW_CONFIG'; payload: ThemePreviewConfigPayload }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: 'ZIPLOFY_PREVIEW_SET_PAGE'; payload: { page: ThemePreviewPage } }
  | {
      source: typeof PREVIEW_MESSAGE_SOURCE;
      type: 'ZIPLOFY_PREVIEW_HIGHLIGHT';
      payload: ThemePreviewHighlightPayload;
    }
  | {
      source: typeof PREVIEW_MESSAGE_SOURCE;
      type: 'ZIPLOFY_PREVIEW_INSERT_HIGHLIGHT';
      payload: ThemePreviewInsertHighlightPayload;
    }
  | { source: typeof PREVIEW_MESSAGE_SOURCE; type: 'ZIPLOFY_PREVIEW_PATCH'; payload: ThemePreviewPatchPayload }
  | {
      source: typeof PREVIEW_MESSAGE_SOURCE;
      type: 'ZIPLOFY_PREVIEW_HINTS';
      payload: { selectionHints: ThemePreviewSelectionHint[] };
    }
  | {
      source: typeof PREVIEW_MESSAGE_SOURCE;
      type: 'ZIPLOFY_PREVIEW_INSPECTOR';
      payload: { enabled: boolean };
    };

export type ThemePreviewFieldChangePayload = {
  nodeId: string;
  fieldPath: string;
  value: string;
};

export type PreviewToParentMessage =
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_READY' }
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_LOADED' }
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_ERROR'; payload: { message: string } }
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_SELECT'; payload: ThemePreviewSelectPayload }
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_DESELECT' }
  | { source: typeof PREVIEW_FRAME_SOURCE; type: 'ZIPLOFY_PREVIEW_ACTION'; payload: ThemePreviewActionPayload }
  | {
      source: typeof PREVIEW_FRAME_SOURCE;
      type: 'ZIPLOFY_PREVIEW_FIELD_CHANGE';
      payload: ThemePreviewFieldChangePayload;
    }
  | {
      source: typeof PREVIEW_FRAME_SOURCE;
      type: 'ZIPLOFY_PREVIEW_INSERT_SECTION';
      payload: ThemePreviewInsertSectionPayload;
    };

export function isParentPreviewMessage(data: unknown): data is ParentToPreviewMessage {
  if (!data || typeof data !== 'object') return false;
  const m = data as { source?: string; type?: string };
  return m.source === PREVIEW_MESSAGE_SOURCE && typeof m.type === 'string';
}

export function isPreviewFrameMessage(data: unknown): data is PreviewToParentMessage {
  if (!data || typeof data !== 'object') return false;
  const m = data as { source?: string; type?: string };
  return m.source === PREVIEW_FRAME_SOURCE && typeof m.type === 'string';
}

export function postToParent(message: PreviewToParentMessage, targetOrigin = '*'): void {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage(message, targetOrigin);
}
