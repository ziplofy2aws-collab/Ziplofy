import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bars3Icon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { useStoreMenus } from '../../contexts/store-menu.context';
import { useStore } from '../../contexts/store.context';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import {
  fieldTypeFromSchema,
  fieldValueAsString,
  type ThemeEditorFieldType,
} from './create-theme-field.utils';
import { storeMenuLabelFromValue } from '../utils/store-menu-header.util';
import { ThemeEditorCreateMenuSheet } from './ThemeEditorCreateMenuSheet';

type Props = {
  field: EditorFieldDef;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onStoreMenuSelect?: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
};

export function StoreMenuSelectFieldRow({
  field,
  values,
  onFieldChange,
  onStoreMenuSelect,
}: Props) {
  const { activeStoreId } = useStore();
  const { menus, loading, fetchMenusByStoreId, fetchMenuItemsByMenuId } = useStoreMenus();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const current = fieldValueAsString(values, field);
  const menuNamePath = field.path.replace(/\.menu$/, '.menuName');
  const storedName = fieldValueAsString(values, { ...field, path: menuNamePath });
  const selectedMenu = menus.find((m) => m._id === current);
  const resolvedLabel =
    storeMenuLabelFromValue(current, menus) ?? storedName ?? selectedMenu?.menuName ?? '';

  useEffect(() => {
    if (!activeStoreId) return;
    fetchMenusByStoreId(activeStoreId).catch(() => {
      /* toast on explicit select */
    });
  }, [activeStoreId, fetchMenusByStoreId]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const applyMenu = useCallback(
    async (menu: StoreMenu, items?: StoreMenuItem[]) => {
      if (!activeStoreId) {
        toast.error('Select a store before choosing a menu');
        return;
      }

      onFieldChange(field.path, fieldTypeFromSchema(field.type), menu._id);

      try {
        const resolvedItems =
          items ?? (await fetchMenuItemsByMenuId(menu._id, activeStoreId));
        onStoreMenuSelect?.(field.path, menu, resolvedItems);
      } catch {
        toast.error('Failed to load menu links');
      }
    },
    [activeStoreId, field, onFieldChange, onStoreMenuSelect, fetchMenuItemsByMenuId]
  );

  const handleSelectExisting = useCallback(
    async (menuId: string) => {
      const menu = menus.find((m) => m._id === menuId);
      if (!menu) return;
      setOpen(false);
      await applyMenu(menu);
    },
    [menus, applyMenu]
  );

  const handleCreated = useCallback(
    async (menu: StoreMenu, items: StoreMenuItem[]) => {
      if (activeStoreId) {
        await fetchMenusByStoreId(activeStoreId);
      }
      await applyMenu(menu, items);
    },
    [activeStoreId, applyMenu, fetchMenusByStoreId]
  );

  const showLegacyHint =
    current &&
    !menus.some((m) => m._id === current) &&
    !/^[0-9a-fA-F]{24}$/.test(current);

  const triggerLabel = selectedMenu
    ? selectedMenu.menuName
    : loading && menus.length === 0
      ? 'Loading menus…'
      : 'Select a menu';

  return (
    <div className="py-1" ref={rootRef}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <div className="relative min-w-[160px]">
          <button
            type="button"
            disabled={loading && menus.length === 0}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white py-2 pl-2.5 pr-8 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] disabled:opacity-60"
          >
            <Bars3Icon className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          </button>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

          {open ? (
            <div
              role="listbox"
              className="absolute right-0 z-[1600] mt-1 max-h-64 w-[min(100vw-2rem,240px)] overflow-hidden rounded-lg border border-[#c9cccf] bg-white shadow-lg"
            >
              <ul className="max-h-48 overflow-y-auto overscroll-contain py-1">
                {menus.length === 0 ? (
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
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
                >
                  <PlusIcon className="h-4 w-4 shrink-0" aria-hidden />
                  Create menu
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {resolvedLabel && selectedMenu ? (
        <p className="mt-1.5 text-[12px] text-gray-500">Links from &quot;{resolvedLabel}&quot;</p>
      ) : null}

      {showLegacyHint ? (
        <p className="mt-1.5 text-[12px] text-amber-700">
          Previous setting &quot;{current}&quot; is not a store menu. Pick a menu from your store.
        </p>
      ) : null}

      <ThemeEditorCreateMenuSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(menu, items) => {
          void handleCreated(menu, items);
        }}
      />
    </div>
  );
}
