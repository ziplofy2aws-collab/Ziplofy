import type { ComponentType } from 'react';

/**
 * Informatic theme contract — 15 page components the runtime renders per
 * template id. Pages take no props: they read theme config via
 * `useThemeConfig()` (@render-store/sdk) and dynamic data via the providers
 * exported from `./sdk-shim`.
 */
export type ThemeContract = {
  HomePage: ComponentType;
  AboutPage: ComponentType;
  FeaturesPage: ComponentType;
  PricingPage: ComponentType;
  BlogListPage: ComponentType;
  BlogPostPage: ComponentType;
  CustomPage: ComponentType;
  ContactPage: ComponentType;
  FaqPage: ComponentType;
  PrivacyPage: ComponentType;
  TermsPage: ComponentType;
  ReturnRefundPolicyPage: ComponentType;
  ContactInformationPolicyPage: ComponentType;
  SearchPage: ComponentType;
  NotFoundPage: ComponentType;
};
