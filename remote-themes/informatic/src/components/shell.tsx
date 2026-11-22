/**
 * Page shell: layout-order driven announcement bar + header + <main> + footer.
 * Every layout region and block carries the data-informatic-node /
 * data-informatic-section attributes the editor inspector maps to panels.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig, type ThemeConfig } from '@render-store/sdk';
import {
  buttonStyle,
  cfg,
  cfgStr,
  getLayoutSection,
  googleFontsUrl,
  humanize,
  orderedBlocks,
  themeVars,
  type Section,
} from '../lib/theme-utils';

type MenuItem = { label?: string; href?: string };

export function SmartLink({
  href,
  className,
  style,
  children,
}: {
  href?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const url = (href || '').trim();
  const internal = url.startsWith('/') && !url.startsWith('//');
  if (internal) {
    return (
      <Link to={url} className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={url || '#'}
      className={className}
      style={style}
      {...(/^https?:\/\//.test(url) ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

export function Node({
  nodeId,
  label,
  className,
  style,
  children,
  as: Tag = 'div',
}: {
  nodeId?: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: 'div' | 'section' | 'header' | 'footer' | 'li' | 'article';
}) {
  return (
    <Tag
      className={className}
      style={style}
      {...(nodeId ? { 'data-informatic-node': nodeId, 'data-informatic-label': label || humanize(nodeId.split('.').pop() || nodeId) } : {})}
    >
      {children}
    </Tag>
  );
}

function AnnouncementBar({ config }: { config: ThemeConfig }) {
  const sec = getLayoutSection(config, 'announcement_bar');
  if (!sec || sec.settings?.enabled === false) return null;
  const bg = cfgStr(config, 'sections.announcement_bar.settings.backgroundColor');
  const color = cfgStr(config, 'sections.announcement_bar.settings.textColor');
  return (
    <div
      className="inf-announcement"
      data-informatic-section="announcement_bar"
      data-informatic-label="Announcement bar"
      style={{ background: bg || 'var(--inf-primary)', color: color || '#fff' }}
    >
      {orderedBlocks(sec).map(([bid, b]) => {
        const text = String(b.settings?.text || '');
        const link = String(b.settings?.link || '');
        const linkLabel = String(b.settings?.linkLabel || '');
        return (
          <div
            key={bid}
            className="inf-announcement__item"
            data-informatic-node={`sections.announcement_bar.blocks.${bid}`}
            data-informatic-label={String(b.label || 'Announcement')}
          >
            <span>{text}</span>
            {link ? (
              <SmartLink href={link} className="inf-announcement__link">
                {linkLabel || 'Learn more'}
              </SmartLink>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Header({ config }: { config: ThemeConfig }) {
  const sec = getLayoutSection(config, 'header');
  if (!sec || sec.enabled === false) return null;
  const bg = cfgStr(config, 'sections.header.settings.backgroundColor');
  const color = cfgStr(config, 'sections.header.settings.textColor');
  const logoUrl = cfgStr(config, 'settings.logo.defaultUrl');
  const logoH = cfg<number>(config, 'settings.logo.desktopHeight', 36);
  const ctaLabel = cfgStr(config, 'sections.header.settings.ctaLabel');
  const ctaUrl = cfgStr(config, 'sections.header.settings.ctaUrl');
  const logo = sec.blocks?.logo;
  const menu = sec.blocks?.menu;
  const items = (menu?.settings?.items as MenuItem[] | undefined) || [];
  return (
    <header
      className="inf-header"
      data-informatic-section="header"
      data-informatic-label="Header"
      style={{ background: bg || 'var(--inf-bg)', color: color || 'var(--inf-text)' }}
    >
      <div className="inf-container inf-header__row">
        <div
          className="inf-header__brand"
          data-informatic-node="sections.header.blocks.logo"
          data-informatic-label="Logo"
        >
          <SmartLink href="/" className="inf-header__logo">
            {(String(logo?.settings?.imageUrl || '') || logoUrl) ? (
              <img
                src={String(logo?.settings?.imageUrl || '') || logoUrl}
                alt={String(logo?.settings?.text || 'Logo')}
                style={{ height: logoH }}
              />
            ) : (
              <span className="inf-header__logo-text">
                {String(logo?.settings?.text || '') || 'Store'}
              </span>
            )}
          </SmartLink>
        </div>
        <nav
          className="inf-header__nav"
          data-informatic-node="sections.header.blocks.menu"
          data-informatic-label="Menu"
        >
          {items.map((it, i) => (
            <SmartLink key={`${it.href}-${i}`} href={it.href} className="inf-header__link">
              {it.label}
            </SmartLink>
          ))}
        </nav>
        {ctaLabel ? (
          <SmartLink href={ctaUrl || '#'} className="inf-btn" style={buttonStyle(config, 'primary')}>
            {ctaLabel}
          </SmartLink>
        ) : null}
      </div>
    </header>
  );
}

const SOCIALS = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] as const;

function Footer({ config }: { config: ThemeConfig }) {
  const sec = getLayoutSection(config, 'footer');
  if (!sec || sec.enabled === false) return null;
  const bg = cfgStr(config, 'sections.footer.settings.backgroundColor');
  const color = cfgStr(config, 'sections.footer.settings.textColor');
  const blocks = sec.blocks || {};
  const brand = blocks.brand;
  const menu = blocks.menu;
  const legal = blocks.legal;
  const social = blocks.social;
  const menuItems = (menu?.settings?.items as MenuItem[] | undefined) || [];
  const legalItems = (legal?.settings?.items as MenuItem[] | undefined) || [];
  const socialLinks = (SOCIALS
    .map((k) => ({ k, url: String(social?.settings?.[k] || cfgStr(config, `settings.socialLinks.${k}`)) }))
    .filter((s) => s.url)) as Array<{ k: string; url: string }>;
  return (
    <footer
      className="inf-footer"
      data-informatic-section="footer"
      data-informatic-label="Footer"
      style={{ background: bg || 'var(--inf-primary)', color: color || '#fff' }}
    >
      <div className="inf-container inf-footer__grid">
        <div
          data-informatic-node="sections.footer.blocks.brand"
          data-informatic-label="Brand"
        >
          <h3 className="inf-footer__brand">{String(brand?.settings?.title || '')}</h3>
          <p className="inf-footer__blurb">{String(brand?.settings?.blurb || '')}</p>
        </div>
        <nav data-informatic-node="sections.footer.blocks.menu" data-informatic-label="Menu">
          <h4 className="inf-footer__heading">Explore</h4>
          {menuItems.map((it, i) => (
            <SmartLink key={i} href={it.href} className="inf-footer__link">
              {it.label}
            </SmartLink>
          ))}
        </nav>
        <nav data-informatic-node="sections.footer.blocks.legal" data-informatic-label="Legal">
          <h4 className="inf-footer__heading">Legal</h4>
          {legalItems.map((it, i) => (
            <SmartLink key={i} href={it.href} className="inf-footer__link">
              {it.label}
            </SmartLink>
          ))}
        </nav>
        <div data-informatic-node="sections.footer.blocks.social" data-informatic-label="Social links">
          <h4 className="inf-footer__heading">{String(social?.settings?.heading || 'Follow us')}</h4>
          <div className="inf-footer__socials">
            {socialLinks.map((s) => (
              <SmartLink key={s.k} href={s.url} className="inf-footer__social">
                {s.k.charAt(0).toUpperCase() + s.k.slice(1)}
              </SmartLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppWidget({ config }: { config: ThemeConfig }) {
  const w = cfg<Record<string, unknown>>(config, 'settings.whatsappWidget', {});
  if (w.enabled !== true) return null;
  const phone = String(w.phone || '').replace(/[^\d]/g, '');
  if (!phone) return null;
  const msg = encodeURIComponent(String(w.message || ''));
  return (
    <a
      className="inf-whatsapp"
      href={`https://wa.me/${phone}${msg ? `?text=${msg}` : ''}`}
      target="_blank"
      rel="noreferrer"
      aria-label={String(w.greeting || 'Chat on WhatsApp')}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-2.5-.8-4.2-2.9-4.4-3-.1-.2-1-1.4-1-2.7s.6-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5-.3.6-.6.8-.4 1.1.6 1 1.3 1.7 2.3 2.2.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3 0 .1 0 .7-.5 1.5z" />
      </svg>
    </a>
  );
}

/** Page shell — used by every page component. */
export function PageShell({
  templateId,
  children,
}: {
  templateId: string;
  children?: ReactNode;
}) {
  const config = useThemeConfig();
  const headerOrder = cfg<string[]>(config, 'layout_order.header', ['announcement_bar', 'header']);
  const footerOrder = cfg<string[]>(config, 'layout_order.footer', ['footer']);
  const fontsUrl = googleFontsUrl(config);
  return (
    <div className="inf-root" style={themeVars(config)} data-template={templateId}>
      {fontsUrl ? <link rel="stylesheet" href={fontsUrl} /> : null}
      {headerOrder.includes('announcement_bar') ? <AnnouncementBar config={config} /> : null}
      {headerOrder.includes('header') ? <Header config={config} /> : null}
      <main>{children}</main>
      {footerOrder.includes('footer') ? <Footer config={config} /> : null}
      <WhatsAppWidget config={config} />
    </div>
  );
}
