import React, { useCallback, useState } from 'react';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import DropdownMenu from '../../components/DropdownMenu';
import DropdownMenuItem from '../../components/DropdownMenuItem';
import { CreateThemePagePicker } from './CreateThemePagePicker';
import { InspectorToggleIcon } from './InspectorToggleIcon';
import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import type { ThemePreviewPage } from './CreateThemeLivePreview';

type Props = {
  themeName: string;
  onThemeNameChange: (name: string) => void;
  packLabel?: string;
  previewPage: ThemePreviewPage;
  onPreviewPageChange: (page: ThemePreviewPage) => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onViewJson?: () => void;
  viewJsonDisabled?: boolean;
  onSave?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  inspectorEnabled?: boolean;
  onInspectorEnabledChange?: (enabled: boolean) => void;
  /** Live storefront URL — used by the ⋮ menu “View” action. */
  storeUrl?: string | null;
};

export function CreateThemeHeader({
  themeName,
  onThemeNameChange,
  packLabel = 'Horizon',
  previewPage,
  onPreviewPageChange,
  manifest,
  editorSchema,
  device,
  onDeviceChange,
  onViewJson,
  viewJsonDisabled,
  onSave,
  saveDisabled = false,
  saving = false,
  inspectorEnabled = true,
  onInspectorEnabledChange,
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
    <header className="relative grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-gray-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2 justify-self-start">
        <input
          type="text"
          value={themeName}
          onChange={(e) => onThemeNameChange(e.target.value)}
          className="max-w-[180px] truncate rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-gray-900 hover:border-gray-200 focus:border-[#005bd3] focus:outline-none"
          aria-label="Theme name"
        />
        <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
          Draft
        </span>
        <span className="hidden shrink-0 text-xs text-gray-500 sm:inline">{packLabel}</span>
      </div>

      <div className="justify-self-center">
        <CreateThemePagePicker
          value={previewPage}
          onChange={onPreviewPageChange}
          manifest={manifest}
          editorSchema={editorSchema}
        />
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        {onViewJson ? (
          <button
            type="button"
            onClick={onViewJson}
            disabled={viewJsonDisabled}
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:inline-flex"
            title="View live theme JSON"
          >
            <span className="font-mono text-[11px] text-gray-500">{'{}'}</span>
            View theme JSON
          </button>
        ) : null}
        {onInspectorEnabledChange ? (
          <button
            type="button"
            onClick={() => onInspectorEnabledChange(!inspectorEnabled)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              inspectorEnabled
                ? 'border-[#b4cce8] bg-[#e8f0fe] text-[#005bd3]'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title={inspectorEnabled ? 'Turn off inspector' : 'Turn on inspector'}
            aria-pressed={inspectorEnabled}
            aria-label="Inspector"
          >
            <InspectorToggleIcon className="h-5 w-5" />
          </button>
        ) : null}
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
            View
          </DropdownMenuItem>
        </DropdownMenu>
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || saving}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </header>
  );
}
