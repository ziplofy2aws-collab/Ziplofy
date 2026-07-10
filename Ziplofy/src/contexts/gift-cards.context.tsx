import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Gift Card interface (matches API response structure)
export interface GiftCard {
  _id: string;
  storeId: string;
  code: string;
  initialValue: number;
  expirationDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create gift card request interface
export interface CreateGiftCardRequest {
  storeId: string;
  code: string;
  initialValue: number;
  expirationDate?: string;
  notes?: string;
  isActive?: boolean;
}

// Update gift card request interface
export interface UpdateGiftCardRequest {
  code?: string;
  initialValue?: number;
  expirationDate?: string;
  notes?: string;
  isActive?: boolean;
}

// API Response interfaces
interface CreateGiftCardResponse {
  success: boolean;
  data: GiftCard;
  message: string;
}

interface GetGiftCardsByStoreResponse {
  success: boolean;
  data: GiftCard[];
  count: number;
}

interface UpdateGiftCardResponse {
  success: boolean;
  data: GiftCard;
  message: string;
}

interface DeleteGiftCardResponse {
  success: boolean;
  data: {
    deletedGiftCard: {
      id: string;
      code: string;
      initialValue: number;
      isActive: boolean;
    };
  };
  message: string;
}

// Gift Cards context interface
interface GiftCardsContextType {
  giftCards: GiftCard[];
  loading: boolean;
  error: string | null;
  
  // Functions
  fetchGiftCardsByStoreId: (storeId: string) => Promise<void>;
  createGiftCard: (payload: CreateGiftCardRequest) => Promise<GiftCard>;
  updateGiftCard: (giftCardId: string, payload: UpdateGiftCardRequest) => Promise<GiftCard>;
  deleteGiftCard: (giftCardId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  clearGiftCards: () => void;
}

// Create context
const GiftCardsContext = createContext<GiftCardsContextType | undefined>(undefined);

// Gift Cards provider component
export const GiftCardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch gift cards by store ID
  const fetchGiftCardsByStoreId = useCallback(async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get<GetGiftCardsByStoreResponse>(`/gift-cards/store/${storeId}`);
      const { success, data } = response.data;
      
      if (success) {
        setGiftCards(data);
      } else {
        setError('Failed to fetch gift cards');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch gift cards';
      setError(errorMessage);
      console.error('Error fetching gift cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new gift card
  const createGiftCard = useCallback(async (payload: CreateGiftCardRequest): Promise<GiftCard> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post<CreateGiftCardResponse>('/gift-cards', payload);
      const { success, data } = response.data;
      
      if (success) {
        // Add the new gift card to the existing array (prepend for recency)
        setGiftCards(prevGiftCards => [data, ...prevGiftCards]);
        return data;
      } else {
        throw new Error('Failed to create gift card');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create gift card';
      setError(errorMessage);
      console.error('Error creating gift card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing gift card
  const updateGiftCard = useCallback(async (giftCardId: string, payload: UpdateGiftCardRequest): Promise<GiftCard> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.put<UpdateGiftCardResponse>(`/gift-cards/${giftCardId}`, payload);
      const { success, data } = response.data;
      
      if (success) {
        // Update the gift card in the existing array
        setGiftCards(prevGiftCards => 
          prevGiftCards.map(giftCard => 
            giftCard._id === giftCardId ? data : giftCard
          )
        );
        return data;
      } else {
        throw new Error('Failed to update gift card');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update gift card';
      setError(errorMessage);
      console.error('Error updating gift card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete (soft delete) a gift card
  const deleteGiftCard = useCallback(async (giftCardId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.delete<DeleteGiftCardResponse>(`/gift-cards/${giftCardId}`);
      const { success } = response.data;
      
      if (success) {
        // Remove the gift card from the existing array
        setGiftCards(prevGiftCards => 
          prevGiftCards.filter(giftCard => giftCard._id !== giftCardId)
        );
      } else {
        throw new Error('Failed to delete gift card');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete gift card';
      setError(errorMessage);
      console.error('Error deleting gift card:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear gift cards
  const clearGiftCards = useCallback(() => {
    setGiftCards([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: GiftCardsContextType = {
    giftCards,
    loading,
    error,
    fetchGiftCardsByStoreId,
    createGiftCard,
    updateGiftCard,
    deleteGiftCard,
    clearError,
    clearGiftCards,
  };

  return (
    <GiftCardsContext.Provider value={value}>
      {children}
    </GiftCardsContext.Provider>
  );
};

// Custom hook to use gift cards context
export const useGiftCards = (): GiftCardsContextType => {
  const context = useContext(GiftCardsContext);
  if (context === undefined) {
    throw new Error('useGiftCards must be used within a GiftCardsProvider');
  }
  return context;
};

export default GiftCardsContext;
