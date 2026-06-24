import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@ziplofy/create-theme/runtime';
import { CheckoutSignInPage } from '@/pages/checkout-auth/CheckoutSignInPage';
import { CheckoutSignupPage } from '@/pages/checkout-auth/CheckoutSignupPage';
import { CheckoutAuthGuestRoute } from '@/components/auth/CheckoutAuthGuestRoute';
import { listThemePageRouteSpecs } from '@ziplofy/create-theme/utils/theme-page-registry';
import { StorefrontBlogByUrlHandleLoader } from '../components/StorefrontBlogByUrlHandleLoader.tsx';
import { StorefrontBlogPostByUrlHandleLoader } from '../components/StorefrontBlogPostByUrlHandleLoader.tsx';
import { StorefrontCollectionByUrlHandleLoader } from '../components/StorefrontCollectionByUrlHandleLoader.tsx';
import { StorefrontProductPreviewLoader } from '../components/StorefrontProductPreviewLoader.tsx';

const ROUTE_SPECS = listThemePageRouteSpecs();

/** Auth pages use checkout editor UI — not theme JSON templates. */
const CHECKOUT_AUTH_PATHS = new Set(['/auth/login', '/auth/signup']);

export function renderCheckoutAuthRoutes(): ReactElement[] {
  return [
    <Route
      key="/auth/login"
      path="/auth/login"
      element={
        <CheckoutAuthGuestRoute>
          <CheckoutSignInPage />
        </CheckoutAuthGuestRoute>
      }
    />,
    <Route
      key="/auth/signup"
      path="/auth/signup"
      element={
        <CheckoutAuthGuestRoute>
          <CheckoutSignupPage />
        </CheckoutAuthGuestRoute>
      }
    />,
  ];
}

type ThemePageRouteOptions = {
  /** Omit login/signup template routes when checkout auth routes are registered separately. */
  excludeCheckoutAuth?: boolean;
};

/** Direct <Route> children for <Routes> — cannot wrap in a custom component (react-router v6). */
export function renderThemePageRoutes(options?: ThemePageRouteOptions): ReactElement[] {
  const specs = options?.excludeCheckoutAuth
    ? ROUTE_SPECS.filter((spec) => !CHECKOUT_AUTH_PATHS.has(spec.path))
    : ROUTE_SPECS;

  return specs.map((spec) => {
    const page = (
      <CustomThemeTemplatePage
        templateId={spec.templateId}
        fallbackSectionIds={spec.fallbackSectionIds}
      />
    );
    let element = page;
    if (spec.withBlogLoader) {
      element = (
        <>
          <StorefrontBlogByUrlHandleLoader />
          {element}
        </>
      );
    } else if (spec.withBlogPostLoader) {
      element = (
        <>
          <StorefrontBlogPostByUrlHandleLoader />
          {element}
        </>
      );
    }
    if (spec.withCollectionLoader) {
      element = (
        <>
          <StorefrontCollectionByUrlHandleLoader urlHandleOverride={spec.loadCollectionUrlHandle} />
          {page}
        </>
      );
    }
    if (spec.withProductLoader) {
      element = (
        <>
          <StorefrontProductPreviewLoader />
          {element}
        </>
      );
    }
    return <Route key={spec.path} path={spec.path} element={element} />;
  });
}
