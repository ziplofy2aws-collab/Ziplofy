import {
  BellIcon,
  CalendarIcon,
  CodeBracketIcon,
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
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SettingsSidebarHeader from './SettingsSidebarHeader';
import { SettingsNavItem } from './SettingsSidebarItem';
import SettingsSidebarNavList from './SettingsSidebarNavList';

const drawerWidth = 240;

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
  { text: 'Metafields and metaobjects', icon: CodeBracketIcon, path: '/settings/metafields-and-metaobjects' },
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
  // Auto-expand sections based on current path
  const defaultExpanded = useMemo(() => {
    const map: Record<string, boolean> = {};
    SETTINGS_NAV.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.path === currentPath);
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
    (path?: string): boolean => !!path && currentPath === path,
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
      className="fixed left-0 top-12 z-50 flex h-[calc(100vh-48px)] w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/90 backdrop-blur"
      style={{ width: `${drawerWidth}px` }}
    >
      {/* Header Section */}
      <SettingsSidebarHeader onBack={onBack} />

      {/* Navigation List */}
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
