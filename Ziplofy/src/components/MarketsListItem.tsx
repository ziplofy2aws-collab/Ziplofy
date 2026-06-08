import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface MarketsListItemProps {
  id: string;
  name: string;
  status: string;
  onSelect: (id: string) => void;
}

export default function MarketsListItem({ id, name, status, onSelect }: MarketsListItemProps) {
  const isActive = status === 'active';

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="cursor-pointer w-full text-left px-4 py-3 grid grid-cols-[2fr_1fr] hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <GlobeAltIcon className="w-4 h-4 text-blue-500/70" />
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </div>
      <div className="flex items-center">
        {isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200/80">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 border border-gray-200/80">
            Draft
          </span>
        )}
      </div>
    </button>
  );
}

