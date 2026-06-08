import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDownIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import type { ThemePreviewPage } from './ThemeLivePreviewFrame';
import {
  buildThemeEditorPageMenu,
  filterPageMenuItems,
  findPageMenuItemByPreview,
  type ThemeEditorPageMenuItem,
  type ThemePageIcon,
} from '../../utils/theme-editor-page-menu';
import type { EditorSchemaDoc } from './theme-editor-sidebar/theme-editor-sidebar.types';

type ThemeEditorPagePickerProps = {
  value: ThemePreviewPage;
  onChange: (page: ThemePreviewPage) => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
};

function PageIcon({ icon, className }: { icon: ThemePageIcon; className?: string }) {
  const cls = className ?? 'h-[18px] w-[18px] shrink-0 text-gray-600';
  switch (icon) {
    case 'home':
      return <HomeIcon className={cls} />;
    case 'product':
      return <ShoppingBagIcon className={cls} />;
    case 'cart':
      return <ShoppingCartIcon className={cls} />;
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

const ThemeEditorPagePickerInner: React.FC<ThemeEditorPagePickerProps> = ({
  value,
  onChange,
  manifest,
  editorSchema,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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

  const visibleItems = useMemo(
    () => filterPageMenuItems(allItems, query, new Set()),
    [allItems, query]
  );

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(360, Math.max(280, rect.width));
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
              className="fixed z-[1410] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
              style={{
                top: menuPos.top,
                left: Math.max(8, Math.min(menuPos.left, window.innerWidth - menuPos.width - 8)),
                width: menuPos.width,
              }}
              role="listbox"
              aria-label="Store pages"
            >
              <div className="border-b border-gray-100 p-2.5">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2">
                  <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search online store"
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <ul className="max-h-[min(60vh,420px)] overflow-y-auto py-1">
                {visibleItems.length ? (
                  visibleItems.map((item) => {
                    const isSelected = item.previewPage === value;
                    return (
                      <li key={item.menuId}>
                        <button
                          type="button"
                          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-gray-100 font-medium text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => selectPage(item.previewPage)}
                        >
                          <PageIcon icon={item.icon} />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-3 py-6 text-center text-sm text-gray-500">No pages found</li>
                )}
              </ul>
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
        className="flex min-w-[200px] max-w-[min(92vw,320px)] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <PageIcon icon={current.icon} className="h-[18px] w-[18px] shrink-0 text-gray-700" />
        <span className="truncate">{current.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {menu}
    </>
  );
};

export const ThemeEditorPagePicker = memo(ThemeEditorPagePickerInner);
export default ThemeEditorPagePicker;
