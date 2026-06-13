/** Shopify-style defaults for Image compare sections. */

export function applyImageComparePreset(section: Record<string, unknown>): void {
  if (section.type !== 'image-compare') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'image-compare';
  settings.heading = 'Find your perfect fit';
  settings.subheading = 'Discover the best of both worlds';
  settings.button1Label = 'View all';
  settings.button1Url = '/collections';
  settings.button2Label = 'Shop now';
  settings.button2Url = '/products';
  settings.imageBeforeUrl = '';
  settings.imageAfterUrl = '';
  settings.sliderDirection = 'horizontal';
  settings.sliderTextOnImages = false;
  settings.sliderAspectRatio = 'landscape';
  settings.sliderDesktopWidth = 'custom';
  settings.sliderDesktopCustomWidth = 65;
  settings.sliderMobileWidth = 'fill';
  settings.sliderMobileCustomWidth = 100;
  settings.sliderInheritColorScheme = false;
  settings.sliderBorderStyle = 'none';
  settings.sliderCornerRadius = 0;
  settings.sliderPaddingTop = 0;
  settings.sliderPaddingBottom = 0;
  settings.sliderPaddingLeft = 0;
  settings.sliderPaddingRight = 0;
  Object.assign(settings, {
    contentDirection: 'vertical',
    contentAlignment: 'center',
    contentPosition: 'center',
    contentGap: 30,
    contentWidth: 'fit',
    contentCustomWidth: 100,
    contentMobileWidth: 'fill',
    contentMobileCustomWidth: 100,
    contentHeight: 'fit',
    contentCustomHeight: 100,
    contentInheritColorScheme: true,
    contentBackgroundMedia: 'none',
    contentBackgroundImageUrl: '',
    contentBorderStyle: 'none',
    contentCornerRadius: 0,
    contentBackgroundOverlay: false,
    contentLinkUrl: '',
    contentOpenInNewTab: false,
    contentPaddingTop: 48,
    contentPaddingBottom: 48,
    contentPaddingLeft: 56,
    contentPaddingRight: 56,
  });
  settings.direction = 'horizontal';
  settings.verticalOnMobile = false;
  settings.layoutAlignment = 'space-between';
  settings.position = 'center';
  settings.layoutGap = 46;
  settings.sectionWidth = 'page';
  settings.height = 'small';
  settings.colorScheme = 'scheme-1';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.borderStyle = 'none';
  settings.cornerRadius = 0;
  settings.backgroundOverlay = false;
  settings.paddingTop = 40;
  settings.paddingBottom = 40;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
