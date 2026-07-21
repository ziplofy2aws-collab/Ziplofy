import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SettingsPanel } from '../settings/SettingsPageScaffold';
import { useProductType } from '../../contexts/product-type.context';
import { useStore } from '../../contexts/store.context';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal';
import ProductTypesList from './ProductTypesList';

interface Tag {
  _id: string;
  name: string;
}

const ProductTypesSection: React.FC = () => {
  const { productTypes, loading, error, createProductType, getProductTypesByStoreId, deleteProductType } = useProductType();
  const { activeStoreId } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canCreate = useMemo(() => newTagName.trim().length > 0 && !!activeStoreId, [newTagName, activeStoreId]);

  const handleNewTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
  }, []);

  const handleAddTag = useCallback(async () => {
    if (!activeStoreId || !newTagName.trim()) return;
    await createProductType({ storeId: activeStoreId, name: newTagName.trim() });
    setNewTagName('');
  }, [activeStoreId, newTagName, createProductType]);

  const handleDeleteClick = useCallback((tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (tagToDelete) {
      await deleteProductType(tagToDelete._id);
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
    }
  }, [tagToDelete, deleteProductType]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTagToDelete(null);
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      getProductTypesByStoreId(activeStoreId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  return (
    <>
      <SettingsPanel className="overflow-hidden p-0">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900">Your product types</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Types classify products at a high level (for example apparel vs. accessories) and often appear in admin filters and exports.
          </p>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new product type"
              value={newTagName}
              onChange={handleNewTagNameChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate && !loading) void handleAddTag();
              }}
              className="min-w-0 flex-1 rounded-xl border border-gray-200/90 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              disabled={!canCreate || loading}
              onClick={() => void handleAddTag()}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {error ? (
          <div
            className="border-b border-red-100 bg-red-50/60 px-5 py-3 text-sm text-red-800 sm:px-6"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <ProductTypesList
          tags={productTypes}
          loading={loading}
          onDeleteClick={handleDeleteClick}
        />
      </SettingsPanel>

      <DeleteTagConfirmationModal
        isOpen={isDeleteModalOpen}
        tagName={tagToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default ProductTypesSection;

