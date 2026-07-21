import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useBlogTags } from '../../contexts/blog-tags.context';
import ProductTagsMenu from '../products/ProductTagsMenu';
import SelectedTagChip from '../products/SelectedTagChip';

const SEARCH_DEBOUNCE_MS = 300;

interface BlogTagsInputProps {
  selectedTagIds: string[];
  activeStoreId: string | null;
  onTagsChange: (tagIds: string[]) => void;
  inputId?: string;
  hideLabel?: boolean;
}

export default function BlogTagsInput({
  selectedTagIds,
  activeStoreId,
  onTagsChange,
  inputId = 'blog-tags',
  hideLabel = false,
}: BlogTagsInputProps) {
  const {
    blogTags,
    searchResults,
    searchLoading,
    searchBlogTags,
    createBlogTag,
  } = useBlogTags();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!activeStoreId || !menuOpen) return;
    void searchBlogTags(activeStoreId, debouncedQuery);
  }, [activeStoreId, debouncedQuery, menuOpen, searchBlogTags]);

  const dropdownTags = useMemo(() => {
    return searchResults.length > 0 || debouncedQuery || menuOpen
      ? searchResults
      : blogTags.slice(0, 10);
  }, [searchResults, debouncedQuery, menuOpen, blogTags]);

  const queryExists = useMemo(() => {
    if (!debouncedQuery) return false;
    const q = debouncedQuery.toLowerCase();
    return dropdownTags.some((tag) => tag.name.toLowerCase() === q)
      || blogTags.some((tag) => tag.name.toLowerCase() === q);
  }, [debouncedQuery, dropdownTags, blogTags]);

  const selectedTagsForChips = useMemo(() => {
    const byId = new Map(blogTags.map((tag) => [tag._id, tag]));
    for (const tag of searchResults) byId.set(tag._id, tag);
    return selectedTagIds.map((id) => byId.get(id)).filter(Boolean);
  }, [blogTags, searchResults, selectedTagIds]);

  const handleTagSelect = useCallback(
    (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId));
      } else {
        onTagsChange([...selectedTagIds, tagId]);
      }
      setQuery('');
      setDebouncedQuery('');
      setMenuOpen(true);
    },
    [selectedTagIds, onTagsChange]
  );

  const handleTagRemove = useCallback(
    (tagId: string) => {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
      setMenuOpen(true);
    },
    [selectedTagIds, onTagsChange]
  );

  const createAndSelectTag = useCallback(
    async (name: string) => {
      if (!activeStoreId || !name.trim()) return null;

      const trimmed = name.trim();
      const existing =
        dropdownTags.find((tag) => tag.name.toLowerCase() === trimmed.toLowerCase()) ??
        blogTags.find((tag) => tag.name.toLowerCase() === trimmed.toLowerCase());

      if (existing) {
        if (!selectedTagIds.includes(existing._id)) {
          onTagsChange([...selectedTagIds, existing._id]);
        }
        setQuery('');
        setDebouncedQuery('');
        setMenuOpen(true);
        return existing;
      }

      try {
        const created = await createBlogTag({
          storeId: activeStoreId,
          name: trimmed,
        });
        onTagsChange([...selectedTagIds, created._id]);
        setQuery('');
        setDebouncedQuery('');
        setMenuOpen(true);
        await searchBlogTags(activeStoreId, '');
        toast.success('Blog tag created');
        return created;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || 'Failed to create blog tag';
        toast.error(message);
        return null;
      }
    },
    [
      activeStoreId,
      dropdownTags,
      blogTags,
      selectedTagIds,
      createBlogTag,
      onTagsChange,
      searchBlogTags,
    ]
  );

  return (
    <div>
      {!hideLabel ? (
        <label htmlFor={inputId} className="mb-1 block text-xs font-normal text-gray-500">
          Tags
        </label>
      ) : null}

      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={query}
          placeholder="Search or create tags"
          onChange={(e) => {
            setQuery(e.target.value);
            setMenuOpen(true);
          }}
          onFocus={() => setMenuOpen(true)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void createAndSelectTag(query.trim() || debouncedQuery);
            }
          }}
          className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-normal text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200"
        />

        {menuOpen ? (
          <ProductTagsMenu
            tags={dropdownTags}
            selectedTags={selectedTagIds}
            debouncedQuery={debouncedQuery}
            queryExists={queryExists}
            onTagSelect={handleTagSelect}
            onCreateTag={() => void createAndSelectTag(debouncedQuery || query.trim())}
          />
        ) : null}

        {searchLoading ? (
          <p className="mt-1 text-[11px] font-normal text-gray-400">Searching tags…</p>
        ) : null}
      </div>

      {selectedTagsForChips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedTagsForChips.map((tag) => (
            <SelectedTagChip
              key={tag!._id}
              tagName={tag!.name}
              onRemove={() => handleTagRemove(tag!._id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
