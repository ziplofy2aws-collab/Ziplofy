import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PreviewLoadingOverlay } from './PreviewStatus';

const EDITOR_SOURCE = 'ziplofy-theme-editor';
const FRAME_SOURCE = 'ziplofy-theme-preview';

/** Config is debounced upstream; post to iframe soon after it lands. */
const PREVIEW_CONFIG_POST_MS = 40;

function hintsPostKey(hints: ThemePreviewSelectionHint[]): string {
  return hints
    .map((h) => `${h.nodeId}:${(h.matchText ?? '').slice(0, 96)}`)
    .sort()
    .join('|');
}

/** Theme template id used for editor preview routing (e.g. index, product, cart, login). */
export type ThemePreviewPage = string;

export type ThemePreviewSelectPayload = {
  nodeId: string;
  label: string;
  kind: 'section' | 'block' | 'field' | 'element';
};

export type ThemePreviewSelectionHint = {
  nodeId: string;
  label: string;
  kind: ThemePreviewSelectPayload['kind'];
  matchText?: string;
  sectionId?: string;
  fieldPath?: string;
  fieldType?: 'text' | 'textarea' | 'color' | 'boolean' | 'number';
};

export type CreateThemeLivePreviewProps = {
  storeId: string;
  storeName?: string;
  /** Live storefront URL for "View store" links only — never used as iframe src. */
  storefrontOrigin?: string | null;
  jsUrl: string | null | undefined;
  cssUrl?: string | null;
  config: Record<string, unknown>;
  page?: ThemePreviewPage;
  selectionHints?: ThemePreviewSelectionHint[];
  onPreviewSelect?: (payload: ThemePreviewSelectPayload) => void;
  /** Preview clicked empty canvas or cleared selection in iframe. */
  onPreviewDeselect?: () => void;
  onPreviewFieldChange?: (fieldPath: string, value: string, nodeId: string) => void;
  onPreviewAction?: (action: 'hide' | 'duplicate' | 'delete', nodeId: string) => void;
  onPreviewInsertSection?: (payload: { afterNodeId?: string; beforeNodeId?: string }) => void;
  insertHoverHighlight?: { afterNodeId?: string; beforeNodeId?: string } | null;
  highlightNodeId?: string | null;
  /** Theme inspector: click sections/blocks in preview to select and edit. */
  inspectorEnabled?: boolean;
  /** Bumped on sidebar structure reorder — posts config to iframe immediately. */
  structureSyncKey?: number;
  className?: string;
};

const DEFAULT_RENDER_STORE_PORT = '5180';

function readEnvOrigin(...keys: string[]): string | null {
  for (const key of keys) {
    const raw = import.meta.env[key] as string | undefined;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().replace(/\/$/, '');
    }
  }
  return null;
}

/**
 * Origin for the preview iframe (render-store `/theme-preview`).
 * Must NOT be a merchant store subdomain — those send X-Frame-Options: SAMEORIGIN.
 */
export function resolveThemePreviewOrigin(): string {
  const explicit = readEnvOrigin('VITE_RENDER_STORE_ORIGIN', 'VITE_THEME_PREVIEW_ORIGIN');
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
      return `${protocol}//localhost:${DEFAULT_RENDER_STORE_PORT}`;
    }

    // Production admin on ziplofy.com → dedicated preview host (same render-store app, embeddable headers).
    if (hostname === 'admin.ziplofy.com' || hostname === 'dashboard.ziplofy.com') {
      return `${protocol}//preview.ziplofy.com`;
    }

    if (hostname.endsWith('.ziplofy.com')) {
      return `${protocol}//preview.ziplofy.com`;
    }
  }

  return `http://localhost:${DEFAULT_RENDER_STORE_PORT}`;
}

function buildPreviewSrc(): string {
  return `${resolveThemePreviewOrigin()}/theme-preview`;
}

