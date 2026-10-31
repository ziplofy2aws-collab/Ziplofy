import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { footerLayoutOrder, headerLayoutOrder } from '../lib/layoutOrder';
import { isLayoutSectionEnabled } from '../lib/sectionEnabled';
import { FooterLayoutSections } from '../layout/FooterLayoutSections';
import { HeaderLayoutSections } from '../layout/HeaderLayoutSections';
import { useThemeColors } from '../tokens';

export function PageShell({ children }: { children: ReactNode }) {
  const config = useThemeConfig();
  const { background, text } = useThemeColors();
  const headerOrder = headerLayoutOrder(config);
  const footerOrder = footerLayoutOrder(config);

  return (
    <div style={{ minHeight: '100vh', background, color: text }}>
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
