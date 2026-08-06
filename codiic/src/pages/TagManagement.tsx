import { TagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import {
  adminListCardClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../components/admin-list-ui';
import TagOptionsList from '../components/tags/TagOptionsList';
import { TAG_MANAGEMENT_OPTIONS } from '../components/tags/tagManagementOptions';

const TagManagement: React.FC = () => {
  const areaCount = TAG_MANAGEMENT_OPTIONS.length;

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} space-y-6`}>
        <header className="mb-0 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <TagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
              <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
                Tag management
              </h1>
              <span className="inline-flex items-center rounded-full bg-admin-secondary px-2.5 py-1 text-[12px] font-medium text-admin-text-secondary">
                {areaCount} areas
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-admin-text-secondary">
              Choose where tags apply—each area has its own list so customer, product, and operations
              labels stay separate.
            </p>
          </div>
        </header>

        <div className="rounded-xl border border-admin-border bg-admin-surface px-5 py-4">
          <p className="text-[12px] leading-relaxed text-admin-text-secondary">
            <span className="font-semibold text-admin-text">Tip:</span> use short, consistent tag
            names so filters and exports stay readable across your team.
          </p>
        </div>

        <section className={adminListCardClass}>
          <div className="border-b border-admin-border bg-admin-table-header px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-secondary">
                <TagIcon className="h-4 w-4 text-admin-text-secondary" aria-hidden />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-admin-text">Where to manage tags</h2>
                <p className="text-[12px] text-admin-text-secondary">
                  Open an area to view, add, or remove tags for that context.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <TagOptionsList />
          </div>
        </section>
      </div>
    </div>
  );
};

export default TagManagement;
