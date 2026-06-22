import { cfgBool, cfgString } from './config';

export type HeroButtonStyle = {
  variant: 'primary' | 'secondary';
  width: string;
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
  const desktopWidth = cfgString(config, `${settingsBase}.desktopWidth`, 'fit');

  const isPrimary = variant === 'primary';
  const onImage = Boolean(options?.onImageHero);

  if (onImage && isPrimary) {
    return {
      variant,
      width: desktopWidth === 'custom' ? 'auto' : 'fit-content',
      minWidth: desktopWidth === 'custom' ? '140px' : undefined,
      padding: '12px 28px',
      borderRadius: 9999,
      fontSize: 15,
      fontWeight: 500,
      background: 'transparent',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.85)',
      openInNewTab: cfgBool(config, `${settingsBase}.openInNewTab`, false),
    };
  }

  return {
    variant,
    width: desktopWidth === 'custom' ? 'auto' : 'fit-content',
    minWidth: desktopWidth === 'custom' ? '140px' : undefined,
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
