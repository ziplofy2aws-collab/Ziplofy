import type { CSSProperties } from 'react';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { readTextBlockLayoutStyle, readTextBlockStyle } from '../../runtime/shared/textBlockStyles';

export type CollectionListCardStyle = {
  placement: 'on_image' | 'below_image';
  horizontalAlignment: 'flex-start' | 'center' | 'flex-end';
  verticalAlignment: 'flex-start' | 'center' | 'flex-end';
  verticalGap: number;
  inheritColorScheme: boolean;
  borderStyle: 'none' | 'solid';
  cornerRadius: number;
};

function parsePlacement(raw: string): CollectionListCardStyle['placement'] {
  return raw === 'below_image' ? 'below_image' : 'on_image';
}

function parseFlexAlign(raw: string): CollectionListCardStyle['horizontalAlignment'] {
  if (raw === 'center' || raw === 'flex-end') return raw;
  return 'flex-start';
}

export function readCollectionListCardStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListCardStyle {
  const base = `${settingsBase}.collectionCard`;
  return {
    placement: parsePlacement(cfgString(config, `${base}.placement`, 'on_image')),
    horizontalAlignment: parseFlexAlign(
      cfgString(config, `${base}.horizontalAlignment`, 'flex-start')
    ),
    verticalAlignment: parseFlexAlign(
      cfgString(config, `${base}.verticalAlignment`, 'flex-end')
    ),
    verticalGap: cfgNumber(config, `${base}.verticalGap`, 8),
    inheritColorScheme: cfgBool(config, `${base}.inheritColorScheme`, false),
    borderStyle: cfgString(config, `${base}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${base}.cornerRadius`, 0),
  };
}

export function collectionListCardShellStyle(card: CollectionListCardStyle): CSSProperties {
  return {
    borderRadius: card.cornerRadius,
    border: card.borderStyle === 'solid' ? '1px solid rgba(0,0,0,0.12)' : undefined,
    overflow: 'hidden',
  };
}

export type CollectionListCardImageStyle = {
  imageRatio: 'adapt' | 'portrait' | 'square' | 'landscape';
  mediaOverlay: boolean;
  borderStyle: 'none' | 'solid';
  cornerRadius: number;
};

function parseImageRatio(raw: string): CollectionListCardImageStyle['imageRatio'] {
  if (raw === 'portrait' || raw === 'square' || raw === 'landscape') return raw;
  return 'adapt';
}

export function readCollectionListCardImageStyle(
  config: Record<string, unknown> | null,
  settingsBase: string
): CollectionListCardImageStyle {
  const base = `${settingsBase}.collectionCardImage`;
  return {
    imageRatio: parseImageRatio(cfgString(config, `${base}.imageRatio`, 'adapt')),
    mediaOverlay: cfgBool(config, `${base}.mediaOverlay`, false),
    borderStyle: cfgString(config, `${base}.borderStyle`, 'none') === 'solid' ? 'solid' : 'none',
    cornerRadius: cfgNumber(config, `${base}.cornerRadius`, 0),
  };
}

const IMAGE_ASPECT_RATIOS: Record<
  Exclude<CollectionListCardImageStyle['imageRatio'], 'adapt'>,
  string
> = {
  portrait: '3 / 4',
  square: '1 / 1',
  landscape: '16 / 9',
};

export function collectionListCardImageWrapperStyle(
  image: CollectionListCardImageStyle
): CSSProperties {
  return {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: image.cornerRadius,
    border: image.borderStyle === 'solid' ? '1px solid rgba(0,0,0,0.12)' : undefined,
    ...(image.imageRatio !== 'adapt'
      ? { aspectRatio: IMAGE_ASPECT_RATIOS[image.imageRatio] }
      : {}),
  };
}

export function collectionListCardImageOverlayStyle(
  image: CollectionListCardImageStyle
): CSSProperties | undefined {
  if (!image.mediaOverlay) return undefined;
  return {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.15)',
    pointerEvents: 'none',
    borderRadius: image.cornerRadius,
  };
}

function collectionListCardTitlePositionStyle(card: CollectionListCardStyle): CSSProperties {
  if (card.placement === 'below_image') {
    return {
      display: 'block',
      marginTop: card.verticalGap,
      textAlign:
        card.horizontalAlignment === 'center'
          ? 'center'
          : card.horizontalAlignment === 'flex-end'
            ? 'right'
            : 'left',
    };
  }

  return {
    position: 'absolute',
    left: card.horizontalAlignment === 'flex-end' ? undefined : 12,
    right: card.horizontalAlignment === 'flex-end' ? 12 : undefined,
    top: card.verticalAlignment === 'flex-start' ? 12 : undefined,
    bottom: card.verticalAlignment === 'flex-end' ? 12 : undefined,
    transform: card.verticalAlignment === 'center' ? 'translateY(-50%)' : undefined,
    ...(card.verticalAlignment === 'center' ? { top: '50%' } : {}),
    margin:
      card.verticalAlignment === 'center' || card.horizontalAlignment === 'center'
        ? '0 auto'
        : undefined,
    textAlign:
      card.horizontalAlignment === 'center'
        ? 'center'
        : card.horizontalAlignment === 'flex-end'
          ? 'right'
          : 'left',
    maxWidth: card.horizontalAlignment === 'center' ? 'calc(100% - 24px)' : undefined,
    zIndex: 1,
  };
}

export function collectionListCardTitleDisplayStyle(
  config: Record<string, unknown> | null,
  settingsBase: string,
  card: CollectionListCardStyle,
  fonts: { fontBody: string; fontHeading: string },
  color = '#111827'
): CSSProperties {
  const titleBase = `${settingsBase}.collectionCardTitle`;
  const backgroundEnabled = cfgBool(config, `${titleBase}.backgroundEnabled`, true);
  const backgroundColor = cfgString(config, `${titleBase}.backgroundColor`, '#FFFFFF');
  const cornerRadius = cfgNumber(config, `${titleBase}.cornerRadius`, 0);
  const typoStyle = readTextBlockStyle(config, titleBase, fonts, color);
  const layoutStyle = readTextBlockLayoutStyle(config, titleBase);

  return {
    ...collectionListCardTitlePositionStyle(card),
    ...typoStyle,
    ...layoutStyle,
    background: backgroundEnabled ? backgroundColor : undefined,
    borderRadius: backgroundEnabled ? cornerRadius : undefined,
    boxShadow: backgroundEnabled ? '0 1px 2px rgba(0,0,0,0.06)' : undefined,
    boxSizing: 'border-box',
  };
}
