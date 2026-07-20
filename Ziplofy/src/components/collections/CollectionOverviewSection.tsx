import {
  CalendarDaysIcon,
  LinkIcon,
  PencilSquareIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import type { Collection } from '../../contexts/collection.context';

interface CollectionOverviewSectionProps {
  collection: Collection;
  onEdit: () => void;
  onDelete: () => void;
}

const CollectionOverviewSection: React.FC<CollectionOverviewSectionProps> = ({
  collection,
  onEdit,
  onDelete,
}) => {
  const updated = new Date(collection.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Storefront &amp; SEO</h2>
          <p className="text-xs text-gray-500">How this collection appears online</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <TrashIcon className="h-3.5 w-3.5" aria-hidden />
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Page title</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{collection.pageTitle || '—'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <LinkIcon className="h-3 w-3" aria-hidden />
              URL handle
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-gray-900">{collection.urlHandle || '—'}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-3">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <TagIcon className="h-3 w-3" aria-hidden />
            Meta description
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {collection.metaDescription || '—'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-xs text-gray-500">
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <span>
            <span className="font-semibold text-gray-700">Last updated</span> · {updated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CollectionOverviewSection;
