import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useProductTags } from '../../contexts/product-tags.context';
import { useStore } from '../../contexts/store.context';
import { SettingsPanel } from '../settings/SettingsPageScaffold';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal';
import ProductTagsList from './ProductTagsList';
import {
  tagAddBarClass,
  tagAddButtonClass,
  tagErrorClass,
  tagInputClass,
  tagSectionHeaderClass,
} from './tag-management-ui';

interface Tag {
  _id: string;
  name: string;
}

const ProductTagsSection: React.FC = () => {
  const { productTags, loading, error, fetchProductTags, addProductTag, deleteProductTag } =
    useProductTags();
  const { activeStoreId } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canCreate = useMemo(
    () => newTagName.trim().length > 0 && !!activeStoreId,
    [newTagName, activeStoreId]
  );

  const handleNewTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
  }, []);

  const handleAddTag = useCallback(async () => {
    if (!activeStoreId || !newTagName.trim()) return;
    await addProductTag(activeStoreId, newTagName.trim());
    setNewTagName('');
  }, [activeStoreId, newTagName, addProductTag]);

  const handleDeleteClick = useCallback((tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (tagToDelete) {
      await deleteProductTag(tagToDelete._id);
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
    }
  }, [tagToDelete, deleteProductTag]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTagToDelete(null);
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      fetchProductTags(activeStoreId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  return (
    <>
      <SettingsPanel className="overflow-hidden p-0">
        <div className={tagSectionHeaderClass}>
          <h2 className="text-[13px] font-semibold text-admin-text">Your product tags</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Tags help shoppers and staff find products; use them alongside collections and search
            where your theme supports it.
          </p>
        </div>

        <div className={tagAddBarClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTagName}
              onChange={handleNewTagNameChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate && !loading) void handleAddTag();
              }}
              className={tagInputClass}
            />
            <button
              type="button"
              disabled={!canCreate || loading}
              onClick={() => void handleAddTag()}
              className={tagAddButtonClass}
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {error ? (
          <div className={tagErrorClass} role="alert">
            {error}
          </div>
        ) : null}

        <ProductTagsList tags={productTags} loading={loading} onDeleteClick={handleDeleteClick} />
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

export default ProductTagsSection;
