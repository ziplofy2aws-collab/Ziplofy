import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ThemeEditorLiveConfigModal from '../components/themes/ThemeEditorLiveConfigModal';
import {
  CreateThemeEditorSidebar,
  buildEmptyShopifySidebarTree,
  buildShopifySidebarTree,
  buildThemeSettingsSidebarTree,
  defaultExpandedSidebar,
  findSidebarNode,
  settingsNodeForSelection,
  resolveAddBlockSectionLabel,
  resolveAddSectionGroup,
  resolveSectionCatalogGroupFromNodeId,
  applyStructureOrderToConfig,
  mergeItemOrder,
  readStructureOrderFromConfig,
  withCreatorSidebarDeleteFlags,
  type EditorSchemaDoc,
  type ThemeEditorSidebarTab,
  type SectionInsertContext,
} from './sidebar';
import { CreateThemeHeader } from './chrome/CreateThemeHeader';
import CreateThemeLivePreview, { type ThemePreviewPage } from './chrome/CreateThemeLivePreview';
import { PreviewSyncProgressBar } from './chrome/PreviewStatus';
import { usePreviewEditSync } from './chrome/usePreviewEditSync';
import { CreateThemePoweredByLoader } from './chrome/CreateThemePoweredByLoader';
import { buildThemeEditorPageMenu, findPageMenuItemByPreview } from './utils/page-menu';
import { ensureRegistryTemplatesInConfig } from './utils/theme-page-registry';
import {
  extendValuesForSeededTemplate,
  seedTemplateFromPackIfEmpty,
} from './utils/seed-page-template-from-pack';
import {
  buildThemeEditorSelectionHints,
  expandedIdsForPreviewNode,
} from './utils/selection-hints';
import {
  isHeadingBlockNodeId,
  extendValuesForHeadingBlock,
  mirrorHeadingTextInValues,
  parseHeadingBlockNodeId,
} from './sidebar/theme-editor-heading-block-panel.utils';
import {
  extendValuesForFaqAccordionBlock,
  isFaqAccordionBlockNodeId,
} from './sidebar/theme-editor-faq-accordion-block-panel.utils';
import {
  extendValuesForFaqAccordionRow,
  isFaqAccordionRowNestedNodeId,
} from './sidebar/theme-editor-faq-accordion-row-panel.utils';
import {
  extendValuesForLargeLogoBlock,
  isHeroLargeLogoBlockNodeId,
} from './sidebar/theme-editor-large-logo-block-panel.utils';
import {
  extendValuesForHeroTextBlock,
  isHeroTextBlockNodeId,
} from './sidebar/theme-editor-hero-text-block-panel.utils';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { THEME_EDITOR_STATIC_CONFIG } from '../config/theme-editor-static.config';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import type { Collection } from '../contexts/collection.context';
import type { StoreMenu, StoreMenuItem } from '../contexts/store-menu.context';
import {
  applyCollectionLinksSelectionToConfig,
  pruneCollectionLinkBlockValues,
  sectionBaseFromCollectionsPickerPath,
} from './utils/collection-links-collections.util';
import { applyStoreMenuSelectionToConfig } from './utils/store-menu-header.util';
import { useStoreCustomThemes } from '../contexts/store-custom-themes.context';
import {
  applyValuesToThemeConfig,
  collectEditableFieldPaths,
} from '../utils/theme-editor-config.utils';
import {
  extendValuesForFaqNestedBlock,
  extendValuesForHeroBlock,
  extendValuesForLayoutBlock,
  extendValuesForLayoutInstance,
  extendValuesForTemplateBlock,
  extendValuesForTemplateInstance,
  getLayoutOrder,
  insertBlockFromCatalog,
  pruneValuesForLayoutBlock,
  pruneValuesForLayoutInstance,
  pruneValuesForTemplateBlock,
  pruneValuesForTemplateInstance,
  layoutBlueprintKey,
  removeLayoutSection,
  removeTemplateSection,
  templateBlueprintKey,
  templateIdForPage,
  type ThemeEditorDeleteOptions,
} from '../utils/theme-editor-insert-section';
import {
  creatorConfigHasSections,
  formValuesFromEditorConfig,
  loadCreatorThemeEditorPack,
  normalizeCreatorThemeConfig,
} from '../utils/theme-editor-static-pack';
import { ensureFeaturedProductSectionBlocks } from '../utils/featured-product-preset.util';
import { ensureFaqSectionBlocks } from '../utils/faq-preset.util';
import {
  extendValuesForFaqSectionBlock,
  extendValuesForNewFaqAccordionRow,
  pruneValuesForFaqAccordionRow,
  pruneValuesForFaqRowText,
  pruneValuesForFaqSectionBlock,
} from '../utils/faq-editor-values.util';
import { mergedConfigFromFormValues } from '../utils/theme-editor-static-save';
import { fieldTypeFromSchema, type ThemeEditorFieldType } from './sidebar/create-theme-field.utils';
import {
  announcementBlockFieldDefsFromSchema,
  announcementBlockNodeIdFromSelection,
  blockInstanceIdFromAnnouncementBlockNodeId,
  instanceIdFromAnnouncementBlockNodeId,
  isAnnouncementBlockNodeId,
} from './sidebar/theme-editor-announcement-block-panel.utils';
import {
  collectionLinkImageFieldDefsFromSchema,
  isCollectionLinkImageFieldNodeId,
} from './sidebar/theme-editor-collection-link-image-panel.utils';
import {
  collectionLinkTitleFieldDefsFromSchema,
  isCollectionLinkTitleFieldNodeId,
} from './sidebar/theme-editor-collection-link-title-panel.utils';
import {
  headerMenuBlockFieldDefsFromSchema,
  instanceIdFromHeaderMenuBlockNodeId,
} from './sidebar/theme-editor-header-menu-block-panel.utils';
import { isHeaderMenuBlockNodeId } from './sidebar/theme-editor-header-panel.utils';
import {
  extendFeaturedProductDetailsBlockValues,
  featuredProductDetailsFieldDefsFromSchema,
  isFeaturedProductDetailsBlockNodeId,
} from './sidebar/theme-editor-featured-product-details-block-panel.utils';
import {
  extendFeaturedProductHeaderBlockValues,
  featuredProductHeaderFieldDefsFromSchema,
  isFeaturedProductHeaderBlockNodeId,
} from './sidebar/theme-editor-featured-product-header-block-panel.utils';
import {
  extendFeaturedProductAddToCartBlockValues,
  featuredProductAddToCartFieldDefsFromSchema,
  isFeaturedProductAddToCartNestedNodeId,
} from './sidebar/theme-editor-featured-product-add-to-cart-panel.utils';
import {
  extendFeaturedProductBuyButtonsBlockValues,
  featuredProductBuyButtonsFieldDefsFromSchema,
  isFeaturedProductBuyButtonsBlockNodeId,
} from './sidebar/theme-editor-featured-product-buy-buttons-block-panel.utils';
import {
  extendFeaturedProductHeaderPriceBlockValues,
  featuredProductHeaderPriceFieldDefsFromSchema,
  isFeaturedProductHeaderPriceNestedNodeId,
} from './sidebar/theme-editor-featured-product-header-price-panel.utils';
import {
  extendFeaturedProductHeaderTitleBlockValues,
  featuredProductHeaderTitleFieldDefsFromSchema,
  isFeaturedProductHeaderTitleNestedNodeId,
} from './sidebar/theme-editor-featured-product-header-title-panel.utils';
import {
  extendFeaturedProductReviewStarsBlockValues,
  featuredProductReviewStarsFieldDefsFromSchema,
  isFeaturedProductReviewStarsBlockNodeId,
} from './sidebar/theme-editor-featured-product-review-stars-block-panel.utils';
import {
  extendFeaturedProductVariantPickerBlockValues,
  featuredProductVariantPickerFieldDefsFromSchema,
  isFeaturedProductVariantPickerBlockNodeId,
} from './sidebar/theme-editor-featured-product-variant-picker-block-panel.utils';
import {
  extendFeaturedProductMediaBlockValues,
  featuredProductMediaFieldDefsFromSchema,
  isFeaturedProductMediaBlockNodeId,
} from './sidebar/theme-editor-featured-product-media-block-panel.utils';
import {
  seedSectionEnabledValues,
  sectionEnabledPathFromNodeId,
} from '../utils/theme-editor-section-visibility.util';
import './chrome/create-theme-chrome.css';
import { insertCreateThemeElement } from './_shared/insert-element';
import { AddBlockModal } from '../components/themes/theme-editor-sidebar/AddBlockModal';
import type { BlockCatalogItem } from '../components/themes/theme-editor-sidebar/add-block-catalog';
import type { ThemeBlockCatalogApi } from '../components/themes/theme-editor-sidebar/theme-block-catalog.adapter';
import { getCreateThemeElement } from './registry';
import { CreateThemeAddSectionModal } from './shell/CreateThemeAddSectionModal';
import { CreateThemeSaveModal } from './shell/CreateThemeSaveModal';
import type { CreateThemeCatalogGroup } from './types';

