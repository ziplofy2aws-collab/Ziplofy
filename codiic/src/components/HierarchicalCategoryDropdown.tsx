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
  selectedCategoryName?: string;
  onCategorySelect: (categoryId: string, categoryName: string) => void;
  storeId: string;
  /** Render the picker in-flow (own layout container) instead of an absolute overlay. */
  inline?: boolean;
  /** Start with the picker open. Defaults to true when `inline` is set. */
  defaultOpen?: boolean;
}

const HierarchicalCategoryDropdown: React.FC<HierarchicalCategoryDropdownProps> = ({
  selectedCategory,
  selectedCategoryName: selectedCategoryNameProp,
  onCategorySelect,
  storeId: _storeId,
  inline = false,
  defaultOpen,
}) => {
  const { categories, loading, fetchBaseCategories, fetchCategoriesByParentId } = useCategories();
  const startOpen = defaultOpen ?? inline;
  const [isOpen, setIsOpen] = useState(startOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const [navigationStack, setNavigationStack] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(
    selectedCategoryNameProp ?? ''
  );

  useEffect(() => {
    void fetchBaseCategories();
  }, [fetchBaseCategories]);

  useEffect(() => {
    if (selectedCategoryNameProp) {
      setSelectedCategoryName(selectedCategoryNameProp);
      return;
    }
    if (!selectedCategory) {
      setSelectedCategoryName('');
    }
  }, [selectedCategory, selectedCategoryNameProp]);

  useEffect(() => {
    if (!isOpen || inline) return;
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
  }, [isOpen, inline]);

  const openPicker = useCallback(() => {
    setNavigationStack([]);
    void fetchBaseCategories();
    setIsOpen(true);
  }, [fetchBaseCategories]);

  const handleCategorySelect = useCallback(
    (category: { _id: string; name: string; hasChildren?: boolean }) => {
      if (category.hasChildren) {
        setNavigationStack((prev) => [...prev, { id: category._id, name: category.name }]);
        void fetchCategoriesByParentId(category._id);
        return;
      }
      onCategorySelect(category._id, category.name);
      setSelectedCategoryName(category.name);
      if (!inline) {
        setIsOpen(false);
        setNavigationStack([]);
        void fetchBaseCategories();
      }
    },
    [onCategorySelect, fetchCategoriesByParentId, fetchBaseCategories, inline]
  );

  const handleBack = useCallback(() => {
    if (navigationStack.length === 0) return;
    const newStack = navigationStack.slice(0, -1);
    setNavigationStack(newStack);
    if (newStack.length === 0) {
      void fetchBaseCategories();
    } else {
      void fetchCategoriesByParentId(newStack[newStack.length - 1].id);
    }
  }, [navigationStack, fetchBaseCategories, fetchCategoriesByParentId]);

  const handleHome = useCallback(() => {
    setNavigationStack([]);
    void fetchBaseCategories();
  }, [fetchBaseCategories]);

  const breadcrumbPath = navigationStack.map((item) => item.name).join(' > ');

  const pickerBody = (
    <>
      {navigationStack.length > 0 && (
        <div className="border-b border-gray-200 p-3">
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

      <div className={inline ? 'max-h-80 overflow-y-auto' : 'max-h-72 overflow-y-auto'}>
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
    </>
  );

  if (inline) {
    return (
      <div className="space-y-2" ref={containerRef}>
        <div className="rounded-md border border-gray-200/70 bg-gray-50/80 px-3 py-2 text-sm">
          <span className="text-gray-500">Selected: </span>
          <span className={selectedCategoryName ? 'font-medium text-gray-900' : 'text-gray-400'}>
            {selectedCategoryName || 'None'}
          </span>
        </div>
        <div className="overflow-hidden rounded-md border border-gray-200/70 bg-white">{pickerBody}</div>
      </div>
    );
  }

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

      {isOpen ? (
        <div className="absolute z-50 mt-1 max-h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {pickerBody}
        </div>
      ) : null}
    </div>
  );
};

export default HierarchicalCategoryDropdown;
