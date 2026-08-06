import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../../components/admin-list-ui';
import CatalogsEmptyState from '../../components/CatalogsEmptyState';
import CatalogsTable from '../../components/CatalogsTable';
import MarketsCatalogsHeader from '../../components/MarketsCatalogsHeader';
import { useCatalogs } from '../../contexts/catalog.context';
import { useStore } from '../../contexts/store.context';

const MarketsCatalogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { catalogs, getByStoreId, loading } = useCatalogs();
  const { activeStoreId } = useStore();

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getByStoreId]);

  const showEmpty = !loading && catalogs.length === 0;

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <MarketsCatalogsHeader onCreate={() => navigate('/markets/catalogs/new')} />

        <div className={adminListCardClass}>
          {showEmpty ? (
            <CatalogsEmptyState onCreate={() => navigate('/markets/catalogs/new')} />
          ) : (
            <CatalogsTable catalogs={catalogs} onSelect={(id) => navigate(`/markets/catalogs/${id}`)} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about catalogs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketsCatalogsPage;
