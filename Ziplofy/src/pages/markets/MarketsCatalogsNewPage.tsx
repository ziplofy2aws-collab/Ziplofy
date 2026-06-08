import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CatalogBasicsSection from '../../components/CatalogBasicsSection';
import CatalogPricingSection from '../../components/CatalogPricingSection';
import { useCatalogs } from '../../contexts/catalog.context';
import { useCurrencies } from '../../contexts/currency.context';
import { useStore } from '../../contexts/store.context';

const MarketsCatalogsNewPage: React.FC = () => {
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [title, setTitle] = useState<string>('');
  const [autoInclude] = useState(true); // keep default behavior
  const [adjustDirection, setAdjustDirection] = useState<'decrease' | 'increase'>('decrease');
  const [includeCompareAt, setIncludeCompareAt] = useState<boolean>(true);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [currencyId, setCurrencyId] = useState<string>('');

  const { currencies, getCurrencies, loading } = useCurrencies();
  const { createCatalog } = useCatalogs();
  const { activeStoreId } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrencies({ limit: 250 })
      .then((list) => {
        if (list && list.length && !currencyId) {
          setCurrencyId(list[0]._id);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = useCallback(async () => {
    if (!activeStoreId || !title || !currencyId) return;
    await createCatalog({
      storeId: activeStoreId,
      title,
      status,
      currencyId,
      priceAdjustment,
      priceAdjustmentSide: adjustDirection,
      includeCompareAtPrice: includeCompareAt,
      autoIncludeNewProducts: autoInclude,
    });
    navigate('/markets/catalogs');
  }, [
    activeStoreId,
    title,
    status,
    currencyId,
    priceAdjustment,
    adjustDirection,
    includeCompareAt,
    autoInclude,
    createCatalog,
    navigate,
  ]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/markets/catalogs')}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">New catalog</h1>
          <p className="mt-1 text-sm text-gray-600">Create a new catalog for your store</p>
        </div>

        <div className="space-y-6">
          <CatalogBasicsSection
            title={title}
            status={status}
            onTitleChange={setTitle}
            onStatusChange={(val) => setStatus(val)}
          />
          <CatalogPricingSection
            currencies={currencies}
            currencyId={currencyId}
            loading={loading}
            onCurrencyChange={setCurrencyId}
            priceAdjustment={priceAdjustment}
            onPriceAdjustmentChange={setPriceAdjustment}
            adjustDirection={adjustDirection}
            onAdjustDirectionChange={setAdjustDirection}
            includeCompareAt={includeCompareAt}
            onIncludeCompareAtChange={setIncludeCompareAt}
          />
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/markets/catalogs')}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!activeStoreId || !title || !currencyId}
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketsCatalogsNewPage;


