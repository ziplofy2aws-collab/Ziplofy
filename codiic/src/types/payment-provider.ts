export type PaymentProviderCategory = 'cards' | 'wallet' | 'bnpl' | 'bank' | 'test';

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface UpiDetails {
  upiId: string;
}

export interface ConnectProviderPayload {
  bankDetails?: BankTransferDetails;
  upiDetails?: UpiDetails;
}

export interface PaymentProvider {
  _id: string;
  key: string;
  name: string;
  description?: string;
  category: PaymentProviderCategory;
  supports3ds: boolean;
  paymentMethods: string[];
  isTest: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type StorePaymentProviderStatus = 'active' | 'inactive' | 'pending';

export interface StorePaymentProvider {
  _id: string;
  storeId: string;
  providerKey: string;
  status: StorePaymentProviderStatus;
  activatedAt?: string | null;
  bankDetails?: BankTransferDetails | null;
  upiDetails?: UpiDetails | null;
  provider?: PaymentProvider | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentProvidersResponse {
  success: boolean;
  data: PaymentProvider[];
  count: number;
}

export interface StorePaymentProvidersResponse {
  success: boolean;
  data: StorePaymentProvider[];
  count: number;
}
