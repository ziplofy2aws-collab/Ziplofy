'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, ChevronDown, Menu, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EditorFieldDef } from '@/lib/informatic-theme/load-static-pack';
import { getConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { storeMenuLabelFromValue } from '@/lib/informatic-theme/store-menu-header.util';
import { storeMenuApi, type StoreMenu, type StoreMenuItem } from '@/lib/store-menu';
import { ThemeEditorMenuSheet } from './ThemeEditorMenuSheet';

type DropdownMode = 'actions' | 'replace' | null;

type Props = {
  field: EditorFieldDef;
  config: Record<string, unknown>;
  storeId: string | null;
  onStoreMenuSelect: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
};

export function StoreMenuSelectFieldRow({ field, config, storeId, onStoreMenuSelect }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<DropdownMode>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menus, setMenus] = useState<StoreMenu[]>([]);
  const [loading, setLoading] = useState(false);

  const current = String(getConfigPath(config, field.path) ?? '').trim();
  const menuNamePath = field.path.replace(/\.menu$/, '.menuName');
  const storedName = String(getConfigPath(config, menuNamePath) ?? '').trim();
  const selectedMenu = menus.find((m) => m._id === current);
  const hasEditableMenu = Boolean(selectedMenu) || /^[0-9a-fA-F]{24}$/.test(current);
  const resolvedLabel =
    storeMenuLabelFromValue(current, menus) ?? storedName ?? selectedMenu?.menuName ?? '';

  useEffect(() => {
    if (!storeId) {
      setMenus([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void storeMenuApi
      .listMenus(storeId)
      .then((res) => {
        if (!cancelled) setMenus(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) setMenus([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  useEffect(() => {
    if (!dropdown) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [dropdown]);

  const reloadMenus = useCallback(async () => {
    if (!storeId) return;
    const res = await storeMenuApi.listMenus(storeId);
    setMenus(res.data.data || []);
  }, [storeId]);

  const applyMenu = useCallback(
    async (menu: StoreMenu, items?: StoreMenuItem[]) => {
      if (!storeId) {
        toast.error('Select a store before choosing a menu');
        return;
      }
      const normalizedMenu: StoreMenu = {
        ...menu,
        _id: String(menu._id),
        menuName: String(menu.menuName ?? ''),
      };
      try {
        const resolvedItems =
          items ??
          (await storeMenuApi.getMenu(storeId, normalizedMenu._id)).data.data.items;
        onStoreMenuSelect(field.path, normalizedMenu, resolvedItems);
        setDropdown(null);
      } catch {
        toast.error('Failed to load menu links');
      }
    },
    [storeId, field.path, onStoreMenuSelect]
  );

  const handleSelectExisting = useCallback(
    async (menuId: string) => {
      const menu = menus.find((m) => m._id === menuId);
      if (!menu) return;
      setDropdown(null);
      await applyMenu(menu);
    },
    [menus, applyMenu]
  );

  const handleCreated = useCallback(
    async (menu: StoreMenu, items: StoreMenuItem[]) => {
      await reloadMenus();
      await applyMenu(menu, items);
    },
    [reloadMenus, applyMenu]
  );

  const handleEdited = useCallback(
    async (menu: StoreMenu, items: StoreMenuItem[]) => {
      await reloadMenus();
      await applyMenu(menu, items);
    },
    [reloadMenus, applyMenu]
  );

  const triggerLabel = selectedMenu?.menuName || storedName || resolvedLabel || (loading && menus.length === 0 ? 'Loading menus…' : 'Select a menu');

  const showLegacyHint =
    current && !menus.some((m) => m._id === current) && !/^[0-9a-fA-F]{24}$/.test(current);

  return (
    <div className="py-1" ref={rootRef}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label || 'Menu'}</span>
        <div className="relative min-w-[160px]">
          <button
            type="button"
            disabled={!storeId || (loading && menus.length === 0)}
            aria-haspopup="menu"
            aria-expanded={Boolean(dropdown)}
            onClick={() => setDropdown((prev) => (prev ? null : 'actions'))}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white py-2 pl-2.5 pr-8 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] disabled:opacity-60"
          >
            <Menu className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          </button>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

          {dropdown === 'actions' ? (
            <div
              role="menu"
              className="absolute right-0 z-[1600] mt-1 w-[min(100vw-2rem,200px)] overflow-hidden rounded-lg border border-[#c9cccf] bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setDropdown('replace')}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Replace
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  if (!hasEditableMenu) {
                    toast.error('Select a menu first, then you can edit it');
                    setDropdown('replace');
                    return;
                  }
                  setDropdown(null);
                  setEditOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDropdown(null);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Create
              </button>
            </div>
          ) : null}

          {dropdown === 'replace' ? (
            <div
              role="listbox"
              className="absolute right-0 z-[1600] mt-1 max-h-64 w-[min(100vw-2rem,240px)] overflow-hidden rounded-lg border border-[#c9cccf] bg-white shadow-lg"
            >
              <div className="border-b border-[#e1e1e1] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Choose menu
              </div>
              <ul className="max-h-48 overflow-y-auto overscroll-contain py-1">
                {!storeId ? (
                  <li className="px-3 py-2 text-[12px] text-gray-500">Select a store first</li>
                ) : menus.length === 0 ? (
                  <li className="px-3 py-2 text-[12px] text-gray-500">No menus yet</li>
                ) : (
                  menus.map((menu) => {
                    const selected = menu._id === current;
                    return (
                      <li key={menu._id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => void handleSelectExisting(menu._id)}
                          className={`flex w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 ${
                            selected ? 'bg-blue-50 font-medium text-[#005bd3]' : 'text-gray-900'
                          }`}
                        >
                          {menu.menuName}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="border-t border-[#e1e1e1] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdown(null);
                    setCreateOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Create menu
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {resolvedLabel && (selectedMenu || hasEditableMenu) ? (
        <p className="mt-1.5 text-[12px] text-gray-500">Links from &quot;{resolvedLabel}&quot;</p>
      ) : null}

      {!storeId ? (
        <p className="mt-1.5 text-[12px] text-amber-700">
          Select a store to choose menus created in Online Store → Menus.
        </p>
      ) : null}

      {showLegacyHint ? (
        <p className="mt-1.5 text-[12px] text-amber-700">
          Previous setting &quot;{current}&quot; is not a store menu. Pick a menu from your store.
        </p>
      ) : null}

      <ThemeEditorMenuSheet
        open={createOpen}
        mode="create"
        storeId={storeId}
        onClose={() => setCreateOpen(false)}
        onSaved={(menu, items) => {
          void handleCreated(menu, items);
        }}
      />

      <ThemeEditorMenuSheet
        open={editOpen}
        mode="edit"
        storeId={storeId}
        menuId={hasEditableMenu ? current : null}
        onClose={() => setEditOpen(false)}
        onSaved={(menu, items) => {
          void handleEdited(menu, items);
        }}
      />
    </div>
  );
}
