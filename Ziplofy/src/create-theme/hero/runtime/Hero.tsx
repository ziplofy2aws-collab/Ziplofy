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
import { HeroBlurredReflection } from './HeroBlurredReflection';
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

    // Section-level Appearance → "Background color" (palette); "Default" keeps the base tone.
    const bottomSectionBgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
    const bottomSectionBackground = bottomSectionBgRaw
      ? resolveThemePaletteColorSetting(config, bottomSectionBgRaw, 0, '#2d6478')
      : '#2d6478';

    /** "Group" block settings → box styling (Appearance/Borders/Padding) applied to the group container. */
    const groupBoxStyle = (base: string): CSSProperties => {
      const bgMedia = cfgString(config, `${base}.backgroundMedia`, 'none');
      const bgImage = cfgString(config, `${base}.backgroundImageUrl`, '');
      const bgColorRaw = cfgString(config, `${base}.backgroundColor`, '');
      const overlayOn = cfgBool(config, `${base}.backgroundOverlay`, false);
      const borderStyle = cfgString(config, `${base}.borderStyle`, 'none');
      const cornerRadius = cfgNumber(config, `${base}.cornerRadius`, 0);
      const alignment = cfgString(config, `${base}.layoutAlignment`, 'left');
      const textAlign =
        alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left';
      const bgColor =
        bgColorRaw && bgColorRaw.trim()
          ? resolveThemePaletteColorSetting(config, bgColorRaw, 0, 'transparent')
          : undefined;
      const useImage = bgMedia === 'image' && bgImage.trim();
      const style: CSSProperties = {
        paddingTop: cfgNumber(config, `${base}.paddingTop`, 0),
        paddingBottom: cfgNumber(config, `${base}.paddingBottom`, 0),
        paddingLeft: cfgNumber(config, `${base}.paddingLeft`, 0),
        paddingRight: cfgNumber(config, `${base}.paddingRight`, 0),
        textAlign,
        borderRadius: cornerRadius || undefined,
        border: borderStyle === 'solid' ? '1px solid rgba(255,255,255,0.35)' : undefined,
      };
      if (useImage) {
        style.backgroundImage = overlayOn
          ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${bgImage.trim()})`
          : `url(${bgImage.trim()})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
      } else if (bgColor) {
        style.background = bgColor;
      }
      return style;
    };

    const contentGroupBase = `${blocksBase}.content_group.settings`;
    const headingGroupBase = `${blocksBase}.content_group.blocks.heading_group.settings`;
    const textIntroBase = `${blocksBase}.content_group.blocks.heading_group.blocks.text_intro`;
    const headingMainBase = `${blocksBase}.content_group.blocks.heading_group.blocks.heading_main`;
    const textBodyBase = `${blocksBase}.content_group.blocks.text_body`;
    const contentGroupGap = cfgNumber(config, `${contentGroupBase}.layoutGap`, Math.max(hero.gap, 32));
    const contentGroupDirection = cfgString(config, `${contentGroupBase}.direction`, 'horizontal');
    const contentGroupBox = groupBoxStyle(contentGroupBase);
    const headingGroupBox = groupBoxStyle(headingGroupBase);

    /** Nested Text/Heading block settings → typography, color, background and padding. */
    const textBlockStyle = (blockBase: string, fallback: CSSProperties): CSSProperties => {
      const base = `${blockBase}.settings`;
      const preset = cfgString(config, `${base}.typographyPreset`, 'default');
      const typo = resolveTextBlockTypographyStyle(config, base, preset, themeFonts);
      const colorRaw = cfgString(config, `${base}.textColor`, 'default');
      const resolvedColor =
        colorRaw && colorRaw !== 'default'
          ? resolveThemePaletteColorSetting(config, colorRaw, 1, String(fallback.color ?? textColor))
          : fallback.color;
      const bgOn = cfgBool(config, `${base}.backgroundEnabled`, false);
      const align = cfgString(config, `${base}.alignment`, '');
      return {
        ...fallback,
        fontFamily: typo.fontFamily ?? fallback.fontFamily,
        fontSize: typo.fontSize ?? fallback.fontSize,
        fontWeight: typo.fontWeight ?? fallback.fontWeight,
        fontStyle: typo.fontStyle ?? fallback.fontStyle,
        lineHeight: typo.lineHeight ?? fallback.lineHeight,
        letterSpacing: typo.letterSpacing ?? fallback.letterSpacing,
        textTransform: typo.textTransform ?? fallback.textTransform,
        textAlign: align === 'center' ? 'center' : align === 'right' ? 'right' : fallback.textAlign,
        color: resolvedColor,
        paddingTop: cfgNumber(config, `${base}.paddingTop`, 0) || undefined,
        paddingBottom: cfgNumber(config, `${base}.paddingBottom`, 0) || undefined,
        paddingLeft: cfgNumber(config, `${base}.paddingLeft`, 0) || undefined,
        paddingRight: cfgNumber(config, `${base}.paddingRight`, 0) || undefined,
        background: bgOn
          ? resolveThemePaletteColorSetting(
              config,
              cfgString(config, `${base}.backgroundColor`, '#00000026'),
              0,
              '#00000026'
            )
          : undefined,
        borderRadius: bgOn ? cfgNumber(config, `${base}.cornerRadius`, 0) || undefined : undefined,
      };
    };

    const introStyle = textBlockStyle(textIntroBase, {
      margin: 0,
      fontSize: 14,
      fontStyle: 'italic',
      fontWeight: 400,
      letterSpacing: '0.02em',
      lineHeight: 1.4,
      color: textColor,
    });
    const headingStyle = textBlockStyle(headingMainBase, {
      margin: bottomIntro.trim() ? '8px 0 0' : 0,
      fontFamily: fontHeading,
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
      color: textColor,
    });
    const bodyStyle = textBlockStyle(textBodyBase, {
      margin: 0,
      fontSize: 16,
      lineHeight: 1.55,
      color: textColor,
    });

    const bottomHasMedia = Boolean(media1Url || media2Url);
    const sectionMinHeight = hero.minHeight;
    const sidePad = Math.max(hero.paddingX, 40);
    const bottomPad = Math.max(hero.paddingBottom, 48);
    const topPad = hero.paddingTop > 0 ? hero.paddingTop : 0;
    /** Landscape illustration backdrop reads on light copy; photo backdrops keep white copy + overlay. */
    const bottomOverlay = bottomHasMedia && hero.mediaOverlay ? overlayBackground : undefined;
    const textColor = bottomHasMedia ? '#ffffff' : '#1f2937';
    const rowMaxWidth = typeof hero.maxWidth === 'number' ? hero.maxWidth : 1400;

    const bottomRow = (
      <div
        className="hero-bottom-aligned-row"
        style={{
          display: 'flex',
          flexDirection: contentGroupDirection === 'vertical' ? 'column' : 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: contentGroupGap,
          width: '100%',
          maxWidth: rowMaxWidth,
          margin: '0 auto',
          boxSizing: 'border-box',
          ...contentGroupBox,
        }}
      >
        <div style={{ flex: '1 1 50%', minWidth: 0, ...headingGroupBox }}>
          {bottomIntro.trim() ? (
            <EditorBlock nodeId={bottomBlockNode('text_intro')} label="Text">
              <EditorField
                fieldPath={bottomPaths.textIntro}
                label="Text"
                as="p"
                style={introStyle}
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
                style={headingStyle}
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
                style={bodyStyle}
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
            background: bottomSectionBackground,
            fontFamily: fontBody,
            color: textColor,
            boxSizing: 'border-box',
          }}
        >
          {bottomHasMedia ? (
            <HeroMediaBackground
              media1Url={media1Url}
              media2Url={media2Url}
              fallbackUrl={HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE}
            />
          ) : (
            <HeroLandscapeBackdrop />
          )}
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
    const marqueeTextPath = `${settingsBase}.marqueeTextBlock.settings.text`;
    const marqueeText = cfgString(
      config,
      marqueeTextPath,
      cfgString(
        config,
        `${settingsBase}.marqueeText`,
        cfgString(config, `${settingsBase}.subtitle`, HERO_MARQUEE_TEXT)
      )
    );
    const marqueeHasMedia = Boolean(media1Url || media2Url);
    const sectionMinHeight = hero.minHeight;
    const bottomPad = Math.max(hero.paddingBottom, 48);
    /** Photo backdrops keep the dark overlay; the landscape illustration shows none. */
    const marqueeOverlay = marqueeHasMedia && hero.mediaOverlay ? overlayBackground : undefined;
    const marqueeTextColor = marqueeHasMedia ? '#ffffff' : '#1f2937';
    const marqueeTextShadow = marqueeHasMedia ? '0 2px 24px rgba(0,0,0,0.25)' : 'none';
    const marqueeAnimId = `ziplofy-hero-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

    // "Text" block (inside the Marquee folder) drives typography, color and padding.
    const marqueeTextBase = `${settingsBase}.marqueeTextBlock.settings`;
    const marqueeTypo = resolveTextBlockTypographyStyle(
      config,
      marqueeTextBase,
      cfgString(config, `${marqueeTextBase}.typographyPreset`, 'heading-1'),
      themeFonts
    );
    const marqueeTextColorRaw = cfgString(config, `${marqueeTextBase}.textColor`, 'default');
    const marqueeResolvedColor =
      marqueeTextColorRaw && marqueeTextColorRaw !== 'default'
        ? resolveThemePaletteColorSetting(config, marqueeTextColorRaw, 1, marqueeTextColor)
        : marqueeTextColor;
    const marqueeBgOn = cfgBool(config, `${marqueeTextBase}.backgroundEnabled`, false);
    const marqueeTextStyle: CSSProperties = {
      fontFamily: marqueeTypo.fontFamily,
      fontSize: marqueeTypo.fontSize,
      fontWeight: marqueeTypo.fontWeight,
      fontStyle: marqueeTypo.fontStyle,
      lineHeight: marqueeTypo.lineHeight,
      letterSpacing: marqueeTypo.letterSpacing,
      textTransform: marqueeTypo.textTransform,
      color: marqueeResolvedColor,
      textShadow: marqueeTextShadow,
      paddingTop: cfgNumber(config, `${marqueeTextBase}.paddingTop`, 0),
      paddingBottom: cfgNumber(config, `${marqueeTextBase}.paddingBottom`, 0),
      paddingLeft: cfgNumber(config, `${marqueeTextBase}.paddingLeft`, 0),
      paddingRight: cfgNumber(config, `${marqueeTextBase}.paddingRight`, 0),
      background: marqueeBgOn
        ? resolveThemePaletteColorSetting(
            config,
            cfgString(config, `${marqueeTextBase}.backgroundColor`, '#00000026'),
            0,
            '#00000026'
          )
        : undefined,
      borderRadius: marqueeBgOn
        ? cfgNumber(config, `${marqueeTextBase}.cornerRadius`, 0)
        : undefined,
    };

    // "Marquee" folder settings (motion direction, background, padding, gap).
    const marqueeMotion = cfgString(config, `${settingsBase}.marqueeMotionDirection`, 'forward');
    const marqueeTransparent = cfgBool(config, `${settingsBase}.marqueeTransparentBg`, true);
    const marqueeBandBgRaw = cfgString(config, `${settingsBase}.marqueeBackgroundColor`, '');
    const marqueeBandBackground =
      !marqueeTransparent && marqueeBandBgRaw
        ? resolveThemePaletteColorSetting(config, marqueeBandBgRaw, 0, 'transparent')
        : 'transparent';
    const marqueeBandPadTop = cfgNumber(config, `${settingsBase}.marqueePaddingTop`, 24);
    const marqueeBandPadBottom = cfgNumber(config, `${settingsBase}.marqueePaddingBottom`, 24);
    const marqueeGap = cfgNumber(config, `${settingsBase}.marqueeGap`, 24);

    // Section-level "Spacer" block → vertical space above the marquee content.
    const spacerUnit = cfgString(config, `${settingsBase}.marqueeSpacerUnit`, 'pixel');
    const spacerSize = cfgNumber(config, `${settingsBase}.marqueeSpacerHeight`, 24);
    const spacerHeightCss = spacerUnit === 'percent' ? `${spacerSize}%` : `${spacerSize}px`;

    // Section-level Appearance → "Background color" (palette); "Default" keeps the base tone.
    const marqueeSectionBgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
    const marqueeSectionBackground = marqueeSectionBgRaw
      ? resolveThemePaletteColorSetting(config, marqueeSectionBgRaw, 0, '#2d6478')
      : '#2d6478';

    const primaryButton = (
      <HeroButton
        blockId="primary_button"
        fallbackVariant="primary"
        blocksBase={blocksBase}
        sectionNodePrefix={sectionNodePrefix}
        colors={buttonColors}
        marqueeFilled={marqueeHasMedia}
        marqueeOnLight={!marqueeHasMedia}
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
            background: marqueeBandBackground,
            paddingTop: marqueeBandPadTop,
            paddingBottom: marqueeBandPadBottom,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 'max-content',
              whiteSpace: 'nowrap',
              animation: `${marqueeAnimId} 22s linear infinite`,
              animationDirection: marqueeMotion === 'reverse' ? 'reverse' : 'normal',
              ...marqueeTextStyle,
            }}
          >
            <EditorField
              fieldPath={marqueeTextPath}
              label="Marquee"
              as="span"
              style={{ padding: `0 ${marqueeGap / 2}px`, display: 'inline' }}
            >
              {marqueeText}&nbsp;
            </EditorField>
            <span style={{ padding: `0 ${marqueeGap / 2}px` }} aria-hidden>
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
            background: marqueeSectionBackground,
            fontFamily: fontBody,
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {marqueeHasMedia ? (
            <HeroMediaBackground
              media1Url={media1Url}
              media2Url={media2Url}
              fallbackUrl={HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE}
            />
          ) : (
            <HeroLandscapeBackdrop />
          )}
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
          {spacerSize > 0 ? (
            <div
              aria-hidden
              style={{ position: 'relative', zIndex: 2, width: '100%', height: spacerHeightCss }}
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
