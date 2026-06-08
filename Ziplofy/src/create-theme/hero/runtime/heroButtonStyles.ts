import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type HeroButtonStyle = {
  width: string;
  mobileWidth: string;
  padding: string;
  borderRadius: number;
  fontSize: number;
  fontWeight: number;
  background: string;
  color: string;
  border: string;
  openInNewTab: boolean;
};

function clampPercent(value: number, fallback = 100): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(1, value));
}

function buttonWidthCss(
  mode: string,
  percent: number
): string {
  if (mode === 'custom') return `${clampPercent(percent)}%`;
  return 'fit-content';
}

export function readHeroButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallbackVariant: 'primary' | 'secondary',
  colors: { primary: string; background: string; text: string; line: string },
  options?: { onImageHero?: boolean; marqueeFilled?: boolean }
): HeroButtonStyle {
  const variantKey = cfgString(config, `${settingsBase}.buttonStyle`, fallbackVariant);
  const variant = variantKey === 'primary' ? 'primary' : 'secondary';
  const isPrimary = variant === 'primary';
  const onImage = Boolean(options?.onImageHero);
  const marqueeFilled = Boolean(options?.marqueeFilled);

  const desktopMode = cfgString(config, `${settingsBase}.desktopWidth`, 'fit');
  const mobileMode = cfgString(config, `${settingsBase}.mobileWidth`, 'fit');
  const desktopPercent = cfgNumber(config, `${settingsBase}.desktopCustomWidth`, 100);
  const mobilePercent = cfgNumber(config, `${settingsBase}.mobileCustomWidth`, 100);
  const width = buttonWidthCss(desktopMode, desktopPercent);
  const mobileWidth = buttonWidthCss(mobileMode, mobilePercent);
  const openInNewTab = cfgBool(config, `${settingsBase}.openInNewTab`, false);

  if (marqueeFilled && isPrimary) {
    return {
      width,
      mobileWidth,
      padding: '10px 24px',
      borderRadius: 9999,
      fontSize: 14,
      fontWeight: 500,
      background: '#ffffff',
      color: '#111827',
      border: 'none',
      openInNewTab,
    };
  }

  if (onImage && isPrimary) {
    return {
      width,
      mobileWidth,
      padding: '12px 28px',
      borderRadius: 9999,
      fontSize: 15,
      fontWeight: 500,
      background: 'rgba(0, 0, 0, 0.28)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.9)',
      openInNewTab,
    };
  }

  return {
    width,
    mobileWidth,
    padding: isPrimary ? '14px 28px' : '14px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: isPrimary ? colors.primary : 'transparent',
    color: isPrimary ? colors.background : colors.text,
    border: isPrimary ? 'none' : `1px solid ${colors.line}`,
    openInNewTab,
  };
}
