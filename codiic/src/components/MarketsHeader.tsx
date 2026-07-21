import { ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';

interface MarketsHeaderProps {
  onCreateMarket: () => void;
  onGraphView?: () => void;
}

export default function MarketsHeader({ onCreateMarket, onGraphView }: MarketsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="pl-3 border-l-4 border-blue-500/60">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Markets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your markets and catalogs</p>
      </div>
      <div className="flex items-center gap-2">
        {onGraphView && (
          <button
            type="button"
            onClick={onGraphView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200/80 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Graph view</span>
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
          onClick={onCreateMarket}
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create market</span>
        </button>
      </div>
    </div>
  );
}

