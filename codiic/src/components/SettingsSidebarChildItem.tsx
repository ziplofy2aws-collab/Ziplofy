import { adminSidebarChildItemClass } from './admin-sidebar';
import { SettingsNavItem } from './SettingsSidebarItem';

interface SettingsSidebarChildItemProps {
  child: SettingsNavItem;
  isActive: boolean;
  onChildClick: (path?: string) => void;
}

export default function SettingsSidebarChildItem({
  child,
  isActive,
  onChildClick,
}: SettingsSidebarChildItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onChildClick(child.path)}
        className={adminSidebarChildItemClass(isActive)}
      >
        <span className="text-xs font-medium">{child.text}</span>
      </button>
    </li>
  );
}
