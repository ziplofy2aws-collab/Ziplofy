import { useThemeConfig } from '@render-store/sdk';
import { resolveRuntimeForSectionType } from '../registry';
import type { SectionRuntimeProps } from '../types';
import { readLayoutSection, readTemplateSection, sectionTypeFromRecord } from './resolveSectionRecord';

type Props = SectionRuntimeProps;

function MissingSection({ sectionId, sectionType }: { sectionId: string; sectionType: string }) {
  return (
    <section
      data-ziplofy-section={sectionId}
      data-ziplofy-node={`layout:${sectionId}`}
      data-ziplofy-label={sectionType}
      data-ziplofy-kind="section"
      style={{
        padding: '24px 16px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        color: '#6b7280',
        background: '#f9fafb',
        borderBottom: '1px dashed #d1d5db',
      }}
    >
      Section &quot;{sectionType}&quot; — runtime not implemented yet
    </section>
  );
}

export function SectionRuntimeNode({ sectionId, placement, templateId = 'index' }: Props) {
  const config = useThemeConfig();
  const record =
    placement === 'layout'
      ? readLayoutSection(config, sectionId)
      : readTemplateSection(config, templateId, sectionId);
  if (!record) return null;
  const sectionType = sectionTypeFromRecord(sectionId, record);
  const Runtime = resolveRuntimeForSectionType(sectionType);

  if (!Runtime) {
    return <MissingSection sectionId={sectionId} sectionType={sectionType} />;
  }

  return <Runtime sectionId={sectionId} placement={placement} templateId={templateId} />;
}
