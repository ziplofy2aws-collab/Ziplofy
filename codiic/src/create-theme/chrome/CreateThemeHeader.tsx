import React, { useCallback, useMemo, useState } from 'react';
import {
  DevicePhoneMobileIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import DropdownMenu from '../../components/DropdownMenu';
import DropdownMenuItem from '../../components/DropdownMenuItem';
import {
  CodiixChatPanel,
  CodiixFaceIcon,
  buildCodiixPageOptions,
  buildCodiixStructure,
  resolveAnnouncementContext,
  type CodiixApplyResult,
  type CodiixNavigateResult,
  type CodiixSaveResult,
} from '../codiix';
import { CreateThemePagePicker } from './CreateThemePagePicker';
import { InspectorToggleIcon } from './InspectorToggleIcon';
import type { EditorSchemaDoc } from '../sidebar/create-theme-sidebar.types';
import type { ThemePreviewPage } from './CreateThemeLivePreview';
import type { ThemeEditorFieldType } from '../sidebar/create-theme-field.utils';

type Props = {
  themeName: string;
  onThemeNameChange: (name: string) => void;
  previewPage: ThemePreviewPage;
  onPreviewPageChange: (page: ThemePreviewPage) => void;
  onOpenCheckoutEditor?: () => void;
  manifest: Record<string, unknown> | null;
  editorSchema: EditorSchemaDoc | null;
  themeConfig?: Record<string, unknown> | null;
  /** Live preview config (values applied) — used for Codiix edits / structure. */
  liveThemeConfig?: Record<string, unknown> | null;
  onThemeConfigChange?: (config: Record<string, unknown>, previewPage?: ThemePreviewPage) => void;
  device: 'desktop' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'mobile') => void;
  onSave?: () => CodiixSaveResult | void;
  saveDisabled?: boolean;
  saving?: boolean;
  inspectorEnabled?: boolean;
  onInspectorEnabledChange?: (enabled: boolean) => void;
  /** Live storefront URL — used by the ⋮ menu “View” action. */
  storeUrl?: string | null;
  /** Apply this editor theme to the active store’s live storefront. */
  onApplyTheme?: () => CodiixApplyResult | void;
  applyThemeDisabled?: boolean;
  applyingTheme?: boolean;
  themeAlreadyApplied?: boolean;
  /** Agentic Codiix — insert a create-theme element by id. */
  onAgenticInsert?: (elementId: string) => boolean | void;
  /** Codiix reorder — same path as sidebar drag (listKey + ordered node ids). */
  onReorderSections?: (listKey: string, orderedIds: string[]) => boolean | void;
  /** Live section order for the current page (preferred over reading config alone). */
  itemOrder?: Record<string, string[]>;
  /** Codiix announcement-bar field edits (same path as settings panel). */
  onEditField?: (
    path: string,
    fieldType: ThemeEditorFieldType,
    value: string | boolean,
    selectNodeId?: string,
  ) => boolean | void;
  /** Shown only when Codiix switches pages — not for manual page picker changes. */
  onCodiixPageSwitch?: () => void;
};

const iconBtn =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800';

