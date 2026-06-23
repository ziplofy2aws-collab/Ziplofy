import { useEffect, useState } from 'react';
import { axiosi } from '../../../config/axios.config';

export type CheckoutPreviewProduct = {
  _id: string;
  title: string;
  price: number;
  imageUrl: string | null;
};

type PreviewProductResponse = {
  success: boolean;
  data: CheckoutPreviewProduct | null;
};

export function useCheckoutPreviewProduct(storeId?: string | null) {
  const [product, setProduct] = useState<CheckoutPreviewProduct | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId) {
      setProduct(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await axiosi.get<PreviewProductResponse>(`/products/store/${storeId}/preview`);
        if (cancelled) return;
        setProduct(res.data.success ? res.data.data : null);
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return { product, loading };
}
