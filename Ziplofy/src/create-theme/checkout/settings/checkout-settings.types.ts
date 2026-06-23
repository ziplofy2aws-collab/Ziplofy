import { isColorDark, normalizeHexColor } from './checkout-color.utils';
import { normalizeCheckoutTypographyFont, type CheckoutTypographyFont } from './checkout-typography-fonts';

export type CheckoutHeaderPosition = 'full_width' | 'checkout_form';

export type CheckoutHeaderConfig = {
  position?: CheckoutHeaderPosition | 'inline';
};

export type CheckoutColorSetting = 'default' | (string & {});

export type CheckoutOrderSummaryConfig = {
  backgroundColor?: CheckoutColorSetting;
  accentColor?: CheckoutColorSetting;
  backgroundImage?: string | null;
};

export const CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND = '#fafafa';
export const CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT = '#005bd3';

export type CheckoutSignInMainConfig = {
  logoImage?: string | null;
  backgroundColor?: CheckoutColorSetting;
  accentColor?: CheckoutColorSetting;
  mediaImage?: string | null;
};

export const CHECKOUT_DEFAULT_SIGN_IN_MAIN_BACKGROUND = '#ffffff';
export const CHECKOUT_DEFAULT_SIGN_IN_MAIN_ACCENT = '#005bd3';

export type CheckoutThankYouMainConfig = {
  backgroundColor?: CheckoutColorSetting;
  accentColor?: CheckoutColorSetting;
  backgroundImage?: string | null;
};

export const CHECKOUT_DEFAULT_THANK_YOU_MAIN_BACKGROUND = '#ffffff';
export const CHECKOUT_DEFAULT_THANK_YOU_MAIN_ACCENT = '#005bd3';

export const CHECKOUT_COLOR_SETTING_OPTIONS: Array<{
  value: CheckoutColorSetting;
  label: string;
  swatch: string;
}> = [
  { value: 'default', label: 'Default', swatch: CHECKOUT_DEFAULT_ORDER_SUMMARY_BACKGROUND },
];

export const CHECKOUT_ACCENT_COLOR_SETTING_OPTIONS: Array<{
  value: CheckoutColorSetting;
  label: string;
  swatch: string;
}> = [
  { value: 'default', label: 'Default', swatch: CHECKOUT_DEFAULT_ORDER_SUMMARY_ACCENT },
];

export const CHECKOUT_HEADER_POSITION_OPTIONS: Array<{
  value: CheckoutHeaderPosition;
  label: string;
}> = [
  { value: 'checkout_form', label: 'Checkout form' },
  { value: 'full_width', label: 'Full width' },
];

export const CHECKOUT_FORM_MAX_WIDTH_CLASS = 'max-w-[580px]';

export type CheckoutFooterAlignment = 'left' | 'center' | 'right';

export type CheckoutFooterConfig = {
  location?: CheckoutHeaderPosition;
  alignment?: CheckoutFooterAlignment;
};

export type CheckoutLayoutType = 'one_page' | 'three_page';

export type CheckoutLogoAlignment = 'left' | 'center' | 'right';

export type { CheckoutTypographyFont } from './checkout-typography-fonts';
export {
  CHECKOUT_TYPOGRAPHY_FONT_OPTIONS,
  normalizeCheckoutTypographyFont,
  resolveCheckoutFontFamily,
  resolveCheckoutTypographyTheme,
  type CheckoutTypographyTheme,
} from './checkout-typography-fonts';

export const CHECKOUT_DEFAULT_MAIN_BACKGROUND = '#ffffff';
export const CHECKOUT_DEFAULT_HEADER_BACKGROUND = '#ffffff';
export const CHECKOUT_DEFAULT_HEADER_THEME_ACCENT = '#005bd3';
export const CHECKOUT_DEFAULT_ACCENT_COLOR = '#005bd3';
export const CHECKOUT_DEFAULT_BUTTON_COLOR = '#005bd3';
export const CHECKOUT_DEFAULT_ERROR_COLOR = '#d82c0d';
export const CHECKOUT_DEFAULT_COLOR_PALETTE = ['#005bd3', '#ffffff', '#f6f6f7'];
export const CHECKOUT_DEFAULT_LOGO_WIDTH = 50;
export const CHECKOUT_MIN_LOGO_WIDTH = 20;
export const CHECKOUT_MAX_LOGO_WIDTH = 250;

