import { CheckIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import HierarchicalCategoryDropdown from './HierarchicalCategoryDropdown';
import { Product } from '../contexts/product.context';

interface ProductBasicInformationProps {
  product: Product;
  onSave: (payload: { category: string; sku: string; barcode: string }) => Promise<void>;
  isSaving: boolean;
}

const ProductBasicInformation: React.FC<ProductBasicInformationProps> = ({ product, onSave, isSaving }) => {
  const categoryName =
    (product.category && typeof product.category === 'object' && product.category.name) || '—';
  const [isEditing, setIsEditing] = useState(false);
  const [draftCategory, setDraftCategory] = useState(product.category?._id || '');
  const [draftSku, setDraftSku] = useState(product.sku || '');
  const [draftBarcode, setDraftBarcode] = useState(product.barcode || '');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setDraftCategory(product.category?._id || '');
      setDraftSku(product.sku || '');
      setDraftBarcode(product.barcode || '');
    }
  }, [isEditing, product.category?._id, product.sku, product.barcode]);

  const startEditing = () => {
    setEditError('');
    setDraftCategory(product.category?._id || '');
    setDraftSku(product.sku || '');
    setDraftBarcode(product.barcode || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draftCategory.trim()) {
      setEditError('Category is required');
      return;
    }
    if (!draftSku.trim()) {
      setEditError('SKU is required');
      return;
    }
    if (!draftBarcode.trim()) {
      setEditError('Barcode is required');
      return;
    }

    await onSave({
      category: draftCategory.trim(),
      sku: draftSku.trim(),
      barcode: draftBarcode.trim(),
    });
    setEditError('');
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Basic information</h2>
            <p className="mt-0.5 text-xs text-gray-500">Category, SKU, and identifiers</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" aria-hidden />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Category</p>
          {isEditing ? (
            <div className="mt-1">
              <HierarchicalCategoryDropdown
                selectedCategory={draftCategory}
                onCategorySelect={(categoryId) => setDraftCategory(categoryId)}
                storeId={product.storeId || ''}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gray-900">{categoryName}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">SKU</p>
          {isEditing ? (
            <input
              value={draftSku}
              onChange={(e) => setDraftSku(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 font-mono text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Enter SKU"
            />
          ) : (
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{product.sku || '—'}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Barcode</p>
          {isEditing ? (
            <input
              value={draftBarcode}
              onChange={(e) => setDraftBarcode(e.target.value)}
              className="mt-1 w-full rounded border border-gray-200 bg-white px-2.5 py-2 font-mono text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Enter barcode"
            />
          ) : (
            <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{product.barcode || '—'}</p>
          )}
        </div>
      </div>
      {isEditing && editError ? (
        <p className="px-5 pb-4 text-xs font-medium text-red-600">{editError}</p>
      ) : null}
    </div>
  );
};

export default ProductBasicInformation;
