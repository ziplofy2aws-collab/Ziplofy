import { useThemeConfig } from '@render-store/sdk';
import { templateSectionOrder } from '../shared/structureOrder';
import { isTemplateSectionEnabled } from '../shared/sectionEnabled';
import { CustomThemePageShell } from './CustomThemePageShell';
import { SectionRuntimeNode } from './SectionRuntimeNode';

type Props = {
  templateId: string;
  fallbackSectionIds?: string[];
};

export function CustomThemeTemplatePage({ templateId, fallbackSectionIds = [] }: Props) {
  const config = useThemeConfig();
  const order = templateSectionOrder(config, templateId, fallbackSectionIds);

  return (
    <CustomThemePageShell>
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
