import MarketsListItem from './MarketsListItem';

type MarketItem = {
  _id: string;
  name: string;
  status: string;
};

interface MarketsListItemsProps {
  markets: MarketItem[];
  onSelect: (id: string) => void;
}

export default function MarketsListItems({ markets, onSelect }: MarketsListItemsProps) {
  return (
    <>
      {markets.map((m, idx) => (
        <div key={m._id}>
          <MarketsListItem id={m._id} name={m.name} status={m.status} onSelect={onSelect} />
          {idx < markets.length - 1 && <div className="border-t border-gray-200" />}
        </div>
      ))}
    </>
  );
}

