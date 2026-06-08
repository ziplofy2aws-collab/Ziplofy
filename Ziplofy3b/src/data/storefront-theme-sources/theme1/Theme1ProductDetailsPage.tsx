import { Theme1ProductDetail } from './Theme1ProductDetail';
import type { ReactProductDetailViewModel } from '../shared/useReactProductDetail';

export function Theme1ProductDetailsPage({ detail }: { detail: ReactProductDetailViewModel }) {
  return <Theme1ProductDetail detail={detail} />;
}
