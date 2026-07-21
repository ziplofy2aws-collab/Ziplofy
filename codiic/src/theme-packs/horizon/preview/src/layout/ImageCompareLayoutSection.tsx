import { ImageCompareSection } from '../sections/ImageCompareSection';

type Props = { sectionId: string };

export function ImageCompareLayoutSection({ sectionId }: Props) {
  return <ImageCompareSection sectionId={sectionId} placement="layout" />;
}
