import fontsData from './checkout-typography-fonts.json';

export type CheckoutTypographyFontOption = {
  value: string;
  label: string;
  family: string;
  googleFont: string | null;
};

export const CHECKOUT_TYPOGRAPHY_FONT_OPTIONS = fontsData as CheckoutTypographyFontOption[];

const FONT_BY_VALUE = new Map(
  CHECKOUT_TYPOGRAPHY_FONT_OPTIONS.map((font) => [font.value, font])
);

export type CheckoutTypographyFont = string;

export function normalizeCheckoutTypographyFont(value: unknown): CheckoutTypographyFont {
  if (typeof value === 'string' && FONT_BY_VALUE.has(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const byLabel = CHECKOUT_TYPOGRAPHY_FONT_OPTIONS.find(
      (font) => font.label.toLowerCase() === value.trim().toLowerCase()
    );
    if (byLabel) return byLabel.value;
  }
  return 'default';
}

export function resolveCheckoutFontFamily(value: CheckoutTypographyFont): string {
  return FONT_BY_VALUE.get(value)?.family ?? 'inherit';
}

export function resolveCheckoutGoogleFontName(value: CheckoutTypographyFont): string | null {
  return FONT_BY_VALUE.get(value)?.googleFont ?? null;
}

export type CheckoutTypographyTheme = {
  headingsFontFamily: string;
  bodyFontFamily: string;
  headingGoogleFont: string | null;
  bodyGoogleFont: string | null;
};

export function resolveCheckoutTypographyTheme(settings: {
  typographyHeadings?: CheckoutTypographyFont;
  typographyBody?: CheckoutTypographyFont;
}): CheckoutTypographyTheme {
  const headings = normalizeCheckoutTypographyFont(settings.typographyHeadings);
  const body = normalizeCheckoutTypographyFont(settings.typographyBody);
  return {
    headingsFontFamily: resolveCheckoutFontFamily(headings),
    bodyFontFamily: resolveCheckoutFontFamily(body),
    headingGoogleFont: resolveCheckoutGoogleFontName(headings),
    bodyGoogleFont: resolveCheckoutGoogleFontName(body),
  };
}
