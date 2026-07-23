import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { readTextBlockStyle } from '../../runtime/shared/textBlockStyles';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { LayeredSlideshowSlideMedia } from '../../layered-slideshow/runtime/LayeredSlideshowArt';
import { readHeroHeadingText } from '../../hero/runtime/heroHeadingStyles';
import { readHeroButtonStyle } from '../../hero/runtime/heroButtonStyles';
import {
  heroMediaOverlayBackground,
  readHeroStyle,
  scopedHeroCss,
} from '../../hero/runtime/heroStyles';
import {
  alignContentForPosition,
  justifyItemsForAlignment,
  resolveMulticolumnBorderCss,
} from '../../multicolumn/runtime/multicolumnStyles';
import { splitShowcaseResponsiveCss } from './splitShowcaseStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

function settingsBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template'
    ? `templates.${templateId}.sections.${sectionId}.settings`
    : `sections.${sectionId}.settings`;
}

function blocksBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template'
    ? `templates.${templateId}.sections.${sectionId}.blocks`
    : `sections.${sectionId}.blocks`;
}

function sectionNodeId(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;
}

function flexForAlign(align: string): CSSProperties['justifyContent'] {
  if (align === 'left') return 'flex-start';
  if (align === 'right') return 'flex-end';
  if (align === 'space-between') return 'space-between';
  return 'center';
}

function flexForPosition(position: string): CSSProperties['justifyContent'] {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  if (position === 'space-between') return 'space-between';
  if (position === 'space-around') return 'space-around';
  return 'center';
}

type GroupLayout = {
  isHorizontal: boolean;
  gap: number;
  align: string;
  position: string;
  widthMode: string;
  customWidth: number;
  mobileWidthMode: string;
  mobileCustomWidth: number;
  heightMode: string;
  customHeight: number;
  link: string;
  linkNewTab: boolean;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderStyle: string;
  borderThickness: number;
  borderOpacity: number;
  borderColor: string;
  cornerRadius: number;
  backgroundMedia: string;
  backgroundImageUrl: string;
  backgroundImagePosition: string;
  backgroundOverlay: boolean;
};

function readGroupLayout(
  config: Record<string, unknown> | null,
  groupBase: string
): GroupLayout {
  const directionRaw = cfgString(config, `${groupBase}.direction`, 'vertical');
  return {
    isHorizontal: directionRaw === 'horizontal' || directionRaw === 'row',
    gap: cfgNumber(config, `${groupBase}.layoutGap`, 16),
    align: cfgString(config, `${groupBase}.layoutAlignment`, 'center'),
    position: cfgString(config, `${groupBase}.position`, 'center'),
    widthMode: cfgString(config, `${groupBase}.width`, 'fill'),
    customWidth: cfgNumber(config, `${groupBase}.customWidth`, 100),
    mobileWidthMode: cfgString(config, `${groupBase}.mobileWidth`, 'fill'),
    mobileCustomWidth: cfgNumber(config, `${groupBase}.mobileCustomWidth`, 100),
    heightMode: cfgString(config, `${groupBase}.height`, 'fill'),
    customHeight: cfgNumber(config, `${groupBase}.customHeight`, 100),
    link: cfgString(config, `${groupBase}.link`, ''),
    linkNewTab: cfgBool(config, `${groupBase}.linkOpenInNewTab`, false),
    paddingTop: cfgNumber(config, `${groupBase}.paddingTop`, 0),
    paddingBottom: cfgNumber(config, `${groupBase}.paddingBottom`, 0),
    paddingLeft: cfgNumber(config, `${groupBase}.paddingLeft`, 24),
    paddingRight: cfgNumber(config, `${groupBase}.paddingRight`, 24),
    borderStyle: cfgString(config, `${groupBase}.borderStyle`, 'none'),
    borderThickness: cfgNumber(config, `${groupBase}.borderThickness`, 1),
    borderOpacity: cfgNumber(config, `${groupBase}.borderOpacity`, 100),
    borderColor: cfgString(config, `${groupBase}.borderColor`, 'default'),
    cornerRadius: cfgNumber(config, `${groupBase}.cornerRadius`, 0),
    backgroundMedia: cfgString(config, `${groupBase}.backgroundMedia`, 'none'),
    backgroundImageUrl: cfgString(config, `${groupBase}.backgroundImageUrl`, ''),
    backgroundImagePosition: cfgString(config, `${groupBase}.backgroundImagePosition`, 'cover'),
    backgroundOverlay: cfgBool(config, `${groupBase}.backgroundOverlay`, false),
  };
}

