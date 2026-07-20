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
        onClick={() => onChildClick(child.path)}
        className={`w-full rounded-lg flex items-center gap-2 px-3 py-1.5 pl-10 text-slate-600 hover:bg-slate-100 transition-colors text-left ${
          isActive ? 'bg-blue-50 text-blue-700' : ''
        }`}
      >
        <span className="text-xs font-medium">{child.text}</span>
      </button>
    </li>
  );
}