const CreateThemeLivePreviewInner: React.FC<CreateThemeLivePreviewProps> = ({
  storeId,
  storeName,
  storefrontOrigin: _storefrontOrigin,
  jsUrl,
  cssUrl,
  config,
  page = 'index',
  selectionHints = [],
  onPreviewSelect,
  onPreviewDeselect,
  onPreviewFieldChange,
  onPreviewAction,
  onPreviewInsertSection,
  insertHoverHighlight = null,
  highlightNodeId,
  inspectorEnabled = true,
  structureSyncKey = 0,
  className = '',
}) => {
  const previewSrc = buildPreviewSrc();
  const previewOrigin = resolveThemePreviewOrigin();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initSentRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;
  const selectionHintsRef = useRef(selectionHints);
  selectionHintsRef.current = selectionHints;
  const onPreviewSelectRef = useRef(onPreviewSelect);
  onPreviewSelectRef.current = onPreviewSelect;
  const onPreviewDeselectRef = useRef(onPreviewDeselect);
  onPreviewDeselectRef.current = onPreviewDeselect;
  const onPreviewActionRef = useRef(onPreviewAction);
  onPreviewActionRef.current = onPreviewAction;
  const onPreviewInsertSectionRef = useRef(onPreviewInsertSection);
  onPreviewInsertSectionRef.current = onPreviewInsertSection;
  const onPreviewFieldChangeRef = useRef(onPreviewFieldChange);
  onPreviewFieldChangeRef.current = onPreviewFieldChange;
  const lastPostedConfigRef = useRef('');
  const lastPostedHintsKeyRef = useRef('');
  const configPostTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hintsPostTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const highlightRafRef = useRef(0);
  const inspectorEnabledRef = useRef(inspectorEnabled);
  inspectorEnabledRef.current = inspectorEnabled;
  /** Stable key so we only re-sync when config content changes, not object identity. */
  const configStableKey = useMemo(() => {
    try {
      return JSON.stringify(config);
    } catch {
      return '';
    }
  }, [config]);

  const hintsPostKeyMemo = useMemo(() => hintsPostKey(selectionHints), [selectionHints]);

  const postPatch = useCallback((fieldPath: string, value: string) => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !initSentRef.current) return;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'ZIPLOFY_PREVIEW_PATCH',
        payload: { fieldPath, value },
      },
      '*'
    );
  }, []);

  /** INIT only when runtime identity changes — never on every config keystroke. */
  const postInit = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !storeId) return;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'ZIPLOFY_PREVIEW_INIT',
        payload: {
          storeId,
          storeName,
          jsUrl: jsUrl ?? null,
          cssUrl: cssUrl ?? null,
          config: configRef.current,
          page,
          selectionHints: selectionHintsRef.current,
          inspectorEnabled: inspectorEnabledRef.current,
        },
      },
      '*'
    );
    initSentRef.current = true;
  }, [storeId, storeName, jsUrl, cssUrl, page]);

  const postInspectorState = useCallback((enabled: boolean) => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !initSentRef.current) return;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'ZIPLOFY_PREVIEW_INSPECTOR',
        payload: { enabled },
      },
      '*'
    );
  }, []);

  const postConfigNow = useCallback((immediate = false) => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !initSentRef.current) return;
    const json = JSON.stringify(configRef.current);
    if (!immediate && json === lastPostedConfigRef.current) return;
    lastPostedConfigRef.current = json;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'ZIPLOFY_PREVIEW_CONFIG',
        payload: { config: configRef.current, immediate },
      },
      '*'
    );
  }, []);

  const schedulePostConfig = useCallback(
    (immediate = false) => {
      if (configPostTimerRef.current !== undefined) {
        window.clearTimeout(configPostTimerRef.current);
        configPostTimerRef.current = undefined;
      }

      const json = JSON.stringify(configRef.current);
      if (!immediate && json === lastPostedConfigRef.current) {
        return;
      }

      const delay = immediate ? 0 : PREVIEW_CONFIG_POST_MS;
      configPostTimerRef.current = window.setTimeout(() => {
        configPostTimerRef.current = undefined;
        postConfigNow(immediate);
      }, delay);
    },
    [postConfigNow]
  );

  const postSelectionHints = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !initSentRef.current || !selectionHintsRef.current.length) return;
    const key = hintsPostKey(selectionHintsRef.current);
    if (key === lastPostedHintsKeyRef.current) return;
    lastPostedHintsKeyRef.current = key;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'ZIPLOFY_PREVIEW_HINTS',
        payload: { selectionHints: selectionHintsRef.current },
      },
      '*'
    );
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as {
        source?: string;
        type?: string;
        payload?: {
          message?: string;
          nodeId?: string;
          label?: string;
          kind?: ThemePreviewSelectPayload['kind'];
          action?: 'hide' | 'duplicate' | 'delete';
          fieldPath?: string;
          value?: string;
        };
      };
      if (data?.source !== FRAME_SOURCE) return;
      if (data.type === 'ZIPLOFY_PREVIEW_READY') {
        setReady(true);
        setLoadError(null);
        postInit();
      }
      if (data.type === 'ZIPLOFY_PREVIEW_LOADED') {
        setReady(true);
        setLoadError(null);
      }
      if (data.type === 'ZIPLOFY_PREVIEW_ERROR') {
        setLoadError(data.payload?.message ?? 'Preview failed to load');
      }
      if (data.type === 'ZIPLOFY_PREVIEW_DESELECT') {
        onPreviewDeselectRef.current?.();
      }
      if (data.type === 'ZIPLOFY_PREVIEW_SELECT' && data.payload?.nodeId) {
        onPreviewSelectRef.current?.({
          nodeId: data.payload.nodeId,
          label: data.payload.label ?? 'Element',
          kind: data.payload.kind ?? 'element',
        });
      }
      if (data.type === 'ZIPLOFY_PREVIEW_ACTION' && data.payload?.nodeId && data.payload.action) {
        onPreviewActionRef.current?.(data.payload.action, data.payload.nodeId);
      }
      if (data.type === 'ZIPLOFY_PREVIEW_FIELD_CHANGE' && data.payload?.fieldPath) {
        const fieldPath = data.payload.fieldPath;
        const value = data.payload.value ?? '';
        onPreviewFieldChangeRef.current?.(fieldPath, value, data.payload.nodeId ?? '');
        postPatch(fieldPath, value);
      }
      if (
        data.type === 'ZIPLOFY_PREVIEW_INSERT_SECTION' &&
        (data.payload?.afterNodeId || data.payload?.beforeNodeId)
      ) {
        onPreviewInsertSectionRef.current?.(data.payload);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [postInit, postPatch]);

  useEffect(() => {
    if (!ready || !initSentRef.current) return;
    schedulePostConfig();
    return () => {
      if (configPostTimerRef.current !== undefined) {
        window.clearTimeout(configPostTimerRef.current);
        configPostTimerRef.current = undefined;
      }
    };
  }, [configStableKey, ready, schedulePostConfig]);

  useEffect(() => {
    if (!ready || !initSentRef.current || structureSyncKey < 1) return;
    schedulePostConfig(true);
  }, [structureSyncKey, ready, schedulePostConfig]);

  useEffect(() => {
    if (!ready || !initSentRef.current) return;
    if (hintsPostTimerRef.current !== undefined) {
      window.clearTimeout(hintsPostTimerRef.current);
    }
    hintsPostTimerRef.current = window.setTimeout(() => {
      hintsPostTimerRef.current = undefined;
      postSelectionHints();
    }, 200);
    return () => {
      if (hintsPostTimerRef.current !== undefined) {
        window.clearTimeout(hintsPostTimerRef.current);
      }
    };
  }, [ready, hintsPostKeyMemo, postSelectionHints]);

  useEffect(() => {
    if (!ready) return;
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage(
      { source: EDITOR_SOURCE, type: 'ZIPLOFY_PREVIEW_SET_PAGE', payload: { page } },
      '*'
    );
  }, [page, ready]);

  useEffect(() => {
    if (!ready) return;
    if (highlightRafRef.current) cancelAnimationFrame(highlightRafRef.current);
    highlightRafRef.current = requestAnimationFrame(() => {
      highlightRafRef.current = 0;
      const frame = iframeRef.current?.contentWindow;
      if (!frame) return;
      frame.postMessage(
        {
          source: EDITOR_SOURCE,
          type: 'ZIPLOFY_PREVIEW_HIGHLIGHT',
          payload: { nodeId: highlightNodeId ?? null },
        },
        '*'
      );
    });
    return () => {
      if (highlightRafRef.current) cancelAnimationFrame(highlightRafRef.current);
    };
  }, [highlightNodeId, ready]);

  useEffect(() => {
    if (!ready) return;
    postInspectorState(inspectorEnabled);
  }, [inspectorEnabled, ready, postInspectorState]);

  useEffect(() => {
    if (!ready) return;
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    const payload = insertHoverHighlight
      ? {
          afterNodeId: insertHoverHighlight.afterNodeId,
          beforeNodeId: insertHoverHighlight.beforeNodeId,
        }
      : null;
    frame.postMessage(
      { source: EDITOR_SOURCE, type: 'ZIPLOFY_PREVIEW_INSERT_HIGHLIGHT', payload },
      '*'
    );
  }, [insertHoverHighlight, ready]);

  /** Reset iframe handshake only when preview origin/store changes — not on page switch. */
  useEffect(() => {
    initSentRef.current = false;
    setReady(false);
    lastPostedConfigRef.current = '';
    lastPostedHintsKeyRef.current = '';
    return () => {
      if (highlightRafRef.current) cancelAnimationFrame(highlightRafRef.current);
      if (configPostTimerRef.current !== undefined) window.clearTimeout(configPostTimerRef.current);
      if (hintsPostTimerRef.current !== undefined) window.clearTimeout(hintsPostTimerRef.current);
    };
  }, [storeId, previewSrc]);

  useEffect(() => {
    if (ready && storeId) {
      postInit();
    }
  }, [ready, storeId, page, cssUrl, storeName, jsUrl, postInit]);

  if (!storeId?.trim()) {
    return (
      <div
        className={`flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 ${className}`}
      >
        Select a store to enable live preview.
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-white ${className}`}>
      {!ready ? <PreviewLoadingOverlay origin={previewOrigin} /> : null}
      {loadError && (
        <div className="absolute left-0 right-0 top-0 z-20 border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </div>
      )}
      <iframe
        key="theme-live-preview"
        ref={iframeRef}
        title="Theme live preview"
        src={previewSrc}
        className="block h-full min-h-0 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={() => {
          window.setTimeout(() => postInit(), 50);
        }}
      />
    </div>
  );
};

/** @deprecated Use CreateThemePreviewPage */
export type CreateThemePreviewPage = ThemePreviewPage;

export const CreateThemeLivePreview = memo(CreateThemeLivePreviewInner);
export default CreateThemeLivePreview;
