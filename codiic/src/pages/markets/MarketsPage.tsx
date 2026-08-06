import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminListCardClass,
  adminListFooterLinkClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '../../components/admin-list-ui';
import MarketsHeader from '../../components/MarketsHeader';
import MarketsList from '../../components/MarketsList';
import MarketsToolbar from '../../components/MarketsToolbar';
import { useMarkets } from '../../contexts/market.context';
import { useStore } from '../../contexts/store.context';

const MarketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { markets, loading, getByStoreId } = useMarkets();
  const { activeStoreId } = useStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (activeStoreId) {
      getByStoreId(activeStoreId);
    }
  }, [activeStoreId, getByStoreId]);

  const onCreateMarket = useCallback(() => {
    navigate('/markets/new');
  }, [navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Hook up search filtering when API/filtering is ready
  }, []);

  return (
    <div className={adminListPageShellClass}>
      <div className={adminListPageInnerClass}>
        <MarketsHeader onCreateMarket={onCreateMarket} />
        <div className={adminListCardClass}>
          <MarketsToolbar searchValue={search} onSearchChange={handleSearchChange} />
          <MarketsList
            markets={markets}
            loading={loading}
            onSelect={(id) => navigate(`/markets/${id}`)}
          />
        </div>
        <div className="py-5 text-center">
          <p className="text-xs text-admin-text-secondary">
            <a href="#" className={adminListFooterLinkClass}>
              Learn more about markets
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
