import { Theme2ProductDetail } from './Theme2ProductDetail';
import type { ReactProductDetailViewModel } from '../shared/useReactProductDetail';

export function Theme2ProductDetailsPage({ detail }: { detail: ReactProductDetailViewModel }) {
  return <Theme2ProductDetail detail={detail} />;
}
