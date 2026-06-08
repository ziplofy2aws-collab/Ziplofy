import React, { createContext, useContext, useState, ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Purchase Order Tag interface
export interface PurchaseOrderTag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase Order Tags context interface
interface PurchaseOrderTagsContextType {
  tags: PurchaseOrderTag[];
  loading: boolean;
  error: string | null;
  
  // Functions
  fetchTagsByStoreId: (storeId: string) => Promise<void>;
  createTag: (storeId: string, name: string) => Promise<PurchaseOrderTag>;
  deleteTag: (tagId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  clearTags: () => void;
}

// Create context
const PurchaseOrderTagsContext = createContext<PurchaseOrderTagsContextType | undefined>(undefined);

// Purchase Order Tags provider component
export const PurchaseOrderTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<PurchaseOrderTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags by store ID
  const fetchTagsByStoreId = async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get(`/purchase-order-tags/store/${storeId}`);
      setTags(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch purchase order tags';
      setError(errorMessage);
      console.error('Error fetching purchase order tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new purchase order tag
  const createTag = async (storeId: string, name: string): Promise<PurchaseOrderTag> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post('/purchase-order-tags', {
        storeId,
        name: name.trim(),
      });

      const newTag = response.data.data;
      
      // Add the new tag to the existing tags array
      setTags(prevTags => [newTag, ...prevTags]);
      
      return newTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create purchase order tag';
      setError(errorMessage);
      console.error('Error creating purchase order tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a purchase order tag
  const deleteTag = async (tagId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await axiosi.delete(`/purchase-order-tags/${tagId}`);

      // Remove the tag from the existing tags array
      setTags(prevTags => prevTags.filter(tag => tag._id !== tagId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete purchase order tag';
      setError(errorMessage);
      console.error('Error deleting purchase order tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear tags
  const clearTags = () => {
    setTags([]);
  };

  const value: PurchaseOrderTagsContextType = {
    tags,
    loading,
    error,
    fetchTagsByStoreId,
    createTag,
    deleteTag,
    clearError,
    clearTags,
  };

  return (
    <PurchaseOrderTagsContext.Provider value={value}>
      {children}
    </PurchaseOrderTagsContext.Provider>
  );
};

// Custom hook to use purchase order tags context
export const usePurchaseOrderTags = (): PurchaseOrderTagsContextType => {
  const context = useContext(PurchaseOrderTagsContext);
  if (context === undefined) {
    throw new Error('usePurchaseOrderTags must be used within a PurchaseOrderTagsProvider');
  }
  return context;
};

export default PurchaseOrderTagsContext;
