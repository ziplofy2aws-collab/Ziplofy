import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOnlineStorePreferences } from '../contexts/online-store-preferences.context';
import { useStore } from '../contexts/store.context';

export default function StoreAccessRestrictedBanner() {
  const { activeStoreId } = useStore();
  const { preferences, getByStoreId } = useOnlineStorePreferences();

  useEffect(() => {
    if (!activeStoreId) return;
    void getByStoreId(activeStoreId).catch(() => {
      /* Banner stays hidden when preferences cannot be loaded */
    });
  }, [activeStoreId, getByStoreId]);

  const storePreferences = useMemo(() => {
    if (!activeStoreId || !preferences || preferences.storeId !== activeStoreId) {
      return null;
    }
    return preferences;
  }, [activeStoreId, preferences]);

  if (!storePreferences?.passwordProtectionEnabled) {
    return null;
  }

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="flex gap-3 bg-[#FFEA8A] px-4 py-4 sm:px-5">
        <ExclamationTriangleIcon
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-950"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-amber-950">Store access is restricted</p>
          <p className="mt-0.5 text-[13px] font-normal leading-snug text-amber-950/90">
            Only visitors with the password can access your online store.
          </p>
          <Link
            to="/online-store/preference"
            className="mt-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
          >
            Manage access
          </Link>
        </div>
      </div>
    </div>
  );
}
