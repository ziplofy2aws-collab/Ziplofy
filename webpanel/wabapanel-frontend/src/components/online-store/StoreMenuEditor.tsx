'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronRight, List, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
  adminListSecondaryButtonClass,
} from '@/components/admin-list-ui';
import { MenuItemRow } from '@/components/online-store/MenuItemRow';
import {
  createMenuItemDraft,
  menuItemDraftsToApiInputs,
  type MenuItemDraft,
} from '@/lib/store-menu-draft';
import { slugifyMenuHandle, storeMenuApi } from '@/lib/store-menu';

const fieldLabel = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';

type Props = {
  mode: 'create' | 'edit';
  storeId: string;
  menuId?: string;
  initialName?: string;
  initialItems?: MenuItemDraft[];
  onDelete?: () => void;
};

export function StoreMenuEditor({ mode, storeId, menuId, initialName = '', initialItems = [], onDelete }: Props) {
  const router = useRouter();
  const nameInputId = useId();
  const [menuName, setMenuName] = useState(initialName);
  const [items, setItems] = useState<MenuItemDraft[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayHandle = useMemo(() => slugifyMenuHandle(menuName), [menuName]);

  const updateItem = useCallback((id: string, patch: Partial<MenuItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const handleSave = async () => {
    const name = menuName.trim();
    if (!name) {
      toast.error('Menu name is required');
      return;
    }
    const apiItems = menuItemDraftsToApiInputs(items);
    if (items.some((row) => row.label.trim()) && apiItems.length === 0) {
      toast.error('Add at least one valid menu item with a label and link');
      return;
    }
    setSaving(true);
    try {
      const payload = { menuName: name, handle: displayHandle, items: apiItems };
      if (mode === 'create') {
        await storeMenuApi.createMenu(storeId, payload);
        toast.success('Menu saved');
        router.push('/client/online-store/menus');
      } else if (menuId) {
        await storeMenuApi.updateMenu(storeId, menuId, payload);
        toast.success('Menu updated');
      }
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!menuId || !window.confirm(`Delete menu "${menuName || 'this menu'}"?`)) return;
    setDeleting(true);
    try {
      await storeMenuApi.deleteMenu(storeId, menuId);
      toast.success('Menu deleted');
      onDelete?.();
      router.push('/client/online-store/menus');
    } catch (err) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] w-full">
      <div className={`${adminListPageInnerClass} max-w-3xl py-5`}>
        <nav className="mb-5 flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link href="/client/online-store/menus" className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}>
            <List className="h-3.5 w-3.5 shrink-0" />
            Menus
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" />
          <span className="font-medium text-admin-text">{mode === 'create' ? 'Add menu' : menuName || 'Edit menu'}</span>
        </nav>

        <div className="flex flex-col gap-4">
          <section className={`${adminListCardClass} p-4 sm:p-5`}>
            <div className="space-y-4">
              <div>
                <label htmlFor={nameInputId} className={fieldLabel}>
                  Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g., Main menu"
                  className={adminListSearchInputClass}
                />
              </div>
              <p className="text-[13px] text-admin-text-secondary">
                <span className="font-medium text-admin-text">Handle:</span>{' '}
                <span className="text-admin-text-subdued">{displayHandle || '—'}</span>
              </p>
            </div>
          </section>

          <section className={adminListCardClass}>
            <div className="border-b border-admin-border bg-[#f6f6f7] px-4 py-3 sm:px-5">
              <h2 className="text-[13px] font-semibold text-admin-text">Menu items</h2>
            </div>
            <div className="flex flex-col gap-3 p-4 sm:p-5">
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  storeId={storeId}
                  onChange={(patch) => updateItem(item.id, patch)}
                  onRemove={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}
                />
              ))}
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, createMenuItemDraft()])}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-admin-border bg-[#fafafa] px-4 py-3.5 text-[13px] font-medium text-[#005bd3] hover:bg-[#f6f6f7]"
              >
                <PlusCircle className="h-5 w-5" />
                Add menu item
              </button>
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting || saving}
              className={`${adminListSecondaryButtonClass} mr-auto inline-flex items-center gap-1.5 text-red-600 hover:bg-red-50`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting…' : 'Delete menu'}
            </button>
          ) : (
            <Link href="/client/online-store/menus" className={`${adminListSecondaryButtonClass} mr-auto`}>
              Cancel
            </Link>
          )}
          <button type="button" disabled={saving} onClick={() => void handleSave()} className={`${adminListPrimaryButtonClass} min-w-[7rem] justify-center px-5 py-2`}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoreMenuEditorSkeleton() {
  return (
    <div className={`${adminListPageInnerClass} max-w-3xl animate-pulse space-y-4 py-5`}>
      <div className="h-4 w-40 rounded bg-[#ebebeb]" />
      <div className="h-32 rounded-xl bg-[#ebebeb]" />
      <div className="h-64 rounded-xl bg-[#ebebeb]" />
    </div>
  );
}
