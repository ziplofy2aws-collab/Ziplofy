import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { StoreMenu, StoreMenuItem } from '../../contexts/store-menu.context';
import { useStoreMenus } from '../../contexts/store-menu.context';
import { useStore } from '../../contexts/store.context';
import { MenuItemRow } from '../../pages/ContentMenuCreatePage';
import {
  createMenuItemDraft,
  menuItemDraftsToApiInputs,
  slugifyMenuHandle,
  type MenuItemDraft,
} from '../../utils/store-menu-draft.util';

export type ThemeEditorCreateMenuSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (menu: StoreMenu, items: StoreMenuItem[]) => void;
};

export function ThemeEditorCreateMenuSheet({
  open,
  onClose,
  onCreated,
}: ThemeEditorCreateMenuSheetProps) {
  const { activeStoreId } = useStore();
  const { createMenu } = useStoreMenus();
  const nameInputId = useId();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [items, setItems] = useState<MenuItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const displayHandle = useMemo(() => slugifyMenuHandle(menuName), [menuName]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setMenuName('');
    setItems([]);
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const updateItem = useCallback((id: string, patch: Partial<MenuItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const handleSave = async () => {
    const name = menuName.trim();
    if (!name) {
      toast.error('Menu name is required');
      return;
    }
    if (!activeStoreId) {
      toast.error('Select a store before saving a menu');
      return;
    }

    const apiItems = menuItemDraftsToApiInputs(items);
    if (items.some((row) => row.label.trim()) && apiItems.length === 0) {
      toast.error('Add at least one valid menu item with a label and link');
      return;
    }

    setSaving(true);
    try {
      const { menu, items: createdItems } = await createMenu({
        storeId: activeStoreId,
        menuName: name,
        handle: displayHandle,
        items: apiItems,
      });
      toast.success('Menu created');
      onCreated?.(menu, createdItems);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Failed to create menu');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[15000] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close create menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-editor-create-menu-title"
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-center border-b border-[#e1e1e1] py-2">
          <span className="h-1 w-10 rounded-full bg-gray-300" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-6">
          <h2
            id="theme-editor-create-menu-title"
            className="pr-10 text-lg font-semibold tracking-tight text-gray-900"
          >
            Create menu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a store menu, then use it in your header navigation.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor={nameInputId}
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                Name
              </label>
              <input
                id={nameInputId}
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="e.g. Main menu"
                autoFocus
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#005bd3] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Handle: <span className="font-medium text-gray-700">{displayHandle || '—'}</span>
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Menu items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    storeId={activeStoreId}
                    portalLinkPicker
                    onChange={(patch) => updateItem(item.id, patch)}
                    onRemove={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}
                    onConfirm={() => toast.success('Menu item updated')}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, createMenuItemDraft()])}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-[#005bd3] transition-colors hover:border-[#005bd3]/40 hover:bg-blue-50/40"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  Add menu item
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#e1e1e1] bg-white px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-[#005bd3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004bb0] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save menu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
