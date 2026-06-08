import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ContentUrlRedirectsPage = () => {
  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <Link
              to="/content/menus"
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Navigation menus
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">URL redirects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Forward visitors from old paths to new URLs on your online store.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Create URL redirect
          </button>
        </header>

        <div className="rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-gray-500">URL redirects will be listed here.</p>
        </div>
      </div>
    </div>
  );
};
