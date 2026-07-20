import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { axiosi } from '../config/axios.config';

export type FS_Method = 'discount-code' | 'automatic';
export type FS_Eligibility = 'all-customers' | 'specific-customer-segments' | 'specific-customers';
export type FS_MinimumPurchase = 'no-requirements' | 'minimum-amount' | 'minimum-quantity';
export type FS_CountrySelection = 'all-countries' | 'selected-countries';

interface CustomerSegmentLite { _id: string; name: string; }
interface CustomerLite { _id: string; firstName?: string; lastName?: string; email?: string; }

export interface FreeShippingDiscount {
	_id: string;
	storeId: string;

	// Method
	method: FS_Method;
	discountCode?: string;
	title?: string;

	// Country
	countrySelection: FS_CountrySelection;
	selectedCountryIds?: string[];
	selectedCountries?: { _id: string; name?: string; iso2?: string }[];
	excludeShippingRates?: boolean;
	shippingRateLimit?: number;

	// Eligibility
	eligibility: FS_Eligibility;
	applyOnPOSPro?: boolean;

	// Minimum purchase
	minimumPurchase: FS_MinimumPurchase;
	minimumAmount?: number;
	minimumQuantity?: number;

	// Sales channel & limits (discount code only)
	allowDiscountOnChannels?: boolean;
	limitTotalUses?: boolean;
	totalUsesLimit?: number;
	limitOneUsePerCustomer?: boolean;

	// Combinations
	productDiscounts?: boolean;
	orderDiscounts?: boolean;

	// Active dates
	startDate?: string;
	startTime?: string;
	setEndDate?: boolean;
	endDate?: string;
	endTime?: string;

	status?: 'active' | 'draft';
	createdAt?: string;
	updatedAt?: string;

	// Populated eligibility targets (or ids)
	targetCustomerSegmentIds?: (string | CustomerSegmentLite)[];
	targetCustomerIds?: (string | CustomerLite)[];
}

export interface CreateFreeShippingRequest {
	storeId: string;

	method: FS_Method;
	discountCode?: string;
	title?: string;

	countrySelection: FS_CountrySelection;
	selectedCountryIds?: string[];
	excludeShippingRates?: boolean;
	shippingRateLimit?: number;

	eligibility: FS_Eligibility;
	applyOnPOSPro?: boolean;

	minimumPurchase: FS_MinimumPurchase;
	minimumAmount?: number;
	minimumQuantity?: number;

	allowDiscountOnChannels?: boolean;
	limitTotalUses?: boolean;
	totalUsesLimit?: number;
	limitOneUsePerCustomer?: boolean;

	productDiscounts?: boolean;
	orderDiscounts?: boolean;

	startDate?: string;
	startTime?: string;
	setEndDate?: boolean;
	endDate?: string;
	endTime?: string;

	status?: 'active' | 'draft';

	// Eligibility targets
	targetCustomerSegmentIds?: string[];
	targetCustomerIds?: string[];
}

export interface CreateFreeShippingResponse {
	success: boolean;
	message: string;
	data: FreeShippingDiscount;
}