function groupWidthCss(mode: string, customPercent: number): string {
  if (mode === 'fit') return 'fit-content';
  if (mode === 'custom') return `${Math.max(1, Math.min(100, customPercent))}%`;
  return '100%';
}

function SplitShowcaseButton({
  buttonBlockId,
  blocksBasePath,
  sectionNodePrefix,
  fallbackVariant,
  onDarkMedia,
  defaultColor,
}: {
  buttonBlockId: string;
  blocksBasePath: string;
  sectionNodePrefix: string;
  fallbackVariant: 'primary' | 'secondary';
  onDarkMedia: boolean;
  defaultColor: string;
}) {
  const config = useThemeConfig();
  const { primary, background, text } = useThemeColors();
  const buttonBase = `${blocksBasePath}.${buttonBlockId}.settings`;
  const label = cfgString(config, `${buttonBase}.label`, 'Shop now');
  const href = cfgString(config, `${buttonBase}.href`, '/collections/all');
  const buttonStyleMode = cfgString(config, `${buttonBase}.buttonStyle`, fallbackVariant);
  const linkTextColorRaw = cfgString(config, `${buttonBase}.linkTextColor`, '');

  const colors = useMemo(
    () => ({ primary, background, text: '#ffffff', line: layout.line }),
    [primary, background]
  );

  const btnStyle = useMemo(
    () =>
      readHeroButtonStyle(config, buttonBase, fallbackVariant, colors, {
        onImageHero: onDarkMedia && buttonStyleMode === 'primary',
      }),
    [config, buttonBase, fallbackVariant, colors, onDarkMedia, buttonStyleMode]
  );

  if (!label.trim()) return null;

  const btnScopeId = `${sectionNodePrefix.replace(/:/g, '-')}-${buttonBlockId}`;
  const btnResponsiveCss =
    btnStyle.width !== btnStyle.mobileWidth
      ? atMobileBreakpoint(
          `[data-hero-btn="${btnScopeId}"] { width: ${btnStyle.mobileWidth} !important; }`
        )
      : '';

  const linkColor =
    linkTextColorRaw && linkTextColorRaw !== 'default'
      ? resolveThemePaletteColorSetting(config, linkTextColorRaw, 1, defaultColor)
      : defaultColor;

  const style: CSSProperties =
    buttonStyleMode === 'link'
      ? {
          display: 'inline-block',
          width: btnStyle.width,
          maxWidth: '100%',
          padding: '4px 0',
          background: 'transparent',
          color: linkColor,
          border: 'none',
          textDecoration: 'underline',
          textUnderlineOffset: 4,
          fontWeight: 500,
          fontSize: 13,
          boxSizing: 'border-box',
          lineHeight: 1.2,
          textAlign: 'center',
        }
      : {
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
        };

  return (
    <EditorBlock nodeId={`${sectionNodePrefix}:block:${buttonBlockId}`} label="Button">
      {btnResponsiveCss ? <style>{btnResponsiveCss}</style> : null}
      <Link
        to={href}
        target={btnStyle.openInNewTab ? '_blank' : undefined}
        rel={btnStyle.openInNewTab ? 'noopener noreferrer' : undefined}
        data-hero-btn={btnScopeId}
        style={style}
      >
        <EditorField fieldPath={`${buttonBase}.label`} label="Label">
          {label}
        </EditorField>
      </Link>
    </EditorBlock>
  );
}

