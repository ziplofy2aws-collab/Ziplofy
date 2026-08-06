import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import { adminListPrimaryButtonClass } from './admin-list-ui';

interface CatalogsEmptyStateProps {
  onCreate: () => void;
}

export default function CatalogsEmptyState({ onCreate }: CatalogsEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center bg-admin-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-admin-fill">
        <DocumentTextIcon className="h-7 w-7 text-admin-text-subdued" aria-hidden />
      </div>
      <p className="text-[15px] font-semibold text-admin-text">Personalize buying with catalogs</p>
      <p className="mt-1.5 max-w-md text-[13px] text-admin-text-secondary">
        Create custom product and pricing offerings for your customers with catalogs.
      </p>
      <div className="mt-6">
        <button type="button" onClick={onCreate} className={adminListPrimaryButtonClass}>
          <PlusIcon className="mr-1.5 h-4 w-4" />
          <span>Create catalog</span>
        </button>
      </div>
    </div>
  );
}
