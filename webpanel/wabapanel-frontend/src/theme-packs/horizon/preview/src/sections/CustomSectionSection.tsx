import { CustomSection } from '../layout/CustomSection';

type Props = {
  sectionId?: string;
  templateId?: string;
};

export function CustomSectionSection({ sectionId = 'custom_section', templateId = 'index' }: Props) {
  return <CustomSection sectionId={sectionId} placement="template" templateId={templateId} />;
}