export function CreateThemeHeader({
  themeName,
  onThemeNameChange,
  previewPage,
  onPreviewPageChange,
  onOpenCheckoutEditor,
  manifest,
  editorSchema,
  themeConfig,
  liveThemeConfig,
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
  onAgenticInsert,
  onReorderSections,
  itemOrder,
  onEditField,
  onCodiixPageSwitch,
}: Props) {
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [codiixOpen, setCodiixOpen] = useState(false);
  const [codiixExpanded, setCodiixExpanded] = useState(true);
  const moreMenuOpen = Boolean(moreMenuAnchor);
  const storefrontHref = storeUrl?.trim() || '';

  const codiixPages = useMemo(
    () => buildCodiixPageOptions(manifest, editorSchema, themeConfig),
    [manifest, editorSchema, themeConfig],
  );

  const structureConfig = liveThemeConfig ?? themeConfig;
  const codiixStructure = useMemo(
    () => buildCodiixStructure(structureConfig, previewPage, itemOrder),
    [structureConfig, previewPage, itemOrder],
  );

  const announcement = useMemo(
    () => resolveAnnouncementContext(structureConfig),
    [structureConfig],
  );

  const closeMoreMenu = useCallback(() => setMoreMenuAnchor(null), []);
  const toggleCodiix = useCallback(() => setCodiixOpen((v) => !v), []);
  const closeCodiix = useCallback(() => setCodiixOpen(false), []);

  const handleViewStore = useCallback(() => {
    if (!storefrontHref) return;
    window.open(storefrontHref, '_blank', 'noopener,noreferrer');
    closeMoreMenu();
  }, [storefrontHref, closeMoreMenu]);

  const handleApplyTheme = useCallback((): CodiixApplyResult | void => {
    if (applyThemeDisabled || applyingTheme) return 'busy';
    return onApplyTheme?.();
  }, [applyThemeDisabled, applyingTheme, onApplyTheme]);

  const handleApplyThemeMenu = useCallback(() => {
    if (applyThemeDisabled || applyingTheme) return;
    onApplyTheme?.();
    closeMoreMenu();
  }, [applyThemeDisabled, applyingTheme, onApplyTheme, closeMoreMenu]);

  const handleCodiixNavigate = useCallback(
    (pageId: string): CodiixNavigateResult => {
      if (pageId === 'checkout') {
        onOpenCheckoutEditor?.();
        return 'checkout';
      }
      if (pageId === previewPage) return 'same';
      onCodiixPageSwitch?.();
      onPreviewPageChange(pageId);
      return 'ok';
    },
    [onOpenCheckoutEditor, onPreviewPageChange, onCodiixPageSwitch, previewPage],
  );

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

      <div className="flex items-center gap-1 justify-self-end">
        <button
          type="button"
          onClick={toggleCodiix}
          className={`codiix-header-btn ${codiixOpen ? 'codiix-header-btn--active' : ''}`}
          title="Ask Codiix"
          aria-label="Ask Codiix"
          aria-pressed={codiixOpen}
          aria-haspopup="dialog"
        >
          <CodiixFaceIcon className="h-7 w-7" title="Codiix" />
        </button>

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

        <button
          type="button"
          onClick={() => onDeviceChange(device === 'mobile' ? 'desktop' : 'mobile')}
          className={`${iconBtn} create-theme-device-toggle ${
            device === 'mobile' ? 'create-theme-device-toggle--mobile bg-gray-100 text-gray-900' : ''
          }`}
          title={device === 'mobile' ? 'Return to desktop preview' : 'Switch to mobile preview'}
          aria-pressed={device === 'mobile'}
          aria-label={device === 'mobile' ? 'Return to desktop preview' : 'Switch to mobile preview'}
        >
          <DevicePhoneMobileIcon className="h-5 w-5" />
        </button>

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
              onClick={handleApplyThemeMenu}
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

        <div className="mx-1 h-6 w-px shrink-0 bg-gray-200" aria-hidden="true" />

        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled || saving}
          className="h-10 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <CodiixChatPanel
        open={codiixOpen}
        onClose={closeCodiix}
        expanded={codiixExpanded}
        onExpandedChange={setCodiixExpanded}
        onAgenticInsert={onAgenticInsert}
        onSave={onSave}
        saveDisabled={saveDisabled}
        onApplyTheme={handleApplyTheme}
        applyThemeDisabled={applyThemeDisabled || applyingTheme}
        pages={codiixPages}
        currentPageId={previewPage}
        onNavigatePage={handleCodiixNavigate}
        structure={codiixStructure}
        onReorderSections={onReorderSections}
        announcement={announcement}
        onEditField={onEditField}
      />
    </header>
  );
}