export type CheckoutGlobalSettings = {
  layout?: CheckoutLayoutType;
  addressAutocompletion?: boolean;
  buyAgainButton?: boolean;
  logoImage?: string | null;
  logoAlignment?: CheckoutLogoAlignment;
  logoWidth?: number;
  colorPalette?: string[];
  mainBackgroundColor?: CheckoutColorSetting;
  headerBackgroundColor?: CheckoutColorSetting;
  headerAccentColor?: CheckoutColorSetting;
  accentColor?: CheckoutColorSetting;
  buttonColor?: CheckoutColorSetting;
  inputFieldsErrorColor?: CheckoutColorSetting;
  inputFieldsTransparent?: boolean;
  typographyHeadings?: CheckoutTypographyFont;
  typographyBody?: CheckoutTypographyFont;
};

export const CHECKOUT_LAYOUT_OPTIONS: Array<{
  value: CheckoutLayoutType;
  label: string;
  title: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    value: 'one_page',
    label: 'One-page',
    title: 'One-page checkout',
    description: 'Faster, shorter checkout on a single page.',
    recommended: true,
  },
  {
    value: 'three_page',
    label: 'Three-page',
    title: 'Three-page checkout',
    description: 'Stepped checkout across multiple pages.',
  },
];

export const CHECKOUT_FOOTER_LOCATION_OPTIONS: Array<{
  value: CheckoutHeaderPosition;
  label: string;
}> = [
  { value: 'checkout_form', label: 'Checkout form' },
  { value: 'full_width', label: 'Full width' },
];

export const CHECKOUT_FOOTER_ALIGNMENT_OPTIONS: Array<{
  value: CheckoutFooterAlignment;
  label: string;
}> = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

function readCheckoutColorSetting(
  value: unknown,
  fallback: CheckoutColorSetting
): CheckoutColorSetting {
  if (value === 'default') return 'default';
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
}

function readCheckoutLogoWidth(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return CHECKOUT_DEFAULT_LOGO_WIDTH;
  return Math.min(CHECKOUT_MAX_LOGO_WIDTH, Math.max(CHECKOUT_MIN_LOGO_WIDTH, Math.round(n)));
}

export function readCheckoutHeaderPosition(
  checkoutConfig?: Record<string, unknown> | null
): CheckoutHeaderPosition {
  const header = checkoutConfig?.header;
  if (!header || typeof header !== 'object' || Array.isArray(header)) {
    return 'checkout_form';
  }
  const position = (header as CheckoutHeaderConfig).position;
  if (position === 'full_width') return 'full_width';
  if (position === 'checkout_form' || position === 'inline') return 'checkout_form';
  return 'checkout_form';
}

export function readCheckoutThankYouMainConfig(
  checkoutConfig?: Record<string, unknown> | null
): Required<CheckoutThankYouMainConfig> {
  const thankYouMain = checkoutConfig?.thankYouMain;
  if (!thankYouMain || typeof thankYouMain !== 'object' || Array.isArray(thankYouMain)) {
    return {
      backgroundColor: 'default',
      accentColor: 'default',
      backgroundImage: null,
    };
  }
  const typed = thankYouMain as CheckoutThankYouMainConfig;
  return {
    backgroundColor: readCheckoutColorSetting(typed.backgroundColor, 'default'),
    accentColor: readCheckoutColorSetting(typed.accentColor, 'default'),
    backgroundImage:
      typeof typed.backgroundImage === 'string' && typed.backgroundImage.trim()
        ? typed.backgroundImage
        : null,
  };
}

