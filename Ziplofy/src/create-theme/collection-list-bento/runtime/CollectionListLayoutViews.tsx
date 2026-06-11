import { useMemo, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { EditorBlock, EditorField } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { readTextBlockLayoutStyle, readTextBlockStyle } from '../../runtime/shared/textBlockStyles';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { cfgString } from '../../runtime/shared/config';
import type { SectionRuntimeProps } from '../../runtime/types';
import {
  CollectionTileIllustration,
  type CollectionIllustrationVariant,
} from './CollectionBentoIllustrations';
import {
  collectionListBentoMobileCarouselCss,
  readCollectionListBentoLayout,
  readCollectionTiles,
  scopedCollectionListBentoCss,
  sectionScopeClass,
  type CollectionTileData,
} from './collectionListBentoStyles';
import { readCollectionListGridLayout, scopedCollectionListGridCss } from './collectionListGridStyles';
import {
  readCollectionListCarouselLayout,
  scopedCollectionListCarouselCss,
} from './collectionListCarouselStyles';
import {
  editorialTilePlacement,
  readCollectionListEditorialLayout,
  scopedCollectionListEditorialCss,
} from './collectionListEditorialStyles';
import {
  collectionListCardImageOverlayStyle,
  collectionListCardImageWrapperStyle,
  collectionListCardShellStyle,
  collectionListCardTitleDisplayStyle,
  readCollectionListCardImageStyle,
  readCollectionListCardStyle,
  type CollectionListCardImageStyle,
  type CollectionListCardStyle,
} from './collectionListCardStyles';

type LayoutProps = SectionRuntimeProps & {
  settingsBase: string;
  editorNodeId: string;
};

const TILE_BG = '#ececec';

function CollectionListSectionHeading({
  config,
  settingsBase,
  layoutGap,
  color,
  fontHeading,
  fontBody,
}: {
  config: Record<string, unknown> | null;
  settingsBase: string;
  layoutGap: number;
  color: string;
  fontHeading: string;
  fontBody: string;
}) {
  const headingTextBase = `${settingsBase}.headingText.settings`;
  const headingHtml =
    cfgString(config, `${headingTextBase}.text`, '') ||
    cfgString(config, `${settingsBase}.heading`, 'Shop by collection');
  const textStyle = useMemo(
    () => readTextBlockStyle(config, headingTextBase, { fontHeading, fontBody }, color),
    [config, headingTextBase, fontHeading, fontBody, color]
  );
  const layoutStyle = useMemo(
    () => readTextBlockLayoutStyle(config, headingTextBase),
    [config, headingTextBase]
  );

  return (
    <EditorField
      fieldPath={`${settingsBase}.heading`}
      label="Text"
      as="div"
      style={{ margin: `0 0 ${layoutGap}px`, display: 'flex', flexDirection: 'column' }}
    >
      <ThemeEditorRichTextContent
        html={headingHtml}
        style={{ ...textStyle, ...layoutStyle, margin: 0 }}
      />
    </EditorField>
  );
}

function CollectionListTileImageArea({
  tile,
  cardImageStyle,
  wide,
  style,
  children,
}: {
  tile: CollectionTileData;
  cardImageStyle: CollectionListCardImageStyle;
  wide?: boolean;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  const overlayStyle = collectionListCardImageOverlayStyle(cardImageStyle);
  return (
    <div style={{ ...collectionListCardImageWrapperStyle(cardImageStyle), ...style }}>
      {tile.imageUrl ? (
        <img
          src={tile.imageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <CollectionTileIllustration
          variant={tile.illustrationVariant as CollectionIllustrationVariant}
          wide={wide}
        />
      )}
      {overlayStyle ? <div style={overlayStyle} aria-hidden /> : null}
      {children}
    </div>
  );
}

function CollectionListTileTitle({
  tile,
  blockBase,
  cardStyle,
  config,
  settingsBase,
  fontBody,
  fontHeading,
}: {
  tile: CollectionTileData;
  blockBase: string;
  cardStyle: CollectionListCardStyle;
  config: Record<string, unknown> | null;
  settingsBase: string;
  fontBody: string;
  fontHeading: string;
}) {
  return (
    <span
      style={collectionListCardTitleDisplayStyle(config, settingsBase, cardStyle, {
        fontBody,
        fontHeading,
      })}
    >
      <EditorField fieldPath={`${blockBase}.title`} label="Collection title">
        {tile.title || 'Collection title'}
      </EditorField>
    </span>
  );
}

function BentoTile({
  tile,
  blockBase,
  blockNodeId,
  fontBody,
  cardStyle,
  cardImageStyle,
  config,
  settingsBase,
  fontHeading,
}: {
  tile: CollectionTileData;
  blockBase: string;
  blockNodeId: string;
  fontBody: string;
  cardStyle: CollectionListCardStyle;
  cardImageStyle: CollectionListCardImageStyle;
  config: Record<string, unknown> | null;
  settingsBase: string;
  fontHeading: string;
}) {
  const span = tile.columnSpan === 2 ? 2 : 1;
  const onImage = cardStyle.placement === 'on_image';
  const tileStyle: CSSProperties = {
    gridColumn: `span ${span}`,
    position: 'relative',
    minHeight: span === 2 ? 168 : 188,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...collectionListCardShellStyle(cardStyle),
    background: TILE_BG,
  };

  return (
    <EditorBlock
      nodeId={blockNodeId}
      label="Collection card"
      style={tileStyle}
      className="ziplofy-bento-tile"
    >
      <Link
        to={tile.href || '/collections/all'}
        style={{
          position: 'relative',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          textDecoration: 'none',
          color: 'inherit',
          minHeight: '100%',
        }}
      >
        <CollectionListTileImageArea
          tile={tile}
          cardImageStyle={cardImageStyle}
          wide={span === 2}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            paddingBottom: onImage ? 48 : 16,
          }}
        >
          {onImage ? (
            <CollectionListTileTitle
              tile={tile}
              blockBase={blockBase}
              cardStyle={cardStyle}
              config={config}
              settingsBase={settingsBase}
              fontBody={fontBody}
              fontHeading={fontHeading}
            />
          ) : null}
        </CollectionListTileImageArea>
        {!onImage ? (
          <CollectionListTileTitle
            tile={tile}
            blockBase={blockBase}
            cardStyle={cardStyle}
            config={config}
            settingsBase={settingsBase}
            fontBody={fontBody}
            fontHeading={fontHeading}
          />
        ) : null}
      </Link>
    </EditorBlock>
  );
}

export function CollectionListBentoLayoutView({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
  settingsBase,
}: LayoutProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const layoutStyle = useMemo(
    () => readCollectionListBentoLayout(config, settingsBase),
    [config, settingsBase]
  );
  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );
  const cardStyle = useMemo(
    () => readCollectionListCardStyle(config, settingsBase),
    [config, settingsBase]
  );
  const cardImageStyle = useMemo(
    () => readCollectionListCardImageStyle(config, settingsBase),
    [config, settingsBase]
  );
  const scopeClass = sectionScopeClass(sectionId);
  const horizontalPad = layoutStyle.sectionWidth === 'full' ? 24 : layout.padX;
  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: horizontalPad, paddingRight: horizontalPad }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: horizontalPad,
          paddingRight: horizontalPad,
        };

  return (
    <div className={scopeClass} style={innerStyle}>
      {scopedCollectionListBentoCss(sectionId, layoutStyle.customCss) ? (
        <style>{scopedCollectionListBentoCss(sectionId, layoutStyle.customCss)}</style>
      ) : null}
      {collectionListBentoMobileCarouselCss(sectionId, layoutStyle.carouselOnMobile) ? (
        <style>{collectionListBentoMobileCarouselCss(sectionId, layoutStyle.carouselOnMobile)}</style>
      ) : null}
      <CollectionListSectionHeading
        config={config}
        settingsBase={settingsBase}
        layoutGap={layoutStyle.layoutGap}
        color={layoutStyle.scheme.color}
        fontHeading={fontHeading}
        fontBody={fontBody}
      />
      <div
        className="ziplofy-bento-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, minmax(140px, auto))',
          gap: layoutStyle.cardsGap,
        }}
      >
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
            <BentoTile
              key={tile.id}
              tile={tile}
              blockBase={blockBase}
              blockNodeId={blockNodeId}
              fontBody={fontBody}
              cardStyle={cardStyle}
              cardImageStyle={cardImageStyle}
              config={config}
              settingsBase={settingsBase}
              fontHeading={fontHeading}
            />
          );
        })}
      </div>
    </div>
  );
}

