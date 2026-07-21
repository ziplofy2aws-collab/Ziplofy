import {
  ArrowLeftIcon,
  ChevronUpDownIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCategories } from '../contexts/category.context';
import CategoryList from './CategoryList';

interface HierarchicalCategoryDropdownProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  storeId: string;
}

const HierarchicalCategoryDropdown: React.FC<HierarchicalCategoryDropdownProps> = ({
  selectedCategory,
  onCategorySelect,
  storeId
}) => {
  const { categories, loading, fetchBaseCategories, fetchCategoriesByParentId } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [navigationStack, setNavigationStack] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Initialize with base categories (for first open / after mount)
  useEffect(() => {
    fetchBaseCategories();
  }, [fetchBaseCategories]);

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedCategoryName('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const openPicker = useCallback(() => {
    setNavigationStack([]);
    void fetchBaseCategories();
    setIsOpen(true);
  }, [fetchBaseCategories]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: any) => {
    if (category.hasChildren) {
      // Navigate to children
      setNavigationStack(prev => [...prev, { id: category._id, name: category.name }]);
      fetchCategoriesByParentId(category._id);
    } else {
      // Select this category
      onCategorySelect(category._id, category.name);
      setSelectedCategoryName(category.name);
      setIsOpen(false);
      setNavigationStack([]);
      void fetchBaseCategories();
    }
  }, [onCategorySelect, fetchCategoriesByParentId, fetchBaseCategories]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      newStack.pop();
      setNavigationStack(newStack);
      
      if (newStack.length === 0) {
        fetchBaseCategories();
      } else {
        const parent = newStack[newStack.length - 1];
        fetchCategoriesByParentId(parent.id);
      }
    }
  }, [navigationStack, fetchBaseCategories, fetchCategoriesByParentId]);

  // Handle home navigation
  const handleHome = useCallback(() => {
    setNavigationStack([]);
    fetchBaseCategories();
  }, [fetchBaseCategories]);

  const breadcrumbPath = navigationStack.map((item) => item.name).join(" > ");

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className="flex w-full items-center justify-between gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-left text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedCategoryName ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategoryName || 'Choose a product category'}
        </span>
        <ChevronUpDownIcon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {navigationStack.length > 0 && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-gray-700">
                  {breadcrumbPath || 'Categories'}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={handleBack}
                    title="Go back"
                    className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleHome}
                    title="Top level"
                    className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <HomeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
              </div>
            ) : categories.length > 0 ? (
              <CategoryList categories={categories} onCategorySelect={handleCategorySelect} />
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No categories found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategoryDropdown;
