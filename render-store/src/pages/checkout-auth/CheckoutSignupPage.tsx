import React, { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckoutSignupView } from '@ziplofy/create-theme/checkout/auth/CheckoutSignupView';
import {
  checkoutAuthLinkStyle,
  resolveCheckoutAuthAccentColor,
} from '@ziplofy/create-theme/checkout/auth/checkout-auth-styles';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import {
  useStorefrontPolicies,
  type StorefrontPolicyType,
} from '@/contexts/storefront-policies.context';
import { StorefrontPolicyModal } from '@/components/policies/StorefrontPolicyModal';
import { useCheckoutAuthPageAppearance } from '@/hooks/useCheckoutAuthPageAppearance';

export function CheckoutSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/';
  const { signup, loading: authLoading } = useStorefrontAuth();
  const { storeId, storeName, signInMain, theme, typography, globalLogo, loading } =
    useCheckoutAuthPageAppearance();
  const { loading: policyLoading, error: policyError, fetchPolicyByType, getPolicyByType } =
    useStorefrontPolicies();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyType, setPolicyType] = useState<StorefrontPolicyType | null>(null);

  const accentColor = resolveCheckoutAuthAccentColor(signInMain, theme);
  const policyLinkStyle = checkoutAuthLinkStyle(accentColor);

  const openPolicy = useCallback(
    async (type: StorefrontPolicyType, title: string) => {
      if (!storeId) return;
      setPolicyType(type);
      setPolicyTitle(title);
      setPolicyOpen(true);
      await fetchPolicyByType(storeId, type);
    },
    [storeId, fetchPolicyByType]
  );

  const handleSubmit = async () => {
    if (!storeId || !firstName.trim() || !lastName.trim() || !email.trim() || !password) return;
    try {
      await signup({
        storeId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      navigate(returnTo);
    } catch {
      /* toast from auth context */
    }
  };

  const policyContent = policyType ? getPolicyByType(policyType)?.content ?? null : null;

  return (
    <CheckoutSignupView
      mode="live"
      variant="storefront"
      storeId={storeId}
      storeName={storeName}
      logo={globalLogo}
      typography={typography}
      theme={theme}
      mainConfig={signInMain}
      firstName={firstName}
      lastName={lastName}
      email={email}
      password={password}
      marketingOptIn={marketingOptIn}
      submitting={authLoading}
      disabled={loading || !storeId}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onMarketingOptInChange={setMarketingOptIn}
      onSubmit={() => void handleSubmit()}
      signInLink={
        <Link to="/auth/login" state={{ from: returnTo }} className="font-medium underline" style={policyLinkStyle}>
          Sign in
        </Link>
      }
      onOpenPolicy={openPolicy}
      policyModal={
        <StorefrontPolicyModal
          open={policyOpen}
          title={policyTitle}
          loading={policyLoading && !policyContent}
          error={policyError}
          content={policyContent}
          onClose={() => {
            setPolicyOpen(false);
            setPolicyType(null);
            setPolicyTitle('');
          }}
        />
      }
    />
  );
}
