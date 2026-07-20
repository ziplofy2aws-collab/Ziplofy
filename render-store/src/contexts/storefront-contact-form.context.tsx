import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { axiosi } from '../config/axios.config';
import { useStorefront } from './store.context';

export interface CreateContactFormSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactFormSubmissionResult {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface CreateContactFormSubmissionResponse {
  success: boolean;
  message: string;
  data: ContactFormSubmissionResult;
}

interface StorefrontContactFormContextType {
  submitting: boolean;
  error: string | null;
  submitContactForm: (
    payload: CreateContactFormSubmissionPayload
  ) => Promise<ContactFormSubmissionResult>;
  clearError: () => void;
}

const StorefrontContactFormContext = createContext<StorefrontContactFormContextType | undefined>(
  undefined
);

export const StorefrontContactFormProvider = ({ children }: { children: ReactNode }) => {
  const { storeFrontMeta } = useStorefront();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitContactForm = useCallback(
    async (payload: CreateContactFormSubmissionPayload): Promise<ContactFormSubmissionResult> => {
      const storeId = storeFrontMeta?.storeId;
      if (!storeId) {
        const msg = 'Store is not available';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }

      const name = payload.name.trim();
      const email = payload.email.trim();
      const phone = payload.phone?.trim();
      const message = payload.message.trim();

      if (!name) {
        const msg = 'Name is required';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }
      if (!email) {
        const msg = 'Email is required';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }
      if (!message) {
        const msg = 'Message is required';
        setError(msg);
        toast.error(msg);
        throw new Error(msg);
      }

      try {
        setSubmitting(true);
        setError(null);
        const res = await axiosi.post<CreateContactFormSubmissionResponse>(
          '/storefront/contact-form-submissions',
          {
            storeId,
            name,
            email,
            phone: phone || undefined,
            message,
          }
        );
        if (!res.data.success) throw new Error('Submit contact form failed');
        toast.success(res.data.message || 'Message sent successfully');
        return res.data.data;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string; message?: string } }; message?: string })
            ?.response?.data?.error ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to send message';
        setError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [storeFrontMeta?.storeId]
  );

  const value: StorefrontContactFormContextType = {
    submitting,
    error,
    submitContactForm,
    clearError,
  };

  return (
    <StorefrontContactFormContext.Provider value={value}>
      {children}
    </StorefrontContactFormContext.Provider>
  );
};

export const useStorefrontContactForm = (): StorefrontContactFormContextType => {
  const ctx = useContext(StorefrontContactFormContext);
  if (!ctx) {
    // Theme editor preview may not wrap the contact form provider.
    return {
      submitting: false,
      error: null,
      submitContactForm: async () => {
        throw new Error('Contact form is not available');
      },
      clearError: () => {},
    };
  }
  return ctx;
};

export default StorefrontContactFormContext;
