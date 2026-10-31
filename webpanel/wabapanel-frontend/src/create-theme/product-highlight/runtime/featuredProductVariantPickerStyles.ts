import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';

export type FeaturedProductVariantPickerStyle = {
  style: 'buttons' | 'dropdown';
  swatches: boolean;
  alignment: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readFeaturedProductVariantPickerStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): FeaturedProductVariantPickerStyle {
  const rawStyle = cfgString(config, `${settingsBase}.style`, 'buttons');
  const rawAlign = cfgString(config, `${settingsBase}.alignment`, 'left');
  return {
    style: rawStyle === 'dropdown' ? 'dropdown' : 'buttons',
    swatches: cfgBool(config, `${settingsBase}.swatches`, false),
    alignment:
      rawAlign === 'center' ? 'center' : rawAlign === 'right' ? 'right' : 'left',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 8),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
  };
}
