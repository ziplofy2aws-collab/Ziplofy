import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import {
  CollectionTileIllustration,
  type CollectionIllustrationVariant,
} from '../lib/CollectionBentoIllustrations';
import {
  readCollectionListBentoLayout,
  readCollectionTiles,
  scopedCollectionListBentoCss,
} from '../lib/collectionListBentoStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function BentoTile({
  tile,
  gap,
  blockBase,
  blockNodeId,
  fontBody,
}: {
  tile: ReturnType<typeof readCollectionTiles>[number];
  gap: number;
  blockBase: string;
  blockNodeId: string;
  fontBody: string;
}) {
  const span = tile.columnSpan === 2 ? 2 : 1;
  const tileStyle: CSSProperties = {
    gridColumn: `span ${span}`,
    minHeight: span === 2 ? 120 : 140,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 8,
    background: '#ececec',
  };

  return (
    <EditorBlock nodeId={blockNodeId} label="Collection" style={tileStyle}>
      <Link
        to={tile.href}
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: gap,
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
              wide={span === 2}
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
            color: '#111827',
          }}
        >
          <EditorField fieldPath={`${blockBase}.title`} label="Title">
            {tile.title}
          </EditorField>
        </p>
      </Link>
    </EditorBlock>
  );
}

export function CollectionListBentoSection({
  sectionId = 'collection_list_bento',
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
    () => readCollectionListBentoLayout(config, settingsBase),
    [config, settingsBase]
  );

  const tiles = useMemo(
    () => readCollectionTiles(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-collection-list-bento-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedCollectionListBentoCss(sectionId, layoutStyle.customCss);

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const headingPath = `${settingsBase}.heading`;

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(2, minmax(120px, auto))',
    gap: layoutStyle.cardsGap,
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection list: Bento"
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      {customCss ? <style>{customCss}</style> : null}
      <div className={scopeClass} style={innerStyle}>
        <EditorField
          fieldPath={headingPath}
          label="Heading"
          as="h2"
          style={{
            margin: `0 0 ${layoutStyle.layoutGap}px`,
            fontSize: 28,
            fontWeight: 700,
            fontFamily: fontHeading,
          }}
        >
          {layoutStyle.heading}
        </EditorField>

        <div style={gridStyle}>
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
                gap={layoutStyle.cardsGap}
                blockBase={blockBase}
                blockNodeId={blockNodeId}
                fontBody={fontBody}
              />
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
