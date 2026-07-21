/** Shopify-style defaults for layout Policies and links (footer_utilities). */

export function applyFooterPoliciesLinksPreset(section: Record<string, unknown>): void {
  if (section.type !== 'footer-utilities') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'policies-links';
  settings.sectionWidth = 'page';
  settings.gap = 24;
  settings.dividerThickness = 1;
  settings.colorScheme = 'scheme-1';
  settings.paddingTop = 20;
  settings.paddingBottom = 20;
  settings.paymentIcons = false;
  settings.followOnShop = false;
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;

  const copyright = blocks.copyright ?? { type: 'copyright', settings: {} };
  const cr = (copyright.settings ?? {}) as Record<string, unknown>;
  cr.showPoweredBy = true;
  cr.fontSize = '12px';
  cr.textCase = 'default';
  cr.text = '© 2026 My Store';
  copyright.settings = cr;
  blocks.copyright = copyright;

  const policyLinks = blocks.policy_links ?? { type: 'policy_links', settings: {} };
  const pl = (policyLinks.settings ?? {}) as Record<string, unknown>;
  pl.fontSize = '12px';
  pl.textCase = 'default';
  pl.privacyLabel = 'Privacy policy';
  pl.privacyHref = '/policies';
  pl.termsLabel = 'Terms and Policies';
  pl.termsHref = '/policies';
  policyLinks.settings = pl;
  blocks.policy_links = policyLinks;

  section.blocks = blocks;
  section.block_order = ['copyright', 'policy_links'];
}
