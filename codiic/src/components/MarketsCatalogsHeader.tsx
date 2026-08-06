import { RectangleStackIcon, PlusIcon } from '@heroicons/react/24/outline';
import { adminListPrimaryButtonClass } from './admin-list-ui';

interface MarketsCatalogsHeaderProps {
  onCreate: () => void;
}

export default function MarketsCatalogsHeader({ onCreate }: MarketsCatalogsHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <RectangleStackIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Catalogs</h1>
      </div>
      <button type="button" onClick={onCreate} className={adminListPrimaryButtonClass}>
        <PlusIcon className="mr-1.5 h-4 w-4" />
        <span>Create catalog</span>
      </button>
    </div>
  );
}
