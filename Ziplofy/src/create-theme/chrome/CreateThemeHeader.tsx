import React, { useCallback, useState } from 'react';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import DropdownMenu from '../../components/DropdownMenu';
import DropdownMenuItem from '../../components/DropdownMenuItem';
import { CreateThemePagePicker } from './CreateThemePagePicker';
import { InspectorToggleIcon } from './InspectorToggleIcon';
import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import type { ThemePreviewPage } from './CreateThemeLivePreview';

type Props = {
  themeName: string;
  onThemeNameChange: (name: string) => void;
  previewPage: ThemePreviewPage;
  onPreviewPageChange: (page: ThemePreviewPage) => void;
  onOpenCheckoutEditor?: () => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
  themeConfig?: Record<string, unknown> | null;
  onThemeConfigChange?: (config: Record<string, unknown>, previewPage?: ThemePreviewPage) => void;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  inspectorEnabled?: boolean;
  onInspectorEnabledChange?: (enabled: boolean) => void;
  /** Live storefront URL — used by the ⋮ menu “View” action. */
  storeUrl?: string | null;
  /** Apply this editor theme to the active store’s live storefront. */
  onApplyTheme?: () => void;
  applyThemeDisabled?: boolean;
  applyingTheme?: boolean;
  themeAlreadyApplied?: boolean;
};

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800';

export function CreateThemeHeader({
  themeName,
  onThemeNameChange,
  previewPage,
  onPreviewPageChange,
  onOpenCheckoutEditor,
  manifest,
  editorSchema,
  themeConfig,
  onThemeConfigChange,
  device,
  onDeviceChange,
  onSave,
  saveDisabled = false,
  saving = false,
  inspectorEnabled = true,
  onInspectorEnabledChange,
  storeUrl,
  onApplyTheme,
  applyThemeDisabled = false,
  applyingTheme = false,
  themeAlreadyApplied = false,
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

  const handleApplyTheme = useCallback(() => {
    if (applyThemeDisabled || applyingTheme) return;
    onApplyTheme?.();
    closeMoreMenu();
  }, [applyThemeDisabled, applyingTheme, onApplyTheme, closeMoreMenu]);

  return (
    <header className="relative grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[#e5e5e5] bg-white px-4">
      <div className="min-w-0 justify-self-start">
        <input
          type="text"
          value={themeName}
          onChange={(e) => onThemeNameChange(e.target.value)}
          className="w-full max-w-[220px] truncate border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
          aria-label="Theme name"
          placeholder="Theme name"
        />
      </div>

      <div className="justify-self-center">
        <CreateThemePagePicker
          value={previewPage}
          onChange={onPreviewPageChange}
          onOpenInNewTab={(item) => {
            if (item.previewPage === 'checkout') onOpenCheckoutEditor?.();
          }}
          manifest={manifest}
          editorSchema={editorSchema}
          themeConfig={themeConfig}
          onThemeConfigChange={onThemeConfigChange}
        />
      </div>

      <div className="flex items-center gap-0.5 justify-self-end">
        {onInspectorEnabledChange ? (
          <button
            type="button"
            onClick={() => onInspectorEnabledChange(!inspectorEnabled)}
            className={`${iconBtn} ${
              inspectorEnabled ? 'bg-gray-100 text-gray-900' : ''
            }`}
            title={inspectorEnabled ? 'Turn off inspector' : 'Turn on inspector'}
            aria-pressed={inspectorEnabled}
            aria-label="Inspector"
          >
            <InspectorToggleIcon className="h-5 w-5" />
          </button>
        ) : null}

        <div className="mx-1 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={`${iconBtn} ${device === 'desktop' ? 'bg-gray-100 text-gray-900' : ''}`}
            title="Desktop preview"
            aria-pressed={device === 'desktop'}
            aria-label="Desktop preview"
          >
            <ComputerDesktopIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={`${iconBtn} ${device === 'mobile' ? 'bg-gray-100 text-gray-900' : ''}`}
            title="Mobile preview"
            aria-pressed={device === 'mobile'}
            aria-label="Mobile preview"
          >
            <DevicePhoneMobileIcon className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => setMoreMenuAnchor(moreMenuOpen ? null : e.currentTarget)}
          className={iconBtn}
          title="More actions"
          aria-label="More actions"
          aria-expanded={moreMenuOpen}
          aria-haspopup="menu"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
        <DropdownMenu anchorEl={moreMenuAnchor} open={moreMenuOpen} onClose={closeMoreMenu}>
          <DropdownMenuItem onClick={handleViewStore} disabled={!storefrontHref}>
            View store
          </DropdownMenuItem>
          {onApplyTheme ? (
            <DropdownMenuItem
              onClick={handleApplyTheme}
              disabled={applyThemeDisabled || applyingTheme}
            >
              {applyingTheme
                ? 'Applying…'
                : themeAlreadyApplied
                  ? 'Apply theme (live)'
                  : 'Apply theme'}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenu>

        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || saving}
          className="ml-2 h-9 rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </header>
  );
}
