import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  GiftIcon,
  CreditCardIcon,
  MagnifyingGlassCircleIcon,
  LockClosedIcon,
  NewspaperIcon,
  RectangleStackIcon,
  TagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { ThemePreviewPage } from './CreateThemeLivePreview';
import { CreateAlternateTemplateModal } from './CreateAlternateTemplateModal';
import {
  buildThemeEditorPageMenu,
  buildVisiblePageMenuRows,
  findPageMenuItemByPreviewWithConfig,
  type ThemeEditorPageMenuItem,
  type ThemePageIcon,
} from '../utils/page-menu';
import {
  createCollectionTemplateInConfig,
  listCollectionTemplates,
  collectionTemplatePreviewPage,
  type CollectionTemplateEntry,
} from '../utils/collection-templates.util';
import {
  createProductTemplateInConfig,
  listProductTemplates,
  productTemplatePreviewPage,
  type ProductTemplateEntry,
} from '../utils/product-templates.util';
import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import './create-theme-page-picker.css';

type PickerView = 'root' | 'products' | 'collections';
type CreateTemplateKind = 'product' | 'collection';

type CreateThemePagePickerProps = {
  value: ThemePreviewPage;
  onChange: (page: ThemePreviewPage) => void;
  onOpenInNewTab?: (item: ThemeEditorPageMenuItem) => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
  themeConfig?: Record<string, unknown> | null;
  onThemeConfigChange?: (config: Record<string, unknown>, previewPage?: ThemePreviewPage) => void;
};

function PageIcon({ icon, className }: { icon: ThemePageIcon; className?: string }) {
  const cls = className ?? 'h-[18px] w-[18px] shrink-0 text-gray-700';
  switch (icon) {
    case 'home':
      return <HomeIcon className={cls} />;
    case 'product':
      return <TagIcon className={cls} />;
    case 'collection':
      return <RectangleStackIcon className={cls} />;
    case 'cart':
      return <ShoppingCartIcon className={cls} />;
    case 'gift':
      return <GiftIcon className={cls} />;
    case 'checkout':
      return <CreditCardIcon className={cls} />;
    case 'search':
      return <MagnifyingGlassCircleIcon className={cls} />;
    case 'lock':
      return <LockClosedIcon className={cls} />;
    case 'blog':
      return <NewspaperIcon className={cls} />;
    case 'user':
      return <UserIcon className={cls} />;
    case 'orders':
      return <ClipboardDocumentListIcon className={cls} />;
    case 'login':
      return <ArrowLeftOnRectangleIcon className={cls} />;
    default:
      return <DocumentTextIcon className={cls} />;
  }
}

function productAssignmentLabel(count: number): string {
  return count === 1 ? 'Assigned to 1 product' : `Assigned to ${count} products`;
}

function collectionAssignmentLabel(count: number): string {
  return count === 1 ? 'Assigned to 1 collection' : `Assigned to ${count} collections`;
}

type TemplateRowProps = {
  entry: { id: string; name: string; isDefault: boolean };
  previewPage: string;
  isSelected: boolean;
  assignmentLabel: string;
  onSelect: () => void;
};

function TemplateRow({ entry, isSelected, assignmentLabel, onSelect }: TemplateRowProps) {
  return (
    <div className="px-1.5">
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        className={`flex w-full items-start gap-2.5 rounded-[8px] px-2.5 py-2.5 text-left transition-colors ${
          isSelected ? 'bg-[#ebebeb]' : 'text-gray-800 hover:bg-[#f1f1f1]'
        }`}
        onClick={onSelect}
      >
        {entry.isDefault ? (
          <StarIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-800" />
        ) : (
          <DocumentTextIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-700" />
        )}
        <span className="min-w-0 flex-1">
          <span
            className={`block text-[13px] leading-snug ${
              isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'
            }`}
          >
            {entry.name}
          </span>
          <span className="mt-0.5 block text-[12px] text-gray-500">{assignmentLabel}</span>
        </span>
      </button>
    </div>
  );
}

