import type { ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { CustomThemeTemplatePage } from '@codiic/create-theme/runtime';
import { CheckoutSignInPage } from '@/pages/checkout-auth/CheckoutSignInPage';
import { CheckoutSignupPage } from '@/pages/checkout-auth/CheckoutSignupPage';
import { CheckoutAuthGuestRoute } from '@/components/auth/CheckoutAuthGuestRoute';
import { CheckoutAuthRequiredRoute } from '@/components/auth/CheckoutAuthRequiredRoute';
import { CheckoutOrdersPage } from '@/pages/checkout-profile/CheckoutOrdersPage';
import { CheckoutOrderStatusPage } from '@/pages/checkout-profile/CheckoutOrderStatusPage';
import { CheckoutProfilePage } from '@/pages/checkout-profile/CheckoutProfilePage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { CheckoutThankYouPage } from '@/pages/checkout/CheckoutThankYouPage';
import { listThemePageRouteSpecs } from '@codiic/create-theme/utils/theme-page-registry';
import { StorefrontBlogByUrlHandleLoader } from '../components/StorefrontBlogByUrlHandleLoader.tsx';
import { StorefrontBlogPostByUrlHandleLoader } from '../components/StorefrontBlogPostByUrlHandleLoader.tsx';
import { StorefrontCollectionByUrlHandleLoader } from '../components/StorefrontCollectionByUrlHandleLoader.tsx';
import { StorefrontProductPreviewLoader } from '../components/StorefrontProductPreviewLoader.tsx';

const ROUTE_SPECS = listThemePageRouteSpecs();

/** Auth pages use checkout editor UI — not theme JSON templates. */
const CHECKOUT_AUTH_PATHS = new Set(['/auth/login', '/auth/signup']);
const CHECKOUT_PROFILE_PATHS = new Set(['/my-orders', '/profile']);

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

export function renderCheckoutProfileRoutes(): ReactElement[] {
  return [
    <Route
      key="/my-orders"
      path="/my-orders"
      element={
        <CheckoutAuthRequiredRoute>
          <CheckoutOrdersPage />
        </CheckoutAuthRequiredRoute>
      }
    />,
    <Route
      key="/my-orders/:orderId"
      path="/my-orders/:orderId"
      element={
        <CheckoutAuthRequiredRoute>
          <CheckoutOrderStatusPage />
        </CheckoutAuthRequiredRoute>
      }
    />,
    <Route
      key="/profile"
      path="/profile"
      element={
        <CheckoutAuthRequiredRoute>
          <CheckoutProfilePage />
        </CheckoutAuthRequiredRoute>
      }
    />,
  ];
}

/** @deprecated Use renderCheckoutProfileRoutes */
export function renderCheckoutOrdersRoute(): ReactElement {
  return renderCheckoutProfileRoutes()[0]!;
}

export function renderCheckoutPageRoutes(): ReactElement[] {
  return [
    <Route key="/checkout" path="/checkout" element={<CheckoutPage />} />,
    <Route
      key="/checkout/thank-you"
      path="/checkout/thank-you"
      element={<CheckoutThankYouPage />}
    />,
  ];
}

/** @deprecated Use renderCheckoutPageRoutes */
export function renderCheckoutPageRoute(): ReactElement {
  return renderCheckoutPageRoutes()[0]!;
}

type ThemePageRouteOptions = {
  /** Omit login/signup template routes when checkout auth routes are registered separately. */
  excludeCheckoutAuth?: boolean;
  /** Omit customer account routes that use checkout editor UI. */
  excludeCheckoutProfile?: boolean;
  /**
   * When the editor is on an alternate template (`product.foo`, `blog-posts.bar`),
   * use that config key for matching base routes (`product`, `blog-posts`, …).
   */
  activeTemplateId?: string;
};

function resolveRouteTemplateId(specTemplateId: string, activeTemplateId?: string): string {
  if (!activeTemplateId || activeTemplateId === specTemplateId) return specTemplateId;
  if (activeTemplateId.startsWith(`${specTemplateId}.`)) return activeTemplateId;
  return specTemplateId;
}

/** Direct <Route> children for <Routes> — cannot wrap in a custom component (react-router v6). */
export function renderThemePageRoutes(options?: ThemePageRouteOptions): ReactElement[] {
  const specs = ROUTE_SPECS.filter((spec) => {
    if (options?.excludeCheckoutAuth && CHECKOUT_AUTH_PATHS.has(spec.path)) return false;
    if (options?.excludeCheckoutProfile && CHECKOUT_PROFILE_PATHS.has(spec.path)) return false;
    return true;
  });

  return specs.map((spec) => {
    const templateId = resolveRouteTemplateId(spec.templateId, options?.activeTemplateId);
    const page = (
      <CustomThemeTemplatePage
        templateId={templateId}
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
