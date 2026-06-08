import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { CollectionLinksSpotlightArt } from '../lib/CollectionLinksSpotlightArt';
import { cfgString } from '../lib/config';
import {
  readCollectionLinks,
  readCollectionLinksSpotlightLayout,
  scopedCollectionLinksSpotlightCss,
  textAlignForAlignment,
  textLinksFlexJustifyForAlignment,
} from '../lib/collectionLinksSpotlightStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function CollectionLinksSpotlightSection({
  sectionId = 'collection_links_spotlight',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readCollectionLinksSpotlightLayout(config, settingsBase),
    [config, settingsBase]
  );

  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, 'collection-links-spotlight');
  const sectionLabel =
    layoutStyle.layoutMode === 'text' || catalogVariant === 'collection-links-text'
      ? 'Collection links: Text'
      : 'Collection links: Spotlight';

  const links = useMemo(
    () => readCollectionLinks(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-collection-links-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedCollectionLinksSpotlightCss(sectionId, layoutStyle.customCss);
  const textAlign = textAlignForAlignment(layoutStyle.alignment);
  const isTextLayout =
    layoutStyle.layoutMode === 'text' || catalogVariant === 'collection-links-text';

  const horizontalPad = layoutStyle.sectionWidth === 'full' ? 24 : layout.padX;

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
    width: '100%',
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', width: '100%' }
      : { maxWidth: layout.contentMaxWidth, margin: '0 auto', width: '100%' };

  const linkItemStyle: CSSProperties = {
    margin: 0,
    fontSize: isTextLayout ? undefined : 22,
    fontWeight: 500,
    lineHeight: 1.25,
    color: layoutStyle.scheme.color,
    textDecoration: 'none',
    textAlign,
  };

  const linksList = (
    <div
      style={
        isTextLayout
          ? {
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 'clamp(12px, 1vw, 24px) 48px',
              width: '100%',
              justifyContent: textLinksFlexJustifyForAlignment(layoutStyle.alignment),
            }
          : {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
              alignItems:
                layoutStyle.alignment === 'center'
                  ? 'center'
                  : layoutStyle.alignment === 'right'
                    ? 'flex-end'
                    : 'flex-start',
            }
      }
    >
      {links.map((link) => {
        const blockBase =
          placement === 'template'
            ? `templates.${templateId}.sections.${sectionId}.blocks.${link.id}.settings`
            : `sections.${sectionId}.blocks.${link.id}.settings`;
        const blockNodeId =
          placement === 'template'
            ? `template:${templateId}:${sectionId}:block:${link.id}`
            : `layout:${sectionId}:block:${link.id}`;

        return (
          <EditorBlock key={link.id} nodeId={blockNodeId} label="Collection link">
            <Link to={link.href} style={linkItemStyle}>
              <EditorField fieldPath={`${blockBase}.title`} label="Title">
                {link.title}
              </EditorField>
              <sup
                style={{
                  marginLeft: 4,
                  fontSize: '0.65em',
                  fontWeight: 400,
                  color: layoutStyle.scheme.muted,
                }}
              >
                <EditorField fieldPath={`${blockBase}.productCount`} label="Product count">
                  {link.productCount}
                </EditorField>
              </sup>
            </Link>
          </EditorBlock>
        );
      })}
    </div>
  );

  const mediaColumn = (
    <div
      style={{
        flex: '1 1 52%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ececec',
        minHeight: 280,
        padding: 24,
      }}
    >
      {layoutStyle.imageUrl ? (
        <img
          src={layoutStyle.imageUrl}
          alt=""
          style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}
        />
      ) : (
        <CollectionLinksSpotlightArt />
      )}
    </div>
  );

  const linksColumn = (
    <div
      style={{
        flex: '1 1 48%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 32px',
        borderRight: layoutStyle.imagePosition === 'right' ? '1px solid #f3f4f6' : undefined,
        borderLeft: layoutStyle.imagePosition === 'left' ? '1px solid #f3f4f6' : undefined,
      }}
    >
      {linksList}
    </div>
  );

  return (
    <EditorSection
      sectionId={sectionId}
      label={sectionLabel}
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      {customCss ? <style>{customCss}</style> : null}
      <div className={scopeClass} style={innerStyle}>
        {isTextLayout ? (
          linksList
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: layoutStyle.imagePosition === 'left' ? 'row-reverse' : 'row',
              minHeight: 280,
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            {linksColumn}
            {mediaColumn}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
