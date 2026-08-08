import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { adminSidebarNavItemClass } from './admin-sidebar';

interface SettingsSidebarHeaderProps {
  onBack: () => void;
}

/** Renders as an `<li>` so it sits in the same `ul.p-2` list chrome as home. */
export default function SettingsSidebarHeader({ onBack }: SettingsSidebarHeaderProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onBack}
        className={adminSidebarNavItemClass(false)}
        aria-label="Back to home"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-sm font-medium">Settings</span>
      </button>
    </li>
  );
}
