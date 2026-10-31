export function applyPoliciesLinksPreset(section: Record<string, unknown>): void {
  if (section.type !== 'footer-utilities') return;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  if (!blocks.copyright) {
    blocks.copyright = {
      type: 'copyright',
      settings: { text: '© 2026 My Store', showPoweredBy: true },
    };
  }
  if (!blocks.policy_links) {
    blocks.policy_links = {
      type: 'policy_links',
      settings: {
        privacyLabel: 'Privacy policy',
        privacyHref: '/policies/privacy',
        termsLabel: 'Terms of service',
        termsHref: '/policies/terms',
      },
    };
  }
  section.blocks = blocks;
  section.block_order = ['copyright', 'policy_links'];
}
