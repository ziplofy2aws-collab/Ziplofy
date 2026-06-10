import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { LargeLogo } from '../../large-logo/runtime/LargeLogo';
import { HERO_MARQUEE_TEXT } from '../../../utils/hero-banner-variants.util';
import {
  HERO_BOTTOM_ALIGNED_BODY,
  HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE,
  heroBottomAlignedPaths,
} from '../../../utils/hero-bottom-aligned.util';
import { readHeroButtonStyle } from './heroButtonStyles';
import {
  heroHeadingTypographyCss,
  readHeroHeadingStyle,
  readHeroHeadingText,
} from './heroHeadingStyles';
import {
  heroContentVerticalOnMobileCss,
  heroDualMediaResponsiveCss,
  heroResponsiveCss,
  readHeroStyle,
  scopedHeroCss,
} from './heroStyles';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';
import { HeroMediaBackground } from './HeroMediaBackground';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

function heroSettingsBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'layout'
    ? `sections.${sectionId}.settings`
    : `templates.${templateId}.sections.${sectionId}.settings`;
}

function heroBlocksBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'layout'
    ? `sections.${sectionId}.blocks`
    : `templates.${templateId}.sections.${sectionId}.blocks`;
}

function heroSectionNodeId(
  sectionId: string,
  placement: 'layout' | 'template',
  templateId: string
): string {
  return placement === 'layout' ? `layout:${sectionId}` : `template:${templateId}:${sectionId}`;
}

function heroBlockNodeId(
  sectionId: string,
  placement: 'layout' | 'template',
  templateId: string,
  blockId: string
): string {
  return `${heroSectionNodeId(sectionId, placement, templateId)}:block:${blockId}`;
}

