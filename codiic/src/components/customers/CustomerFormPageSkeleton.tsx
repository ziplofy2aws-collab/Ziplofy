import React from 'react';

function SectionCardSkeleton({
  titleWidth = 'w-36',
  rows = 3,
  twoCol = false,
}: {
  titleWidth?: string;
  rows?: number;
  twoCol?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className={`mb-1.5 h-4 ${titleWidth} rounded bg-gray-200`} />
        <div className="h-3 w-48 max-w-full rounded bg-gray-100" />
      </div>
      <div className="px-4 py-4">
        {twoCol ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i}>
                <div className="mb-1.5 h-3 w-16 rounded bg-gray-100" />
                <div className="h-9 rounded-md bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i}>
                <div className="mb-1.5 h-3 w-20 rounded bg-gray-100" />
                <div className="h-9 rounded-md bg-gray-100" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomerFormPageSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-page-background-color"
      aria-busy="true"
      aria-label="Loading customer"
    >
      <div className="mx-auto max-w-[900px] animate-pulse px-3 py-4 sm:px-4">
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200" />
            <div className="h-3.5 w-28 rounded bg-gray-200" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-9 w-20 rounded-lg bg-gray-200" />
              <div className="h-9 w-28 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionCardSkeleton titleWidth="w-36" rows={5} twoCol />
          <SectionCardSkeleton titleWidth="w-44" rows={2} />
          <SectionCardSkeleton titleWidth="w-28" rows={1} />
          <SectionCardSkeleton titleWidth="w-20" rows={1} />
          <SectionCardSkeleton titleWidth="w-16" rows={1} />
          <SectionCardSkeleton titleWidth="w-24" rows={2} />
          <SectionCardSkeleton titleWidth="w-28" rows={3} />
        </div>
      </div>
    </div>
  );
};

export default CustomerFormPageSkeleton;
