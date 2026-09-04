'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  StorefrontLeadGenFormProvider,
  type LeadGenFormDefinition,
} from '@render-store/sdk';
import api from '@/lib/api';

type Props = {
  storeId: string | null;
  children: ReactNode;
};

/** Load + submit linked lead-gen forms in theme editor preview. */
export function InformaticEditorLeadGenFormProvider({ storeId, children }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const loadForm = useCallback(
    async (formId: string): Promise<LeadGenFormDefinition | null> => {
      if (storeId) {
        try {
          const res = await api.get<{ success: boolean; data?: LeadGenFormDefinition }>(
            `/storefront/${storeId}/lead-gen-forms/${encodeURIComponent(formId)}`
          );
          if (res.data.success && res.data.data) return res.data.data;
        } catch {
          /* fall through to public form API */
        }
      }

      try {
        const res = await api.get<{ success: boolean; data?: LeadGenFormDefinition }>(
          `/forms/${encodeURIComponent(formId)}/public`
        );
        return res.data.success && res.data.data ? res.data.data : null;
      } catch {
        return null;
      }
    },
    [storeId]
  );

  const submitForm = useCallback(
    async (formId: string, values: Record<string, string | string[]>) => {
      if (!storeId) {
        return { ok: true, message: 'Preview mode — select a store to test form submission.' };
      }

      setSubmitting(true);
      try {
        const res = await api.post<{ success: boolean; message?: string }>(
          `/storefront/${storeId}/lead-gen-forms/${encodeURIComponent(formId)}/submit`,
          values
        );
        return {
          ok: Boolean(res.data.success),
          message: res.data.message,
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
    [storeId]
  );

  const value = useMemo(
    () => ({ loadForm, submitForm, submitting }),
    [loadForm, submitForm, submitting]
  );

  return <StorefrontLeadGenFormProvider value={value}>{children}</StorefrontLeadGenFormProvider>;
}
