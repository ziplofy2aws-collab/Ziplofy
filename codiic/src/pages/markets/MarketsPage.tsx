import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const onCreateMarket = useCallback(()=>{
    navigate("/markets/new")
  },[])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    // Hook up search filtering when API/filtering is ready
  }, []);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <MarketsHeader onCreateMarket={onCreateMarket} />
        <MarketsToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
        <MarketsList
          markets={markets}
          loading={loading}
          onSelect={(id) => navigate(`/markets/${id}`)}
        />
      </div>
    </div>
  );
};

export default MarketsPage;