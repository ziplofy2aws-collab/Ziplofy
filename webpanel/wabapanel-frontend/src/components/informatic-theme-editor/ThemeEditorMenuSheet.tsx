'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuItemRow } from '@/components/online-store/MenuItemRow';
import {
  createMenuItemDraft,
  menuItemDraftsToApiInputs,
  storeMenuItemToDraft,
  type MenuItemDraft,
} from '@/lib/store-menu-draft';
import { slugifyMenuHandle, storeMenuApi, type StoreMenu, type StoreMenuItem } from '@/lib/store-menu';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  storeId: string | null;
  menuId?: string | null;
  onClose: () => void;
  onSaved: (menu: StoreMenu, items: StoreMenuItem[]) => void;
};

export function ThemeEditorMenuSheet({
  open,
  mode,
  storeId,
  menuId = null,
  onClose,
  onSaved,
}: Props) {
  const nameInputId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [items, setItems] = useState<MenuItemDraft[]>([]);
  const [loading, setLoading] = useState(false);
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
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || mode !== 'edit' || !storeId || !menuId) return;
    let cancelled = false;
    setLoading(true);
    void storeMenuApi
      .getMenu(storeId, menuId)
      .then((res) => {
        if (cancelled) return;
        setMenuName(res.data.data.menu.menuName);
        setItems(res.data.data.items.map(storeMenuItemToDraft));
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load menu');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, mode, storeId, menuId]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setMenuName('');
      setItems([]);
    }
  }, [open, mode]);

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
    if (!storeId) {
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
      const payload = { menuName: name, handle: displayHandle, items: apiItems };
      const res =
        mode === 'create'
          ? await storeMenuApi.createMenu(storeId, payload)
          : await storeMenuApi.updateMenu(storeId, menuId!, payload);
      toast.success(mode === 'create' ? 'Menu created' : 'Menu updated');
      onSaved(res.data.data.menu, res.data.data.items);
      onClose();
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save menu'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 p-4 transition-opacity sm:items-center ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform ${
          visible ? 'translate-y-0' : 'translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={nameInputId}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id={nameInputId} className="text-[16px] font-semibold text-gray-900">
            {mode === 'create' ? 'Create menu' : 'Edit menu'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading menu…
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-gray-600">Menu name</span>
                <input
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-[14px]"
                  placeholder="Main navigation"
                />
              </label>
              {menuName.trim() ? (
                <p className="text-[12px] text-gray-500">Handle: {displayHandle}</p>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-600">Menu items</span>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => [...prev, createMenuItemDraft()])}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#005bd3]"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-[13px] text-gray-500">
                      No items yet. Add links to pages, blog posts, or custom URLs.
                    </p>
                  ) : (
                    items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        storeId={storeId}
                        item={item}
                        onChange={(patch) => updateItem(item.id, patch)}
                        onRemove={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === 'create' ? 'Create menu' : 'Save menu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
