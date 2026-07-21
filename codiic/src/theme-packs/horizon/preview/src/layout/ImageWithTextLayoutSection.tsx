import { ImageWithTextSection } from '../sections/ImageWithTextSection';

type Props = { sectionId: string };

export function ImageWithTextLayoutSection({ sectionId }: Props) {
  return <ImageWithTextSection sectionId={sectionId} placement="layout" />;
}
