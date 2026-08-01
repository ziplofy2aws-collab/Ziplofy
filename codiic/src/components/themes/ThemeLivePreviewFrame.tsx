import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PreviewLoadingOverlay, PreviewSyncPulse } from './EditorPreviewStatus';

const EDITOR_SOURCE = 'codiic-theme-editor';
const FRAME_SOURCE = 'codiic-theme-preview';

/** Debounce full config sync to iframe — avoids message spam while typing in sidebar. */
const PREVIEW_CONFIG_POST_MS = 180;

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

export type ThemeLivePreviewFrameProps = {
  storeId: string;
  storeName?: string;
  /** Merchant storefront origin (e.g. mystore.localhost:5180) — used as preview iframe host. */
  storefrontOrigin?: string | null;
  /** True while the store subdomain / URL is being fetched. */
  storefrontLoading?: boolean;
  jsUrl: string | null | undefined;
  cssUrl?: string | null;
  config: Record<string, unknown>;
  page?: ThemePreviewPage;
  /** Storefront path for entity templates (product/collection/blog) — sent with INIT + SET_PAGE. */
  previewRoute?: string;
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
  /** Bumped on sidebar / inline field edits — posts config immediately (keeps preview in sync). */
  valuesSyncKey?: number;
  className?: string;
};

const DEFAULT_RENDER_STORE_PORT = '5180';
const DEFAULT_PRODUCTION_PREVIEW_HOST = 'preview.codiic.com';

function readEnvOrigin(...keys: string[]): string | null {
  for (const key of keys) {
    const raw = import.meta.env[key] as string | undefined;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim().replace(/\/$/, '');
    }
  }
  return null;
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost')
  );
}

/**
 * Origin for the preview iframe (`{origin}/theme-preview` on render-store).
 *
 * Online: always use the dedicated embeddable host (`preview.codiic.com` or
 * `VITE_RENDER_STORE_ORIGIN`). Merchant storefronts typically send
 * `X-Frame-Options: SAMEORIGIN`, which leaves the theme editor stuck on
 * "Loading live preview".
 *
 * Local: prefer the merchant storefront origin so APIs resolve the correct store.
 */
export function resolveThemePreviewOrigin(storefrontOrigin?: string | null): string {
  const explicit = readEnvOrigin('VITE_RENDER_STORE_ORIGIN', 'VITE_THEME_PREVIEW_ORIGIN');
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;

    if (!isLocalHostname(hostname)) {
      // Production / staging dashboard — never embed the merchant store host.
      if (
        hostname === 'admin.codiic.com' ||
        hostname === 'dashboard.codiic.com' ||
        hostname.endsWith('.codiic.com')
      ) {
        return `${protocol}//${DEFAULT_PRODUCTION_PREVIEW_HOST}`;
      }
      // Other deployed dashboards: derive preview.<apex> when possible.
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const apex = parts.slice(-2).join('.');
        return `${protocol}//preview.${apex}`;
      }
    }

    const storefront = storefrontOrigin?.trim().replace(/\/$/, '');
    if (storefront) return storefront;

    if (isLocalHostname(hostname)) {
      return `${protocol}//localhost:${DEFAULT_RENDER_STORE_PORT}`;
    }
  }

  const storefront = storefrontOrigin?.trim().replace(/\/$/, '');
  if (storefront) return storefront;

  return `http://localhost:${DEFAULT_RENDER_STORE_PORT}`;
}

export function buildThemePreviewSrc(storefrontOrigin?: string | null): string {
  return `${resolveThemePreviewOrigin(storefrontOrigin)}/theme-preview`;
}

