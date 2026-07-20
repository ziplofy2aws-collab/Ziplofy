import MarketsListItems from './MarketsListItems';

type MarketItem = {
  _id: string;
  name: string;
  status: string;
};

interface MarketsListProps {
  markets: MarketItem[];
  loading: boolean;
  onSelect: (id: string) => void;
}

export default function MarketsList({ markets, loading, onSelect }: MarketsListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr] px-4 py-3 text-xs font-semibold text-gray-600 bg-gray-50/80 border-b border-gray-200/80">
        <div>Market Name</div>
        <div>Status</div>
      </div>
      <div>
        {loading && (
          <div className="px-4 py-8 text-sm text-gray-500 text-center">Loading markets...</div>
        )}
        {!loading && markets.length === 0 && (
          <div className="px-4 py-12 text-sm text-gray-500 text-center">No markets yet. Create your first market to get started.</div>
        )}
        {!loading && markets.length > 0 && (
          <MarketsListItems markets={markets} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}

