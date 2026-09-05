'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ExternalLink,
  LayoutGrid,
  Monitor,
  RotateCcw,
  Settings2,
  Smartphone,
  X,
} from 'lucide-react';
import {
  isStaticInformaticThemeEditorMode,
} from '@/config/informatic-theme-editor-static.config';
import {
  clearCatalogInformaticThemeConfig,
  clearStaticInformaticThemeConfig,
  loadCatalogInformaticThemePack,
  loadStaticInformaticThemePack,
  resetStoreInformaticThemeConfig,
  saveCatalogInformaticThemeConfig,
  saveStaticInformaticThemeConfig,
  saveStoreInformaticThemeConfig,
  setConfigPath,
  type EditorFieldDef,
  type InformaticThemeSchema,
} from '@/lib/informatic-theme/load-static-pack';
import { patchInformaticRuntimeTemplates } from '@/lib/informatic-theme/runtime-templates.util';
import { useStoreStore, selectActiveStore } from '@/stores/storeStore';
import { BlogPostTemplatePreviewCard } from './BlogPostTemplatePreviewCard';
import { CustomPageTemplatePreviewCard } from './CustomPageTemplatePreviewCard';
import {
  defaultExpandedTreeIds,
  InformaticEditorSidebarTree,
  panelToTreeNodeId,
  panelToPreviewNodeId,
} from './InformaticEditorSidebarTree';
import { InformaticSectionSettingsPanel } from './InformaticSectionSettingsPanel';
import { InformaticThemeSettingsSheet } from './InformaticThemeSettingsSheet';
import {
  isBlogPostTemplatePreviewPage,
  type BlogPostPreviewSelection,
} from './blog-page-preview.util';
import {
  isCustomPageTemplatePreviewPage,
  type CustomPagePreviewSelection,
} from './custom-page-preview.util';
import {
  isInformaticPolicyTemplateId,
  policyPageLabel,
} from '@/lib/informatic-policy-pages';
import {
  InformaticLivePreview,
  type InformaticPreviewPageId,
} from './InformaticLivePreview';
import {
  InformaticPagePicker,
  pagePickerValueToTemplateId,
  type InformaticPagePickerValue,
} from './InformaticPagePicker';
import { panelFromInformaticNodeId } from './informatic-inspector';
import { buildStorefrontPreviewUrl } from './storefront-preview.util';
import { InspectorToggleIcon } from './InspectorToggleIcon';
import {
  ensureInformaticThemeSettingsDefaults,
  InformaticThemeSettingsNav,
} from './InformaticThemeSettingsNav';
import { applyStoreMenuSelectionToConfig } from '@/lib/informatic-theme/store-menu-header.util';
import {
  applyLeadFormSelectionToConfig,
  clearLeadFormSelectionFromConfig,
} from '@/lib/informatic-theme/informatic-lead-form.util';
import {
  insertCatalogSection,
  listInsertableSectionCatalog,
  listTemplateSectionsForEditor,
  removeTemplateSection,
  resolveSectionSettingsFields,
} from '@/lib/informatic-theme/informatic-section-catalog.util';
import { InformaticAddSectionButton } from './InformaticAddSectionButton';
import type { StoreMenu, StoreMenuItem } from '@/lib/store-menu';

type SidebarTab = 'sections' | 'theme-settings';

type Panel =
  | { kind: 'theme-settings' }
  | { kind: 'layout'; sectionId: string }
  | { kind: 'layout-block'; sectionId: string; blockId: string }
  | { kind: 'section'; templateId: string; sectionId: string }
  | { kind: 'section-block'; templateId: string; sectionId: string; blockId: string };

const SIDEBAR_WIDTH_KEY = 'informaticEditorSidebarWidth';
const SIDEBAR_DEFAULT_WIDTH = 320;
const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 560;

function clampSidebarWidth(width: number): number {
  const max =
    typeof window !== 'undefined'
      ? Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, window.innerWidth - 360))
      : SIDEBAR_MAX_WIDTH;
  return Math.min(max, Math.max(SIDEBAR_MIN_WIDTH, Math.round(width)));
}