export function readCheckoutSignInMainConfig(
  checkoutConfig?: Record<string, unknown> | null
): Required<CheckoutSignInMainConfig> {
  const signInMain = checkoutConfig?.signInMain;
  if (!signInMain || typeof signInMain !== 'object' || Array.isArray(signInMain)) {
    return {
      logoImage: null,
      backgroundColor: CHECKOUT_DEFAULT_SIGN_IN_MAIN_BACKGROUND,
      accentColor: 'default',
      mediaImage: null,
    };
  }
  const typed = signInMain as CheckoutSignInMainConfig;
  return {
    logoImage:
      typeof typed.logoImage === 'string' && typed.logoImage.trim() ? typed.logoImage : null,
    backgroundColor: readCheckoutColorSetting(
      typed.backgroundColor,
      CHECKOUT_DEFAULT_SIGN_IN_MAIN_BACKGROUND
    ),
    accentColor: readCheckoutColorSetting(typed.accentColor, 'default'),
    mediaImage:
      typeof typed.mediaImage === 'string' && typed.mediaImage.trim() ? typed.mediaImage : null,
  };
}

export function readCheckoutOrderSummaryConfig(
  checkoutConfig?: Record<string, unknown> | null
): Required<CheckoutOrderSummaryConfig> {
  const summary = checkoutConfig?.orderSummary;
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    return {
      backgroundColor: 'default',
      accentColor: 'default',
      backgroundImage: null,
    };
  }
  const typed = summary as CheckoutOrderSummaryConfig;
  return {
    backgroundColor: readCheckoutColorSetting(typed.backgroundColor, 'default'),
    accentColor: readCheckoutColorSetting(typed.accentColor, 'default'),
    backgroundImage:
      typeof typed.backgroundImage === 'string' && typed.backgroundImage.trim()
        ? typed.backgroundImage
        : null,
  };
}

export function readCheckoutFooterConfig(
  checkoutConfig?: Record<string, unknown> | null
): Required<CheckoutFooterConfig> {
  const footer = checkoutConfig?.footer;
  if (!footer || typeof footer !== 'object' || Array.isArray(footer)) {
    return {
      location: 'checkout_form',
      alignment: 'left',
    };
  }
  const typed = footer as CheckoutFooterConfig;
  const location = typed.location;
  const alignment = typed.alignment;
  return {
    location:
      location === 'full_width'
        ? 'full_width'
        : location === 'checkout_form' || location === 'inline'
          ? 'checkout_form'
          : 'checkout_form',
    alignment:
      alignment === 'center' || alignment === 'right' ? alignment : 'left',
  };
}

export function readCheckoutGlobalSettings(
  checkoutConfig?: Record<string, unknown> | null
): Required<CheckoutGlobalSettings> {
  const settings = checkoutConfig?.settings;
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return {
      layout: 'one_page',
      addressAutocompletion: false,
      buyAgainButton: false,
      logoImage: null,
      logoAlignment: 'left',
      logoWidth: CHECKOUT_DEFAULT_LOGO_WIDTH,
      colorPalette: [...CHECKOUT_DEFAULT_COLOR_PALETTE],
      mainBackgroundColor: 'default',
      headerBackgroundColor: 'default',
      headerAccentColor: 'default',
      accentColor: 'default',
      buttonColor: 'default',
      inputFieldsErrorColor: 'default',
      inputFieldsTransparent: false,
      typographyHeadings: 'default',
      typographyBody: 'default',
    };
  }
  const typed = settings as CheckoutGlobalSettings;
  const palette = Array.isArray(typed.colorPalette)
    ? typed.colorPalette.filter((color): color is string => typeof color === 'string' && color.trim())
    : [...CHECKOUT_DEFAULT_COLOR_PALETTE];
  const alignment = typed.logoAlignment;
  const layout = typed.layout;
  return {
    layout: layout === 'three_page' ? 'three_page' : 'one_page',
    addressAutocompletion: typed.addressAutocompletion === true,
    buyAgainButton: typed.buyAgainButton === true,
    logoImage:
      typeof typed.logoImage === 'string' && typed.logoImage.trim() ? typed.logoImage : null,
    logoAlignment:
      alignment === 'center' || alignment === 'right' ? alignment : 'left',
    logoWidth: readCheckoutLogoWidth(typed.logoWidth),
    colorPalette: palette.length > 0 ? palette : [...CHECKOUT_DEFAULT_COLOR_PALETTE],
    mainBackgroundColor: readCheckoutColorSetting(typed.mainBackgroundColor, 'default'),
    headerBackgroundColor: readCheckoutColorSetting(typed.headerBackgroundColor, 'default'),
    headerAccentColor: readCheckoutColorSetting(typed.headerAccentColor, 'default'),
    accentColor: readCheckoutColorSetting(typed.accentColor, 'default'),
    buttonColor: readCheckoutColorSetting(typed.buttonColor, 'default'),
    inputFieldsErrorColor: readCheckoutColorSetting(typed.inputFieldsErrorColor, 'default'),
    inputFieldsTransparent: typed.inputFieldsTransparent === true,
    typographyHeadings: normalizeCheckoutTypographyFont(typed.typographyHeadings),
    typographyBody: normalizeCheckoutTypographyFont(typed.typographyBody),
  };
}

