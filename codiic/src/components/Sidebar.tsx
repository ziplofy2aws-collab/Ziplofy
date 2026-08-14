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
  ShoppingCartIcon,
  TagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ADMIN_SIDEBAR_WIDTH,
  adminSidebarAsideClass,
  adminSidebarChildItemClass,
  adminSidebarNavItemClass,
} from './admin-sidebar';

// ---- Types ----
interface SubNavItem {
  text: string;
  path: string;
  comingSoon?: boolean;
  /** Additional paths that highlight this sub-item (e.g. legacy theme routes). */
  relatedPaths?: string[];
}

function subNavMatchesPath(sub: SubNavItem, pathname: string): boolean {
  if (sub.comingSoon) return false;
  if (pathname === sub.path || pathname.startsWith(`${sub.path}/`)) return true;
  return (
    sub.relatedPaths?.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? false
  );
}

interface NavItem {
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  children?: SubNavItem[];
  /** Additional paths that keep this section expanded and highlighted (e.g. /companies under Customers). */
  relatedPaths?: string[];
}

const NAV: NavItem[] = [
  { text: 'Home', icon: HomeIcon, path: '/' },
  {
    text: 'Orders',
    icon: ShoppingCartIcon,
    path: '/orders',
    children: [
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
      { text: 'Files', path: '/content/files' },
      { text: 'Menus', path: '/content/menus' },
      { text: 'Blog posts', path: '/content/articles' },
      { text: 'Contact submissions', path: '/content/contact-submissions' },
      { text: 'Newsletter subscriptions', path: '/content/newsletter-subscriptions' },
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
      { text: 'Products', path: '/analytics/products' },
      { text: 'Inventory', path: '/analytics/inventory' },
      { text: 'Customer', path: '/analytics/customers' },
      { text: 'Content / CRM', path: '/analytics/content' },
      { text: 'Live View', path: '/analytics/live-view' },
    ],
  },
  {
    text: 'Online Store',
    icon: GlobeAltIcon,
    path: '/online-store',
    relatedPaths: ['/themes'],
    children: [
      { text: 'Themes', path: '/online-store/themes', relatedPaths: ['/themes'] },
      { text: 'Pages', path: '/online-store/pages' },
      { text: 'Preference', path: '/online-store/preference' },
    ],
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
      if (n.children) {
        map[n.text] =
          location.pathname.startsWith(n.path) ||
          (n.relatedPaths?.some(
            (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
          ) ??
            false);
      }
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
      className={adminSidebarAsideClass}
      style={{ width: `${ADMIN_SIDEBAR_WIDTH}px` }}
    >
      <nav className="flex-1 overflow-y-auto">
        <ul className="m-0 list-none p-2">
          {NAV.map((item) => {
            const hasKids = !!item.children?.length;
            const openSection = open[item.text] ?? false;
            const Icon = item.icon;
            const active =
              isActive(item.path) ||
              (item.relatedPaths?.some((p) => isActive(p)) ?? false);

            /** Longest matching child path so /orders/drafts only highlights Drafts, not Orders */
            const activeSubPath =
              hasKids && item.children
                ? [...item.children]
                    .filter((c) => subNavMatchesPath(c, location.pathname))
                    .sort((a, b) => b.path.length - a.path.length)[0]?.path
                : undefined;

            // White pill on the leaf only — parent stays plain when a child is selected
            const parentHighlighted = hasKids ? active && !activeSubPath : active;

            const activeChildIndex =
              item.children
                ? (() => {
                    const matches = item.children
                      .map((c, i) => ({ sub: c, i }))
                      .filter(({ sub }) => subNavMatchesPath(sub, location.pathname))
                      .sort((a, b) => b.sub.path.length - a.sub.path.length);
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
                    className="absolute left-[10px] top-0 z-0 w-0.5 bg-admin-border"
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
                  className={adminSidebarNavItemClass(parentHighlighted)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-sm font-medium">{item.text}</span>
                  {hasKids && (
                    <span className="shrink-0 text-admin-text-subdued">
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
                        const subActive = subNavMatchesPath(sub, location.pathname) && sub.path === activeSubPath;
                        if (sub.comingSoon) {
                          return (
                            <li key={sub.text}>
                              <span
                                aria-disabled="true"
                                className="flex w-full cursor-not-allowed items-center justify-between gap-2 rounded-lg px-3 py-1.5 pl-10 text-left text-admin-text-subdued"
                              >
                                <span className="text-xs font-medium">{sub.text}</span>
                                <span className="shrink-0 text-[10px] font-normal uppercase tracking-wide text-admin-text-subdued">
                                  Coming soon
                                </span>
                              </span>
                            </li>
                          );
                        }
                        return (
                          <li key={sub.text}>
                            <Link
                              to={sub.path}
                              className={adminSidebarChildItemClass(subActive)}
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

      <div className="mt-2 w-full border-t border-admin-border" />
      {/* settings option */}
      <nav className="pb-3">
        <ul className="m-0 list-none p-2 pt-2">
          <li>
            <Link
              to="/settings/general"
              data-tour-id="nav-settings"
              className={adminSidebarNavItemClass(
                location.pathname.startsWith('/settings')
              )}
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
