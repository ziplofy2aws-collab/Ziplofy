import { useEffect, useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeConfigProvider } from '@render-store/sdk';
import theme from '@informatic-theme';
import defaultConfig from '../../../../remote-themes/informatic/theme.default-config.json';
import { useStorefront, type StorefrontMeta } from '@/contexts/store.context';
import { InformaticStorefrontContactFormProvider } from '@/contexts/informatic-contact-form.context';
import { InformaticStorefrontLeadGenFormProvider } from '@/contexts/informatic-lead-gen-form.context';
import { useThemeFavicon } from '@/hooks/useThemeFavicon';
import type { ThemeContract } from '@informatic-theme/contract';
import { InformaticBlogListRoute } from '@/components/InformaticBlogListRoute';
import { InformaticBlogPostRoute } from '@/components/InformaticBlogPostRoute';
import { InformaticCustomPageRoute } from '@/components/InformaticCustomPageRoute';
import { InformaticPolicyRoute } from '@/components/InformaticPolicyRoute';
import { InformaticRootCustomPageRoute } from '@/components/InformaticRootCustomPageRoute';

function withStoreBranding(
  base: Record<string, unknown>,
  store: StorefrontMeta
): Record<string, unknown> {
  const next = structuredClone(base) as Record<string, unknown>;
  const sections = (next.sections ?? {}) as Record<string, unknown>;
  const header = (sections.header ?? {}) as Record<string, unknown>;
  const headerBlocks = (header.blocks ?? {}) as Record<string, unknown>;
  const logo = (headerBlocks.logo ?? {}) as Record<string, unknown>;
  const logoSettings = (logo.settings ?? {}) as Record<string, unknown>;
  if (!logoSettings.text || logoSettings.text === 'Informatic') {
    logoSettings.text = store.name || String(logoSettings.text || 'Informatic');
  }
  logo.settings = logoSettings;
  headerBlocks.logo = logo;
  header.blocks = headerBlocks;
  sections.header = header;

  const footer = (sections.footer ?? {}) as Record<string, unknown>;
  const footerBlocks = (footer.blocks ?? {}) as Record<string, unknown>;
  const brand = (footerBlocks.brand ?? {}) as Record<string, unknown>;
  const brandSettings = (brand.settings ?? {}) as Record<string, unknown>;
  if (!brandSettings.title || brandSettings.title === 'Informatic') {
    brandSettings.title = store.name || String(brandSettings.title || 'Informatic');
  }
  if (store.description && !brandSettings.blurb) {
    brandSettings.blurb = store.description;
  }
  brand.settings = brandSettings;
  footerBlocks.brand = brand;
  footer.blocks = footerBlocks;
  sections.footer = footer;
  next.sections = sections;
  return next;
}

function ThemeRoutes({ contract }: { contract: ThemeContract }) {
  const HomePage = contract.HomePage;
  const AboutPage = contract.AboutPage;
  const FeaturesPage = contract.FeaturesPage;
  const PricingPage = contract.PricingPage;
  const BlogListPage = contract.BlogListPage;
  const BlogPostPage = contract.BlogPostPage;
  const CustomPage = contract.CustomPage;
  const ContactPage = contract.ContactPage;
  const FaqPage = contract.FaqPage;
  const PrivacyPage = contract.PrivacyPage;
  const TermsPage = contract.TermsPage;
  const ReturnRefundPolicyPage = contract.ReturnRefundPolicyPage;
  const ContactInformationPolicyPage = contract.ContactInformationPolicyPage;
  const SearchPage = contract.SearchPage;
  const NotFoundPage = contract.NotFoundPage;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={
          <InformaticBlogListRoute>
            <BlogListPage />
          </InformaticBlogListRoute>
        } />
        <Route path="/blogs/all" element={<Navigate to="/blog" replace />} />
        <Route
          path="/blog/:slug"
          element={
            <InformaticBlogPostRoute>
              <BlogPostPage />
            </InformaticBlogPostRoute>
          }
        />
        <Route
          path="/pages/:slug"
          element={
            <InformaticCustomPageRoute>
              <CustomPage />
            </InformaticCustomPageRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route
          path="/privacy"
          element={
            <InformaticPolicyRoute policyType="privacy">
              <PrivacyPage />
            </InformaticPolicyRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <InformaticPolicyRoute policyType="terms">
              <TermsPage />
            </InformaticPolicyRoute>
          }
        />
        <Route
          path="/return-refund"
          element={
            <InformaticPolicyRoute policyType="return-refund">
              <ReturnRefundPolicyPage />
            </InformaticPolicyRoute>
          }
        />
        <Route
          path="/contact-information"
          element={
            <InformaticPolicyRoute policyType="contact">
              <ContactInformationPolicyPage />
            </InformaticPolicyRoute>
          }
        />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/:slug" element={<InformaticRootCustomPageRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function BootFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading theme"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid rgba(17, 24, 39, 0.08)',
          borderTopColor: 'rgba(17, 24, 39, 0.4)',
          animation: 'wp-store-spin 0.7s linear infinite',
          boxSizing: 'border-box',
        }}
      />
      <style>{`@keyframes wp-store-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NoThemeApplied({ store, message }: { store: StorefrontMeta; message?: string | null }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          background: '#fff',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 20, color: '#0f172a' }}>{store.name}</h1>
        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>
          {message ||
            'This store does not have a live Informatic theme yet. Install a theme in the web panel, customize it, and click Save to publish.'}
        </p>
      </div>
    </div>
  );
}

/**
 * Renders the Informatic remote theme for a resolved webpanel store,
 * using saved theme JSON from the applied + installed catalog theme.
 */
export function InformaticStorefront({ store }: { store: StorefrontMeta }) {
  const { themeRuntime, themeRuntimeLoading, themeRuntimeError, themeRuntimeChecked } =
    useStorefront();
  const contract = theme as ThemeContract;

  const config = useMemo(() => {
    if (themeRuntime?.themeConfig) {
      return themeRuntime.themeConfig;
    }
    return withStoreBranding(defaultConfig as Record<string, unknown>, store);
  }, [store, themeRuntime?.themeConfig]);

  useEffect(() => {
    const titleBase = themeRuntime?.themeName || 'Informatic';
    document.title = store.name ? `${store.name} · ${titleBase}` : titleBase;
  }, [store.name, themeRuntime?.themeName]);

  const faviconUrl = String(
    (config as { settings?: { logo?: { faviconUrl?: string } } })?.settings?.logo?.faviconUrl || ''
  ).trim();
  useThemeFavicon(faviconUrl || null);

  if (!themeRuntimeChecked || themeRuntimeLoading) {
    return <BootFallback />;
  }

  if (!themeRuntime?.themeConfig) {
    return <NoThemeApplied store={store} message={themeRuntimeError} />;
  }

  return (
    <ThemeConfigProvider config={config}>
      <InformaticStorefrontContactFormProvider>
        <InformaticStorefrontLeadGenFormProvider>
          <ThemeRoutes contract={contract} />
        </InformaticStorefrontLeadGenFormProvider>
      </InformaticStorefrontContactFormProvider>
    </ThemeConfigProvider>
  );
}
