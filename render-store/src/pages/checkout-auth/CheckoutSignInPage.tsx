import React, { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckoutSignInView } from '@codiic/create-theme/checkout/auth/CheckoutSignInView';
import {
  checkoutAuthLinkStyle,
  resolveCheckoutAuthAccentColor,
} from '@codiic/create-theme/checkout/auth/checkout-auth-styles';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';
import {
  useStorefrontPolicies,
  type StorefrontPolicyType,
} from '@/contexts/storefront-policies.context';
import { StorefrontPolicyModal } from '@/components/policies/StorefrontPolicyModal';
import { useCheckoutAuthPageAppearance } from '@/hooks/useCheckoutAuthPageAppearance';

export function CheckoutSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading } = useStorefrontAuth();
  const { storeId, storeName, signInMain, theme, typography, globalLogo, loading } =
    useCheckoutAuthPageAppearance();
  const { loading: policyLoading, error: policyError, fetchPolicyByType, getPolicyByType } =
    useStorefrontPolicies();

  const locationState = location.state as { email?: string; from?: string } | null;
  const returnTo = locationState?.from ?? '/';
  const [email, setEmail] = useState(locationState?.email ?? '');
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
    if (!storeId || !email.trim() || !password) return;
    try {
      await login({ storeId, email: email.trim(), password });
      navigate(returnTo);
    } catch {
      /* toast from auth context */
    }
  };

  const policyContent = policyType ? getPolicyByType(policyType)?.content ?? null : null;

  return (
    <CheckoutSignInView
      mode="live"
      variant="storefront"
      storeId={storeId}
      storeName={storeName}
      logo={globalLogo}
      typography={typography}
      theme={theme}
      mainConfig={signInMain}
      email={email}
      password={password}
      marketingOptIn={marketingOptIn}
      submitting={authLoading}
      disabled={loading || !storeId}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onMarketingOptInChange={setMarketingOptIn}
      onSubmit={() => void handleSubmit()}
      forgotPasswordLink={
        <Link to="/auth/forgot" className="underline" style={policyLinkStyle}>
          Forgot password?
        </Link>
      }
      signupLink={
        <Link
          to="/auth/signup"
          state={{ from: returnTo }}
          className="font-medium underline"
          style={policyLinkStyle}
        >
          Create account
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
