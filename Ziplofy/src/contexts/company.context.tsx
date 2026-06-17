import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export const COMPANY_PAYMENT_TERMS = [
  'none',
  'due_on_fulfillment',
  'net-7',
  'net-15',
  'net-30',
  'net-45',
  'net-60',
  'net-90',
] as const;
export type CompanyPaymentTerms = (typeof COMPANY_PAYMENT_TERMS)[number];

export const COMPANY_TAX_SETTINGS = ['collect', 'collect_unless_exempt', 'dont_collect'] as const;
export type CompanyTaxSettings = (typeof COMPANY_TAX_SETTINGS)[number];

export const COMPANY_ORDER_SUBMISSION = ['auto', 'draft'] as const;
export type CompanyOrderSubmission = (typeof COMPANY_ORDER_SUBMISSION)[number];

export interface CompanyAddress {
  country: string;
  firstName: string;
  lastName: string;
  companyAttention?: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  pinCode?: string;
  phone?: string;
}

export interface CompanyMainContactCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface CompanyMainContact {
  customerId?: string | CompanyMainContactCustomer;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CompanyLocation {
  externalId?: string;
  shippingAddress?: CompanyAddress;
  billingSameAsShipping: boolean;
  /** Present only when billingSameAsShipping is false. */
  billingAddress?: CompanyAddress;
  paymentTerms: CompanyPaymentTerms;
  allowOneTimeShipAddress: boolean;
  orderSubmission: CompanyOrderSubmission;
  taxId?: string;
  taxSettings: CompanyTaxSettings;
}

export interface Company {
  _id: string;
  storeId: string;
  name: string;
  externalId?: string;
  mainContact?: CompanyMainContact;
  location?: CompanyLocation;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyMainContactPayload {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  newContact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    agreedToMarketingEmails?: boolean;
    agreedToSmsMarketing?: boolean;
  };
}

export interface CreateCompanyLocationPayload {
  externalId?: string;
  shippingAddress?: Partial<CompanyAddress> | null;
  billingSameAsShipping?: boolean;
  billingAddress?: Partial<CompanyAddress> | null;
  paymentTerms?: CompanyPaymentTerms;
  allowOneTimeShipAddress?: boolean;
  orderSubmission?: CompanyOrderSubmission;
  taxId?: string;
  taxSettings?: CompanyTaxSettings;
}

export interface CreateCompanyPayload {
  storeId: string;
  name: string;
  externalId?: string;
  mainContact?: CreateCompanyMainContactPayload;
  location?: CreateCompanyLocationPayload;
  notes?: string;
}

export interface UpdateCompanyPayload {
  storeId?: string;
  name?: string;
  externalId?: string;
  mainContact?: CreateCompanyMainContactPayload;
  location?: CreateCompanyLocationPayload;
  notes?: string;
}

interface CompaniesListResponse {
  success: boolean;
  data: Company[];
  count: number;
}

interface CompanyDetailResponse {
  success: boolean;
  data: Company;
}

interface CompanyMutationResponse {
  success: boolean;
  data: Company;
  message: string;
}

interface DeleteCompanyResponse {
  success: boolean;
  data: { deletedId: string };
  message: string;
}

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  loading: boolean;
  error: string | null;
  fetchCompaniesByStoreId: (storeId: string) => Promise<Company[]>;
  fetchCompanyById: (companyId: string, storeId?: string) => Promise<Company>;
  createCompany: (payload: CreateCompanyPayload) => Promise<Company>;
  updateCompany: (companyId: string, payload: UpdateCompanyPayload) => Promise<Company>;
  deleteCompany: (companyId: string, storeId?: string) => Promise<string>;
  clearCompanies: () => void;
  clearActiveCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

/** Billing address for display/API consumers — derived from shipping when same-as-shipping. */
export function resolveCompanyBillingAddress(
  location: CompanyLocation | undefined
): CompanyAddress | undefined {
  if (!location) return undefined;
  if (location.billingSameAsShipping) {
    return location.shippingAddress;
  }
  return location.billingAddress;
}

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompaniesByStoreId = useCallback(async (storeId: string): Promise<Company[]> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<CompaniesListResponse>(`/companies/store/${storeId}`);
      const list = res.data?.data ?? [];
      setCompanies(list);
      return list;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch companies';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyById = useCallback(async (companyId: string, storeId?: string): Promise<Company> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<CompanyDetailResponse>(`/companies/${companyId}`, {
        params: storeId ? { storeId } : undefined,
      });
      const company = res.data.data;
      setActiveCompany(company);
      return company;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch company';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (payload: CreateCompanyPayload): Promise<Company> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.post<CompanyMutationResponse>('/companies', payload);
      const company = res.data.data;
      setCompanies((prev) => [company, ...prev]);
      setActiveCompany(company);
      return company;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create company';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(
    async (companyId: string, payload: UpdateCompanyPayload): Promise<Company> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.patch<CompanyMutationResponse>(`/companies/${companyId}`, payload);
        const company = res.data.data;
        setCompanies((prev) => prev.map((row) => (row._id === companyId ? company : row)));
        if (activeCompany?._id === companyId) {
          setActiveCompany(company);
        }
        return company;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update company';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeCompany?._id]
  );

  const deleteCompany = useCallback(
    async (companyId: string, storeId?: string): Promise<string> => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosi.delete<DeleteCompanyResponse>(`/companies/${companyId}`, {
          params: storeId ? { storeId } : undefined,
        });
        setCompanies((prev) => prev.filter((row) => row._id !== companyId));
        if (activeCompany?._id === companyId) {
          setActiveCompany(null);
        }
        return res.data.data.deletedId;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to delete company';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeCompany?._id]
  );

  const clearCompanies = useCallback(() => {
    setCompanies([]);
    setError(null);
    setLoading(false);
  }, []);

  const clearActiveCompany = useCallback(() => {
    setActiveCompany(null);
  }, []);

  const value: CompanyContextType = {
    companies,
    activeCompany,
    loading,
    error,
    fetchCompaniesByStoreId,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    clearCompanies,
    clearActiveCompany,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompanies = (): CompanyContextType => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompanies must be used within a CompanyProvider');
  return ctx;
};

export const CompaniesContext = CompanyContext;
