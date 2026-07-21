import {
  InformationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AddPackageModal from '../../components/AddPackageModal';
import CustomOrderFulfillmentCard from '../../components/CustomOrderFulfillmentCard';
import DeletePackageModal from '../../components/DeletePackageModal';
import DeliveryCustomizationsCard from '../../components/DeliveryCustomizationsCard';
import DeliveryExpectationsCard from '../../components/DeliveryExpectationsCard';
import EditPackageModal from '../../components/EditPackageModal';
import EstimatedDeliveryModal from '../../components/EstimatedDeliveryModal';
import LocalDeliveryCard from '../../components/LocalDeliveryCard';
import LocalDeliverySetupModal from '../../components/LocalDeliverySetupModal';
import OrderRoutingCard from '../../components/OrderRoutingCard';
import PackageMenu from '../../components/PackageMenu';
import PackagesSection from '../../components/PackagesSection';
import PickupInStoreCard from '../../components/PickupInStoreCard';
import RateCalculatorModal from '../../components/RateCalculatorModal';
import ShippingDocumentsCard from '../../components/ShippingDocumentsCard';
import ShippingLabelsCard from '../../components/ShippingLabelsCard';
import ShippingProfilesList from '../../components/ShippingProfilesList';
import SplitShippingModal from '../../components/SplitShippingModal';
import SplitShippingSection from '../../components/SplitShippingSection';
import ThirdPartyRatesCard from '../../components/ThirdPartyRatesCard';
import { useLocalDeliverySettings } from '../../contexts/local-delivery-settings.context';
import { usePackaging } from '../../contexts/packaging.context';
import { useShippingProfiles } from '../../contexts/shipping-profile.context';
import { useStore } from '../../contexts/store.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const ShippingSettings: React.FC = () => {
  const navigate = useNavigate();
  const { packagings, createPackaging, updatePackaging, deletePackaging } = usePackaging();
  const { activeStoreId } = useStore();
  const { shippingProfiles, getShippingProfilesByStoreId } = useShippingProfiles();
  const {
    settings: localDeliverySettings,
    fetchLocalDeliverySettingsByStoreId,
    loading: localDeliveryLoading,
    createLocalDeliverySettings,
  } = useLocalDeliverySettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<{ id: string; name: string } | null>(null);
  const [splitShipping, setSplitShipping] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [splitShippingModalOpen, setSplitShippingModalOpen] = useState(false);
  const [rateCalculatorOpen, setRateCalculatorOpen] = useState(false);
  const [rateShippingFrom, setRateShippingFrom] = useState('shop-location');
  const [rateShippingCountry, setRateShippingCountry] = useState('IN');
  const [rateShippingSearch, setRateShippingSearch] = useState('');
  const [ratePackageId, setRatePackageId] = useState<string | null>(null);
  const [rateWeight, setRateWeight] = useState('1');
  const [rateWeightUnit, setRateWeightUnit] = useState<'lb' | 'kg'>('lb');
  const [estimatedDeliveryModalOpen, setEstimatedDeliveryModalOpen] = useState(false);
  const [estimatedDeliveryMode, setEstimatedDeliveryMode] = useState<'off' | 'manual'>('manual');
  const [estimatedFulfillmentTime, setEstimatedFulfillmentTime] = useState('next-business-day');
  const [estimatedCustomTime, setEstimatedCustomTime] = useState('');
  const [estimatedCustomUnit, setEstimatedCustomUnit] = useState<'business-days' | 'weeks'>('business-days');
  const [isLocalDeliverySetupModalOpen, setIsLocalDeliverySetupModalOpen] = useState(false);
  const [creatingLocalDeliverySettings, setCreatingLocalDeliverySettings] = useState(false);

  const handleLocalDeliveryButtonClick = useCallback(() => {
    if (localDeliveryLoading) return;
    if (localDeliverySettings?._id) {
      navigate(`/settings/shipping-and-delivery/local_deliveries/${localDeliverySettings._id}`);
    } else {
      setIsLocalDeliverySetupModalOpen(true);
    }
  }, [localDeliveryLoading, localDeliverySettings, navigate]);

  const handleConfirmLocalDeliverySetup = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      setCreatingLocalDeliverySettings(true);
      await createLocalDeliverySettings({ storeId: activeStoreId });
      setIsLocalDeliverySetupModalOpen(false);
    } catch (error) {
      console.error('Failed to create local delivery settings:', error);
    } finally {
      setCreatingLocalDeliverySettings(false);
    }
  }, [activeStoreId, createLocalDeliverySettings]);

  const [formData, setFormData] = useState({
    packageName: '',
    packageType: 'box',
    length: '',
    width: '',
    height: '',
    dimensionsUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    isDefault: false,
  });

  const handleAddPackage = useCallback(() => {
    setIsModalOpen(true);
    setFormData({
      packageName: '',
      packageType: 'box',
      length: '',
      width: '',
      height: '',
      dimensionsUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      isDefault: false,
    });
  }, []);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!activeStoreId) return;
    const payload = {
      storeId: activeStoreId,
      packageName: formData.packageName,
      packageType: formData.packageType as 'box' | 'envelope' | 'soft_package',
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: formData.packageType === 'envelope' ? 0 : parseFloat(formData.height),
      dimensionsUnit: formData.dimensionsUnit as 'cm' | 'in',
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit as 'g' | 'kg' | 'oz' | 'lb',
      isDefault: formData.isDefault,
    };
    await createPackaging(payload);
    setIsModalOpen(false);
  }, [activeStoreId, formData, createPackaging]);

  const handleEditPackage = useCallback((id: string) => {
    const pkg = packagings.find(p => p._id === id);
    if (!pkg) return;
    setEditingPackageId(id);
    setFormData({
      packageName: pkg.packageName,
      packageType: pkg.packageType,
      length: String(pkg.length),
      width: String(pkg.width),
      height: String(pkg.height),
      dimensionsUnit: pkg.dimensionsUnit,
      weight: String(pkg.weight),
      weightUnit: pkg.weightUnit,
      isDefault: pkg.isDefault,
    });
    setIsEditModalOpen(true);
  }, [packagings]);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPackageId(null);
  }, []);

  const handleSubmitEdit = useCallback(async () => {
    if (!editingPackageId) return;
    const updateData = {
      packageName: formData.packageName,
      packageType: formData.packageType as 'box' | 'envelope' | 'soft_package',
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: formData.packageType === 'envelope' ? 0 : parseFloat(formData.height),
      dimensionsUnit: formData.dimensionsUnit as 'cm' | 'in',
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit as 'g' | 'kg' | 'oz' | 'lb',
      isDefault: formData.isDefault,
    };
    await updatePackaging(editingPackageId, updateData);
    setIsEditModalOpen(false);
    setEditingPackageId(null);
  }, [editingPackageId, formData, updatePackaging]);

  const handleDeletePackage = useCallback((id: string, name: string) => {
    setPackageToDelete({ id, name });
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!packageToDelete) return;
    await deletePackaging(packageToDelete.id);
    setIsDeleteModalOpen(false);
    setPackageToDelete(null);
  }, [packageToDelete, deletePackaging]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setPackageToDelete(null);
  }, []);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, packageId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPackageId(packageId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedPackageId(null);
  }, []);

  const handleMenuEdit = useCallback(() => {
    if (selectedPackageId) {
      handleEditPackage(selectedPackageId);
      handleMenuClose();
    }
  }, [selectedPackageId, handleEditPackage, handleMenuClose]);

  const handleMenuDelete = useCallback(() => {
    if (selectedPackageId) {
      const pkg = packagings.find((p) => p._id === selectedPackageId);
      if (pkg) {
        handleDeletePackage(selectedPackageId, pkg.packageName);
        handleMenuClose();
      }
    }
  }, [selectedPackageId, packagings, handleDeletePackage, handleMenuClose]);

  // Fetch shipping profiles on mount
  useEffect(() => {
    if (activeStoreId) {
      getShippingProfilesByStoreId(activeStoreId).catch((err) => {
        console.error('Failed to fetch shipping profiles:', err);
      });
      fetchLocalDeliverySettingsByStoreId(activeStoreId).catch((err) => {
        console.error('Failed to fetch local delivery settings:', err);
      });
    }
  }, [activeStoreId, getShippingProfilesByStoreId, fetchLocalDeliverySettingsByStoreId]);

  useEffect(() => {
    if (packagings.length > 0 && !ratePackageId) {
      setRatePackageId(packagings[0]._id);
    }
  }, [packagings, ratePackageId]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Shipping and delivery"
          description="Manage shipping profiles, rates, labels, and delivery options."
        />

        {/* Shipping Section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-semibold text-gray-900">Shipping</h2>
            <InformationCircleIcon className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Manage where you ship and how much you charge
          </p>

          {/* Shipping Profiles List */}
          <ShippingProfilesList profiles={shippingProfiles} />

          <RouterLink
            to="/settings/shipping-and-delivery/profiles/create"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors block mt-4"
          >
            Create a custom profile to set different rates or restrict destinations for specific products
          </RouterLink>

        {/* Split shipping section */}
        <SplitShippingSection
          splitShipping={splitShipping}
          onToggle={() => setSplitShipping((prev) => !prev)}
          onManage={() => setSplitShippingModalOpen(true)}
        />
      </div>

      {/* Split Shipping Modal */}
      <SplitShippingModal
        open={splitShippingModalOpen}
        onClose={() => setSplitShippingModalOpen(false)}
        splitShipping={splitShipping}
        onSplitShippingChange={(checked) => setSplitShipping(checked)}
        onSave={() => setSplitShippingModalOpen(false)}
      />

      {/* Estimated Delivery Modal */}
      <EstimatedDeliveryModal
        open={estimatedDeliveryModalOpen}
        onClose={() => setEstimatedDeliveryModalOpen(false)}
        estimatedDeliveryMode={estimatedDeliveryMode}
        onEstimatedDeliveryModeChange={(mode) => setEstimatedDeliveryMode(mode)}
        estimatedFulfillmentTime={estimatedFulfillmentTime}
        onEstimatedFulfillmentTimeChange={(value) => setEstimatedFulfillmentTime(value)}
        estimatedCustomTime={estimatedCustomTime}
        onEstimatedCustomTimeChange={(value) => setEstimatedCustomTime(value)}
        estimatedCustomUnit={estimatedCustomUnit}
        onEstimatedCustomUnitChange={(value) => setEstimatedCustomUnit(value)}
        onSave={() => setEstimatedDeliveryModalOpen(false)}
      />

      {/* Rate Calculator Modal */}
      <RateCalculatorModal
        open={rateCalculatorOpen}
        onClose={() => setRateCalculatorOpen(false)}
        rateShippingFrom={rateShippingFrom}
        onRateShippingFromChange={(value) => setRateShippingFrom(value)}
        rateShippingSearch={rateShippingSearch}
        onRateShippingSearchChange={(value) => setRateShippingSearch(value)}
        ratePackageId={ratePackageId}
        onRatePackageIdChange={(value) => setRatePackageId(value)}
        rateWeight={rateWeight}
        onRateWeightChange={(value) => setRateWeight(value)}
        rateWeightUnit={rateWeightUnit}
        onRateWeightUnitChange={(value) => setRateWeightUnit(value)}
        packagings={packagings}
      />

      {/* Shipping Labels Section */}
      <ShippingLabelsCard onCalculateRatesClick={() => setRateCalculatorOpen(true)} />

      {/* Delivery Expectations Section */}
      <DeliveryExpectationsCard
        estimatedDeliveryMode={estimatedDeliveryMode}
        onEstimatedDeliveryClick={() => setEstimatedDeliveryModalOpen(true)}
      />

      {/* Order Routing Section */}
      <OrderRoutingCard />

      {/* Local Delivery Section */}
      <LocalDeliveryCard
        loading={localDeliveryLoading}
        creating={creatingLocalDeliverySettings}
        hasSettings={!!localDeliverySettings}
        onButtonClick={handleLocalDeliveryButtonClick}
      />

      {/* Pickup in Store Section */}
      <PickupInStoreCard />

      {/* Delivery Customizations Section */}
      <DeliveryCustomizationsCard />

        {/* Packages Section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-semibold text-gray-900">Packages</h2>
            <InformationCircleIcon className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Used to calculate shipping rates at checkout and pre-selected when buying labels
          </p>

          <PackagesSection
            packages={packagings}
            onMenuOpen={handleMenuOpen}
            onAddPackage={handleAddPackage}
          />

          {packagings.length === 0 && (
            <button
              type="button"
              onClick={handleAddPackage}
              className="flex items-center gap-2 rounded-lg py-2.5 px-3 text-gray-700 hover:bg-gray-50 transition-colors w-full text-sm font-medium border border-gray-200 border-dashed"
            >
              <PlusIcon className="w-4 h-4" />
              Add package
            </button>
          )}
        </div>

      {/* Package Menu */}
      <PackageMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onEdit={handleMenuEdit}
        onDelete={handleMenuDelete}
      />

      {/* Enable third-party calculated rates section */}
      <ThirdPartyRatesCard />

      {/* Shipping documents section */}
      <ShippingDocumentsCard />

      {/* Custom order fulfillment section */}
      <CustomOrderFulfillmentCard />

      {/* Add Package Modal */}
      <AddPackageModal
        open={isModalOpen}
        onClose={handleCloseModal}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />

      {/* Local Delivery Setup Modal */}
      <LocalDeliverySetupModal
        open={isLocalDeliverySetupModalOpen}
        onClose={() => setIsLocalDeliverySetupModalOpen(false)}
        onConfirm={handleConfirmLocalDeliverySetup}
        creating={creatingLocalDeliverySettings}
      />

      {/* Edit Package Modal */}
      <EditPackageModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmitEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeletePackageModal
        open={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        packageName={packageToDelete?.name}
      />
      </div>
    </div>
  );
};

export default ShippingSettings;
