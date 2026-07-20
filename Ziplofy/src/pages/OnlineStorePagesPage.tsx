import {
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const placeholderPages = [
  {
    id: '1',
    title: 'Home',
    handle: '/',
    visibility: 'visible' as const,
    updatedAt: '—',
  },
  {
    id: '2',
    title: 'About us',
    handle: '/pages/about',
    visibility: 'visible' as const,
    updatedAt: '—',
  },
  {
    id: '3',
    title: 'Contact',
    handle: '/pages/contact',
    visibility: 'visible' as const,
    updatedAt: '—',
  },
  {
    id: '4',
    title: 'FAQ',
    handle: '/pages/faq',
    visibility: 'hidden' as const,
    updatedAt: '—',
  },
];

export default function OnlineStorePagesPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] w-full bg-page-background-color">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
          <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Pages</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage static pages for your storefront—about, contact, policies, and more.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search pages"
                className="w-full min-w-[200px] rounded-xl border border-gray-200/90 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-56"
                aria-label="Search pages"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add page
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">Online store pages</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Pages use your theme’s templates. Edit content and visibility before publishing to your live store.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 sm:px-6">Title</th>
                  <th className="hidden px-4 py-3 md:table-cell">URL</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Updated</th>
                  <th className="w-12 px-4 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {placeholderPages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                          <DocumentTextIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{page.title}</p>
                          <p className="text-xs text-gray-500 md:hidden">{page.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-4 font-mono text-xs text-gray-600 md:table-cell">{page.handle}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          page.visibility === 'visible'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {page.visibility === 'visible' ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 text-gray-500 lg:table-cell">{page.updatedAt}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label={`More actions for ${page.title}`}
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
            <p className="text-center text-xs text-gray-500">
              Sample pages shown for layout. Connect your store API to load, create, and edit real pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
