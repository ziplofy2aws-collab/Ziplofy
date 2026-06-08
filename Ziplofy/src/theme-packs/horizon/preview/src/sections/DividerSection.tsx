import { Divider } from '../layout/Divider';

type Props = {
  sectionId?: string;
  templateId?: string;
};

/** Template-area divider instance (e.g. index page between hero and collection). */
export function DividerSection({ sectionId = 'divider', templateId = 'index' }: Props) {
  return <Divider sectionId={sectionId} placement="template" templateId={templateId} />;
}
