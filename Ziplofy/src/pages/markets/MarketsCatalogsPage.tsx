import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <div className="mb-6">
          <MarketsCatalogsHeader onCreate={() => navigate('/markets/catalogs/new')} />
        </div>

        {showEmpty ? (
          <CatalogsEmptyState onCreate={() => navigate('/markets/catalogs/new')} />
        ) : (
          <CatalogsTable catalogs={catalogs} onSelect={(id) => navigate(`/markets/catalogs/${id}`)} />
        )}
      </div>
    </div>
  );
};

export default MarketsCatalogsPage;


