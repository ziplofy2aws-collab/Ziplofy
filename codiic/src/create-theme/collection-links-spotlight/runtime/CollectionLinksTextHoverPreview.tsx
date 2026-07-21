import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { EditorField } from '../../runtime/shared/editorAttrs';
import type { CollectionLinkSpotlightMedia } from './collectionLinksStyles';

const CURSOR_OFFSET = 16;

type Props = {
  hover: { linkId: string; x: number; y: number } | null;
  media: CollectionLinkSpotlightMedia | null;
};

export function CollectionLinksTextHoverPreview({ hover, media }: Props) {
  if (!hover || !media?.imageUrl || typeof document === 'undefined') return null;

  const panelStyle: CSSProperties = {
    position: 'fixed',
    left: hover.x + CURSOR_OFFSET,
    top: hover.y + CURSOR_OFFSET,
    zIndex: 10000,
    pointerEvents: 'none',
    width: media.imageStyle.width,
    maxHeight: media.imageStyle.maxHeight,
    aspectRatio: media.imageStyle.aspectRatio,
    borderRadius: media.imageStyle.borderRadius,
    overflow: 'hidden',
    background: '#ececec',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    transition: 'opacity 0.15s ease',
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: media.imageStyle.objectFit,
    display: 'block',
  };

  return createPortal(
    <div style={panelStyle}>
      <EditorField fieldPath={media.imageFieldPath} label="Image">
        <img src={media.imageUrl} alt="" style={imgStyle} />
      </EditorField>
    </div>,
    document.body
  );
}
