import { PlusIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBlogTags } from '../../contexts/blog-tags.context';
import { useStore } from '../../contexts/store.context';
import { SettingsPanel } from '../settings/SettingsPageScaffold';
import DeleteTagConfirmationModal from './DeleteTagConfirmationModal';
import ProductTagsList from './ProductTagsList';

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

  const canCreate = useMemo(() => newTagName.trim().length > 0 && !!activeStoreId, [newTagName, activeStoreId]);

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
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900">Your blog tags</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Tags help organize blog posts and make them easier to find when writing or filtering content.
          </p>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/40 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Add new tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
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
