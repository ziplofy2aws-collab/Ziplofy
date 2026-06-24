import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutProfileView } from '@ziplofy/create-theme/checkout/profile/CheckoutProfileView';
import {
  CheckoutProfileAddressModal,
  type CheckoutProfileAddressFormValues,
} from './CheckoutProfileAddressModal';
import { CheckoutProfileEditModal } from './CheckoutProfileEditModal';
import { useCustomerAddresses } from '@/contexts/customer-address-storefront.context';
import type { CustomerAddress } from '@/contexts/customer-address-storefront.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useCheckoutProfilePageAppearance } from '@/hooks/useCheckoutProfilePageAppearance';
import { mapStorefrontUserToCheckoutProfile } from './mapStorefrontUserToCheckoutProfile';

export function CheckoutProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser, loading: authLoading, initializing } = useStorefrontAuth();
  const {
    addresses,
    fetchCustomerAddressesByCustomerId,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    loading: addressesLoading,
  } = useCustomerAddresses();
  const {
    storeId,
    storeName,
    storeUrl,
    theme,
    typography,
    globalLogo,
    headerPosition,
    footerConfig,
    loading: configLoading,
  } = useCheckoutProfilePageAppearance();

  const [marketingUpdating, setMarketingUpdating] = useState(false);
  const [smsMarketingUpdating, setSmsMarketingUpdating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressModal, setAddressModal] = useState<{
    mode: 'add' | 'edit';
    address?: CustomerAddress;
  } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeleting, setAddressDeleting] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    void fetchCustomerAddressesByCustomerId(user._id);
  }, [fetchCustomerAddressesByCustomerId, user?._id]);

  const profile = useMemo(() => {
    if (!user) return null;
    return mapStorefrontUserToCheckoutProfile(user, addresses);
  }, [addresses, user]);

  const accentColor = theme?.buttonColor ?? theme?.accentColor ?? '#005bd3';

  const handleMarketingToggle = useCallback(
    async (enabled: boolean) => {
      if (!user) return;
      setMarketingUpdating(true);
      try {
        await updateUser(user._id, { agreedToMarketingEmails: enabled });
      } finally {
        setMarketingUpdating(false);
      }
    },
    [updateUser, user]
  );

  const handleSmsMarketingToggle = useCallback(
    async (enabled: boolean) => {
      if (!user) return;
      setSmsMarketingUpdating(true);
      try {
        await updateUser(user._id, { agreedToSmsMarketing: enabled });
      } finally {
        setSmsMarketingUpdating(false);
      }
    },
    [updateUser, user]
  );

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  }, [logout, navigate]);

  const handleSaveProfile = useCallback(
    async (payload: { firstName: string; lastName: string; phoneNumber: string }) => {
      if (!user) return;
      setProfileSaving(true);
      try {
        await updateUser(user._id, payload);
        setEditOpen(false);
      } finally {
        setProfileSaving(false);
      }
    },
    [updateUser, user]
  );

  const handleSaveAddress = useCallback(
    async (values: CheckoutProfileAddressFormValues) => {
      if (!user) return;
      setAddressSaving(true);
      try {
        const payload = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          company: values.company.trim() || undefined,
          address: values.address.trim(),
          apartment: values.apartment.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim(),
          pinCode: values.pinCode.trim(),
          phoneNumber: values.phoneNumber.trim(),
          country: values.country.trim() || 'IN',
        };

        let savedAddress: CustomerAddress;
        if (addressModal?.mode === 'edit' && addressModal.address) {
          savedAddress = await updateCustomerAddress(addressModal.address._id, payload);
        } else {
          savedAddress = await addCustomerAddress({
            customerId: user._id,
            ...payload,
          });
        }

        if (values.setAsDefault) {
          await updateUser(user._id, { defaultAddress: savedAddress._id });
        }

        setAddressModal(null);
        await fetchCustomerAddressesByCustomerId(user._id);
      } finally {
        setAddressSaving(false);
      }
    },
    [
      addCustomerAddress,
      addressModal,
      fetchCustomerAddressesByCustomerId,
      updateCustomerAddress,
      updateUser,
      user,
    ]
  );

  const handleDeleteAddress = useCallback(async () => {
    if (!user || !addressModal?.address) return;
    setAddressDeleting(true);
    try {
      const deletedId = addressModal.address._id;
      const wasDefault = user.defaultAddress === deletedId;
      const remaining = addresses.filter((entry) => entry._id !== deletedId);

      await deleteCustomerAddress(deletedId);

      if (wasDefault && remaining.length > 0) {
        await updateUser(user._id, { defaultAddress: remaining[0]._id });
      }

      setAddressModal(null);
      await fetchCustomerAddressesByCustomerId(user._id);
    } finally {
      setAddressDeleting(false);
    }
  }, [
    addressModal,
    addresses,
    deleteCustomerAddress,
    fetchCustomerAddressesByCustomerId,
    updateUser,
    user,
  ]);

  if (initializing || configLoading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading profile…
      </div>
    );
  }

  const editingAddress = addressModal?.address ?? null;
  const editingIsDefault = editingAddress
    ? user.defaultAddress === editingAddress._id
    : false;

  return (
    <>
      <CheckoutProfileView
        mode="live"
        variant="storefront"
        storeId={storeId}
        storeName={storeName}
        storeUrl={storeUrl}
        headerPosition={headerPosition}
        footerConfig={footerConfig}
        logo={globalLogo}
        theme={theme}
        typography={typography}
        profile={profile}
        ordersHref="/my-orders"
        loading={authLoading}
        addressesLoading={addressesLoading}
        marketingUpdating={marketingUpdating}
        smsMarketingUpdating={smsMarketingUpdating}
        signingOut={signingOut || authLoading}
        onEditProfile={() => setEditOpen(true)}
        onAddAddress={() => setAddressModal({ mode: 'add' })}
        onAddressClick={(addressId) => {
          const address = addresses.find((entry) => entry._id === addressId);
          if (!address) return;
          setAddressModal({ mode: 'edit', address });
        }}
        onMarketingToggle={(enabled) => void handleMarketingToggle(enabled)}
        onSmsMarketingToggle={(enabled) => void handleSmsMarketingToggle(enabled)}
        onSignOut={() => void handleSignOut()}
        onSignOutAllDevices={() => void handleSignOut()}
      />

      <CheckoutProfileEditModal
        open={editOpen}
        user={user}
        accentColor={accentColor}
        saving={profileSaving}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

      <CheckoutProfileAddressModal
        open={Boolean(addressModal)}
        mode={addressModal?.mode ?? 'add'}
        address={editingAddress}
        isDefault={editingIsDefault}
        accentColor={accentColor}
        saving={addressSaving}
        deleting={addressDeleting}
        onClose={() => setAddressModal(null)}
        onSave={handleSaveAddress}
        onDelete={addressModal?.mode === 'edit' ? handleDeleteAddress : undefined}
      />
    </>
  );
}
