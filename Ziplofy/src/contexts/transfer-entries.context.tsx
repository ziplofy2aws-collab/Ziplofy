import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

export interface TransferEntryVariant {
	_id: string;
	productId: string;
	sku: string;
	price: number;
	images: string[];
	optionValues: Record<string, string>;
	productName?: string; // attached on server for convenience
}

export interface TransferEntryDoc {
	_id: string;
	transferId: string;
	variantId: TransferEntryVariant;
	atOrigin: number;
	quantity: number;
	createdAt: string;
	updatedAt: string;
}

interface GetEntriesResponse {
	success: boolean;
	data: TransferEntryDoc[];
}

interface TransferEntriesContextType {
	entries: TransferEntryDoc[];
	loading: boolean;
	error: string | null;
	fetchByTransferId: (transferId: string) => Promise<TransferEntryDoc[]>;
	clear: () => void;
	clearError: () => void;
}

const TransferEntriesContext = createContext<TransferEntriesContextType | undefined>(undefined);

export const TransferEntriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [entries, setEntries] = useState<TransferEntryDoc[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clear = useCallback(() => setEntries([]), []);
	const clearError = useCallback(() => setError(null), []);

	const fetchByTransferId = useCallback(async (transferId: string) => {
		try {
			setLoading(true);
			setError(null);
			const res = await axiosi.get<GetEntriesResponse>(`/transfer-entries/transfer/${transferId}`);
			if (!res.data.success) throw new Error('Failed to fetch transfer entries');
			const list = res.data.data || [];
			setEntries(list);
			return list;
		} catch (err: any) {
			const msg = err?.response?.data?.message || err?.message || 'Failed to fetch transfer entries';
			setError(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	const value: TransferEntriesContextType = {
		entries,
		loading,
		error,
		fetchByTransferId,
		clear,
		clearError,
	};

	return (
		<TransferEntriesContext.Provider value={value}>{children}</TransferEntriesContext.Provider>
	);
};

export const useTransferEntries = (): TransferEntriesContextType => {
	const ctx = useContext(TransferEntriesContext);
	if (!ctx) throw new Error('useTransferEntries must be used within a TransferEntriesProvider');
	return ctx;
};
