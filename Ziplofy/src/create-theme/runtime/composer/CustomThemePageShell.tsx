import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { readThemeAnimationsSettings } from '../../settings/theme-animations.settings';
import { readThemeBadgesSettings } from '../../settings/theme-badges.settings';
import '../shared/theme-animations.css';
import '../shared/theme-badges.css';
import { themeBadgeCssVars, resolveThemeBadgeStyles } from '../shared/themeBadgeRuntime';
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
  const headerOrder = headerLayoutOrder(config);
  const footerOrder = footerLayoutOrder(config);

  return (
    <div
      style={{
        minHeight: '100vh',
        background,
        color: text,
        ...themeBadgeCssVars(badgeStyles),
      }}
      data-ziplofy-page-transition={animations.pageTransition ? 'true' : 'false'}
      data-ziplofy-product-card-transition={animations.productCardTransition ? 'true' : 'false'}
      data-ziplofy-add-to-cart-animation={animations.addToCart ? 'true' : 'false'}
      data-ziplofy-card-hover={animations.cardHoverEffect}
      data-ziplofy-badge-position={badges.position}
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
