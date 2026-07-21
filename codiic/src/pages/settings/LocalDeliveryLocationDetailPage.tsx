import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  MapPinIcon,
  Squares2X2Icon,
  PlusIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import { useLocations } from '../../contexts/location.context';
import { useStore } from '../../contexts/store.context';

interface DeliveryZone {
  id: string;
  name: string;
  radius: number;
  unit: 'km' | 'mi';
  postalCodes: number;
  minOrder: number | null;
  price: number;
  hasDeliveryInfo: boolean;
}

const LocalDeliveryLocationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { localDeliveryId, locationId } = useParams<{ localDeliveryId?: string; locationId: string }>();
  const { locations, fetchLocationsByStoreId, updateLocation, loading } = useLocations();
  const { activeStoreId } = useStore();
  const [canLocalDeliver, setCanLocalDeliver] = useState<boolean>(false);
  const [deliveryZoneType, setDeliveryZoneType] = useState<'pin-codes' | 'radius'>('radius');
  const [includeNeighboringStates, setIncludeNeighboringStates] = useState<boolean>(false);
  const [radiusUnit, setRadiusUnit] = useState<'km' | 'mi'>('km');
  const [zoneMenuAnchor, setZoneMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedZoneForMenu, setSelectedZoneForMenu] = useState<DeliveryZone | null>(null);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [newZoneName, setNewZoneName] = useState('Local Delivery');
  const [newZoneRadiusMax, setNewZoneRadiusMax] = useState<string>('');
  const [newZoneMinOrderPrice, setNewZoneMinOrderPrice] = useState<string>('0');
  const [newZoneDeliveryPrice, setNewZoneDeliveryPrice] = useState<string>('0');
  const [newZoneDeliveryInfo, setNewZoneDeliveryInfo] = useState('');
  const [showConditionalPricing, setShowConditionalPricing] = useState(false);
  const [conditionalMinOrder, setConditionalMinOrder] = useState<string>('0');
  const [conditionalMaxOrder, setConditionalMaxOrder] = useState<string>('');
  const [conditionalDeliveryPrice, setConditionalDeliveryPrice] = useState<string>('0');
  const [deleteZoneDialogOpen, setDeleteZoneDialogOpen] = useState(false);
  const [zonePendingDelete, setZonePendingDelete] = useState<DeliveryZone | null>(null);

  const location = locations.find((loc) => loc._id === locationId);

  // Mock delivery zones data - replace with actual data from API/context
  const deliveryZones: DeliveryZone[] = [
    {
      id: '1',
      name: 'Local Delivery',
      radius: 10,
      unit: 'km',
      postalCodes: 0,
      minOrder: null,
      price: 0,
      hasDeliveryInfo: false,
    },
  ];

  const resetZoneForm = () => {
    setNewZoneName('Local Delivery');
    setNewZoneRadiusMax('');
    setNewZoneMinOrderPrice('0');
    setNewZoneDeliveryPrice('0');
    setNewZoneDeliveryInfo('');
    setShowConditionalPricing(false);
    setConditionalMinOrder('0');
    setConditionalMaxOrder('');
    setConditionalDeliveryPrice('0');
  };

  const handleOpenZoneModal = (zone?: DeliveryZone) => {
    if (zone) {
      setEditingZone(zone);
      setNewZoneName(zone.name);
      setNewZoneRadiusMax(String(zone.radius));
      setNewZoneMinOrderPrice(zone.minOrder ? String(zone.minOrder) : '0');
      setNewZoneDeliveryPrice(String(zone.price));
      setShowConditionalPricing(false);
      setConditionalMinOrder('0');
      setConditionalMaxOrder('');
      setConditionalDeliveryPrice('0');
      // Placeholder: would populate conditional data when backend available
    } else {
      setEditingZone(null);
      resetZoneForm();
    }
    setIsZoneModalOpen(true);
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalOpen(false);
    setEditingZone(null);
    resetZoneForm();
  };

  const handleSaveZone = () => {
    // TODO: wire up with API once backend ready
    handleCloseZoneModal();
  };

  useEffect(() => {
    if (activeStoreId && locationId) {
      // Fetch if locations list is empty or if the specific location is not found
      const locationExists = locations.some((loc) => loc._id === locationId);
      if (!locations.length || !locationExists) {
        fetchLocationsByStoreId(activeStoreId);
      }
    }
  }, [activeStoreId, locationId, locations, fetchLocationsByStoreId]);

  useEffect(() => {
    if (location) {
      setCanLocalDeliver(location.canLocalDeliver);
    }
  }, [location]);

  const handleToggleLocalDelivery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setCanLocalDeliver(newValue);
    
    if (locationId) {
      try {
        await updateLocation(locationId, { canLocalDeliver: newValue });
      } catch (error) {
        // Revert on error
        setCanLocalDeliver(!newValue);
      }
    }
  };

  if (!location) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <p className="text-sm text-gray-900">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-4">
          <button
            onClick={() =>
              navigate(
                localDeliveryId
                  ? `/settings/shipping-and-delivery/local_deliveries/${localDeliveryId}`
                  : '/settings/shipping-and-delivery'
              )
            }
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <TruckIcon className="w-5 h-5 text-gray-700" />
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          <h1 className="text-xl font-medium text-gray-900">
            Local delivery for {location.name}
          </h1>
        </div>

        {/* Location status section */}
        <div className="border border-gray-200 bg-white/95 p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-sm font-medium text-gray-900 mb-1">
                Location status
              </h2>
              <p className="text-sm text-gray-600">
                Deliver orders to customers directly from this location.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={canLocalDeliver}
                onChange={handleToggleLocalDelivery}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>

          {/* Location details card */}
          <div className="border border-gray-200 p-3 bg-gray-50 mb-3">
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {location.name}
                </p>
                <p className="text-xs text-gray-600">
                  {location.countryRegion || 'No country specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Currency section - only shown when toggle is on */}
          {canLocalDeliver && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                Delivery prices for this location are in Indian rupees (INR).{' '}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle change currency
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Change Currency
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Delivery zones section - only shown when toggle is on */}
        {canLocalDeliver && (
          <div className="border border-gray-200 bg-white/95 p-4 mb-4">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Delivery zones
            </h2>

            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="pin-codes"
                  checked={deliveryZoneType === 'pin-codes'}
                  onChange={(e) => setDeliveryZoneType(e.target.value as 'pin-codes' | 'radius')}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Use PIN codes
                  </p>
                  <p className="text-xs text-gray-600">
                    Choose specific areas that you deliver to
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="radius"
                  checked={deliveryZoneType === 'radius'}
                  onChange={(e) => setDeliveryZoneType(e.target.value as 'pin-codes' | 'radius')}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Set a delivery radius
                  </p>
                  <p className="text-xs text-gray-600">
                    Set a distance around your location that you deliver to
                  </p>
                </div>
              </label>
            </div>

            {deliveryZoneType === 'radius' && (
              <div className="mb-4 ml-7">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={includeNeighboringStates}
                    onChange={(e) => setIncludeNeighboringStates(e.target.checked)}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
                  />
                  <span className="text-sm text-gray-700">Include neighboring states or regions</span>
                </label>

                <p className="text-sm font-medium text-gray-900 mb-2">
                  Measure radius in
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="km"
                      checked={radiusUnit === 'km'}
                      onChange={(e) => setRadiusUnit(e.target.value as 'km' | 'mi')}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
                    />
                    <span className="text-sm text-gray-700">km</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="mi"
                      checked={radiusUnit === 'mi'}
                      onChange={(e) => setRadiusUnit(e.target.value as 'km' | 'mi')}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
                    />
                    <span className="text-sm text-gray-700">mi</span>
                  </label>
                </div>
              </div>
            )}

            {/* Delivery zones list */}
            <div className="space-y-3 mb-4">
              {deliveryZones.map((zone) => (
                <div
                  key={zone.id}
                  className="border border-gray-200 p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {zone.name}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {deliveryZoneType === 'pin-codes'
                          ? `${zone.postalCodes} postal codes • ${zone.hasDeliveryInfo ? 'Has delivery information' : 'No delivery information'}`
                          : `Up to ${zone.radius}${zone.unit} • ${zone.hasDeliveryInfo ? 'Has delivery information' : 'No delivery information'}`}
                      </p>
                      {deliveryZoneType === 'pin-codes' && zone.postalCodes === 0 && (
                        <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs flex items-start gap-2">
                          <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Postal codes required to activate this delivery zone</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600">
                        {zone.minOrder ? `Minimum order: ${zone.minOrder}` : 'No minimum order'}
                      </p>
                      {zone.price === 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                          Free
                        </span>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            setZoneMenuAnchor(e.currentTarget);
                            setSelectedZoneForMenu(zone);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                        {zoneMenuAnchor && selectedZoneForMenu?.id === zone.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 z-10 min-w-[150px]">
                            <button
                              onClick={() => {
                                if (selectedZoneForMenu) {
                                  handleOpenZoneModal(selectedZoneForMenu);
                                }
                                setZoneMenuAnchor(null);
                                setSelectedZoneForMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Edit zone
                            </button>
                            <button
                              onClick={() => {
                                if (selectedZoneForMenu) {
                                  setZonePendingDelete(selectedZoneForMenu);
                                  setDeleteZoneDialogOpen(true);
                                }
                                setZoneMenuAnchor(null);
                                setSelectedZoneForMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-gray-50 transition-colors"
                            >
                              Delete zone
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleOpenZoneModal()}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add zone
            </button>
          </div>
        )}

        {/* Manage local deliveries section */}
        <div className="border border-gray-200 bg-white/95 p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-1">
            Manage local deliveries
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Get an optimized route or plan the order of delivery stops yourself. With local delivery apps, you and your staff can view routes, contact customers, update delivery statuses, and more.
          </p>

          <div className="border border-gray-200 p-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Squares2X2Icon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                Recommended local delivery apps
              </p>
            </div>
            <button
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-white transition-colors"
            >
              View apps
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Zone Modal */}
      <Modal
        open={isZoneModalOpen}
        onClose={handleCloseZoneModal}
        maxWidth="sm"
        title={editingZone ? 'Edit zone' : 'Add zone'}
        actions={
          <>
            <button
              onClick={handleCloseZoneModal}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveZone}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {editingZone ? 'Save changes' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Zone name
            </p>
            <input
              type="text"
              value={newZoneName}
              placeholder="Local Delivery"
              maxLength={50}
              onChange={(e) => setNewZoneName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <p className="text-xs text-gray-600 text-right mt-1">
              {newZoneName.length}/50
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Delivery radius from <strong>10</strong> {radiusUnit} up to
            </p>
            <div className="relative">
              <input
                type="number"
                value={newZoneRadiusMax}
                onChange={(e) => setNewZoneRadiusMax(e.target.value)}
                className="w-full px-3 py-1.5 pr-12 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">{radiusUnit}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Minimum order price
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                <input
                  type="number"
                  value={newZoneMinOrderPrice}
                  onChange={(e) => setNewZoneMinOrderPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Delivery price
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                <input
                  type={showConditionalPricing ? 'text' : 'number'}
                  disabled={showConditionalPricing}
                  value={showConditionalPricing ? '' : newZoneDeliveryPrice}
                  onChange={(e) => setNewZoneDeliveryPrice(e.target.value)}
                  placeholder={showConditionalPricing ? 'Conditional' : undefined}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {!showConditionalPricing && Number(newZoneDeliveryPrice || 0) === 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                  Free
                </span>
              )}
            </div>
          </div>

          {!showConditionalPricing ? (
            <button
              onClick={() => setShowConditionalPricing(true)}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Add conditional pricing
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowConditionalPricing(false);
                  setConditionalMinOrder('0');
                  setConditionalMaxOrder('');
                  setConditionalDeliveryPrice('0');
                }}
                className="text-xs text-gray-600 hover:text-gray-900 underline"
              >
                Remove conditional pricing
              </button>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Orders from ₹0.00 up to
                </p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                    <input
                      type="number"
                      value={conditionalMinOrder}
                      onChange={(e) => setConditionalMinOrder(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                    <input
                      type="number"
                      value={conditionalMaxOrder}
                      onChange={(e) => setConditionalMaxOrder(e.target.value)}
                      placeholder="No limit"
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Delivery price
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                    <input
                      type="number"
                      value={conditionalDeliveryPrice}
                      onChange={(e) => setConditionalDeliveryPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  {Number(conditionalDeliveryPrice || 0) === 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                      Free
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Delivery information
            </p>
            <textarea
              value={newZoneDeliveryInfo}
              onChange={(e) => setNewZoneDeliveryInfo(e.target.value)}
              maxLength={255}
              placeholder="This message will appear at checkout..."
              rows={4}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
            />
            <p className="text-xs text-gray-600 text-right mt-1">
              {newZoneDeliveryInfo.length}/255
            </p>
            <p className="text-xs text-gray-600 mt-2">
              This message will appear at checkout and in the{' '}
              <button
                onClick={(e) => e.preventDefault()}
                className="text-xs text-gray-600 hover:text-gray-900 underline"
              >
                order confirmation notification
              </button>
              .
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Zone Modal */}
      <Modal
        open={deleteZoneDialogOpen}
        onClose={() => setDeleteZoneDialogOpen(false)}
        maxWidth="sm"
        title="Delete zone"
        actions={
          <>
            <button
              onClick={() => setDeleteZoneDialogOpen(false)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                // TODO: integrate delete mutation
                setDeleteZoneDialogOpen(false);
                setZonePendingDelete(null);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Yes
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-900">
          Are you sure you want to delete{' '}
          <strong>{zonePendingDelete?.name ?? 'this zone'}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default LocalDeliveryLocationDetailPage;

