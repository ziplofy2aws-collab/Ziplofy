import { cfgBool, cfgNumber, cfgString } from './config';

export type HeroButtonStyle = {
  variant: 'primary' | 'secondary';
  width: string;
  mobileWidth: string;
  minWidth: string | undefined;
  padding: string;
  borderRadius: number;
  fontSize: number;
  fontWeight: number;
  background: string;
  color: string;
  border: string;
  openInNewTab: boolean;
};

export function readHeroButtonStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  fallbackVariant: 'primary' | 'secondary',
  colors: { primary: string; background: string; text: string; line: string },
  options?: { onImageHero?: boolean }
): HeroButtonStyle {
  const variantKey = cfgString(config, `${settingsBase}.buttonStyle`, fallbackVariant);
  const variant = variantKey === 'primary' ? 'primary' : 'secondary';
  const desktopMode = cfgString(config, `${settingsBase}.desktopWidth`, 'fit');
  const mobileMode = cfgString(config, `${settingsBase}.mobileWidth`, 'fit');
  const desktopPercent = cfgNumber(config, `${settingsBase}.desktopCustomWidth`, 100);
  const mobilePercent = cfgNumber(config, `${settingsBase}.mobileCustomWidth`, 100);
  const clampPct = (n: number) => Math.min(100, Math.max(1, Number.isFinite(n) ? n : 100));
  const width =
    desktopMode === 'custom' ? `${clampPct(desktopPercent)}%` : 'fit-content';
  const mobileWidth =
    mobileMode === 'custom' ? `${clampPct(mobilePercent)}%` : 'fit-content';

  const isPrimary = variant === 'primary';
  const onImage = Boolean(options?.onImageHero);

  if (onImage && isPrimary) {
    return {
      variant,
      width,
      minWidth: undefined,
      mobileWidth,
      padding: '12px 28px',
      borderRadius: 9999,
      fontSize: 15,
      fontWeight: 500,
      background: 'rgba(0, 0, 0, 0.28)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.9)',
      openInNewTab: cfgBool(config, `${settingsBase}.openInNewTab`, false),
    };
  }

  return {
    variant,
    width,
    mobileWidth,
    minWidth: undefined,
    padding: isPrimary ? '14px 28px' : '14px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    background: isPrimary ? colors.primary : 'transparent',
    color: isPrimary ? colors.background : colors.text,
    border: isPrimary ? 'none' : `1px solid ${colors.line}`,
    openInNewTab: cfgBool(config, `${settingsBase}.openInNewTab`, false),
  };
}
