import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';
import { useStorefront } from './store.context';

export interface CreateNewsletterSubscriptionPayload {
  email: string;
}

export interface NewsletterSubscriptionResult {
  _id: string;
  email: string;
  status: string;
  subscribedAt: string;
}

interface CreateNewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data: NewsletterSubscriptionResult;
}

interface StorefrontNewsletterContextType {
  submitting: boolean;
  error: string | null;
  subscribeToNewsletter: (
    payload: CreateNewsletterSubscriptionPayload
  ) => Promise<NewsletterSubscriptionResult>;
  clearError: () => void;
}

const StorefrontNewsletterContext = createContext<StorefrontNewsletterContextType | undefined>(
  undefined
);

export const StorefrontNewsletterProvider = ({ children }: { children: ReactNode }) => {
  const { storeFrontMeta } = useStorefront();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const subscribeToNewsletter = useCallback(
    async (
      payload: CreateNewsletterSubscriptionPayload
    ): Promise<NewsletterSubscriptionResult> => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) {
        const msg = 'Store is not available';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }

      const email = payload.email.trim();
      if (!email) {
        const msg = 'Email is required';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }

      try {
        setSubmitting(true);
        setError(null);
        const res = await axiosi.post<CreateNewsletterSubscriptionResponse>(
          '/storefront/newsletter-subscriptions',
          {
            storeId,
            email,
          }
        );
        if (!res.data.success) throw new Error('Newsletter subscribe failed');
        toast.success(res.data.message || 'Successfully subscribed to our newsletter');
        return res.data.data;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string; message?: string } }; message?: string })
            ?.response?.data?.error ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to subscribe';
        setError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [storeFrontMeta?.storeId]
  );

  const value: StorefrontNewsletterContextType = {
    submitting,
    error,
    subscribeToNewsletter,
    clearError,
  };

  return (
    <StorefrontNewsletterContext.Provider value={value}>
      {children}
    </StorefrontNewsletterContext.Provider>
  );
};

export const useStorefrontNewsletter = (): StorefrontNewsletterContextType => {
  const ctx = useContext(StorefrontNewsletterContext);
  if (!ctx) {
    // Theme editor preview may not wrap the newsletter provider.
    return {
      submitting: false,
      error: null,
      subscribeToNewsletter: async () => {
        throw new Error('Newsletter is not available');
      },
      clearError: () => {},
    };
  }
  return ctx;
};

export default StorefrontNewsletterContext;
