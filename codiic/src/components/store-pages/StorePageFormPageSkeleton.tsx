import React from 'react';
import { adminListPageInnerClass, adminListPageShellClass } from '../admin-list-ui';

const StorePageFormPageSkeleton: React.FC = () => {
  return (
    <div className={adminListPageShellClass} aria-busy="true" aria-label="Loading page">
      <div className={`${adminListPageInnerClass} animate-pulse py-5`}>
        <div className="mb-5 flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-admin-fill" />
          <div className="h-4 w-14 rounded bg-admin-fill" />
          <div className="h-3.5 w-3.5 rounded bg-admin-secondary" />
          <div className="h-4 w-24 rounded bg-admin-fill" />
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
              <div className="flex items-center justify-between border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
                <div className="h-4 w-36 rounded bg-admin-fill" />
                <div className="h-4 w-4 rounded bg-admin-secondary" />
              </div>
              <div className="space-y-2 p-4">
                <div className="h-3 w-full rounded bg-admin-secondary" />
                <div className="h-3 w-4/5 rounded bg-admin-secondary" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface">
              <div className="flex items-center justify-between border-b border-admin-divider bg-admin-table-header px-4 py-2.5">
                <div className="h-4 w-20 rounded bg-admin-fill" />
                <div className="h-4 w-4 rounded bg-admin-secondary" />
              </div>
              <div className="space-y-2 p-4">
                <div className="h-5 w-24 rounded bg-admin-secondary" />
                <div className="h-5 w-24 rounded bg-admin-secondary" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-admin-divider pt-4">
          <div className="h-8 w-20 rounded-lg bg-admin-fill" />
          <div className="h-8 w-16 rounded-lg bg-admin-fill" />
        </div>
      </div>
    </div>
  );
};

export default StorePageFormPageSkeleton;