function HeroButton({
  blockId,
  fallbackVariant,
  blocksBase,
  sectionNodePrefix,
  colors,
  onImageHero,
  marqueeFilled,
}: {
  blockId: string;
  fallbackVariant: 'primary' | 'secondary';
  blocksBase: string;
  sectionNodePrefix: string;
  colors: { primary: string; background: string; text: string; line: string };
  onImageHero?: boolean;
  marqueeFilled?: boolean;
}) {
  const config = useThemeConfig();
  const base = `${blocksBase}.${blockId}.settings`;
  const label = cfgString(config, `${base}.label`, '');
  const href = cfgString(config, `${base}.href`, '/');
  const btnStyle = useMemo(
    () =>
      readHeroButtonStyle(config, base, fallbackVariant, colors, { onImageHero, marqueeFilled }),
    [config, base, fallbackVariant, colors, onImageHero, marqueeFilled]
  );

  if (!label.trim()) return null;

  const btnScopeId = `${sectionNodePrefix.replace(/:/g, '-')}-${blockId}`;
  const btnResponsiveCss =
    btnStyle.width !== btnStyle.mobileWidth
      ? `@media (max-width: 749px) { [data-hero-btn="${btnScopeId}"] { width: ${btnStyle.mobileWidth} !important; } }`
      : '';

  return (
    <EditorBlock nodeId={`${sectionNodePrefix}:block:${blockId}`} label="Button">
      {btnResponsiveCss ? <style>{btnResponsiveCss}</style> : null}
      <Link
        to={href}
        target={btnStyle.openInNewTab ? '_blank' : undefined}
        rel={btnStyle.openInNewTab ? 'noopener noreferrer' : undefined}
        data-hero-btn={btnScopeId}
        style={{
          display: 'inline-block',
          width: btnStyle.width,
          maxWidth: '100%',
          padding: btnStyle.padding,
          borderRadius: btnStyle.borderRadius,
          background: btnStyle.background,
          color: btnStyle.color,
          border: btnStyle.border,
          textDecoration: 'none',
          fontWeight: btnStyle.fontWeight,
          fontSize: btnStyle.fontSize,
          boxSizing: 'border-box',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        <EditorField fieldPath={`${base}.label`} label="Label">
          {label}
        </EditorField>
      </Link>
    </EditorBlock>
  );
}

export function Hero({
  sectionId,
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const { primary, background, text, link, fontHeading, fontBody } = useThemeColors();
  const themeFonts = useMemo(() => ({ fontHeading, fontBody }), [fontHeading, fontBody]);

  const settingsBase = heroSettingsBase(sectionId, placement, templateId);
  const blocksBase = heroBlocksBase(sectionId, placement, templateId);
  const sectionNodePrefix = heroSectionNodeId(sectionId, placement, templateId);

  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, '');
  const isBottomAligned = catalogVariant === 'hero-bottom-aligned';
  const isMarquee = catalogVariant === 'hero-marquee';
  const isLargeLogo = catalogVariant === 'large-logo';
  const isClassicHero = !isBottomAligned && !isMarquee && !isLargeLogo;

  const subtitle = cfgString(config, `${settingsBase}.subtitle`, '');

  const hero = useMemo(
    () =>
      readHeroStyle(config, settingsBase, {
        background,
        color: text,
        muted: '#9ca3af',
      }),
    [config, settingsBase, background, text]
  );

  const buttonColors = useMemo(
    () => ({
      primary,
      background,
      text: '#ffffff',
      line: layout.line,
    }),
    [primary, background]
  );

  const headingStyle = useMemo(
    () =>
      readHeroHeadingStyle(config, settingsBase, themeFonts, {
        text,
        heading: hero.scheme.color,
        link,
      }),
    [config, settingsBase, themeFonts, text, hero.scheme.color, link]
  );

  const defaultBlockOrder = isMarquee
    ? ['primary_button']
    : isBottomAligned
      ? []
      : ['heading', 'primary_button'];

  const blockOrder =
    placement === 'layout'
      ? layoutBlockOrder(config, sectionId, defaultBlockOrder)
      : templateBlockOrder(config, templateId, sectionId, defaultBlockOrder);

  const overlayBackground =
    hero.overlayStyle === 'gradient'
      ? hero.overlayGradientDirection === 'down'
        ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
        : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
      : hero.overlayColor;

  const media1Url = hero.media1Url.trim();
  const media2Url = hero.media2Url.trim();
  const hasDualMedia = Boolean(media1Url && media2Url);
  const scopedCss = scopedHeroCss(sectionId, hero.customCss);
  const responsiveCss = heroResponsiveCss(
    sectionId,
    hero.mobileStackMedia,
    hero.mobileDifferentMedia
  );
  const dualMediaCss =
    hasDualMedia && hero.mobileStackMedia
      ? heroDualMediaResponsiveCss(sectionId, true)
      : '';
  const contentVerticalOnMobileCss = heroContentVerticalOnMobileCss(
    sectionId,
    hero.verticalOnMobile,
    hero.contentDirection === 'row'
  );

  if (isBottomAligned) {
    const bottomPaths = heroBottomAlignedPaths(blocksBase);
    const bottomIntro = cfgString(
      config,
      bottomPaths.textIntro,
      cfgString(config, `${settingsBase}.eyebrow`, 'Introducing')
    );
    const bottomTitle = cfgString(
      config,
      bottomPaths.headingMain,
      cfgString(config, `${settingsBase}.title`, 'New arrivals')
    );
    const bottomBodyText = cfgString(
      config,
      bottomPaths.textBody,
      cfgString(config, `${settingsBase}.subtitle`, HERO_BOTTOM_ALIGNED_BODY)
    );

    const bottomBlockNode = (blockId: 'text_intro' | 'heading_main' | 'text_body') =>
      blockId === 'text_body'
        ? `${sectionNodePrefix}:block:content_group:nested:text_body`
        : `${sectionNodePrefix}:block:content_group:nested:heading_group:nested:${blockId}`;

    const sectionMinHeight = hero.minHeight;
    const sidePad = Math.max(hero.paddingX, 40);
    const bottomPad = Math.max(hero.paddingBottom, 48);
    const topPad = hero.paddingTop > 0 ? hero.paddingTop : 0;
    const bottomOverlay = hero.mediaOverlay ? overlayBackground : undefined;
    const textColor = '#ffffff';
    const rowMaxWidth = typeof hero.maxWidth === 'number' ? hero.maxWidth : 1400;

    const bottomRow = (
      <div
        className="hero-bottom-aligned-row"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: Math.max(hero.gap, 32),
          width: '100%',
          maxWidth: rowMaxWidth,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: '1 1 50%', minWidth: 0, textAlign: 'left' }}>
          {bottomIntro.trim() ? (
            <EditorBlock nodeId={bottomBlockNode('text_intro')} label="Text">
              <EditorField
                fieldPath={bottomPaths.textIntro}
                label="Text"
                as="p"
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1.4,
                  color: textColor,
                }}
              >
                {bottomIntro}
              </EditorField>
            </EditorBlock>
          ) : null}
          {bottomTitle.trim() ? (
            <EditorBlock nodeId={bottomBlockNode('heading_main')} label="Heading">
              <EditorField
                fieldPath={bottomPaths.headingMain}
                label="Text"
                as="h1"
                style={{
                  margin: bottomIntro.trim() ? '8px 0 0' : 0,
                  fontFamily: fontHeading,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 600,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: textColor,
                }}
              >
                {bottomTitle}
              </EditorField>
            </EditorBlock>
          ) : null}
        </div>
        {bottomBodyText.trim() ? (
          <div
            style={{
              flex: '0 1 40%',
              maxWidth: 460,
              minWidth: 200,
              textAlign: 'left',
              alignSelf: 'flex-end',
            }}
          >
            <EditorBlock nodeId={bottomBlockNode('text_body')} label="Text">
              <EditorField
                fieldPath={bottomPaths.textBody}
                label="Text"
                as="p"
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: textColor,
                }}
              >
                {bottomBodyText}
              </EditorField>
            </EditorBlock>
          </div>
        ) : null}
      </div>
    );

    const bottomStack = (
      <div
        className="hero-bottom-aligned-stack"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          flex: 1,
          width: '100%',
          minHeight: '100%',
          padding: `${topPad}px ${sidePad}px ${bottomPad}px`,
          boxSizing: 'border-box',
        }}
      >
        {bottomRow}
      </div>
    );

    const bottomShellStyle = {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      flex: 1,
      width: '100%',
      minHeight: '100%',
      textDecoration: 'none' as const,
      color: 'inherit' as const,
    };

    const bottomLinkedStack = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={bottomShellStyle}
      >
        {bottomStack}
      </Link>
    ) : (
      <div style={bottomShellStyle}>{bottomStack}</div>
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {dualMediaCss ? <style>{dualMediaCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Hero: Bottom aligned"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: sectionMinHeight,
            padding: 0,
            background: '#2d6478',
            fontFamily: fontBody,
            color: textColor,
            boxSizing: 'border-box',
          }}
        >
          <HeroMediaBackground
            media1Url={media1Url}
            media2Url={media2Url}
            fallbackUrl={HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE}
          />
          {bottomOverlay ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: bottomOverlay,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          {bottomLinkedStack}
        </EditorSection>
      </>
    );
  }

  if (isMarquee) {
    const marqueeText = cfgString(
      config,
      `${settingsBase}.marqueeText`,
      cfgString(config, `${settingsBase}.subtitle`, HERO_MARQUEE_TEXT)
    );
    const sectionMinHeight = hero.minHeight;
    const bottomPad = Math.max(hero.paddingBottom, 48);
    const marqueeOverlay = hero.mediaOverlay ? overlayBackground : undefined;
    const marqueeAnimId = `ziplofy-hero-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

    const primaryButton = (
      <HeroButton
        blockId="primary_button"
        fallbackVariant="primary"
        blocksBase={blocksBase}
        sectionNodePrefix={sectionNodePrefix}
        colors={buttonColors}
        marqueeFilled
      />
    );

    const marqueeBody = (
      <div
        style={{
          position: 'relative',
          minHeight: sectionMinHeight,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 'max-content',
              whiteSpace: 'nowrap',
              fontFamily: fontHeading,
              fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
              animation: `${marqueeAnimId} 22s linear infinite`,
            }}
          >
            <EditorField
              fieldPath={`${settingsBase}.marqueeText`}
              label="Marquee"
              as="span"
              style={{ padding: '0 0.35em', display: 'inline' }}
            >
              {marqueeText}&nbsp;
            </EditorField>
            <span style={{ padding: '0 0.35em' }} aria-hidden>
              {marqueeText}&nbsp;
            </span>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: bottomPad,
            zIndex: 4,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          {primaryButton ? <span style={{ display: 'inline-flex' }}>{primaryButton}</span> : null}
        </div>
        <style>{`
          @keyframes ${marqueeAnimId} {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    );

    const marqueeLinkedBody = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
      >
        {marqueeBody}
      </Link>
    ) : (
      marqueeBody
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {dualMediaCss ? <style>{dualMediaCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Hero: Marquee"
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minHeight: sectionMinHeight,
            padding: 0,
            background: '#2d6478',
            fontFamily: fontBody,
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <HeroMediaBackground
            media1Url={media1Url}
            media2Url={media2Url}
            fallbackUrl={HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE}
          />
          {marqueeOverlay ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: marqueeOverlay,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          {marqueeLinkedBody}
        </EditorSection>
      </>
    );
  }

  if (isLargeLogo) {
    return <LargeLogo sectionId={sectionId} placement={placement} templateId={templateId} />;
  }

  if (isClassicHero) {
    const hasMedia = Boolean(media1Url || media2Url);
    const classicOverlay = hero.mediaOverlay ? overlayBackground : undefined;
    /** Full-bleed backdrop for image heroes; direction controls block flow inside content only. */
    const useFullBleedBackdrop = hasMedia;
    const useRowMediaLayout = hasMedia && !useFullBleedBackdrop && hero.contentDirection === 'row';

    const contentColumnAlign =
      hero.alignTextBaseline && hero.contentDirection === 'row'
        ? 'baseline'
        : hero.contentAlign;

    const headingFillWidth = headingStyle.width === '100%';
    const classicHeadingStyle = {
      margin: 0,
      width: headingStyle.width,
      maxWidth: headingStyle.maxWidth,
      marginLeft: headingStyle.marginLeft,
      marginRight: headingStyle.marginRight,
      alignSelf: headingFillWidth ? 'stretch' : undefined,
      boxSizing: 'border-box' as const,
      ...heroHeadingTypographyCss(headingStyle),
      color: '#ffffff',
      textAlign: headingStyle.textAlign ?? hero.textAlign,
      textShadow: '0 2px 20px rgba(0, 0, 0, 0.35)',
      background: headingStyle.background,
      paddingTop: headingStyle.paddingTop,
      paddingBottom: headingStyle.paddingBottom,
      paddingLeft: headingStyle.paddingLeft,
      paddingRight: headingStyle.paddingRight,
      borderRadius: headingStyle.borderRadius,
    };

    const mediaPanel = (url: string, className: string) =>
      url ? (
        <div
          className={className}
          style={{
            flex: 1,
            minHeight: useRowMediaLayout ? '100%' : 240,
            background: `center/cover url(${url}) no-repeat`,
            filter: hero.blurredReflection ? 'blur(12px)' : undefined,
            transform: hero.blurredReflection ? 'scale(1.05)' : undefined,
          }}
        />
      ) : null;

    const renderClassicBlock = (blockId: string): ReactNode => {
      if (blockId === 'heading' || blockId.startsWith('heading_')) {
        const headingFieldPath = `${blocksBase}.${blockId}.settings.heading`;
        const headingText = readHeroHeadingText(config, settingsBase, blocksBase, blockId);
        if (!headingText.trim()) return null;
        const headingTag = richTextHasBlockMarkup(headingText) ? 'div' : 'h1';
        return (
          <EditorBlock
            nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)}
            label="Heading"
          >
            <EditorField
              fieldPath={headingFieldPath}
              label="Text"
              as={headingTag}
              style={{
                margin: 0,
                width: classicHeadingStyle.width,
                maxWidth: classicHeadingStyle.maxWidth,
                alignSelf: classicHeadingStyle.alignSelf,
                marginLeft: classicHeadingStyle.marginLeft,
                marginRight: classicHeadingStyle.marginRight,
                textAlign: classicHeadingStyle.textAlign,
                boxSizing: classicHeadingStyle.boxSizing,
              }}
            >
              <ThemeEditorRichTextContent html={headingText} style={classicHeadingStyle} />
            </EditorField>
          </EditorBlock>
        );
      }
      if (blockId === 'primary_button' || blockId === 'secondary_button') {
        const variant: 'primary' | 'secondary' =
          blockId === 'secondary_button' ? 'secondary' : 'primary';
        return (
          <HeroButton
            key={blockId}
            blockId={blockId}
            fallbackVariant={variant}
            blocksBase={blocksBase}
            sectionNodePrefix={sectionNodePrefix}
            colors={buttonColors}
            onImageHero
          />
        );
      }
      if (blockId === 'text_2' || (blockId.startsWith('text_') && blockId !== 'heading')) {
        const body =
          cfgString(config, `${blocksBase}.${blockId}.settings.text`, '') ||
          (blockId === 'text_2' ? subtitle : '');
        if (!body.trim()) return null;
        return (
          <EditorBlock
            nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)}
            label="Text"
          >
            <EditorField
              fieldPath={`${blocksBase}.${blockId}.settings.text`}
              label="Text"
              as="p"
              style={{
                margin: 0,
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                lineHeight: 1.55,
                maxWidth: 620,
                fontWeight: 400,
                color: '#ffffff',
                textAlign: hero.textAlign,
                textShadow: '0 1px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {body}
            </EditorField>
          </EditorBlock>
        );
      }
      if (blockId.endsWith('_button')) {
        return (
          <HeroButton
            key={blockId}
            blockId={blockId}
            fallbackVariant="primary"
            blocksBase={blocksBase}
            sectionNodePrefix={sectionNodePrefix}
            colors={buttonColors}
            onImageHero
          />
        );
      }
      return null;
    };

    const isHorizontalRow = hero.contentDirection === 'row';
    const horizontalUsesBaseline = isHorizontalRow && hero.alignTextBaseline;
    const blockNodes = blockOrder.map((blockId) => (
      <span key={blockId} style={{ display: 'contents' }}>
        {renderClassicBlock(blockId)}
      </span>
    ));

    const contentColumn = (
      <div
        className="hero-content-blocks"
        style={{
          position: 'relative',
          zIndex: 2,
          flex: useRowMediaLayout
            ? '0 0 42%'
            : hero.contentColumnFill
              ? 1
              : undefined,
          alignSelf: hero.contentColumnFill ? 'stretch' : undefined,
          minHeight: hero.contentColumnFill ? '100%' : undefined,
          height: isHorizontalRow && hero.contentColumnFill ? '100%' : undefined,
          maxWidth:
            hero.contentDirection === 'column' && typeof hero.maxWidth === 'number'
              ? hero.maxWidth
              : undefined,
          width: '100%',
          margin: hero.contentDirection === 'column' ? '0 auto' : undefined,
          display: 'flex',
          flexDirection: horizontalUsesBaseline ? 'column' : hero.contentDirection,
          alignItems: horizontalUsesBaseline ? 'stretch' : contentColumnAlign,
          justifyContent: horizontalUsesBaseline
            ? hero.sectionJustify
            : hero.contentColumnJustify,
          textAlign: hero.textAlign,
          gap: hero.contentColumnFill && !isHorizontalRow ? 0 : horizontalUsesBaseline ? 0 : hero.gap,
          boxSizing: 'border-box',
        }}
      >
        {horizontalUsesBaseline ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: hero.contentColumnJustify,
              gap: hero.gap,
              width: '100%',
            }}
          >
            {blockNodes}
          </div>
        ) : (
          blockNodes
        )}
      </div>
    );

    const classicInner = (
      <div
        className="hero-media-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flex: 1,
          flexDirection: useFullBleedBackdrop ? 'column' : hero.contentDirection,
          alignItems: useFullBleedBackdrop ? 'stretch' : hero.contentAlign,
          justifyContent: useFullBleedBackdrop ? hero.sectionOuterJustify : hero.contentJustify,
          gap: hero.gap,
          minHeight: hero.minHeight,
          width: '100%',
          maxWidth: typeof hero.maxWidth === 'number' ? hero.maxWidth : '100%',
          margin: '0 auto',
          padding: `${hero.paddingTop}px ${hero.paddingX}px ${hero.paddingBottom}px`,
          boxSizing: 'border-box',
        }}
      >
        {useRowMediaLayout ? (
          <>
            {mediaPanel(media1Url, 'hero-media-1')}
            {contentColumn}
            {media2Url ? mediaPanel(media2Url, 'hero-media-2') : null}
          </>
        ) : (
          contentColumn
        )}
        {hero.mobileDifferentMedia && hero.mobileMedia1Url ? (
          <div
            className="hero-media-mobile hero-media-mobile-1"
            style={{
              display: 'none',
              flex: 1,
              minHeight: 200,
              background: `center/cover url(${hero.mobileMedia1Url}) no-repeat`,
            }}
          />
        ) : null}
        {hero.mobileDifferentMedia && hero.mobileMedia2Url ? (
          <div
            className="hero-media-mobile hero-media-mobile-2"
            style={{
              display: 'none',
              flex: 1,
              minHeight: 200,
              background: `center/cover url(${hero.mobileMedia2Url}) no-repeat`,
            }}
          />
        ) : null}
      </div>
    );

    const classicBodyShellStyle = {
      position: 'relative' as const,
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column' as const,
      flex: 1,
      width: '100%',
      minHeight: '100%',
    };

    const classicBody = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', ...classicBodyShellStyle }}
      >
        {classicInner}
      </Link>
    ) : (
      <div style={classicBodyShellStyle}>{classicInner}</div>
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {responsiveCss ? <style>{responsiveCss}</style> : null}
        {contentVerticalOnMobileCss ? <style>{contentVerticalOnMobileCss}</style> : null}
        {dualMediaCss ? <style>{dualMediaCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Hero"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: hero.minHeight,
            padding: 0,
            background: useFullBleedBackdrop ? '#2d6478' : hero.scheme.background,
            fontFamily: fontBody,
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {useFullBleedBackdrop ? (
            <HeroMediaBackground media1Url={media1Url} media2Url={media2Url} />
          ) : !hasMedia ? (
            <HeroLandscapeBackdrop />
          ) : null}
          {classicOverlay && useFullBleedBackdrop ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: classicOverlay,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          {classicBody}
        </EditorSection>
      </>
    );
  }

  return null;
}
