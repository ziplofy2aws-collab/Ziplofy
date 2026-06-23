import { ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import ToggleSwitch from '../../../components/ToggleSwitch';
import {
  CHECKOUT_DEFAULT_ACCENT_COLOR,
  CHECKOUT_DEFAULT_BUTTON_COLOR,
  CHECKOUT_DEFAULT_ERROR_COLOR,
  CHECKOUT_DEFAULT_HEADER_BACKGROUND,
  CHECKOUT_DEFAULT_HEADER_THEME_ACCENT,
  CHECKOUT_DEFAULT_MAIN_BACKGROUND,
  type CheckoutGlobalSettings,
} from './checkout-settings.types';
import { CHECKOUT_THEME_SETTINGS_CATALOG } from './checkout-theme-settings-catalog';
import { CheckoutLayoutPicker } from './CheckoutLayoutPicker';
import {
  CheckoutColorPaletteEditor,
  CheckoutDefaultColorSelect,
  CheckoutThemeColorField,
  CheckoutTypographyFontSelect,
  CheckoutLogoImageField,
  CheckoutLogoWidthField,
  CheckoutSegmentedAlignment,
  CheckoutSettingsRow,
} from './CheckoutThemeSettingsFields';

type Props = {
  settings: Required<CheckoutGlobalSettings>;
  onSettingsChange: (patch: Partial<CheckoutGlobalSettings>) => void;
  onNavigateToOrderSummary?: () => void;
};

function renderAccordionPanel(
  id: string,
  settings: Required<CheckoutGlobalSettings>,
  onSettingsChange: (patch: Partial<CheckoutGlobalSettings>) => void,
  onNavigateToOrderSummary?: () => void
) {
  switch (id) {
    case 'logo':
      return (
        <div className="space-y-4">
          <CheckoutSettingsRow label="Image">
            <CheckoutLogoImageField
              imageUrl={settings.logoImage}
              onChange={(logoImage) => onSettingsChange({ logoImage })}
            />
          </CheckoutSettingsRow>
          <CheckoutLogoWidthField
            value={settings.logoWidth}
            onChange={(logoWidth) => onSettingsChange({ logoWidth })}
          />
          <CheckoutSettingsRow label="Alignment">
            <CheckoutSegmentedAlignment
              value={settings.logoAlignment}
              onChange={(logoAlignment) => onSettingsChange({ logoAlignment })}
            />
          </CheckoutSettingsRow>
        </div>
      );
    case 'color-palette':
      return (
        <CheckoutColorPaletteEditor
          colors={settings.colorPalette}
          onChange={onSettingsChange}
        />
      );
    case 'main':
      return (
        <CheckoutSettingsRow label="Background">
          <CheckoutThemeColorField
            value={settings.mainBackgroundColor}
            defaultHex={CHECKOUT_DEFAULT_MAIN_BACKGROUND}
            onChange={(mainBackgroundColor) => onSettingsChange({ mainBackgroundColor })}
          />
        </CheckoutSettingsRow>
      );
    case 'header':
      return (
        <div className="space-y-4">
          <p className="text-[12px] leading-relaxed text-gray-600">
            Applies to full width headers in checkout and customer accounts
          </p>
          <CheckoutSettingsRow label="Background">
            <CheckoutThemeColorField
              value={settings.headerBackgroundColor}
              defaultHex={CHECKOUT_DEFAULT_HEADER_BACKGROUND}
              paletteColor={settings.colorPalette[1]}
              onChange={(headerBackgroundColor) => onSettingsChange({ headerBackgroundColor })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow
            label="Accent"
            helper="For links and cart icon"
          >
            <CheckoutThemeColorField
              value={settings.headerAccentColor}
              defaultHex={CHECKOUT_DEFAULT_HEADER_THEME_ACCENT}
              paletteColor={settings.colorPalette[0]}
              onChange={(headerAccentColor) => onSettingsChange({ headerAccentColor })}
            />
          </CheckoutSettingsRow>
        </div>
      );
    case 'order-summary':
      return (
        <p className="text-[13px] leading-relaxed text-gray-700">
          Edit{' '}
          <button
            type="button"
            onClick={onNavigateToOrderSummary}
            className="font-medium text-[#005bd3] underline hover:no-underline"
          >
            order summary
          </button>{' '}
          on the checkout page.
        </p>
      );
    case 'accent-and-buttons':
      return (
        <div className="space-y-4">
          <p className="text-[12px] leading-relaxed text-gray-600">
            Colors for links, selections, and buttons
          </p>
          <CheckoutSettingsRow label="Accent">
            <CheckoutThemeColorField
              value={settings.accentColor}
              defaultHex={CHECKOUT_DEFAULT_ACCENT_COLOR}
              paletteColor={settings.colorPalette[0]}
              onChange={(accentColor) => onSettingsChange({ accentColor })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow label="Button">
            <CheckoutThemeColorField
              value={settings.buttonColor}
              defaultHex={CHECKOUT_DEFAULT_BUTTON_COLOR}
              paletteColor={settings.colorPalette[0]}
              onChange={(buttonColor) => onSettingsChange({ buttonColor })}
            />
          </CheckoutSettingsRow>
        </div>
      );
    case 'input-fields':
      return (
        <div className="space-y-4">
          <CheckoutSettingsRow label="Error">
            <CheckoutDefaultColorSelect
              id="checkout-input-error"
              value={settings.inputFieldsErrorColor}
              defaultHex={CHECKOUT_DEFAULT_ERROR_COLOR}
              onChange={(inputFieldsErrorColor) => onSettingsChange({ inputFieldsErrorColor })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow label="Transparent">
            <div className="ml-auto flex min-w-[208px] justify-end">
              <ToggleSwitch
                checked={settings.inputFieldsTransparent}
                onChange={(inputFieldsTransparent) => onSettingsChange({ inputFieldsTransparent })}
              />
            </div>
          </CheckoutSettingsRow>
        </div>
      );
    case 'typography':
      return (
        <div className="space-y-4">
          <CheckoutSettingsRow label="Headings">
            <CheckoutTypographyFontSelect
              id="checkout-typography-headings"
              value={settings.typographyHeadings}
              onChange={(typographyHeadings) => onSettingsChange({ typographyHeadings })}
            />
          </CheckoutSettingsRow>
          <CheckoutSettingsRow label="Body">
            <CheckoutTypographyFontSelect
              id="checkout-typography-body"
              value={settings.typographyBody}
              onChange={(typographyBody) => onSettingsChange({ typographyBody })}
            />
          </CheckoutSettingsRow>
        </div>
      );
    default:
      return null;
  }
}

export function CheckoutThemeSettingsNav({
  settings,
  onSettingsChange,
  onNavigateToOrderSummary,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav className="pb-2" aria-label="Checkout settings">
      {CHECKOUT_THEME_SETTINGS_CATALOG.map((item) => {
        const isOpen = expandedIds[item.id] === true;
        return (
          <div key={item.id} className="border-b border-[#e1e1e1]">
            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-3.5 text-left text-[15px] text-gray-900 transition-colors hover:bg-[#ededed] ${
                isOpen ? 'bg-[#f6f6f7]' : ''
              }`}
              aria-expanded={isOpen}
            >
              <span className="min-w-0 truncate font-normal">{item.label}</span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="border-t border-[#e1e1e1] bg-white px-3 py-4">
                {renderAccordionPanel(item.id, settings, onSettingsChange, onNavigateToOrderSummary)}
              </div>
            ) : null}
          </div>
        );
      })}

      <section className="border-b border-[#e1e1e1] px-3 py-4">
        <h3 className="text-[13px] font-semibold text-gray-900">Checkout layout</h3>
        <div className="mt-3">
          <CheckoutLayoutPicker
            layout={settings.layout}
            onLayoutChange={(layout) => onSettingsChange({ layout })}
          />
        </div>
      </section>

      <section className="border-b border-[#e1e1e1] px-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900">Address autocompletion</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-gray-600">
              Use address autocompletion
            </p>
          </div>
          <ToggleSwitch
            checked={settings.addressAutocompletion}
            onChange={(checked) => onSettingsChange({ addressAutocompletion: checked })}
          />
        </div>
      </section>

      <section className="px-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900">Buy again button</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-gray-600">
              Allow customers to reorder
            </p>
          </div>
          <ToggleSwitch
            checked={settings.buyAgainButton}
            onChange={(checked) => onSettingsChange({ buyAgainButton: checked })}
          />
        </div>
      </section>
    </nav>
  );
}
