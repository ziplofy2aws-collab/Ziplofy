import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

export const CONTACT_FORM_SUBMISSION_STATUS = ['pending', 'read', 'spam'] as const;
export type ContactFormSubmissionStatus = (typeof CONTACT_FORM_SUBMISSION_STATUS)[number];

export interface ContactFormSubmission {
  _id: string;
  storeId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactFormSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

interface ContactFormSubmissionsListResponse {
  success: boolean;
  data: ContactFormSubmission[];
  count: number;
}

interface ContactFormSubmissionContextType {
  submissions: ContactFormSubmission[];
  loading: boolean;
  error: string | null;
  fetchSubmissionsByStoreId: (
    storeId: string,
    params?: { status?: ContactFormSubmissionStatus }
  ) => Promise<ContactFormSubmission[]>;
  clearSubmissions: () => void;
  clearError: () => void;
}

const ContactFormSubmissionContext = createContext<ContactFormSubmissionContextType | undefined>(
  undefined
);

export const ContactFormSubmissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissionsByStoreId = useCallback(
    async (
      storeId: string,
      params?: { status?: ContactFormSubmissionStatus }
    ): Promise<ContactFormSubmission[]> => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosi.get<ContactFormSubmissionsListResponse>(
          `/contact-form-submissions/store/${storeId}`,
          {
            params: {
              status: params?.status,
            },
          }
        );
        const list = response.data.data ?? [];
        setSubmissions(list);
        return list;
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { error?: string; message?: string } }; message?: string })
            ?.response?.data?.error ||
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to fetch contact form submissions';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSubmissions = useCallback(() => {
    setSubmissions([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ContactFormSubmissionContextType = {
    submissions,
    loading,
    error,
    fetchSubmissionsByStoreId,
    clearSubmissions,
    clearError,
  };

  return (
    <ContactFormSubmissionContext.Provider value={value}>
      {children}
    </ContactFormSubmissionContext.Provider>
  );
};

export const useContactFormSubmissions = (): ContactFormSubmissionContextType => {
  const context = useContext(ContactFormSubmissionContext);
  if (!context) {
    throw new Error(
      'useContactFormSubmissions must be used within a ContactFormSubmissionProvider'
    );
  }
  return context;
};

export default ContactFormSubmissionContext;
