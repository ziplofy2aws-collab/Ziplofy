import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CustomerTag } from '../../contexts/customer-tags.context';

interface CustomerTagsSectionProps {
  selectedTagIds: string[];
  customerTags: CustomerTag[];
  onTagSelect: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
  onCreateTag: (name: string) => Promise<void>;
  activeStoreId?: string;
}

const CustomerTagsSection: React.FC<CustomerTagsSectionProps> = ({
  selectedTagIds,
  customerTags,
  onTagSelect,
  onTagRemove,
  onCreateTag,
}) => {
  const [tagsQuery, setTagsQuery] = React.useState('');
  const [tagsMenuOpen, setTagsMenuOpen] = React.useState(false);
  const [debouncedTagsQuery, setDebouncedTagsQuery] = React.useState('');
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const tagsInputRef = useRef<HTMLInputElement>(null);

  const handleTagsQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsQuery(e.target.value);
    if (!tagsMenuOpen) setTagsMenuOpen(true);
  }, [tagsMenuOpen]);

  const handleTagSelect = useCallback(
    (tagId: string) => {
      onTagSelect(tagId);
      setTagsQuery('');
      setTagsMenuOpen(true);
    },
    [onTagSelect]
  );

  const handleCreateTag = useCallback(async () => {
    if (!debouncedTagsQuery.trim()) return;
    await onCreateTag(debouncedTagsQuery);
    setTagsQuery('');
    setTagsMenuOpen(true);
  }, [debouncedTagsQuery, onCreateTag]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTagsQuery(tagsQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [tagsQuery]);

  // Handle click outside tags menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagsMenuRef.current &&
        !tagsMenuRef.current.contains(event.target as Node) &&
        tagsInputRef.current &&
        !tagsInputRef.current.contains(event.target as Node)
      ) {
        setTagsMenuOpen(false);
      }
    };

    if (tagsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tagsMenuOpen]);

  const filteredTags = useMemo(() => {
    const q = debouncedTagsQuery.toLowerCase();
    if (!q) return customerTags.slice(0, 10);
    const starts = customerTags.filter((t) => t.name.toLowerCase().startsWith(q));
    const includes = customerTags
      .filter((t) => !t.name.toLowerCase().startsWith(q) && t.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q));
    return [...starts, ...includes].slice(0, 10);
  }, [debouncedTagsQuery, customerTags]);

  const canCreateTag = useMemo(() => {
    const q = debouncedTagsQuery.trim();
    return q && !customerTags.some((t) => t.name.toLowerCase() === q.toLowerCase());
  }, [debouncedTagsQuery, customerTags]);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Tags</h2>
      <div className="relative">
        <input
          ref={tagsInputRef}
          type="text"
          value={tagsQuery}
          placeholder="Search or create customer tags"
          onChange={handleTagsQueryChange}
          onFocus={() => setTagsMenuOpen(true)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
        {selectedTagIds.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">{selectedTagIds.length} selected</p>
        )}
        {tagsMenuOpen && (filteredTags.length > 0 || canCreateTag) && (
          <div
            ref={tagsMenuRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredTags.map((tag) => {
              const selected = selectedTagIds.includes(tag._id);
              return (
                <div
                  key={tag._id}
                  onClick={() => handleTagSelect(tag._id)}
                  className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </div>
              );
            })}
            {canCreateTag && (
              <div
                onClick={handleCreateTag}
                className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors font-medium"
              >
                <span className="text-sm text-gray-700">+ {debouncedTagsQuery}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {selectedTagIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTagIds.map((id) => {
            const tag = customerTags.find((ct) => ct._id === id);
            return (
              <div
                key={id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
              >
                <span>{tag?.name || 'Unknown'}</span>
                <button
                  type="button"
                  onClick={() => onTagRemove(id)}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Remove tag"
                >
                  <XMarkIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerTagsSection;

