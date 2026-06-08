import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';

const cardShell =
  'flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-dashboard-card transition-shadow duration-200 hover:shadow-dashboard-card-hover sm:flex-row sm:items-center sm:justify-between';

const CustomizeDomainCard: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { storeSubdomain, getByStoreId, loading: subLoading, error: subError } = useStoreSubdomain();

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId);
    }
  }, [activeStoreId, getByStoreId]);

  const handleManageClick = useCallback(() => {
    navigate('/settings/domains');
  }, [navigate]);

  return (
    <div className={cardShell}>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-slate-900">Customize your domain</h3>
        {subError ? (
          <p className="mt-1 text-sm text-red-600">{subError}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">
            Default domain:{' '}
            {subLoading ? (
              <span className="text-slate-400">Loading…</span>
            ) : storeSubdomain?.url ? (
              <a
                href={storeSubdomain.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-blue-600"
              >
                {storeSubdomain.url.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleManageClick}
        className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
      >
        Manage
      </button>
    </div>
  );
};

export default CustomizeDomainCard;
