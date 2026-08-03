import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BasicInformationSection from '../components/customer/BasicInformationSection';
import CustomerAddressesSection from '../components/customer/CustomerAddressesSection';
import CustomerNotesSection from '../components/customer/CustomerNotesSection';
import CustomerTagsSection from '../components/customer/CustomerTagsSection';
import CustomerTimelineSection from '../components/customer/CustomerTimelineSection';
import MarketingPreferencesSection from '../components/customer/MarketingPreferencesSection';
import TaxSettingsSection from '../components/customer/TaxSettingsSection';
import AddCustomerAddressModal from '../components/customer/AddCustomerAddressModal';
import CustomerAddedBanner from '../components/customers/CustomerAddedBanner';
import CustomerFormHeader from '../components/customers/CustomerFormHeader';
import CustomerFormPageSkeleton from '../components/customers/CustomerFormPageSkeleton';
import { formatCustomerName } from '../components/customers/customer-ui.util';
import type { CreateCustomerAddressRequest } from '../contexts/customer-address.context';
import { useCustomerAddresses } from '../contexts/customer-address.context';
import { useCustomerTags } from '../contexts/customer-tags.context';
import { useCustomers } from '../contexts/customer.context';
import { useStore } from '../contexts/store.context';
import { useCustomerEditForm } from '../hooks/useCustomerEditForm';
import { readCustomerJustCreated } from '../utils/customer-navigation.util';

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    customers,
    activeCustomer,
    activeCustomerLoading,
    fetchCustomerById,
    clearActiveCustomer,
    error: customersError,
  } = useCustomers();
  const { customerTags, fetchCustomerTags, addCustomerTag } = useCustomerTags();
  const { addCustomerAddress, fetchCustomerAddressesByCustomerId } = useCustomerAddresses();

  const customerJustCreatedOnMount = useRef(readCustomerJustCreated(location.state));
  const previousCustomerIdRef = useRef(id);
  const [showCustomerAddedBanner, setShowCustomerAddedBanner] = useState(
    () => customerJustCreatedOnMount.current
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const customer = useMemo(() => {
    if (activeCustomer?._id === id) return activeCustomer;
    return customers.find((c) => c._id === id) ?? activeCustomer;
  }, [activeCustomer, customers, id]);

  const {
    formData,
    selectedTagIds,
    setSelectedTagIds,
    handleInputChange,
    handleSave,
    isDirty,
    loading: saving,
    error: saveError,
  } = useCustomerEditForm(customer, id);

  const customerName = customer
    ? formatCustomerName(customer.firstName, customer.lastName)
    : 'Customer';

  useEffect(() => {
    if (id) {
      fetchCustomerById(id).catch(() => {});
    }
    return () => {
      clearActiveCustomer();
    };
  }, [id, fetchCustomerById, clearActiveCustomer]);

  useEffect(() => {
    if (activeStoreId) fetchCustomerTags(activeStoreId);
  }, [activeStoreId, fetchCustomerTags]);

  useEffect(() => {
    if (customerJustCreatedOnMount.current) {
      customerJustCreatedOnMount.current = false;
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (previousCustomerIdRef.current !== id) {
      previousCustomerIdRef.current = id;
      setShowCustomerAddedBanner(false);
    }
  }, [id]);

  const handleCancel = useCallback(() => {
    navigate('/customers');
  }, [navigate]);

  const handleSubmit = useCallback(async () => {
    try {
      await handleSave();
    } catch (err) {
      console.error('Error saving customer:', err);
    }
  }, [handleSave]);

  const handleTagSelect = useCallback(
    (tagId: string) => {
      setSelectedTagIds((prev) => {
        if (prev.includes(tagId)) {
          return prev.filter((tid) => tid !== tagId);
        }
        return [...prev, tagId];
      });
    },
    [setSelectedTagIds]
  );

  const handleCreateTag = useCallback(
    async (name: string) => {
      if (!activeStoreId || !name.trim()) return;
      const created = await addCustomerTag(activeStoreId, name);
      setSelectedTagIds((prev) => [...new Set([...prev, created._id])]);
    },
    [activeStoreId, addCustomerTag, setSelectedTagIds]
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      setSelectedTagIds((prev) => prev.filter((tid) => tid !== tagId));
    },
    [setSelectedTagIds]
  );

  const handleSaveAddress = useCallback(
    async (data: CreateCustomerAddressRequest) => {
      if (!id) return;
      await addCustomerAddress(data);
      setIsAddressModalOpen(false);
      fetchCustomerAddressesByCustomerId(id);
    },
    [id, addCustomerAddress, fetchCustomerAddressesByCustomerId]
  );

  const handleDismissCustomerAddedBanner = useCallback(() => {
    setShowCustomerAddedBanner(false);
  }, []);

  const handleAddAnotherCustomer = useCallback(() => {
    navigate('/customers/new');
  }, [navigate]);

  const displayError = saveError || customersError;

  if (activeCustomerLoading && !customer) {
    return <CustomerFormPageSkeleton />;
  }

  if (!customer || !formData) {
    return (
      <div className="min-h-screen bg-page-background-color">
        <div className="mx-auto max-w-[900px] px-3 py-4 sm:px-4">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 flex items-center gap-2 text-sm font-normal text-gray-400 transition-colors hover:text-gray-600"
          >
            Back to customers
          </button>
          <p className="text-[13px] text-gray-500">Customer not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[900px] px-3 py-4 sm:px-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {showCustomerAddedBanner ? (
            <CustomerAddedBanner
              customerName={customerName}
              onDismiss={handleDismissCustomerAddedBanner}
              onAddAnother={handleAddAnotherCustomer}
            />
          ) : null}

          <CustomerFormHeader
            mode="edit"
            title={customerName}
            onBack={handleCancel}
            onCancel={handleCancel}
            onSubmit={() => void handleSubmit()}
            submitLabel={saving ? 'Saving…' : 'Save customer'}
            submitDisabled={!isDirty || saving}
          />

          <BasicInformationSection
            data={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              language: formData.language,
            }}
            onChange={handleInputChange}
          />
          <MarketingPreferencesSection
            data={{
              agreedToMarketingEmails: formData.agreedToMarketingEmails,
              agreedToSmsMarketing: formData.agreedToSmsMarketing,
            }}
            onChange={handleInputChange}
          />
          <TaxSettingsSection
            data={{
              collectTax: formData.taxSettings.collectTax,
            }}
            onChange={handleInputChange}
          />
          <CustomerNotesSection
            notes={formData.notes}
            onChange={(notes) => handleInputChange('notes', notes)}
          />
          <CustomerTagsSection
            selectedTagIds={selectedTagIds}
            customerTags={customerTags}
            onTagSelect={handleTagSelect}
            onTagRemove={handleRemoveTag}
            onCreateTag={handleCreateTag}
            activeStoreId={activeStoreId || undefined}
          />

          {id ? (
            <CustomerAddressesSection
              customerId={id}
              onAddAddress={() => setIsAddressModalOpen(true)}
            />
          ) : null}
          {id ? <CustomerTimelineSection customerId={id} /> : null}

          {displayError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[13px] text-red-600">{displayError}</p>
            </div>
          ) : null}
        </form>

        {id ? (
          <AddCustomerAddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onSubmit={handleSaveAddress}
            customerId={id}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
