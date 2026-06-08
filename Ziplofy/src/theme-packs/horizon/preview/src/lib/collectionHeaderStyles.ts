import { cfgBool, cfgNumber, cfgString } from './config';
import type { FeaturedCollectionScheme } from './featuredCollectionStyles';

export type CollectionHeaderLayout = {
  flexDirection: 'row' | 'column';
  justifyContent: string;
  alignItems: string;
  gap: number;
  flexWrap: 'wrap' | 'nowrap';
  width: string;
  minHeight: string | number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
  border: string | undefined;
  background: string;
  backgroundImage: string | undefined;
  color: string;
  mobileStack: boolean;
};

function sizeToCss(mode: string, customPx?: number): string {
  if (mode === 'fit') return 'fit-content';
  if (mode === 'custom' && customPx != null && customPx > 0) return `${customPx}px`;
  return '100%';
}

function positionToAlignItems(position: string, baseline: boolean): string {
  if (baseline) return 'baseline';
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

export function readCollectionHeaderLayout(
  config: Record<string, unknown> | null,
  settingsBase: string,
  sectionScheme: FeaturedCollectionScheme,
  lineColor: string
): CollectionHeaderLayout {
  const direction = cfgString(config, `${settingsBase}.direction`, 'horizontal');
  const layoutAlignment = cfgString(config, `${settingsBase}.layoutAlignment`, 'space-between');
  const position = cfgString(config, `${settingsBase}.position`, 'bottom');
  const alignBaseline = cfgBool(config, `${settingsBase}.alignTextBaseline`, true);
  const gap = cfgNumber(config, `${settingsBase}.layoutGap`, 12);
  const width = cfgString(config, `${settingsBase}.width`, 'fill');
  const height = cfgString(config, `${settingsBase}.height`, 'fit');
  const inheritScheme = cfgBool(config, `${settingsBase}.inheritColorScheme`, true);
  const bgMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
  const bgUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '').trim();
  const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
  const radius = Math.max(0, cfgNumber(config, `${settingsBase}.cornerRadius`, 0));
  const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, false);

  const schemeBg = inheritScheme ? sectionScheme.background : sectionScheme.background;
  const schemeColor = inheritScheme ? sectionScheme.color : sectionScheme.color;

  return {
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    justifyContent: layoutAlignment,
    alignItems: positionToAlignItems(position, alignBaseline),
    gap,
    flexWrap: 'wrap',
    width: sizeToCss(width),
    minHeight: height === 'fit' ? 'auto' : height === 'fill' ? '100%' : 'auto',
    paddingTop: cfgNumber(config, `${settingsBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${settingsBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${settingsBase}.paddingLeft`, 0),
    paddingRight: cfgNumber(config, `${settingsBase}.paddingRight`, 0),
    borderRadius: radius,
    border: borderStyle === 'solid' ? `1px solid ${lineColor}` : undefined,
    background: schemeBg,
    backgroundImage:
      bgMedia === 'image' && bgUrl ? `url(${bgUrl})` : undefined,
    color: schemeColor,
    mobileStack: verticalOnMobile,
  };
}

/** Scoped CSS for mobile stack + mobile width on collection header block. */
export function collectionHeaderResponsiveCss(
  sectionId: string,
  mobileWidth: string,
  verticalOnMobile: boolean
): string {
  const sel = `[data-ziplofy-section="${sectionId}"] [data-fc-collection-header]`;
  let css = '';
  if (verticalOnMobile) {
    css += `@media (max-width: 749px) { ${sel} { flex-direction: column !important; align-items: stretch !important; } }`;
  }
  if (mobileWidth === 'fit') {
    css += `@media (max-width: 749px) { ${sel} { width: fit-content !important; max-width: 100%; } }`;
  } else if (mobileWidth === 'fill') {
    css += `@media (max-width: 749px) { ${sel} { width: 100% !important; } }`;
  }
  return css;
}
