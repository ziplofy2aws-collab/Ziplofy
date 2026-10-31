import type { ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { isPasswordTemplateId } from '../../utils/theme-page-registry';
import { templateSectionOrder } from '../shared/structureOrder';
import { isTemplateSectionEnabled } from '../shared/sectionEnabled';
import { CustomThemePageShell } from './CustomThemePageShell';
import { SectionRuntimeNode } from './SectionRuntimeNode';

type Props = {
  templateId: string;
  fallbackSectionIds?: string[];
  /** Rendered inside the page shell before template sections (e.g. Online Store page body). */
  leadIn?: ReactNode;
};

export function CustomThemeTemplatePage({
  templateId,
  fallbackSectionIds = [],
  leadIn,
}: Props) {
  const config = useThemeConfig();
  const order = templateSectionOrder(config, templateId, fallbackSectionIds);
  const hideChrome = isPasswordTemplateId(templateId);

  return (
    <CustomThemePageShell hideChrome={hideChrome}>
      {leadIn}
      {order.map((sectionId) =>
        isTemplateSectionEnabled(config, templateId, sectionId) ? (
          <SectionRuntimeNode
            key={sectionId}
            sectionId={sectionId}
            placement="template"
            templateId={templateId}
          />
        ) : null
      )}
    </CustomThemePageShell>
  );
}
