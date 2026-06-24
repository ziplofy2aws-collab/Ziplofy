import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';

type Props = {
  children: ReactNode;
  /** Where to send authenticated customers (default: home). */
  redirectTo?: string;
};

/** Blocks login/signup when the customer already has a session. */
export function CheckoutAuthGuestRoute({ children, redirectTo = '/' }: Props) {
  const { user, initializing } = useStorefrontAuth();

  if (initializing) return null;

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