function SplitShowcaseSpacer({
  settingsPath,
  groupKey,
  sectionNodePrefix,
  sectionId,
}: {
  settingsPath: string;
  groupKey: string;
  sectionNodePrefix: string;
  sectionId: string;
}) {
  const config = useThemeConfig();
  const unit = cfgString(config, `${settingsPath}.${groupKey}SpacerUnit`, 'pixel');
  const size = cfgNumber(config, `${settingsPath}.${groupKey}SpacerHeight`, 0);
  const customMobile = cfgBool(config, `${settingsPath}.${groupKey}SpacerCustomMobile`, false);
  const mobileSize = cfgNumber(config, `${settingsPath}.${groupKey}SpacerMobileHeight`, 0);
  if (size <= 0) return null;

  const heightCss = unit === 'percent' ? `${size}%` : `${size}px`;
  const mobileCss = unit === 'percent' ? `${mobileSize}%` : `${mobileSize}px`;
  const className = `split-showcase-spacer-${groupKey}`;
  const mobileStyle =
    customMobile && mobileSize >= 0
      ? atMobileBreakpoint(
          `[data-codiic-section="${sectionId}"] .${className} { height: ${mobileCss} !important; }`
        )
      : '';

  return (
    <>
      {mobileStyle ? <style>{mobileStyle}</style> : null}
      <EditorBlock
        nodeId={`${sectionNodePrefix}:group:${groupKey}:spacer`}
        label="Spacer"
        className={className}
        style={{
          flex: '0 0 auto',
          width: unit === 'percent' ? '100%' : undefined,
          height: heightCss,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

function SplitShowcaseTile({
  imageUrl,
  peekVariant,
  title,
  textBase,
  groupBase,
  groupKey,
  settingsPath,
  titleFieldPath,
  titleBlockNodeId,
  titleBlockLabel,
  buttonBlockId,
  buttonFallbackVariant,
  blocksBasePath,
  sectionNodePrefix,
  sectionId,
  showOverlay,
  overlayBackground,
  fontBody,
  themeFonts,
  schemeBorder,
  sectionHorizontal,
  sectionMinHeightPx,
  sectionPosition,
}: {
  imageUrl: string;
  peekVariant: 'figure' | 'landscape';
  title: string;
  textBase: string;
  groupBase: string;
  groupKey: string;
  settingsPath: string;
  titleFieldPath: string;
  titleBlockNodeId: string;
  titleBlockLabel: string;
  buttonBlockId: string;
  buttonFallbackVariant: 'primary' | 'secondary';
  blocksBasePath: string;
  sectionNodePrefix: string;
  sectionId: string;
  showOverlay: boolean;
  overlayBackground: string;
  fontBody: string;
  themeFonts: { fontHeading: string; fontBody: string };
  schemeBorder: string;
  sectionHorizontal: boolean;
  sectionMinHeightPx: number;
  sectionPosition: string;
}) {
  const config = useThemeConfig();
  const group = readGroupLayout(config, groupBase);
  /** Per-group Position (section Position only places tiles in the grid). */
  const contentPosition = group.position || 'center';
  const spreadContent =
    contentPosition === 'space-between' || contentPosition === 'space-around';

  const groupImage =
    group.backgroundMedia === 'image' && group.backgroundImageUrl.trim()
      ? group.backgroundImageUrl.trim()
      : '';
  const mediaUrl = (groupImage || imageUrl).trim();
  const hasCustomMedia = mediaUrl.length > 0;
  const imageFit = group.backgroundImagePosition === 'fit' ? 'contain' : 'cover';
  const onDarkMedia =
    (hasCustomMedia && (showOverlay || group.backgroundOverlay)) ||
    (Boolean(groupImage) && group.backgroundOverlay);

  const tileClass = `split-showcase-tile split-showcase-tile-${groupKey}`;
  const mobileWidthCss =
    group.mobileWidthMode !== 'fill'
      ? atMobileBreakpoint(
          `[data-codiic-section="${sectionId}"] .split-showcase-tile-${groupKey} .split-showcase-group-stack { width: ${groupWidthCss(group.mobileWidthMode, group.mobileCustomWidth)} !important; max-width: 100% !important; }`
        )
      : '';

  const groupBorderColorHex =
    !group.borderColor || group.borderColor === 'default'
      ? schemeBorder
      : resolveThemePaletteColorSetting(config, group.borderColor, 1, schemeBorder);
  const groupBorder =
    group.borderStyle === 'solid'
      ? resolveMulticolumnBorderCss(
          group.borderStyle,
          group.borderThickness,
          group.borderOpacity,
          groupBorderColorHex,
          schemeBorder
        ) ?? `1px solid ${schemeBorder}33`
      : undefined;

  /** Leave headroom so section top/bottom can pin tiles inside the section. */
  const tileMinHeight =
    sectionPosition === 'top' || sectionPosition === 'bottom'
      ? Math.max(240, Math.round(sectionMinHeightPx * 0.72))
      : sectionHorizontal
        ? Math.max(280, sectionMinHeightPx)
        : Math.max(240, Math.round(sectionMinHeightPx * 0.45));

  const tileStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    minHeight: tileMinHeight,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: hasCustomMedia ? '#0f0f0f' : '#f3efe6',
    border: groupBorder,
    borderRadius: group.cornerRadius > 0 ? group.cornerRadius : undefined,
    boxSizing: 'border-box',
  };

  const defaultHeadingColor = onDarkMedia ? '#ffffff' : '#111827';
  const textAlign =
    group.align === 'left' || group.align === 'right' || group.align === 'center'
      ? group.align
      : 'center';
  const headingStyle: CSSProperties = {
    ...readTextBlockStyle(config, textBase, themeFonts, defaultHeadingColor, {
      width: 'fit',
      maxWidth: 'none',
      alignment: textAlign,
      typographyPreset: 'heading-3',
    }),
    margin: 0,
    textShadow: onDarkMedia ? '0 2px 16px rgba(0, 0, 0, 0.35)' : 'none',
  };

  const stackJustify = group.isHorizontal
    ? flexForAlign(group.align)
    : spreadContent
      ? flexForPosition(contentPosition)
      : 'flex-start';
  const stackAlign = group.isHorizontal
    ? spreadContent
      ? flexForPosition(contentPosition)
      : 'center'
    : flexForAlign(group.align);

  const contentInner = (
    <div
      className="split-showcase-group-stack"
      style={{
        display: 'flex',
        flexDirection: group.isHorizontal ? 'row' : 'column',
        justifyContent: stackJustify,
        alignItems: stackAlign,
        gap: Math.max(0, group.gap),
        width: groupWidthCss(group.widthMode, group.customWidth),
        maxWidth: group.widthMode === 'fit' ? '100%' : undefined,
        flex: spreadContent ? '1 1 auto' : '0 0 auto',
        alignSelf: spreadContent ? 'stretch' : undefined,
        minHeight: spreadContent ? 0 : undefined,
        height: spreadContent ? '100%' : undefined,
        boxSizing: 'border-box',
      }}
    >
      <SplitShowcaseSpacer
        settingsPath={settingsPath}
        groupKey={groupKey}
        sectionNodePrefix={sectionNodePrefix}
        sectionId={sectionId}
      />
      {title.trim() ? (
        <EditorBlock nodeId={titleBlockNodeId} label={titleBlockLabel}>
          <EditorField fieldPath={titleFieldPath} label="Text" as="h2" style={headingStyle}>
            <ThemeEditorRichTextContent html={title} />
          </EditorField>
        </EditorBlock>
      ) : null}
      <SplitShowcaseButton
        buttonBlockId={buttonBlockId}
        blocksBasePath={blocksBasePath}
        sectionNodePrefix={sectionNodePrefix}
        fallbackVariant={buttonFallbackVariant}
        onDarkMedia={onDarkMedia}
        defaultColor={defaultHeadingColor}
      />
    </div>
  );

  const shellJustify = spreadContent ? 'flex-start' : flexForPosition(contentPosition);
  const shellAlign =
    group.align === 'left' ? 'flex-start' : group.align === 'right' ? 'flex-end' : 'center';

  const contentShellStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: shellJustify,
    alignItems: shellAlign,
    paddingTop: group.paddingTop,
    paddingBottom: group.paddingBottom,
    paddingLeft: group.paddingLeft,
    paddingRight: group.paddingRight,
    boxSizing: 'border-box',
    fontFamily: fontBody,
  };

  const maybeLinked: ReactNode = group.link.trim() ? (
    <Link
      to={group.link}
      target={group.linkNewTab ? '_blank' : undefined}
      rel={group.linkNewTab ? 'noopener noreferrer' : undefined}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        justifyContent: shellJustify,
        alignItems: shellAlign,
      }}
    >
      {contentInner}
    </Link>
  ) : (
    contentInner
  );

  const mediaNode = hasCustomMedia ? (
    <img
      src={mediaUrl}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
        objectFit: imageFit,
        objectPosition: 'center center',
        display: 'block',
      }}
    />
  ) : (
    <LayeredSlideshowSlideMedia
      peekVariant={peekVariant}
      figureWidth={peekVariant === 'figure' ? '72%' : '80%'}
      figureHeight={peekVariant === 'figure' ? '100%' : '100%'}
      figureMaxWidth={peekVariant === 'figure' ? 560 : 520}
    />
  );

  return (
    <div className={tileClass} style={tileStyle}>
      {mobileWidthCss ? <style>{mobileWidthCss}</style> : null}
      {mediaNode}
      {onDarkMedia ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: overlayBackground,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      <div style={contentShellStyle}>
        {maybeLinked}
      </div>
    </div>
  );
}

