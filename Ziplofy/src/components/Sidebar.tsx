// src/components/Sidebar.tsx
import {
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HomeIcon,
  MegaphoneIcon,
  PuzzlePieceIcon,
  ShoppingCartIcon,
  TagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Sidebar dimensions
const drawerWidth = 240;

// ---- Types ----
interface SubNavItem {
  text: string;
  path: string;
}

interface NavItem {
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  children?: SubNavItem[];
}

const NAV: NavItem[] = [
  { text: 'Home', icon: HomeIcon, path: '/' },
  {
    text: 'Orders',
    icon: ShoppingCartIcon,
    path: '/orders',
    children: [
      { text: 'Orders', path: '/orders' },
      { text: 'Drafts', path: '/orders/drafts' },
      { text: 'Abandoned Carts', path: '/orders/abandoned-carts' },
    ],
  },
  {
    text: 'Products',
    icon: CubeIcon,
    path: '/products',
    children: [
      { text: 'Collections', path: '/products/collections' },
      { text: 'Inventory', path: '/products/inventory' },
      { text: 'Purchase orders', path: '/products/purchase-orders' },
      { text: 'Transfers', path: '/products/transfers' },
      { text: 'Gift cards', path: '/products/gift-cards' },
    ],
  },
  {
    text: 'Customers',
    icon: UserGroupIcon,
    path: '/customers',
    children: [{ text: 'Segments', path: '/customers/segments' }],
  },
  {
    text: 'Marketing',
    icon: MegaphoneIcon,
    path: '/marketing',
    children: [
      { text: 'Campaigns', path: '/marketing/campaigns' },
      { text: 'Attribution', path: '/marketing/attribution' },
      { text: 'Automations', path: '/marketing/automations' },
    ],
  },
  { text: 'Discounts', icon: TagIcon, path: '/discounts' },
  {
    text: 'Content',
    icon: DocumentTextIcon,
    path: '/content',
    children: [
      { text: 'Metaobjects', path: '/content/metaobjects' },
      { text: 'Files', path: '/content/files' },
      { text: 'Menus', path: '/content/menus' },
      { text: 'Blog posts', path: '/content/blog-posts' },
    ],
  },
  {
    text: 'Markets',
    icon: GlobeAltIcon,
    path: '/markets',
    children: [{ text: 'Catalogs', path: '/markets/catalogs' }],
  },
  {
    text: 'Analytics',
    icon: ChartBarIcon,
    path: '/analytics',
    children: [
      { text: 'Reports', path: '/analytics/reports' },
      { text: 'Live View', path: '/analytics/live-view' },
    ],
  },
  {
    text: 'Online Store',
    icon: GlobeAltIcon,
    path: '/online-store',
    children: [
      { text: 'Themes', path: '/online-store/themes' },
      { text: 'Pages', path: '/online-store/pages' },
      { text: 'Preference', path: '/online-store/preference' },
    ],
  },
  {
    text: 'Themes',
    icon: PuzzlePieceIcon,
    path: '/themes/all-themes',
  },
  {
    text: 'Tag Management',
    icon: TagIcon,
    path: '/tag-management',
  },
  {
    text: 'Vendors',
    icon: UserGroupIcon,
    path: '/vendors',
  },
];

// ---- Component ----
export default function Sidebar() {
  const location = useLocation();

  const defaultOpen = useMemo(() => {
    const map: Record<string, boolean> = {};
    NAV.forEach((n) => {
      if (n.children) map[n.text] = location.pathname.startsWith(n.path);
    });
    return map;
  }, [location.pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(defaultOpen);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);

  const toggle = useCallback((k: string) => {
    setOpen((p) => ({ ...p, [k]: !p[k] }));
  }, []);

  const isActive = useCallback(
    (path: string): boolean => location.pathname === path || location.pathname.startsWith(path + '/'),
    [location.pathname]
  );

  return (
    <aside
      className="fixed left-0 top-12 z-50 flex h-[calc(100vh-48px)] w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/90 backdrop-blur"
      style={{
        width: `${drawerWidth}px`,
      }}
    >
      {/* navbar — match SettingsSidebar: slate surface + p-2 list */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="m-0 list-none p-2">
          {/* nav list */}
          {NAV.map((item) => {
            const hasKids = !!item.children?.length;
            const openSection = open[item.text] ?? false;
            const Icon = item.icon;
            const active = isActive(item.path);

            /** Longest matching child path so /orders/drafts only highlights Drafts, not Orders */
            const activeSubPath =
              hasKids && item.children
                ? [...item.children]
                    .filter(
                      (c) =>
                        location.pathname === c.path ||
                        location.pathname.startsWith(`${c.path}/`)
                    )
                    .sort((a, b) => b.path.length - a.path.length)[0]?.path
                : undefined;

            const activeChildIndex =
              item.children
                ? (() => {
                    const matches = item.children
                      .map((c, i) => ({ path: c.path, i }))
                      .filter(
                        ({ path }) =>
                          location.pathname === path || location.pathname.startsWith(path + '/')
                      )
                      .sort((a, b) => b.path.length - a.path.length);
                    return matches[0]?.i ?? -1;
                  })()
                : -1;

            const lineHeight =
              hasKids && openSection && activeChildIndex >= 0
                ? 40 + 28 * (activeChildIndex + 1) // parent ~40px + each child ~28px
                : 0;

            return (
              <li key={item.text} className="relative">
                {hasKids && openSection && lineHeight > 0 && (
                  <div
                    className="absolute left-[10px] top-0 w-0.5 bg-blue-200 z-0"
                    style={{ height: `${lineHeight}px` }}
                    aria-hidden
                  />
                )}
                <Link
                  to={item.path}
                  onClick={() => {
                    if (hasKids) {
                      toggle(item.text);
                    }
                  }}
                  data-tour-id={`nav-${item.text.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`relative z-10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-sm font-medium">{item.text}</span>
                  {hasKids && (
                    <span className="shrink-0 text-slate-400">
                      {openSection ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </Link>

                {hasKids && (
                  <div
                    className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                      openSection ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className="relative z-10 m-0 list-none">
                      {item.children!.map((sub) => {
                        const subActive = sub.path === activeSubPath;
                        return (
                          <li key={sub.text}>
                            <Link
                              to={sub.path}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 pl-10 text-left transition-colors ${
                                subActive
                                  ? 'bg-blue-50 font-medium text-blue-700'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-xs font-medium">{sub.text}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-2 w-full border-t border-slate-200/80" />
      {/* settings option */}
      <nav className="pb-3">
        <ul className="m-0 list-none p-2 pt-2">
          <li>
            <Link
              to="/settings/general"
              data-tour-id="nav-settings"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                location.pathname.startsWith('/settings')
                  ? 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Cog6ToothIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm font-medium">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
