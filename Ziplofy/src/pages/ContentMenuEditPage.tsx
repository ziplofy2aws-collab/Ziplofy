import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Bars3Icon, ChevronRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../contexts/store.context';
import { useStoreMenus } from '../contexts/store-menu.context';
import {
  menuItemDraftsToApiInputs,
  storeMenuItemToDraft,
  type MenuItemDraft,
} from '../utils/store-menu-draft.util';
import {
  createMenuItem,
  MenuItemRow,
  slugifyMenuHandle,
} from './ContentMenuCreatePage';

export const ContentMenuEditPage = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const { activeStoreId } = useStore();
  const { fetchMenuById, updateMenu, loading } = useStoreMenus();
  const nameInputId = useId();
  const [menuName, setMenuName] = useState('');
  const [items, setItems] = useState<MenuItemDraft[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayHandle = useMemo(() => slugifyMenuHandle(menuName), [menuName]);

  useEffect(() => {
    if (!menuId || !activeStoreId) return;

    let cancelled = false;
    setLoaded(false);

    void fetchMenuById(menuId, activeStoreId)
      .then(({ menu, items: apiItems }) => {
        if (cancelled) return;
        setMenuName(menu.menuName);
        setItems(apiItems.map(storeMenuItemToDraft));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load menu');
      });

    return () => {
      cancelled = true;
    };
  }, [menuId, activeStoreId, fetchMenuById]);

  const updateItem = useCallback((id: string, patch: Partial<MenuItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addMenuItem = () => {
    setItems((prev) => [...prev, createMenuItem()]);
  };

  const removeMenuItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    const name = menuName.trim();
    if (!name) {
      toast.error('Menu name is required');
      return;
    }
    if (!activeStoreId || !menuId) {
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
      const { menu, items: savedItems } = await updateMenu(menuId, {
        menuName: name,
        handle: displayHandle,
        items: apiItems,
      });
      setMenuName(menu.menuName);
      setItems(savedItems.map(storeMenuItemToDraft));
      toast.success('Menu saved');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  if (!menuId) {
    return (
      <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color p-8 text-center text-sm text-gray-500">
        Menu not found.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link
            to="/content/menus"
            className="inline-flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900"
          >
            <Bars3Icon className="h-4 w-4" />
            Menus
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" aria-hidden />
          <span className="font-semibold text-gray-900">{displayHandle || menuName || 'Menu'}</span>
        </nav>

        {!loaded && loading ? (
          <p className="text-sm text-gray-500">Loading menu…</p>
        ) : (
          <>
            <div className="space-y-4">
              <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor={nameInputId} className="mb-1.5 block text-sm font-semibold text-gray-900">
                      Name
                    </label>
                    <input
                      id={nameInputId}
                      type="text"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      placeholder="e.g., Sidebar menu"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Handle:</span>{' '}
                    <span className="text-gray-500">{displayHandle || '—'}</span>
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                  <h2 className="text-sm font-semibold text-gray-900">Menu items</h2>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      storeId={activeStoreId}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onRemove={() => removeMenuItem(item.id)}
                      onConfirm={() => toast.success('Menu item updated')}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50/50 hover:border-blue-200"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    Add menu item
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !loaded}
                className="inline-flex min-w-[7rem] items-center justify-center rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