export function CollectionListGridLayoutView({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
  settingsBase,
}: LayoutProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const style = useMemo(() => readCollectionListGridLayout(config, settingsBase), [config, settingsBase]);
  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );
  const cardStyle = useMemo(
    () => readCollectionListCardStyle(config, settingsBase),
    [config, settingsBase]
  );
  const cardImageStyle = useMemo(
    () => readCollectionListCardImageStyle(config, settingsBase),
    [config, settingsBase]
  );
  const scopeClass = `ziplofy-collection-list-grid-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const innerStyle: CSSProperties =
    style.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  return (
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
            }
            .${scopeClass}[data-carousel-mobile="true"] [data-grid-tile] {
              flex: 0 0 calc(${style.mobileColumns === 1 ? '88' : '46'}% - 8px);
              scroll-snap-align: start;
            }
          }
          ${scopedCollectionListGridCss(sectionId, style.customCss)}
        `}
      </style>
      <CollectionListSectionHeading
        config={config}
        settingsBase={settingsBase}
        layoutGap={style.layoutGap}
        color={style.scheme.color}
        fontHeading={fontHeading}
        fontBody={fontBody}
      />
      <div
        data-grid-track
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${style.columns}, minmax(0, 1fr))`,
          columnGap: style.horizontalGap,
          rowGap: style.verticalGap,
        }}
      >
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
            <EditorBlock key={tile.id} nodeId={blockNodeId} label="Collection card">
              <div data-grid-tile>
                <Link
                  to={tile.href || '/collections/all'}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <CollectionListTileImageArea
                    tile={tile}
                    cardImageStyle={cardImageStyle}
                    style={{
                      background: TILE_BG,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...collectionListCardShellStyle(cardStyle),
                    }}
                  >
                    {cardStyle.placement === 'on_image' ? (
                      <CollectionListTileTitle
                        tile={tile}
                        blockBase={blockBase}
                        cardStyle={cardStyle}
                        config={config}
                        settingsBase={settingsBase}
                        fontBody={fontBody}
                        fontHeading={fontHeading}
                      />
                    ) : null}
                  </CollectionListTileImageArea>
                  {cardStyle.placement === 'below_image' ? (
                    <CollectionListTileTitle
                      tile={tile}
                      blockBase={blockBase}
                      cardStyle={cardStyle}
                      config={config}
                      settingsBase={settingsBase}
                      fontBody={fontBody}
                      fontHeading={fontHeading}
                    />
                  ) : null}
                </Link>
              </div>
            </EditorBlock>
          );
        })}
      </div>
    </div>
  );
}

function CarouselNavButton({
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
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
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
      }}
    >
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function CollectionListCarouselLayoutView({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
  settingsBase,
}: LayoutProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const trackRef = useRef<HTMLDivElement>(null);
  const style = useMemo(
    () => readCollectionListCarouselLayout(config, settingsBase),
    [config, settingsBase]
  );
  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );
  const cardStyle = useMemo(
    () => readCollectionListCardStyle(config, settingsBase),
    [config, settingsBase]
  );
  const cardImageStyle = useMemo(
    () => readCollectionListCardImageStyle(config, settingsBase),
    [config, settingsBase]
  );
  const scopeClass = `ziplofy-collection-list-carousel-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const cardBasis = `calc((100% - ${(style.columns - 1) * style.horizontalGap}px) / ${style.columns})`;
  const showNav = style.navigationIcon !== 'none' && tiles.length > style.columns;

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85 * dir, behavior: 'smooth' });
  };

  return (
    <div className={scopeClass} style={{ maxWidth: layout.contentMaxWidth, margin: '0 auto' }} data-mobile-columns={style.mobileColumns}>
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
      <CollectionListSectionHeading
        config={config}
        settingsBase={settingsBase}
        layoutGap={style.layoutGap}
        color={style.scheme.color}
        fontHeading={fontHeading}
        fontBody={fontBody}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showNav ? (
          <CarouselNavButton
            label="Previous"
            onClick={() => scrollByPage(-1)}
            background={style.navigationIconBackground}
            shape={style.navigationIcon === 'chevron' ? 'chevron' : 'arrows'}
          />
        ) : null}
        <div
          ref={trackRef}
          data-carousel-track
          style={{
            display: 'flex',
            gap: style.horizontalGap,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            flex: 1,
            paddingBottom: 4,
          }}
        >
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
              <EditorBlock
                key={tile.id}
                nodeId={blockNodeId}
                label="Collection card"
                style={{ flex: `0 0 ${cardBasis}`, minWidth: 0, scrollSnapAlign: 'start' }}
              >
                <div data-collection-card>
                  <Link
                    to={tile.href || '/collections/all'}
                    style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  >
                    <CollectionListTileImageArea
                      tile={tile}
                      cardImageStyle={cardImageStyle}
                      style={{
                        background: TILE_BG,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: cardStyle.placement === 'below_image' ? 0 : 10,
                        ...collectionListCardShellStyle(cardStyle),
                      }}
                    >
                      {cardStyle.placement === 'on_image' ? (
                        <CollectionListTileTitle
                          tile={tile}
                          blockBase={blockBase}
                          cardStyle={cardStyle}
                          config={config}
                          settingsBase={settingsBase}
                          fontBody={fontBody}
                          fontHeading={fontHeading}
                        />
                      ) : null}
                    </CollectionListTileImageArea>
                    {cardStyle.placement === 'below_image' ? (
                      <CollectionListTileTitle
                        tile={tile}
                        blockBase={blockBase}
                        cardStyle={cardStyle}
                        config={config}
                        settingsBase={settingsBase}
                        fontBody={fontBody}
                        fontHeading={fontHeading}
                      />
                    ) : null}
                  </Link>
                </div>
              </EditorBlock>
            );
          })}
        </div>
        {showNav ? (
          <CarouselNavButton
            label="Next"
            onClick={() => scrollByPage(1)}
            background={style.navigationIconBackground}
            shape={style.navigationIcon === 'chevron' ? 'chevron' : 'arrows'}
          />
        ) : null}
      </div>
    </div>
  );
}

