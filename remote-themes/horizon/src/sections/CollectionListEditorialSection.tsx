import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import {
  CollectionTileIllustration,
  type CollectionIllustrationVariant,
} from '../lib/CollectionBentoIllustrations';
import { readCollectionTiles } from '../lib/collectionListBentoStyles';
import {
  editorialTilePlacement,
  readCollectionListEditorialLayout,
  scopedCollectionListEditorialCss,
} from '../lib/collectionListEditorialStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function CollectionListEditorialSection({
  sectionId = 'collection_list_editorial',
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

  const layoutStyle = useMemo(
    () => readCollectionListEditorialLayout(config, settingsBase),
    [config, settingsBase]
  );

  const allTiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const tiles = useMemo(
    () => allTiles.slice(0, layoutStyle.collectionCount),
    [allTiles, layoutStyle.collectionCount]
  );

  const scopeClass = `ziplofy-collection-list-editorial-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '0.85fr 1.25fr',
    gap: layoutStyle.layoutGap,
    alignItems: 'start',
  };

  const mobileCarousel = layoutStyle.carouselOnMobile;

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection list: Editorial"
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      <div
        className={scopeClass}
        style={innerStyle}
        data-editorial-carousel={mobileCarousel ? 'true' : 'false'}
      >
        <style>
          {`
            @media (max-width: 749px) {
              .${scopeClass}[data-editorial-carousel="true"] [data-editorial-grid] {
                display: flex;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                gap: 16px;
                padding-bottom: 4px;
              }
              .${scopeClass}[data-editorial-carousel="true"] [data-editorial-grid]::-webkit-scrollbar {
                display: none;
              }
              .${scopeClass}[data-editorial-carousel="true"] [data-editorial-tile] {
                flex: 0 0 78%;
                min-width: 0;
                scroll-snap-align: start;
                margin-top: 0 !important;
                grid-column: auto !important;
              }
            }
            ${scopedCollectionListEditorialCss(sectionId, layoutStyle.customCss)}
          `}
        </style>

        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="h2"
          style={{
            margin: `0 0 ${Math.min(layoutStyle.layoutGap, 48)}px`,
            fontSize: 28,
            fontWeight: 700,
            fontFamily: fontHeading,
          }}
        >
          {layoutStyle.heading}
        </EditorField>

        <div data-editorial-grid style={gridStyle}>
          {tiles.map((tile, index) => {
            const placementSpec = editorialTilePlacement(index);
            const blockBase =
              placement === 'template'
                ? `templates.${templateId}.sections.${sectionId}.blocks.${tile.id}.settings`
                : `sections.${sectionId}.blocks.${tile.id}.settings`;
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${tile.id}`
                : `layout:${sectionId}:block:${tile.id}`;

            const tileStyle: CSSProperties = {
              gridColumn: placementSpec.gridColumn,
              marginTop: placementSpec.marginTop,
              minHeight: placementSpec.minHeight,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 8,
              background: '#ececec',
              overflow: 'hidden',
            };

            return (
              <EditorBlock key={tile.id} nodeId={blockNodeId} label="Collection" style={tileStyle}>
                <div data-editorial-tile>
                  <Link
                    to={tile.href}
                    style={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                      textDecoration: 'none',
                      color: 'inherit',
                      minHeight: placementSpec.minHeight,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                      }}
                    >
                      {tile.imageUrl ? (
                        <img
                          src={tile.imageUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <CollectionTileIllustration
                          variant={tile.illustrationVariant as CollectionIllustrationVariant}
                          wide={placementSpec.wideIllustration}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        padding: '10px 12px',
                        fontSize: 14,
                        fontWeight: 500,
                        fontFamily: fontBody,
                      }}
                    >
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
      </div>
    </EditorSection>
  );
}
