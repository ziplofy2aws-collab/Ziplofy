import { cfgBool, cfgNumber, cfgString } from './config';
import type { FeaturedCollectionScheme } from './featuredCollectionStyles';

export type ProductCardStyle = {
  verticalGap: number;
  background: string;
  color: string;
  border: string;
  borderRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readProductCardStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  scheme: FeaturedCollectionScheme,
  lineColor: string
): ProductCardStyle {
  const inherit = cfgBool(config, `${settingsBase}.inheritColorScheme`, true);
  const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 0);

  return {
    verticalGap: cfgNumber(config, `${settingsBase}.verticalGap`, 4),
    background: inherit ? scheme.background : scheme.background,
    color: inherit ? scheme.color : scheme.color,
    border: borderStyle === 'solid' ? `1px solid ${lineColor}` : 'none',
    borderRadius: cornerRadius,
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
  };
}
