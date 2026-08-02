import React, { startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './theme-editor-chrome.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '../../contexts/store.context';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { useStoreSubdomain } from '../../contexts/storeSubdomain.context';
import { useStoreThemeConfig } from '../../contexts/store-theme-config.context';
import {
  applyStoreMenuSelectionToConfig,
  pruneStaleHeaderMenuItemValues,
} from '../../create-theme/utils/store-menu-header.util';
import { readThemeColorPalette, syncThemePaletteToFieldValues, ensureThemeColorPaletteDefaults, seedThemePaletteValues } from '../../create-theme/settings/theme-color-palette.settings';
import {
  ensureThemeButtonsDefaults,
  seedThemeButtonsValues,
} from '../../create-theme/settings/theme-buttons.settings';
import {
  ensureThemeLogoFaviconDefaults,
  seedThemeLogoFaviconValues,
  THEME_LOGO_DEFAULT_PATH,
} from '../../create-theme/settings/theme-logo-favicon.settings';
import {
  ensureThemeTypographyDefaults,
  seedThemeTypographyValues,
  syncThemeTypographyFontFields,
  THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH,
  THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH,
} from '../../create-theme/settings/theme-typography.settings';
import { InspectorToggleIcon } from '../../create-theme/chrome/InspectorToggleIcon';
import { shiftShortcutLabel } from '../../utils/keyboard-shortcut-label';
import ThemeLivePreviewFrame, { type ThemePreviewPage } from '../../components/themes/ThemeLivePreviewFrame';
import { AddBlockModal } from '../../components/themes/theme-editor-sidebar/AddBlockModal';
import { AddSectionModal } from '../../components/themes/theme-editor-sidebar/AddSectionModal';
import {
  resolveAddSectionGroup,
  resolveSectionCatalogGroupFromNodeId,
  type SectionCatalogItem,
  type SectionInsertContext,
} from '../../components/themes/theme-editor-sidebar/add-section-catalog';
import ThemeEditorSidebar from '../../components/themes/theme-editor-sidebar/ThemeEditorSidebar';
import { ProductTemplatePreviewCard } from '../../create-theme/sidebar/ProductTemplatePreviewCard';
import { CollectionTemplatePreviewCard } from '../../create-theme/sidebar/CollectionTemplatePreviewCard';
import { BlogTemplatePreviewCard } from '../../create-theme/sidebar/BlogTemplatePreviewCard';
import { BlogPostTemplatePreviewCard } from '../../create-theme/sidebar/BlogPostTemplatePreviewCard';
import { resolveProductTemplatePreviewRoute } from '../../create-theme/utils/product-page-preview.util';
import { resolveCollectionTemplatePreviewRoute } from '../../create-theme/utils/collection-page-preview.util';
import {
  resolveBlogPostsTemplatePreviewRoute,
  resolveBlogsTemplatePreviewRoute,
  type BlogPostPreviewSelection,
} from '../../create-theme/utils/blog-page-preview.util';
import { isProductTemplatePreviewPage } from '../../create-theme/utils/product-templates.util';
import { isCollectionTemplatePreviewPage } from '../../create-theme/utils/collection-templates.util';
import {
  isBlogPostsTemplatePreviewPage,
  isBlogsTemplatePreviewPage,
} from '../../create-theme/utils/blog-templates.util';
import type { BlockCatalogItem } from '../../components/themes/theme-editor-sidebar/add-block-catalog';
import {
  getAddBlockCatalogItems,
  type ThemeBlockCatalogApi,
} from '../../components/themes/theme-editor-sidebar/theme-block-catalog.adapter';
import ThemeEditorPagePicker from '../../components/themes/ThemeEditorPagePicker';
import { findPageMenuItemByPreview, buildThemeEditorPageMenu } from '../../utils/theme-editor-page-menu';
import {
  buildThemeEditorSelectionHints,
  expandedIdsForPreviewNode,
} from '../../utils/theme-editor-selection-hints';
import type {
  EditorFieldDef,
  EditorSchemaDoc,
  ThemeEditorSidebarTab,
} from '../../components/themes/theme-editor-sidebar/theme-editor-sidebar.types';
import {
  applyStructureOrderToConfig,
  mergeItemOrder,
  readStructureOrderFromConfig,
} from '../../components/themes/theme-editor-sidebar/theme-editor-structure-order';
import {
  buildShopifySidebarTree,
  buildThemeSettingsSidebarTree,
  defaultExpandedSidebar,
  findSidebarNode,
  resolveAddBlockSectionLabel,
  settingsNodeForSelection,
} from '../../components/themes/theme-editor-sidebar/theme-editor-sidebar.tree';
import { announcementBlockNodeIdFromSelection } from '../../components/themes/theme-editor-sidebar/theme-editor-announcement-block-panel.utils';
import { watchFooterBlockNodeIdFromSelection } from '../../components/themes/theme-editor-sidebar/theme-editor-watch-footer-block-panel.utils';
import { axiosi } from '../../config/axios.config';
import {
  DEV_STATIC_THEME_PACKS,
  getStaticDevPackId,
  isThemeEditorStaticMode,
  setStaticDevPackId,
  THEME_EDITOR_STATIC_CONFIG,
  displayNameForDevPack,
  configLocalStorageKeyForPack,
  type DevStaticThemePackId,
} from '../../config/theme-editor-static.config';
import { DevThemePackSwitcher } from '../../components/themes/DevThemePackSwitcher';
import { EditorBlockingOverlay } from '../../components/themes/EditorPreviewStatus';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useRafBatchedCounter } from '../../hooks/useRafBatchedState';
import {
  applyValuesToThemeConfig,
  collectEditableFieldPaths,
  setConfigAtPath,
} from '../../utils/theme-editor-config.utils';
import {
  extendValuesForHeroBlock,
  extendValuesForLayoutBlock,
  extendValuesForLayoutInstance,
  extendValuesForTemplateBlock,
  extendValuesForTemplateInstance,
  getLayoutOrder,
  insertBlockFromCatalog,
  insertSectionFromCatalog,
  layoutBlueprintKey,
  mergeTemplateSectionBlueprintsFromPack,
  templateBlueprintKey,
  templateIdForPage,
  pruneValuesForLayoutBlock,
  pruneValuesForLayoutInstance,
  pruneValuesForTemplateBlock,
  pruneValuesForTemplateInstance,
  removeLayoutBlock,
  removeLayoutSection,
  removeTemplateBlock,
  removeTemplateSection,
  sanitizeThemeConfigStructure,
} from '../../utils/theme-editor-insert-section';
import { mergedConfigFromFormValues } from '../../utils/theme-editor-static-save';
import {
  formValuesFromEditorConfig,
  mergeLayoutSectionDefaults,
  mergeTemplateSectionDefaults,
  saveStaticThemeConfigLocal,
  clearStaticThemeConfigLocal,
} from '../../utils/theme-editor-static-pack';
import {
  fieldTypeFromSchema,
  type ThemeEditorFieldType,
} from '../../components/themes/theme-editor-sidebar/theme-editor-field.utils';
import {
  seedSectionEnabledValues,
  sectionEnabledPathFromNodeId,
} from '../../utils/theme-editor-section-visibility.util';

