import React, { createContext, useContext, useState, ReactNode } from 'react';
import { axiosi } from '../config/axios.config';

// Tag interface
export interface Tag {
  _id: string;
  storeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Tags context interface
interface TagsContextType {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  
  // Functions
  fetchTags: (storeId: string) => Promise<void>;
  addTag: (storeId: string, name: string) => Promise<Tag>;
  deleteTag: (tagId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  clearTags: () => void;
}

// Create context
const TagsContext = createContext<TagsContextType | undefined>(undefined);

// Tags provider component
export const TagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags for a store
  const fetchTags = async (storeId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.get(`/api/tags/store/${storeId}`);
      setTags(response.data.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch tags';
      setError(errorMessage);
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new tag
  const addTag = async (storeId: string, name: string): Promise<Tag> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosi.post('/api/tags', {
        storeId,
        name: name.trim(),
      });

      const newTag = response.data.data;
      
      // Add the new tag to the existing tags array
      setTags(prevTags => [newTag, ...prevTags]);
      
      return newTag;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create tag';
      setError(errorMessage);
      console.error('Error creating tag:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a tag
  const deleteTag = async (tagId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await axiosi.delete(`/api/tags/${tagId}`);

      // Remove the tag from the existing tags array
      setTags(prevTags => prevTags.filter(tag => tag._id !== tagId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete tag';
      setError(errorMessage);
      console.error('Error deleting tag:', err);
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

  const value: TagsContextType = {
    tags,
    loading,
    error,
    fetchTags,
    addTag,
    deleteTag,
    clearError,
    clearTags,
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
};

// Custom hook to use tags context
export const useTags = (): TagsContextType => {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};

export default TagsContext;
