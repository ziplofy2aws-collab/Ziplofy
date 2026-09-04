'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpDown, List, Plus } from 'lucide-react';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '@/components/admin-list-ui';
import { storeMenuApi, type StoreMenu } from '@/lib/store-menu';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';

type MenuSort = 'asc' | 'desc';

function MenusTableSkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3].map((index) => (
        <tr key={index} className="animate-pulse border-b border-admin-border/70">
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 shrink-0 rounded-lg bg-[#ebebeb]" />
              <span className="h-4 w-24 rounded bg-[#ebebeb]" />
            </div>
          </td>
          <td className="px-3 py-2.5">
            <span className="block h-3.5 w-3/4 rounded bg-[#ebebeb]" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function StoreMenusPage() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [menus, setMenus] = useState<StoreMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuSort, setMenuSort] = useState<MenuSort>('asc');

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId) {
      setMenus([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storeMenuApi.listMenus(storeId);
      setMenus(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load menus');
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedMenus = useMemo(() => {
    const list = [...menus];
    list.sort((a, b) => {
      const aKey = (a.handle || a.menuName).toLowerCase();
      const bKey = (b.handle || b.menuName).toLowerCase();
      if (aKey < bKey) return menuSort === 'asc' ? -1 : 1;
      if (aKey > bKey) return menuSort === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [menus, menuSort]);

  if (!storeId) {
    return (
      <div className={adminListPageInnerClass}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          Select a store from the account menu to manage navigation menus.
        </div>
      </div>
    );
  }

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 shrink-0 text-admin-text-secondary" />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Menus</h1>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Create and edit menus for your storefront header, footer, and other locations.
            </p>
          </div>
          <Link href="/client/online-store/menus/new" className={adminListPrimaryButtonClass}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create menu
          </Link>
        </header>

        <div className={adminListCardClass}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className={adminListTableHeadRowClass}>
                  <th className={adminListTableHeadClass}>
                    <button
                      type="button"
                      onClick={() => setMenuSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                      className="inline-flex items-center gap-1.5 hover:text-admin-text"
                    >
                      Menu
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className={adminListTableHeadClass}>Menu items</th>
                </tr>
              </thead>
              <tbody>
                {loading && menus.length === 0 ? (
                  <MenusTableSkeletonRows />
                ) : sortedMenus.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-8 text-center text-[13px] text-admin-text-secondary">
                      No menus yet. Create your first navigation menu.
                    </td>
                  </tr>
                ) : (
                  sortedMenus.map((menu) => (
                    <tr key={menu._id} className="border-b border-admin-border/70 bg-white transition-colors last:border-b-0 hover:bg-[#f6f6f7]">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ebebeb] text-admin-text-secondary">
                            <List className="h-4 w-4" />
                          </span>
                          <Link href={`/client/online-store/menus/${menu._id}`} className={`text-[13px] font-medium ${adminListFooterLinkClass}`}>
                            {menu.handle || menu.menuName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-admin-text-secondary">
                        {menu.menuItemsSummary?.trim() ? (
                          <span className="line-clamp-2">{menu.menuItemsSummary}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
