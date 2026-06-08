import { useMemo, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import {
  CollectionTileIllustration,
  type CollectionIllustrationVariant,
} from '../lib/CollectionBentoIllustrations';
import { readCollectionTiles } from '../lib/collectionListBentoStyles';
import {
  readCollectionListCarouselLayout,
  scopedCollectionListCarouselCss,
} from '../lib/collectionListCarouselStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function NavButton({
  label,
  onClick,
  background,
  shape,
}: {
  label: string;
  onClick: () => void;
  background: 'none' | 'circle' | 'square';
  shape: 'arrows' | 'chevron';
}) {
  const btnStyle: CSSProperties = {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: background === 'none' ? 32 : 36,
    height: background === 'none' ? 32 : 36,
    border: 'none',
    cursor: 'pointer',
    background:
      background === 'circle' || background === 'square' ? 'rgba(255,255,255,0.95)' : 'transparent',
    borderRadius: background === 'circle' ? '50%' : background === 'square' ? 6 : 0,
    boxShadow: background !== 'none' ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
    color: '#111827',
    fontSize: shape === 'chevron' ? 18 : 20,
    lineHeight: 1,
  };

  return (
    <button type="button" aria-label={label} onClick={onClick} style={btnStyle}>
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function CollectionListCarouselSection({
  sectionId = 'collection_list_carousel',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const trackRef = useRef<HTMLDivElement>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readCollectionListCarouselLayout(config, settingsBase),
    [config, settingsBase]
  );

  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-collection-list-carousel-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : 24;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.contentMaxWidth;
  const cardBasis =
    style.columns > 0
      ? `calc((100% - ${(style.columns - 1) * style.horizontalGap}px) / ${style.columns})`
      : '200px';

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  const showNav = style.navigationIcon !== 'none' && tiles.length > style.columns;

  const shell: CSSProperties = {
    background: style.scheme.background,
    color: style.scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
  };

  const rowWrap: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const track: CSSProperties = {
    display: 'flex',
    gap: style.horizontalGap,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    flex: 1,
    paddingBottom: 4,
  };

  const cardStyle: CSSProperties = {
    flex: `0 0 ${cardBasis}`,
    minWidth: 0,
    scrollSnapAlign: 'start',
  };

  const imageBox: CSSProperties = {
    aspectRatio: '1',
    borderRadius: 8,
    background: '#ececec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  };

  const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    color: '#111827',
  };

  return (
    <EditorSection sectionId={sectionId} label="Collection list: Carousel" editorNodeId={editorNodeId} style={shell}>
      <div className={scopeClass} style={stage} data-mobile-columns={style.mobileColumns}>
        <style>
          {`
            .${scopeClass} [data-carousel-track]::-webkit-scrollbar { display: none; }
            @media (max-width: 749px) {
              .${scopeClass}[data-mobile-columns="1"] [data-collection-card] {
                flex: 0 0 calc(100% - 8px);
              }
              .${scopeClass}[data-mobile-columns="2"] [data-collection-card] {
                flex: 0 0 calc(50% - ${style.horizontalGap / 2}px);
              }
            }
            ${scopedCollectionListCarouselCss(sectionId, style.customCss)}
          `}
        </style>

        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="h2"
          style={{
            margin: `0 0 ${style.layoutGap}px`,
            fontSize: 28,
            fontWeight: 700,
            fontFamily: fontHeading,
          }}
        >
          {style.heading}
        </EditorField>

        <div style={rowWrap}>
          {showNav ? (
            <NavButton
              label="Previous"
              onClick={() => scrollByPage(-1)}
              background={style.navigationIconBackground}
              shape={style.navigationIcon === 'chevron' ? 'chevron' : 'arrows'}
            />
          ) : null}

          <div ref={trackRef} data-carousel-track style={track}>
            {tiles.map((tile) => {
              const blockBase =
                placement === 'template'
                  ? `templates.${templateId}.sections.${sectionId}.blocks.${tile.id}.settings`
                  : `sections.${sectionId}.blocks.${tile.id}.settings`;
              const blockNodeId =
                placement === 'template'
                  ? `template:${templateId}:${sectionId}:block:${tile.id}`
                  : `layout:${sectionId}:block:${tile.id}`;

              return (
                <EditorBlock key={tile.id} nodeId={blockNodeId} label="Collection" style={cardStyle}>
                  <div data-collection-card>
                  <Link
                    to={tile.href}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={imageBox}>
                      {tile.imageUrl ? (
                        <img
                          src={tile.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <CollectionTileIllustration
                          variant={tile.illustrationVariant as CollectionIllustrationVariant}
                        />
                      )}
                    </div>
                    <p style={titleStyle}>
                      <EditorField fieldPath={`${blockBase}.title`} label="Title">
                        {tile.title}
                      </EditorField>
                    </p>
                  </Link>
                  </div>
                </EditorBlock>
              );
            })}
          </div>

          {showNav ? (
            <NavButton
              label="Next"
              onClick={() => scrollByPage(1)}
              background={style.navigationIconBackground}
              shape={style.navigationIcon === 'chevron' ? 'chevron' : 'arrows'}
            />
          ) : null}
        </div>
      </div>
    </EditorSection>
  );
}
