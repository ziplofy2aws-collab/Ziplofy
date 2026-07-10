import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readThemeBadgesSettings,
  resolveThemeBadgeColors,
  type ThemeBadgePosition,
  type ThemeBadgesSettings,
} from '../../settings/theme-badges.settings';
import {
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  themeFontsFromConfig,
} from './themeTypographyRuntime';

export type ResolvedThemeBadgeStyles = {
  position: ThemeBadgePosition;
  cornerRadius: number;
  saleBackgroundColor: string;
  saleTextColor: string;
  soldOutBackgroundColor: string;
  soldOutTextColor: string;
  fontFamily: string;
  fontWeight: CSSProperties['fontWeight'];
  fontStyle: CSSProperties['fontStyle'];
  textTransform: CSSProperties['textTransform'];
};

export function resolveThemeBadgeStyles(
  config: Record<string, unknown> | null | undefined
): ResolvedThemeBadgeStyles {
  const badges = readThemeBadgesSettings(config);
  const colors = resolveThemeBadgeColors(config);
  const fonts = themeFontsFromConfig(config);
  const fontFamily = resolveThemeFontFamily(badges.font, fonts);
  const fontTraits = resolveThemeFontWeightAndStyle(badges.font);

  return {
    position: badges.position,
    cornerRadius: badges.cornerRadius,
    saleBackgroundColor: colors.saleBackgroundColor,
    saleTextColor: colors.saleTextColor,
    soldOutBackgroundColor: colors.soldOutBackgroundColor,
    soldOutTextColor: colors.soldOutTextColor,
    fontFamily,
    fontWeight: fontTraits.fontWeight ?? 400,
    fontStyle: fontTraits.fontStyle ?? 'normal',
    textTransform: badges.textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}

export function themeBadgeCssVars(
  styles: ResolvedThemeBadgeStyles
): Record<string, string | number> {
  return {
    '--codiic-badge-radius': `${styles.cornerRadius}px`,
    '--codiic-badge-sale-bg': styles.saleBackgroundColor,
    '--codiic-badge-sale-text': styles.saleTextColor,
    '--codiic-badge-sold-out-bg': styles.soldOutBackgroundColor,
    '--codiic-badge-sold-out-text': styles.soldOutTextColor,
    '--codiic-badge-font-family': styles.fontFamily,
    '--codiic-badge-font-weight': String(styles.fontWeight ?? 400),
    '--codiic-badge-font-style': styles.fontStyle ?? 'normal',
    '--codiic-badge-text-transform': styles.textTransform ?? 'none',
  };
}

export function useThemeBadges(): ResolvedThemeBadgeStyles {
  const config = useThemeConfig();
  return useMemo(() => resolveThemeBadgeStyles(config), [config]);
}

export function badgeKindStyles(
  styles: ResolvedThemeBadgeStyles,
  kind: 'sale' | 'sold-out'
): CSSProperties {
  const isSale = kind === 'sale';
  return {
    background: isSale ? styles.saleBackgroundColor : styles.soldOutBackgroundColor,
    color: isSale ? styles.saleTextColor : styles.soldOutTextColor,
    borderRadius: styles.cornerRadius,
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    textTransform: styles.textTransform,
  };
}

export type { ThemeBadgesSettings };
