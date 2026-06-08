import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
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
} from '@heroicons/react/24/outline';
import type { ThemePreviewPage } from './CreateThemeLivePreview';
import {
  buildThemeEditorPageMenu,
  buildVisiblePageMenuRows,
  findPageMenuItemByPreview,
  type ThemeEditorPageMenuItem,
  type ThemePageIcon,
} from '../utils/page-menu';
import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import './create-theme-page-picker.css';

type CreateThemePagePickerProps = {
  value: ThemePreviewPage;
  onChange: (page: ThemePreviewPage) => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
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

const CreateThemePagePickerInner: React.FC<CreateThemePagePickerProps> = ({
  value,
  onChange,
  manifest,
  editorSchema,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => new Set());
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(
    () => buildThemeEditorPageMenu(manifest, editorSchema),
    [manifest, editorSchema]
  );

  const current = useMemo(
    () =>
      findPageMenuItemByPreview(allItems, value) ?? {
        menuId: 'page:index',
        previewPage: 'index' as const,
        label: 'Home page',
        icon: 'home' as const,
      },
    [allItems, value]
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
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const selectPage = useCallback(
    (previewPage: ThemePreviewPage) => {
      onChange(previewPage);
      setOpen(false);
      setQuery('');
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

  const handleRowClick = useCallback(
    (item: ThemeEditorPageMenuItem, showChevron: boolean, e: React.MouseEvent) => {
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
      }
      selectPage(item.previewPage);
    },
    [expandedMenus, selectPage, toggleSubmenu]
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
                    const isSelected = item.previewPage === value;
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
                          {showChevron ? (
                            <span
                              data-submenu-chevron
                              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200/80"
                              onClick={(e) => toggleSubmenu(item.menuId, e)}
                              aria-label="Expand submenu"
                            >
                              <ChevronRightIcon
                                className={`h-4 w-4 transition-transform ${
                                  expandedMenus.has(item.menuId) ? 'rotate-90' : ''
                                }`}
                              />
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
            </div>
          </>,
          document.body
        )
      : null;

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
    </>
  );
};

export const CreateThemePagePicker = memo(CreateThemePagePickerInner);
export default CreateThemePagePicker;