export function resolveCheckoutColorSetting(
  value: CheckoutColorSetting,
  defaultHex: string
): string {
  return value === 'default' ? defaultHex : value;
}

export type CheckoutPaletteTheme = {
  accentColor: string;
  buttonColor: string;
  headerAccentColor: string;
  headerBackgroundColor: string;
  mainBackgroundColor: string;
  headerBackgroundIsDark: boolean;
  mainBackgroundIsDark: boolean;
};

/** Palette swatch 1 = accent, swatch 2 = header. Main background is independent. */
export function resolveCheckoutPaletteTheme(
  settings: Pick<
    CheckoutGlobalSettings,
    | 'colorPalette'
    | 'accentColor'
    | 'headerAccentColor'
    | 'mainBackgroundColor'
    | 'headerBackgroundColor'
    | 'buttonColor'
  >
): CheckoutPaletteTheme {
  const palette = settings.colorPalette ?? CHECKOUT_DEFAULT_COLOR_PALETTE;
  const paletteAccent = palette[0]?.trim() || CHECKOUT_DEFAULT_ACCENT_COLOR;
  const accentColor = resolveCheckoutColorSetting(settings.accentColor ?? 'default', paletteAccent);
  const headerAccentColor = resolveCheckoutColorSetting(
    settings.headerAccentColor ?? 'default',
    paletteAccent
  );
  const buttonColor = resolveCheckoutColorSetting(
    settings.buttonColor ?? 'default',
    paletteAccent
  );
  const headerBackgroundColor = resolveCheckoutColorSetting(
    settings.headerBackgroundColor ?? 'default',
    palette[1]?.trim() || CHECKOUT_DEFAULT_HEADER_BACKGROUND
  );
  const mainBackgroundColor = resolveCheckoutColorSetting(
    settings.mainBackgroundColor ?? 'default',
    CHECKOUT_DEFAULT_MAIN_BACKGROUND
  );
  return {
    accentColor,
    buttonColor,
    headerAccentColor,
    headerBackgroundColor,
    mainBackgroundColor,
    headerBackgroundIsDark: isColorDark(headerBackgroundColor),
    mainBackgroundIsDark: isColorDark(mainBackgroundColor),
  };
}

export function syncSettingsFromPalette(
  colors: string[]
): Pick<
  CheckoutGlobalSettings,
  'colorPalette' | 'accentColor' | 'headerAccentColor' | 'headerBackgroundColor'
> {
  return {
    colorPalette: colors,
    accentColor: colors[0] ?? CHECKOUT_DEFAULT_ACCENT_COLOR,
    headerAccentColor: colors[0] ?? CHECKOUT_DEFAULT_HEADER_THEME_ACCENT,
    headerBackgroundColor: colors[1] ?? CHECKOUT_DEFAULT_HEADER_BACKGROUND,
  };
}

export function colorSettingLabel(
  value: CheckoutColorSetting,
  defaultHex: string,
  paletteColor?: string
): string {
  if (value === 'default') return 'Default';
  const resolved = resolveCheckoutColorSetting(value, defaultHex);
  if (paletteColor && normalizeHexColor(resolved, defaultHex) === normalizeHexColor(paletteColor, defaultHex)) {
    return 'Palette color';
  }
  return resolved.toUpperCase();
}
