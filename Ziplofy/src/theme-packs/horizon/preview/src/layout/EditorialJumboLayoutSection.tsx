import { EditorialJumboSection } from '../sections/EditorialJumboSection';

type Props = { sectionId: string };

export function EditorialJumboLayoutSection({ sectionId }: Props) {
  return <EditorialJumboSection sectionId={sectionId} placement="layout" />;
}
