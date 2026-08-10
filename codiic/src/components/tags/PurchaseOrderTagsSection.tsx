import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePurchaseOrderTags } from '../../contexts/purchase-order-tags.context';
import { useStore } from '../../contexts/store.context';
import { SettingsPanel } from '../settings/SettingsPageScaffold';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal';
import PurchaseOrderTagsSectionTable from './PurchaseOrderTagsSectionTable';
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

const PurchaseOrderTagsSection: React.FC = () => {
  const { tags, loading, error, fetchTagsByStoreId, createTag, deleteTag } = usePurchaseOrderTags();
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
    await createTag(activeStoreId, newTagName.trim());
    setNewTagName('');
  }, [activeStoreId, newTagName, createTag]);

  const handleDeleteClick = useCallback((tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (tagToDelete) {
      await deleteTag(tagToDelete._id);
      setIsDeleteModalOpen(false);
      setTagToDelete(null);
    }
  }, [tagToDelete, deleteTag]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTagToDelete(null);
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      fetchTagsByStoreId(activeStoreId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  return (
    <>
      <SettingsPanel className="overflow-hidden p-0">
        <div className={tagSectionHeaderClass}>
          <h2 className="text-[13px] font-semibold text-admin-text">Your purchase order tags</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Tags make it easier to sort POs by vendor, priority, or internal workflow before they hit
            accounting.
          </p>
        </div>

        <div className={tagAddBarClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new purchase order tag"
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

        <PurchaseOrderTagsSectionTable
          tags={tags}
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

export default PurchaseOrderTagsSection;
