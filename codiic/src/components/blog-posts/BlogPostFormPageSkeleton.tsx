import React from 'react';

const BlogPostFormPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-page-background-color" aria-busy="true" aria-label="Loading blog post">
      <div className="mx-auto max-w-[1200px] animate-pulse px-3 py-4 sm:px-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-200" />
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-5 w-14 rounded-full bg-gray-100" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-14 rounded-lg bg-gray-200" />
            <div className="h-8 w-32 rounded-lg bg-gray-200" />
            <div className="h-8 w-28 rounded-lg bg-gray-200" />
            <div className="h-8 w-8 rounded-lg bg-gray-200" />
            <div className="h-8 w-8 rounded-lg bg-gray-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 h-3 w-10 rounded bg-gray-100" />
                  <div className="h-9 rounded-md bg-gray-100" />
                </div>
                <div>
                  <div className="mb-1.5 h-3 w-14 rounded bg-gray-100" />
                  <div className="h-48 rounded-md bg-gray-100" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-2.5">
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-4/5 rounded bg-gray-100" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="mb-3 h-4 w-36 rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-9 rounded-md bg-gray-100" />
                <div className="h-20 rounded-md bg-gray-100" />
                <div className="h-9 rounded-md bg-gray-100" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200/80 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </div>
                <div className="p-4">
                  {i === 2 ? (
                    <div className="h-36 rounded-md bg-gray-100" />
                  ) : (
                    <div className="space-y-2">
                      <div className="h-8 rounded-md bg-gray-100" />
                      <div className="h-8 rounded-md bg-gray-100" />
                      {i === 3 ? <div className="h-8 rounded-md bg-gray-100" /> : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="h-9 w-16 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default BlogPostFormPageSkeleton;
