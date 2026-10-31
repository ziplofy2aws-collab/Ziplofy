import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveTextBlockTypographyStyle } from '../../runtime/shared/themeTypographyRuntime';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE } from '../../../utils/hero-bottom-aligned.util';
import { HERO_MARQUEE_TEXT } from '../../../utils/hero-banner-variants.util';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import { heroMediaOverlayBackground, type HeroStyle } from './heroStyles';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';
import { HeroMediaBackground } from './HeroMediaBackground';

type Props = {
  sectionId: string;
  sectionNodePrefix: string;
  settingsBase: string;
  hero: HeroStyle;
  fontBody: string;
  themeFonts: { fontHeading: string; fontBody: string };
  primaryButton: ReactNode;
  scopedCss: string;
  dualMediaCss: string;
  responsiveCss: string;
};

const MARQUEE_RICH_INLINE: CSSProperties = { display: 'inline' };

/**
 * Hero: Marquee — section Layout (direction, alignment, position, gap, width,
 * height, padding) drives shell + content stack; Marquee folder / Text / Spacer
 * drive the scrolling band and typography.
 */
export function HeroMarquee({
  sectionId,
  sectionNodePrefix,
  settingsBase,
  hero,
  fontBody,
  themeFonts,
  primaryButton,
  scopedCss,
  dualMediaCss,
  responsiveCss,
}: Props) {
  const config = useThemeConfig();

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

  const media1Url = hero.media1Url.trim();
  const media2Url = hero.media2Url.trim();
  const marqueeHasMedia = Boolean(media1Url || media2Url);

  /* ── Section Layout (from readHeroStyle) ─────────────────────────────── */
  const sectionMinHeight = hero.minHeight;
  const pageMaxWidth = hero.maxWidth;
  const topPad = hero.paddingTop;
  const bottomPad = hero.paddingBottom;
  const sidePad = hero.paddingX;
  const rowIsHorizontal = hero.contentDirection === 'row';
  const stackGap = Math.max(0, hero.gap);
  const stackJustify = hero.sectionJustify;
  const contentAlign: CSSProperties['alignItems'] =
    hero.textAlign === 'left'
      ? 'flex-start'
      : hero.textAlign === 'right'
        ? 'flex-end'
        : 'center';
  const contentJustify: CSSProperties['justifyContent'] = rowIsHorizontal
    ? hero.contentJustify
    : stackJustify;

  const overlayBackground = heroMediaOverlayBackground(
    hero.overlayColor,
    hero.overlayStyle,
    hero.overlayGradientDirection
  );
  const marqueeOverlay = marqueeHasMedia && hero.mediaOverlay ? overlayBackground : undefined;
  const marqueeTextColor = marqueeHasMedia ? '#ffffff' : '#1f2937';
  const marqueeTextShadow = marqueeHasMedia ? '0 2px 24px rgba(0,0,0,0.25)' : 'none';
  const marqueeAnimId = `codiic-hero-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

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
  const textWidthMode = cfgString(config, `${marqueeTextBase}.width`, 'fit');
  const textMaxWidth = cfgString(config, `${marqueeTextBase}.maxWidth`, 'normal');
  const textMaxWidthPx =
    textMaxWidth === 'narrow' ? 420 : textMaxWidth === 'none' ? undefined : 720;

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
    borderRadius: marqueeBgOn ? cfgNumber(config, `${marqueeTextBase}.cornerRadius`, 0) : undefined,
    maxWidth: textWidthMode === 'fill' ? undefined : textMaxWidthPx,
    boxSizing: 'border-box',
  };

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

  const spacerUnit = cfgString(config, `${settingsBase}.marqueeSpacerUnit`, 'pixel');
  const spacerSize = cfgNumber(config, `${settingsBase}.marqueeSpacerHeight`, 24);
  const spacerHeightCss = spacerUnit === 'percent' ? `${spacerSize}%` : `${spacerSize}px`;
  const spacerCustomMobile = cfgBool(config, `${settingsBase}.marqueeSpacerCustomMobile`, false);
  const spacerMobileSize = cfgNumber(config, `${settingsBase}.marqueeSpacerMobileHeight`, 24);
  const spacerMobileCss =
    spacerUnit === 'percent' ? `${spacerMobileSize}%` : `${spacerMobileSize}px`;

  const marqueeSectionBgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const marqueeSectionBackground = marqueeSectionBgRaw
    ? resolveThemePaletteColorSetting(config, marqueeSectionBgRaw, 0, '#2d6478')
    : '#2d6478';

  const spacerNodeId = `${sectionNodePrefix}:group:spacer:spacer`;
  const marqueeFolderNodeId = `${sectionNodePrefix}:marquee`;
  const marqueeTextNodeId = `${sectionNodePrefix}:group:marquee:text`;

  const phrase = (editable: boolean) => (
    <span
      style={{
        padding: `0 ${marqueeGap / 2}px`,
        display: 'inline-flex',
        alignItems: 'center',
        ...marqueeTextStyle,
      }}
    >
      {editable ? (
        <EditorField
          fieldPath={marqueeTextPath}
          label="Marquee"
          as="span"
          style={MARQUEE_RICH_INLINE}
        >
          <ThemeEditorRichTextContent html={marqueeText} style={MARQUEE_RICH_INLINE} />
        </EditorField>
      ) : (
        <ThemeEditorRichTextContent html={marqueeText} style={MARQUEE_RICH_INLINE} />
      )}
      &nbsp;
    </span>
  );

  const marqueeTrack = (
    <EditorBlock nodeId={marqueeTextNodeId} label="Text">
      <div
        className="hero-marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          whiteSpace: 'nowrap',
          animation: `${marqueeAnimId} 22s linear infinite`,
          animationDirection: marqueeMotion === 'reverse' ? 'reverse' : 'normal',
        }}
      >
        {phrase(true)}
        <span aria-hidden style={{ display: 'contents' }}>
          {phrase(false)}
        </span>
      </div>
    </EditorBlock>
  );

  /** Marquee band — relative in the layout stack so section Position/Gap/Direction work. */
  const marqueeBand = (
    <EditorBlock
      nodeId={marqueeFolderNodeId}
      label="Marquee"
      style={{
        position: 'relative',
        zIndex: 3,
        flex: rowIsHorizontal ? '1 1 60%' : hero.position === 'space-between' ? '0 0 auto' : '0 1 auto',
        width: rowIsHorizontal ? undefined : '100%',
        minWidth: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: marqueeBandBackground,
        paddingTop: marqueeBandPadTop,
        paddingBottom: marqueeBandPadBottom,
        boxSizing: 'border-box',
        alignSelf: rowIsHorizontal ? contentAlign : 'stretch',
      }}
    >
      <div style={{ width: '100%', overflow: 'hidden', pointerEvents: 'none' }}>{marqueeTrack}</div>
    </EditorBlock>
  );

  const buttonRow = (
    <div
      style={{
        position: 'relative',
        zIndex: 4,
        flex: rowIsHorizontal ? '0 0 auto' : '0 0 auto',
        display: 'flex',
        justifyContent:
          hero.textAlign === 'left'
            ? 'flex-start'
            : hero.textAlign === 'right'
              ? 'flex-end'
              : 'center',
        width: rowIsHorizontal ? 'auto' : '100%',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {primaryButton ? <span style={{ display: 'inline-flex' }}>{primaryButton}</span> : null}
    </div>
  );

  const contentStack = (
    <div
      className="hero-marquee-stack"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: rowIsHorizontal ? 'row' : 'column',
        justifyContent: contentJustify,
        alignItems: rowIsHorizontal ? contentAlign : contentAlign,
        gap: stackGap,
        flex: '1 1 auto',
        width: '100%',
        minHeight: 0,
        height: '100%',
        padding: `0 ${sidePad}px ${bottomPad}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: rowIsHorizontal ? 'row' : 'column',
          justifyContent: contentJustify,
          alignItems: contentAlign,
          gap: stackGap,
          width: '100%',
          maxWidth: pageMaxWidth,
          marginLeft: hero.textAlign === 'right' ? 'auto' : 0,
          marginRight: hero.textAlign === 'left' ? 'auto' : 0,
          ...(hero.textAlign === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : null),
          minHeight: rowIsHorizontal ? undefined : 0,
          flex: rowIsHorizontal ? undefined : '1 1 auto',
          boxSizing: 'border-box',
        }}
      >
        {marqueeBand}
        {buttonRow}
      </div>
    </div>
  );

  const linkedStack = hero.sectionLink ? (
    <Link
      to={hero.sectionLink}
      target={hero.sectionLinkNewTab ? '_blank' : undefined}
      rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        width: '100%',
        minHeight: 0,
        height: '100%',
      }}
    >
      {contentStack}
    </Link>
  ) : (
    contentStack
  );

  const spacerMobileStyle =
    spacerCustomMobile && spacerSize > 0
      ? atMobileBreakpoint(
          `[data-codiic-section="${sectionId}"] .hero-marquee-spacer { height: ${spacerMobileCss} !important; }`
        )
      : '';

  const verticalOnMobileCss =
    rowIsHorizontal && hero.verticalOnMobile
      ? atMobileBreakpoint(
          `[data-codiic-section="${sectionId}"] .hero-marquee-stack,
           [data-codiic-section="${sectionId}"] .hero-marquee-stack > div {
            flex-direction: column !important;
            align-items: stretch !important;
          }`
        )
      : '';

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {dualMediaCss ? <style>{dualMediaCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      {spacerMobileStyle ? <style>{spacerMobileStyle}</style> : null}
      {verticalOnMobileCss ? <style>{verticalOnMobileCss}</style> : null}
      <style>{`
        @keyframes ${marqueeAnimId} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <EditorSection
        sectionId={sectionId}
        editorNodeId={sectionNodePrefix}
        label="Hero: Marquee"
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: sectionMinHeight,
          height: sectionMinHeight === 'auto' ? undefined : sectionMinHeight,
          paddingTop: topPad,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          background: marqueeSectionBackground,
          fontFamily: fontBody,
          color: marqueeTextColor,
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
          <EditorBlock
            nodeId={spacerNodeId}
            label="Spacer"
            className="hero-marquee-spacer"
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: spacerHeightCss,
              flex: '0 0 auto',
            }}
          >
            <div aria-hidden style={{ width: '100%', height: '100%' }} />
          </EditorBlock>
        ) : null}
        {linkedStack}
      </EditorSection>
    </>
  );
}
