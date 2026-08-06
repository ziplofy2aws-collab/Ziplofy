import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { adminListRowClass, adminListTableCellClass } from './admin-list-ui';

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
      className={`${adminListRowClass} w-full grid grid-cols-[2fr_1fr] text-left`}
    >
      <div className={`${adminListTableCellClass} flex items-center gap-2 font-medium text-admin-text`}>
        <GlobeAltIcon className="h-4 w-4 text-admin-text-secondary" />
        <span>{name}</span>
      </div>
      <div className={`${adminListTableCellClass} flex items-center`}>
        {isActive ? (
          <span className="inline-flex items-center rounded-md bg-admin-secondary px-2 py-0.5 text-[11px] font-medium text-admin-text">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-admin-fill px-2 py-0.5 text-[11px] font-medium text-admin-text-secondary">
            Draft
          </span>
        )}
      </div>
    </button>
  );
}
