import type { ThemeContract } from './contract';

/**
 * Local stub for the Informatic theme package.
 * `remote-themes/` is a gitignored build artifact absent from this checkout —
 * the stub keeps the renderer compiling locally. In environments where the
 * real bundle exists, repoint the `@informatic-theme` alias back to it.
 */
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

const theme: ThemeContract = {
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

export default theme;
