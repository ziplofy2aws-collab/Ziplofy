/** Shopify-style defaults for Image compare sections. */

export function applyImageComparePreset(section: Record<string, unknown>): void {
  if (section.type !== 'image-compare') return;

  const settings = (section.settings ?? {}) as Record<string, unknown>;
  settings.catalogVariant = 'image-compare';
  settings.heading = 'Find your perfect fit';
  settings.headingWidth = 'fit';
  settings.headingMaxWidth = 'normal';
  settings.headingTypographyPreset = 'default';
  settings.headingColor = '';
  settings.headingBackgroundEnabled = false;
  settings.headingPaddingTop = 0;
  settings.headingPaddingBottom = 0;
  settings.headingPaddingLeft = 0;
  settings.headingPaddingRight = 0;
  settings.subheading = 'Discover the best of both worlds';
  settings.subheadingWidth = 'fit';
  settings.subheadingMaxWidth = 'normal';
  settings.subheadingTypographyPreset = 'default';
  settings.subheadingColor = '';
  settings.subheadingBackgroundEnabled = false;
  settings.subheadingPaddingTop = 0;
  settings.subheadingPaddingBottom = 0;
  settings.subheadingPaddingLeft = 0;
  settings.subheadingPaddingRight = 0;
  settings.button1Label = 'View all';
  settings.button1Url = '/collections';
  settings.button1OpenInNewTab = false;
  settings.button1Style = 'secondary';
  settings.button1DesktopWidth = 'fit';
  settings.button1DesktopCustomWidth = 100;
  settings.button1MobileWidth = 'fit';
  settings.button1MobileCustomWidth = 100;
  settings.button2Label = 'Shop now';
  settings.button2Url = '/collections/all';
  settings.button2OpenInNewTab = false;
  settings.button2Style = 'secondary';
  settings.button2DesktopWidth = 'fit';
  settings.button2DesktopCustomWidth = 100;
  settings.button2MobileWidth = 'fit';
  settings.button2MobileCustomWidth = 100;
  settings.imageBeforeUrl = '';
  settings.imageAfterUrl = '';
  settings.sliderDirection = 'horizontal';
  settings.sliderTextOnImages = false;
  settings.sliderAspectRatio = 'landscape';
  settings.sliderDesktopWidth = 'custom';
  settings.sliderDesktopCustomWidth = 65;
  settings.sliderMobileWidth = 'fill';
  settings.sliderMobileCustomWidth = 100;
  settings.sliderColor = 'default';
  settings.sliderInnerColor = 'default';
  settings.sliderBorderStyle = 'none';
  settings.sliderBorderThickness = 1;
  settings.sliderBorderOpacity = 100;
  settings.sliderBorderColor = 'default';
  settings.sliderCornerRadius = 0;
  settings.sliderPaddingTop = 0;
  settings.sliderPaddingBottom = 0;
  settings.sliderPaddingLeft = 0;
  settings.sliderPaddingRight = 0;
  settings.contentGroup = {
    direction: 'vertical',
    layoutAlignment: 'center',
    position: 'center',
    layoutGap: 30,
    width: 'fit',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundColor: 'default',
    backgroundOverlay: false,
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    borderColor: 'default',
    cornerRadius: 0,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
  settings.buttonsGroup = {
    direction: 'horizontal',
    verticalOnMobile: false,
    layoutAlignment: 'center',
    position: 'center',
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundColor: 'default',
    backgroundOverlay: false,
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    borderColor: 'default',
    cornerRadius: 0,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
  settings.textGroup = {
    direction: 'vertical',
    layoutAlignment: 'center',
    position: 'center',
    layoutGap: 12,
    width: 'fill',
    customWidth: 100,
    mobileWidth: 'fill',
    mobileCustomWidth: 100,
    height: 'fit',
    customHeight: 100,
    backgroundMedia: 'none',
    backgroundImageUrl: '',
    backgroundColor: 'default',
    backgroundOverlay: false,
    borderStyle: 'none',
    borderThickness: 1,
    borderOpacity: 100,
    borderColor: 'default',
    cornerRadius: 0,
    linkUrl: '',
    openLinkInNewTab: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
  settings.direction = 'horizontal';
  settings.verticalOnMobile = false;
  settings.layoutAlignment = 'space-between';
  settings.position = 'center';
  settings.layoutGap = 46;
  settings.mediaPosition = 'right';
  settings.sectionWidth = 'page';
  settings.height = 'small';
  settings.colorScheme = 'scheme-1';
  settings.backgroundMedia = 'none';
  settings.backgroundImageUrl = '';
  settings.backgroundColor = 'default';
  settings.borderStyle = 'none';
  settings.borderThickness = 1;
  settings.borderOpacity = 100;
  settings.borderColor = 'default';
  settings.cornerRadius = 0;
  settings.backgroundOverlay = false;
  settings.paddingTop = 40;
  settings.paddingBottom = 40;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
