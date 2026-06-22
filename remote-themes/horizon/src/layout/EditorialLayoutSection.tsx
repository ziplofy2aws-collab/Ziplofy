import { EditorialSection } from '../sections/EditorialSection';

type Props = { sectionId: string };

export function EditorialLayoutSection({ sectionId }: Props) {
  return <EditorialSection sectionId={sectionId} placement="layout" />;
}
