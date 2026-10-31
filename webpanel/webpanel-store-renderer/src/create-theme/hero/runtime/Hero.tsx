import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveTextBlockTypographyStyle } from '../../runtime/shared/themeTypographyRuntime';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layoutBlockOrder, templateBlockOrder } from '../../runtime/shared/structureOrder';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { LargeLogo } from '../../large-logo/runtime/LargeLogo';
import { SplitShowcase } from '../../split-showcase/runtime/SplitShowcase';
import { HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE } from '../../../utils/hero-bottom-aligned.util';
import { readHeroButtonStyle } from './heroButtonStyles';
import {
  heroHeadingTypographyCss,
  readHeroHeadingStyle,
  readHeroHeadingText,
} from './heroHeadingStyles';
import {
  heroContentVerticalOnMobileCss,
  heroDualMediaResponsiveCss,
  heroMediaOverlayBackground,
  heroResponsiveCss,
  readHeroStyle,
  scopedHeroCss,
} from './heroStyles';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';
import { HeroMediaBackground } from './HeroMediaBackground';
import { HeroBlurredReflection } from './HeroBlurredReflection';
import { HeroBottomAligned } from './HeroBottomAligned';
import { HeroMarquee } from './HeroMarquee';
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
  marqueeOnLight,
}: {
  blockId: string;
  fallbackVariant: 'primary' | 'secondary';
  blocksBase: string;
  sectionNodePrefix: string;
  colors: { primary: string; background: string; text: string; line: string };
  onImageHero?: boolean;
  marqueeFilled?: boolean;
  marqueeOnLight?: boolean;
}) {
  const config = useThemeConfig();
  const base = `${blocksBase}.${blockId}.settings`;
  const label = cfgString(config, `${base}.label`, '');
  const href = cfgString(config, `${base}.href`, '/');
  const btnStyle = useMemo(
    () =>
      readHeroButtonStyle(config, base, fallbackVariant, colors, {
        onImageHero,
        marqueeFilled,
        marqueeOnLight,
      }),
    [config, base, fallbackVariant, colors, onImageHero, marqueeFilled, marqueeOnLight]
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
  const isSplitShowcase = catalogVariant === 'split-showcase';
  const isClassicHero = !isBottomAligned && !isMarquee && !isLargeLogo && !isSplitShowcase;

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
      : ['text_1', 'text_2', 'primary_button'];

  const blockOrder =
    placement === 'layout'
      ? layoutBlockOrder(config, sectionId, defaultBlockOrder)
      : templateBlockOrder(config, templateId, sectionId, defaultBlockOrder);

  const overlayBackground = heroMediaOverlayBackground(
    hero.overlayColor,
    hero.overlayStyle,
    hero.overlayGradientDirection
  );

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
    return (
      <HeroBottomAligned
        sectionId={sectionId}
        sectionNodePrefix={sectionNodePrefix}
        settingsBase={settingsBase}
        blocksBase={blocksBase}
        hero={hero}
        fontHeading={fontHeading}
        fontBody={fontBody}
        themeFonts={themeFonts}
        scopedCss={scopedCss}
        dualMediaCss={dualMediaCss}
      />
    );
  }

  if (isMarquee) {
    const marqueeHasMedia = Boolean(media1Url || media2Url);
    return (
      <HeroMarquee
        sectionId={sectionId}
        sectionNodePrefix={sectionNodePrefix}
        settingsBase={settingsBase}
        hero={hero}
        fontBody={fontBody}
        themeFonts={themeFonts}
        scopedCss={scopedCss}
        dualMediaCss={dualMediaCss}
        responsiveCss={responsiveCss}
        primaryButton={
          <HeroButton
            blockId="primary_button"
            fallbackVariant="primary"
            blocksBase={blocksBase}
            sectionNodePrefix={sectionNodePrefix}
            colors={buttonColors}
            marqueeFilled={marqueeHasMedia}
            marqueeOnLight={!marqueeHasMedia}
          />
        }
      />
    );
  }

  if (isLargeLogo) {
    return <LargeLogo sectionId={sectionId} placement={placement} templateId={templateId} />;
  }

  if (isSplitShowcase) {
    return <SplitShowcase sectionId={sectionId} placement={placement} templateId={templateId} />;
  }

  if (isClassicHero) {
    const hasMedia = Boolean(media1Url || media2Url);
    const classicOverlay = hero.mediaOverlay ? overlayBackground : undefined;
    // Appearance → "Background color" (palette). "Default"/empty keeps the scheme/decorative backdrop.
    const classicBgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
    const classicCustomBg =
      classicBgRaw && classicBgRaw !== 'default'
        ? resolveThemePaletteColorSetting(config, classicBgRaw, 1, hero.scheme.background)
        : '';
    /** Merchant picked a solid/transparent color → show it instead of the decorative landscape. */
    const useSolidBackground = !hasMedia && (hero.backgroundIsCustom || Boolean(classicCustomBg));
    /** Text/shadow tuned for the decorative or media backdrop; solid colors get adaptive text. */
    const onDarkBackdrop = !useSolidBackground;
    const classicTextColor = useSolidBackground ? hero.scheme.color : '#ffffff';
    const classicTextShadow = onDarkBackdrop ? '0 2px 20px rgba(0, 0, 0, 0.35)' : 'none';
    const classicBodyShadow = onDarkBackdrop ? '0 1px 12px rgba(0, 0, 0, 0.3)' : 'none';
    /** Full-bleed backdrop for image heroes; direction controls block flow inside content only. */
    const useFullBleedBackdrop = hasMedia;
    /** Both image and landscape backdrops centre the content over a full-bleed background. */
    const useBackdropLayout = useFullBleedBackdrop || !hasMedia;
    /** Default heading copy when none is set, so the hero is never blank (with or without media). */
    const landscapeHeadingFallback = 'Browse our latest products';
    const useRowMediaLayout = hasMedia && !useFullBleedBackdrop && hero.contentDirection === 'row';
    const showBlurredReflection = hero.blurredReflection && hasMedia;

    const contentColumnAlign =
      hero.alignTextBaseline && hero.contentDirection === 'row'
        ? 'baseline'
        : hero.contentAlign;

    const headingFillWidth = headingStyle.width === '100%';
    // Fill: heading spans 100% of the available content area. Fit: hugs content width.
    const headingTextAlign = headingFillWidth
      ? headingStyle.textAlign ?? hero.textAlign
      : hero.textAlign;

    const headingBlockStyle: CSSProperties | undefined = headingFillWidth
      ? { width: '100%', alignSelf: 'stretch', boxSizing: 'border-box' }
      : undefined;

    const headingFieldStyle: CSSProperties = {
      margin: 0,
      display: 'block',
      width: headingFillWidth ? '100%' : 'fit-content',
      maxWidth: headingFillWidth ? undefined : headingStyle.maxWidth,
      alignSelf: headingFillWidth ? 'stretch' : undefined,
      textAlign: headingTextAlign,
      boxSizing: 'border-box',
    };

    const classicHeadingStyle: CSSProperties = {
      margin: 0,
      ...heroHeadingTypographyCss(headingStyle),
      color: classicTextColor,
      textAlign: headingTextAlign,
      textShadow: classicTextShadow,
      background: headingStyle.background,
      paddingTop: headingStyle.paddingTop,
      paddingBottom: headingStyle.paddingBottom,
      paddingLeft: headingStyle.paddingLeft,
      paddingRight: headingStyle.paddingRight,
      borderRadius: headingStyle.borderRadius,
      ...(headingFillWidth ? { display: 'block', width: '100%' } : {}),
    };

    const mediaPanel = (url: string, className: string) =>
      url ? (
        <div
          className={className}
          style={{
            flex: 1,
            minHeight: useRowMediaLayout ? '100%' : 240,
            background: `center/cover url(${url}) no-repeat`,
          }}
        />
      ) : null;

    const renderClassicBlock = (blockId: string): ReactNode => {
      if (blockId === 'heading' || blockId.startsWith('heading_')) {
        const headingFieldPath = `${blocksBase}.${blockId}.settings.heading`;
        const rawHeadingText = readHeroHeadingText(config, settingsBase, blocksBase, blockId);
        const headingText = rawHeadingText.trim() ? rawHeadingText : landscapeHeadingFallback;
        if (!headingText.trim()) return null;
        const headingTag = richTextHasBlockMarkup(headingText) ? 'div' : 'h1';
        return (
          <EditorBlock
            nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)}
            label="Heading"
            style={headingBlockStyle}
          >
            <EditorField
              fieldPath={headingFieldPath}
              label="Text"
              as={headingTag}
              style={headingFieldStyle}
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
      if (blockId.startsWith('text') && blockId !== 'heading') {
        const textSettingsBase = `${blocksBase}.${blockId}.settings`;
        const body =
          cfgString(config, `${textSettingsBase}.text`, '') ||
          (blockId === 'text_2' ? subtitle : '');
        if (!body.trim()) return null;

        // Each Text block carries its own Typography preset (heading-* renders prominently).
        const preset = cfgString(config, `${textSettingsBase}.typographyPreset`, 'default');
        const typo = resolveTextBlockTypographyStyle(config, textSettingsBase, preset, themeFonts);
        const headingLike = preset.startsWith('heading');

        const widthFill = cfgString(config, `${textSettingsBase}.width`, 'fit') === 'fill';
        const maxWidthKey = cfgString(config, `${textSettingsBase}.maxWidth`, 'normal');
        const maxWidthPx =
          maxWidthKey === 'narrow' ? 480 : maxWidthKey === 'none' ? undefined : 640;

        const bgOn = cfgBool(config, `${textSettingsBase}.backgroundEnabled`, false);
        const bgColor = cfgString(config, `${textSettingsBase}.backgroundColor`, '#00000026');
        const cornerRadius = cfgNumber(config, `${textSettingsBase}.cornerRadius`, 0);
        const textColorKey = cfgString(config, `${textSettingsBase}.textColor`, 'default');
        const resolvedColor =
          textColorKey && textColorKey !== 'default'
            ? resolveThemePaletteColorSetting(config, textColorKey, 1, classicTextColor)
            : classicTextColor;

        const pTop = cfgNumber(config, `${textSettingsBase}.paddingTop`, 0);
        const pBottom = cfgNumber(config, `${textSettingsBase}.paddingBottom`, 0);
        const pLeft = cfgNumber(config, `${textSettingsBase}.paddingLeft`, 0);
        const pRight = cfgNumber(config, `${textSettingsBase}.paddingRight`, 0);
        const hasPadding = Boolean(pTop || pBottom || pLeft || pRight);

        const textContentStyle: CSSProperties = {
          margin: 0,
          fontFamily: typo.fontFamily,
          fontSize: typo.fontSize,
          fontWeight: typo.fontWeight,
          ...(typo.fontStyle ? { fontStyle: typo.fontStyle } : {}),
          lineHeight: typo.lineHeight,
          ...(typo.letterSpacing ? { letterSpacing: typo.letterSpacing } : {}),
          ...(typo.textTransform ? { textTransform: typo.textTransform } : {}),
          ...(typo.textWrap ? { textWrap: typo.textWrap } : {}),
          color: resolvedColor,
          textAlign: hero.textAlign,
          textShadow: headingLike ? classicTextShadow : classicBodyShadow,
          background: bgOn ? bgColor : undefined,
          borderRadius: bgOn ? cornerRadius : undefined,
          padding: hasPadding ? `${pTop}px ${pRight}px ${pBottom}px ${pLeft}px` : undefined,
        };

        const fieldStyle: CSSProperties = {
          margin: 0,
          display: 'block',
          width: widthFill ? '100%' : 'fit-content',
          maxWidth: widthFill ? undefined : maxWidthPx,
          alignSelf: widthFill ? 'stretch' : undefined,
          textAlign: hero.textAlign,
          boxSizing: 'border-box',
        };

        const textTag = richTextHasBlockMarkup(body) ? 'div' : headingLike ? 'h2' : 'p';
        return (
          <EditorBlock
            nodeId={heroBlockNodeId(sectionId, placement, templateId, blockId)}
            label="Text"
          >
            <EditorField
              fieldPath={`${textSettingsBase}.text`}
              label="Text"
              as={textTag}
              style={fieldStyle}
            >
              <ThemeEditorRichTextContent html={body} style={textContentStyle} />
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
          flexDirection: useBackdropLayout ? 'column' : hero.contentDirection,
          alignItems: useBackdropLayout ? 'stretch' : hero.contentAlign,
          justifyContent: useBackdropLayout ? hero.sectionOuterJustify : hero.contentJustify,
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
            overflow: showBlurredReflection ? 'visible' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: hero.minHeight,
            padding: 0,
            background: useFullBleedBackdrop
              ? '#2d6478'
              : classicCustomBg || hero.scheme.background,
            fontFamily: fontBody,
            color: classicTextColor,
            boxSizing: 'border-box',
          }}
        >
          {useFullBleedBackdrop ? (
            <HeroMediaBackground media1Url={media1Url} media2Url={media2Url} />
          ) : !hasMedia && !useSolidBackground ? (
            <HeroLandscapeBackdrop />
          ) : null}
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
          {showBlurredReflection ? (
            <HeroBlurredReflection
              media1Url={media1Url}
              media2Url={media2Url}
              reflectionOpacity={hero.reflectionOpacity}
              overlayBackground={classicOverlay}
            />
          ) : null}
          {classicBody}
        </EditorSection>
      </>
    );
  }

  return null;
}
