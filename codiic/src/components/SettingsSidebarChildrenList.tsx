import SettingsSidebarChildItem from './SettingsSidebarChildItem';
import { SettingsNavItem } from './SettingsSidebarItem';

interface SettingsSidebarChildrenListProps {
  children: SettingsNavItem[];
  isActivePath: (path?: string) => boolean;
  onChildClick: (path?: string) => void;
}

export default function SettingsSidebarChildrenList({
  children,
  isActivePath,
  onChildClick,
}: SettingsSidebarChildrenListProps) {
  return (
    <ul className="p-0 m-0 list-none">
      {children.map((child) => {
        const childActiveState = isActivePath(child.path);
        return (
          <SettingsSidebarChildItem
            key={child.path}
            child={child}
            isActive={childActiveState}
            onChildClick={onChildClick}
          />
        );
      })}
    </ul>
  );
}

