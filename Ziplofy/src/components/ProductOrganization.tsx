import { CheckIcon, PencilSquareIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useProductTags } from '../contexts/product-tags.context';
import { Product } from '../contexts/product.context';
import ProductTagsInput from './products/ProductTagsInput';
import ProductTypeInput from './products/ProductTypeInput';
import SelectedTagsList from './products/SelectedTagsList';
import VendorInput from './products/VendorInput';

interface ProductOrganizationProps {
  product: Product;
  activeStoreId: string | null;
  onSave: (payload: { productType: string; vendor: string; tagIds: string[] }) => Promise<void>;
  isSaving: boolean;
}

const ProductOrganization: React.FC<ProductOrganizationProps> = ({
  product,
  activeStoreId,
  onSave,
  isSaving,
}) => {
  const { productTags } = useProductTags();
  const typeName =
    (product.productType && typeof product.productType === 'object' && product.productType.name) || '—';
  const vendorName = (product.vendor && typeof product.vendor === 'object' && product.vendor.name) || '—';
  const tags = Array.isArray(product.tagIds) ? product.tagIds : [];
  const [isEditing, setIsEditing] = useState(false);
  const [draftProductType, setDraftProductType] = useState(product.productType?._id || '');
  const [draftVendor, setDraftVendor] = useState(product.vendor?._id || '');
  const [draftTags, setDraftTags] = useState<string[]>(tags.map((tag) => tag._id));
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setDraftProductType(product.productType?._id || '');
      setDraftVendor(product.vendor?._id || '');
      setDraftTags(tags.map((tag) => tag._id));
    }
  }, [isEditing, product.productType?._id, product.vendor?._id, product.tagIds]);

  const startEditing = () => {
    setEditError('');
    setDraftProductType(product.productType?._id || '');
    setDraftVendor(product.vendor?._id || '');
    setDraftTags(tags.map((tag) => tag._id));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draftProductType.trim()) {
      setEditError('Product type is required');
      return;
    }
    if (!draftVendor.trim()) {
      setEditError('Vendor is required');
      return;
    }

    await onSave({
      productType: draftProductType,
      vendor: draftVendor,
      tagIds: draftTags,
    });
    setEditError('');
    setIsEditing(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Organization</h2>
            <p className="mt-0.5 text-xs text-gray-500">Type, vendor, and tags</p>
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
      <div className="p-5">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
                <ProductTypeInput
                  selectedProductTypeId={draftProductType}
                  activeStoreId={activeStoreId}
                  onProductTypeChange={setDraftProductType}
                />
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
                <VendorInput
                  selectedVendorId={draftVendor}
                  activeStoreId={activeStoreId}
                  onVendorChange={setDraftVendor}
                />
              </div>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <TagIcon className="h-3.5 w-3.5" aria-hidden />
                Tags
              </p>
              <ProductTagsInput
                selectedTags={draftTags}
                activeStoreId={activeStoreId}
                onTagsChange={setDraftTags}
              />
              <SelectedTagsList
                tagIds={draftTags}
                productTags={productTags}
                onTagRemove={(tagId) => setDraftTags((prev) => prev.filter((id) => id !== tagId))}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Product type</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{typeName}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Vendor</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{vendorName}</p>
              </div>
            </div>

            {tags.length > 0 ? (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <TagIcon className="h-3.5 w-3.5" aria-hidden />
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm"
                    >
                      {tag?.name || '—'}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
        {isEditing && editError ? (
          <p className="mt-3 text-xs font-medium text-red-600">{editError}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ProductOrganization;
