/**
 * The 15 contract pages — each is a shell around the template's config-driven
 * sections. Dynamic data (blog post, custom page, policy) is read inside the
 * matching section renderers via the sdk-shim providers.
 */
import { PageShell } from '../components/shell';
import { TemplateSections } from '../components/sections';

function makePage(templateId: string) {
  return function InformaticPage() {
    return (
      <PageShell templateId={templateId}>
        <TemplateSections templateId={templateId} />
      </PageShell>
    );
  };
}

export const HomePage = makePage('index');
export const AboutPage = makePage('about');
export const FeaturesPage = makePage('features');
export const PricingPage = makePage('pricing');
export const BlogListPage = makePage('blog_list');
export const BlogPostPage = makePage('blog_post');
export const CustomPage = makePage('page');
export const ContactPage = makePage('contact');
export const FaqPage = makePage('faq');
export const PrivacyPage = makePage('privacy');
export const TermsPage = makePage('terms');
export const ReturnRefundPolicyPage = makePage('return_refund');
export const ContactInformationPolicyPage = makePage('contact_info');
export const SearchPage = makePage('search');
export const NotFoundPage = makePage('404');
