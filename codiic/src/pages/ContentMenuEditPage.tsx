import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Bars3Icon, ChevronRightIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSearchInputClass,
} from '../components/admin-list-ui';
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

const fieldLabelClass = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';
const fieldInputClass = adminListSearchInputClass;

function MenuEditSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading menu">
      <div className="flex flex-col gap-4">
        <section className={`${adminListCardClass} p-4 sm:p-5`}>
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 h-3 w-10 rounded bg-admin-fill" />
              <div className="h-9 w-full rounded-lg bg-admin-secondary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-14 rounded bg-admin-fill" />
              <div className="h-3.5 w-28 rounded bg-admin-secondary" />
            </div>
          </div>
        </section>

        <section className={adminListCardClass}>
          <div className="border-b border-admin-border bg-admin-table-header px-4 py-3 sm:px-5">
            <div className="h-3.5 w-20 rounded bg-admin-fill" />
          </div>
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {[0, 1, 2].map((row) => (
              <div key={row} className="rounded-xl border border-admin-border bg-admin-surface p-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="mt-7 h-5 w-5 shrink-0 rounded bg-admin-secondary" />
                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-1.5 h-3 w-10 rounded bg-admin-fill" />
                      <div className="h-9 w-full rounded-lg bg-admin-secondary" />
                    </div>
                    <div>
                      <div className="mb-1.5 h-3 w-8 rounded bg-admin-fill" />
                      <div className="h-9 w-full rounded-lg bg-admin-secondary" />
                    </div>
                  </div>
                  <div className="mt-6 flex shrink-0 items-center gap-1">
                    <div className="h-9 w-9 rounded-lg bg-admin-secondary" />
                    <div className="h-9 w-9 rounded-lg bg-admin-secondary" />
                  </div>
                </div>
              </div>
            ))}
            <div className="h-[52px] w-full rounded-lg border border-dashed border-admin-border bg-admin-fill/40" />
          </div>
        </section>
      </div>

      <div className="mt-5 flex justify-end">
        <div className="h-9 w-28 rounded-lg bg-admin-fill" />
      </div>
    </div>
  );
}

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
      <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color p-8 text-center text-[13px] text-admin-text-secondary">
        Menu not found.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <nav className="mb-5 flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
          <Link
            to="/content/menus"
            className={`inline-flex items-center gap-1 font-medium ${adminListFooterLinkClass}`}
          >
            <Bars3Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Menus
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-admin-text-subdued" aria-hidden />
          <span className="truncate font-medium text-admin-text">
            {displayHandle || menuName || 'Menu'}
          </span>
        </nav>

        {!loaded && loading ? (
          <MenuEditSkeleton />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <section className={`${adminListCardClass} p-4 sm:p-5`}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor={nameInputId} className={fieldLabelClass}>
                      Name
                    </label>
                    <input
                      id={nameInputId}
                      type="text"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                      placeholder="e.g., Sidebar menu"
                      className={fieldInputClass}
                    />
                  </div>
                  <p className="text-[13px] text-admin-text-secondary">
                    <span className="font-medium text-admin-text">Handle:</span>{' '}
                    <span className="text-admin-text-subdued">{displayHandle || '—'}</span>
                  </p>
                </div>
              </section>

              <section className={adminListCardClass}>
                <div className="border-b border-admin-border bg-admin-table-header px-4 py-3 sm:px-5">
                  <h2 className="text-[13px] font-semibold text-admin-text">Menu items</h2>
                </div>

                <div className="flex flex-col gap-3 p-4 sm:p-5">
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-admin-border bg-admin-fill/40 px-4 py-3.5 text-[13px] font-medium text-[#005bd3] transition-colors hover:bg-admin-row-hover"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    Add menu item
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !loaded}
                className={`${adminListPrimaryButtonClass} min-w-[7rem] justify-center px-5 py-2`}
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
