/**
 * Mirrors `webpanel-store-renderer/src/informatic-stub/contract.ts` — the real
 * package lives in `remote-themes/informatic` (gitignored build artifact that
 * is not materialized in this checkout).
 */
export type ThemeContract = {
  HomePage: React.ComponentType;
  AboutPage: React.ComponentType;
  FeaturesPage: React.ComponentType;
  PricingPage: React.ComponentType;
  BlogListPage: React.ComponentType;
  BlogPostPage: React.ComponentType;
  CustomPage: React.ComponentType;
  ContactPage: React.ComponentType;
  FaqPage: React.ComponentType;
  PrivacyPage: React.ComponentType;
  TermsPage: React.ComponentType;
  ReturnRefundPolicyPage: React.ComponentType;
  ContactInformationPolicyPage: React.ComponentType;
  SearchPage: React.ComponentType;
  NotFoundPage: React.ComponentType;
};
