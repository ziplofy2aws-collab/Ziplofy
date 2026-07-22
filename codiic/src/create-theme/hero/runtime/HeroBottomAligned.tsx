import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { resolveTextBlockTypographyStyle } from '../../runtime/shared/themeTypographyRuntime';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import {
  HERO_BOTTOM_ALIGNED_BODY,
  HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE,
  heroBottomAlignedPaths,
} from '../../../utils/hero-bottom-aligned.util';
import { heroMediaOverlayBackground, type HeroStyle } from './heroStyles';
import { HeroLandscapeBackdrop } from './HeroLandscapeBackdrop';
import { HeroMediaBackground } from './HeroMediaBackground';

type Props = {
  sectionId: string;
  sectionNodePrefix: string;
  settingsBase: string;
  blocksBase: string;
  hero: HeroStyle;
  fontHeading: string;
  fontBody: string;
  themeFonts: { fontHeading: string; fontBody: string };
  scopedCss: string;
  dualMediaCss: string;
};

type GroupLayout = {
  isHorizontal: boolean;
  gap: number;
  align: string;
  position: string;
  alignBaseline: boolean;
  verticalOnMobile: boolean;
  widthMode: string;
  customWidth: number;
  heightMode: string;
  customHeight: number;
  link: string;
  linkNewTab: boolean;
};

function flexForAlign(align: string): CSSProperties['justifyContent'] {
  if (align === 'left') return 'flex-start';
  if (align === 'right') return 'flex-end';
  if (align === 'space-between') return 'space-between';
  return 'center';
}

function flexForPosition(position: string): CSSProperties['alignItems'] {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  if (position === 'space-between') return 'space-between';
  if (position === 'space-around') return 'space-around';
  return 'center';
}

function groupSizeStyle(layout: GroupLayout): CSSProperties {
  const style: CSSProperties = { boxSizing: 'border-box' };
  if (layout.widthMode === 'fit') {
    style.width = 'fit-content';
    style.maxWidth = '100%';
  } else if (layout.widthMode === 'custom') {
    style.width = `${Math.max(1, Math.min(100, layout.customWidth))}%`;
  } else {
    style.width = '100%';
  }
  if (layout.heightMode === 'fill') {
    style.height = '100%';
    style.alignSelf = 'stretch';
  } else if (layout.heightMode === 'custom') {
    style.minHeight = `${Math.max(1, Math.min(100, layout.customHeight))}vh`;
  }
  return style;
}

/**
 * Hero: Bottom aligned
 * - Section Layout → outer shell (height, page width, vertical position, section padding)
 * - Group blocks → row/cluster Layout, Size, Appearance, Borders, Padding, link
 */