function readStoredSidebarWidth(): number {
  if (typeof window === 'undefined') return SIDEBAR_DEFAULT_WIDTH;
  const raw = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (!Number.isFinite(raw)) return SIDEBAR_DEFAULT_WIDTH;
  return clampSidebarWidth(raw);
}

export default function InformaticThemeEditor() {
  const searchParams = useSearchParams();
  const catalogThemeId = searchParams.get('catalogThemeId')?.trim() || '';
  const useCatalog = Boolean(catalogThemeId);
  const staticMode = isStaticInformaticThemeEditorMode();
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const getActiveStorefrontUrl = useStoreStore((s) => s.getActiveStorefrontUrl);
  const storeId = activeStore?._id || null;
  const storefrontOrigin = getActiveStorefrontUrl();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<InformaticThemeSchema | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [defaultConfig, setDefaultConfig] = useState<Record<string, unknown>>({});
  const [configSaved, setConfigSaved] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pageId, setPageId] = useState<InformaticPreviewPageId>('index');
  const [pagePickerValue, setPagePickerValue] = useState<InformaticPagePickerValue>({
    kind: 'template',
    templateId: 'index',
  });
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('sections');
  const [panel, setPanel] = useState<Panel>({ kind: 'layout', sectionId: 'header' });
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [previewBlogPostSelection, setPreviewBlogPostSelection] =
    useState<BlogPostPreviewSelection | null>(null);
  const [previewCustomPageSelection, setPreviewCustomPageSelection] =
    useState<CustomPagePreviewSelection | null>(null);
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({});
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  useEffect(() => {
    setSidebarWidth(readStoredSidebarWidth());
  }, []);

  useEffect(() => {
    if (!isResizingSidebar) return;
    const onMove = (event: PointerEvent) => {
      setSidebarWidth(clampSidebarWidth(event.clientX));
    };
    const onUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (isResizingSidebar || typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth, isResizingSidebar]);

  useEffect(() => {
    if (useCatalog) void fetchStores();
  }, [fetchStores, useCatalog]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveError(null);
    try {
      if (useCatalog) {
        const pack = await loadCatalogInformaticThemePack(catalogThemeId, storeId);
        setSchema(pack.schema);
        const withSettings = ensureInformaticThemeSettingsDefaults(
          patchInformaticRuntimeTemplates(pack.config)
        );
        setConfig(withSettings);
        setDefaultConfig(
          ensureInformaticThemeSettingsDefaults(
            structuredClone(patchInformaticRuntimeTemplates(pack.packDefaultConfig))
          )
        );
        setConfigSaved(Boolean(pack.saved));
        return;
      }
      if (!staticMode) {
        throw new Error(
          'Enable static dev mode or open a theme from the catalog with ?catalogThemeId=…'
        );
      }
      const pack = await loadStaticInformaticThemePack();
      setSchema(pack.schema);
      const withSettings = ensureInformaticThemeSettingsDefaults(
        patchInformaticRuntimeTemplates(pack.config)
      );
      setConfig(withSettings);
      setDefaultConfig(
        ensureInformaticThemeSettingsDefaults(
          structuredClone(patchInformaticRuntimeTemplates(pack.packDefaultConfig))
        )
      );
      setConfigSaved(false);
    } catch (e) {
      setError((e as Error)?.message || 'Failed to load Informatic pack');
    } finally {
      setLoading(false);
    }
  }, [catalogThemeId, staticMode, storeId, useCatalog]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onChange = useCallback((path: string, value: unknown) => {
    setConfig((prev) => setConfigPath(prev, path, value));
    setConfigSaved(false);
  }, []);

  const handleStoreMenuSelect = useCallback(
    (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => {
      setConfig((prev) => applyStoreMenuSelectionToConfig(prev, menuFieldPath, menu, items));
      setConfigSaved(false);
    },
    []
  );

  const handleLeadFormSelect = useCallback((formFieldPath: string, form: { _id: string; name: string }) => {
    setConfig((prev) => applyLeadFormSelectionToConfig(prev, formFieldPath, form));
    setConfigSaved(false);
  }, []);

  const handleLeadFormClear = useCallback((formFieldPath: string) => {
    setConfig((prev) => clearLeadFormSelectionFromConfig(prev, formFieldPath));
    setConfigSaved(false);
  }, []);

  const handleInsertSection = useCallback(
    (catalogType: string) => {
      const afterSectionId = panel.kind === 'section' ? panel.sectionId : null;
      const result = insertCatalogSection(config, schema, pageId, catalogType, { afterSectionId });
      if (!result) return;
      setConfig(result.config);
      setConfigSaved(false);
      setPanel({ kind: 'section', templateId: pageId, sectionId: result.sectionId });
      setSettingsSheetOpen(true);
      setTreeExpanded((prev) => ({
        ...prev,
        [`template:${pageId}:${result.sectionId}`]: true,
      }));
    },
    [config, schema, pageId, panel]
  );

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      const next = removeTemplateSection(config, schema, pageId, sectionId);
      if (!next) return;
      setConfig(next);
      setConfigSaved(false);
      if (panel.kind === 'section' && panel.sectionId === sectionId) {
        setSettingsSheetOpen(false);
        setPanel({ kind: 'layout', sectionId: 'header' });
      }
    },
    [config, schema, pageId, panel]
  );

  const onSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (useCatalog && storeId) {
        await saveStoreInformaticThemeConfig(storeId, catalogThemeId, config);
        setConfigSaved(true);
      } else if (useCatalog) {
        saveCatalogInformaticThemeConfig(catalogThemeId, config);
      } else {
        saveStaticInformaticThemeConfig(config);
      }
      setSaveFlash(true);
      window.setTimeout(() => setSaveFlash(false), 1600);
    } catch (e) {
      setSaveError((e as Error)?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  }, [catalogThemeId, config, storeId, useCatalog]);

  const onClear = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (useCatalog && storeId) {
        await resetStoreInformaticThemeConfig(storeId, catalogThemeId);
      } else if (useCatalog) {
        clearCatalogInformaticThemeConfig(catalogThemeId);
      } else {
        clearStaticInformaticThemeConfig();
      }
      await reload();
    } catch (e) {
      setSaveError((e as Error)?.message || 'Failed to reset theme');
    } finally {
      setSaving(false);
    }
  }, [catalogThemeId, reload, storeId, useCatalog]);

  const template = useMemo(() => {
    return schema?.templates?.find((t) => t.id === pageId) || schema?.templates?.[0];
  }, [schema, pageId]);

  const storefrontPreviewUrl = useMemo(
    () =>
      buildStorefrontPreviewUrl(
        storefrontOrigin,
        pageId,
        previewBlogPostSelection,
        previewCustomPageSelection
      ),
    [storefrontOrigin, pageId, previewBlogPostSelection, previewCustomPageSelection]
  );

  const templateSections = useMemo(
    () => listTemplateSectionsForEditor(config, schema, pageId),
    [config, schema, pageId]
  );

  const insertableSectionCatalog = useMemo(
    () => listInsertableSectionCatalog(schema),
    [schema]
  );

  const layoutEntries = useMemo(() => Object.entries(schema?.layout || {}), [schema]);

  useEffect(() => {
    if (!schema) return;
    setTreeExpanded((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return defaultExpandedTreeIds(
        layoutEntries,
        templateSections,
        pageId
      );
    });
  }, [schema, layoutEntries, templateSections, pageId]);

  const activeFields: EditorFieldDef[] = useMemo(() => {
    if (!schema) return [];
    if (sidebarTab === 'theme-settings' || panel.kind === 'theme-settings') {
      return [];
    }
    if (panel.kind === 'layout') {
      return schema.layout?.[panel.sectionId]?.settingsFields || [];
    }
    if (panel.kind === 'layout-block') {
      const block = schema.layout?.[panel.sectionId]?.blocks?.find((b) => b.id === panel.blockId);
      return block?.settingsFields || [];
    }
    if (panel.kind === 'section') {
      return resolveSectionSettingsFields(config, schema, panel.templateId, panel.sectionId);
    }
    if (panel.kind === 'section-block') {
      const sec = templateSections.find((s) => s.id === panel.sectionId);
      const block = sec?.blocks?.find((b) => b.id === panel.blockId);
      return block?.settingsFields || [];
    }
    return [];
  }, [schema, panel, templateSections, sidebarTab, config]);

  const settingsHeading = useMemo(() => {
    if (panel.kind === 'layout') {
      return schema?.layout?.[panel.sectionId]?.label || panel.sectionId;
    }
    if (panel.kind === 'layout-block') {
      const block = schema?.layout?.[panel.sectionId]?.blocks?.find((b) => b.id === panel.blockId);
      return block?.label || panel.blockId;
    }
    if (panel.kind === 'section') {
      const sec = templateSections.find((s) => s.id === panel.sectionId);
      return sec?.label || panel.sectionId;
    }
    if (panel.kind === 'section-block') {
      const sec = templateSections.find((s) => s.id === panel.sectionId);
      const block = sec?.blocks?.find((b) => b.id === panel.blockId);
      return block?.label || panel.blockId;
    }
    return 'Settings';
  }, [sidebarTab, panel, schema, templateSections]);

  const highlightNodeId = useMemo(() => {
    if (panel.kind === 'theme-settings') return null;
    return panelToTreeNodeId(panel, pageId);
  }, [panel, pageId]);

  const showSettingsPanel =
    sidebarTab === 'sections' && settingsSheetOpen && activeFields.length > 0;

  const closeSettings = useCallback(() => {
    setSettingsSheetOpen(false);
  }, []);

  const handlePagePickerChange = useCallback((value: InformaticPagePickerValue) => {
    setPagePickerValue(value);
    const templateId = pagePickerValueToTemplateId(value);
    setPageId(templateId);
    setSelectedNodeId(null);
    setSettingsSheetOpen(false);
    if (value.kind === 'custom-page') {
      setPreviewCustomPageSelection({
        urlHandle: value.urlHandle,
        title: value.title,
      });
    }
    setPanel({ kind: 'layout', sectionId: 'header' });
  }, []);

  const handleCustomPagePreviewChange = useCallback((selection: CustomPagePreviewSelection) => {
    setPreviewCustomPageSelection(selection);
    setPagePickerValue({
      kind: 'custom-page',
      templateId: 'page',
      urlHandle: selection.urlHandle,
      title: selection.title ?? selection.urlHandle,
    });
  }, []);

  const handleTreeSelect = useCallback((nextPanel: Panel) => {
    if (nextPanel.kind === 'theme-settings') return;
    setPanel(nextPanel);
    setSelectedNodeId(panelToPreviewNodeId(nextPanel));
    setSettingsSheetOpen(true);
  }, []);

  const toggleTreeExpand = useCallback((id: string) => {
    setTreeExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const switchSidebarTab = useCallback((tab: SidebarTab) => {
    setSidebarTab(tab);
    if (tab === 'theme-settings') {
      setPanel({ kind: 'theme-settings' });
      setSelectedNodeId(null);
      setSettingsSheetOpen(false);
      return;
    }
    setPanel((prev) => (prev.kind === 'theme-settings' ? { kind: 'layout', sectionId: 'header' } : prev));
  }, []);

  const handleInspectorSelect = useCallback(
    (nodeId: string) => {
      const next = panelFromInformaticNodeId(nodeId, pageId);
      if (!next) return;
      setSidebarTab('sections');
      setPanel(next);
      setSelectedNodeId(nodeId);
      setSettingsSheetOpen(true);
    },
    [pageId]
  );

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        Boolean(el?.isContentEditable)
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
      if (key !== 'i') return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setInspectorEnabled((v) => !v);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!staticMode && !useCatalog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-admin-text">Informatic theme editor</h1>
          <p className="mt-2 text-sm text-admin-text-secondary">
            Open a catalog theme from{' '}
            <Link href="/client/themes" className="font-medium underline">
              Online Store → Themes
            </Link>
            , or enable static dev mode for local pack editing.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-admin-text-secondary">
        Loading Informatic theme…
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="max-w-md text-center">
          <p className="text-sm text-red-600">{error || 'Missing schema'}</p>
          <button type="button" onClick={() => void reload()} className="mt-3 text-sm font-medium underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[50] flex flex-col bg-white text-admin-text">
      {/* Catalog-style top bar: theme | page picker | actions */}
      <header className="relative grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-gray-200 bg-white px-3">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <Link
            href="/client/themes"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            title="Exit editor"
            aria-label="Exit editor"
          >
            <X className="h-4 w-4" aria-hidden />
          </Link>
          <span className="truncate text-sm font-semibold text-gray-900">
            {activeStore?.storeName || 'Informatic'}
          </span>
          {useCatalog && storeId ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                configSaved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {configSaved ? 'Saved' : 'Unsaved'}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              Active
            </span>
          )}
          {staticMode && !useCatalog ? (
            <span className="hidden shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:inline">
              Dev
            </span>
          ) : null}
          {useCatalog ? (
            <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 sm:inline">
              Catalog
            </span>
          ) : null}
        </div>

        <div className="justify-self-center">
          <InformaticPagePicker
            storeId={storeId}
            value={pagePickerValue}
            onChange={handlePagePickerChange}
          />
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          {storefrontPreviewUrl ? (
            <a
              href={storefrontPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title={
                configSaved
                  ? 'Open live storefront in a new tab'
                  : 'Open storefront in a new tab (save theme first to see unsaved changes)'
              }
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Preview</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-sm font-medium text-gray-400"
              title="Select a store to preview your live storefront"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setInspectorEnabled((v) => !v)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 ${
              inspectorEnabled ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
            }`}
            title={
              inspectorEnabled
                ? 'Deactivate inspector (Shift+I)'
                : 'Activate inspector (Shift+I)'
            }
            aria-pressed={inspectorEnabled}
            aria-keyshortcuts="Shift+I"
            aria-label={
              inspectorEnabled
                ? 'Deactivate inspector (Shift+I)'
                : 'Activate inspector (Shift+I)'
            }
          >
            <InspectorToggleIcon className="h-5 w-5" />
          </button>
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Desktop preview"
              aria-label="Desktop preview"
              aria-pressed={device === 'desktop'}
            >
              <Monitor className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                device === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="Mobile preview"
              aria-label="Mobile preview"
              aria-pressed={device === 'mobile'}
            >
              <Smartphone className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => void onClear()}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Reset to theme defaults"
            aria-label="Reset to theme defaults"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="flex h-9 items-center rounded-lg bg-black px-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : saveFlash ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      {useCatalog && !storeId ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[12px] text-amber-950">
          Select a store from the account menu to save theme changes to the server. Until then, edits are kept in
          this browser only.
        </div>
      ) : null}
      {saveError ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-[12px] text-red-800">
          {saveError}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside
          className={`relative flex shrink-0 flex-col border-r border-gray-200 bg-white ${
            isResizingSidebar ? 'select-none' : ''
          }`}
          style={{ width: sidebarWidth }}
        >
          <div
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemin={SIDEBAR_MIN_WIDTH}
            aria-valuemax={SIDEBAR_MAX_WIDTH}
            aria-valuenow={sidebarWidth}
            tabIndex={0}
            className={`absolute inset-y-0 -right-1 z-30 w-2 cursor-col-resize touch-none transition-colors ${
              isResizingSidebar ? 'bg-sky-500/25' : 'hover:bg-sky-500/20'
            }`}
            onPointerDown={(event) => {
              event.preventDefault();
              setIsResizingSidebar(true);
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                setSidebarWidth((w) => clampSidebarWidth(w - 16));
              } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                setSidebarWidth((w) => clampSidebarWidth(w + 16));
              }
            }}
          />

          {/* Catalog-style: Sections | Theme settings */}
          <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => switchSidebarTab('sections')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                sidebarTab === 'sections'
                  ? 'bg-[#eaf2ff] text-[#005bd3]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title="Sections"
              aria-label="Sections"
              aria-pressed={sidebarTab === 'sections'}
            >
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => switchSidebarTab('theme-settings')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                sidebarTab === 'theme-settings'
                  ? 'bg-[#eaf2ff] text-[#005bd3]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title="Theme settings"
              aria-label="Theme settings"
              aria-pressed={sidebarTab === 'theme-settings'}
            >
              <Settings2 className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <h2 className="border-b border-[#f0f1f2] bg-white px-4 py-3.5 text-[12px] font-medium text-gray-400">
            {sidebarTab === 'sections' ? (
              <>
                Editing{' '}
                <span className="text-[14px] font-semibold text-gray-900">
                  {isCustomPageTemplatePreviewPage(pageId) && previewCustomPageSelection?.title
                    ? previewCustomPageSelection.title
                    : isInformaticPolicyTemplateId(pageId)
                      ? policyPageLabel(pageId)
                      : template?.label || pageId}
                </span>
              </>
            ) : (
              <span className="text-[14px] font-semibold text-gray-900">Theme settings</span>
            )}
          </h2>

          {sidebarTab === 'theme-settings' ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f6f7]">
              <InformaticThemeSettingsNav
                config={config}
                defaultConfig={defaultConfig}
                onChange={onChange}
                onReplaceConfig={(next) => setConfig(ensureInformaticThemeSettingsDefaults(next))}
                storeId={storeId}
              />
            </div>
          ) : (
            <>
              <InformaticEditorSidebarTree
                pageId={pageId}
                pageLabel={
                  isCustomPageTemplatePreviewPage(pageId) && previewCustomPageSelection?.title
                    ? previewCustomPageSelection.title
                    : isInformaticPolicyTemplateId(pageId)
                      ? policyPageLabel(pageId)
                      : template?.label || pageId
                }
                layoutEntries={layoutEntries}
                templateSections={templateSections}
                highlightNodeId={highlightNodeId}
                expanded={treeExpanded}
                onToggleExpand={toggleTreeExpand}
                onSelectPanel={handleTreeSelect}
                onRemoveSection={handleRemoveSection}
                sectionsHeaderSlot={
                  isBlogPostTemplatePreviewPage(pageId) ? (
                    <BlogPostTemplatePreviewCard
                      storeId={storeId}
                      previewSelection={previewBlogPostSelection}
                      onPreviewSelectionChange={setPreviewBlogPostSelection}
                      storefrontOrigin={storefrontOrigin}
                    />
                  ) : isCustomPageTemplatePreviewPage(pageId) ? (
                    <CustomPageTemplatePreviewCard
                      storeId={storeId}
                      previewSelection={previewCustomPageSelection}
                      onPreviewSelectionChange={handleCustomPagePreviewChange}
                      storefrontOrigin={storefrontOrigin}
                    />
                  ) : null
                }
                sectionsFooterSlot={
                  insertableSectionCatalog.length > 0 ? (
                    <InformaticAddSectionButton
                      catalog={insertableSectionCatalog}
                      onInsert={handleInsertSection}
                    />
                  ) : null
                }
              />

              {showSettingsPanel ? (
                <InformaticThemeSettingsSheet>
                  <InformaticSectionSettingsPanel
                    title={settingsHeading}
                    fields={activeFields}
                    config={config}
                    onChange={onChange}
                    onClose={closeSettings}
                    storeId={storeId}
                    onStoreMenuSelect={handleStoreMenuSelect}
                    onLeadFormSelect={handleLeadFormSelect}
                    onLeadFormClear={handleLeadFormClear}
                  />
                </InformaticThemeSettingsSheet>
              ) : null}
            </>
          )}
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f6f6f7]">
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden">
            <div
              className="min-h-0 w-full overflow-x-hidden overflow-y-auto bg-white will-change-[max-width] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                height: device === 'mobile' ? 'calc(100% - 32px)' : '100%',
                maxWidth: device === 'mobile' ? 390 : '100%',
                marginTop: device === 'mobile' ? 16 : 0,
                marginBottom: device === 'mobile' ? 16 : 0,
                borderRadius: device === 'mobile' ? 12 : 0,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: device === 'mobile' ? 'rgba(229, 231, 235, 1)' : 'transparent',
                boxShadow:
                  device === 'mobile' ? '0 1px 2px rgba(16, 24, 40, 0.06), 0 8px 24px rgba(16, 24, 40, 0.06)' : 'none',
                transitionProperty: 'max-width, margin, border-radius, border-color, box-shadow, height',
                transitionDuration: '420ms',
              }}
            >
              <InformaticLivePreview
                config={config}
                pageId={pageId}
                storeId={storeId}
                blogPostPreview={previewBlogPostSelection}
                customPagePreview={previewCustomPageSelection}
                inspectorEnabled={inspectorEnabled}
                selectedNodeId={inspectorEnabled ? selectedNodeId : null}
                onSelectNode={handleInspectorSelect}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
