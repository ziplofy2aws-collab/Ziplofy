import {
  ArrowPathIcon,
  CubeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useInventoryLevels } from '../contexts/inventory-level.contexts';
import { useLocations } from '../contexts/location.context';
import { useStore } from '../contexts/store.context';

const ProductsInventoryPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const { locations, fetchLocationsByStoreId } = useLocations();
  const { inventoryLevels, fetchByLocation, updateById, loading: invLoading } = useInventoryLevels();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unavailAnchorEl, setUnavailAnchorEl] = useState<null | HTMLElement>(null);
  const [unavailLevelId, setUnavailLevelId] = useState<string | null>(null);
  const [editUnavailable, setEditUnavailable] = useState<{ damaged: number; qualityControl: number; safetyStock: number; other: number } | null>(null);
  const [savingUnavailable, setSavingUnavailable] = useState(false);
  const [editingAvailableId, setEditingAvailableId] = useState<string | null>(null);
  const [editAvailableValue, setEditAvailableValue] = useState<number>(0);
  const [savingAvailable, setSavingAvailable] = useState(false);
  const [editingOnHandId, setEditingOnHandId] = useState<string | null>(null);
  const [editOnHandValue, setEditOnHandValue] = useState<number>(0);
  const [savingOnHand, setSavingOnHand] = useState(false);

  // Fetch locations on mount/store change
  useEffect(() => {
    if (activeStoreId) {
      fetchLocationsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchLocationsByStoreId]);

  // Fetch inventory levels when a location is selected
  useEffect(() => {
    if (selectedLocationId) {
      fetchByLocation(selectedLocationId);
    }
  }, [selectedLocationId, fetchByLocation]);

  // Auto-select default location (or first) when locations load
  useEffect(() => {
    if (!selectedLocationId && locations && locations.length > 0) {
      const defaultLoc = locations.find((l: any) => l.isDefault) || locations[0];
      if (defaultLoc?._id) {
        setSelectedLocationId(defaultLoc._id);
      }
    }
  }, [locations, selectedLocationId]);

  // Filter inventory levels based on search query (by SKU or product title)
  const filteredLevels = useMemo(() => {
    if (!searchQuery.trim()) return inventoryLevels;
    const q = searchQuery.toLowerCase();
    return inventoryLevels.filter(lvl =>
      lvl.variantId.sku.toLowerCase().includes(q) ||
      (lvl.variantId.productId.title || '').toLowerCase().includes(q)
    );
  }, [searchQuery, inventoryLevels]);

  const handleLocationChange = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedLocationId) {
      fetchByLocation(selectedLocationId);
    }
  }, [selectedLocationId, fetchByLocation]);

  const openUnavailableMenu = useCallback((e: MouseEvent<HTMLElement>, levelId: string) => {
    setUnavailAnchorEl(e.currentTarget);
    setUnavailLevelId(levelId);
    const lvl = inventoryLevels.find(l => l._id === levelId);
    if (lvl) {
      setEditUnavailable({ ...lvl.unavailable });
    } else {
      setEditUnavailable({ damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 });
    }
  }, [inventoryLevels]);

  const closeUnavailableMenu = useCallback(() => {
    setUnavailAnchorEl(null);
    setUnavailLevelId(null);
    setEditUnavailable(null);
  }, []);

  const handleUnavailableChange = useCallback((key: 'damaged' | 'qualityControl' | 'safetyStock' | 'other', value: string) => {
    const n = Math.max(0, Number(value) || 0);
    setEditUnavailable(prev => (prev ? { ...prev, [key]: n } : prev));
  }, []);

  const saveUnavailable = useCallback(async () => {
    if (!unavailLevelId || !editUnavailable) return;
    try {
      setSavingUnavailable(true);
      // Ziplofy-style math: available = onHand - committed - unavailableTotal
      const lvl = inventoryLevels.find(l => l._id === unavailLevelId);
      const currentCommitted = lvl?.committed ?? 0;
      const currentOnHand = lvl?.onHand ?? 0;
      const unavailTotal = (editUnavailable.damaged || 0) + (editUnavailable.qualityControl || 0) + (editUnavailable.safetyStock || 0) + (editUnavailable.other || 0);
      const computedAvailable = Math.max(0, currentOnHand - currentCommitted - unavailTotal);
      await updateById(unavailLevelId, { unavailable: editUnavailable, available: computedAvailable });
      closeUnavailableMenu();
    } finally {
      setSavingUnavailable(false);
    }
  }, [unavailLevelId, editUnavailable, inventoryLevels, updateById, closeUnavailableMenu]);

  const startEditAvailable = useCallback((levelId: string, current: number) => {
    setEditingAvailableId(levelId);
    setEditAvailableValue(current ?? 0);
  }, []);

  const cancelEditAvailable = useCallback(() => {
    setEditingAvailableId(null);
  }, []);

  const saveAvailable = useCallback(async () => {
    if (!editingAvailableId) return;
    try {
      setSavingAvailable(true);
      // Ziplofy-style math: onHand = available + committed + unavailableTotal
      const lvl = inventoryLevels.find(l => l._id === editingAvailableId);
      const currentCommitted = lvl?.committed ?? 0;
      const unavail = lvl?.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
      const unavailTotal = (unavail.damaged || 0) + (unavail.qualityControl || 0) + (unavail.safetyStock || 0) + (unavail.other || 0);
      const nextAvailable = Math.max(0, editAvailableValue || 0);
      const computedOnHand = Math.max(0, nextAvailable + currentCommitted + unavailTotal);
      await updateById(editingAvailableId, { available: nextAvailable, onHand: computedOnHand });
      setEditingAvailableId(null);
    } finally {
      setSavingAvailable(false);
    }
  }, [editingAvailableId, editAvailableValue, inventoryLevels, updateById]);

  const startEditOnHand = useCallback((levelId: string, current: number) => {
    setEditingOnHandId(levelId);
    setEditOnHandValue(current ?? 0);
  }, []);

  const cancelEditOnHand = useCallback(() => {
    setEditingOnHandId(null);
  }, []);

  const saveOnHand = useCallback(async () => {
    if (!editingOnHandId) return;
    try {
      setSavingOnHand(true);
      // Ziplofy-style math: available = onHand - committed - unavailableTotal
      const lvl = inventoryLevels.find(l => l._id === editingOnHandId);
      const currentCommitted = lvl?.committed ?? 0;
      const unavail = lvl?.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
      const unavailTotal = (unavail.damaged || 0) + (unavail.qualityControl || 0) + (unavail.safetyStock || 0) + (unavail.other || 0);
      const nextOnHand = Math.max(0, editOnHandValue || 0);
      const computedAvailable = Math.max(0, nextOnHand - currentCommitted - unavailTotal);
      await updateById(editingOnHandId, { onHand: nextOnHand, available: computedAvailable });
      setEditingOnHandId(null);
    } finally {
      setSavingOnHand(false);
    }
  }, [editingOnHandId, editOnHandValue, inventoryLevels, updateById]);

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="pl-3 border-l-4 border-blue-500/60">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage inventory levels by location</p>
          </div>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200/80 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition-colors"
            onClick={handleRefresh}
            disabled={!selectedLocationId || invLoading}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory by Location
            </h2>
          </div>
          <div className="p-5">
          {/* Location Selection */}
          <div className="flex gap-4 mb-4 items-center">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name} - {location.city}, {location.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Filters */}
          {selectedLocationId && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by SKU or product title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <FunnelIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Inventory Table */}
          {selectedLocationId ? (
            invLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
              </div>
            ) : filteredLevels.length > 0 ? (
              <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Unavailable</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Committed</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Incoming</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Available</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">On Hand</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredLevels.map((lvl) => {
                      const unavailableTotal = lvl.unavailable.damaged + lvl.unavailable.qualityControl + lvl.unavailable.safetyStock + lvl.unavailable.other;
                      const optionSummary = Object.values(lvl.variantId.optionValues || {}).join(' / ');
                      return (
                        <tr key={lvl._id} className="hover:bg-blue-50/50 group">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={lvl.variantId.images?.[0] || lvl.variantId.productId.imageUrls?.[0] || undefined}
                                alt={lvl.variantId.productId.title}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{lvl.variantId.productId.title}</p>
                                <p className="text-xs text-gray-600">{optionSummary}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{lvl.variantId.sku}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 relative">
                              <span className="text-sm font-medium text-gray-700">{unavailableTotal}</span>
                              <button
                                aria-label="unavailable details"
                                onClick={(e) => openUnavailableMenu(e, lvl._id)}
                                className="ml-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <FunnelIcon className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{lvl.committed}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">{lvl.incoming ?? 0}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {editingAvailableId === lvl._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editAvailableValue}
                                  onChange={(e) => setEditAvailableValue(Number(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                />
                                <button
                                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                  onClick={cancelEditAvailable}
                                  disabled={savingAvailable}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  onClick={saveAvailable}
                                  disabled={savingAvailable}
                                >
                                  {savingAvailable ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                    lvl.available > 0
                                      ? 'bg-green-50 text-green-700 border border-green-200/80'
                                      : 'bg-red-50 text-red-700 border border-red-200/80'
                                  }`}
                                >
                                  {lvl.available}
                                </span>
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                  onClick={() => startEditAvailable(lvl._id, lvl.available)}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {editingOnHandId === lvl._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={editOnHandValue}
                                  onChange={(e) => setEditOnHandValue(Number(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                />
                                <button
                                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                  onClick={cancelEditOnHand}
                                  disabled={savingOnHand}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  onClick={saveOnHand}
                                  disabled={savingOnHand}
                                >
                                  {savingOnHand ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">{lvl.onHand}</span>
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                  onClick={() => startEditOnHand(lvl._id, lvl.onHand)}
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Unavailable breakdown menu */}
              {unavailAnchorEl && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeUnavailableMenu}
                  ></div>
                  <div
                    className="fixed z-50 mt-2 bg-white border border-gray-200/80 rounded-xl shadow-lg"
                    style={{
                      top: unavailAnchorEl.getBoundingClientRect().bottom + window.scrollY + 4,
                      left: unavailAnchorEl.getBoundingClientRect().left + window.scrollX,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="px-3 pt-2 pb-2">
                    <p className="text-xs font-medium text-gray-700">
                      Unavailable inventory
                    </p>
                  </div>
                  <div className="border-t border-gray-200"></div>
                  {editUnavailable && (
                    <div className="min-w-[240px] py-2">
                      <div className="px-3 py-2 flex items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors">
                        <span className="text-sm text-gray-700">Damaged</span>
                        <input
                          type="number"
                          min="0"
                          value={editUnavailable.damaged}
                          onChange={(e) => handleUnavailableChange('damaged', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors">
                        <span className="text-sm text-gray-700">Quality Control</span>
                        <input
                          type="number"
                          min="0"
                          value={editUnavailable.qualityControl}
                          onChange={(e) => handleUnavailableChange('qualityControl', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors">
                        <span className="text-sm text-gray-700">Safety Stock</span>
                        <input
                          type="number"
                          min="0"
                          value={editUnavailable.safetyStock}
                          onChange={(e) => handleUnavailableChange('safetyStock', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between gap-4 hover:bg-blue-50/50 transition-colors">
                        <span className="text-sm text-gray-700">Other</span>
                        <input
                          type="number"
                          min="0"
                          value={editUnavailable.other}
                          onChange={(e) => handleUnavailableChange('other', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="flex justify-end gap-2 px-3 pb-2 pt-2">
                        <button
                          className="px-2 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          onClick={closeUnavailableMenu}
                          disabled={savingUnavailable}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          onClick={saveUnavailable}
                          disabled={savingUnavailable}
                        >
                          {savingUnavailable ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </>
              )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No items match your search.' : 'No inventory found for this location.'}
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <CubeIcon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Select a location to view inventory
              </h3>
              <p className="text-sm text-gray-500">
                Choose a location from the dropdown above to see inventory levels.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsInventoryPage;
