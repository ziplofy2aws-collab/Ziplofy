import SettingsSidebarChildItem from './SettingsSidebarChildItem';
import { SettingsNavItem } from './SettingsSidebarItem';

interface SettingsSidebarChildrenListProps {
  children: SettingsNavItem[];
  activeChildPath?: string;
  onChildClick: (path?: string) => void;
}

export default function SettingsSidebarChildrenList({
  children,
  activeChildPath,
  onChildClick,
}: SettingsSidebarChildrenListProps) {
  return (
    <ul className="relative z-10 m-0 list-none p-0">
      {children.map((child) => (
        <SettingsSidebarChildItem
          key={child.path}
          child={child}
          isActive={!!child.path && child.path === activeChildPath}
          onChildClick={onChildClick}
        />
      ))}
    </ul>
  );
}
