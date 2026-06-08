import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { useStoreMenus } from '../../contexts/store-menu.context';
import { useStore } from '../../contexts/store.context';
import type { EditorFieldDef } from './create-theme-sidebar.types';
import { fieldTypeFromSchema, fieldValueAsString, type ThemeEditorFieldType } from './create-theme-field.utils';
import { storeMenuLabelFromValue } from '../utils/store-menu-header.util';

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

  const current = fieldValueAsString(values, field);
  const menuNamePath = field.path.replace(/\.menu$/, '.menuName');
  const storedName = fieldValueAsString(values, { ...field, path: menuNamePath });
  const resolvedLabel = storeMenuLabelFromValue(current, menus) ?? storedName;

  useEffect(() => {
    if (!activeStoreId) return;
    fetchMenusByStoreId(activeStoreId).catch(() => {
      /* toast on explicit select */
    });
  }, [activeStoreId, fetchMenusByStoreId]);

  const handleChange = useCallback(
    async (menuId: string) => {
      if (!activeStoreId) {
        toast.error('Select a store before choosing a menu');
        return;
      }
      if (!menuId) return;

      const menu = menus.find((m) => m._id === menuId);
      if (!menu) return;

      onFieldChange(field.path, fieldTypeFromSchema(field.type), menuId);

      try {
        const items = await fetchMenuItemsByMenuId(menuId, activeStoreId);
        onStoreMenuSelect?.(field.path, menu, items);
      } catch {
        toast.error('Failed to load menu links');
      }
    },
    [
      activeStoreId,
      menus,
      field,
      onFieldChange,
      onStoreMenuSelect,
      fetchMenuItemsByMenuId,
    ]
  );

  const showLegacyHint =
    current &&
    !menus.some((m) => m._id === current) &&
    !/^[0-9a-fA-F]{24}$/.test(current);

  return (
    <div className="py-1">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label}</span>
        <div className="relative min-w-[140px]">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
            <Bars3Icon className="h-4 w-4" />
          </span>
          <select
            value={menus.some((m) => m._id === current) ? current : ''}
            disabled={loading && menus.length === 0}
            onChange={(e) => void handleChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-[#c9cccf] bg-white py-2 pl-9 pr-8 text-[13px] text-gray-900 shadow-sm focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] disabled:opacity-60"
          >
            <option value="" disabled>
              {loading ? 'Loading menus…' : 'Select a menu'}
            </option>
            {menus.map((menu) => (
              <option key={menu._id} value={menu._id}>
                {menu.menuName}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {resolvedLabel && menus.some((m) => m._id === current) ? (
        <p className="mt-1.5 text-[12px] text-gray-500">Links from &quot;{resolvedLabel}&quot;</p>
      ) : null}

      {showLegacyHint ? (
        <p className="mt-1.5 text-[12px] text-amber-700">
          Previous setting &quot;{current}&quot; is not a store menu. Pick a menu from your store.
        </p>
      ) : null}

      {!loading && menus.length === 0 ? (
        <p className="mt-2 text-[12px] text-gray-500">
          No menus yet.{' '}
          <Link to="/content/menus/new" className="font-medium text-[#005bd3] hover:underline">
            Create a menu
          </Link>
        </p>
      ) : null}
    </div>
  );
}
