import { cfgString } from './config';

export type FooterBlockTypography = {
  fontSize: string;
  textTransform: 'none' | 'uppercase';
};

export function readFooterBlockTypography(
  config: Record<string, unknown> | null,
  settingsBase: string
): FooterBlockTypography {
  const textCase = cfgString(config, `${settingsBase}.textCase`, 'default');
  return {
    fontSize: cfgString(config, `${settingsBase}.fontSize`, '12px'),
    textTransform: textCase === 'uppercase' ? 'uppercase' : 'none',
  };
}