export function HeroBottomAligned({
  sectionId,
  sectionNodePrefix,
  settingsBase,
  blocksBase,
  hero,
  fontHeading,
  fontBody,
  themeFonts,
  scopedCss,
  dualMediaCss,
}: Props) {
  const config = useThemeConfig();
  const bottomPaths = heroBottomAlignedPaths(blocksBase);

  const media1Url = hero.media1Url.trim();
  const media2Url = hero.media2Url.trim();
  const hasMedia = Boolean(media1Url || media2Url);
  const overlayFill =
    hasMedia && hero.mediaOverlay
      ? heroMediaOverlayBackground(
          hero.overlayColor,
          hero.overlayStyle,
          hero.overlayGradientDirection
        )
      : undefined;
  const copyColor = hasMedia ? '#ffffff' : '#1f2937';

  const introText = cfgString(
    config,
    bottomPaths.textIntro,
    cfgString(config, `${settingsBase}.eyebrow`, 'Introducing')
  );
  const titleText = cfgString(
    config,
    bottomPaths.headingMain,
    cfgString(config, `${settingsBase}.title`, 'New arrivals')
  );
  const bodyText = cfgString(
    config,
    bottomPaths.textBody,
    cfgString(config, `${settingsBase}.subtitle`, HERO_BOTTOM_ALIGNED_BODY)
  );

  const contentGroupNodeId = `${sectionNodePrefix}:block:content_group`;
  const headingGroupNodeId = `${contentGroupNodeId}:nested:heading_group`;
  const nestedNodeId = (blockId: 'text_intro' | 'heading_main' | 'text_body') =>
    blockId === 'text_body'
      ? `${contentGroupNodeId}:nested:text_body`
      : `${headingGroupNodeId}:nested:${blockId}`;

  const sectionBgRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground = sectionBgRaw
    ? resolveThemePaletteColorSetting(config, sectionBgRaw, 0, '#2d6478')
    : '#2d6478';

  const contentGroupBase = `${blocksBase}.content_group.settings`;
  const headingGroupBase = `${blocksBase}.content_group.blocks.heading_group.settings`;
  const textIntroBase = `${blocksBase}.content_group.blocks.heading_group.blocks.text_intro`;
  const headingMainBase = `${blocksBase}.content_group.blocks.heading_group.blocks.heading_main`;
  const textBodyBase = `${blocksBase}.content_group.blocks.text_body`;

  const readGroupLayout = (
    base: string,
    fallback: {
      direction: string;
      gap: number;
      align: string;
      position: string;
      baseline: boolean;
      verticalOnMobile: boolean;
    }
  ): GroupLayout => {
    const directionRaw = cfgString(config, `${base}.direction`, fallback.direction);
    return {
      isHorizontal: directionRaw === 'horizontal' || directionRaw === 'row',
      gap: cfgNumber(config, `${base}.layoutGap`, fallback.gap),
      align: cfgString(config, `${base}.layoutAlignment`, fallback.align),
      position: cfgString(config, `${base}.position`, fallback.position),
      alignBaseline: cfgBool(config, `${base}.alignTextBaseline`, fallback.baseline),
      verticalOnMobile: cfgBool(config, `${base}.verticalOnMobile`, fallback.verticalOnMobile),
      widthMode: cfgString(config, `${base}.width`, 'fill'),
      customWidth: cfgNumber(config, `${base}.customWidth`, 100),
      heightMode: cfgString(config, `${base}.height`, 'fit'),
      customHeight: cfgNumber(config, `${base}.customHeight`, 100),
      link: cfgString(config, `${base}.link`, ''),
      linkNewTab: cfgBool(config, `${base}.linkOpenInNewTab`, false),
    };
  };

  /** Appearance + padding + borders from a Group block. */
  const groupChromeStyle = (base: string): CSSProperties => {
    const bgMedia = cfgString(config, `${base}.backgroundMedia`, 'none');
    const bgImage = cfgString(config, `${base}.backgroundImageUrl`, '');
    const bgColorRaw = cfgString(config, `${base}.backgroundColor`, '');
    const overlayOn = cfgBool(config, `${base}.backgroundOverlay`, false);
    const borderStyle = cfgString(config, `${base}.borderStyle`, 'none');
    const cornerRadius = cfgNumber(config, `${base}.cornerRadius`, 0);
    const bgColor =
      bgColorRaw && bgColorRaw.trim()
        ? resolveThemePaletteColorSetting(config, bgColorRaw, 0, 'transparent')
        : undefined;
    const useImage = bgMedia === 'image' && bgImage.trim();
    const style: CSSProperties = {
      paddingTop: cfgNumber(config, `${base}.paddingTop`, 0) || undefined,
      paddingBottom: cfgNumber(config, `${base}.paddingBottom`, 0) || undefined,
      paddingLeft: cfgNumber(config, `${base}.paddingLeft`, 0) || undefined,
      paddingRight: cfgNumber(config, `${base}.paddingRight`, 0) || undefined,
      borderRadius: cornerRadius || undefined,
      border: borderStyle === 'solid' ? '1px solid rgba(255,255,255,0.35)' : undefined,
      boxSizing: 'border-box',
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

  /* Section shell */
  const sectionMinHeight = hero.minHeight;
  const pageMaxWidth = hero.maxWidth;
  const topPad = hero.paddingTop;
  const bottomPad = hero.paddingBottom;
  const sidePad = hero.paddingX;
  const stackJustify = hero.sectionJustify;

  /* Content Group (outer Group) — drives the heading + body row */
  const contentGroup = readGroupLayout(contentGroupBase, {
    direction: hero.contentDirection === 'row' ? 'horizontal' : 'vertical',
    gap: hero.gap,
    align: hero.textAlign,
    position: hero.position,
    baseline: hero.alignTextBaseline,
    verticalOnMobile: hero.verticalOnMobile,
  });
  const contentChrome = groupChromeStyle(contentGroupBase);
  const contentSize = groupSizeStyle(contentGroup);

  const rowIsHorizontal = contentGroup.isHorizontal;
  const rowGap = Math.max(0, contentGroup.gap);
  const rowJustify: CSSProperties['justifyContent'] = rowIsHorizontal
    ? flexForAlign(contentGroup.align)
    : flexForPosition(contentGroup.position);
  const rowAlign: CSSProperties['alignItems'] =
    rowIsHorizontal && contentGroup.alignBaseline
      ? 'baseline'
      : rowIsHorizontal
        ? flexForPosition(contentGroup.position)
        : flexForAlign(contentGroup.align);

  /* Heading Group (nested Group) — intro + title cluster */
  const headingGroup = readGroupLayout(headingGroupBase, {
    direction: 'vertical',
    gap: 8,
    align: 'left',
    position: 'top',
    baseline: false,
    verticalOnMobile: false,
  });
  const headingChrome = groupChromeStyle(headingGroupBase);
  const headingSize = groupSizeStyle(headingGroup);
  const headingJustify: CSSProperties['justifyContent'] = headingGroup.isHorizontal
    ? flexForAlign(headingGroup.align)
    : flexForPosition(headingGroup.position);
  const headingAlign: CSSProperties['alignItems'] =
    headingGroup.isHorizontal && headingGroup.alignBaseline
      ? 'baseline'
      : headingGroup.isHorizontal
        ? flexForPosition(headingGroup.position)
        : flexForAlign(headingGroup.align);

  const textAlignFromGroup =
    contentGroup.align === 'left' || contentGroup.align === 'right' || contentGroup.align === 'center'
      ? contentGroup.align
      : hero.textAlign;

  const mobileStackCss =
    rowIsHorizontal && contentGroup.verticalOnMobile
      ? `@media (max-width: 749px) {
  [data-codiic-section="${sectionId}"] .hero-bottom-aligned-row {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}`
      : '';

  const headingMobileStackCss =
    headingGroup.isHorizontal && headingGroup.verticalOnMobile
      ? `@media (max-width: 749px) {
  [data-codiic-section="${sectionId}"] .hero-bottom-aligned-heading-group {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}`
      : '';

  const textBlockStyle = (blockBase: string, fallback: CSSProperties): CSSProperties => {
    const base = `${blockBase}.settings`;
    const preset = cfgString(config, `${base}.typographyPreset`, 'default');
    const typo = resolveTextBlockTypographyStyle(config, base, preset, themeFonts);
    const colorRaw = cfgString(config, `${base}.textColor`, 'default');
    const resolvedColor =
      colorRaw && colorRaw !== 'default'
        ? resolveThemePaletteColorSetting(config, colorRaw, 1, String(fallback.color ?? copyColor))
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
    color: copyColor,
    textAlign: textAlignFromGroup,
  });
  const titleStyle = textBlockStyle(headingMainBase, {
    margin: introText.trim() && !headingGroup.isHorizontal ? '8px 0 0' : 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 600,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: copyColor,
    textAlign: textAlignFromGroup,
  });
  const bodyStyle = textBlockStyle(textBodyBase, {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.55,
    color: copyColor,
    textAlign: textAlignFromGroup,
  });

  const headingCluster = (
    <EditorBlock
      nodeId={headingGroupNodeId}
      label="Group"
      style={{
        minWidth: 0,
        flex: rowIsHorizontal
          ? headingGroup.widthMode === 'fill'
            ? '1 1 50%'
            : '0 1 auto'
          : '0 1 auto',
        display: 'flex',
        flexDirection: headingGroup.isHorizontal ? 'row' : 'column',
        alignItems: headingAlign,
        justifyContent: headingJustify,
        gap: Math.max(0, headingGroup.gap),
        ...headingSize,
        ...headingChrome,
      }}
      className="hero-bottom-aligned-heading-group"
    >
      {introText.trim() ? (
        <EditorBlock nodeId={nestedNodeId('text_intro')} label="Text">
          <EditorField
            fieldPath={bottomPaths.textIntro}
            label="Text"
            as={richTextHasBlockMarkup(introText) ? 'div' : 'p'}
            style={{ margin: 0, display: 'block' }}
          >
            <ThemeEditorRichTextContent html={introText} style={introStyle} />
          </EditorField>
        </EditorBlock>
      ) : null}
      {titleText.trim() ? (
        <EditorBlock nodeId={nestedNodeId('heading_main')} label="Heading">
          <EditorField
            fieldPath={bottomPaths.headingMain}
            label="Text"
            as={richTextHasBlockMarkup(titleText) ? 'div' : 'h1'}
            style={{ margin: 0, display: 'block' }}
          >
            <ThemeEditorRichTextContent html={titleText} style={titleStyle} />
          </EditorField>
        </EditorBlock>
      ) : null}
    </EditorBlock>
  );

  const bodyBlock = bodyText.trim() ? (
    <div
      style={{
        flex: rowIsHorizontal ? '0 1 40%' : '0 1 auto',
        maxWidth: rowIsHorizontal ? 460 : '100%',
        minWidth: rowIsHorizontal ? 180 : 0,
        width: rowIsHorizontal ? undefined : '100%',
        textAlign: textAlignFromGroup,
      }}
    >
      <EditorBlock nodeId={nestedNodeId('text_body')} label="Text">
        <EditorField
          fieldPath={bottomPaths.textBody}
          label="Text"
          as={richTextHasBlockMarkup(bodyText) ? 'div' : 'p'}
          style={{ margin: 0, display: 'block' }}
        >
          <ThemeEditorRichTextContent html={bodyText} style={bodyStyle} />
        </EditorField>
      </EditorBlock>
    </div>
  ) : null;

  const contentRowInner = (
    <div
      className="hero-bottom-aligned-row"
      style={{
        display: 'flex',
        flexDirection: rowIsHorizontal ? 'row' : 'column',
        alignItems: rowAlign,
        justifyContent: rowJustify,
        gap: rowGap,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {headingCluster}
      {bodyBlock}
    </div>
  );

  const contentGroupBox = (
    <EditorBlock
      nodeId={contentGroupNodeId}
      label="Group"
      style={{
        ...contentSize,
        ...contentChrome,
      }}
    >
      {contentRowInner}
    </EditorBlock>
  );

  const linkedContentGroup =
    contentGroup.link.trim() !== '' ? (
      <Link
        to={contentGroup.link}
        target={contentGroup.linkNewTab ? '_blank' : undefined}
        rel={contentGroup.linkNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {contentGroupBox}
      </Link>
    ) : (
      contentGroupBox
    );

  const contentStack = (
    <div
      className="hero-bottom-aligned-stack"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: stackJustify,
        alignItems: 'stretch',
        flex: '1 1 auto',
        width: '100%',
        minHeight: 0,
        height: '100%',
        padding: `${topPad}px ${sidePad}px ${bottomPad}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: pageMaxWidth,
          marginLeft: textAlignFromGroup === 'right' ? 'auto' : 0,
          marginRight: textAlignFromGroup === 'left' ? 'auto' : 0,
          ...(textAlignFromGroup === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : null),
          boxSizing: 'border-box',
        }}
      >
        {linkedContentGroup}
      </div>
    </div>
  );

  const shellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    width: '100%',
    minHeight: 0,
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
  };

  const linkedStack = hero.sectionLink ? (
    <Link
      to={hero.sectionLink}
      target={hero.sectionLinkNewTab ? '_blank' : undefined}
      rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
      style={shellStyle}
    >
      {contentStack}
    </Link>
  ) : (
    <div style={shellStyle}>{contentStack}</div>
  );

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {dualMediaCss ? <style>{dualMediaCss}</style> : null}
      {mobileStackCss ? <style>{mobileStackCss}</style> : null}
      {headingMobileStackCss ? <style>{headingMobileStackCss}</style> : null}
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
          height: sectionMinHeight === 'auto' ? undefined : sectionMinHeight,
          padding: 0,
          background: sectionBackground,
          fontFamily: fontBody,
          color: copyColor,
          boxSizing: 'border-box',
        }}
      >
        {hasMedia ? (
          <HeroMediaBackground
            media1Url={media1Url}
            media2Url={media2Url}
            fallbackUrl={HERO_BOTTOM_ALIGNED_DEFAULT_IMAGE}
          />
        ) : (
          <HeroLandscapeBackdrop />
        )}
        {overlayFill ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: overlayFill,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        {linkedStack}
      </EditorSection>
    </>
  );
}
