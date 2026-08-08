import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { adminSidebarNavItemClass } from './admin-sidebar';
import SettingsSidebarChildrenList from './SettingsSidebarChildrenList';

export interface SettingsNavItem {
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  children?: SettingsNavItem[];
}

interface SettingsSidebarItemProps {
  item: SettingsNavItem;
  parentHighlighted: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  activeChildPath?: string;
  activeChildIndex: number;
  onItemClick: (item: SettingsNavItem) => void;
  onChildClick: (path?: string) => void;
}

export default function SettingsSidebarItem({
  item,
  parentHighlighted,
  isExpanded,
  hasChildren,
  activeChildPath,
  activeChildIndex,
  onItemClick,
  onChildClick,
}: SettingsSidebarItemProps) {
  const Icon = item.icon;

  const lineHeight =
    hasChildren && isExpanded && activeChildIndex >= 0
      ? 40 + 28 * (activeChildIndex + 1)
      : 0;

  return (
    <li className="relative">
      {hasChildren && isExpanded && lineHeight > 0 ? (
        <div
          className="absolute left-[10px] top-0 z-0 w-0.5 bg-admin-border"
          style={{ height: `${lineHeight}px` }}
          aria-hidden
        />
      ) : null}

      <button
        type="button"
        onClick={() => onItemClick(item)}
        className={adminSidebarNavItemClass(parentHighlighted)}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">{item.text}</span>
        {hasChildren ? (
          <span className="shrink-0 text-admin-text-subdued">
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </span>
        ) : null}
      </button>

      {hasChildren ? (
        <div
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <SettingsSidebarChildrenList
            children={item.children!}
            activeChildPath={activeChildPath}
            onChildClick={onChildClick}
          />
        </div>
      ) : null}
    </li>
  );
}
