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
    <div className="min-h-screen w-full bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bars3BottomLeftIcon className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
              <h1 className="text-lg font-medium text-gray-900">Menus</h1>
            </div>
            <p className="mt-0.5 pl-7 text-[13px] font-normal text-gray-500">
              Create and edit menus for your online store header, footer, and other locations.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              to="/content/url-redirects"
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-600 transition-colors hover:bg-gray-50"
            >
              URL redirects
            </Link>
            <Link
              to="/content/menus/new"
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create menu
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setMenuSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                      className="inline-flex items-center gap-1 text-xs font-normal text-gray-500 hover:text-gray-700"
                    >
                      Menu
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </th>
                  <th className="px-3 py-2 text-xs font-normal text-gray-500">Menu items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && menus.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-8 text-center text-[13px] font-normal text-gray-500">
                      Loading menus…
                    </td>
                  </tr>
                ) : sortedMenus.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-8 text-center text-[13px] font-normal text-gray-500">
                      {activeStoreId
                        ? 'No menus yet. Create your first navigation menu.'
                        : 'Select a store to view menus.'}
                    </td>
                  </tr>
                ) : (
                  sortedMenus.map((menu) => (
                    <tr key={menu._id} className="transition-colors hover:bg-gray-50/80">
                      <td className="px-3 py-2.5">
                        <Link
                          to={`/content/menus/${menu._id}`}
                          className="text-[13px] font-normal text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {menu.handle || menu.menuName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-[13px] font-normal text-gray-600">
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

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            Learn more about{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              menus
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
