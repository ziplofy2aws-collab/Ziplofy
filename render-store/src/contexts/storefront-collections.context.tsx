import React, { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';
import type { StorefrontProductItem, OrderDiscount } from './product.context';

export interface StorefrontCollection {
	_id: string;
	storeId: string;
	title: string;
	description: string;
	pageTitle: string;
	metaDescription: string;
	urlHandle: string;
	imageUrl?: string;
	imageAltText?: string;
	productSort?: string;
	status?: string;
	productCount?: number;
	onlineStorePublishing?: boolean;
	pointOfSalePublishing?: boolean;
	createdAt: string;
	updatedAt: string;
}

interface FetchCollectionsApiResponse {
	success: boolean;
	data: StorefrontCollection[];
	count: number;
}

interface FetchCollectionDetailsApiResponse {
	success: boolean;
	data: StorefrontCollection;
}

interface FetchProductsInCollectionPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

interface FetchProductsInCollectionApiResponse {
	success: boolean;
	data: StorefrontProductItem[];
	pagination: FetchProductsInCollectionPagination;
	orderDiscount?: OrderDiscount | null;
}

interface StorefrontCollectionsContextType {
	collections: StorefrontCollection[];
	/** Collection resolved from the current `/collections/:urlHandle` route, if any. */
	activeCollection: StorefrontCollection | null;
	products: StorefrontProductItem[];
	orderDiscount: OrderDiscount | null;
	loading: boolean;
	error: string | null;
	fetchCollectionsByStoreId: (storeId: string) => Promise<StorefrontCollection[]>;
	getCollectionDetailsByUrlHandle: (
		storeId: string,
		urlHandle: string
	) => Promise<StorefrontCollection>;
	fetchProductsInCollectionByUrlHandle: (
		storeId: string,
		urlHandle: string,
		params?: { page?: number; limit?: number; q?: string }
	) => Promise<void>;
	/** @deprecated Use fetchProductsInCollectionByUrlHandle */
	fetchProductsInCollection: (
		collectionId: string,
		params?: { page?: number; limit?: number; q?: string }
	) => Promise<void>;
	clear: () => void;
	clearActiveCollection: () => void;
}

const StorefrontCollectionsContext = createContext<StorefrontCollectionsContextType | undefined>(undefined);

function encodeUrlHandle(urlHandle: string): string {
	return encodeURIComponent(urlHandle.trim().toLowerCase());
}

export const StorefrontCollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [collections, setCollections] = useState<StorefrontCollection[]>([]);
	const [activeCollection, setActiveCollection] = useState<StorefrontCollection | null>(null);
	const [products, setProducts] = useState<StorefrontProductItem[]>([]);
	const [orderDiscount, setOrderDiscount] = useState<OrderDiscount | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchCollectionsByStoreId = useCallback(async (storeId: string): Promise<StorefrontCollection[]> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.get<FetchCollectionsApiResponse>(`/storefront/collections/store/${storeId}`);
			const list = res.data?.data ?? [];
			setCollections(list);
			return list;
		} catch (err: any) {
			const msg = err?.response?.data?.message || err?.message || 'Failed to fetch collections';
			setError(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const getCollectionDetailsByUrlHandle = useCallback(
		async (storeId: string, urlHandle: string): Promise<StorefrontCollection> => {
			try {
				setLoading(true);
				setError(null);
				const res = await axiosi.get<FetchCollectionDetailsApiResponse>(
					`/storefront/collections/store/${storeId}/url-handle/${encodeUrlHandle(urlHandle)}`
				);
				const collection = res.data?.data;
				if (!collection) {
					throw new Error('Collection not found');
				}
				setActiveCollection(collection);
				return collection;
			} catch (err: any) {
				const msg =
					err?.response?.data?.message || err?.message || 'Failed to fetch collection details';
				setError(msg);
				setActiveCollection(null);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const fetchProductsInCollectionByUrlHandle = useCallback(
		async (
			storeId: string,
			urlHandle: string,
			params?: { page?: number; limit?: number; q?: string }
		): Promise<void> => {
			try {
				setLoading(true);
				setError(null);
				const res = await axiosi.get<FetchProductsInCollectionApiResponse>(
					`/storefront/collections/store/${storeId}/url-handle/${encodeUrlHandle(urlHandle)}/products`,
					{
						params: {
							page: params?.page,
							limit: params?.limit,
							q: params?.q,
						},
					}
				);
				setProducts(res.data?.data ?? []);
				setOrderDiscount(res.data?.orderDiscount || null);
			} catch (err: any) {
				const msg =
					err?.response?.data?.message || err?.message || 'Failed to fetch products in collection';
				setError(msg);
				setProducts([]);
				setOrderDiscount(null);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const fetchProductsInCollection = useCallback(async (
		collectionId: string,
		params?: { page?: number; limit?: number; q?: string }
	): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.get<FetchProductsInCollectionApiResponse>(`/storefront/collections/${collectionId}/products`, {
				params: {
					page: params?.page,
					limit: params?.limit,
					q: params?.q,
				},
			});
			setProducts(res.data?.data ?? []);
			setOrderDiscount(res.data?.orderDiscount || null);
		} catch (err: any) {
			const msg = err?.response?.data?.message || err?.message || 'Failed to fetch products in collection';
			setError(msg);
			setProducts([]);
			setOrderDiscount(null);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const clearActiveCollection = useCallback(() => {
		setActiveCollection(null);
	}, []);

	const clear = useCallback(() => {
		setCollections([]);
		setActiveCollection(null);
		setProducts([]);
		setOrderDiscount(null);
		setError(null);
	}, []);

	const value: StorefrontCollectionsContextType = {
		collections,
		activeCollection,
		products,
		orderDiscount,
		loading,
		error,
		fetchCollectionsByStoreId,
		getCollectionDetailsByUrlHandle,
		fetchProductsInCollectionByUrlHandle,
		fetchProductsInCollection,
		clear,
		clearActiveCollection,
	};

	return (
		<StorefrontCollectionsContext.Provider value={value}>
			{children}
		</StorefrontCollectionsContext.Provider>
	);
};

export const useStorefrontCollections = (): StorefrontCollectionsContextType => {
	const ctx = useContext(StorefrontCollectionsContext);
	if (!ctx) throw new Error('useStorefrontCollections must be used within a StorefrontCollectionsProvider');
	return ctx;
};
