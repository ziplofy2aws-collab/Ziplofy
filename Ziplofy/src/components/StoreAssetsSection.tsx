import { ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function StoreAssetsSection() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Store assets</h2>
        <p className="mt-1 text-sm text-gray-500">Manage metadata and brand assets used across your store.</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => navigate('/settings/general/metafields')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <TagIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Metafields</p>
            <p className="text-sm text-gray-500 truncate">Available in themes and configurable for Storefront API</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        <button
          onClick={() => navigate('/settings/general/branding')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <TagIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Brand</p>
            <p className="text-sm text-gray-500 truncate">Integrate brand assets across sales channels, themes, and apps</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </div>
    </div>
  );
}

