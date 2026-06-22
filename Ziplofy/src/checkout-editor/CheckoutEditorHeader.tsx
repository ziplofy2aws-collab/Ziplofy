import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import DropdownMenu from '../components/DropdownMenu';
import DropdownMenuItem from '../components/DropdownMenuItem';

type Props = {
  configurationName: string;
  pageLabel: string;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  storeUrl?: string | null;
};

export function CheckoutEditorHeader({
  configurationName,
  pageLabel,
  device,
  onDeviceChange,
  onSave,
  saveDisabled = true,
  saving = false,
  storeUrl,
}: Props) {
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const moreMenuOpen = Boolean(moreMenuAnchor);
  const storefrontHref = storeUrl?.trim() || '';

  const closeMoreMenu = useCallback(() => setMoreMenuAnchor(null), []);

  const handleViewStore = useCallback(() => {
    if (!storefrontHref) return;
    window.open(storefrontHref, '_blank', 'noopener,noreferrer');
    closeMoreMenu();
  }, [storefrontHref, closeMoreMenu]);

  return (
    <header className="relative grid h-14 shrink-0 grid-cols-[1fr_auto] items-center gap-3 border-b border-gray-200 bg-white px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="truncate text-sm font-semibold text-gray-900">{configurationName}</span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
          Active
        </span>
        <span className="truncate text-sm font-medium text-gray-900">{pageLabel}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={`flex h-8 w-9 items-center justify-center rounded-md ${
              device === 'desktop' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
            title="Desktop preview"
          >
            <ComputerDesktopIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={`flex h-8 w-9 items-center justify-center rounded-md ${
              device === 'mobile' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
            }`}
            title="Mobile preview"
          >
            <DevicePhoneMobileIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          disabled
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400"
          title="Undo"
          aria-label="Undo"
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400"
          title="Redo"
          aria-label="Redo"
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => setMoreMenuAnchor(moreMenuOpen ? null : e.currentTarget)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          title="More actions"
          aria-label="More actions"
          aria-expanded={moreMenuOpen}
          aria-haspopup="menu"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
        <DropdownMenu anchorEl={moreMenuAnchor} open={moreMenuOpen} onClose={closeMoreMenu}>
          <DropdownMenuItem onClick={handleViewStore} disabled={!storefrontHref}>
            View store
          </DropdownMenuItem>
        </DropdownMenu>
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || saving}
          className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-white hover:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-100"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </header>
  );
}
