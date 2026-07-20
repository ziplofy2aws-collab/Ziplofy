import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CatalogsEmptyStateProps {
  onCreate: () => void;
}

export default function CatalogsEmptyState({ onCreate }: CatalogsEmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-12 flex flex-col justify-center items-center gap-6">
      <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
        <DocumentTextIcon className="w-7 h-7 text-blue-600" />
      </div>
      <div className="flex flex-col justify-center items-center text-center max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-1.5">Personalize buying with catalogs</h2>
        <p className="text-sm text-gray-500">
          Create custom product and pricing offerings for your customers with catalogs.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Create catalog</span>
      </button>
    </div>
  );
}

