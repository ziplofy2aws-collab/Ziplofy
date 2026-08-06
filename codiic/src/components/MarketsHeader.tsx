import { ChartBarIcon, GlobeAltIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from './admin-list-ui';

interface MarketsHeaderProps {
  onCreateMarket: () => void;
  onGraphView?: () => void;
}

export default function MarketsHeader({ onCreateMarket, onGraphView }: MarketsHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <GlobeAltIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
        <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Markets</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onGraphView && (
          <button type="button" onClick={onGraphView} className={adminListSecondaryButtonClass}>
            <ChartBarIcon className="mr-1.5 h-4 w-4 text-admin-text-secondary" />
            <span>Graph view</span>
          </button>
        )}
        <button type="button" className={adminListPrimaryButtonClass} onClick={onCreateMarket}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          <span>Create market</span>
        </button>
      </div>
    </div>
  );
}
