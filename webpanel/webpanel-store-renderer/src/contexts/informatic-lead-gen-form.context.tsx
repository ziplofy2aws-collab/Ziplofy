import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  StorefrontLeadGenFormProvider,
  type LeadGenFormDefinition,
} from '@render-store/sdk';
import { axiosi } from '@/config/axios.config';
import { useStorefront } from '@/contexts/store.context';

type Props = { children: ReactNode };

export function InformaticStorefrontLeadGenFormProvider({ children }: Props) {
  const { storeFrontMeta } = useStorefront();
  const [submitting, setSubmitting] = useState(false);

  const loadForm = useCallback(
    async (formId: string): Promise<LeadGenFormDefinition | null> => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) return null;

      try {
        const { data } = await axiosi.get<{
          success: boolean;
          data?: LeadGenFormDefinition;
        }>(`/storefront/${storeId}/lead-gen-forms/${encodeURIComponent(formId)}`);
        return data.success && data.data ? data.data : null;
      } catch {
        return null;
      }
    },
    [storeFrontMeta?.storeId]
  );

  const submitForm = useCallback(
    async (formId: string, values: Record<string, string | string[]>) => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) {
        return { ok: false, message: 'Store is not available' };
      }

      setSubmitting(true);
      try {
        const { data } = await axiosi.post<{ success: boolean; message?: string }>(
          `/storefront/${storeId}/lead-gen-forms/${encodeURIComponent(formId)}/submit`,
          values
        );
        return {
          ok: Boolean(data.success),
          message: data.message || (data.success ? 'Form submitted successfully' : 'Failed to submit form'),
        };
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to submit form';
        return { ok: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [storeFrontMeta?.storeId]
  );

  const value = useMemo(
    () => ({ loadForm, submitForm, submitting }),
    [loadForm, submitForm, submitting]
  );

  return <StorefrontLeadGenFormProvider value={value}>{children}</StorefrontLeadGenFormProvider>;
}
