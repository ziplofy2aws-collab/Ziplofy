import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export const NEWSLETTER_SUBSCRIPTION_STATUS = ['subscribed', 'unsubscribed'] as const;
export type NewsletterSubscriptionStatus = (typeof NEWSLETTER_SUBSCRIPTION_STATUS)[number];

export interface NewsletterSubscription {
  _id: string;
  storeId: string;
  email: string;
  status: NewsletterSubscriptionStatus;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterSubscriptionsListResponse {
  success: boolean;
  data: NewsletterSubscription[];
  count: number;
}

interface NewsletterSubscriptionContextType {
  subscriptions: NewsletterSubscription[];
  loading: boolean;
  error: string | null;
  fetchSubscriptionsByStoreId: (
    storeId: string,
    params?: { status?: NewsletterSubscriptionStatus }
  ) => Promise<NewsletterSubscription[]>;
  clearSubscriptions: () => void;
  clearError: () => void;
}

const NewsletterSubscriptionContext = createContext<NewsletterSubscriptionContextType | undefined>(
  undefined
);

export const NewsletterSubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionsByStoreId = useCallback(
    async (
      storeId: string,
      params?: { status?: NewsletterSubscriptionStatus }
    ): Promise<NewsletterSubscription[]> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.get<NewsletterSubscriptionsListResponse>(
          `/newsletter-subscriptions/store/${storeId}`,
          {
            params: {
              status: params?.status,
            },
          }
        );
        const list = response.data.data ?? [];
        setSubscriptions(list);
        return list;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { error?: string; message?: string } }; message?: string })
            ?.response?.data?.error ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch newsletter subscriptions';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSubscriptions = useCallback(() => {
    setSubscriptions([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: NewsletterSubscriptionContextType = {
    subscriptions,
    loading,
    error,
    fetchSubscriptionsByStoreId,
    clearSubscriptions,
    clearError,
  };

  return (
    <NewsletterSubscriptionContext.Provider value={value}>
      {children}
    </NewsletterSubscriptionContext.Provider>
  );
};

export const useNewsletterSubscriptions = (): NewsletterSubscriptionContextType => {
  const context = useContext(NewsletterSubscriptionContext);
  if (!context) {
    throw new Error(
      'useNewsletterSubscriptions must be used within a NewsletterSubscriptionProvider'
    );
  }
  return context;
};

export default NewsletterSubscriptionContext;
