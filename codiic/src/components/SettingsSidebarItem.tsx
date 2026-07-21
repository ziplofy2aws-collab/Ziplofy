import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import SettingsSidebarChildrenList from './SettingsSidebarChildrenList';

export interface SettingsNavItem {
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
  children?: SettingsNavItem[];
}

interface SettingsSidebarItemProps {
  item: SettingsNavItem;
  isCurrentPath: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onItemClick: (item: SettingsNavItem) => void;
  onChildClick: (path?: string) => void;
  isActivePath: (path?: string) => boolean;
}

export default function SettingsSidebarItem({
  item,
  isCurrentPath,
  isExpanded,
  hasChildren,
  onItemClick,
  onChildClick,
  isActivePath,
}: SettingsSidebarItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={() => onItemClick(item)}
        className={`w-full rounded-lg flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors text-left ${
          isCurrentPath ? 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]' : ''
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">{item.text}</span>
        {hasChildren && (
          <span className="shrink-0">
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            )}
          </span>
        )}
      </button>

      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <SettingsSidebarChildrenList
            children={item.children!}
            isActivePath={isActivePath}
            onChildClick={onChildClick}
          />
        </div>
      )}
    </li>
  );
}

