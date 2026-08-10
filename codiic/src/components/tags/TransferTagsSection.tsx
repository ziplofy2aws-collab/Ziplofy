import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../contexts/store.context';
import { useTransferTags } from '../../contexts/transfer-tags.context';
import { SettingsPanel } from '../settings/SettingsPageScaffold';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal';
import {
  tagAddBarClass,
  tagAddButtonClass,
  tagErrorClass,
  tagInputClass,
  tagSectionHeaderClass,
} from './tag-management-ui';
import TransferTagsList from './TransferTagsList';

interface Tag {
  _id: string;
  name: string;
}

const TransferTagsSection: React.FC = () => {
  const { tags, loading, error, fetchByStore, createTag, deleteTag } = useTransferTags();
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
      fetchByStore(activeStoreId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  return (
    <>
      <SettingsPanel className="overflow-hidden p-0">
        <div className={tagSectionHeaderClass}>
          <h2 className="text-[13px] font-semibold text-admin-text">Your transfer tags</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Use consistent labels on transfers so receiving, auditing, and inventory reports stay easy
            to scan.
          </p>
        </div>

        <div className={tagAddBarClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new transfer tag"
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

        <TransferTagsList tags={tags} loading={loading} onDeleteClick={handleDeleteClick} />
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

export default TransferTagsSection;
