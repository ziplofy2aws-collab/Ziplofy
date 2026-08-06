import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { dashboardCardShell } from './dashboard-ui';

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
    <div className={`${dashboardCardShell} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-semibold text-admin-text">Customize your domain</h3>
        {subError ? (
          <p className="mt-1 text-[13px] text-red-600">{subError}</p>
        ) : (
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Default domain:{' '}
            {subLoading ? (
              <span className="text-admin-text-subdued">Loading…</span>
            ) : storeSubdomain?.url ? (
              <a
                href={storeSubdomain.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-admin-text underline decoration-admin-border underline-offset-2 transition-colors hover:text-[#005bd3]"
              >
                {storeSubdomain.url.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span className="text-admin-text-subdued">—</span>
            )}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleManageClick}
        className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] sm:w-auto"
      >
        Manage
      </button>
    </div>
  );
};

export default CustomizeDomainCard;
