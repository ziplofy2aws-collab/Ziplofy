import { cfgBool, cfgString } from './config';
import { readFooterBlockTypography } from './footerBlockTypography';

export type CopyrightStyle = {
  fontSize: string;
  textTransform: 'none' | 'uppercase';
  showPoweredBy: boolean;
  poweredByLabel: string;
  storeLabel: string;
};

export function readCopyrightStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CopyrightStyle {
  const rawText = cfgString(config, `${settingsBase}.text`, '');
  const storeLabel = rawText.replace(/^©\s*\d{4}\s*/i, '').replace(/\s*\.\s*All rights reserved\.?$/i, '').trim();
  const typography = readFooterBlockTypography(config, settingsBase);

  return {
    ...typography,
    showPoweredBy: cfgBool(config, `${settingsBase}.showPoweredBy`, false),
    poweredByLabel: cfgString(config, `${settingsBase}.poweredByLabel`),
    storeLabel,
  };
}

export function formatCopyrightLine(style: CopyrightStyle, year = new Date().getFullYear()): string {
  const base = style.storeLabel ? `© ${year} ${style.storeLabel}` : `© ${year}`;
  if (!style.showPoweredBy || !style.poweredByLabel.trim()) return base;
  return `${base}, ${style.poweredByLabel.trim()}`;
}
