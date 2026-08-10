import { PlusIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBlogTags } from '../../contexts/blog-tags.context';
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

export default function BlogTagsSection() {
  const { blogTags, loading, error, fetchBlogTagsByStoreId, createBlogTag, deleteBlogTag } =
    useBlogTags();
  const { activeStoreId } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canCreate = useMemo(
    () => newTagName.trim().length > 0 && !!activeStoreId,
    [newTagName, activeStoreId]
  );

  const handleAddTag = useCallback(async () => {
    if (!activeStoreId || !newTagName.trim()) return;
    await createBlogTag({ storeId: activeStoreId, name: newTagName.trim() });
    setNewTagName('');
  }, [activeStoreId, newTagName, createBlogTag]);

  const handleDeleteClick = useCallback((tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!tagToDelete) return;
    await deleteBlogTag(tagToDelete._id, activeStoreId ?? undefined);
    setIsDeleteModalOpen(false);
    setTagToDelete(null);
  }, [tagToDelete, deleteBlogTag, activeStoreId]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTagToDelete(null);
  }, []);

  useEffect(() => {
    if (!activeStoreId) return;
    void fetchBlogTagsByStoreId(activeStoreId);
  }, [activeStoreId, fetchBlogTagsByStoreId]);

  return (
    <>
      <SettingsPanel className="overflow-hidden p-0">
        <div className={tagSectionHeaderClass}>
          <h2 className="text-[13px] font-semibold text-admin-text">Your blog tags</h2>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Tags help organize blog posts and make them easier to find when writing or filtering
            content.
          </p>
        </div>

        <div className={tagAddBarClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
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

        <ProductTagsList tags={blogTags} loading={loading} onDeleteClick={handleDeleteClick} />
      </SettingsPanel>

      <DeleteTagConfirmationModal
        isOpen={isDeleteModalOpen}
        tagName={tagToDelete?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
