import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import {
  resolveThemeButtonVariantStyle,
  themeButtonInlineStyle,
} from '../../runtime/shared/themeButtonRuntime';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  scopedMobileFlexStackCss,
  scopedMobileHorizontalPadCss,
} from '../../runtime/shared/responsive';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  themeFontsFromConfig,
} from '../../runtime/shared/themeTypographyRuntime';
import {
  readRichTextLayout,
  richTextBackgroundImageCss,
  richTextContentAlign,
  richTextJustifyContent,
  richTextOverlayBackground,
  scopedRichTextCss,
} from './richTextStyles';
import { readRichTextContentBlocks } from '../../../utils/rich-text-sidebar.util';

const DEFAULT_HEADING = 'New arrivals';
const DEFAULT_TEXT =
  'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.';

export function RichText({
  sectionId = 'rich_text_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontHeading, fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readRichTextLayout(config, settingsBase), [config, settingsBase]);
  const sectionBase = settingsBase.replace(/\.settings$/, '');
  const contentBlocks = useMemo(
    () => readRichTextContentBlocks(config, sectionBase),
    [config, sectionBase]
  );
  const showHeading = contentBlocks.includes('heading');
  const showText = contentBlocks.includes('text');
  const showButton = contentBlocks.includes('button');

  const heading = cfgString(config, `${settingsBase}.heading`, DEFAULT_HEADING) || DEFAULT_HEADING;
  const text = cfgString(config, `${settingsBase}.text`, DEFAULT_TEXT) || DEFAULT_TEXT;
  const buttonLabel = cfgString(config, `${settingsBase}.buttonLabel`, 'Shop now');
  const buttonUrl = cfgString(config, `${settingsBase}.buttonUrl`, '/collections');
  const buttonOpenInNewTab = cfgBool(config, `${settingsBase}.buttonOpenInNewTab`, false);
  const buttonStyleMode = cfgString(config, `${settingsBase}.buttonStyle`, 'primary');
  const buttonVariant = buttonStyleMode === 'secondary' ? 'secondary' : 'primary';
  const buttonCustomBackground = cfgString(config, `${settingsBase}.buttonCustomBackground`, '#111827');
  const buttonCustomText = cfgString(config, `${settingsBase}.buttonCustomText`, '#ffffff');
  const buttonDesktopWidthMode = cfgString(config, `${settingsBase}.buttonDesktopWidth`, 'fit');
  const buttonMobileWidthMode = cfgString(config, `${settingsBase}.buttonMobileWidth`, 'fit');
  const clampPercent = (n: number) => Math.min(100, Math.max(1, Number.isFinite(n) ? n : 100));
  const desktopBtnWidth =
    buttonDesktopWidthMode === 'custom'
      ? `${clampPercent(cfgNumber(config, `${settingsBase}.buttonDesktopCustomWidth`, 100))}%`
      : 'fit-content';
  const mobileBtnWidth =
    buttonMobileWidthMode === 'custom'
      ? `${clampPercent(cfgNumber(config, `${settingsBase}.buttonMobileCustomWidth`, 100))}%`
      : 'fit-content';
  const themeButtonStyle = useMemo(
    () => resolveThemeButtonVariantStyle(config, buttonVariant),
    [config, buttonVariant]
  );

  const textWidthMode = cfgString(config, `${settingsBase}.textWidth`, 'fit');
  const textMaxWidthMode = cfgString(config, `${settingsBase}.textMaxWidth`, 'normal');
  const textPreset = cfgString(config, `${settingsBase}.textTypographyPreset`, 'default');
  const textColorRaw = cfgString(config, `${settingsBase}.textColor`, '');
  const textBackgroundEnabled = cfgBool(config, `${settingsBase}.textBackgroundEnabled`, false);
  const textBackgroundColor = cfgString(config, `${settingsBase}.textBackgroundColor`, '#f3f4f6');
  const textPaddingTop = cfgNumber(config, `${settingsBase}.textPaddingTop`, 0);
  const textPaddingBottom = cfgNumber(config, `${settingsBase}.textPaddingBottom`, 0);
  const textPaddingLeft = cfgNumber(config, `${settingsBase}.textPaddingLeft`, 0);
  const textPaddingRight = cfgNumber(config, `${settingsBase}.textPaddingRight`, 0);

  const headingWidthMode = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const headingMaxWidthMode = cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal');
  const headingPreset = cfgString(config, `${settingsBase}.headingTypographyPreset`, 'default');
  const headingColorRaw = cfgString(config, `${settingsBase}.headingColor`, '');
  const headingBackgroundEnabled = cfgBool(config, `${settingsBase}.headingBackgroundEnabled`, false);
  const headingBackgroundColor = cfgString(
    config,
    `${settingsBase}.headingBackgroundColor`,
    '#f3f4f6'
  );
  const headingPaddingTop = cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0);
  const headingPaddingBottom = cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0);
  const headingPaddingLeft = cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0);
  const headingPaddingRight = cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0);

  const scheme = style.scheme;
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground =
    backgroundColorRaw === '' || backgroundColorRaw === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.background);
  const textAlign = richTextContentAlign(style.layoutAlignment);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const scopeClass = `codiic-rich-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const shellClass = `${scopeClass}-shell`;
  const isHorizontal = style.direction === 'horizontal';

  const hasFixedHeight = style.minHeightPx != null && style.minHeightPx > 0;

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: sectionBackground,
    backgroundColor: sectionBackground,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    ...(hasFixedHeight ? { minHeight: style.minHeightPx } : {}),
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    flex: hasFixedHeight ? '1 1 auto' : undefined,
    minHeight: hasFixedHeight
      ? Math.max(0, (style.minHeightPx as number) - style.paddingTop - style.paddingBottom)
      : undefined,
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    alignItems: isHorizontal
      ? richTextJustifyContent(style.position)
      : textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
    justifyContent: isHorizontal
      ? textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-end'
          : 'flex-start'
      : richTextJustifyContent(style.position),
    gap: style.layoutGap,
    textAlign,
    position: 'relative',
    zIndex: 2,
  };

  const HEADING_PRESETS: Record<string, { fontSize: string; fontWeight: number; lineHeight: number }> = {
    default: { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.15 },
    'heading-1': { fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1 },
    'heading-2': { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.15 },
    'heading-3': { fontSize: 'clamp(1.5rem, 3.2vw, 2rem)', fontWeight: 700, lineHeight: 1.2 },
    'heading-4': { fontSize: 'clamp(1.25rem, 2.6vw, 1.625rem)', fontWeight: 600, lineHeight: 1.25 },
    'heading-5': { fontSize: 'clamp(1.125rem, 2.2vw, 1.375rem)', fontWeight: 600, lineHeight: 1.3 },
    'heading-6': { fontSize: 'clamp(1rem, 2vw, 1.125rem)', fontWeight: 600, lineHeight: 1.35 },
  };
  const headingPresetStyle = HEADING_PRESETS[headingPreset] ?? HEADING_PRESETS.default;
  const headingMaxWidthPx =
    headingMaxWidthMode === 'narrow' ? 360 : headingMaxWidthMode === 'wide' ? 760 : 520;
  const headingColor =
    headingColorRaw === '' || headingColorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, headingColorRaw, 1, scheme.color);

  const headingIsCustom = headingPreset === 'custom';
  const themeFonts = themeFontsFromConfig(config);
  const customHeadingFont = cfgString(config, `${settingsBase}.headingFont`, 'heading');
  const customHeadingSizeRaw = cfgString(config, `${settingsBase}.headingFontSize`, '32px');
  const customHeadingSizePx = (() => {
    const n = parseFloat(customHeadingSizeRaw);
    return Number.isFinite(n) && n > 0 ? n : 32;
  })();
  const customHeadingWeightStyle = resolveThemeFontWeightAndStyle(customHeadingFont);
  const customHeadingWrap = cfgString(config, `${settingsBase}.headingWrap`, 'pretty');
  const customHeadingCase = cfgString(config, `${settingsBase}.headingTextCase`, 'default');

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: headingIsCustom
      ? resolveThemeFontFamily(customHeadingFont, themeFonts)
      : fontHeading,
    fontSize: headingIsCustom ? customHeadingSizePx : headingPresetStyle.fontSize,
    fontWeight: headingIsCustom
      ? (customHeadingWeightStyle.fontWeight ?? 700)
      : headingPresetStyle.fontWeight,
    fontStyle: headingIsCustom ? customHeadingWeightStyle.fontStyle : undefined,
    lineHeight: headingIsCustom
      ? lineHeightMultiplier(cfgString(config, `${settingsBase}.headingLineHeight`, 'normal'))
      : headingPresetStyle.lineHeight,
    letterSpacing: headingIsCustom
      ? letterSpacingCss(cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal'))
      : '-0.02em',
    textTransform: headingIsCustom && customHeadingCase === 'uppercase' ? 'uppercase' : undefined,
    textWrap: headingIsCustom
      ? ((customHeadingWrap === 'nowrap'
          ? 'nowrap'
          : customHeadingWrap === 'balance'
            ? 'balance'
            : 'pretty') as CSSProperties['textWrap'])
      : undefined,
    width: headingWidthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: headingMaxWidthPx,
    color: headingColor,
    paddingTop: headingPaddingTop || undefined,
    paddingBottom: headingPaddingBottom || undefined,
    paddingLeft: headingPaddingLeft || undefined,
    paddingRight: headingPaddingRight || undefined,
    background: headingBackgroundEnabled ? headingBackgroundColor || 'rgba(0, 0, 0, 0.04)' : undefined,
    borderRadius: headingBackgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };

  const TEXT_PRESETS: Record<string, { fontSize: string; fontWeight: number; lineHeight: number }> = {
    default: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55 },
    body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55 },
    'heading-6': { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    'heading-5': { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
    'heading-4': { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
  };
  const textPresetStyle = TEXT_PRESETS[textPreset] ?? TEXT_PRESETS.default;
  const textMaxWidthPx =
    textMaxWidthMode === 'narrow' ? 360 : textMaxWidthMode === 'wide' ? 760 : 520;
  const bodyColor =
    textColorRaw === '' || textColorRaw === 'default'
      ? scheme.muted
      : resolveThemePaletteColorSetting(config, textColorRaw, 1, scheme.muted);

  const bodyStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontBody,
    fontSize: textPresetStyle.fontSize,
    fontWeight: textPresetStyle.fontWeight,
    lineHeight: textPresetStyle.lineHeight,
    width: textWidthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: textMaxWidthPx,
    color: bodyColor,
    paddingTop: textPaddingTop || undefined,
    paddingBottom: textPaddingBottom || undefined,
    paddingLeft: textPaddingLeft || undefined,
    paddingRight: textPaddingRight || undefined,
    background: textBackgroundEnabled ? textBackgroundColor || 'rgba(0, 0, 0, 0.04)' : undefined,
    borderRadius: textBackgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };

  const btnScopeClass = `${scopeClass}-btn`;
  const buttonAppearance: CSSProperties =
    buttonStyleMode === 'link'
      ? {
          background: 'transparent',
          color: scheme.color,
          border: 'none',
          borderRadius: 0,
          fontFamily: fontBody,
          fontWeight: 600,
          textUnderlineOffset: 4,
        }
      : buttonStyleMode === 'custom'
        ? {
            background: buttonCustomBackground,
            color: buttonCustomText,
            border: 'none',
            borderRadius: themeButtonStyle.borderRadius,
            fontFamily: themeButtonStyle.fontFamily,
            fontWeight: themeButtonStyle.fontWeight,
            textTransform: themeButtonStyle.textTransform,
          }
        : themeButtonInlineStyle(themeButtonStyle);
  const buttonStyle: CSSProperties = {
    ...buttonAppearance,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: buttonStyleMode === 'link' ? 'fit-content' : desktopBtnWidth,
    maxWidth: '100%',
    padding: buttonStyleMode === 'link' ? '4px 0' : '12px 28px',
    fontSize: '0.9375rem',
    textDecoration: buttonStyleMode === 'link' ? 'underline' : 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };
  const buttonResponsiveCss =
    buttonStyleMode !== 'link' && desktopBtnWidth !== mobileBtnWidth
      ? `@media (max-width: 749px) { .${btnScopeClass} { width: ${mobileBtnWidth} !important; } }`
      : '';

  const customCss = scopedRichTextCss(sectionId, style.customCss);
  const responsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    isHorizontal ? scopedMobileFlexStackCss(scopeClass) : ''
  );

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Rich text"
      className={shellClass}
      style={shell}
    >
      {customCss ? <style>{customCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            ...richTextBackgroundImageCss(style.backgroundImagePosition),
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: richTextOverlayBackground(style.overlayColor, style.overlayOpacity),
            zIndex: 1,
          }}
        />
      ) : null}
      <div className={scopeClass} style={stage}>
        {showHeading ? (
          <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
            <ThemeEditorRichTextContent html={heading} />
          </EditorField>
        ) : null}
        {showText ? (
          <EditorField fieldPath={`${settingsBase}.text`} label="Text" as="div" style={bodyStyle}>
            <ThemeEditorRichTextContent html={text} />
          </EditorField>
        ) : null}
        {showButton && buttonLabel ? (
          <EditorBlock
            nodeId={`${editorNodeId}:block:button`}
            label="Button"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent:
                textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {buttonResponsiveCss ? <style>{buttonResponsiveCss}</style> : null}
            <Link
              to={buttonUrl || '#'}
              target={buttonOpenInNewTab ? '_blank' : undefined}
              rel={buttonOpenInNewTab ? 'noopener noreferrer' : undefined}
              className={btnScopeClass}
              style={buttonStyle}
            >
              <EditorField fieldPath={`${settingsBase}.buttonLabel`} label="Label" as="span">
                {buttonLabel}
              </EditorField>
            </Link>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
