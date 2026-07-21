import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  customerInputClass,
  customerSectionSubtitleClass,
  customerSectionTitleClass,
} from '../customers/customer-ui.util';
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

  const handleTagsQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTagsQuery(e.target.value);
      if (!tagsMenuOpen) setTagsMenuOpen(true);
    },
    [tagsMenuOpen]
  );

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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTagsQuery(tagsQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [tagsQuery]);

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
    <div
      className={`relative overflow-visible rounded-lg border border-gray-200/80 bg-white shadow-sm ${
        tagsMenuOpen ? 'z-50' : 'z-0'
      }`}
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className={customerSectionTitleClass}>Customer tags</h2>
        <p className={customerSectionSubtitleClass}>Organize customers with tags for filtering and segments.</p>
      </div>
      <div className="overflow-visible px-4 py-4">
        <div className="relative z-30">
          <input
            ref={tagsInputRef}
            type="text"
            value={tagsQuery}
            placeholder="Search or create customer tags"
            onChange={handleTagsQueryChange}
            onFocus={() => setTagsMenuOpen(true)}
            className={customerInputClass}
          />
          {selectedTagIds.length > 0 ? (
            <p className="mt-1 text-[12px] text-gray-500">{selectedTagIds.length} selected</p>
          ) : null}
          {tagsMenuOpen && (filteredTags.length > 0 || canCreateTag) ? (
            <div
              ref={tagsMenuRef}
              className="absolute left-0 top-full z-50 mt-1 max-h-[300px] w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredTags.map((tag) => {
                const selected = selectedTagIds.includes(tag._id);
                return (
                  <div
                    key={tag._id}
                    onClick={() => handleTagSelect(tag._id)}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      readOnly
                      className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                    />
                    <span className="text-[13px] text-gray-700">{tag.name}</span>
                  </div>
                );
              })}
              {canCreateTag ? (
                <div
                  onClick={handleCreateTag}
                  className="cursor-pointer px-3 py-1.5 font-medium transition-colors hover:bg-gray-50"
                >
                  <span className="text-[13px] text-gray-700">+ {debouncedTagsQuery}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {selectedTagIds.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = customerTags.find((ct) => ct._id === tagId);
              return (
                <div
                  key={tagId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[12px] text-gray-700"
                >
                  <span>{tag?.name || 'Unknown'}</span>
                  <button
                    type="button"
                    onClick={() => onTagRemove(tagId)}
                    className="rounded p-0.5 transition-colors hover:bg-gray-200"
                    aria-label="Remove tag"
                  >
                    <XMarkIcon className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerTagsSection;
