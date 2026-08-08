import { ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { adminListCardClass } from './admin-list-ui';

export default function StoreAssetsSection() {
  const navigate = useNavigate();

  return (
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">Store assets</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Manage metadata and brand assets used across your store.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border divide-y divide-admin-divider">
        <button
          onClick={() => navigate('/settings/general/metafields')}
          className="flex w-full items-center gap-3 bg-admin-surface px-4 py-3 text-left transition-colors hover:bg-admin-row-hover"
        >
          <TagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Metafields</p>
            <p className="truncate text-[13px] text-admin-text-secondary">
              Available in themes and configurable for Storefront API
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-admin-text-subdued" />
        </button>

        <button
          onClick={() => navigate('/settings/general/branding')}
          className="flex w-full items-center gap-3 bg-admin-surface px-4 py-3 text-left transition-colors hover:bg-admin-row-hover"
        >
          <TagIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Brand</p>
            <p className="truncate text-[13px] text-admin-text-secondary">
              Integrate brand assets across sales channels, themes, and apps
            </p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-admin-text-subdued" />
        </button>
      </div>
    </div>
  );
}
