import { Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ContentPageHeader() {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
      <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Metaobjects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage definitions, product references, and reusable content blocks for your store.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50/90"
          type="button"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          <span>Manage</span>
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add definition</span>
        </button>
      </div>
    </header>
  );
}

