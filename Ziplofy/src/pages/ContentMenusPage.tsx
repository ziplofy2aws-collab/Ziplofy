import { useEffect, useMemo, useState } from 'react';
import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useStoreMenus } from '../contexts/store-menu.context';
import { useStore } from '../contexts/store.context';

type MenuSort = 'asc' | 'desc';

export const ContentMenusPage = () => {
  const { activeStoreId } = useStore();
  const { menus, loading, fetchMenusByStoreId } = useStoreMenus();
  const [menuSort, setMenuSort] = useState<MenuSort>('asc');

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchMenusByStoreId(activeStoreId);
  }, [activeStoreId, fetchMenusByStoreId]);

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

  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Menus</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and edit menus for your online store header, footer, and other locations.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              to="/content/url-redirects"
              className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
            >
              URL redirects
            </Link>
            <Link
              to="/content/menus/new"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Create menu
            </Link>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setMenuSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wider hover:text-gray-700"
                    >
                      Menu
                      <ArrowsUpDownIcon className="h-4 w-4" aria-hidden />
                    </button>
                  </th>
                  <th className="px-5 py-3 sm:px-6">Menu items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && menus.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-sm text-gray-500 sm:px-6">
                      Loading menus…
                    </td>
                  </tr>
                ) : sortedMenus.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-sm text-gray-500 sm:px-6">
                      {activeStoreId
                        ? 'No menus yet. Create your first navigation menu.'
                        : 'Select a store to view menus.'}
                    </td>
                  </tr>
                ) : (
                  sortedMenus.map((menu) => (
                    <tr key={menu._id} className="transition-colors hover:bg-gray-50/60">
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <Bars3BottomLeftIcon className="h-4 w-4" />
                          </span>
                          <Link
                            to={`/content/menus/${menu._id}`}
                            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {menu.handle || menu.menuName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 sm:px-6">
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
};
