import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStorefrontAuth } from '@/contexts/storefront-auth.context';

type Props = {
  children: ReactNode;
  redirectTo?: string;
};

/** Customer account pages that require a signed-in session. */
export function CheckoutAuthRequiredRoute({ children, redirectTo = '/auth/login' }: Props) {
  const { user, initializing } = useStorefrontAuth();
  const location = useLocation();

  if (initializing) return null;

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