export function CollectionListEditorialLayoutView({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
  settingsBase,
}: LayoutProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
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
  const cardStyle = useMemo(
    () => readCollectionListCardStyle(config, settingsBase),
    [config, settingsBase]
  );
  const cardImageStyle = useMemo(
    () => readCollectionListCardImageStyle(config, settingsBase),
    [config, settingsBase]
  );
  const scopeClass = `ziplofy-collection-list-editorial-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 24, paddingRight: 24 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  return (
    <div
      className={scopeClass}
      style={innerStyle}
      data-editorial-carousel={layoutStyle.carouselOnMobile ? 'true' : 'false'}
    >
      <style>
        {`
          @media (max-width: 749px) {
            .${scopeClass}[data-editorial-carousel="true"] [data-editorial-grid] {
              display: flex;
              overflow-x: auto;
              scroll-snap-type: x mandatory;
              gap: 16px;
            }
            .${scopeClass}[data-editorial-carousel="true"] [data-editorial-tile] {
              flex: 0 0 78%;
              scroll-snap-align: start;
              margin-top: 0 !important;
              grid-column: auto !important;
            }
          }
          ${scopedCollectionListEditorialCss(sectionId, layoutStyle.customCss)}
        `}
      </style>
      <CollectionListSectionHeading
        config={config}
        settingsBase={settingsBase}
        layoutGap={Math.min(layoutStyle.layoutGap, 48)}
        color={layoutStyle.scheme.color}
        fontHeading={fontHeading}
        fontBody={fontBody}
      />
      <div
        data-editorial-grid
        style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.25fr',
          gap: layoutStyle.layoutGap,
          alignItems: 'start',
        }}
      >
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
          return (
            <EditorBlock
              key={tile.id}
              nodeId={blockNodeId}
              label="Collection card"
              style={{
                gridColumn: placementSpec.gridColumn,
                marginTop: placementSpec.marginTop,
                minHeight: placementSpec.minHeight,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 8,
                background: TILE_BG,
                overflow: 'hidden',
              }}
            >
              <div data-editorial-tile>
                <Link
                  to={tile.href || '/collections/all'}
                  style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    minHeight: placementSpec.minHeight,
                  }}
                >
                  <CollectionListTileImageArea
                    tile={tile}
                    cardImageStyle={cardImageStyle}
                    wide={placementSpec.wideIllustration}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                    }}
                  >
                    {cardStyle.placement === 'on_image' ? (
                      <CollectionListTileTitle
                        tile={tile}
                        blockBase={blockBase}
                        cardStyle={cardStyle}
                        config={config}
                        settingsBase={settingsBase}
                        fontBody={fontBody}
                        fontHeading={fontHeading}
                      />
                    ) : null}
                  </CollectionListTileImageArea>
                  {cardStyle.placement === 'below_image' ? (
                    <CollectionListTileTitle
                      tile={tile}
                      blockBase={blockBase}
                      cardStyle={cardStyle}
                      config={config}
                      settingsBase={settingsBase}
                      fontBody={fontBody}
                      fontHeading={fontHeading}
                    />
                  ) : null}
                </Link>
              </div>
            </EditorBlock>
          );
        })}
      </div>
    </div>
  );
}