type FieldType = ThemeEditorFieldType;

/** Map header field/preview clicks onto Logo / Menu block rows. */
function headerBlockNodeIdFromSelection(nodeId: string): string | null {
  const logo = nodeId.match(/^field:sections\.(header(?:_\d+)?)\.blocks\.logo\./);
  if (logo) return `layout:${logo[1]}:block:logo`;
  const menu = nodeId.match(/^field:sections\.(header(?:_\d+)?)\.blocks\.menu\./);
  if (menu) return `layout:${menu[1]}:block:menu`;
  if (/^layout:header(?:_\d+)?:block:(logo|menu)$/.test(nodeId)) return nodeId;
  return null;
}

type SectionThemeConfigEditorProps = {
  themeId: string;
  /** When true, editor is on the static dev pack (no production API save). */
  staticDevMode?: boolean;
};

const SectionThemeConfigEditor: React.FC<SectionThemeConfigEditorProps> = ({
  themeId,
  staticDevMode = isThemeEditorStaticMode(),
}) => {
  const navigate = useNavigate();
  const { activeStoreId, stores } = useStore();
  const { storeSubdomain, getByStoreId, loading: subdomainLoading } = useStoreSubdomain();

  const { load, saveValues, saving, loading, error: loadError } = useStoreThemeConfig();
  const [error, setError] = useState<string | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [editorSchema, setEditorSchema] = useState<EditorSchemaDoc | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [themeRuntime, setThemeRuntime] = useState<{ jsUrl?: string | null; cssUrl?: string | null }>({});
  const [defaultConfig, setDefaultConfig] = useState<Record<string, unknown> | null>(null);
  const pendingStoreMenuValueSyncRef = useRef<{
    itemValuePaths: Record<string, string>;
    itemsPath: string;
    navItemCount: number;
  } | null>(null);
  const packDefaultRef = useRef<Record<string, unknown> | null>(null);
  const [manifest, setManifest] = useState<Record<string, unknown> | null>(null);
  const [blockCatalog, setBlockCatalog] = useState<ThemeBlockCatalogApi | null>(null);
  const [previewPage, setPreviewPage] = useState<ThemePreviewPage>('index');
  const [previewProductHandle, setPreviewProductHandle] = useState<string | null>(null);
  const [previewCollectionHandle, setPreviewCollectionHandle] = useState<string | null>(null);
  const [previewBlogHandle, setPreviewBlogHandle] = useState<string | null>(null);
  const [previewBlogPostSelection, setPreviewBlogPostSelection] =
    useState<BlogPostPreviewSelection | null>(null);
  const [canPersist, setCanPersist] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<ThemeEditorSidebarTab>('sections');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [previewAnimDir, setPreviewAnimDir] = useState<'to-mobile' | 'to-desktop' | null>(null);
  const previewAnimTimerRef = useRef<number | null>(null);
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});
  const [addBlockTarget, setAddBlockTarget] = useState<{
    nodeId: string;
    sectionLabel: string;
  } | null>(null);
  const [addSectionTarget, setAddSectionTarget] = useState<{
    nodeId: string;
    groupId: ReturnType<typeof resolveAddSectionGroup>['groupId'];
    groupLabel: string;
    afterNodeId?: string;
    beforeNodeId?: string;
  } | null>(null);
  const [insertHoverHighlight, setInsertHoverHighlight] = useState<SectionInsertContext | null>(null);

  const openAddSectionModal = useCallback((ctx: SectionInsertContext) => {
    setAddBlockTarget(null);
    setInsertHoverHighlight(null);
    setAddSectionTarget({
      nodeId: ctx.afterNodeId ?? ctx.beforeNodeId ?? `insert:${ctx.groupId}`,
      groupId: ctx.groupId,
      groupLabel: ctx.groupLabel,
      afterNodeId: ctx.afterNodeId,
      beforeNodeId: ctx.beforeNodeId,
    });
  }, []);
  const [itemOrder, setItemOrder] = useState<Record<string, string[]>>({});
  const [structureSyncKey, setStructureSyncKey] = useState(0);
  const [devPackId, setDevPackId] = useState<DevStaticThemePackId>(() => getStaticDevPackId());
  const [packSwitching, setPackSwitching] = useState(false);
  /** Bumps on field edits (batched per animation frame) for immediate preview config sync. */
  const [valuesSyncKey, bumpValuesSync] = useRafBatchedCounter();

  const schemaFieldTypes = useMemo(() => {
    if (!editorSchema || !defaultConfig) return new Map<string, string>();
    return new Map(
      collectEditableFieldPaths(editorSchema, defaultConfig as Record<string, unknown>).map((f) => [
        f.path,
        f.type,
      ])
    );
  }, [editorSchema, defaultConfig]);

  const debouncedValuesForTree = useDebouncedValue(values, 140);

  const treeConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    return applyValuesToThemeConfig(defaultConfig, debouncedValuesForTree, editorSchema);
  }, [defaultConfig, debouncedValuesForTree, editorSchema]);

  const sectionsTree = useMemo(
    () =>
      editorSchema
        ? buildShopifySidebarTree(
            editorSchema,
            debouncedValuesForTree,
            previewPage,
            itemOrder,
            treeConfig as Record<string, unknown>
          )
        : [],
    [editorSchema, debouncedValuesForTree, previewPage, itemOrder, treeConfig]
  );
  const themeSettingsTree = useMemo(
    () => (editorSchema ? buildThemeSettingsSidebarTree(editorSchema) : []),
    [editorSchema]
  );
  const activeTree = sidebarTab === 'sections' ? sectionsTree : themeSettingsTree;

  const treeInitRef = useRef(false);
  useEffect(() => {
    if (!activeTree.length) return;
    if (!treeInitRef.current) {
      treeInitRef.current = true;
      setExpanded(defaultExpandedSidebar(activeTree));
    }
  }, [activeTree, sidebarTab]);

  const hydrateEditor = useCallback(
    (data: Awaited<ReturnType<typeof load>>) => {
      if (!data) return;
      treeInitRef.current = false;
      setSelectedNodeId('');
      setThemeName(data.themeName);
      setEditorSchema((data.editorSchema ?? null) as EditorSchemaDoc | null);
      const packDefault = JSON.parse(
        JSON.stringify(data.defaultConfig ?? {})
      ) as Record<string, unknown>;
      const working = JSON.parse(
        JSON.stringify((data.config ?? data.defaultConfig) as Record<string, unknown>)
      ) as Record<string, unknown>;
      mergeLayoutSectionDefaults(working, packDefault, 'header');
      mergeLayoutSectionDefaults(working, packDefault, 'announcement_bar');
      mergeLayoutSectionDefaults(working, packDefault, 'footer');
      mergeLayoutSectionDefaults(working, packDefault, 'footer_utilities');
      mergeTemplateSectionDefaults(working, packDefault, 'index', 'featured_collection');
      for (const tplId of Object.keys(
        (packDefault.templates ?? {}) as Record<string, unknown>
      )) {
        mergeTemplateSectionBlueprintsFromPack(working, packDefault, tplId);
      }
      // Clear legacy footer newsletter copy so the preview shows input-only signup.
      for (const section of Object.values((working.sections ?? {}) as Record<string, unknown>)) {
        const sec = section as Record<string, unknown>;
        if (sec?.type !== 'footer') continue;
        const blocks = (sec.blocks ?? {}) as Record<string, unknown>;
        const newsletter = (blocks.newsletter ?? null) as Record<string, unknown> | null;
        if (!newsletter) continue;
        const ns = ((newsletter.settings ?? {}) as Record<string, unknown>) || {};
        ns.title = '';
        ns.subtitle = '';
        newsletter.settings = ns;
        blocks.newsletter = newsletter;
        sec.blocks = blocks;
      }
      sanitizeThemeConfigStructure(working);
      ensureThemeButtonsDefaults(working);
      ensureThemeLogoFaviconDefaults(working);
      ensureThemeTypographyDefaults(working);
      ensureThemeColorPaletteDefaults(working);
      packDefaultRef.current = packDefault;
      setDefaultConfig(working);
      const schema = (data.editorSchema ?? null) as EditorSchemaDoc | null;
      setValues(
        schema
          ? {
              ...formValuesFromEditorConfig(schema, working),
              ...seedSectionEnabledValues(working),
              ...seedThemeButtonsValues({}, working),
              ...seedThemeLogoFaviconValues({}, working),
              ...seedThemeTypographyValues({}, working),
              ...seedThemePaletteValues({}, working),
            }
          : {
              ...data.values,
              ...seedThemeButtonsValues({}, working),
              ...seedThemeLogoFaviconValues({}, working),
              ...seedThemeTypographyValues({}, working),
              ...seedThemePaletteValues({}, working),
            }
      );
      setItemOrder(readStructureOrderFromConfig(working, previewPage));
      setManifest(data.manifest);
      setBlockCatalog(data.blockCatalog);
      setThemeRuntime(data.themeRuntime);
      setCanPersist(data.canPersist);
      setEditorNotice(data.notice ?? null);
    },
    []
  );

  const reloadEditor = useCallback(async () => {
    if (!themeId) return;
    const storeId = staticDevMode
      ? activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId
      : activeStoreId;
    if (!storeId) return;
    setError(null);
    const data = await load(storeId, themeId);
    hydrateEditor(data);
  }, [themeId, activeStoreId, load, hydrateEditor, staticDevMode]);

  useEffect(() => {
    void reloadEditor();
  }, [reloadEditor]);

  const handleDevPackChange = useCallback(
    async (packId: DevStaticThemePackId) => {
      if (packId === devPackId) return;
      setPackSwitching(true);
      setStaticDevPackId(packId);
      setDevPackId(packId);
      setSelectedNodeId('');
      setAddBlockTarget(null);
      setPreviewPage('index');
      try {
        await reloadEditor();
        toast.success(`Switched to ${displayNameForDevPack(packId)}`);
      } catch (err: unknown) {
        toast.error((err as Error)?.message ?? 'Failed to switch theme pack');
      } finally {
        setPackSwitching(false);
      }
    },
    [devPackId, reloadEditor]
  );

  const handleClearDevEditorCache = useCallback(async () => {
    if (!staticDevMode) return;
    setPackSwitching(true);
    try {
      clearStaticThemeConfigLocal(devPackId);
      setSelectedNodeId('');
      setAddBlockTarget(null);
      setSidebarTab('sections');
      await reloadEditor();
      toast.success('Local editor cache cleared');
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Failed to clear local cache');
    } finally {
      setPackSwitching(false);
    }
  }, [staticDevMode, devPackId, reloadEditor]);

  useEffect(() => {
    if (loadError) setError(loadError);
  }, [loadError]);

  useEffect(() => {
    if (activeStoreId) getByStoreId(activeStoreId);
  }, [activeStoreId, getByStoreId]);

  useEffect(
    () => () => {
      if (previewAnimTimerRef.current != null) {
        window.clearTimeout(previewAnimTimerRef.current);
      }
    },
    []
  );

  const selectedNode = useMemo(
    () => findSidebarNode(activeTree, selectedNodeId),
    [activeTree, selectedNodeId]
  );

  const livePreviewConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    return applyValuesToThemeConfig(defaultConfig, values, editorSchema);
  }, [defaultConfig, values, editorSchema]);

  const themeColorPalette = useMemo(
    () => readThemeColorPalette(livePreviewConfig),
    [livePreviewConfig]
  );

  const debouncedConfigForHints = useDebouncedValue(livePreviewConfig, 320);

  const selectionHints = useMemo(
    () => buildThemeEditorSelectionHints(editorSchema, debouncedConfigForHints, previewPage),
    [editorSchema, debouncedConfigForHints, previewPage, structureSyncKey]
  );

  const productPreviewRoute = useMemo(
    () => resolveProductTemplatePreviewRoute(previewPage, previewProductHandle),
    [previewPage, previewProductHandle]
  );
  const collectionPreviewRoute = useMemo(
    () => resolveCollectionTemplatePreviewRoute(previewPage, previewCollectionHandle),
    [previewPage, previewCollectionHandle]
  );
  const blogsPreviewRoute = useMemo(
    () => resolveBlogsTemplatePreviewRoute(previewPage, previewBlogHandle),
    [previewPage, previewBlogHandle]
  );
  const blogPostsPreviewRoute = useMemo(
    () => resolveBlogPostsTemplatePreviewRoute(previewPage, previewBlogPostSelection),
    [previewPage, previewBlogPostSelection]
  );
  const entityPreviewRoute =
    productPreviewRoute ?? collectionPreviewRoute ?? blogsPreviewRoute ?? blogPostsPreviewRoute;

  const previewStoreId = useMemo(
    () =>
      staticDevMode
        ? activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId
        : activeStoreId ?? '',
    [staticDevMode, activeStoreId]
  );

  const activeStoreName = useMemo(
    () =>
      stores.find((s) => s._id === previewStoreId)?.storeName ??
      (staticDevMode ? 'Preview store' : 'Store'),
    [stores, previewStoreId, staticDevMode]
  );

  const pageMenuItems = useMemo(
    () => buildThemeEditorPageMenu(manifest, editorSchema),
    [manifest, editorSchema]
  );

  const pageLabel =
    findPageMenuItemByPreview(pageMenuItems, previewPage)?.label ?? 'Home page';

  const handlePreviewPageChange = useCallback(
    (page: ThemePreviewPage) => {
      if (page === previewPage) return;
      setPreviewPage(page);
      setSelectedNodeId('');
      setAddBlockTarget(null);
      setAddSectionTarget(null);
      setInsertHoverHighlight(null);
      treeInitRef.current = false;
      const orderSource = defaultConfig;
      if (orderSource) {
        setItemOrder(readStructureOrderFromConfig(orderSource, page));
      }
    },
    [defaultConfig, previewPage]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFieldChange = useCallback(
    (path: string, type: FieldType, raw: string | boolean) => {
      startTransition(() => {
        setValues((prev) => {
          const next: Record<string, string | boolean> = {
            ...prev,
            [path]: type === 'boolean' ? Boolean(raw) : String(raw),
          };
          // Keep header logo in sync with global default so preview updates immediately.
          if (path === THEME_LOGO_DEFAULT_PATH && type === 'text') {
            const url = String(raw);
            next['sections.header.settings.defaultLogoUrl'] = url;
            next['sections.header.blocks.logo.settings.imageUrl'] = url;
          }
          if (
            path === THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH ||
            path === THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH
          ) {
            Object.assign(
              next,
              syncThemeTypographyFontFields({
                body: next[THEME_TYPOGRAPHY_FONT_BODY_KEY_PATH],
                subheading: next[THEME_TYPOGRAPHY_FONT_SUBHEADING_KEY_PATH],
                heading: next[THEME_TYPOGRAPHY_FONT_HEADING_KEY_PATH],
                accent: next[THEME_TYPOGRAPHY_FONT_ACCENT_KEY_PATH],
              })
            );
          }
          return next;
        });
      });
      bumpValuesSync();
    },
    [bumpValuesSync]
  );

  /** Palette edits sync to background / text / accent tokens (Shopify-style). */
  const handleThemePaletteChange = useCallback(
    (colors: string[]) => {
      const fieldUpdates = syncThemePaletteToFieldValues(colors);
      startTransition(() => {
        setValues((prev) => ({ ...prev, ...fieldUpdates }));
        setDefaultConfig((prev) => {
          if (!prev) return prev;
          const config = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
          setConfigAtPath(config, 'settings.colors.palette', colors);
          for (const [path, value] of Object.entries(fieldUpdates)) {
            if (!path.startsWith('settings.colors.palette.')) {
              setConfigAtPath(config, path, value);
            }
          }
          return config;
        });
      });
      bumpValuesSync();
    },
    [bumpValuesSync]
  );

  const handleStoreMenuSelect = useCallback(
    (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => {
      const menuMeta = {
        _id: String(menu._id),
        menuName: String(menu.menuName ?? ''),
      };
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const { config, itemValuePaths, itemsPath, navItemCount } = applyStoreMenuSelectionToConfig(
          prev,
          menuFieldPath,
          menuMeta,
          items
        );
        pendingStoreMenuValueSyncRef.current = {
          itemValuePaths,
          itemsPath,
          navItemCount,
        };
        return config;
      });
      bumpValuesSync();
    },
    [bumpValuesSync]
  );

  useLayoutEffect(() => {
    const pending = pendingStoreMenuValueSyncRef.current;
    if (!pending) return;
    pendingStoreMenuValueSyncRef.current = null;
    setValues((v) => ({
      ...pruneStaleHeaderMenuItemValues(v, pending.itemsPath, pending.navItemCount),
      ...pending.itemValuePaths,
    }));
    if (defaultConfig) {
      setItemOrder(readStructureOrderFromConfig(defaultConfig, previewPage));
    }
  }, [defaultConfig, previewPage]);

  const handlePreviewSelect = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === nodeId) {
        setSelectedNodeId('');
        setAddBlockTarget(null);
        return;
      }
      if (
        nodeId.startsWith('field:') ||
        nodeId.startsWith('template:') ||
        nodeId.startsWith('layout:')
      ) {
        setSidebarTab('sections');
      }
      setAddBlockTarget(null);
      const sidebarNodeId =
        announcementBlockNodeIdFromSelection(nodeId) ??
        headerBlockNodeIdFromSelection(nodeId) ??
        watchFooterBlockNodeIdFromSelection(nodeId) ??
        nodeId;
      setSelectedNodeId(sidebarNodeId);
      setExpanded((prev) => ({
        ...prev,
        ...expandedIdsForPreviewNode(sidebarNodeId, sectionsTree),
        ...(sidebarNodeId !== nodeId ? expandedIdsForPreviewNode(nodeId, sectionsTree) : {}),
      }));
    },
    [selectedNodeId, sectionsTree]
  );

  const handlePreviewFieldChange = useCallback(
    (fieldPath: string, value: string) => {
      const schemaType = schemaFieldTypes.get(fieldPath);
      const type = schemaType ? fieldTypeFromSchema(schemaType) : 'text';
      startTransition(() => {
        setValues((prev) => ({
          ...prev,
          [fieldPath]: type === 'boolean' ? value === 'true' || value === '1' : value,
        }));
      });
      bumpValuesSync();
    },
    [schemaFieldTypes, bumpValuesSync]
  );

  const handlePreviewAction = useCallback((action: 'hide' | 'duplicate' | 'delete', nodeId: string) => {
    if (action === 'hide') {
      setHiddenNodes((prev) => ({ ...prev, [nodeId]: true }));
      toast('Section hidden in preview', { icon: '👁' });
      return;
    }
    if (action === 'delete') {
      toast('Remove block — save in sidebar when ready', { icon: 'ℹ️' });
    }
  }, []);

  const handleToggleDevice = useCallback(() => {
    setDevice((current) => {
      const next = current === 'mobile' ? 'desktop' : 'mobile';
      setPreviewAnimDir(next === 'mobile' ? 'to-mobile' : 'to-desktop');
      if (previewAnimTimerRef.current != null) {
        window.clearTimeout(previewAnimTimerRef.current);
      }
      previewAnimTimerRef.current = window.setTimeout(() => {
        setPreviewAnimDir(null);
        previewAnimTimerRef.current = null;
      }, 240);
      return next;
    });
  }, []);

  const handleInspectorEnabledChange = useCallback((enabled: boolean) => {
    setInspectorEnabled(enabled);
    if (!enabled) {
      setSelectedNodeId('');
      setInsertHoverHighlight(null);
    }
  }, []);

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
      handleInspectorEnabledChange(!inspectorEnabled);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInspectorEnabledChange, inspectorEnabled]);

  const handleReorder = useCallback(
    (listKey: string, orderedIds: string[]) => {
      setItemOrder((prev) => mergeItemOrder(prev, listKey, orderedIds));
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
        applyStructureOrderToConfig(next, listKey, orderedIds, previewPage);
        return next;
      });
      setStructureSyncKey((k) => k + 1);
    },
    [previewPage]
  );

  const handleSave = async () => {
    if (!themeId || !canPersist || !defaultConfig || !editorSchema) return;
    const configToSave = applyValuesToThemeConfig(defaultConfig, values, editorSchema);
    const toastId = toast.loading(staticDevMode ? 'Saving locally…' : 'Saving theme…');

    if (staticDevMode) {
      if (!defaultConfig || !editorSchema) return;
      try {
        const merged = mergedConfigFromFormValues(defaultConfig, values, editorSchema);
        saveStaticThemeConfigLocal(merged);
        const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
        const refreshed = await load(storeId, themeId);
        if (refreshed) hydrateEditor(refreshed);
        toast.success('Saved to browser (static dev mode)', { id: toastId });
      } catch (err: unknown) {
        toast.error((err as Error)?.message ?? 'Failed to save', { id: toastId });
      }
      return;
    }

    if (!activeStoreId) return;
    try {
      const { data: body } = await axiosi.put<{ success: boolean; data?: Awaited<ReturnType<typeof load>> }>(
        `/store-theme-config/${activeStoreId}/${themeId}`,
        { config: configToSave }
      );
      if (body?.success && body.data) {
        hydrateEditor(body.data as Awaited<ReturnType<typeof load>>);
        toast.success('Theme saved', { id: toastId });
      } else {
        throw new Error('Save failed');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to save theme';
      toast.error(msg, { id: toastId });
    }
  };

  const settingsNode = useMemo(
    () => settingsNodeForSelection(selectedNode, activeTree, editorSchema),
    [selectedNode, activeTree, editorSchema]
  );

  const closeSettings = useCallback(() => {
    setSelectedNodeId('');
  }, []);

  const handleRemoveSettingsSection = useCallback(() => {
    if (!settingsNode || !defaultConfig || !editorSchema) return;

    const layout = settingsNode.id.match(/^layout:(.+)$/);
    if (layout) {
      const instanceId = layout[1]!;
      const order = getLayoutOrder(defaultConfig);
      const groupId: 'header' | 'footer' = order.footer?.includes(instanceId) ? 'footer' : 'header';
      const next = removeLayoutSection(defaultConfig, instanceId, groupId);
      if (!next) {
        toast.error('This section cannot be removed');
        return;
      }
      const pruned = pruneValuesForLayoutInstance(values, instanceId);
      setDefaultConfig(next);
      setValues(pruned);
      setItemOrder((prev) => {
        const listKey = groupId === 'header' ? 'sections:header' : 'sections:footer';
        const ids = (prev[listKey] ?? []).filter((id) => id !== `layout:${instanceId}`);
        return { ...prev, [listKey]: ids };
      });
      setSelectedNodeId('');
      setStructureSyncKey((k) => k + 1);
      if (staticDevMode) {
        saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
      }
      toast.success('Section removed');
      return;
    }

    const tpl = settingsNode.id.match(/^template:([^:]+):(.+)$/);
    if (tpl) {
      const [, tplId, instanceId] = tpl;
      const next = removeTemplateSection(defaultConfig, tplId, instanceId);
      if (!next) {
        toast.error('This section cannot be removed');
        return;
      }
      const pruned = pruneValuesForTemplateInstance(values, tplId, instanceId);
      setDefaultConfig(next);
      setValues(pruned);
      setItemOrder((prev) => {
        const listKey = `sections:template:${tplId}`;
        return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== settingsNode.id) };
      });
      setSelectedNodeId('');
      setStructureSyncKey((k) => k + 1);
      if (staticDevMode) {
        saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
      }
      toast.success('Section removed');
      return;
    }

    toast.error('This section cannot be removed here');
  }, [defaultConfig, settingsNode, editorSchema, values, staticDevMode]);

  const handleDeleteSidebarNode = useCallback(
    (nodeId: string) => {
      if (!defaultConfig) return;

      const layoutBlock = nodeId.match(/^layout:([^:]+):block:([^:]+)$/);
      if (layoutBlock) {
        const [, sectionInstanceId, blockId] = layoutBlock;
        const next = removeLayoutBlock(defaultConfig, sectionInstanceId, blockId);
        if (!next) {
          toast.error('This block cannot be removed');
          return;
        }
        setValues((prev) => {
          const pruned = pruneValuesForLayoutBlock(prev, sectionInstanceId, blockId);
          setDefaultConfig(next);
          if (staticDevMode && editorSchema) {
            saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
          }
          return pruned;
        });
        setItemOrder((prev) => {
          const listKey = `blocks:layout:${sectionInstanceId}`;
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId(`layout:${sectionInstanceId}`);
          setAddBlockTarget(null);
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }

      const templateBlock = nodeId.match(/^template:([^:]+):([^:]+):block:([^:]+)$/);
      if (templateBlock) {
        const [, tplId, sectionInstanceId, blockId] = templateBlock;
        const next = removeTemplateBlock(defaultConfig, tplId, sectionInstanceId, blockId);
        if (!next) {
          toast.error('This block cannot be removed');
          return;
        }
        setValues((prev) => {
          const pruned = pruneValuesForTemplateBlock(prev, tplId, sectionInstanceId, blockId);
          setDefaultConfig(next);
          if (staticDevMode && editorSchema) {
            saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
          }
          return pruned;
        });
        setItemOrder((prev) => {
          const listKey = `blocks:template:${tplId}:${sectionInstanceId}`;
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId(`template:${tplId}:${sectionInstanceId}`);
          setAddBlockTarget(null);
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }
      if (nodeId.includes(':block:')) {
        toast.error('This block cannot be removed');
        return;
      }

      const layout = nodeId.match(/^layout:(.+)$/);
      if (layout) {
        const instanceId = layout[1];
        const order = getLayoutOrder(defaultConfig);
        const groupId: 'header' | 'footer' = order.footer?.includes(instanceId) ? 'footer' : 'header';
        const next = removeLayoutSection(defaultConfig, instanceId, groupId);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setValues((prev) => {
          const pruned = pruneValuesForLayoutInstance(prev, instanceId);
          setDefaultConfig(next);
          if (staticDevMode && editorSchema) {
            saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
          }
          return pruned;
        });
        setItemOrder((prev) => {
          const listKey = groupId === 'header' ? 'sections:header' : 'sections:footer';
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
          setAddBlockTarget(null);
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      const tpl = nodeId.match(/^template:([^:]+):(.+)$/);
      if (tpl) {
        const [, tplId, instanceId] = tpl;
        const next = removeTemplateSection(defaultConfig, tplId, instanceId);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setValues((prev) => {
          const pruned = pruneValuesForTemplateInstance(prev, tplId, instanceId);
          setDefaultConfig(next);
          if (staticDevMode && editorSchema) {
            saveStaticThemeConfigLocal(mergedConfigFromFormValues(next, pruned, editorSchema));
          }
          return pruned;
        });
        setItemOrder((prev) => {
          const listKey = `sections:template:${tplId}`;
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
          setAddBlockTarget(null);
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      toast.error('This section cannot be removed');
    },
    [defaultConfig, selectedNodeId, staticDevMode, editorSchema]
  );

  const handleRemoveSettingsBlock = useCallback(() => {
    if (!settingsNode || !defaultConfig) return;
    const m = settingsNode.id.match(/^layout:(announcement_bar(?:_\d+)?):block:(.+)$/);
    if (!m) {
      toast.error('This block cannot be removed here');
      return;
    }
    const [, sectionInstanceId, blockId] = m;
    const next = removeLayoutBlock(defaultConfig, sectionInstanceId, blockId);
    if (!next) {
      toast.error('At least one announcement is required');
      return;
    }
    setDefaultConfig(next);
    setValues((prev) => pruneValuesForLayoutBlock(prev, sectionInstanceId, blockId));
    setSelectedNodeId(`layout:${sectionInstanceId}`);
    setStructureSyncKey((k) => k + 1);
    toast.success('Block removed');
  }, [defaultConfig, settingsNode]);

  if (!staticDevMode && !activeStoreId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-600">Select a store first.</p>
      </div>
    );
  }

  const showBlockingOverlay = packSwitching || (loading && !editorSchema);

  return (
    <div className="fixed inset-0 z-[1310] flex flex-col bg-[#1e1e1e]">
      {showBlockingOverlay ? (
        <EditorBlockingOverlay
          label={packSwitching ? 'Switching theme…' : 'Loading theme editor…'}
        />
      ) : null}
      {/* Top bar — Shopify-style: theme name | page picker (center) | actions */}
      <header className="relative grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-gray-200 bg-white px-3">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <span className="truncate text-sm font-semibold text-gray-900">
            {themeName || 'Theme'}
          </span>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            Active
          </span>
          {staticDevMode ? (
            <span className="hidden shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:inline">
              Dev
            </span>
          ) : null}
        </div>

        <div className="justify-self-center">
          <ThemeEditorPagePicker
            value={previewPage}
            onChange={handlePreviewPageChange}
            manifest={manifest}
            editorSchema={editorSchema}
          />
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          {staticDevMode && DEV_STATIC_THEME_PACKS.length > 1 ? (
            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">
              <span className="hidden text-xs font-medium text-gray-500 sm:inline">Theme</span>
              <DevThemePackSwitcher
                value={devPackId}
                onChange={(id) => void handleDevPackChange(id)}
                disabled={packSwitching || loading}
              />
            </div>
          ) : staticDevMode ? (
            <span className="border-r border-gray-200 pr-2 text-xs font-semibold text-gray-700">Horizon</span>
          ) : null}
          {staticDevMode ? (
            <button
              type="button"
              onClick={() => void handleClearDevEditorCache()}
              disabled={packSwitching || loading}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              title={`Clear local editor cache (${configLocalStorageKeyForPack(devPackId)})`}
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Clear cache</span>
            </button>
          ) : null}
          {storeSubdomain?.url ? (
            <a
              href={storeSubdomain.url}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1 rounded-lg px-2 text-sm text-gray-600 hover:bg-gray-100 sm:flex"
              title="Open live storefront"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => handleInspectorEnabledChange(!inspectorEnabled)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 ${
              inspectorEnabled ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
            }`}
            title={
              inspectorEnabled
                ? `Deactivate inspector ${shiftShortcutLabel('I')}`
                : `Activate inspector ${shiftShortcutLabel('I')}`
            }
            aria-pressed={inspectorEnabled}
            aria-keyshortcuts="Shift+I"
            aria-label={
              inspectorEnabled
                ? `Deactivate inspector (${shiftShortcutLabel('I')})`
                : `Activate inspector (${shiftShortcutLabel('I')})`
            }
          >
            <InspectorToggleIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleToggleDevice}
            className={`create-theme-device-toggle flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 ${
              device === 'mobile' ? 'create-theme-device-toggle--mobile text-gray-900' : 'text-gray-600'
            }`}
            title={device === 'mobile' ? 'Return to desktop preview' : 'Switch to mobile preview'}
            aria-pressed={device === 'mobile'}
          >
            <DevicePhoneMobileIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={saving || loading || !canPersist}
            onClick={handleSave}
            className="ml-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <ThemeEditorSidebar
          pageLabel={pageLabel}
          sectionsHeaderSlot={
            isProductTemplatePreviewPage(previewPage) ? (
              <ProductTemplatePreviewCard
                previewProductHandle={previewProductHandle}
                onPreviewProductHandleChange={setPreviewProductHandle}
                storefrontOrigin={storeSubdomain?.url ?? null}
              />
            ) : isCollectionTemplatePreviewPage(previewPage) ? (
              <CollectionTemplatePreviewCard
                previewCollectionHandle={previewCollectionHandle}
                onPreviewCollectionHandleChange={setPreviewCollectionHandle}
                storefrontOrigin={storeSubdomain?.url ?? null}
              />
            ) : isBlogsTemplatePreviewPage(previewPage) ? (
              <BlogTemplatePreviewCard
                previewBlogHandle={previewBlogHandle}
                onPreviewBlogHandleChange={setPreviewBlogHandle}
                storefrontOrigin={storeSubdomain?.url ?? null}
              />
            ) : isBlogPostsTemplatePreviewPage(previewPage) ? (
              <BlogPostTemplatePreviewCard
                previewSelection={previewBlogPostSelection}
                onPreviewSelectionChange={setPreviewBlogPostSelection}
                storefrontOrigin={storeSubdomain?.url ?? null}
              />
            ) : null
          }
          sidebarTab={sidebarTab}
          onSidebarTabChange={(tab) => {
            setSidebarTab(tab);
            if (tab === 'theme-settings') {
              setSelectedNodeId('');
              setAddBlockTarget(null);
            }
          }}
          onExit={() => navigate('/themes/all-themes')}
          tree={activeTree}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          selectedNodeId={selectedNodeId}
          onSelectNode={(node) => {
            if (node.kind === 'add-block') {
              const available = getAddBlockCatalogItems(
                blockCatalog,
                editorSchema,
                node.id
              );
              if (!available.length) return;
              if (selectedNodeId === node.id) {
                setSelectedNodeId('');
                setAddBlockTarget(null);
                return;
              }
              setSelectedNodeId(node.id);
              setAddBlockTarget({
                nodeId: node.id,
                sectionLabel: resolveAddBlockSectionLabel(node.id, activeTree),
              });
              return;
            }
            if (node.kind === 'add-section') {
              const group = resolveAddSectionGroup(node.id);
              let afterNodeId: string | undefined;
              let beforeNodeId: string | undefined;
              if (group.groupId === 'header') {
                const order = itemOrder['sections:header'] ?? [];
                afterNodeId = order[order.length - 1];
              } else if (group.groupId === 'footer') {
                const order = itemOrder['sections:footer'] ?? [];
                beforeNodeId = order[0];
              } else {
                const order = itemOrder[`sections:template:${previewPage}`] ?? [];
                afterNodeId = order[order.length - 1];
              }
              openAddSectionModal({
                groupId: group.groupId,
                groupLabel: group.groupLabel,
                afterNodeId,
                beforeNodeId,
              });
              return;
            }
            if (selectedNodeId === node.id) {
              setSelectedNodeId('');
              setAddBlockTarget(null);
              return;
            }
            setAddBlockTarget(null);
            setSelectedNodeId(node.id);
            if (node.fields?.length || node.children?.length) {
              setExpanded((prev) => ({
                ...prev,
                [node.id]: true,
                ...expandedIdsForPreviewNode(node.id, sectionsTree),
              }));
            }
          }}
          hiddenNodes={hiddenNodes}
          visibilityValues={values}
          onToggleHidden={(id) => {
            const path = sectionEnabledPathFromNodeId(id);
            if (path) {
              const current = values[path] !== false && values[path] !== 'false';
              handleFieldChange(path, 'boolean', !current);
              return;
            }
            setHiddenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
          }}
          onDeleteNode={handleDeleteSidebarNode}
          onReorder={handleReorder}
          onInsertSection={openAddSectionModal}
          onInsertHoverChange={setInsertHoverHighlight}
          loading={loading}
          error={error}
          settingsNode={settingsNode}
          settingsValues={values}
          onSettingsFieldChange={handleFieldChange}
          onCloseSettings={closeSettings}
          onRemoveSettingsSection={handleRemoveSettingsSection}
          onRemoveSettingsBlock={handleRemoveSettingsBlock}
          onStoreMenuSelect={handleStoreMenuSelect}
          themeSettingsValues={values}
          themeSettingsColorPalette={themeColorPalette}
          onThemeSettingsFieldChange={handleFieldChange}
          onThemePaletteChange={handleThemePaletteChange}
        />

        {/* Preview canvas */}
        <div
          className={`theme-editor-preview-stage flex min-h-0 min-w-0 flex-1 flex-col ${
            device === 'mobile' ? 'theme-editor-preview-stage--mobile' : ''
          } ${
            previewAnimDir === 'to-mobile'
              ? 'theme-editor-preview-stage--slide-in-right'
              : previewAnimDir === 'to-desktop'
                ? 'theme-editor-preview-stage--slide-in-left'
                : ''
          }`}
        >
          <div
            className={`theme-editor-preview-canvas relative mx-auto flex min-h-0 flex-1 flex-col overflow-hidden bg-white ${
              device === 'mobile'
                ? 'theme-editor-preview-canvas--mobile'
                : 'theme-editor-preview-canvas--desktop'
            }`}
          >
            <ThemeLivePreviewFrame
              key={`${devPackId}-${themeRuntime.jsUrl ?? 'no-js'}`}
              className="h-full min-h-0 w-full flex-1"
                storeId={previewStoreId}
                storeName={activeStoreName}
                storefrontOrigin={storeSubdomain?.url ?? null}
                storefrontLoading={subdomainLoading}
                jsUrl={themeRuntime.jsUrl}
                cssUrl={themeRuntime.cssUrl}
                config={livePreviewConfig}
                structureSyncKey={structureSyncKey}
                valuesSyncKey={valuesSyncKey}
                page={previewPage}
                previewRoute={entityPreviewRoute}
                selectionHints={selectionHints}
                highlightNodeId={inspectorEnabled ? selectedNodeId || null : null}
                inspectorEnabled={inspectorEnabled}
                onPreviewSelect={({ nodeId }) => handlePreviewSelect(nodeId)}
                onPreviewDeselect={() => {
                  setSelectedNodeId('');
                  setAddBlockTarget(null);
                }}
                onPreviewFieldChange={handlePreviewFieldChange}
                onPreviewAction={handlePreviewAction}
                insertHoverHighlight={insertHoverHighlight}
                onPreviewInsertSection={(payload) => {
                  const anchor = payload.afterNodeId ?? payload.beforeNodeId ?? '';
                  const group = resolveSectionCatalogGroupFromNodeId(anchor);
                  openAddSectionModal({ ...group, ...payload });
                }}
              />
          </div>
        </div>
      </div>

      <AddBlockModal
        open={Boolean(addBlockTarget)}
        sectionLabel={addBlockTarget?.sectionLabel}
        themeBlockCatalog={blockCatalog}
        editorSchema={editorSchema ?? undefined}
        addBlockNodeId={addBlockTarget?.nodeId}
        onClose={() => setAddBlockTarget(null)}
        onSelectBlock={(block: BlockCatalogItem) => {
          if (!addBlockTarget || !defaultConfig || !editorSchema) return;
          const result = insertBlockFromCatalog(
            defaultConfig,
            addBlockTarget.nodeId,
            block.id,
            editorSchema
          );
          setAddBlockTarget(null);
          if (!result) {
            toast.error(`Could not add ${block.label}`);
            return;
          }
          const nextValues =
            result.scope === 'template'
              ? templateBlueprintKey(result.sectionInstanceId) === 'hero_main'
                ? extendValuesForHeroBlock(
                    values,
                    editorSchema,
                    'template',
                    result.templateId,
                    result.sectionInstanceId,
                    result.blockInstanceId,
                    block.id,
                    result.config
                  )
                : extendValuesForTemplateBlock(
                    values,
                    editorSchema,
                    result.templateId ?? templateIdForPage(previewPage),
                    result.sectionInstanceId,
                    result.blockInstanceId,
                    block.id,
                    result.config
                  )
              : layoutBlueprintKey(result.sectionInstanceId) === 'hero_main'
                ? extendValuesForHeroBlock(
                    values,
                    editorSchema,
                    'layout',
                    undefined,
                    result.sectionInstanceId,
                    result.blockInstanceId,
                    block.id,
                    result.config
                  )
                : extendValuesForLayoutBlock(
                    values,
                    editorSchema,
                    result.sectionInstanceId,
                    result.blockInstanceId,
                    block.id,
                    result.config
                  );
          setDefaultConfig(result.config);
          setValues(nextValues);
          if (staticDevMode) {
            saveStaticThemeConfigLocal(
              mergedConfigFromFormValues(result.config, nextValues, editorSchema)
            );
          }
          setItemOrder(readStructureOrderFromConfig(result.config, previewPage));
          setSelectedNodeId(result.nodeId);
          const sectionExpandKey =
            result.scope === 'template' && result.templateId
              ? `template:${result.templateId}:${result.sectionInstanceId}`
              : `layout:${result.sectionInstanceId}`;
          setExpanded((prev) => ({
            ...prev,
            [sectionExpandKey]: true,
            [result.nodeId]: true,
          }));
          setStructureSyncKey((k) => k + 1);
          toast.success(`Added ${block.label}`);
        }}
      />

      <AddSectionModal
        open={Boolean(addSectionTarget)}
        groupId={addSectionTarget?.groupId ?? 'header'}
        groupLabel={addSectionTarget?.groupLabel ?? 'Header'}
        onClose={() => setAddSectionTarget(null)}
        onSelectSection={(section: SectionCatalogItem) => {
          if (!defaultConfig || !editorSchema || !addSectionTarget) return;
          const ctx: SectionInsertContext = {
            groupId: addSectionTarget.groupId,
            groupLabel: addSectionTarget.groupLabel,
            afterNodeId: addSectionTarget.afterNodeId,
            beforeNodeId: addSectionTarget.beforeNodeId,
          };
          const result = insertSectionFromCatalog(
            defaultConfig as Record<string, unknown>,
            section,
            ctx,
            editorSchema,
            previewPage,
            packDefaultRef.current
          );
          setAddSectionTarget(null);
          if (!result) {
            toast.error(`Could not add ${section.label}`);
            return;
          }
          setDefaultConfig(result.config);
          const nextValues =
            ctx.groupId === 'header' || ctx.groupId === 'footer'
              ? {
                  ...formValuesFromEditorConfig(editorSchema, result.config),
                  ...extendValuesForLayoutInstance(
                    {},
                    editorSchema,
                    layoutBlueprintKey(result.instanceId),
                    result.instanceId,
                    result.config
                  ),
                  ...seedSectionEnabledValues(result.config),
                }
              : {
                  ...formValuesFromEditorConfig(editorSchema, result.config),
                  ...extendValuesForTemplateInstance(
                    {},
                    editorSchema,
                    templateIdForPage(previewPage),
                    templateBlueprintKey(result.instanceId),
                    result.instanceId,
                    result.config
                  ),
                  ...seedSectionEnabledValues(result.config),
                };
          setValues(nextValues);
          setItemOrder(readStructureOrderFromConfig(result.config, previewPage));
          treeInitRef.current = false;
          setSelectedNodeId(result.nodeId);
          setExpanded((prev) => ({
            ...prev,
            'group:header': true,
            'group:template': true,
            'group:footer': true,
            [result.nodeId]: true,
          }));
          setStructureSyncKey((k) => k + 1);
          bumpValuesSync();
          if (staticDevMode) {
            saveStaticThemeConfigLocal(
              mergedConfigFromFormValues(result.config, nextValues, editorSchema),
              devPackId
            );
          }
          toast.success(`Added ${section.label}`);
        }}
      />

    </div>
  );
};

export default SectionThemeConfigEditor;
