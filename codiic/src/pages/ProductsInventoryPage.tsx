import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import InventoryPageFilters from '../components/inventory/InventoryPageFilters';
import InventoryPageHeader from '../components/inventory/InventoryPageHeader';
import InventoryTable from '../components/inventory/InventoryTable';
import InventoryUnavailablePopover from '../components/inventory/InventoryUnavailablePopover';
import { useInventoryLevels } from '../contexts/inventory-level.contexts';
import { useLocations } from '../contexts/location.context';
import { useStore } from '../contexts/store.context';

const ProductsInventoryPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const { locations, fetchLocationsByStoreId, loading: locationsLoading } = useLocations();
  const { inventoryLevels, fetchByLocation, updateById, loading: invLoading } = useInventoryLevels();
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unavailAnchorEl, setUnavailAnchorEl] = useState<HTMLElement | null>(null);
  const [unavailLevelId, setUnavailLevelId] = useState<string | null>(null);
  const [editUnavailable, setEditUnavailable] = useState<{
    damaged: number;
    qualityControl: number;
    safetyStock: number;
    other: number;
  } | null>(null);
  const [savingUnavailable, setSavingUnavailable] = useState(false);
  const [editingAvailableId, setEditingAvailableId] = useState<string | null>(null);
  const [editAvailableValue, setEditAvailableValue] = useState<number>(0);
  const [savingAvailable, setSavingAvailable] = useState(false);
  const [editingOnHandId, setEditingOnHandId] = useState<string | null>(null);
  const [editOnHandValue, setEditOnHandValue] = useState<number>(0);
  const [savingOnHand, setSavingOnHand] = useState(false);

  useEffect(() => {
    if (activeStoreId) {
      fetchLocationsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchLocationsByStoreId]);

  useEffect(() => {
    if (selectedLocationId) {
      fetchByLocation(selectedLocationId);
    }
  }, [selectedLocationId, fetchByLocation]);

  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      const defaultLoc = locations.find((location) => location.isDefault) || locations[0];
      if (defaultLoc?._id) {
        setSelectedLocationId(defaultLoc._id);
      }
    }
  }, [locations, selectedLocationId]);

  const filteredLevels = useMemo(() => {
    if (!searchQuery.trim()) return inventoryLevels;
    const query = searchQuery.toLowerCase();
    return inventoryLevels.filter(
      (level) =>
        level.variantId.sku.toLowerCase().includes(query) ||
        (level.variantId.productId.title || '').toLowerCase().includes(query)
    );
  }, [searchQuery, inventoryLevels]);

  const openUnavailableMenu = useCallback(
    (event: MouseEvent<HTMLElement>, levelId: string) => {
      setUnavailAnchorEl(event.currentTarget);
      setUnavailLevelId(levelId);
      const level = inventoryLevels.find((item) => item._id === levelId);
      setEditUnavailable(
        level
          ? { ...level.unavailable }
          : { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 }
      );
    },
    [inventoryLevels]
  );

  const closeUnavailableMenu = useCallback(() => {
    setUnavailAnchorEl(null);
    setUnavailLevelId(null);
    setEditUnavailable(null);
  }, []);

  const handleUnavailableChange = useCallback(
    (key: 'damaged' | 'qualityControl' | 'safetyStock' | 'other', value: string) => {
      const nextValue = Math.max(0, Number(value) || 0);
      setEditUnavailable((prev) => (prev ? { ...prev, [key]: nextValue } : prev));
    },
    []
  );

  const saveUnavailable = useCallback(async () => {
    if (!unavailLevelId || !editUnavailable) return;
    try {
      setSavingUnavailable(true);
      const level = inventoryLevels.find((item) => item._id === unavailLevelId);
      const currentCommitted = level?.committed ?? 0;
      const currentOnHand = level?.onHand ?? 0;
      const unavailTotal =
        (editUnavailable.damaged || 0) +
        (editUnavailable.qualityControl || 0) +
        (editUnavailable.safetyStock || 0) +
        (editUnavailable.other || 0);
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
      const level = inventoryLevels.find((item) => item._id === editingAvailableId);
      const currentCommitted = level?.committed ?? 0;
      const unavail = level?.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
      const unavailTotal =
        (unavail.damaged || 0) +
        (unavail.qualityControl || 0) +
        (unavail.safetyStock || 0) +
        (unavail.other || 0);
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
      const level = inventoryLevels.find((item) => item._id === editingOnHandId);
      const currentCommitted = level?.committed ?? 0;
      const unavail = level?.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
      const unavailTotal =
        (unavail.damaged || 0) +
        (unavail.qualityControl || 0) +
        (unavail.safetyStock || 0) +
        (unavail.other || 0);
      const nextOnHand = Math.max(0, editOnHandValue || 0);
      const computedAvailable = Math.max(0, nextOnHand - currentCommitted - unavailTotal);
      await updateById(editingOnHandId, { onHand: nextOnHand, available: computedAvailable });
      setEditingOnHandId(null);
    } finally {
      setSavingOnHand(false);
    }
  }, [editingOnHandId, editOnHandValue, inventoryLevels, updateById]);

  const showLocationsSkeleton = Boolean(activeStoreId) && !selectedLocationId && locationsLoading;
  const showInventorySkeleton = Boolean(selectedLocationId) && invLoading;

  const tableEditProps = {
    editingAvailableId,
    editAvailableValue,
    savingAvailable,
    onStartEditAvailable: startEditAvailable,
    onCancelEditAvailable: cancelEditAvailable,
    onSaveAvailable: saveAvailable,
    onEditAvailableChange: setEditAvailableValue,
    editingOnHandId,
    editOnHandValue,
    savingOnHand,
    onStartEditOnHand: startEditOnHand,
    onCancelEditOnHand: cancelEditOnHand,
    onSaveOnHand: saveOnHand,
    onEditOnHandChange: setEditOnHandValue,
    onOpenUnavailable: openUnavailableMenu,
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
        <InventoryPageHeader />

        <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
          <InventoryPageFilters
            locations={locations}
            selectedLocationId={selectedLocationId}
            onLocationChange={setSelectedLocationId}
            search={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {showLocationsSkeleton || showInventorySkeleton ? (
            <InventoryTable levels={[]} loading {...tableEditProps} />
          ) : !selectedLocationId ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-gray-900">Add a location to view inventory</p>
              <p className="mt-1.5 text-[13px] font-normal text-gray-500">
                Create a location in settings to start tracking inventory levels
              </p>
            </div>
          ) : (
            <InventoryTable levels={filteredLevels} {...tableEditProps} />
          )}
        </div>

        <div className="py-5 text-center">
          <p className="text-xs text-gray-500">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Learn more about managing inventory
            </a>
          </p>
        </div>
      </div>

      {unavailAnchorEl && editUnavailable ? (
        <InventoryUnavailablePopover
          anchorEl={unavailAnchorEl}
          values={editUnavailable}
          saving={savingUnavailable}
          onChange={handleUnavailableChange}
          onCancel={closeUnavailableMenu}
          onSave={() => void saveUnavailable()}
        />
      ) : null}
    </div>
  );
};

export default ProductsInventoryPage;
