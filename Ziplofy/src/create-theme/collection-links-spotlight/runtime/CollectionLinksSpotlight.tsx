import { useCallback, useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { CollectionLinksSpotlightArt } from './CollectionLinksSpotlightArt';
import { CollectionLinksTextHoverPreview } from './CollectionLinksTextHoverPreview';
import {
  blockSettingsBaseForCollectionLink,
  readCollectionLinks,
  readCollectionLinksSpotlightLayout,
  readCollectionLinkSpotlightMedia,
  readCollectionLinkTitleStyle,
  scopedCollectionLinksCss,
  textAlignForAlignment,
  textLinksFlexJustifyForAlignment,
} from './collectionLinksStyles';

export function CollectionLinksSpotlight({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const themeFonts = useMemo(() => ({ fontHeading, fontBody }), [fontHeading, fontBody]);

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

  const catalogVariant = cfgString(
    config,
    `${settingsBase}.catalogVariant`,
    'collection-links-spotlight'
  );
  const isTextLayout =
    layoutStyle.layoutMode === 'text' || catalogVariant === 'collection-links-text';
  const sectionLabel = isTextLayout ? 'Collection links: Text' : 'Collection links: Spotlight';

  const links = useMemo(
    () => readCollectionLinks(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const [spotlightActiveLinkId, setSpotlightActiveLinkId] = useState<string | null>(null);
  const [textHover, setTextHover] = useState<{ linkId: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isTextLayout) {
      setSpotlightActiveLinkId(links[0]?.id ?? null);
    } else {
      setTextHover(null);
    }
  }, [links, isTextLayout]);

  const activeLink = useMemo(() => {
    const id = spotlightActiveLinkId ?? links[0]?.id;
    return links.find((link) => link.id === id) ?? links[0];
  }, [spotlightActiveLinkId, links]);

  const textHoverLink = useMemo(
    () => (textHover ? links.find((link) => link.id === textHover.linkId) : undefined),
    [textHover, links]
  );

  const textHoverMedia = useMemo(
    () =>
      readCollectionLinkSpotlightMedia(
        config,
        textHoverLink,
        layoutStyle.imageUrl,
        templateId,
        sectionId,
        placement
      ),
    [textHoverLink, config, layoutStyle.imageUrl, placement, sectionId, templateId]
  );

  const handleTextLinkHover = useCallback((linkId: string, event: MouseEvent<HTMLElement>) => {
    setTextHover({ linkId, x: event.clientX, y: event.clientY });
  }, []);

  const handleTextLinkMove = useCallback((linkId: string, event: MouseEvent<HTMLElement>) => {
    setTextHover({ linkId, x: event.clientX, y: event.clientY });
  }, []);

  const clearTextHover = useCallback(() => setTextHover(null), []);

  const spotlightMedia = useMemo(
    () =>
      readCollectionLinkSpotlightMedia(
        config,
        activeLink,
        layoutStyle.imageUrl,
        templateId,
        sectionId,
        placement
      ),
    [activeLink, config, layoutStyle.imageUrl, placement, sectionId, templateId]
  );

  const customCss = scopedCollectionLinksCss(sectionId, layoutStyle.customCss);
  const textAlign = textAlignForAlignment(layoutStyle.alignment) as CSSProperties['textAlign'];

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
      : { maxWidth: layout.maxWidth, margin: '0 auto', width: '100%' };

  const linkItemStyle: CSSProperties = {
    margin: 0,
    fontSize: isTextLayout ? undefined : 22,
    fontWeight: 500,
    lineHeight: 1.25,
    color: layoutStyle.scheme.color,
    textDecoration: 'none',
    textAlign,
  };

  const countStyle: CSSProperties = {
    marginLeft: 4,
    fontSize: '0.65em',
    fontWeight: 400,
    color: layoutStyle.scheme.muted,
    verticalAlign: 'super',
  };

  const resetSpotlightToFirst = () => setSpotlightActiveLinkId(links[0]?.id ?? null);

  const linksList = (
    <div
      onMouseLeave={isTextLayout ? clearTextHover : resetSpotlightToFirst}
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
        const blockBase = blockSettingsBaseForCollectionLink(
          link.id,
          templateId,
          sectionId,
          placement
        );
        const blockNodeId =
          placement === 'template'
            ? `template:${templateId}:${sectionId}:block:${link.id}`
            : `layout:${sectionId}:block:${link.id}`;

        const to = link.href.startsWith('/') ? link.href : `/${link.href}`;
        const titleStyle = readCollectionLinkTitleStyle(config, blockBase, isTextLayout, themeFonts);
        const isSpotlightActive = !isTextLayout && activeLink?.id === link.id;
        const isTextActive = isTextLayout && textHover?.linkId === link.id;

        return (
          <EditorBlock
            key={link.id}
            nodeId={blockNodeId}
            label="Collection link"
            style={isTextLayout ? { flex: '0 0 auto', maxWidth: '100%' } : undefined}
          >
            <Link
              to={to}
              onMouseEnter={
                isTextLayout
                  ? (e) => handleTextLinkHover(link.id, e)
                  : () => setSpotlightActiveLinkId(link.id)
              }
              onMouseMove={isTextLayout ? (e) => handleTextLinkMove(link.id, e) : undefined}
              onFocus={
                isTextLayout
                  ? undefined
                  : () => setSpotlightActiveLinkId(link.id)
              }
              style={{
                ...linkItemStyle,
                fontFamily: titleStyle.fontFamily,
                fontSize: titleStyle.fontSize,
                fontWeight: isSpotlightActive ? 600 : titleStyle.fontWeight,
                lineHeight: titleStyle.lineHeight,
                letterSpacing: titleStyle.letterSpacing,
                textTransform: titleStyle.textTransform,
                ...(isTextLayout
                  ? {
                      color: isTextActive ? layoutStyle.scheme.color : layoutStyle.scheme.muted,
                      transition: 'color 0.15s ease',
                    }
                  : {
                      opacity: isSpotlightActive ? 1 : 0.72,
                      transition: 'opacity 0.2s ease, font-weight 0.2s ease',
                    }),
              }}
            >
              <EditorField fieldPath={`${blockBase}.title`} label="Title">
                {link.title}
              </EditorField>
              <sup style={countStyle}>
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
      {spotlightMedia?.imageUrl ? (
        <EditorField fieldPath={spotlightMedia.imageFieldPath} label="Image">
          <img
            key={spotlightMedia.imageUrl}
            src={spotlightMedia.imageUrl}
            alt=""
            style={{
              width: '100%',
              maxWidth: '100%',
              maxHeight: spotlightMedia.imageStyle.maxHeight,
              aspectRatio: spotlightMedia.imageStyle.aspectRatio,
              borderRadius: spotlightMedia.imageStyle.borderRadius,
              objectFit: spotlightMedia.imageStyle.objectFit,
              transition: 'opacity 0.25s ease',
            }}
          />
        </EditorField>
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
      <div style={innerStyle}>
        {isTextLayout ? (
          <>
            {linksList}
            <CollectionLinksTextHoverPreview hover={textHover} media={textHoverMedia} />
          </>
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
