import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../lib/config';
import { readHeroButtonStyle } from '../lib/heroButtonStyles';
import { readHeroHeadingStyle, readHeroHeadingText } from '../lib/heroHeadingStyles';
import { ThemeEditorRichTextContent } from '../../../../../create-theme/runtime/shared/ThemeEditorRichTextContent';
import { richTextHasBlockMarkup } from '../../../../../utils/theme-editor-rich-text.util';
import {
  heroDualMediaResponsiveCss,
  heroResponsiveCss,
  readHeroStyle,
  scopedHeroCss,
  splitShowcaseResponsiveCss,
} from '../lib/heroStyles';
import { SPLIT_SHOWCASE_IMAGE_LEFT, SPLIT_SHOWCASE_IMAGE_RIGHT } from '../lib/splitShowcaseDefaults';
import { layoutBlockOrder, templateBlockOrder } from '../lib/structureOrder';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';
import { HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE } from '../../../../../utils/hero-bottom-aligned.util';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';
import { HeroMediaBackground } from './HeroMediaBackground';

type HeroPlacement = 'layout' | 'template';

type Props = {
  sectionId?: string;
  placement?: HeroPlacement;
  templateId?: string;
};

function heroSettingsBase(sectionId: string, placement: HeroPlacement, templateId: string): string {
  return placement === 'layout'
    ? `sections.${sectionId}.settings`
    : `templates.${templateId}.sections.${sectionId}.settings`;
}

function heroBlocksBase(sectionId: string, placement: HeroPlacement, templateId: string): string {
  return placement === 'layout'
    ? `sections.${sectionId}.blocks`
    : `templates.${templateId}.sections.${sectionId}.blocks`;
}

function heroSectionNodeId(sectionId: string, placement: HeroPlacement, templateId: string): string {
  return placement === 'layout' ? `layout:${sectionId}` : `template:${templateId}:${sectionId}`;
}

function heroBlockNodeId(
  sectionId: string,
  placement: HeroPlacement,
  templateId: string,
  blockId: string
): string {
  return `${heroSectionNodeId(sectionId, placement, templateId)}:block:${blockId}`;
}

