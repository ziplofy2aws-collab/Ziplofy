import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface SettingsSidebarHeaderProps {
  onBack: () => void;
}

export default function SettingsSidebarHeader({ onBack }: SettingsSidebarHeaderProps) {
  return (
    <div className="border-b border-slate-200/80 px-4 py-3">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="mr-2 cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800">Settings</h2>
      </div>
    </div>
  );
}

