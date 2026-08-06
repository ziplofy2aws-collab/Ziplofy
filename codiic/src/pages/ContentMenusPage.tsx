import { useEffect, useMemo, useState } from 'react';
import {
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from '../components/admin-list-ui';
import { useStoreMenus } from '../contexts/store-menu.context';
import { useStore } from '../contexts/store.context';

type MenuSort = 'asc' | 'desc';

const SKELETON_NAME_WIDTHS = ['w-32', 'w-24', 'w-40', 'w-28', 'w-36'];
const SKELETON_SUMMARY_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5'];

function MenusTableSkeletonRows() {
  return (
    <>
      {SKELETON_NAME_WIDTHS.map((nameWidth, index) => (
        <tr key={index} className="animate-pulse border-b border-admin-divider last:border-b-0">
          <td className="px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 shrink-0 rounded-lg bg-admin-secondary" />
              <span className={`h-4 rounded bg-admin-secondary ${nameWidth}`} />
            </div>
          </td>
          <td className="px-3 py-2.5">
            <span className={`block h-3.5 rounded bg-admin-secondary ${SKELETON_SUMMARY_WIDTHS[index]}`} />
          </td>
        </tr>
      ))}
    </>
  );
}

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
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bars3BottomLeftIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Menus</h1>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Create and edit menus for your online store header, footer, and other locations.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link to="/content/url-redirects" className={adminListSecondaryButtonClass}>
              URL redirects
            </Link>
            <Link to="/content/menus/new" className={adminListPrimaryButtonClass}>
              Create menu
            </Link>
          </div>
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
                      <ArrowsUpDownIcon className="h-3.5 w-3.5" aria-hidden />
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
                    <td
                      colSpan={2}
                      className="px-3 py-8 text-center text-[13px] text-admin-text-secondary"
                    >
                      {activeStoreId
                        ? 'No menus yet. Create your first navigation menu.'
                        : 'Select a store to view menus.'}
                    </td>
                  </tr>
                ) : (
                  sortedMenus.map((menu) => (
                    <tr
                      key={menu._id}
                      className="border-b border-admin-divider bg-admin-surface transition-colors last:border-b-0 hover:bg-admin-row-hover"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-secondary text-admin-text-secondary">
                            <Bars3BottomLeftIcon className="h-4 w-4" />
                          </span>
                          <Link
                            to={`/content/menus/${menu._id}`}
                            className={`text-[13px] font-medium ${adminListFooterLinkClass}`}
                          >
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
};
