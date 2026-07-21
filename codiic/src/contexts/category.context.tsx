import { createContext, useCallback, useContext, useState } from 'react';
import { axiosi } from '../config/axios.config';

// Category interface
export interface Category {
  _id: string;
  name: string;
  parent: string | null;
  hasChildren: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetCategoriesResponse {
  success: boolean;
  data: Category[];
  count: number;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchBaseCategories: () => Promise<void>;
  fetchCategoriesByParentId: (parentId: string) => Promise<void>;
  clearCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBaseCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetCategoriesResponse>('/categories/base');
      const { success, data } = res.data;
      if (success) {
        setCategories(data);
      } else {
        setError('Failed to fetch base categories');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch base categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriesByParentId = useCallback(async (parentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosi.get<GetCategoriesResponse>(`/categories/parent/${parentId}`);
      const { success, data } = res.data;
      if (success) {
        setCategories(data);
      } else {
        setError('Failed to fetch categories by parent');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch categories by parent');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCategories = useCallback(() => {
    setCategories([]);
    setError(null);
    setLoading(false);
  }, []);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    fetchBaseCategories,
    fetchCategoriesByParentId,
    clearCategories,
  };

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextType => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within a CategoryProvider');
  return ctx;
};

export default CategoryContext;