const ThemeLivePreviewFrameInner: React.FC<ThemeLivePreviewFrameProps> = ({
  storeId,
  storeName,
  storefrontOrigin,
  storefrontLoading = false,
  jsUrl,
  cssUrl,
  config,
  page = 'index',
  previewRoute,
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
  valuesSyncKey = 0,
  className = '',
}) => {
  const previewSrc = useMemo(() => buildThemePreviewSrc(storefrontOrigin), [storefrontOrigin]);
  const previewDisplayUrl = useMemo(
    () => resolveThemePreviewOrigin(storefrontOrigin),
    [storefrontOrigin]
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initSentRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;
  const pageRef = useRef(page);
  pageRef.current = page;
  const previewRouteRef = useRef(previewRoute);
  previewRouteRef.current = previewRoute;
  const selectionHintsRef = useRef(selectionHints);
  selectionHintsRef.current = selectionHints;
  const inspectorEnabledRef = useRef(inspectorEnabled);
  inspectorEnabledRef.current = inspectorEnabled;
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
  const [syncPulse, setSyncPulse] = useState(false);

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
        type: 'codiic_PREVIEW_PATCH',
        payload: { fieldPath, value },
      },
      '*'
    );
  }, []);

  /** INIT only when runtime identity changes — never on page/route switches (SET_PAGE handles those). */
  const postInit = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !jsUrl || !storeId) return;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'codiic_PREVIEW_INIT',
        payload: {
          storeId,
          storeName,
          jsUrl,
          cssUrl: cssUrl ?? null,
          config: configRef.current,
          page: pageRef.current,
          previewRoute: previewRouteRef.current,
          selectionHints: selectionHintsRef.current,
          inspectorEnabled: inspectorEnabledRef.current,
        },
      },
      '*'
    );
    initSentRef.current = true;
  }, [storeId, storeName, jsUrl, cssUrl]);

  const postInspectorState = useCallback((enabled: boolean) => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame || !initSentRef.current) return;
    frame.postMessage(
      {
        source: EDITOR_SOURCE,
        type: 'codiic_PREVIEW_INSPECTOR',
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
        type: 'codiic_PREVIEW_CONFIG',
        payload: { config: configRef.current, immediate },
      },
      '*'
    );
  }, []);

  const endSyncPulse = useCallback(() => {
    setSyncPulse(false);
  }, []);

  const schedulePostConfig = useCallback(
    (immediate = false) => {
      if (configPostTimerRef.current !== undefined) {
        window.clearTimeout(configPostTimerRef.current);
        configPostTimerRef.current = undefined;
      }

      const json = JSON.stringify(configRef.current);
      if (!immediate && json === lastPostedConfigRef.current) {
        endSyncPulse();
        return;
      }

      setSyncPulse(true);
      const delay = immediate ? 0 : PREVIEW_CONFIG_POST_MS;
      configPostTimerRef.current = window.setTimeout(() => {
        configPostTimerRef.current = undefined;
        postConfigNow(immediate);
        endSyncPulse();
      }, delay);
    },
    [postConfigNow, endSyncPulse]
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
        type: 'codiic_PREVIEW_HINTS',
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
      if (data.type === 'codiic_PREVIEW_READY') {
        setReady(true);
        setLoadError(null);
        postInit();
      }
      if (data.type === 'codiic_PREVIEW_LOADED') {
        setReady(true);
        setLoadError(null);
      }
      if (data.type === 'codiic_PREVIEW_ERROR') {
        setLoadError(data.payload?.message ?? 'Preview failed to load');
      }
      if (data.type === 'codiic_PREVIEW_DESELECT') {
        onPreviewDeselectRef.current?.();
      }
      if (data.type === 'codiic_PREVIEW_SELECT' && data.payload?.nodeId) {
        onPreviewSelectRef.current?.({
          nodeId: data.payload.nodeId,
          label: data.payload.label ?? 'Element',
          kind: data.payload.kind ?? 'element',
        });
      }
      if (data.type === 'codiic_PREVIEW_ACTION' && data.payload?.nodeId && data.payload.action) {
        onPreviewActionRef.current?.(data.payload.action, data.payload.nodeId);
      }
      if (data.type === 'codiic_PREVIEW_FIELD_CHANGE' && data.payload?.fieldPath) {
        const fieldPath = data.payload.fieldPath;
        const value = data.payload.value ?? '';
        onPreviewFieldChangeRef.current?.(fieldPath, value, data.payload.nodeId ?? '');
        postPatch(fieldPath, value);
      }
      if (
        data.type === 'codiic_PREVIEW_INSERT_SECTION' &&
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
      endSyncPulse();
    };
  }, [configStableKey, ready, schedulePostConfig, endSyncPulse]);

  useEffect(() => {
    if (!ready || !initSentRef.current || structureSyncKey < 1) return;
    schedulePostConfig(true);
  }, [structureSyncKey, ready, schedulePostConfig]);

  useEffect(() => {
    if (!ready || !initSentRef.current || valuesSyncKey < 1) return;
    schedulePostConfig(true);
  }, [valuesSyncKey, ready, schedulePostConfig]);

  /** Never leave "Updating preview" stuck if debounce timers are cancelled mid-flight. */
  useEffect(() => {
    if (!syncPulse) return;
    const failsafe = window.setTimeout(() => endSyncPulse(), 4000);
    return () => window.clearTimeout(failsafe);
  }, [syncPulse, endSyncPulse]);

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
      {
        source: EDITOR_SOURCE,
        type: 'codiic_PREVIEW_SET_PAGE',
        payload: { page, previewRoute: previewRouteRef.current },
      },
      '*'
    );
  }, [page, previewRoute, ready]);

  useEffect(() => {
    postInspectorState(inspectorEnabled);
  }, [inspectorEnabled, ready, postInspectorState]);

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
          type: 'codiic_PREVIEW_HIGHLIGHT',
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
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    const payload = insertHoverHighlight
      ? {
          afterNodeId: insertHoverHighlight.afterNodeId,
          beforeNodeId: insertHoverHighlight.beforeNodeId,
        }
      : null;
    frame.postMessage(
      { source: EDITOR_SOURCE, type: 'codiic_PREVIEW_INSERT_HIGHLIGHT', payload },
      '*'
    );
  }, [insertHoverHighlight, ready]);

  useEffect(() => {
    initSentRef.current = false;
    setReady(false);
    setLoadError(null);
    setSyncPulse(false);
    lastPostedConfigRef.current = '';
    lastPostedHintsKeyRef.current = '';
    return () => {
      if (highlightRafRef.current) cancelAnimationFrame(highlightRafRef.current);
      if (configPostTimerRef.current !== undefined) window.clearTimeout(configPostTimerRef.current);
      if (hintsPostTimerRef.current !== undefined) window.clearTimeout(hintsPostTimerRef.current);
    };
  }, [jsUrl, storeId, previewSrc]);

  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => {
      setLoadError((prev) =>
        prev ??
        `Preview did not load from ${previewDisplayUrl}. Ensure the preview host allows framing from this dashboard (CSP frame-ancestors).`
      );
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [ready, previewDisplayUrl, previewSrc, storeId, jsUrl]);

  useEffect(() => {
    if (ready && jsUrl && storeId) {
      postInit();
    }
  }, [ready, jsUrl, storeId, page, cssUrl, storeName, postInit]);

  if (!jsUrl) {
    return (
      <div
        className={`flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 ${className}`}
      >
        Upload and apply a theme with <code className="mx-1">theme.js</code> to enable live preview.
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-white ${className}`}>
      {!ready ? <PreviewLoadingOverlay origin={previewDisplayUrl} /> : null}
      <PreviewSyncPulse visible={syncPulse && ready} />
      {loadError && (
        <div className="absolute left-0 right-0 top-0 z-20 border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {loadError}
        </div>
      )}
      <iframe
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

export const ThemeLivePreviewFrame = memo(ThemeLivePreviewFrameInner);
export default ThemeLivePreviewFrame;
