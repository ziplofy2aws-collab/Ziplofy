import { ProductHighlightSection } from '../sections/ProductHighlightSection';

type Props = { sectionId: string };

export function ProductHighlightLayoutSection({ sectionId }: Props) {
  return <ProductHighlightSection sectionId={sectionId} placement="layout" />;
}