export function SplitShowcase({
  sectionId,
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const { fontHeading, fontBody, background, text } = useThemeColors();
  const themeFonts = useMemo(() => ({ fontHeading, fontBody }), [fontHeading, fontBody]);

  const settingsPath = settingsBase(sectionId, placement, templateId);
  const blocksPath = blocksBase(sectionId, placement, templateId);
  const sectionNodePrefix = sectionNodeId(sectionId, placement, templateId);

  const hero = useMemo(
    () => readHeroStyle(config, settingsPath, { background, color: text, muted: '#9ca3af' }),
    [config, settingsPath, background, text]
  );

  const leftTextBase = `${settingsPath}.group1Text.settings`;
  const rightTextBase = `${settingsPath}.group2Text.settings`;
  const leftTitle =
    cfgString(config, `${leftTextBase}.text`, '') ||
    readHeroHeadingText(config, settingsPath, blocksPath, 'heading') ||
    'New arrivals';
  const rightTitle =
    cfgString(config, `${rightTextBase}.text`, '') ||
    cfgString(config, `${blocksPath}.text_right.settings.text`, '') ||
    'Bestsellers';

  const backgroundColorSetting = cfgString(config, `${settingsPath}.backgroundColor`, '');
  const backgroundMedia = cfgString(config, `${settingsPath}.backgroundMedia`, 'none');
  const backgroundImageUrl = cfgString(config, `${settingsPath}.backgroundImageUrl`, '');
  const hasSectionBgImage = backgroundMedia === 'image' && Boolean(backgroundImageUrl.trim());
  const sectionBackground =
    backgroundColorSetting && backgroundColorSetting !== 'default'
      ? resolveThemePaletteColorSetting(config, backgroundColorSetting, 0, hero.scheme.background)
      : hero.scheme.background;

  const borderStyle = cfgString(config, `${settingsPath}.borderStyle`, 'none');
  const borderThickness = cfgNumber(config, `${settingsPath}.borderThickness`, 1);
  const borderOpacity = cfgNumber(config, `${settingsPath}.borderOpacity`, 100);
  const borderColorRaw = cfgString(config, `${settingsPath}.borderColor`, 'default');
  const cornerRadius = cfgNumber(config, `${settingsPath}.cornerRadius`, 0);
  const schemeBorder = hero.scheme.muted || hero.scheme.color || '#111827';
  const borderColorHex =
    !borderColorRaw || borderColorRaw === 'default'
      ? schemeBorder
      : resolveThemePaletteColorSetting(config, borderColorRaw, 1, schemeBorder);
  const sectionBorder = resolveMulticolumnBorderCss(
    borderStyle,
    borderThickness,
    borderOpacity,
    borderColorHex,
    schemeBorder
  );

  const directionRaw = cfgString(config, `${settingsPath}.direction`, 'horizontal');
  const gridIsHorizontal = directionRaw === 'horizontal' || directionRaw === 'row';
  const layoutAlignment = cfgString(config, `${settingsPath}.layoutAlignment`, 'center');
  const position = cfgString(config, `${settingsPath}.position`, 'center');
  const layoutGap = cfgNumber(config, `${settingsPath}.layoutGap`, 0);
  const verticalOnMobile = cfgBool(config, `${settingsPath}.verticalOnMobile`, true);
  const sectionWidth = cfgString(config, `${settingsPath}.sectionWidth`, 'full');

  const scopedCss = scopedHeroCss(sectionId, hero.customCss);
  const responsiveCss = splitShowcaseResponsiveCss(
    sectionId,
    gridIsHorizontal && verticalOnMobile
  );

  const heightKey = cfgString(config, `${settingsPath}.height`, 'large');
  const customHeight = cfgNumber(config, `${settingsPath}.customHeight`, 680);
  const sectionMinHeight =
    heightKey === 'auto'
      ? 520
      : heightKey === 'full'
        ? '100vh'
        : heightKey === 'custom'
          ? customHeight
          : heightKey === 'small'
            ? 400
            : heightKey === 'medium'
              ? 520
              : 680;
  const sectionMinHeightPx =
    typeof sectionMinHeight === 'number' ? sectionMinHeight : 680;

  const overlayBackground = heroMediaOverlayBackground(
    hero.overlayColor,
    hero.overlayStyle,
    hero.overlayGradientDirection
  );

  const paddingTop = cfgNumber(config, `${settingsPath}.paddingTop`, 0);
  const paddingBottom = cfgNumber(config, `${settingsPath}.paddingBottom`, 0);
  const gridMinHeight =
    typeof sectionMinHeight === 'number'
      ? Math.max(0, sectionMinHeight - paddingTop - paddingBottom)
      : sectionMinHeightPx;

  const gridAlignItems = alignContentForPosition(position);
  const gridJustifyItems = justifyItemsForAlignment(
    layoutAlignment === 'space-between' ? 'center' : layoutAlignment
  );

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <EditorSection
        sectionId={sectionId}
        editorNodeId={sectionNodePrefix}
        label="Split showcase"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: sectionMinHeight,
          paddingTop,
          paddingBottom,
          background: hasSectionBgImage ? undefined : sectionBackground,
          backgroundImage: hasSectionBgImage ? `url(${backgroundImageUrl.trim()})` : undefined,
          backgroundSize: hasSectionBgImage ? 'cover' : undefined,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: sectionBorder,
          borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
          fontFamily: fontBody,
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          className="split-showcase-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: gridIsHorizontal
              ? 'minmax(0, 1fr) minmax(0, 1fr)'
              : 'minmax(0, 1fr)',
            alignItems: gridAlignItems,
            justifyItems: gridJustifyItems,
            justifyContent:
              layoutAlignment === 'right'
                ? 'end'
                : layoutAlignment === 'left'
                  ? 'start'
                  : layoutAlignment === 'space-between'
                    ? 'space-between'
                    : 'center',
            gap: Math.max(0, layoutGap),
            width: '100%',
            maxWidth: sectionWidth === 'full' ? '100%' : 1200,
            minHeight: gridMinHeight,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <SplitShowcaseTile
            imageUrl={hero.media1Url}
            peekVariant="figure"
            title={leftTitle}
            textBase={leftTextBase}
            groupBase={`${settingsPath}.group1Group`}
            groupKey="group1"
            settingsPath={settingsPath}
            titleFieldPath={`${leftTextBase}.text`}
            titleBlockNodeId={`${sectionNodePrefix}:group:group1:text`}
            titleBlockLabel="Text"
            buttonBlockId="primary_button"
            buttonFallbackVariant="primary"
            blocksBasePath={blocksPath}
            sectionNodePrefix={sectionNodePrefix}
            sectionId={sectionId}
            showOverlay={hero.mediaOverlay}
            overlayBackground={overlayBackground}
            fontBody={fontBody}
            themeFonts={themeFonts}
            schemeBorder={schemeBorder}
            sectionHorizontal={gridIsHorizontal}
            sectionMinHeightPx={gridMinHeight}
            sectionPosition={position}
          />
          <SplitShowcaseTile
            imageUrl={hero.media2Url}
            peekVariant="landscape"
            title={rightTitle}
            textBase={rightTextBase}
            groupBase={`${settingsPath}.group2Group`}
            groupKey="group2"
            settingsPath={settingsPath}
            titleFieldPath={`${rightTextBase}.text`}
            titleBlockNodeId={`${sectionNodePrefix}:group:group2:text`}
            titleBlockLabel="Text"
            buttonBlockId="secondary_button"
            buttonFallbackVariant="secondary"
            blocksBasePath={blocksPath}
            sectionNodePrefix={sectionNodePrefix}
            sectionId={sectionId}
            showOverlay={hero.mediaOverlay}
            overlayBackground={overlayBackground}
            fontBody={fontBody}
            themeFonts={themeFonts}
            schemeBorder={schemeBorder}
            sectionHorizontal={gridIsHorizontal}
            sectionMinHeightPx={gridMinHeight}
            sectionPosition={position}
          />
        </div>
      </EditorSection>
    </>
  );
}