const CreateThemePagePickerInner: React.FC<CreateThemePagePickerProps> = ({
  value,
  onChange,
  onOpenInNewTab,
  manifest,
  editorSchema,
  themeConfig,
  onThemeConfigChange,
}) => {
  const [open, setOpen] = useState(false);
  const [pickerView, setPickerView] = useState<PickerView>('root');
  const [query, setQuery] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => new Set());
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [createModalKind, setCreateModalKind] = useState<CreateTemplateKind | null>(null);
  const [createTemplateError, setCreateTemplateError] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(
    () => buildThemeEditorPageMenu(manifest, editorSchema),
    [manifest, editorSchema]
  );

  const productTemplates = useMemo(
    () => listProductTemplates(themeConfig ?? null),
    [themeConfig]
  );

  const collectionTemplates = useMemo(
    () => listCollectionTemplates(themeConfig ?? null),
    [themeConfig]
  );

  const filteredProductTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productTemplates;
    return productTemplates.filter((t) => t.name.toLowerCase().includes(q));
  }, [productTemplates, query]);

  const filteredCollectionTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collectionTemplates;
    return collectionTemplates.filter((t) => t.name.toLowerCase().includes(q));
  }, [collectionTemplates, query]);

  const showCollectionsListRow = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return 'collections list'.includes(q);
  }, [query]);

  const showAllProductsRow = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return 'all products'.includes(q) || 'products'.includes(q);
  }, [query]);

  const current = useMemo(
    () =>
      findPageMenuItemByPreviewWithConfig(allItems, value, themeConfig ?? null) ?? {
        menuId: 'page:index',
        previewPage: 'index' as const,
        label: 'Home page',
        icon: 'home' as const,
      },
    [allItems, value, themeConfig]
  );

  const visibleRows = useMemo(
    () => buildVisiblePageMenuRows(allItems, query, expandedMenus),
    [allItems, query, expandedMenus]
  );

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 320;
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2 - width / 2,
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    const onResize = () => updateMenuPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setPickerView('root');
      setExpandedMenus(new Set());
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (createModalKind) return;
        if (pickerView === 'products' || pickerView === 'collections') {
          setPickerView('root');
          return;
        }
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pickerView, createModalKind]);

  const selectPage = useCallback(
    (previewPage: ThemePreviewPage) => {
      onChange(previewPage);
      setOpen(false);
      setQuery('');
      setPickerView('root');
    },
    [onChange]
  );

  const toggleSubmenu = useCallback((menuId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  }, []);

  const openProductsView = useCallback(() => {
    setPickerView('products');
    setQuery('');
  }, []);

  const openCollectionsView = useCallback(() => {
    setPickerView('collections');
    setQuery('');
  }, []);

  const handleRowClick = useCallback(
    (item: ThemeEditorPageMenuItem, showChevron: boolean, e: React.MouseEvent) => {
      if (item.menuId === 'page:products') {
        openProductsView();
        return;
      }
      if (item.menuId === 'page:collections') {
        openCollectionsView();
        return;
      }
      if (item.openInNewTab) {
        onOpenInNewTab?.(item);
        setOpen(false);
        setQuery('');
        return;
      }
      if (showChevron && item.children?.length) {
        const chevronHit = (e.target as HTMLElement).closest('[data-submenu-chevron]');
        if (chevronHit) {
          toggleSubmenu(item.menuId, e);
          return;
        }
        if (!expandedMenus.has(item.menuId)) {
          toggleSubmenu(item.menuId, e);
          return;
        }
        return;
      }
      selectPage(item.previewPage);
    },
    [expandedMenus, onOpenInNewTab, openCollectionsView, openProductsView, selectPage, toggleSubmenu]
  );

  const handleSelectProductTemplate = useCallback(
    (entry: ProductTemplateEntry) => {
      selectPage(productTemplatePreviewPage(entry.id));
    },
    [selectPage]
  );

  const handleSelectCollectionTemplate = useCallback(
    (entry: CollectionTemplateEntry) => {
      selectPage(collectionTemplatePreviewPage(entry.id));
    },
    [selectPage]
  );

  const handleCreateTemplate = useCallback(
    (name: string, basedOnTemplateId: string) => {
      if (!themeConfig || !onThemeConfigChange || !createModalKind) return;
      const next = JSON.parse(JSON.stringify(themeConfig)) as Record<string, unknown>;
      const result =
        createModalKind === 'product'
          ? createProductTemplateInConfig(next, name, basedOnTemplateId)
          : createCollectionTemplateInConfig(next, name, basedOnTemplateId);
      if (!result.ok) {
        setCreateTemplateError(result.error);
        return;
      }
      onThemeConfigChange(next, result.previewPage);
      setCreateTemplateError('');
      setCreateModalKind(null);
      setOpen(false);
      setQuery('');
      setPickerView('root');
    },
    [createModalKind, onThemeConfigChange, themeConfig]
  );

  const openCreateModal = useCallback((kind: CreateTemplateKind) => {
    setCreateTemplateError('');
    setCreateModalKind(kind);
  }, []);

  const renderTemplateDrillDown = (
    title: string,
    templates: Array<{ id: string; name: string; isDefault: boolean; assignedCount: number }>,
    previewPageFor: (id: string) => string,
    assignmentLabel: (count: number) => string,
    onSelect: (entry: { id: string; name: string; isDefault: boolean }) => void,
    createKind: CreateTemplateKind,
    extraTopContent?: React.ReactNode
  ) => (
    <>
      <div className="border-b border-[#e8e8e8] px-2 py-1.5">
        <button
          type="button"
          onClick={() => setPickerView('root')}
          className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[13px] font-semibold text-gray-900 hover:bg-[#f1f1f1]"
        >
          <ChevronLeftIcon className="h-4 w-4 shrink-0 text-gray-600" />
          {title}
        </button>
      </div>

      <div className="create-theme-page-picker-list max-h-[min(360px,50vh)] overflow-y-auto py-1">
        {extraTopContent}
        {templates.length ? (
          templates.map((entry) => {
            const previewPage = previewPageFor(entry.id);
            return (
              <TemplateRow
                key={entry.id}
                entry={entry}
                previewPage={previewPage}
                isSelected={value === previewPage}
                assignmentLabel={assignmentLabel(entry.assignedCount)}
                onSelect={() => onSelect(entry)}
              />
            );
          })
        ) : (
          <p className="px-4 py-8 text-center text-[13px] text-gray-500">No templates found</p>
        )}
      </div>

      {onThemeConfigChange ? (
        <div className="border-t border-[#e8e8e8] p-2">
          <button
            type="button"
            onClick={() => openCreateModal(createKind)}
            className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-[#f1f7ff]"
          >
            <PlusCircleIcon className="h-[18px] w-[18px] shrink-0" />
            Create template
          </button>
        </div>
      ) : null}
    </>
  );

  const menu =
    open && menuPos
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1400] cursor-default bg-transparent"
              aria-label="Close page menu"
              onClick={() => setOpen(false)}
            />
            <div
              className="create-theme-page-picker-menu fixed z-[1410] overflow-hidden rounded-[12px] border border-[#e3e3e3] bg-white"
              style={{
                top: menuPos.top,
                left: Math.max(8, Math.min(menuPos.left, window.innerWidth - menuPos.width - 8)),
                width: menuPos.width,
              }}
              role="listbox"
              aria-label="Store pages"
            >
              <div className="p-2">
                <div className="create-theme-page-picker-search flex items-center gap-2 rounded-[10px] border border-[#c9cccf] bg-white px-2.5 py-2 transition-shadow">
                  <MagnifyingGlassIcon className="h-[18px] w-[18px] shrink-0 text-gray-500" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search online store"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {pickerView === 'products'
                ? renderTemplateDrillDown(
                    'Products',
                    filteredProductTemplates.map((t) => ({
                      ...t,
                      assignedCount: t.assignedProductCount,
                    })),
                    productTemplatePreviewPage,
                    productAssignmentLabel,
                    handleSelectProductTemplate,
                    'product',
                    showAllProductsRow ? (
                      <div className="px-1.5 pb-1">
                        <button
                          type="button"
                          role="option"
                          aria-selected={value === 'products'}
                          className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2.5 text-left text-[13px] transition-colors ${
                            value === 'products'
                              ? 'bg-[#ebebeb] font-semibold text-gray-900'
                              : 'text-gray-800 hover:bg-[#f1f1f1]'
                          }`}
                          onClick={() => selectPage('products')}
                        >
                          <RectangleStackIcon className="h-[18px] w-[18px] shrink-0 text-gray-700" />
                          <span>All products</span>
                        </button>
                        <div className="mx-2.5 my-1 border-t border-[#e8e8e8]" role="separator" />
                      </div>
                    ) : null
                  )
                : pickerView === 'collections'
                  ? renderTemplateDrillDown(
                      'Collections',
                      filteredCollectionTemplates.map((t) => ({
                        ...t,
                        assignedCount: t.assignedCollectionCount,
                      })),
                      collectionTemplatePreviewPage,
                      collectionAssignmentLabel,
                      handleSelectCollectionTemplate,
                      'collection',
                      showCollectionsListRow ? (
                        <div className="px-1.5 pb-1">
                          <button
                            type="button"
                            role="option"
                            aria-selected={value === 'collections-list'}
                            className={`flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2.5 text-left text-[13px] transition-colors ${
                              value === 'collections-list'
                                ? 'bg-[#ebebeb] font-semibold text-gray-900'
                                : 'text-gray-800 hover:bg-[#f1f1f1]'
                            }`}
                            onClick={() => selectPage('collections-list')}
                          >
                            <RectangleStackIcon className="h-[18px] w-[18px] shrink-0 text-gray-700" />
                            <span>Collections list</span>
                          </button>
                          <div className="mx-2.5 my-1 border-t border-[#e8e8e8]" role="separator" />
                        </div>
                      ) : null
                    )
                  : (
                <div className="create-theme-page-picker-list max-h-[min(420px,55vh)] overflow-y-auto pb-1.5">
                  {visibleRows.length ? (
                    visibleRows.map((row) => {
                      if (row.type === 'divider') {
                        return (
                          <div
                            key={row.key}
                            className="mx-2 my-1 border-t border-[#e8e8e8]"
                            role="separator"
                          />
                        );
                      }

                      const { item, depth, showChevron } = row;
                      const isDrillDown =
                        item.menuId === 'page:products' || item.menuId === 'page:collections';
                      const isSelected =
                        !item.openInNewTab && !isDrillDown && item.previewPage === value;
                      const padLeft = 10 + depth * 16;

                      return (
                        <div key={`${row.item.menuId}-${depth}`} className="px-1.5">
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`flex w-full items-center gap-2 rounded-[8px] py-[7px] pr-2 text-left text-[13px] transition-colors ${
                              isSelected
                                ? 'bg-[#ebebeb] font-medium text-gray-900'
                                : 'text-gray-800 hover:bg-[#f1f1f1]'
                            }`}
                            style={{ paddingLeft: padLeft }}
                            onClick={(e) => handleRowClick(item, showChevron, e)}
                          >
                            <PageIcon icon={item.icon} />
                            <span className="min-w-0 flex-1 truncate leading-snug">{item.label}</span>
                            {isDrillDown || showChevron ? (
                              <span
                                data-submenu-chevron={isDrillDown ? true : undefined}
                                className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200/80"
                                onClick={
                                  isDrillDown
                                    ? (e) => {
                                        e.stopPropagation();
                                        if (item.menuId === 'page:products') openProductsView();
                                        else openCollectionsView();
                                      }
                                    : (e) => toggleSubmenu(item.menuId, e)
                                }
                                aria-label="Open submenu"
                              >
                                <ChevronRightIcon className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="w-6 shrink-0" aria-hidden />
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-4 py-8 text-center text-[13px] text-gray-500">No pages found</p>
                  )}
                </div>
              )}
            </div>
          </>,
          document.body
        )
      : null;

  const modalTemplates =
    createModalKind === 'collection' ? collectionTemplates : productTemplates;
  const defaultBasedOnId = createModalKind === 'collection' ? 'collection' : 'product';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[200px] max-w-[min(92vw,300px)] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <PageIcon icon={current.icon} className="h-[18px] w-[18px] shrink-0 text-gray-800" />
        <span className="truncate">{current.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {menu}
      <CreateAlternateTemplateModal
        open={createModalKind !== null}
        templates={modalTemplates}
        defaultBasedOnId={defaultBasedOnId}
        error={createTemplateError}
        onClose={() => {
          setCreateModalKind(null);
          setCreateTemplateError('');
        }}
        onCreate={handleCreateTemplate}
      />
    </>
  );
};

export const CreateThemePagePicker = memo(CreateThemePagePickerInner);
export default CreateThemePagePicker;