export interface FetchFreeShippingResponse {
	success: boolean;
	data: FreeShippingDiscount[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export interface GetFreeShippingByIdResponse {
	success: boolean;
	data: FreeShippingDiscount;
}

export interface UpdateFreeShippingResponse {
	success: boolean;
	message?: string;
	data: FreeShippingDiscount;
}

export interface FreeShippingDiscountUsageOrder {
	usage: { usedAt: string };
	customer: {
		_id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		phoneNumber?: string;
	} | null;
	order: {
		_id: string;
		orderDate: string;
		status: string;
		subtotal: number;
		shippingCost: number;
		total: number;
		shippingAddress?: unknown;
	} | null;
}

export interface GetOrdersByDiscountResponse {
	success: boolean;
	data: FreeShippingDiscountUsageOrder[];
	discount: { _id: string; title?: string; discountCode?: string; method: string };
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

interface FreeShippingContextType {
	discounts: FreeShippingDiscount[];
	loading: boolean;
	error: string | null;
	pagination: FetchFreeShippingResponse['pagination'] | null;

	createDiscount: (payload: CreateFreeShippingRequest) => Promise<CreateFreeShippingResponse>;
	updateDiscount: (discountId: string, payload: CreateFreeShippingRequest) => Promise<UpdateFreeShippingResponse>;
	deleteDiscount: (discountId: string) => Promise<{ success: boolean; message?: string }>;
	fetchDiscountById: (discountId: string) => Promise<GetFreeShippingByIdResponse>;
	fetchDiscountsByStoreId: (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: FS_Method; }) => Promise<FetchFreeShippingResponse>;
	fetchOrdersByDiscountId: (discountId: string, opts?: { page?: number; limit?: number }) => Promise<GetOrdersByDiscountResponse>;
	clearError: () => void;
	setDiscounts: (items: FreeShippingDiscount[]) => void;
}

const FreeShippingContext = createContext<FreeShippingContextType | undefined>(undefined);

export const FreeShippingDiscountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [discounts, setDiscounts] = useState<FreeShippingDiscount[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<FetchFreeShippingResponse['pagination'] | null>(null);

	const clearError = useCallback(() => setError(null), []);

	const createDiscount = useCallback(async (payload: CreateFreeShippingRequest): Promise<CreateFreeShippingResponse> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.post<CreateFreeShippingResponse>('/free-shipping-discounts', payload);
			if (res.data?.success && res.data?.data) {
				// Refetch to get full data (targetCustomerSegmentIds, targetCustomerIds, selectedCountryIds, selectedCountries)
				const fullRes = await axiosi.get<GetFreeShippingByIdResponse>(`/free-shipping-discounts/${res.data.data._id}`);
				if (fullRes.data?.success && fullRes.data?.data) {
					setDiscounts(prev => [fullRes.data!.data, ...prev]);
					return { ...res.data, data: fullRes.data.data };
				}
				setDiscounts(prev => [res.data!.data, ...prev]);
			}
			return res.data;
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to create Free Shipping discount';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchDiscountById = useCallback(async (discountId: string): Promise<GetFreeShippingByIdResponse> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.get<GetFreeShippingByIdResponse>(`/free-shipping-discounts/${discountId}`);
			return res.data;
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to fetch Free Shipping discount';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const updateDiscount = useCallback(async (discountId: string, payload: CreateFreeShippingRequest): Promise<UpdateFreeShippingResponse> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.put<UpdateFreeShippingResponse>(`/free-shipping-discounts/${discountId}`, payload);
			if (res.data?.success && res.data?.data) {
				if (payload.storeId) {
					try {
						const listRes = await axiosi.get<FetchFreeShippingResponse>(`/free-shipping-discounts/store/${payload.storeId}`);
						if (listRes.data?.success && listRes.data?.data) setDiscounts(listRes.data.data);
					} catch (_) {}
				} else {
					// Refetch to get full data (targetCustomerSegmentIds, targetCustomerIds, etc.)
					const fullRes = await axiosi.get<GetFreeShippingByIdResponse>(`/free-shipping-discounts/${discountId}`);
					if (fullRes.data?.success && fullRes.data?.data) {
						setDiscounts(prev => {
							const next = prev.map(d => d._id === discountId ? fullRes.data!.data : d);
							if (!next.some(d => d._id === discountId)) return [fullRes.data!.data, ...next];
							return next;
						});
						return { ...res.data, data: fullRes.data.data };
					}
				}
				setDiscounts(prev => {
					const next = prev.map(d => d._id === discountId ? res.data!.data : d);
					if (!next.some(d => d._id === discountId)) return [res.data!.data, ...next];
					return next;
				});
			}
			return res.data;
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to update Free Shipping discount';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteDiscount = useCallback(async (discountId: string): Promise<{ success: boolean; message?: string }> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.delete<{ success: boolean; message?: string }>(`/free-shipping-discounts/${discountId}`);
			if (res.data?.success) {
				setDiscounts(prev => prev.filter(d => d._id !== discountId));
			}
			return res.data ?? { success: false };
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to delete Free Shipping discount';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchDiscountsByStoreId = useCallback(async (storeId: string, opts?: { page?: number; limit?: number; status?: 'active' | 'draft'; method?: FS_Method; }): Promise<FetchFreeShippingResponse> => {
		try {
			setLoading(true);
			setError(null);
			const q = new URLSearchParams();
			if (opts?.page) q.append('page', String(opts.page));
			if (opts?.limit) q.append('limit', String(opts.limit));
			if (opts?.status) q.append('status', opts.status);
			if (opts?.method) q.append('method', opts.method);
			const res = await axiosi.get<FetchFreeShippingResponse>(`/free-shipping-discounts/store/${storeId}${q.toString() ? `?${q.toString()}` : ''}`);
			if (res.data?.success) {
				setDiscounts(res.data.data || []);
				setPagination(res.data.pagination || null);
			}
			return res.data;
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to fetch Free Shipping discounts';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchOrdersByDiscountId = useCallback(async (discountId: string, opts?: { page?: number; limit?: number }): Promise<GetOrdersByDiscountResponse> => {
		try {
			setLoading(true);
			setError(null);
			const q = new URLSearchParams();
			if (opts?.page) q.append('page', String(opts.page));
			if (opts?.limit) q.append('limit', String(opts.limit));
			const res = await axiosi.get<GetOrdersByDiscountResponse>(`/free-shipping-discounts/${discountId}/orders${q.toString() ? `?${q.toString()}` : ''}`);
			return res.data;
		} catch (e: any) {
			const msg = e?.response?.data?.error || e?.message || 'Failed to fetch orders for this discount';
			setError(msg);
			throw new Error(msg);
		} finally {
			setLoading(false);
		}
	}, []);

	const value = useMemo<FreeShippingContextType>(() => ({
		discounts,
		loading,
		error,
		pagination,
		createDiscount,
		updateDiscount,
		deleteDiscount,
		fetchDiscountById,
		fetchDiscountsByStoreId,
		fetchOrdersByDiscountId,
		clearError,
		setDiscounts,
	}), [discounts, loading, error, pagination, createDiscount, updateDiscount, deleteDiscount, fetchDiscountById, fetchDiscountsByStoreId, fetchOrdersByDiscountId, clearError]);

	return (
		<FreeShippingContext.Provider value={value}>{children}</FreeShippingContext.Provider>
	);
};

export const useFreeShippingDiscount = (): FreeShippingContextType => {
	const ctx = useContext(FreeShippingContext);
	if (!ctx) throw new Error('useFreeShippingDiscount must be used within a FreeShippingDiscountProvider');
	return ctx;
};

export default FreeShippingContext;
