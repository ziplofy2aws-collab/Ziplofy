/**
 * Local stub of the Informatic theme contract — `remote-themes/informatic` is
 * a gitignored build artifact absent from this checkout. Mirrors
 * `webpanel-store-renderer/src/informatic-stub/index.tsx`. When the real theme
 * bundle is materialized, repoint the `@informatic-theme` alias in
 * next.config.mjs back to `remote-themes/informatic/src`.
 */
import type { ThemeContract } from './contract';

function StubPage() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#64748b',
        padding: 24,
        textAlign: 'center',
      }}
    >
      Informatic theme files are not available in this checkout.
    </div>
  );
}

export const informaticThemeContract: ThemeContract = {
  HomePage: StubPage,
  AboutPage: StubPage,
  FeaturesPage: StubPage,
  PricingPage: StubPage,
  BlogListPage: StubPage,
  BlogPostPage: StubPage,
  CustomPage: StubPage,
  ContactPage: StubPage,
  FaqPage: StubPage,
  PrivacyPage: StubPage,
  TermsPage: StubPage,
  ReturnRefundPolicyPage: StubPage,
  ContactInformationPolicyPage: StubPage,
  SearchPage: StubPage,
  NotFoundPage: StubPage,
};

export default informaticThemeContract;
