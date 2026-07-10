import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { footerLayoutOrder, headerLayoutOrder } from '../shared/layoutOrder';
import { isLayoutSectionEnabled } from '../shared/sectionEnabled';
import { useThemeColors } from '../shared/tokens';
import { SectionRuntimeNode } from './SectionRuntimeNode';

export function CustomThemePageShell({ children }: { children: ReactNode }) {
  const config = useThemeConfig();
  const { background, text } = useThemeColors();
  const headerOrder = headerLayoutOrder(config);
  const footerOrder = footerLayoutOrder(config);

  return (
    <div style={{ minHeight: '100vh', background, color: text }}>
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
