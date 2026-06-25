import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { readThemeAnimationsSettings } from '../../settings/theme-animations.settings';
import { readThemeBadgesSettings } from '../../settings/theme-badges.settings';
import { readThemeCartSettings } from '../../settings/theme-cart.settings';
import { readThemeProductMediaSettings } from '../../settings/theme-product-media.settings';
import '../shared/theme-animations.css';
import '../shared/theme-badges.css';
import '../shared/theme-buttons.css';
import '../shared/theme-cart.css';
import '../shared/theme-drawers.css';
import '../shared/theme-product-media.css';
import '../shared/theme-icons.css';
import '../shared/theme-input-fields.css';
import '../shared/theme-popovers-modals.css';
import '../shared/theme-product-cards.css';
import '../shared/theme-search.css';
import '../shared/theme-swatches.css';
import '../shared/theme-variant-pickers.css';
import { themeBadgeCssVars, resolveThemeBadgeStyles } from '../shared/themeBadgeRuntime';
import { themeButtonCssVars } from '../shared/themeButtonRuntime';
import { themeCartCssVars } from '../shared/themeCartRuntime';
import { themeDrawerCssVars } from '../shared/themeDrawerRuntime';
import { themeIconCssVars } from '../shared/themeIconsRuntime';
import { themeInputFieldsCssVars } from '../shared/themeInputFieldsRuntime';
import { themePopoversModalsCssVars } from '../shared/themePopoversModalsRuntime';
import { themeProductCardsCssVars } from '../shared/themeProductCardsRuntime';
import { themeSearchCssVars } from '../shared/themeSearchRuntime';
import { themeSwatchesCssVars } from '../shared/themeSwatchesRuntime';
import { themeVariantPickersCssVars } from '../shared/themeVariantPickersRuntime';
import { themeProductMediaCssVars } from '../shared/themeProductMediaRuntime';
import { readThemeProductCardsSettings } from '../../settings/theme-product-cards.settings';
import { readThemeSwatchesSettings } from '../../settings/theme-swatches.settings';
import { readThemeVariantPickersSettings } from '../../settings/theme-variant-pickers.settings';
import { readThemeIconsSettings } from '../../settings/theme-icons.settings';
import { footerLayoutOrder, headerLayoutOrder } from '../shared/layoutOrder';
import { isLayoutSectionEnabled } from '../shared/sectionEnabled';
import { useThemeColors } from '../shared/tokens';
import { SectionRuntimeNode } from './SectionRuntimeNode';

export function CustomThemePageShell({ children }: { children: ReactNode }) {
  const config = useThemeConfig();
  const { background, text } = useThemeColors();
  const animations = readThemeAnimationsSettings(config);
  const badges = readThemeBadgesSettings(config);
  const badgeStyles = resolveThemeBadgeStyles(config);
  const cart = readThemeCartSettings(config);
  const productMedia = readThemeProductMediaSettings(config);
  const icons = readThemeIconsSettings(config);
  const productCards = readThemeProductCardsSettings(config);
  const swatches = readThemeSwatchesSettings(config);
  const variantPickers = readThemeVariantPickersSettings(config);
  const headerOrder = headerLayoutOrder(config);
  const footerOrder = footerLayoutOrder(config);

  return (
    <div
      style={{
        minHeight: '100vh',
        background,
        color: text,
        ...themeBadgeCssVars(badgeStyles),
        ...themeButtonCssVars(config),
        ...themeCartCssVars(config),
        ...themeDrawerCssVars(config),
        ...themeProductMediaCssVars(config),
        ...themeIconCssVars(config),
        ...themeInputFieldsCssVars(config),
        ...themePopoversModalsCssVars(config),
        ...themeProductCardsCssVars(config),
        ...themeSearchCssVars(config),
        ...themeSwatchesCssVars(config),
        ...themeVariantPickersCssVars(config),
      }}
      data-ziplofy-page-transition={animations.pageTransition ? 'true' : 'false'}
      data-ziplofy-product-card-transition={animations.productCardTransition ? 'true' : 'false'}
      data-ziplofy-add-to-cart-animation={animations.addToCart ? 'true' : 'false'}
      data-ziplofy-card-hover={animations.cardHoverEffect}
      data-ziplofy-badge-position={badges.position}
      data-ziplofy-cart-type={cart.type}
      data-ziplofy-product-media-border={productMedia.borderStyle}
      data-ziplofy-icon-stroke={icons.stroke}
      data-ziplofy-product-card-quick-add={productCards.quickAdd ? 'true' : 'false'}
      data-ziplofy-product-card-mobile-quick-add={productCards.mobileQuickAdd ? 'true' : 'false'}
      data-ziplofy-swatch-border={swatches.borderStyle}
      data-ziplofy-swatch-variant-images={swatches.variantImages ? 'true' : 'false'}
      data-ziplofy-variant-picker-width={variantPickers.width}
    >
      {headerOrder.map((sectionId) =>
        isLayoutSectionEnabled(config, sectionId) ? (
          <SectionRuntimeNode key={sectionId} sectionId={sectionId} placement="layout" />
        ) : null
      )}
      <main>{children}</main>
      {footerOrder.map((sectionId) =>
        isLayoutSectionEnabled(config, sectionId) ? (
          <SectionRuntimeNode key={sectionId} sectionId={sectionId} placement="layout" />
        ) : null
      )}
    </div>
  );
}
