import { cfgNumber, cfgString } from './config';

const ASPECT_RATIOS: Record<string, string | undefined> = {
  auto: undefined,
  '1/1': '1 / 1',
  '4/5': '4 / 5',
  '3/4': '3 / 4',
  '16/9': '16 / 9',
  '2/3': '2 / 3',
};

export type ProductCardMediaStyle = {
  aspectRatio: string | undefined;
  border: string;
  borderRadius: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export function readProductCardMediaStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  lineColor: string
): ProductCardMediaStyle {
  const aspectKey = cfgString(config, `${settingsBase}.mediaAspectRatio`, 'auto');
  const borderStyle = cfgString(config, `${settingsBase}.mediaBorderStyle`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsBase}.mediaCornerRadius`, 0);

  return {
    aspectRatio: ASPECT_RATIOS[aspectKey] ?? ASPECT_RATIOS['4/5'],
    border: borderStyle === 'solid' ? `1px solid ${lineColor}` : 'none',
    borderRadius: cornerRadius,
    paddingTop: cfgNumber(config, `${settingsBase}.mediaPaddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.mediaPaddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.mediaPaddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.mediaPaddingRight`, 0),
  };
}
