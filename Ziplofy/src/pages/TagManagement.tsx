import { TagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import TagOptionsList from '../components/tags/TagOptionsList';
import { TAG_MANAGEMENT_OPTIONS } from '../components/tags/tagManagementOptions';

const TagManagement: React.FC = () => {
  const areaCount = TAG_MANAGEMENT_OPTIONS.length;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-2">
      <header className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
        <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Tag management</h1>
            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {areaCount} areas
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Choose where tags apply—each area has its own list so customer, product, and operations labels stay
            separate.
          </p>
        </div>
        <div className="mt-4 hidden rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2.5 sm:block">
          <p className="text-xs leading-relaxed text-blue-950/80">
            <span className="font-semibold text-blue-950">Tip:</span> use short, consistent tag names so filters and
            exports stay readable across your team.
          </p>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <TagIcon className="h-5 w-5 text-blue-600" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Where to manage tags</h2>
              <p className="text-xs text-gray-500">Open an area to view, add, or remove tags for that context.</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <TagOptionsList />
        </div>
      </section>
    </div>
  );
};

export default TagManagement;
