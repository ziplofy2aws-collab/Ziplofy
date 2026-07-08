import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { footerLayoutOrder, headerLayoutOrder } from '../lib/layoutOrder';
import { isLayoutSectionEnabled } from '../lib/sectionEnabled';
import { FooterLayoutSections } from '../layout/FooterLayoutSections';
import { HeaderLayoutSections } from '../layout/HeaderLayoutSections';
import { useThemeColors } from '../tokens';

export function PageShell({ children }: { children: ReactNode }) {
  const config = useThemeConfig();
  const { background, text, primary } = useThemeColors();
  const headerOrder = headerLayoutOrder(config);
  const footerOrder = footerLayoutOrder(config);

  return (
    <div
      className="hz-storefront"
      style={
        {
          minHeight: '100vh',
          background,
          color: text,
          '--hz-bg': background,
          '--hz-text': text,
          '--hz-primary': primary,
          '--hz-on-primary': background,
        } as React.CSSProperties
      }
    >
      {headerOrder.map((sectionId) =>
        isLayoutSectionEnabled(config, sectionId) ? (
          <HeaderLayoutSections key={sectionId} sectionId={sectionId} />
        ) : null
      )}
      <main>{children}</main>
      {footerOrder.map((sectionId) =>
        isLayoutSectionEnabled(config, sectionId) ? (
          <FooterLayoutSections key={sectionId} sectionId={sectionId} />
        ) : null
      )}
    </div>
  );
}