function HeroButton({
  blockId,
  fallbackVariant,
  colors,
  blocksBase,
  sectionNodePrefix,
  onImageHero = false,
}: {
  blockId: string;
  fallbackVariant: 'primary' | 'secondary';
  colors: { primary: string; background: string; text: string; line: string };
  blocksBase: string;
  sectionNodePrefix: string;
  onImageHero?: boolean;
}) {
  const config = useThemeConfig();
  const base = `${blocksBase}.${blockId}.settings`;
  const label = cfgString(config, `${base}.label`, '');
  const href = cfgString(config, `${base}.href`, '/');
  const btnStyle = useMemo(
    () => readHeroButtonStyle(config, base, fallbackVariant, colors, { onImageHero }),
    [config, base, fallbackVariant, colors, onImageHero]
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
          minWidth: btnStyle.minWidth,
          padding: btnStyle.padding,
          borderRadius: btnStyle.borderRadius,
          background: btnStyle.background,
          color: btnStyle.color,
          border: btnStyle.border,
          textDecoration: 'none',
          fontWeight: btnStyle.fontWeight,
          fontSize: btnStyle.fontSize,
          boxSizing: 'border-box',
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

function SplitShowcaseCta({
  blockId,
  blocksBase,
  sectionNodePrefix,
}: {
  blockId: 'primary_button' | 'secondary_button';
  blocksBase: string;
  sectionNodePrefix: string;
}) {
  const config = useThemeConfig();
  const base = `${blocksBase}.${blockId}.settings`;
  const label = cfgString(config, `${base}.label`, '');
  const href = cfgString(config, `${base}.href`);

  if (!label.trim()) return null;

  return (
    <EditorBlock nodeId={`${sectionNodePrefix}:block:${blockId}`} label="Button">
      <Link
        to={href}
        target={cfgBool(config, `${base}.openInNewTab`, false) ? '_blank' : undefined}
        rel={cfgBool(config, `${base}.openInNewTab`, false) ? 'noopener noreferrer' : undefined}
        style={{
          color: '#ffffff',
          fontSize: 15,
          fontWeight: 500,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationColor: 'rgba(255,255,255,0.9)',
        }}
      >
        <EditorField fieldPath={`${base}.label`} label="Label">
          {label}
        </EditorField>
      </Link>
    </EditorBlock>
  );
}

export function HeroSection({
  sectionId = 'hero_main',
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const themeColors = useThemeColors();
  const { text, background, primary, link, fontHeading, fontBody } = themeColors;

  const settingsBase = heroSettingsBase(sectionId, placement, templateId);
  const blocksBase = heroBlocksBase(sectionId, placement, templateId);
  const sectionNodePrefix = heroSectionNodeId(sectionId, placement, templateId);

  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, '');
  const isBottomAligned = catalogVariant === 'hero-bottom-aligned';
  const isMarquee = catalogVariant === 'hero-marquee';
  const isLargeLogo = catalogVariant === 'large-logo';
  const isSplitShowcase = catalogVariant === 'split-showcase';
  const isVariantLayout = isBottomAligned || isMarquee || isLargeLogo || isSplitShowcase;
  const isClassicHero = !isVariantLayout && !isBottomAligned;

  const marqueeText = cfgString(
    config,
    `${settingsBase}.marqueeText`,
    cfgString(config, `${settingsBase}.subtitle`)
  );
  const splitRightTitle = cfgString(
    config,
    `${blocksBase}.text_right.settings.text`,
    cfgString(config, `${settingsBase}.splitRightTitle`)
  );

  const bottomPaths = isBottomAligned
    ? {
        textIntro: `${blocksBase}.content_group.blocks.heading_group.blocks.text_intro.settings.text`,
        headingMain: `${blocksBase}.content_group.blocks.heading_group.blocks.heading_main.settings.text`,
        textBody: `${blocksBase}.content_group.blocks.text_body.settings.text`,
      }
    : null;

  const eyebrow = cfgString(
    config,
    bottomPaths?.textIntro ?? `${settingsBase}.eyebrow`,
    ''
  );
  const title = cfgString(
    config,
    bottomPaths?.headingMain ?? `${settingsBase}.title`,
    'Welcome'
  );
  const subtitle = cfgString(config, `${settingsBase}.subtitle`, '');

  const bodyText = cfgString(
    config,
    bottomPaths?.textBody ?? `${blocksBase}.text_2.settings.text`,
    ''
  ) || subtitle;

  const bottomBlockNode = (blockId: 'text_intro' | 'heading_main' | 'text_body') =>
    blockId === 'text_body'
      ? `${sectionNodePrefix}:block:content_group:nested:text_body`
      : `${sectionNodePrefix}:block:content_group:nested:heading_group:nested:${blockId}`;

  const hero = useMemo(
    () =>
      readHeroStyle(config, settingsBase, {
        background,
        color: text,
        muted: '#9ca3af',
      }),
    [config, settingsBase, background, text]
  );

  const headingStyle = useMemo(
    () =>
      readHeroHeadingStyle(config, settingsBase, { fontHeading, fontBody }, {
        text: hero.scheme.color,
        heading: hero.scheme.color,
        link,
      }),
    [config, settingsBase, fontHeading, fontBody, hero.scheme.color, link]
  );

  const buttonColors = useMemo(
    () => ({
      primary,
      background,
      text: hero.scheme.color,
      line: layout.line,
    }),
    [primary, background, hero.scheme.color]
  );

  const defaultBlockOrder = isBottomAligned
    ? ['content_group']
    : isMarquee
      ? ['primary_button']
      : isLargeLogo
        ? ['text_2']
        : isSplitShowcase
          ? ['heading', 'text_right', 'primary_button', 'secondary_button']
          : ['heading', 'primary_button'];

  const blockOrder =
    placement === 'layout'
      ? layoutBlockOrder(config, sectionId, defaultBlockOrder)
      : templateBlockOrder(config, templateId, sectionId, defaultBlockOrder);

  const scopedCss = scopedHeroCss(sectionId, hero.customCss);
  const responsiveCss = heroResponsiveCss(sectionId, hero.mobileStackMedia, hero.mobileDifferentMedia);
  const media1Url = hero.media1Url.trim();
  const media2Url = hero.media2Url.trim();
  const hasDualMedia = Boolean(media1Url && media2Url);
  const dualMediaCss =
    hasDualMedia && hero.mobileStackMedia
      ? heroDualMediaResponsiveCss(sectionId, true)
      : '';

  const overlayBackground =
    hero.overlayStyle === 'gradient'
      ? hero.overlayGradientDirection === 'down'
        ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
        : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
      : hero.overlayColor;

  const hasMedia = Boolean(hero.media1Url || hero.media2Url);

  const buttonNodes: Record<string, ReactNode> = {
    primary_button: (
      <HeroButton
        blockId="primary_button"
        fallbackVariant="primary"
        colors={buttonColors}
        blocksBase={blocksBase}
        sectionNodePrefix={sectionNodePrefix}
        onImageHero={isClassicHero || isMarquee}
      />
    ),
    secondary_button: (
      <HeroButton
        blockId="secondary_button"
        fallbackVariant="secondary"
        colors={buttonColors}
        blocksBase={blocksBase}
        sectionNodePrefix={sectionNodePrefix}
        onImageHero={isClassicHero}
      />
    ),
  };

  const renderHeroBlock = (blockId: string, classic = false): ReactNode => {
    if (blockId === 'heading' || blockId.startsWith('heading_')) {
      const headingFieldPath = `${blocksBase}.${blockId}.settings.heading`;
      const headingText = readHeroHeadingText(config, settingsBase, blocksBase, blockId);
      if (!headingText.trim()) return null;
      const headingTag = richTextHasBlockMarkup(headingText) ? 'div' : 'h1';
      const headingTypographyStyle = classic
        ? {
            margin: 0,
            width: '100%',
            maxWidth: 720,
            fontFamily: fontHeading,
            fontSize: 'clamp(2.4rem, 5.2vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            textAlign: 'center' as const,
          }
        : {
            margin: 0,
            width: headingStyle.width,
            maxWidth: headingStyle.maxWidth,
            fontFamily: headingStyle.fontFamily,
            fontSize: headingStyle.fontSize,
            fontWeight: headingStyle.fontWeight,
            lineHeight: headingStyle.lineHeight,
            ...(headingStyle.fontStyle ? { fontStyle: headingStyle.fontStyle } : {}),
            ...(headingStyle.letterSpacing ? { letterSpacing: headingStyle.letterSpacing } : {}),
            ...(headingStyle.textTransform ? { textTransform: headingStyle.textTransform } : {}),
            ...(headingStyle.textWrap
              ? { textWrap: headingStyle.textWrap as CSSProperties['textWrap'] }
              : {}),
            color: headingStyle.color,
            background: headingStyle.background,
            paddingTop: headingStyle.paddingTop,
            paddingBottom: headingStyle.paddingBottom,
            paddingLeft: headingStyle.paddingLeft,
            paddingRight: headingStyle.paddingRight,
            borderRadius: headingStyle.borderRadius,
            textAlign: headingStyle.textAlign,
            boxSizing: 'border-box' as const,
          };
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label="Heading">
          <EditorField
            fieldPath={headingFieldPath}
            label="Text"
            as={headingTag}
            style={{
              margin: 0,
              width: headingTypographyStyle.width,
              maxWidth: headingTypographyStyle.maxWidth,
              textAlign: headingTypographyStyle.textAlign,
            }}
          >
            <ThemeEditorRichTextContent html={headingText} style={headingTypographyStyle} />
          </EditorField>
        </EditorBlock>
      );
    }

    if (blockId === 'text_2' || (blockId.startsWith('text_') && blockId !== 'heading')) {
      const body =
        cfgString(config, `${blocksBase}.${blockId}.settings.text`, '') ||
        (blockId === 'text_2' ? subtitle : '');
      if (!body.trim()) return null;
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label="Text">
          <EditorField
            fieldPath={`${blocksBase}.${blockId}.settings.text`}
            label="Text"
            as="p"
            style={
              classic
                ? {
                    margin: 0,
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    lineHeight: 1.55,
                    maxWidth: 620,
                    fontWeight: 400,
                    color: '#ffffff',
                    textAlign: 'center',
                  }
                : {
                    fontSize: 18,
                    lineHeight: 1.65,
                    maxWidth: 560,
                    margin: 0,
                    opacity: 0.85,
                    color: hero.scheme.color,
                  }
            }
          >
            {body}
          </EditorField>
        </EditorBlock>
      );
    }

    if (blockId === 'primary_button' || blockId === 'secondary_button') {
      const node = buttonNodes[blockId];
      return node ? <span key={blockId}>{node}</span> : null;
    }

    const dynamicType = cfgString(config, `${blocksBase}.${blockId}.type`, '');
    if (dynamicType === 'image' || dynamicType === 'video') {
      const mediaUrl = cfgString(config, `${blocksBase}.${blockId}.settings.url`, '').trim();
      if (!mediaUrl) return null;
      const isVideo = dynamicType === 'video';
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label={isVideo ? 'Video' : 'Image'}>
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              muted={cfgBool(config, `${blocksBase}.${blockId}.settings.muted`, true)}
              autoPlay={cfgBool(config, `${blocksBase}.${blockId}.settings.autoplay`, false)}
              style={{ width: '100%', maxWidth: 520, borderRadius: 10 }}
            />
          ) : (
            <img src={mediaUrl} alt="" style={{ width: '100%', maxWidth: 520, borderRadius: 10, display: 'block' }} />
          )}
        </EditorBlock>
      );
    }
    if (dynamicType === 'logo') {
      const imageUrl = cfgString(config, `${blocksBase}.${blockId}.settings.imageUrl`, '').trim();
      const textValue = cfgString(config, `${blocksBase}.${blockId}.settings.text`, '').trim();
      if (!imageUrl && !textValue) return null;
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label="Logo">
          {imageUrl ? (
            <img src={imageUrl} alt={textValue || 'Logo'} style={{ maxHeight: 72, width: 'auto', display: 'block' }} />
          ) : (
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: hero.scheme.color }}>{textValue}</p>
          )}
        </EditorBlock>
      );
    }
    if (dynamicType === 'icon') {
      const iconValue = cfgString(config, `${blocksBase}.${blockId}.settings.icon`, 'star').trim();
      const labelValue = cfgString(config, `${blocksBase}.${blockId}.settings.label`, '').trim();
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label="Icon">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: hero.scheme.color }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{iconValue === 'heart' ? '♥' : iconValue === 'check' ? '✓' : '★'}</span>
            {labelValue ? <span style={{ fontSize: 14 }}>{labelValue}</span> : null}
          </div>
        </EditorBlock>
      );
    }
    if (dynamicType === 'page') {
      const labelValue = cfgString(config, `${blocksBase}.${blockId}.settings.title`, '').trim();
      const hrefValue = cfgString(config, `${blocksBase}.${blockId}.settings.href`, '/').trim();
      if (!labelValue) return null;
      return (
        <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)} label="Page">
          <Link to={hrefValue} style={{ color: hero.scheme.color, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {labelValue}
          </Link>
        </EditorBlock>
      );
    }
    if (dynamicType === 'button' || blockId.endsWith('_button')) {
      const variant: 'primary' | 'secondary' =
        blockId === 'secondary_button' ? 'secondary' : 'primary';
      return (
        <span key={blockId}>
          <HeroButton
            blockId={blockId}
            fallbackVariant={variant}
            colors={buttonColors}
            blocksBase={blocksBase}
            sectionNodePrefix={sectionNodePrefix}
            onImageHero={isClassicHero || isMarquee}
          />
        </span>
      );
    }

    return null;
  };

  const textAndButtons = (classic = false) =>
    blockOrder.map((blockId) => (
      <span key={blockId} style={{ display: 'contents' }}>
        {renderHeroBlock(blockId, classic)}
      </span>
    ));

  const contentMinHeight = Math.max(200, hero.minHeight - hero.paddingTop - hero.paddingBottom);
  const contentMaxWidth =
    typeof hero.maxWidth === 'number' ? hero.maxWidth : hero.maxWidth === '100%' ? '100%' : 1200;

  const bottomAlignedTextColor = '#ffffff';

  const renderBottomAlignedContent = () => {
    if (!bottomPaths) return null;
    const rowMaxWidth = typeof hero.maxWidth === 'number' ? hero.maxWidth : 1400;

    return (
      <div
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
          {eyebrow.trim() ? (
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
                  color: bottomAlignedTextColor,
                }}
              >
                {eyebrow}
              </EditorField>
            </EditorBlock>
          ) : null}
          {title.trim() ? (
            <EditorBlock nodeId={bottomBlockNode('heading_main')} label="Heading">
              <EditorField
                fieldPath={bottomPaths.headingMain}
                label="Text"
                as="h1"
                style={{
                  margin: eyebrow.trim() ? '8px 0 0' : 0,
                  fontFamily: fontHeading,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 600,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: bottomAlignedTextColor,
                }}
              >
                {title}
              </EditorField>
            </EditorBlock>
          ) : null}
        </div>
        {bodyText.trim() ? (
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
                  color: bottomAlignedTextColor,
                }}
              >
                {bodyText}
              </EditorField>
            </EditorBlock>
          </div>
        ) : null}
      </div>
    );
  };

  const centeredContent = (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        flex: hero.direction === 'row' ? '0 0 42%' : undefined,
        maxWidth: hero.direction === 'column' ? contentMaxWidth : undefined,
        width: hero.direction === 'column' ? '100%' : undefined,
        margin: hero.direction === 'column' ? '0 auto' : undefined,
        textAlign: hero.textAlign,
        display: 'flex',
        flexDirection: 'column',
        alignItems:
          hero.textAlign === 'left'
            ? 'flex-start'
            : hero.textAlign === 'right'
              ? 'flex-end'
              : 'center',
        gap: hero.gap,
      }}
    >
      {eyebrow ? (
        <EditorField
          fieldPath={`${settingsBase}.eyebrow`}
          label="Eyebrow"
          as="p"
          style={{
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: 0,
            opacity: 0.7,
            color: hero.scheme.color,
          }}
        >
          {eyebrow}
        </EditorField>
      ) : null}
      {textAndButtons()}
    </div>
  );

  const renderMarqueeBand = () => (
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
        className={`hero-marquee-track-${sectionId}`}
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
          animation: `hero-marquee-${sectionId} 22s linear infinite`,
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
  );

  const variantContent = null;

  const content = isBottomAligned
    ? renderBottomAlignedContent()
    : variantContent ?? centeredContent;

  const mediaPanel = (url: string, className: string, blurred: boolean) =>
    url ? (
      <div
        className={className}
        style={{
          flex: 1,
          minHeight: hero.direction === 'row' ? '100%' : 240,
          background: `center/cover url(${url}) no-repeat`,
          filter: blurred ? 'blur(12px)' : undefined,
          transform: blurred ? 'scale(1.05)' : undefined,
        }}
      />
    ) : (
      <div
        className={className}
        style={{
          flex: 1,
          minHeight: hero.direction === 'row' ? '100%' : 200,
          background: `linear-gradient(135deg, ${hero.scheme.muted}33, ${hero.scheme.background})`,
        }}
      />
    );

  const showLandscapeBackdrop = !hasMedia;

  const inner = (
    <div
      className="hero-media-grid"
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: isVariantLayout && !isSplitShowcase ? 'column' : hero.direction,
        alignItems: isBottomAligned ? 'stretch' : isSplitShowcase ? 'stretch' : hero.alignItems,
        justifyContent: isBottomAligned ? 'flex-end' : isMarquee ? 'center' : hero.justifyContent,
        gap: hero.gap,
        minHeight: contentMinHeight,
        width: '100%',
        maxWidth: typeof hero.maxWidth === 'number' ? hero.maxWidth : undefined,
        margin: '0 auto',
        padding: isVariantLayout ? 0 : `0 ${hero.paddingX}px`,
        boxSizing: 'border-box',
      }}
    >
      {isMarquee ? (
        content
      ) : hasMedia && hero.direction === 'row' ? (
        <>
          {mediaPanel(hero.media1Url, 'hero-media-1', hero.blurredReflection)}
          {content}
          {hero.media2Url ? mediaPanel(hero.media2Url, 'hero-media-2', hero.blurredReflection) : null}
        </>
      ) : (
        <>
          {hasMedia ? (
            <div style={{ display: 'flex', gap: hero.gap, width: '100%' }}>
              {mediaPanel(hero.media1Url, 'hero-media-1', hero.blurredReflection)}
              {hero.media2Url ? mediaPanel(hero.media2Url, 'hero-media-2', hero.blurredReflection) : null}
              {hero.mobileDifferentMedia && hero.mobileImageUrl ? (
                <div
                  className="hero-media-mobile"
                  style={{
                    display: 'none',
                    flex: 1,
                    minHeight: 200,
                    background: `center/cover url(${hero.mobileImageUrl}) no-repeat`,
                  }}
                />
              ) : null}
            </div>
          ) : null}
          {content}
        </>
      )}
    </div>
  );

  const sectionBody = hero.sectionLink ? (
    <Link
      to={hero.sectionLink}
      target={hero.sectionLinkNewTab ? '_blank' : undefined}
      rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      {inner}
    </Link>
  ) : (
    inner
  );

  if (isBottomAligned) {
    const sectionMinHeight = hero.minHeight;
    const sidePad = Math.max(hero.paddingX, 40);
    const bottomPad = Math.max(hero.paddingBottom, 48);
    const topPad = hero.paddingTop > 0 ? hero.paddingTop : 0;
    const bottomOverlay = hero.mediaOverlay ? overlayBackground : undefined;

    const bottomStack = (
      <div
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
        {renderBottomAlignedContent()}
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

    const bottomBody = hero.sectionLink ? (
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
        {responsiveCss ? <style>{responsiveCss}</style> : null}
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
            color: bottomAlignedTextColor,
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
          {bottomBody}
        </EditorSection>
      </>
    );
  }

  if (isMarquee) {
    const sectionMinHeight = hero.minHeight;
    const bottomPad = Math.max(hero.paddingBottom, 48);
    const marqueeOverlay = hero.mediaOverlay ? overlayBackground : undefined;

    const marqueeBody = (
      <div
        style={{
          position: 'relative',
          minHeight: sectionMinHeight,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {renderMarqueeBand()}
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
          {buttonNodes.primary_button ? (
            <span style={{ display: 'inline-flex' }}>{buttonNodes.primary_button}</span>
          ) : null}
        </div>
        <style>{`
          @keyframes hero-marquee-${sectionId} {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    );

    const linkedMarquee = hero.sectionLink ? (
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
        {responsiveCss ? <style>{responsiveCss}</style> : null}
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
          <HeroMediaBackground media1Url={media1Url} media2Url={media2Url} />
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
          {linkedMarquee}
        </EditorSection>
      </>
    );
  }

  if (isLargeLogo) {
    const cornerText =
      cfgString(config, `${blocksBase}.text_2.settings.text`, '') || subtitle || bodyText;
    const logoTitle = title.trim() || 'My Store';
    const padTop = Math.max(hero.paddingTop, 40);
    const padBottom = Math.max(hero.paddingBottom, 48);
    const padX = 40;
    const sectionMinHeight = hero.minHeight;
    const backgroundMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
    const backgroundImageUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '');
    const hasBgImage = backgroundMedia === 'image' && Boolean(backgroundImageUrl.trim());
    const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
    const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 0);
    const defaultLogoUrl = cfgString(config, `${settingsBase}.defaultLogoUrl`, '');
    const sectionBorder =
      borderStyle === 'solid' ? `1px solid ${hero.scheme.muted}55` : undefined;
    const largeLogoOverlay =
      hero.mediaOverlay && hasBgImage
        ? hero.overlayStyle === 'gradient'
          ? hero.overlayGradientDirection === 'down'
            ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
            : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
          : hero.overlayColor
        : undefined;

    const largeLogoBody = (
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: typeof hero.maxWidth === 'number' ? hero.maxWidth : undefined,
          margin: '0 auto',
          minHeight: sectionMinHeight,
          padding: `${padTop}px ${padX}px ${padBottom}px`,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
          border: sectionBorder,
          overflow: cornerRadius > 0 ? 'hidden' : undefined,
        }}
      >
        {cornerText.trim() ? (
          <EditorBlock nodeId={heroBlockNodeId(sectionId, placement, templateId, 'text_2')} label="Text">
            <EditorField
              fieldPath={`${blocksBase}.text_2.settings.text`}
              label="Text"
              as="p"
              style={{
                margin: 0,
                maxWidth: 300,
                fontSize: 15,
                lineHeight: 1.5,
                color: '#111827',
                alignSelf: 'flex-start',
              }}
            >
              {cornerText}
            </EditorField>
          </EditorBlock>
        ) : null}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 32,
            paddingBottom: 24,
            minHeight: 280,
            width: '100%',
          }}
        >
          {defaultLogoUrl.trim() ? (
            <EditorField fieldPath={`${settingsBase}.defaultLogoUrl`} label="Default logo" as="div">
              <img
                src={defaultLogoUrl}
                alt={logoTitle}
                style={{
                  display: 'block',
                  maxWidth: 'min(92%, 1200px)',
                  maxHeight: 'min(42vh, 520px)',
                  width: 'auto',
                  height: 'auto',
                  margin: '0 auto',
                  objectFit: 'contain',
                }}
              />
            </EditorField>
          ) : (
            <EditorField
              fieldPath={`${settingsBase}.title`}
              label="Text"
              as="h1"
              style={{
                margin: 0,
                fontFamily: fontHeading,
                fontSize: 'clamp(4rem, 18vw, 11rem)',
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                color: '#000000',
                textAlign: 'center',
              }}
            >
              {logoTitle}
            </EditorField>
          )}
        </div>
      </div>
    );

    const linkedLargeLogo = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
      >
        {largeLogoBody}
      </Link>
    ) : (
      largeLogoBody
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {responsiveCss ? <style>{responsiveCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Large logo"
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minHeight: sectionMinHeight,
            padding: 0,
            background: hasBgImage ? hero.scheme.background : hero.scheme.background || '#f0f1ed',
            fontFamily: fontBody,
            color: '#111827',
            boxSizing: 'border-box',
          }}
        >
          {hasBgImage ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: `center/cover url(${backgroundImageUrl}) no-repeat`,
              }}
            />
          ) : null}
          {largeLogoOverlay ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: largeLogoOverlay,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          {linkedLargeLogo}
        </EditorSection>
      </>
    );
  }

  if (isSplitShowcase) {
    const leftImage = hero.media1Url.trim() || SPLIT_SHOWCASE_IMAGE_LEFT;
    const rightImage = hero.media2Url.trim() || SPLIT_SHOWCASE_IMAGE_RIGHT;
    const tileMinHeight = hero.minHeight;
    const verticalOnMobile = cfgBool(config, `${settingsBase}.verticalOnMobile`, true);
    const backgroundMedia = cfgString(config, `${settingsBase}.backgroundMedia`, 'none');
    const backgroundImageUrl = cfgString(config, `${settingsBase}.backgroundImageUrl`, '');
    const hasSectionBgImage =
      backgroundMedia === 'image' && Boolean(backgroundImageUrl.trim());
    const borderStyle = cfgString(config, `${settingsBase}.borderStyle`, 'none');
    const cornerRadius = cfgNumber(config, `${settingsBase}.cornerRadius`, 0);
    const sectionBorder =
      borderStyle === 'solid' ? `1px solid ${hero.scheme.muted}55` : undefined;
    const splitResponsiveCss = splitShowcaseResponsiveCss(sectionId, verticalOnMobile);
    const tileOverlay =
      hero.mediaOverlay && (leftImage || rightImage)
        ? hero.overlayStyle === 'gradient'
          ? hero.overlayGradientDirection === 'down'
            ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
            : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
          : hero.overlayColor
        : undefined;
    const sectionBgOverlay =
      hero.mediaOverlay && hasSectionBgImage
        ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
        : undefined;

    const headingStyle = {
      margin: 0,
      fontFamily: fontHeading,
      fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
      fontWeight: 700,
      lineHeight: 1.1,
      color: '#ffffff',
      textAlign: 'center' as const,
      textShadow: '0 2px 16px rgba(0,0,0,0.35)',
    };

    const renderTile = (
      imageUrl: string,
      heading: string,
      headingFieldPath: string,
      headingBlockId: string | null,
      buttonBlockId: 'primary_button' | 'secondary_button'
    ) => (
      <div
        className="split-showcase-tile"
        style={{
          flex: '1 1 50%',
          position: 'relative',
          minHeight: tileMinHeight,
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `center/cover url(${imageUrl}) no-repeat`,
          }}
        />
        {tileOverlay ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: tileOverlay,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: tileMinHeight,
            padding: '48px 28px 40px',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {heading.trim() ? (
              headingBlockId ? (
                <EditorBlock
                  nodeId={heroBlockNodeId(sectionId, placement, templateId, headingBlockId)}
                  label="Text"
                >
                  <EditorField fieldPath={headingFieldPath} label="Text" as="h2" style={headingStyle}>
                    {heading}
                  </EditorField>
                </EditorBlock>
              ) : (
                <EditorField fieldPath={headingFieldPath} label="Text" as="h2" style={headingStyle}>
                  {heading}
                </EditorField>
              )
            ) : null}
          </div>
          <div style={{ flexShrink: 0, paddingTop: 8 }}>
            <SplitShowcaseCta
              blockId={buttonBlockId}
              blocksBase={blocksBase}
              sectionNodePrefix={sectionNodePrefix}
            />
          </div>
        </div>
      </div>
    );

    const splitBody = (
      <div
        className="split-showcase-grid"
        style={{
          display: 'flex',
          flexDirection: hero.direction,
          gap: hero.gap,
          width: '100%',
          minHeight: tileMinHeight,
          boxSizing: 'border-box',
        }}
      >
        {renderTile(
          leftImage,
          title,
          `${settingsBase}.title`,
          'heading',
          'primary_button'
        )}
        {renderTile(
          rightImage,
          splitRightTitle,
          `${blocksBase}.text_right.settings.text`,
          'text_right',
          'secondary_button'
        )}
      </div>
    );

    const linkedSplit = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
      >
        {splitBody}
      </Link>
    ) : (
      splitBody
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {splitResponsiveCss ? <style>{splitResponsiveCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Split showcase"
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: typeof hero.maxWidth === 'number' ? hero.maxWidth : undefined,
            margin: '0 auto',
            minHeight: tileMinHeight,
            paddingTop: hero.paddingTop,
            paddingBottom: hero.paddingBottom,
            background: hero.scheme.background,
            borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
            border: sectionBorder,
            fontFamily: fontBody,
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {hasSectionBgImage ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: `center/cover url(${backgroundImageUrl}) no-repeat`,
              }}
            />
          ) : null}
          {sectionBgOverlay ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: sectionBgOverlay,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          ) : null}
          <div style={{ position: 'relative', zIndex: 2 }}>{linkedSplit}</div>
        </EditorSection>
      </>
    );
  }

  if (isClassicHero) {
    const classicMinHeight = hero.minHeight;
    const classicOverlay = hero.mediaOverlay
      ? hero.overlayStyle === 'gradient'
        ? hero.overlayGradientDirection === 'down'
          ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
          : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
        : hero.overlayColor
      : undefined;

    const classicStack = (
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: classicMinHeight,
          width: '100%',
          padding: `${hero.paddingTop}px 24px ${hero.paddingBottom}px`,
          boxSizing: 'border-box',
          gap: Math.min(hero.gap, 20),
        }}
      >
        {textAndButtons(true)}
      </div>
    );

    const classicBody = hero.sectionLink ? (
      <Link
        to={hero.sectionLink}
        target={hero.sectionLinkNewTab ? '_blank' : undefined}
        rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
      >
        {classicStack}
      </Link>
    ) : (
      classicStack
    );

    return (
      <>
        {scopedCss ? <style>{scopedCss}</style> : null}
        {responsiveCss ? <style>{responsiveCss}</style> : null}
        {dualMediaCss ? <style>{dualMediaCss}</style> : null}
        <EditorSection
          sectionId={sectionId}
          editorNodeId={sectionNodePrefix}
          label="Hero"
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minHeight: classicMinHeight,
            padding: 0,
            background: '#1a3a4a',
            fontFamily: fontBody,
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          <HeroMediaBackground media1Url={media1Url} media2Url={media2Url} />
          {classicOverlay ? (
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

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <EditorSection
        sectionId={sectionId}
        editorNodeId={sectionNodePrefix}
        label={
          isBottomAligned
            ? 'Hero: Bottom aligned'
            : isMarquee
              ? 'Hero: Marquee'
              : isLargeLogo
                ? 'Large logo'
                : isSplitShowcase
                  ? 'Split showcase'
                  : 'Hero'
        }
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: hero.minHeight,
          paddingTop: isLargeLogo ? 0 : hero.paddingTop,
          paddingBottom: isLargeLogo ? 0 : hero.paddingBottom,
          background: isLargeLogo ? '#f3f0ea' : hasMedia ? undefined : hero.scheme.background,
          fontFamily: fontBody,
          color: hero.scheme.color,
          boxSizing: 'border-box',
        }}
      >
        {showLandscapeBackdrop && !isLargeLogo ? <HeroLandscapeBackdrop /> : null}
        {(!hasMedia || hero.direction === 'column') && hero.media1Url ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `center/cover url(${hero.media1Url}) no-repeat`,
              filter: hero.blurredReflection ? 'blur(16px)' : undefined,
              transform: hero.blurredReflection ? 'scale(1.08)' : undefined,
            }}
          />
        ) : null}
        {hero.mediaOverlay && (hasMedia || showLandscapeBackdrop) ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: overlayBackground,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        {sectionBody}
      </EditorSection>
    </>
  );
}
