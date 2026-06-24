import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutProfileView } from '@ziplofy/create-theme/checkout/profile/CheckoutProfileView';
import { useCustomerAddresses } from '@/contexts/customer-address-storefront.context';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import { useCheckoutProfilePageAppearance } from '@/hooks/useCheckoutProfilePageAppearance';
import { mapStorefrontUserToCheckoutProfile } from './mapStorefrontUserToCheckoutProfile';

export function CheckoutProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser, loading: authLoading } = useStorefrontAuth();
  const { addresses, fetchCustomerAddressesByCustomerId, loading: addressesLoading } =
    useCustomerAddresses();
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
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    void fetchCustomerAddressesByCustomerId(user._id);
  }, [fetchCustomerAddressesByCustomerId, user?._id]);

  const profile = useMemo(() => {
    if (!user) return null;
    return mapStorefrontUserToCheckoutProfile(user, addresses);
  }, [addresses, user]);

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

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  }, [logout, navigate]);

  if (!user || !profile) return null;

  return (
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
      marketingUpdating={marketingUpdating}
      signingOut={signingOut || authLoading}
      onMarketingToggle={(enabled) => void handleMarketingToggle(enabled)}
      onSignOut={() => void handleSignOut()}
      onSignOutAllDevices={() => void handleSignOut()}
    />
  );
}
