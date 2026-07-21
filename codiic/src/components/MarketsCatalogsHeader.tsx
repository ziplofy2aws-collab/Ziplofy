import { PlusIcon } from '@heroicons/react/24/outline';

interface MarketsCatalogsHeaderProps {
  onCreate: () => void;
}

export default function MarketsCatalogsHeader({ onCreate }: MarketsCatalogsHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="pl-3 border-l-4 border-blue-500/60">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catalogs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create custom product and pricing offerings for your customers</p>
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