type FieldType = ThemeEditorFieldType;

const CREATOR_DELETE: ThemeEditorDeleteOptions = { creatorMode: true };

const CreateThemePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editThemeId = searchParams.get('id');
  const { activeStoreId, stores } = useStore();
  const { storeSubdomain, getByStoreId: fetchStoreSubdomain } = useStoreSubdomain();
  const {
    create: createStoreCustomTheme,
    update: updateStoreCustomTheme,
    getByStoreId,
    loading: savingTheme,
  } = useStoreCustomThemes();

  const [themeName, setThemeName] = useState('Creator Basic');
  const [savedThemeId, setSavedThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorSchema, setEditorSchema] = useState<EditorSchemaDoc | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [defaultConfig, setDefaultConfig] = useState<Record<string, unknown> | null>(null);
  const packDefaultRef = useRef<Record<string, unknown> | null>(null);
  const [manifest, setManifest] = useState<Record<string, unknown> | null>(null);
  const [blockCatalog, setBlockCatalog] = useState<ThemeBlockCatalogApi | null>(null);
  const [themeRuntime, setThemeRuntime] = useState<{ jsUrl?: string | null; cssUrl?: string | null }>({});

  const [showViewTheme, setShowViewTheme] = useState(false);
  const [previewPage, setPreviewPage] = useState<ThemePreviewPage>('index');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [inspectorEnabled, setInspectorEnabled] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<ThemeEditorSidebarTab>('sections');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});
  const [itemOrder, setItemOrder] = useState<Record<string, string[]>>({});
  const [structureSyncKey, setStructureSyncKey] = useState(0);
  const {
    committedValues,
    previewBarRunKey,
    onPreviewBarComplete,
    seedCommittedPreview,
    commitPreviewNow,
  } = usePreviewEditSync(values);
  const [insertHoverHighlight, setInsertHoverHighlight] = useState<SectionInsertContext | null>(null);
  const [addSectionTarget, setAddSectionTarget] = useState<{
    groupId: CreateThemeCatalogGroup;
    groupLabel: string;
    afterNodeId?: string;
    beforeNodeId?: string;
  } | null>(null);
  const [addBlockTarget, setAddBlockTarget] = useState<{
    nodeId: string;
    sectionLabel: string;
  } | null>(null);
  const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
  const [themeDesc, setThemeDesc] = useState('');

  const treeInitRef = useRef(false);
  const previewStoreId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
  const activeStoreName =
    stores.find((s) => s._id === previewStoreId)?.storeName ?? 'Preview store';

  useEffect(() => {
    if (activeStoreId) {
      void fetchStoreSubdomain(activeStoreId);
    }
  }, [activeStoreId, fetchStoreSubdomain]);

  const openAddSectionModal = useCallback((ctx: SectionInsertContext) => {
    setInsertHoverHighlight(null);
    setAddSectionTarget({
      groupId: ctx.groupId as CreateThemeCatalogGroup,
      groupLabel: ctx.groupLabel,
      afterNodeId: ctx.afterNodeId,
      beforeNodeId: ctx.beforeNodeId,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setSavedThemeId(null);
      try {
        const data = await loadCreatorThemeEditorPack('horizon');
        if (cancelled) return;
        const schema = data.editorSchema as EditorSchemaDoc;
        packDefaultRef.current = JSON.parse(JSON.stringify(data.defaultConfig ?? {})) as Record<
          string,
          unknown
        >;

        let config = JSON.parse(JSON.stringify(data.config)) as Record<string, unknown>;
        let nextValues = { ...data.values };
        let nextName = (config.themeName as string) || data.themeName || 'Creator Basic';
        let loadedSavedId: string | null = null;

        const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
        if (editThemeId && storeId) {
          const list = await getByStoreId(storeId);
          if (cancelled) return;
          const saved = list.find((t) => t._id === editThemeId);
          if (saved?.themeConfig && typeof saved.themeConfig === 'object') {
            config = JSON.parse(JSON.stringify(saved.themeConfig)) as Record<string, unknown>;
            normalizeCreatorThemeConfig(config);
            nextValues = creatorConfigHasSections(config)
              ? {
                  ...formValuesFromEditorConfig(schema, config),
                  ...seedSectionEnabledValues(config),
                }
              : nextValues;
            nextName = saved.themeName?.trim() || nextName;
            setThemeDesc(saved.themeDesc?.trim() ?? '');
            loadedSavedId = saved._id;
          } else if (editThemeId) {
            toast.error('Saved theme not found');
          }
        }

        normalizeCreatorThemeConfig(config);
        if (ensureFeaturedProductSectionBlocks(config) || ensureFaqSectionBlocks(config)) {
          nextValues = {
            ...nextValues,
            ...formValuesFromEditorConfig(schema, config),
          };
        }
        ensureRegistryTemplatesInConfig(config);

        setEditorSchema(schema);
        setDefaultConfig(config);
        setValues(nextValues);
        seedCommittedPreview(nextValues);
        setManifest(data.manifest);
        setBlockCatalog(data.blockCatalog);
        setThemeRuntime(data.themeRuntime);
        setThemeName(nextName);
        setSavedThemeId(loadedSavedId);
        setItemOrder(readStructureOrderFromConfig(config, 'index'));
        treeInitRef.current = false;
      } catch (err: unknown) {
        if (!cancelled) {
          setError((err as Error)?.message ?? 'Failed to load theme creator');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editThemeId, activeStoreId, getByStoreId]);

  const debouncedValuesForTree = useDebouncedValue(values, 140);
  const tplId = templateIdForPage(previewPage);
  const hasSections = useMemo(
    () => creatorConfigHasSections(defaultConfig, tplId),
    [defaultConfig, tplId]
  );

  const treeConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    if (!hasSections) return defaultConfig;
    return applyValuesToThemeConfig(defaultConfig, debouncedValuesForTree, editorSchema);
  }, [defaultConfig, debouncedValuesForTree, editorSchema, hasSections]);

  const sectionsTree = useMemo(() => {
    if (!editorSchema || !defaultConfig) {
      return buildEmptyShopifySidebarTree(previewPage);
    }
    if (!hasSections) {
      return buildEmptyShopifySidebarTree(previewPage);
    }
    return withCreatorSidebarDeleteFlags(
      buildShopifySidebarTree(
        editorSchema,
        debouncedValuesForTree,
        previewPage,
        itemOrder,
        JSON.parse(JSON.stringify(treeConfig)) as Record<string, unknown>
      )
    );
  }, [editorSchema, debouncedValuesForTree, previewPage, itemOrder, treeConfig, hasSections]);

  const themeSettingsTree = useMemo(
    () => (editorSchema ? buildThemeSettingsSidebarTree(editorSchema) : []),
    [editorSchema]
  );

  const activeTree = sidebarTab === 'sections' ? sectionsTree : themeSettingsTree;

  useEffect(() => {
    if (!activeTree.length) return;
    if (!treeInitRef.current) {
      treeInitRef.current = true;
      setExpanded(defaultExpandedSidebar(activeTree));
    }
  }, [activeTree, sidebarTab]);

  const pageMenuItems = useMemo(
    () => buildThemeEditorPageMenu(manifest, editorSchema),
    [manifest, editorSchema]
  );

  const pageLabel =
    findPageMenuItemByPreview(pageMenuItems, previewPage)?.label ?? 'Home page';

  const selectedNode = useMemo(
    () => findSidebarNode(activeTree, selectedNodeId),
    [activeTree, selectedNodeId]
  );

  const settingsNode = useMemo(
    () => settingsNodeForSelection(selectedNode, activeTree, editorSchema),
    [selectedNode, activeTree, editorSchema]
  );

  /** Sync heading block panel values (text mirror + style field seed from config). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeadingBlockNodeId(selectedNodeId)) return;
    const parsed = parseHeadingBlockNodeId(selectedNodeId);
    if (!parsed) return;
    const settingsBase =
      parsed.placement === 'layout'
        ? `sections.${parsed.sectionInstanceId}.settings`
        : `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.settings`;
    const blocksBase =
      parsed.placement === 'layout'
        ? `sections.${parsed.sectionInstanceId}.blocks`
        : `templates.${parsed.templateId}.sections.${parsed.sectionInstanceId}.blocks`;
    const titlePath = `${settingsBase}.title`;
    const blockPath = `${blocksBase}.${parsed.blockInstanceId}.settings.heading`;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      let next = extendValuesForHeadingBlock(prev, editorSchema, selectedNodeId, merged);
      const title = next[titlePath];
      const block = next[blockPath];
      if (title === undefined && block !== undefined) {
        next = mirrorHeadingTextInValues(next, blockPath, block);
      } else if (block === undefined && title !== undefined) {
        next = mirrorHeadingTextInValues(next, titlePath, title);
      }
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed large-logo Logo block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeroLargeLogoBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForLargeLogoBlock(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed large-logo Text block panel values from merged config. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeroTextBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForHeroTextBlock(prev, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed accordion block panel values from merged config when opening the panel. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFaqAccordionBlockNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFaqAccordionBlock(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed accordion row panel values from merged config when opening the panel. */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFaqAccordionRowNestedNodeId(selectedNodeId)) return;

    setValues((prev) => {
      const merged = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const next = extendValuesForFaqAccordionRow(prev, editorSchema, selectedNodeId, merged);
      if (next === prev) return prev;
      for (const key of Object.keys(next)) {
        if (next[key] !== prev[key]) return next;
      }
      return prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed menu block paths into `values` when opening the panel (avoids blank controls / no-op edits). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isHeaderMenuBlockNodeId(selectedNodeId)) return;
    const instanceId = instanceIdFromHeaderMenuBlockNodeId(selectedNodeId);
    if (!instanceId) return;
    const defs = headerMenuBlockFieldDefsFromSchema(editorSchema, instanceId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const seeded = fromConfig[f.path];
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed announcement block field paths when opening a block instance (e.g. announcement_2). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isAnnouncementBlockNodeId(selectedNodeId)) return;
    const instanceId = instanceIdFromAnnouncementBlockNodeId(selectedNodeId);
    const blockInstanceId = blockInstanceIdFromAnnouncementBlockNodeId(selectedNodeId);
    if (!instanceId || !blockInstanceId) return;
    const defs = announcementBlockFieldDefsFromSchema(
      editorSchema,
      instanceId,
      blockInstanceId
    );
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const seeded = fromConfig[f.path];
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Ensure featured-product sections have block hierarchy when opening block panels. */
  useEffect(() => {
    if (
      !isFeaturedProductMediaBlockNodeId(selectedNodeId) &&
      !isFeaturedProductDetailsBlockNodeId(selectedNodeId)
    ) {
      return;
    }
    setDefaultConfig((prev) => {
      if (!prev) return prev;
      const draft = JSON.parse(JSON.stringify(prev)) as Record<string, unknown>;
      if (!ensureFeaturedProductSectionBlocks(draft) && !ensureFaqSectionBlocks(draft)) return prev;
      return draft;
    });
  }, [selectedNodeId]);

  /** Seed Product media block field paths (aspect ratio, carousel, padding, etc.). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductMediaBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductMediaFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductMediaBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Details block field paths (size, layout, appearance, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductDetailsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductDetailsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductDetailsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header block field paths (layout, size, appearance, block link, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header → Title block field paths (layout, typography, appearance, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderTitleNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderTitleFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderTitleBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Review stars block field paths (style, review count, color, typography). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductReviewStarsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductReviewStarsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductReviewStarsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Variant picker block field paths (style, swatches, alignment, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductVariantPickerBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductVariantPickerFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductVariantPickerBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Buy buttons → Add to cart block field paths (style). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductAddToCartNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductAddToCartFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductAddToCartBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Buy buttons block field paths (general toggles and padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductBuyButtonsBlockNodeId(selectedNodeId)) return;
    const defs = featuredProductBuyButtonsFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductBuyButtonsBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed Header → Price block field paths (general, typography, padding). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig || !isFeaturedProductHeaderPriceNestedNodeId(selectedNodeId)) return;
    const defs = featuredProductHeaderPriceFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const draft = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
      ensureFeaturedProductSectionBlocks(draft);
      const config = applyValuesToThemeConfig(draft, prev, editorSchema);
      return extendFeaturedProductHeaderPriceBlockValues(prev, defs, config);
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  /** Seed collection link Title/Image field paths (link_1.titleFont, etc.). */
  useEffect(() => {
    if (!editorSchema || !defaultConfig) return;
    const isTitle = isCollectionLinkTitleFieldNodeId(selectedNodeId);
    const isImage = isCollectionLinkImageFieldNodeId(selectedNodeId);
    if (!isTitle && !isImage) return;
    const defs = isTitle
      ? collectionLinkTitleFieldDefsFromSchema(editorSchema, selectedNodeId)
      : collectionLinkImageFieldDefsFromSchema(editorSchema, selectedNodeId);
    if (!defs.length) return;

    setValues((prev) => {
      const needsSeed = defs.some((f) => prev[f.path] === undefined);
      if (!needsSeed) return prev;
      const config = applyValuesToThemeConfig(defaultConfig, prev, editorSchema);
      const fromConfig = formValuesFromEditorConfig(editorSchema, config);
      const imageDefaults: Record<string, string> = {
        imageHeight: 'large',
        imageRatio: 'square',
        imageCornerRadius: '0',
      };
      const titleDefaults: Record<string, string> = {
        titleFont: 'subheading',
        titleWeight: 'default',
        titleLineHeight: 'normal',
        titleLetterSpacing: 'normal',
        titleCase: 'default',
      };
      const next = { ...prev };
      let changed = false;
      for (const f of defs) {
        if (next[f.path] !== undefined) continue;
        const key = f.path.split('.').pop() ?? '';
        const seeded =
          fromConfig[f.path] ??
          (isImage ? imageDefaults[key] : isTitle ? titleDefaults[key] : undefined);
        if (seeded === undefined) continue;
        next[f.path] = seeded;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [selectedNodeId, editorSchema, defaultConfig]);

  const livePreviewConfig = useMemo(() => {
    if (!defaultConfig || !editorSchema) return defaultConfig ?? {};
    if (!hasSections) return defaultConfig;
    return applyValuesToThemeConfig(defaultConfig, values, editorSchema);
  }, [defaultConfig, values, editorSchema, hasSections]);

  const debouncedConfigForHints = useDebouncedValue(livePreviewConfig, 320);

  const selectionHints = useMemo(
    () => buildThemeEditorSelectionHints(editorSchema, debouncedConfigForHints, previewPage),
    [editorSchema, debouncedConfigForHints, previewPage, structureSyncKey]
  );

  const schemaFieldTypes = useMemo(() => {
    if (!editorSchema || !defaultConfig) return new Map<string, string>();
    return new Map(
      collectEditableFieldPaths(editorSchema, defaultConfig as Record<string, unknown>).map((f) => [
        f.path,
        f.type,
      ])
    );
  }, [editorSchema, defaultConfig]);

  const liveThemeJson = useMemo(() => {
    if (!defaultConfig || !editorSchema) return {};
    return mergedConfigFromFormValues({ ...defaultConfig, themeName }, values, editorSchema);
  }, [defaultConfig, values, editorSchema, themeName]);

  const persistTheme = useCallback(
    async (opts: { themeName: string; themeDesc?: string; isCreate: boolean }) => {
      const storeId = activeStoreId || THEME_EDITOR_STATIC_CONFIG.devStoreId;
      if (!storeId) {
        toast.error('Select a store before saving');
        return;
      }
      if (!defaultConfig || !editorSchema) {
        toast.error('Theme is still loading');
        return;
      }

      const themeConfig = mergedConfigFromFormValues(
        { ...defaultConfig, themeName: opts.themeName },
        values,
        editorSchema
      );

      if (opts.isCreate) {
        const created = await createStoreCustomTheme({
          storeId,
          themeName: opts.themeName,
          ...(opts.themeDesc ? { themeDesc: opts.themeDesc } : {}),
          themeConfig,
        });
        setSavedThemeId(created._id);
        setThemeName(opts.themeName);
        setThemeDesc(opts.themeDesc ?? '');
        setShowSaveThemeModal(false);
        toast.success('Theme created');
        return;
      }

      if (!savedThemeId) return;
      await updateStoreCustomTheme(savedThemeId, {
        themeName: opts.themeName,
        themeConfig,
        ...(opts.themeDesc !== undefined ? { themeDesc: opts.themeDesc || null } : {}),
      });
      setThemeName(opts.themeName);
      if (opts.themeDesc !== undefined) setThemeDesc(opts.themeDesc);
      toast.success('Theme saved');
    },
    [
      activeStoreId,
      defaultConfig,
      editorSchema,
      values,
      savedThemeId,
      createStoreCustomTheme,
      updateStoreCustomTheme,
    ]
  );

  const handleSave = useCallback(() => {
    if (!defaultConfig || !editorSchema) {
      toast.error('Theme is still loading');
      return;
    }
    if (!savedThemeId) {
      setShowSaveThemeModal(true);
      return;
    }
    const name = themeName.trim();
    if (!name) {
      toast.error('Theme name is required');
      return;
    }
    void persistTheme({
      themeName: name,
      themeDesc: themeDesc.trim() || undefined,
      isCreate: false,
    }).catch((err: unknown) => {
      toast.error((err as Error)?.message ?? 'Failed to save theme');
    });
  }, [defaultConfig, editorSchema, savedThemeId, themeName, themeDesc, persistTheme]);

  const handleSaveThemeModalConfirm = useCallback(
    (payload: { themeName: string; themeDesc?: string }) => {
      void persistTheme({ ...payload, isCreate: true }).catch((err: unknown) => {
        toast.error((err as Error)?.message ?? 'Failed to create theme');
      });
    },
    [persistTheme]
  );

  const handlePreviewPageChange = useCallback(
    (page: ThemePreviewPage) => {
      if (page === previewPage) return;
      setPreviewPage(page);
      setSelectedNodeId('');
      setAddSectionTarget(null);
      setAddBlockTarget(null);
      setInsertHoverHighlight(null);
      treeInitRef.current = false;

      const pack = packDefaultRef.current;
      const tplId = templateIdForPage(page);
      if (defaultConfig && pack) {
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const seeded = seedTemplateFromPackIfEmpty(next, tplId, pack);
        if (seeded) {
          normalizeCreatorThemeConfig(next);
          setDefaultConfig(next);
          if (editorSchema) {
            setValues((prev) => extendValuesForSeededTemplate(prev, editorSchema, tplId, next));
          }
          setItemOrder(readStructureOrderFromConfig(next, page));
          setStructureSyncKey((k) => k + 1);
          return;
        }
      }

      if (defaultConfig) {
        setItemOrder(readStructureOrderFromConfig(defaultConfig, page));
      }
    },
    [defaultConfig, previewPage, editorSchema]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleFieldChange = useCallback(
    (path: string, type: FieldType, raw: string | boolean) => {
      const value = type === 'boolean' ? Boolean(raw) : String(raw);
      startTransition(() => {
        setValues((prev) => mirrorHeadingTextInValues(prev, path, value));
      });
    },
    []
  );

  const handleStoreMenuSelect = useCallback(
    (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => {
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const { config, itemValuePaths } = applyStoreMenuSelectionToConfig(
          prev,
          menuFieldPath,
          menu,
          items
        );
        startTransition(() => {
          setValues((v) => ({ ...v, ...itemValuePaths }));
        });
        commitPreviewNow();
        setStructureSyncKey((k) => k + 1);
        return config;
      });
    },
    [commitPreviewNow]
  );

  const handleCollectionLinksApply = useCallback(
    (settingsPath: string, collections: Collection[]) => {
      setDefaultConfig((prev) => {
        if (!prev) return prev;
        const { config, blockValuePaths, pickerValue } = applyCollectionLinksSelectionToConfig(
          prev,
          settingsPath,
          collections
        );
        const sectionBase = sectionBaseFromCollectionsPickerPath(settingsPath);
        const keepIds = sectionBase
          ? new Set(
              (collections.length
                ? collections.map((_, i) => `link_${i + 1}`)
                : []) as string[]
            )
          : new Set<string>();

        startTransition(() => {
          setValues((v) => {
            let next = { ...v, [settingsPath]: pickerValue, ...blockValuePaths };
            if (sectionBase) {
              next = pruneCollectionLinkBlockValues(next, sectionBase, keepIds);
            }
            return next;
          });
        });
        commitPreviewNow();
        setStructureSyncKey((k) => k + 1);
        return config;
      });
    },
    [commitPreviewNow]
  );

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

  const handlePreviewSelect = useCallback(
    (nodeId: string) => {
      const sidebarNodeId = announcementBlockNodeIdFromSelection(nodeId) ?? nodeId;
      if (selectedNodeId === sidebarNodeId) {
        setSelectedNodeId('');
        return;
      }
      setSelectedNodeId(sidebarNodeId);
      const node = findSidebarNode(sectionsTree, sidebarNodeId);
      if (node?.fields?.length || node?.children?.length) {
        setExpanded((prev) => ({
          ...prev,
          [sidebarNodeId]: true,
          ...expandedIdsForPreviewNode(sidebarNodeId, sectionsTree),
          ...(sidebarNodeId !== nodeId ? expandedIdsForPreviewNode(nodeId, sectionsTree) : {}),
        }));
      }
    },
    [selectedNodeId, sectionsTree]
  );

  const handleInsertElement = useCallback(
    (elementId: string) => {
      if (!defaultConfig || !editorSchema || !packDefaultRef.current || !addSectionTarget) return;
      const result = insertCreateThemeElement(
        defaultConfig,
        elementId,
        {
          groupId: addSectionTarget.groupId,
          groupLabel: addSectionTarget.groupLabel,
          afterNodeId: addSectionTarget.afterNodeId,
          beforeNodeId: addSectionTarget.beforeNodeId,
        },
        packDefaultRef.current,
        previewPage
      );
      if (!result) {
        toast.error('Could not add this section yet');
        return;
      }
      normalizeCreatorThemeConfig(result.config);
      setDefaultConfig(result.config);
      const el = getCreateThemeElement(elementId);
      if (el?.insert.placement === 'layout') {
        setValues((prev) =>
          extendValuesForLayoutInstance(
            prev,
            editorSchema,
            el.insert.blueprintId,
            result.instanceId,
            result.config
          )
        );
      } else if (el?.insert.placement === 'template') {
        setValues((prev) =>
          extendValuesForTemplateInstance(
            prev,
            editorSchema,
            templateIdForPage(previewPage),
            templateBlueprintKey(result.instanceId),
            result.instanceId,
            result.config
          )
        );
      }
      setItemOrder(readStructureOrderFromConfig(result.config, previewPage));
      setSelectedNodeId(result.nodeId);
      setAddSectionTarget(null);
      setStructureSyncKey((k) => k + 1);
      toast.success('Section added');
    },
    [defaultConfig, editorSchema, addSectionTarget, previewPage]
  );

  const handleInsertBlock = useCallback(
    (block: BlockCatalogItem) => {
      if (!defaultConfig || !editorSchema || !addBlockTarget) return;
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
      setDefaultConfig(result.config);
      const faqRowText = /:block:accordion:nested:[^:]+:nested:[^:]+$/.test(result.nodeId);
      const faqRow = /:block:accordion:nested:[^:]+$/.test(result.nodeId);
      const faqSectionBlock = /:block:(heading|accordion)$/.test(result.nodeId);
      if (result.scope === 'template') {
        const hero = templateBlueprintKey(result.sectionInstanceId) === 'hero_main';
        setValues((prev) => {
          if (faqRowText) {
            return extendValuesForFaqNestedBlock(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              result.nodeId,
              result.config
            );
          }
          if (faqRow) {
            const rowId = result.nodeId.match(/:block:accordion:nested:([^:]+)$/)?.[1];
            if (!rowId) return prev;
            return extendValuesForNewFaqAccordionRow(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              rowId,
              result.config
            );
          }
          if (faqSectionBlock) {
            return extendValuesForFaqSectionBlock(
              prev,
              'template',
              result.templateId,
              result.sectionInstanceId,
              result.blockInstanceId,
              result.config
            );
          }
          if (hero) {
            return extendValuesForHeroBlock(
              prev,
              editorSchema,
              'template',
              result.templateId,
              result.sectionInstanceId,
              result.blockInstanceId,
              block.id,
              result.config
            );
          }
          return extendValuesForTemplateBlock(
            prev,
            editorSchema,
            result.templateId ?? templateIdForPage(previewPage),
            result.sectionInstanceId,
            result.blockInstanceId,
            block.id,
            result.config
          );
        });
      } else {
        setValues((prev) => {
          if (faqRowText) {
            return extendValuesForFaqNestedBlock(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              result.nodeId,
              result.config
            );
          }
          if (faqRow) {
            const rowId = result.nodeId.match(/:block:accordion:nested:([^:]+)$/)?.[1];
            if (!rowId) return prev;
            return extendValuesForNewFaqAccordionRow(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              rowId,
              result.config
            );
          }
          if (faqSectionBlock) {
            return extendValuesForFaqSectionBlock(
              prev,
              'layout',
              undefined,
              result.sectionInstanceId,
              result.blockInstanceId,
              result.config
            );
          }
          return extendValuesForLayoutBlock(
            prev,
            editorSchema,
            result.sectionInstanceId,
            result.blockInstanceId,
            block.id,
            result.config
          );
        });
      }
      setSelectedNodeId(result.nodeId);
      setStructureSyncKey((k) => k + 1);
      commitPreviewNow();
      toast.success('Block added');
    },
    [defaultConfig, editorSchema, addBlockTarget, previewPage, commitPreviewNow]
  );

  const handleDeleteSidebarNode = useCallback(
    (nodeId: string) => {
      if (!defaultConfig) return;

      const tplFaqRowText = nodeId.match(
        /^template:([^:]+):([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
      );
      if (tplFaqRowText) {
        const [, tplId, sectionInstanceId, rowId, textId] = tplFaqRowText;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (
          (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
            tplId
          ]?.sections ?? {}
        )[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        const row = (accordion?.blocks as Record<string, Record<string, unknown>> | undefined)?.[rowId];
        if (row?.blocks && typeof row.blocks === 'object') {
          delete (row.blocks as Record<string, unknown>)[textId];
          row.block_order = ((row.block_order as string[]) ?? []).filter((id) => id !== textId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqRowText(prev, 'template', tplId, sectionInstanceId, rowId, textId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutFaqRowText = nodeId.match(
        /^layout:([^:]+):block:accordion:nested:([^:]+):nested:([^:]+)$/
      );
      if (layoutFaqRowText) {
        const [, sectionInstanceId, rowId, textId] = layoutFaqRowText;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (next.sections as Record<string, Record<string, unknown>>)?.[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        const row = (accordion?.blocks as Record<string, Record<string, unknown>> | undefined)?.[rowId];
        if (row?.blocks && typeof row.blocks === 'object') {
          delete (row.blocks as Record<string, unknown>)[textId];
          row.block_order = ((row.block_order as string[]) ?? []).filter((id) => id !== textId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqRowText(prev, 'layout', undefined, sectionInstanceId, rowId, textId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const tplFaqRow = nodeId.match(/^template:([^:]+):([^:]+):block:accordion:nested:([^:]+)$/);
      if (tplFaqRow) {
        const [, tplId, sectionInstanceId, rowId] = tplFaqRow;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (
          (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
            tplId
          ]?.sections ?? {}
        )[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        if (accordion?.blocks && typeof accordion.blocks === 'object') {
          delete (accordion.blocks as Record<string, unknown>)[rowId];
          accordion.block_order = ((accordion.block_order as string[]) ?? []).filter((id) => id !== rowId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqAccordionRow(prev, 'template', tplId, sectionInstanceId, rowId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutFaqRow = nodeId.match(/^layout:([^:]+):block:accordion:nested:([^:]+)$/);
      if (layoutFaqRow) {
        const [, sectionInstanceId, rowId] = layoutFaqRow;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sec = (next.sections as Record<string, Record<string, unknown>>)?.[sectionInstanceId];
        const accordion = (sec?.blocks as Record<string, Record<string, unknown>> | undefined)?.accordion;
        if (accordion?.blocks && typeof accordion.blocks === 'object') {
          delete (accordion.blocks as Record<string, unknown>)[rowId];
          accordion.block_order = ((accordion.block_order as string[]) ?? []).filter((id) => id !== rowId);
        }
        setDefaultConfig(next);
        setValues((prev) =>
          pruneValuesForFaqAccordionRow(prev, 'layout', undefined, sectionInstanceId, rowId)
        );
        setStructureSyncKey((k) => k + 1);
        commitPreviewNow();
        toast.success('Block removed');
        return;
      }

      const layoutBlock = nodeId.match(/^layout:([^:]+):block:(.+)$/);
      if (layoutBlock) {
        const [, sectionInstanceId, blockId] = layoutBlock;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const sections = (next.sections ?? {}) as Record<string, Record<string, unknown>>;
        const sec = sections[sectionInstanceId];
        if (sec?.blocks && typeof sec.blocks === 'object') {
          delete (sec.blocks as Record<string, unknown>)[blockId];
          sec.block_order = ((sec.block_order as string[]) ?? []).filter((id) => id !== blockId);
        }
        setDefaultConfig(next);
        const isFaqSection = layoutBlueprintKey(sectionInstanceId) === 'faq_section';
        setValues((prev) =>
          isFaqSection && (blockId === 'heading' || blockId === 'accordion')
            ? pruneValuesForFaqSectionBlock(prev, 'layout', undefined, sectionInstanceId, blockId)
            : pruneValuesForLayoutBlock(prev, sectionInstanceId, blockId)
        );
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }

      const tplBlock = nodeId.match(/^template:([^:]+):([^:]+):block:(.+)$/);
      if (tplBlock) {
        const [, tplId, sectionInstanceId, blockId] = tplBlock;
        const next = JSON.parse(JSON.stringify(defaultConfig)) as Record<string, unknown>;
        const tpl = (next.templates as Record<string, { sections?: Record<string, Record<string, unknown>> }>)?.[
          tplId
        ];
        const sec = tpl?.sections?.[sectionInstanceId];
        if (sec?.blocks && typeof sec.blocks === 'object') {
          delete (sec.blocks as Record<string, unknown>)[blockId];
          sec.block_order = ((sec.block_order as string[]) ?? []).filter((id) => id !== blockId);
        }
        setDefaultConfig(next);
        const isFaqSection =
          templateBlueprintKey(sectionInstanceId) === 'faq_section' ||
          tpl?.sections?.[sectionInstanceId]?.type === 'faq';
        setValues((prev) =>
          isFaqSection && (blockId === 'heading' || blockId === 'accordion')
            ? pruneValuesForFaqSectionBlock(prev, 'template', tplId, sectionInstanceId, blockId)
            : pruneValuesForTemplateBlock(prev, tplId, sectionInstanceId, blockId)
        );
        setStructureSyncKey((k) => k + 1);
        toast.success('Block removed');
        return;
      }

      const layout = nodeId.match(/^layout:(.+)$/);
      if (layout) {
        const instanceId = layout[1];
        if (instanceId.includes('add-section')) {
          toast.error('This section cannot be removed');
          return;
        }
        const order = getLayoutOrder(defaultConfig);
        const groupId: 'header' | 'footer' = order.footer?.includes(instanceId) ? 'footer' : 'header';
        const next = removeLayoutSection(defaultConfig, instanceId, groupId, CREATOR_DELETE);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setValues((prev) => pruneValuesForLayoutInstance(prev, instanceId));
        setDefaultConfig(next);
        setItemOrder((prev) => {
          const listKey = groupId === 'header' ? 'sections:header' : 'sections:footer';
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      const tpl = nodeId.match(/^template:([^:]+):([^:]+)$/);
      if (tpl) {
        const [, tplId, instanceId] = tpl;
        const next = removeTemplateSection(defaultConfig, tplId, instanceId, CREATOR_DELETE);
        if (!next) {
          toast.error('This section cannot be removed');
          return;
        }
        setDefaultConfig(next);
        setValues((prev) => pruneValuesForTemplateInstance(prev, tplId, instanceId));
        setItemOrder((prev) => {
          const listKey = `sections:template:${tplId}`;
          return { ...prev, [listKey]: (prev[listKey] ?? []).filter((id) => id !== nodeId) };
        });
        if (selectedNodeId === nodeId || selectedNodeId.startsWith(`${nodeId}:`)) {
          setSelectedNodeId('');
        }
        setStructureSyncKey((k) => k + 1);
        toast.success('Section removed');
        return;
      }

      toast.error('This section cannot be removed');
    },
    [defaultConfig, selectedNodeId, commitPreviewNow]
  );

  const closeSettings = useCallback(() => {
    setSelectedNodeId('');
  }, []);

  const handleInspectorEnabledChange = useCallback((enabled: boolean) => {
    setInspectorEnabled(enabled);
    if (!enabled) {
      setSelectedNodeId('');
      setInsertHoverHighlight(null);
    }
  }, []);

  const handleRemoveSettingsSection = useCallback(() => {
    if (!settingsNode) return;
    handleDeleteSidebarNode(settingsNode.id);
  }, [settingsNode, handleDeleteSidebarNode]);

  const handleRemoveSettingsBlock = useCallback(() => {
    if (!settingsNode) return;
    handleDeleteSidebarNode(settingsNode.id);
  }, [settingsNode, handleDeleteSidebarNode]);

  if (loading && !editorSchema) {
    return (
      <div className="fixed inset-0 z-[1310] flex items-center justify-center bg-white">
        <CreateThemePoweredByLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[1310] flex flex-col items-center justify-center gap-4 bg-gray-100">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/online-store/themes')}
          className="text-sm text-[#005bd3] hover:underline"
        >
          Back to themes
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1310] flex flex-col bg-[#1e1e1e]">
      <PreviewSyncProgressBar
        runKey={previewBarRunKey}
        onComplete={onPreviewBarComplete}
      />

      <CreateThemeHeader
        themeName={themeName}
        onThemeNameChange={setThemeName}
        previewPage={previewPage}
        onPreviewPageChange={handlePreviewPageChange}
        manifest={manifest}
        editorSchema={editorSchema}
        device={device}
        onDeviceChange={setDevice}
        onViewJson={() => setShowViewTheme(true)}
        viewJsonDisabled={!defaultConfig || !editorSchema}
        onSave={handleSave}
        saveDisabled={!defaultConfig || !editorSchema || loading}
        saving={savingTheme}
        inspectorEnabled={inspectorEnabled}
        onInspectorEnabledChange={handleInspectorEnabledChange}
        storeUrl={storeSubdomain?.url ?? null}
      />

      <div className="flex min-h-0 flex-1">
        <CreateThemeEditorSidebar
          pageLabel={pageLabel}
          sidebarTab={sidebarTab}
          onSidebarTabChange={(tab) => {
            setSidebarTab(tab);
            if (tab === 'theme-settings') setSelectedNodeId('');
          }}
          onExit={() => navigate('/online-store/themes')}
          tree={activeTree}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          selectedNodeId={selectedNodeId}
          onSelectNode={(node) => {
            if (node.kind === 'add-block') {
              if (selectedNodeId === node.id) {
                setSelectedNodeId('');
                setAddBlockTarget(null);
                return;
              }
              setSelectedNodeId(node.id);
              setAddBlockTarget({
                nodeId: node.id,
                sectionLabel: resolveAddBlockSectionLabel(node.id, sectionsTree),
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
                const order = itemOrder[`sections:template:${tplId}`] ?? [];
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
              return;
            }
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
          onCollectionLinksApply={handleCollectionLinksApply}
          onStoreMenuSelect={handleStoreMenuSelect}
          onCloseSettings={closeSettings}
          onRemoveSettingsSection={handleRemoveSettingsSection}
          onRemoveSettingsBlock={handleRemoveSettingsBlock}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          <div
            className={`create-theme-preview-canvas relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white ${
              device === 'mobile' ? 'mx-auto w-full max-w-[390px] border-x border-gray-200' : 'h-full w-full'
            }`}
          >
            <CreateThemeLivePreview
              key={themeRuntime.jsUrl ?? 'composer'}
              className="h-full min-h-0 w-full flex-1"
              storeId={previewStoreId}
              storeName={activeStoreName}
              jsUrl={themeRuntime.jsUrl}
              cssUrl={themeRuntime.cssUrl}
              config={livePreviewConfig}
              structureSyncKey={structureSyncKey}
              page={previewPage}
              selectionHints={selectionHints}
              highlightNodeId={inspectorEnabled ? selectedNodeId || null : null}
              inspectorEnabled={inspectorEnabled}
              onPreviewSelect={({ nodeId }) => handlePreviewSelect(nodeId)}
              onPreviewDeselect={() => setSelectedNodeId('')}
              onPreviewFieldChange={(fieldPath, value) => {
                const schemaType = schemaFieldTypes.get(fieldPath);
                const type = schemaType ? fieldTypeFromSchema(schemaType) : 'text';
                handleFieldChange(fieldPath, type, value);
              }}
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
        onSelectBlock={handleInsertBlock}
      />

      <CreateThemeSaveModal
        open={showSaveThemeModal}
        saving={savingTheme}
        initialName={themeName.trim() === 'Creator Basic' ? '' : themeName}
        initialDesc=""
        onClose={() => {
          if (!savingTheme) setShowSaveThemeModal(false);
        }}
        onSave={handleSaveThemeModalConfirm}
      />

      {addSectionTarget ? (
        <CreateThemeAddSectionModal
          open
          groupId={addSectionTarget.groupId}
          groupLabel={addSectionTarget.groupLabel}
          onClose={() => setAddSectionTarget(null)}
          onSelect={handleInsertElement}
        />
      ) : null}

      {showViewTheme ? (
        <ThemeEditorLiveConfigModal
          open={showViewTheme}
          onClose={() => setShowViewTheme(false)}
          staticDevMode
          packId="horizon"
          mergedConfig={liveThemeJson}
          formValues={values}
          baseConfig={defaultConfig}
          title="View theme JSON"
          description="Live document from create-theme structure and settings."
        />
      ) : null}
    </div>
  );
};

export default CreateThemePage;
