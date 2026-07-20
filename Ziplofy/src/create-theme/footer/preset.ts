/** Default section + newsletter block when Footer is inserted. */

export function applyFooterPreset(section: Record<string, unknown>): void {
  if (section.type !== 'footer') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.sectionWidth = 'page';
  settings.gap = 24;
  settings.colorScheme = 'scheme-2';
  settings.paddingTop = 36;
  settings.paddingBottom = 36;
  section.settings = settings;

  const blocks = (section.blocks ?? {}) as Record<string, Record<string, unknown>>;
  const newsletter = blocks.newsletter ?? { type: 'newsletter', settings: {} };
  const nl = (newsletter.settings ?? {}) as Record<string, unknown>;

  nl.title = 'Join our email list';
  nl.subtitle = 'Get exclusive deals and early access to new products.';
  nl.placeholder = 'Email address';
  nl.buttonLabel = 'Sign up';
  nl.submitIntegratedButton = false;
  nl.submitStyle = 'button';
  nl.submitDisplay = 'text';
  nl.inputBorder = 'all';
  nl.inputBorderThickness = 1;
  nl.inputCornerRadius = 100;
  nl.blockWidth = 'fill';
  nl.inheritColorScheme = true;

  newsletter.settings = nl;
  blocks.newsletter = newsletter;
  section.blocks = blocks;
  section.block_order = ['newsletter'];
}
