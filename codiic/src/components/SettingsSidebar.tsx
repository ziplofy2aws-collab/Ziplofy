import {
  BellIcon,
  CalendarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  IdentificationIcon,
  LanguageIcon,
  LockClosedIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  StarIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ADMIN_SIDEBAR_WIDTH,
  adminSidebarAsideClass,
} from './admin-sidebar';
import SettingsSidebarHeader from './SettingsSidebarHeader';
import { SettingsNavItem } from './SettingsSidebarItem';
import SettingsSidebarNavList from './SettingsSidebarNavList';

const SETTINGS_NAV: SettingsNavItem[] = [
  { text: 'General', icon: Cog6ToothIcon, path: '/settings/general' },
  { text: 'Plan', icon: StarIcon, path: '/settings/plan' },
  { text: 'Billing', icon: CreditCardIcon, path: '/settings/billing' },
  {
    text: 'Users',
    icon: UserGroupIcon,
    path: '/settings/users',
    children: [
      { text: 'Roles', icon: IdentificationIcon, path: '/settings/users/roles' },
      { text: 'Security', icon: LockClosedIcon, path: '/settings/users/security' },
    ],
  },
  { text: 'Payments', icon: CreditCardIcon, path: '/settings/payments' },
  { text: 'Checkout', icon: ShoppingCartIcon, path: '/settings/checkout' },
  { text: 'Customer Accounts', icon: UserCircleIcon, path: '/settings/customer-accounts' },
  { text: 'Shipping and delivery', icon: TruckIcon, path: '/settings/shipping-and-delivery' },
  { text: 'Taxes and duties', icon: DocumentTextIcon, path: '/settings/taxes-and-duties' },
  { text: 'Locations', icon: MapPinIcon, path: '/settings/locations' },
  { text: 'Markets', icon: GlobeAltIcon, path: '/settings/markets' },
  { text: 'Domains', icon: LanguageIcon, path: '/settings/domains' },
  { text: 'Customer Events', icon: CalendarIcon, path: '/settings/customer-events' },
  { text: 'Notifications', icon: BellIcon, path: '/settings/notifications' },
  { text: 'Languages', icon: LanguageIcon, path: '/settings/languages' },
  { text: 'Customer Privacy', icon: ShieldCheckIcon, path: '/settings/customer-privacy' },
  { text: 'Policies', icon: DocumentTextIcon, path: '/settings/policies' },
];

interface SettingsSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onBack: () => void;
}

export default function SettingsSidebar({ currentPath, onNavigate, onBack }: SettingsSidebarProps) {
  const defaultExpanded = useMemo(() => {
    const map: Record<string, boolean> = {};
    SETTINGS_NAV.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) =>
            !!child.path &&
            (currentPath === child.path || currentPath.startsWith(`${child.path}/`))
        );
        const isPathActive = item.path && currentPath.startsWith(item.path);
        map[item.path || item.text] = hasActiveChild || !!isPathActive;
      }
    });
    return map;
  }, [currentPath]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const isActivePath = useCallback(
    (path?: string): boolean => {
      if (!path) return false;
      return currentPath === path || currentPath.startsWith(`${path}/`);
    },
    [currentPath]
  );

  const handleToggle = useCallback((key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleItemClick = useCallback(
    (item: SettingsNavItem) => {
      if (item.children && item.children.length > 0) {
        handleToggle(item.path || item.text);
        if (item.path) {
          onNavigate(item.path);
        }
      } else if (item.path) {
        onNavigate(item.path);
      }
    },
    [handleToggle, onNavigate]
  );

  const handleChildClick = useCallback(
    (path?: string) => {
      if (path) {
        onNavigate(path);
      }
    },
    [onNavigate]
  );

  return (
    <aside
      className={adminSidebarAsideClass}
      style={{ width: `${ADMIN_SIDEBAR_WIDTH}px` }}
    >
      {/* Same rail chrome as home: top block + divider + scrollable list */}
      <nav className="shrink-0">
        <ul className="m-0 list-none p-2 pb-2">
          <SettingsSidebarHeader onBack={onBack} />
        </ul>
      </nav>

      <div className="w-full border-t border-admin-border" />

      <nav className="flex-1 overflow-y-auto">
        <SettingsSidebarNavList
          items={SETTINGS_NAV}
          currentPath={currentPath}
          expanded={expanded}
          isActivePath={isActivePath}
          onItemClick={handleItemClick}
          onChildClick={handleChildClick}
        />
      </nav>
    </aside>
  );
}
