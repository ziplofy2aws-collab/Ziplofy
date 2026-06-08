import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  EllipsisVerticalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { useCountries } from '../../contexts/country.context';
import { useMarketIncludes } from '../../contexts/market-includes.context';
import { useMarkets } from '../../contexts/market.context';
import { useStore } from '../../contexts/store.context';

const MarketDetailsPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState<'active' | 'draft'>('active');
  const [parentMarketId, setParentMarketId] = React.useState<string | null>(null);
  const { countries, getCountries, loading: countriesLoading } = useCountries();
  const { createItem: createMarketInclude, deleteItem: deleteMarketInclude, getByMarketId: getMarketIncludes, items: marketIncludes, loading: marketIncludesLoading } = useMarketIncludes();
  const { deleteMarket, updateMarket } = useMarkets();
  const { markets, getByStoreId } = useMarkets();
  const { activeStoreId } = useStore();
  const [isIncludesModalOpen, setIncludesModalOpen] = React.useState(false);
  const [selectedCountryId, setSelectedCountryId] = React.useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [isDeleteIncludeModalOpen, setDeleteIncludeModalOpen] = React.useState(false);
  const [includeToDelete, setIncludeToDelete] = React.useState<{ id: string; countryName: string } | null>(null);
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState('');
  const [savingName, setSavingName] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState(false);
  const [statusInput, setStatusInput] = React.useState<'active' | 'draft'>('active');
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const openDeleteModal = () => { setDeleteModalOpen(true); setIsMenuOpen(false); };
  const closeDeleteModal = () => setDeleteModalOpen(false);

  const openIncludesModal = () => {
    setIncludesModalOpen(true);
    getCountries({ limit: 250 }).catch(() => {});
  };
  const closeIncludesModal = () => {
    setIncludesModalOpen(false);
    setSelectedCountryId('');
  };

  // Fetch includes for this market
  React.useEffect(() => {
    if (marketId) {
      getMarketIncludes(marketId).catch(() => {});
    }
  }, [marketId, getMarketIncludes]);

  // Ensure markets are loaded and hydrate local fields from selected market
  const selectedMarket = React.useMemo(() => markets.find(m => m._id === marketId), [markets, marketId]);

  React.useEffect(() => {
    if (!selectedMarket && activeStoreId) {
      getByStoreId(activeStoreId).catch(() => {});
    }
  }, [selectedMarket, activeStoreId, getByStoreId]);

  React.useEffect(() => {
    if (selectedMarket) {
      setName(selectedMarket.name);
      setNameInput(selectedMarket.name);
      setStatus(selectedMarket.status);
      setStatusInput(selectedMarket.status);
      // @ts-ignore optional field if present later
      setParentMarketId((selectedMarket as any).parentMarketId ?? null);
    }
  }, [selectedMarket]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/markets')}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            {!editingName ? (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  aria-label="Edit name"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm"
                />
                <button
                  disabled={savingName || !marketId || !nameInput.trim()}
                  onClick={async () => {
                    if (!marketId || !nameInput.trim()) return;
                    try {
                      setSavingName(true);
                      const updated = await updateMarket(marketId, { name: nameInput.trim() } as any);
                      setName(updated.name);
                      setEditingName(false);
                    } finally {
                      setSavingName(false);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {savingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setNameInput(name);
                    setEditingName(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">Region</span>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {status === 'active' ? 'Active' : 'Draft'}
            </span>
            <div className="flex-1" />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                More actions
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={openDeleteModal}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Delete market
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status Card */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 flex-1">{name}</span>
                  {!editingStatus ? (
                    <div className="flex items-center gap-2">
                      {status === 'active' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">Draft</span>
                      )}
                      <button
                        onClick={() => setEditingStatus(true)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={statusInput}
                          onChange={(e) => setStatusInput(e.target.value as 'active' | 'draft')}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <button
                        disabled={savingStatus || !marketId}
                        onClick={async () => {
                          if (!marketId) return;
                          try {
                            setSavingStatus(true);
                            const updated = await updateMarket(marketId, { status: statusInput } as any);
                            setStatus(updated.status);
                            setEditingStatus(false);
                          } finally {
                            setSavingStatus(false);
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {savingStatus ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setStatusInput(status); setEditingStatus(false); }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

              {/* Includes Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Includes</h3>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {marketIncludesLoading && (
                      <span className="text-sm text-gray-600">Loading...</span>
                    )}
                    {!marketIncludesLoading && marketIncludes.map((inc) => {
                      const populated = typeof (inc as any).countryId === 'object' && (inc as any).countryId !== null;
                      const country = populated ? (inc as any).countryId : countries.find(c => c._id === inc.countryId);
                      const label = country ? `${country.name} (${country.iso2})` : (typeof inc.countryId === 'string' ? inc.countryId : '');
                      return (
                        <div
                          key={inc._id}
                          className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1"
                        >
                          <span className="text-sm text-gray-700">{label}</span>
                          <button
                            onClick={() => {
                              setIncludeToDelete({ id: inc._id, countryName: country ? country.name : label });
                              setDeleteIncludeModalOpen(true);
                            }}
                            className="p-0.5 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                <button
                  onClick={openIncludesModal}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add condition
                </button>
              </div>
            </div>

            {/* Customized */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Customized</h2>
              <p className="text-sm text-gray-600">Create unique configurations for customers in this market</p>
            </div>

            {/* Inherited */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Inherited</h3>
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
                {[
                  ['Currency', '→ Indian Rupee (INR ₹)'],
                  ['Catalogs', '→ All products'],
                  ['Domain / language', '→ example.myziplofy.com • English'],
                  ['Taxes and duties', '→ Not collecting'],
                  ['Online Store', '→ Horizon'],
                ].map((row, i) => (
                  <React.Fragment key={row[0]}>
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 w-40">{row[0]}</span>
                        <span className="text-sm text-gray-600">{row[1]}</span>
                      </div>
                      <button className="p-1.5 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {i < 4 && <div className="border-t border-gray-200" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm min-h-[200px]">
              <div className="w-full h-40 bg-gray-100 rounded-lg" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Parent market</h3>
              <div className="bg-gray-50 px-3 py-2 text-sm text-gray-700 rounded-lg">
                {parentMarketId ? parentMarketId : 'Store default'}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">More Settings for {name}</h3>
              <div className="border border-gray-200 p-4 mb-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Shipping</h4>
                <p className="text-xs text-gray-600">1 rate • Shipping to India</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Customer privacy</h4>
                <p className="text-xs text-gray-600">Cookie banner, Data sharing opt-out</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Add condition modal */}
        {isIncludesModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-gray-500/20 z-[1400]"
              onClick={closeIncludesModal}
            />
            <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Select a country to include</h2>
                  <button
                    onClick={closeIncludesModal}
                    className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <div className="relative">
                      <select
                        value={selectedCountryId}
                        onChange={(e) => setSelectedCountryId(e.target.value)}
                        disabled={countriesLoading}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:bg-gray-50"
                      >
                        <option value="">Select a country</option>
                        {countries.map((c) => (
                          <option key={c._id} value={c._id}>{`${c.name} (${c.iso2})`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={closeIncludesModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedCountryId || !marketId}
                    onClick={async () => {
                      if (!marketId || !selectedCountryId) return;
                      await createMarketInclude({ marketId, countryId: selectedCountryId });
                      closeIncludesModal();
                    }}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete include modal */}
        {isDeleteIncludeModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-gray-500/20 z-[1400]"
              onClick={() => setDeleteIncludeModalOpen(false)}
            />
            <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white w-full max-w-xs rounded-xl border border-gray-200 shadow-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">{`Remove country from ${name}`}</h2>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {`You really want to delete ${includeToDelete?.countryName ?? 'this country'} from ${name}?`}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteIncludeModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    No
                  </button>
                  <button
                    disabled={!includeToDelete}
                    onClick={async () => {
                      if (!includeToDelete) return;
                      await deleteMarketInclude(includeToDelete.id);
                      setDeleteIncludeModalOpen(false);
                      setIncludeToDelete(null);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete market modal */}
        {isDeleteModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-gray-500/20 z-[1400]"
              onClick={closeDeleteModal}
            />
            <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 pointer-events-none">
              <div
                className="bg-white w-full max-w-xs rounded-xl border border-gray-200 shadow-lg pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">{`Delete ${name}?`}</h2>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">{`Your market ${name} will be permanently deleted.`}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!marketId) return;
                      await deleteMarket(marketId);
                      navigate('/markets');
                    }}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default MarketDetailsPage;
