'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  StorefrontContactFormProvider,
  type ContactFormPayload,
} from '@render-store/sdk';
import api from '@/lib/api';

type Props = {
  storeId: string | null;
  children: ReactNode;
};

/** Real contact-form submit in theme editor when a store is selected. */
export function InformaticEditorContactFormProvider({ storeId, children }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (payload: ContactFormPayload) => {
      if (!storeId) {
        return { ok: true, message: 'Preview mode — select a store to test contact form delivery.' };
      }

      const name = payload.name.trim();
      const email = payload.email.trim();
      const message = payload.message.trim();
      const phone = payload.phone?.trim();

      if (!name || !email || !message) {
        return { ok: false, message: 'Name, email, and message are required' };
      }

      setSubmitting(true);
      try {
        const res = await api.post<{ success: boolean; message?: string }>(
          `/storefront/${storeId}/contact-form-submissions`,
          { name, email, phone: phone || undefined, message }
        );
        return {
          ok: Boolean(res.data.success),
          message: res.data.message,
        };
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to send message';
        return { ok: false, message };
      } finally {
        setSubmitting(false);
      }
    },
    [storeId]
  );

  const value = useMemo(() => ({ submit, submitting }), [submit, submitting]);

  return <StorefrontContactFormProvider value={value}>{children}</StorefrontContactFormProvider>;
}
