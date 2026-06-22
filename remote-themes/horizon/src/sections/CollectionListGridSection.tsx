import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import {
  CollectionTileIllustration,
  type CollectionIllustrationVariant,
} from '../lib/CollectionBentoIllustrations';
import { readCollectionTiles } from '../lib/collectionListBentoStyles';
import {
  readCollectionListGridLayout,
  scopedCollectionListGridCss,
} from '../lib/collectionListGridStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function CollectionListGridSection({
  sectionId = 'collection_list_grid',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readCollectionListGridLayout(config, settingsBase),
    [config, settingsBase]
  );

  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-collection-list-grid-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

  const outerStyle: CSSProperties = {
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    background: style.scheme.background,
    color: style.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const innerStyle: CSSProperties =
    style.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${style.columns}, minmax(0, 1fr))`,
    columnGap: style.horizontalGap,
    rowGap: style.verticalGap,
  };

  const imageBox: CSSProperties = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 8,
    background: '#ececec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  };

  const titleBadge: CSSProperties = {
    position: 'absolute',
    top: 10,
    left: 10,
    margin: 0,
    padding: '4px 8px',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.2,
    background: '#ffffff',
    borderRadius: 4,
    color: '#111827',
    fontFamily: fontBody,
    zIndex: 1,
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection list: Grid"
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      <div
        className={scopeClass}
        style={innerStyle}
        data-grid-columns={style.columns}
        data-mobile-columns={style.mobileColumns}
        data-carousel-mobile={style.carouselOnMobile ? 'true' : 'false'}
      >
        <style>
          {`
            @media (max-width: 749px) {
              .${scopeClass}[data-carousel-mobile="false"] [data-grid-track] {
                grid-template-columns: repeat(${style.mobileColumns}, minmax(0, 1fr)) !important;
              }
              .${scopeClass}[data-carousel-mobile="true"] [data-grid-track] {
                display: flex !important;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: ${style.horizontalGap}px;
                padding-bottom: 4px;
              }
              .${scopeClass}[data-carousel-mobile="true"] [data-grid-track]::-webkit-scrollbar {
                display: none;
              }
              .${scopeClass}[data-carousel-mobile="true"] [data-grid-tile] {
                flex: 0 0 calc(${style.mobileColumns === 1 ? '88' : '46'}% - 8px);
                scroll-snap-align: start;
              }
            }
            ${scopedCollectionListGridCss(sectionId, style.customCss)}
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

        <div data-grid-track style={gridStyle}>
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
              <EditorBlock key={tile.id} nodeId={blockNodeId} label="Collection">
                <div data-grid-tile>
                  <Link
                    to={tile.href}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={imageBox}>
                      <span style={titleBadge}>
                        <EditorField fieldPath={`${blockBase}.title`} label="Title">
                          {tile.title}
                        </EditorField>
                      </span>
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
                  </Link>
                </div>
              </EditorBlock>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
