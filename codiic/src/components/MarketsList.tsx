import {
  adminListTableHeadClass,
  adminListTableHeadRowClass,
} from './admin-list-ui';
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
    <div className="overflow-x-auto bg-admin-surface">
      <div className={`grid grid-cols-[2fr_1fr] ${adminListTableHeadRowClass}`}>
        <div className={adminListTableHeadClass}>Market Name</div>
        <div className={adminListTableHeadClass}>Status</div>
      </div>
      <div>
        {loading && (
          <div className="px-3 py-16 text-center text-[13px] text-admin-text-secondary">
            Loading markets...
          </div>
        )}
        {!loading && markets.length === 0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-admin-text">No markets yet</p>
            <p className="mt-1.5 text-[13px] font-normal text-admin-text-secondary">
              Create your first market to get started.
            </p>
          </div>
        )}
        {!loading && markets.length > 0 && (
          <MarketsListItems markets={markets} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
