/**
 * Section renderers — one per `section.type` in the informatic schema.
 * Sections/blocks read values from their own settings only; the editor writes
 * to the same paths, so every rendered field is editor-editable.
 */
import { useState, type ComponentType, type ReactNode } from 'react';
import { useThemeConfig, useStorefrontContactForm, type ThemeConfig } from '@render-store/sdk';
import {
  buttonStyle,
  cfg,
  cfgStr,
  getSection,
  humanize,
  looksLikeHtml,
  orderedBlocks,
  sectionStyle,
  type Section,
} from '../lib/theme-utils';
import {
  useInformaticBlogList,
  useInformaticBlogPost,
  useInformaticCustomPage,
  useInformaticStorePolicy,
  type InformaticBlogListPostData,
} from '../sdk-shim';
import { Node, SmartLink } from './shell';

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

function SectionWrap({
  templateId,
  sectionId,
  section,
  className = '',
  children,
}: {
  templateId: string;
  sectionId: string;
  section: Section;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`inf-section ${className}`}
      style={sectionStyle(section)}
      data-informatic-node={`templates.${templateId}.sections.${sectionId}`}
      data-informatic-label={str(section.settings?.heading) || humanize(section.type || sectionId)}
    >
      {children}
    </section>
  );
}

function BlockWrap({
  templateId,
  sectionId,
  blockId,
  label,
  className = '',
  children,
}: {
  templateId: string;
  sectionId: string;
  blockId: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      data-informatic-node={`templates.${templateId}.sections.${sectionId}.blocks.${blockId}`}
      data-informatic-label={label || humanize(blockId)}
    >
      {children}
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return text ? <p className="inf-eyebrow">{text}</p> : null;
}

function CtaButtons({
  config,
  settings,
  className = 'inf-cta-row',
}: {
  config: ThemeConfig;
  settings: Record<string, unknown>;
  className?: string;
}) {
  const pLabel = str(settings.primaryLabel);
  const sLabel = str(settings.secondaryLabel);
  if (!pLabel && !sLabel) return null;
  return (
    <div className={className}>
      {pLabel ? (
        <SmartLink
          href={str(settings.primaryUrl) || '#'}
          className="inf-btn"
          style={buttonStyle(config, 'primary', settings)}
        >
          {pLabel}
        </SmartLink>
      ) : null}
      {sLabel ? (
        <SmartLink
          href={str(settings.secondaryUrl) || '#'}
          className="inf-btn"
          style={buttonStyle(config, 'secondary', settings)}
        >
          {sLabel}
        </SmartLink>
      ) : null}
    </div>
  );
}

/** Text body — plain text renders pre-wrapped; HTML markup renders as markup. */
export function RichBody({ value, className = 'inf-rich' }: { value: string; className?: string }) {
  if (!value) return null;
  if (looksLikeHtml(value)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
  }
  return (
    <div className={className}>
      {value.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section renderers                                                   */
/* ------------------------------------------------------------------ */

function HeroSection({ templateId, sectionId, section, config }: SectionProps) {
  const s = section.settings ?? {};
  const img = str(s.mediaImageUrl);
  if (str(s.variant) === 'background') {
    return (
      <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-hero inf-hero--bg">
        {img ? <img className="inf-hero__bg-img" src={img} alt="" /> : null}
        <div className="inf-hero__overlay" aria-hidden />
        <div className="inf-container inf-hero__content">
          <Eyebrow text={str(s.eyebrow)} />
          <h1 className="inf-hero__heading">{str(s.heading)}</h1>
          <p className="inf-hero__sub">{str(s.subheading)}</p>
          <CtaButtons config={config} settings={s} />
          {str(s.badge) ? <p className="inf-hero__badge">{str(s.badge)}</p> : null}
        </div>
      </SectionWrap>
    );
  }
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-hero">
      <div className="inf-container inf-hero__grid">
        <div>
          <Eyebrow text={str(s.eyebrow)} />
          <h1 className="inf-hero__heading">{str(s.heading)}</h1>
          <p className="inf-hero__sub">{str(s.subheading)}</p>
          <CtaButtons config={config} settings={s} />
          {str(s.badge) ? <p className="inf-hero__badge">{str(s.badge)}</p> : null}
        </div>
        {img ? (
          <div className="inf-hero__media">
            <img src={img} alt={str(s.mediaLabel) || str(s.heading)} />
          </div>
        ) : (
          <div className="inf-hero__media inf-hero__media--empty">
            <span>{str(s.mediaLabel) || 'Hero image'}</span>
          </div>
        )}
      </div>
    </SectionWrap>
  );
}

function LogoCloudSection({ templateId, sectionId, section }: SectionProps) {
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-logo-cloud">
      <div className="inf-container">
        <Eyebrow text={str(section.settings?.eyebrow)} />
        <div className="inf-logo-cloud__row">
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} className="inf-logo-cloud__item">
              {str(b.settings?.name)}
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function FeaturesGridSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-features">
      <div className="inf-container">
        <Eyebrow text={str(s.eyebrow)} />
        <h2 className="inf-h2">{str(s.heading)}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        <div className="inf-features__grid">
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.title) || 'Feature'} className="inf-card">
              {str(b.settings?.mediaImageUrl) ? (
                <img className="inf-card__img" src={str(b.settings?.mediaImageUrl)} alt={str(b.settings?.title)} />
              ) : null}
              {str(b.settings?.icon) ? <span className="inf-card__icon">{str(b.settings?.icon)}</span> : null}
              <h3 className="inf-card__title">{str(b.settings?.title)}</h3>
              <p className="inf-card__body">{str(b.settings?.body)}</p>
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function SplitFeatureSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  const points = [s.point1, s.point2, s.point3].map(str).filter(Boolean);
  const reversed = s.layout === 'reversed';
  const img = str(s.mediaImageUrl);
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-split">
      <div className={`inf-container inf-split__grid${reversed ? ' inf-split__grid--reversed' : ''}`}>
        <div>
          <Eyebrow text={str(s.eyebrow)} />
          <h2 className="inf-h2">{str(s.heading)}</h2>
          <RichBody value={str(s.body)} className="inf-sub" />
          {points.length ? (
            <ul className="inf-split__points">
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {img ? (
          <div className="inf-split__media">
            <img src={img} alt={str(s.mediaLabel) || str(s.heading)} />
          </div>
        ) : (
          <div className="inf-split__media inf-split__media--empty">
            <span>{str(s.mediaLabel) || 'Image'}</span>
          </div>
        )}
      </div>
    </SectionWrap>
  );
}

function StatsBandSection({ templateId, sectionId, section }: SectionProps) {
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-stats">
      <div className="inf-container inf-stats__row">
        {orderedBlocks(section).map(([bid, b]) => (
          <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.label) || 'Stat'} className="inf-stat">
            <div className="inf-stat__value">{str(b.settings?.value)}</div>
            <div className="inf-stat__label">{str(b.settings?.label)}</div>
          </BlockWrap>
        ))}
      </div>
    </SectionWrap>
  );
}

function TestimonialsSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-testimonials">
      <div className="inf-container">
        <Eyebrow text={str(s.eyebrow)} />
        <h2 className="inf-h2">{str(s.heading)}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        <div className="inf-testimonials__grid">
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.name) || 'Testimonial'} className="inf-quote">
              <p className="inf-quote__text">“{str(b.settings?.quote)}”</p>
              <div className="inf-quote__meta">
                {str(b.settings?.avatarImageUrl) ? (
                  <img src={str(b.settings?.avatarImageUrl)} alt={str(b.settings?.name)} />
                ) : null}
                <div>
                  <div className="inf-quote__name">{str(b.settings?.name)}</div>
                  <div className="inf-quote__role">{str(b.settings?.role)}</div>
                </div>
              </div>
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function MediaGallerySection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-gallery">
      <div className="inf-container">
        <Eyebrow text={str(s.eyebrow)} />
        <h2 className="inf-h2">{str(s.heading)}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        <div className="inf-gallery__grid">
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.title) || 'Gallery item'} className="inf-gallery__item">
              {str(b.settings?.mediaImageUrl) ? (
                <img src={str(b.settings?.mediaImageUrl)} alt={str(b.settings?.title)} />
              ) : (
                <div className="inf-gallery__placeholder">{str(b.settings?.title) || 'Image'}</div>
              )}
              {str(b.settings?.title) ? <div className="inf-gallery__title">{str(b.settings?.title)}</div> : null}
              {str(b.settings?.caption) ? <div className="inf-gallery__caption">{str(b.settings?.caption)}</div> : null}
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function CtaBandSection({ templateId, sectionId, section, config }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-cta">
      <div className="inf-container inf-cta__inner">
        <Eyebrow text={str(s.eyebrow)} />
        <h2 className="inf-h2">{str(s.heading)}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        <CtaButtons config={config} settings={s} className="inf-cta-row inf-cta-row--center" />
      </div>
    </SectionWrap>
  );
}

function RichTextSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-richtext">
      <div className="inf-container inf-richtext__inner">
        {str(s.heading) ? <h2 className="inf-h2">{str(s.heading)}</h2> : null}
        <RichBody value={str(s.body)} />
      </div>
    </SectionWrap>
  );
}

function FaqSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-faq">
      <div className="inf-container inf-faq__inner">
        <h2 className="inf-h2">{str(s.heading) || 'Frequently asked questions'}</h2>
        <div>
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.question) || 'Question'}>
              <details className="inf-faq__item">
                <summary>{str(b.settings?.question)}</summary>
                <RichBody value={str(b.settings?.answer)} className="inf-faq__answer" />
              </details>
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function PricingSection({ templateId, sectionId, section, config }: SectionProps) {
  const s = section.settings ?? {};
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-pricing">
      <div className="inf-container">
        <h2 className="inf-h2">{str(s.heading)}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        <div className="inf-pricing__grid">
          {orderedBlocks(section).map(([bid, b]) => (
            <BlockWrap key={bid} templateId={templateId} sectionId={sectionId} blockId={bid} label={str(b.settings?.name) || 'Plan'} className="inf-plan">
              <h3 className="inf-plan__name">{str(b.settings?.name)}</h3>
              <div className="inf-plan__price">{str(b.settings?.price)}</div>
              <RichBody value={str(b.settings?.blurb)} className="inf-plan__blurb" />
              {str(b.settings?.ctaLabel) ? (
                <SmartLink
                  href={str(b.settings?.ctaUrl) || '#'}
                  className="inf-btn inf-plan__cta"
                  style={buttonStyle(config, 'primary', b.settings, 'cta')}
                >
                  {str(b.settings?.ctaLabel)}
                </SmartLink>
              ) : null}
            </BlockWrap>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function ContactSection({ templateId, sectionId, section, config }: SectionProps) {
  const s = section.settings ?? {};
  const contactForm = useStorefrontContactForm() as unknown as {
    submit?: (p: { name: string; email: string; phone?: string; message: string }) => Promise<{ ok: boolean; message?: string }>;
    submitContactForm?: (p: { name: string; email: string; phone?: string; message: string }) => Promise<{ ok: boolean; message?: string }>;
    submitting: boolean;
  };
  const submit = contactForm.submit ?? contactForm.submitContactForm;
  const submitting = contactForm.submitting;
  const [status, setStatus] = useState<string | null>(null);
  const contact = cfg<Record<string, string>>(config, 'settings.contact', {});
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-contact">
      <div className="inf-container inf-contact__grid">
        <div>
          <h2 className="inf-h2">{str(s.heading) || contact.title || 'Contact us'}</h2>
          {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
          <ul className="inf-contact__details">
            {contact.email ? <li>{contact.email}</li> : null}
            {contact.phone ? <li>{contact.phone}</li> : null}
            {contact.address ? <li>{contact.address}</li> : null}
          </ul>
        </div>
        <form
          className="inf-contact__form"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (!submit) {
              setStatus('Contact form unavailable');
              return;
            }
            void submit({
              name: String(fd.get('name') || ''),
              email: String(fd.get('email') || ''),
              phone: String(fd.get('phone') || ''),
              message: String(fd.get('message') || ''),
            }).then((r) => setStatus(r?.ok === false ? (r.message || 'Something went wrong') : 'Thanks — we will be in touch soon.'));
          }}
        >
          <input name="name" required placeholder="Your name" />
          <input name="email" type="email" required placeholder="Email" />
          <input name="phone" placeholder="Phone (optional)" />
          <textarea name="message" required placeholder="Message" rows={5} />
          <button type="submit" className="inf-btn" style={buttonStyle(config, 'primary', s)} disabled={submitting}>
            {submitting ? 'Sending…' : str(s.primaryLabel) || 'Send message'}
          </button>
          {status ? <p className="inf-contact__status">{status}</p> : null}
        </form>
      </div>
    </SectionWrap>
  );
}

function BlogListSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  const ctx = useInformaticBlogList() as { posts?: InformaticBlogListPostData[]; loading?: boolean; error?: string | null };
  const posts = ctx.posts || [];
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-blog-list">
      <div className="inf-container">
        <h2 className="inf-h2">{str(s.heading) || 'Blog'}</h2>
        {str(s.subheading) ? <p className="inf-sub">{str(s.subheading)}</p> : null}
        {ctx.loading ? <p className="inf-muted">Loading posts…</p> : null}
        {ctx.error ? <p className="inf-muted">{ctx.error}</p> : null}
        {!ctx.loading && !posts.length && !ctx.error ? (
          <p className="inf-muted">No posts yet.</p>
        ) : null}
        <div className="inf-blog-list__grid">
          {posts.map((p, i) => (
            <article key={p._id || p.urlHandle || i} className="inf-post-card">
              {p.featuredImageUrl ? <img src={p.featuredImageUrl} alt={p.title} /> : null}
              <h3>
                <SmartLink href={p.urlHandle ? `/blog/${p.urlHandle}` : '#'}>{p.title}</SmartLink>
              </h3>
              {p.excerpt ? <p className="inf-muted">{p.excerpt}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

function BlogPostSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  const ctx = useInformaticBlogPost() as {
    post?: { title?: string; content?: string; excerpt?: string; featuredImageUrl?: string; author?: string; publishedAt?: string } | null;
    loading?: boolean;
    error?: string | null;
  };
  const post = ctx.post;
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-blog-post">
      <div className="inf-container inf-blog-post__inner">
        {ctx.loading ? <p className="inf-muted">Loading…</p> : null}
        {ctx.error ? <p className="inf-muted">{ctx.error}</p> : null}
        {post ? (
          <>
            <h1 className="inf-h1">{post.title || str(s.heading)}</h1>
            {post.publishedAt || post.author ? (
              <p className="inf-muted">{[post.author, post.publishedAt].filter(Boolean).join(' · ')}</p>
            ) : null}
            {post.featuredImageUrl ? <img className="inf-blog-post__hero" src={post.featuredImageUrl} alt={post.title} /> : null}
            <RichBody value={post.content || str(s.body)} />
          </>
        ) : !ctx.loading && !ctx.error ? (
          <>
            <h1 className="inf-h1">{str(s.heading)}</h1>
            <RichBody value={str(s.body)} />
          </>
        ) : null}
      </div>
    </SectionWrap>
  );
}

function CustomPageSection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  const ctx = useInformaticCustomPage() as {
    page?: { title?: string; content?: string } | null;
    loading?: boolean;
    error?: string | null;
  };
  const page = ctx.page;
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-page">
      <div className="inf-container inf-page__inner">
        {ctx.loading ? <p className="inf-muted">Loading…</p> : null}
        {ctx.error ? <p className="inf-muted">{ctx.error}</p> : null}
        <h1 className="inf-h1">{page?.title || str(s.heading)}</h1>
        <RichBody value={page?.content || str(s.body)} />
      </div>
    </SectionWrap>
  );
}

function StorePolicySection({ templateId, sectionId, section }: SectionProps) {
  const s = section.settings ?? {};
  const ctx = useInformaticStorePolicy() as {
    policy?: { title?: string; content?: string } | null;
    loading?: boolean;
    error?: string | null;
  };
  const policy = ctx.policy;
  return (
    <SectionWrap templateId={templateId} sectionId={sectionId} section={section} className="inf-policy">
      <div className="inf-container inf-page__inner">
        {ctx.loading ? <p className="inf-muted">Loading…</p> : null}
        {ctx.error ? <p className="inf-muted">{ctx.error}</p> : null}
        <h1 className="inf-h1">{policy?.title || str(s.heading)}</h1>
        <RichBody value={policy?.content || str(s.body)} />
      </div>
    </SectionWrap>
  );
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */

type SectionProps = {
  templateId: string;
  sectionId: string;
  section: Section;
  config: ThemeConfig;
};

const RENDERERS: Record<string, ComponentType<SectionProps>> = {
  hero: HeroSection,
  'logo-cloud': LogoCloudSection,
  'features-grid': FeaturesGridSection,
  'split-feature': SplitFeatureSection,
  'stats-band': StatsBandSection,
  testimonials: TestimonialsSection,
  'media-gallery': MediaGallerySection,
  'cta-band': CtaBandSection,
  'rich-text': RichTextSection,
  faq: FaqSection,
  pricing: PricingSection,
  contact: ContactSection,
  'blog-list': BlogListSection,
  'blog-post': BlogPostSection,
  'custom-page': CustomPageSection,
  'store-policy': StorePolicySection,
};

/** Renders one template's sections in `section_order`. */
export function TemplateSections({ templateId }: { templateId: string }) {
  const config = useThemeConfig();
  const sections = cfg<Record<string, Section>>(config, `templates.${templateId}.sections`, {});
  const order = cfg<string[]>(config, `templates.${templateId}.section_order`, []);
  const ids = order.length ? order : Object.keys(sections);
  return (
    <>
      {ids.map((sid) => {
        const sec = sections[sid];
        if (!sec || sec.enabled === false) return null;
        const Renderer = RENDERERS[sec.type || ''] || RichTextSection;
        return <Renderer key={sid} templateId={templateId} sectionId={sid} section={sec} config={config} />;
      })}
    </>
  );
}
