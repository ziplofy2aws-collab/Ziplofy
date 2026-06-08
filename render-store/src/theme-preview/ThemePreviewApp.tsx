import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { PreviewProviders } from './PreviewProviders';
import { PreviewErrorBoundary } from './PreviewErrorBoundary';
import { CustomThemeComposerPreview } from './CustomThemeComposerPreview';
import { ThemePreviewRuntime } from './ThemePreviewRuntime';
import { PreviewSelectionLayer } from './PreviewSelectionLayer';
import {
  isParentPreviewMessage,
  postToParent,
  type ThemePreviewInitPayload,
  type ThemePreviewPage,
  type ThemePreviewInsertHighlightPayload,
  type ThemePreviewSelectionHint,
} from './previewBridge';
import { hintsMatchKey, hintsStructureKey } from './previewPerf';

const PREVIEW_CONFIG_DEBOUNCE_MS = 180;

function setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> | unknown[] = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = parts[i + 1];
    const nextIsIndex = /^\d+$/.test(next);
    if (Array.isArray(cur)) {
      const idx = Number(p);
      if (cur[idx] == null || typeof cur[idx] !== 'object') {
        cur[idx] = nextIsIndex ? [] : {};
      }
      cur = cur[idx] as Record<string, unknown>;
      continue;
    }
    const record = cur as Record<string, unknown>;
    if (record[p] == null || typeof record[p] !== 'object') {
      record[p] = nextIsIndex ? [] : {};
    }
    cur = record[p] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    cur[Number(last)] = value;
  } else {
    (cur as Record<string, unknown>)[last] = value;
  }
}

export function ThemePreviewApp() {
  const [init, setInit] = useState<ThemePreviewInitPayload | null>(null);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [page, setPage] = useState<ThemePreviewPage>('index');
  /** Only bumps on page change — NOT on every config keystroke (avoids full route remount). */
  const [pageRevision, setPageRevision] = useState(0);
  const [selectionHints, setSelectionHints] = useState<ThemePreviewSelectionHint[]>([]);
  const [insertHighlight, setInsertHighlight] = useState<ThemePreviewInsertHighlightPayload>(null);
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const configDebounceRef = useRef<number | undefined>(undefined);
  const configRef = useRef<Record<string, unknown> | null>(null);
  const lastConfigJsonRef = useRef<string>('');

  const applyConfigSoft = useCallback((next: Record<string, unknown>) => {
    const json = JSON.stringify(next);
    if (json === lastConfigJsonRef.current) return;
    lastConfigJsonRef.current = json;
    configRef.current = next;
    startTransition(() => setConfig(next));
  }, []);

  const applyConfigImmediate = useCallback(
    (next: Record<string, unknown>) => {
      if (configDebounceRef.current !== undefined) {
        window.clearTimeout(configDebounceRef.current);
        configDebounceRef.current = undefined;
      }
      applyConfigSoft(next);
    },
    [applyConfigSoft]
  );

  const applyConfigDebounced = useCallback(
    (next: Record<string, unknown>) => {
      if (configDebounceRef.current !== undefined) {
        window.clearTimeout(configDebounceRef.current);
      }
      configDebounceRef.current = window.setTimeout(() => {
        configDebounceRef.current = undefined;
        applyConfigSoft(next);
      }, PREVIEW_CONFIG_DEBOUNCE_MS);
    },
    [applyConfigSoft]
  );

  const patchConfigField = useCallback(
    (fieldPath: string, value: string) => {
      const base = configRef.current;
      if (!base) return;
      const next = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
      setNested(next, fieldPath, value);
      applyConfigSoft(next);
    },
    [applyConfigSoft]
  );

  useEffect(() => {
    document.documentElement.classList.add('ziplofy-theme-preview-root');
    document.body.style.margin = '0';
    document.body.style.background = 'transparent';

    let readyInterval: number | undefined;
    let readySent = false;

    const onMessage = (event: MessageEvent) => {
      if (!isParentPreviewMessage(event.data)) return;
      const msg = event.data;

      if (msg.type === 'ZIPLOFY_PREVIEW_INIT') {
        if (readyInterval !== undefined) {
          window.clearInterval(readyInterval);
          readyInterval = undefined;
        }
        readySent = true;
        const payload = msg.payload;
        setInit((prev) => {
          if (
            prev &&
            prev.storeId === payload.storeId &&
            prev.jsUrl === payload.jsUrl &&
            (prev.cssUrl ?? null) === (payload.cssUrl ?? null)
          ) {
            return prev;
          }
          return payload;
        });
        applyConfigImmediate(payload.config);
        setPage(payload.page ?? 'index');
        setSelectionHints(payload.selectionHints ?? []);
        setInspectorEnabled(payload.inspectorEnabled !== false);
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_INSPECTOR') {
        setInspectorEnabled(Boolean(msg.payload.enabled));
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_CONFIG') {
        if (msg.payload.immediate) {
          applyConfigImmediate(msg.payload.config);
        } else {
          applyConfigDebounced(msg.payload.config);
        }
        if (msg.payload.selectionHints?.length) {
          setSelectionHints((prev) => {
            const next = msg.payload.selectionHints!;
            if (hintsStructureKey(prev) === hintsStructureKey(next)) return prev;
            return next;
          });
        }
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_PATCH') {
        patchConfigField(msg.payload.fieldPath, msg.payload.value);
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_HINTS') {
        setSelectionHints((prev) => {
          const next = msg.payload.selectionHints;
          if (
            hintsStructureKey(prev) === hintsStructureKey(next) &&
            hintsMatchKey(prev) === hintsMatchKey(next)
          ) {
            return prev;
          }
          return next;
        });
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_SET_PAGE') {
        setPage(msg.payload.page);
        setPageRevision((n) => n + 1);
        window.setTimeout(() => {
          postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_LOADED' });
        }, 0);
      }

      if (msg.type === 'ZIPLOFY_PREVIEW_INSERT_HIGHLIGHT') {
        setInsertHighlight(msg.payload ?? null);
      }
    };

    const signalReady = () => {
      if (readySent) return;
      postToParent({ source: 'ziplofy-theme-preview', type: 'ZIPLOFY_PREVIEW_READY' });
    };

    window.addEventListener('message', onMessage);
    signalReady();
    readyInterval = window.setInterval(signalReady, 400);

    return () => {
      if (readyInterval !== undefined) window.clearInterval(readyInterval);
      if (configDebounceRef.current !== undefined) {
        window.clearTimeout(configDebounceRef.current);
      }
      window.removeEventListener('message', onMessage);
      document.documentElement.classList.remove('ziplofy-theme-preview-root');
    };
  }, [applyConfigImmediate, applyConfigDebounced, patchConfigField]);

  if (!init || !config) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#78716c',
          fontSize: 14,
        }}
      >
        Waiting for theme editor…
      </div>
    );
  }

  return (
    <PreviewProviders
      storeId={init.storeId}
      storeName={init.storeName}
      themeConfig={config}
      jsUrl={init.jsUrl}
      cssUrl={init.cssUrl}
    >
      <PreviewErrorBoundary>
        {init.jsUrl ? (
          <ThemePreviewRuntime
            jsUrl={init.jsUrl}
            cssUrl={init.cssUrl}
            page={page}
            pageRevision={pageRevision}
          />
        ) : (
          <CustomThemeComposerPreview page={page} pageRevision={pageRevision} />
        )}
        <PreviewSelectionLayer
          hints={selectionHints}
          insertHighlight={insertHighlight}
          enabled={inspectorEnabled}
        />
      </PreviewErrorBoundary>
    </PreviewProviders>
  );
}
