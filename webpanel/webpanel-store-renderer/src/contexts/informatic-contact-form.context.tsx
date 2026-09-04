import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  StorefrontContactFormProvider,
  type ContactFormPayload,
} from '@render-store/sdk';
import { axiosi } from '@/config/axios.config';
import { useStorefront } from '@/contexts/store.context';

type Props = { children: ReactNode };

export function InformaticStorefrontContactFormProvider({ children }: Props) {
  const { storeFrontMeta } = useStorefront();
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (payload: ContactFormPayload) => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) {
        return { ok: false, message: 'Store is not available' };
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
        const { data } = await axiosi.post<{
          success: boolean;
          message?: string;
        }>(`/storefront/${storeId}/contact-form-submissions`, {
          name,
          email,
          phone: phone || undefined,
          message,
        });
        return {
          ok: Boolean(data.success),
          message: data.message || (data.success ? 'Message sent successfully' : 'Failed to send message'),
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
    [storeFrontMeta?.storeId]
  );

  const value = useMemo(() => ({ submit, submitting }), [submit, submitting]);

  return <StorefrontContactFormProvider value={value}>{children}</StorefrontContactFormProvider>;
}
