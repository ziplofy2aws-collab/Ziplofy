import React from 'react';
import {
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../admin-list-ui';

const BlogPostFormPageSkeleton: React.FC = () => {
  return (
    <div className={adminListPageShellClass} aria-busy="true" aria-label="Loading blog post">
      <div className={`${adminListPageInnerClass} animate-pulse py-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-admin-fill" />
            <div className="h-5 w-40 rounded bg-admin-fill" />
            <div className="h-5 w-14 rounded-full bg-admin-secondary" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-14 rounded-lg bg-admin-fill" />
            <div className="h-8 w-32 rounded-lg bg-admin-fill" />
            <div className="h-8 w-28 rounded-lg bg-admin-fill" />
            <div className="h-8 w-8 rounded-lg bg-admin-fill" />
            <div className="h-8 w-8 rounded-lg bg-admin-fill" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-admin-border bg-admin-surface p-4 sm:p-5">
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 h-3 w-10 rounded bg-admin-secondary" />
                  <div className="h-9 rounded-lg bg-admin-secondary" />
                </div>
                <div>
                  <div className="mb-1.5 h-3 w-14 rounded bg-admin-secondary" />
                  <div className="h-48 rounded-lg bg-admin-secondary" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
              <div className="border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
                <div className="h-3.5 w-16 rounded bg-admin-fill" />
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-admin-secondary" />
                  <div className="h-3 w-4/5 rounded bg-admin-secondary" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-admin-border bg-admin-surface p-4">
              <div className="mb-3 h-3.5 w-36 rounded bg-admin-fill" />
              <div className="space-y-3">
                <div className="h-9 rounded-lg bg-admin-secondary" />
                <div className="h-20 rounded-lg bg-admin-secondary" />
                <div className="h-9 rounded-lg bg-admin-secondary" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface"
              >
                <div className="border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
                  <div className="h-3.5 w-20 rounded bg-admin-fill" />
                </div>
                <div className="p-4">
                  {i === 2 ? (
                    <div className="h-36 rounded-lg bg-admin-secondary" />
                  ) : (
                    <div className="space-y-2">
                      <div className="h-8 rounded-lg bg-admin-secondary" />
                      <div className="h-8 rounded-lg bg-admin-secondary" />
                      {i === 3 ? <div className="h-8 rounded-lg bg-admin-secondary" /> : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <div className="h-9 w-16 rounded-lg bg-admin-fill" />
        </div>
      </div>
    </div>
  );
};

export default BlogPostFormPageSkeleton;
