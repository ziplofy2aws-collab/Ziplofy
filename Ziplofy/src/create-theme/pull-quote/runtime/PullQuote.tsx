import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
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
  pullQuoteContentAlign,
  pullQuoteJustifyContent,
  readPullQuoteLayout,
  scopedPullQuoteCss,
} from './pullQuoteStyles';

const DEFAULT_QUOTE =
  'At the heart of every product lies a unique story, driven by our passion for quality and innovation. Each item enhances your everyday life and sparks joy.';

export function PullQuote({
  sectionId = 'pull_quote_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontHeading } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readPullQuoteLayout(config, settingsBase), [config, settingsBase]);

  const quote =
    cfgString(config, `${settingsBase}.quote`, DEFAULT_QUOTE) || DEFAULT_QUOTE;
  const linkLabel = cfgString(config, `${settingsBase}.linkLabel`, 'Shop now');
  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`, '/collections');
  const linkOpenInNewTab = cfgBool(config, `${settingsBase}.linkOpenInNewTab`, false);
  const buttonStyleMode = cfgString(config, `${settingsBase}.buttonStyle`, 'link');
  const buttonVariant = buttonStyleMode === 'secondary' ? 'secondary' : 'primary';
  const buttonCustomBackground = cfgString(config, `${settingsBase}.buttonCustomBackground`, '#111827');
  const buttonCustomText = cfgString(config, `${settingsBase}.buttonCustomText`, '#ffffff');
  const buttonLinkTextColorRaw = cfgString(config, `${settingsBase}.buttonLinkTextColor`, '');
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

  const quoteWidthMode = cfgString(config, `${settingsBase}.quoteWidth`, 'fill');
  const quoteMaxWidthMode = cfgString(config, `${settingsBase}.quoteMaxWidth`, 'wide');
  const quoteAlignment = cfgString(config, `${settingsBase}.quoteAlignment`, '');
  const quotePreset = cfgString(config, `${settingsBase}.quoteTypographyPreset`, 'default');
  const quoteColorRaw = cfgString(config, `${settingsBase}.quoteColor`, '');
  const quoteBackgroundEnabled = cfgBool(config, `${settingsBase}.quoteBackgroundEnabled`, false);
  const quotePaddingTop = cfgNumber(config, `${settingsBase}.quotePaddingTop`, 0);
  const quotePaddingBottom = cfgNumber(config, `${settingsBase}.quotePaddingBottom`, 0);
  const quotePaddingLeft = cfgNumber(config, `${settingsBase}.quotePaddingLeft`, 0);
  const quotePaddingRight = cfgNumber(config, `${settingsBase}.quotePaddingRight`, 0);

  const scheme = style.scheme;
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground =
    backgroundColorRaw === '' || backgroundColorRaw === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.background);
  const textAlign = pullQuoteContentAlign(style.layoutAlignment);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const scopeClass = `ziplofy-pull-quote-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const shellClass = `${scopeClass}-shell`;

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: style.minHeightPx > 0 ? style.minHeightPx : undefined,
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const isHorizontal = style.direction === 'horizontal';
  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight:
      style.minHeightPx > 0
        ? style.minHeightPx - style.paddingTop - style.paddingBottom
        : undefined,
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    alignItems: isHorizontal
      ? pullQuoteJustifyContent(style.position)
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
      : pullQuoteJustifyContent(style.position),
    gap: style.layoutGap,
    textAlign,
    position: 'relative',
    zIndex: 2,
  };

  const QUOTE_PRESETS: Record<string, { fontSize: string; fontWeight: number; lineHeight: number }> = {
    default: { fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25 },
    'heading-1': { fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1 },
    'heading-2': { fontSize: 'clamp(1.875rem, 4.2vw, 2.75rem)', fontWeight: 700, lineHeight: 1.15 },
    'heading-3': { fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25 },
    'heading-4': { fontSize: 'clamp(1.25rem, 2.8vw, 1.75rem)', fontWeight: 600, lineHeight: 1.3 },
  };
  const quotePresetStyle = QUOTE_PRESETS[quotePreset] ?? QUOTE_PRESETS.default;
  const quoteMaxWidthPx =
    quoteMaxWidthMode === 'narrow' ? 420 : quoteMaxWidthMode === 'normal' ? 560 : 720;
  const quoteColor =
    quoteColorRaw === '' || quoteColorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, quoteColorRaw, 1, scheme.color);
  const quoteTextAlign: CSSProperties['textAlign'] =
    quoteAlignment === 'left'
      ? 'left'
      : quoteAlignment === 'right'
        ? 'right'
        : quoteAlignment === 'center'
          ? 'center'
          : undefined;

  const quoteStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: quotePresetStyle.fontSize,
    fontWeight: quotePresetStyle.fontWeight,
    lineHeight: quotePresetStyle.lineHeight,
    letterSpacing: '-0.02em',
    width: quoteWidthMode === 'fill' ? '100%' : 'fit-content',
    maxWidth: quoteMaxWidthPx,
    color: quoteColor,
    textAlign: quoteTextAlign,
    paddingTop: quotePaddingTop || undefined,
    paddingBottom: quotePaddingBottom || undefined,
    paddingLeft: quotePaddingLeft || undefined,
    paddingRight: quotePaddingRight || undefined,
    background: quoteBackgroundEnabled ? 'rgba(0, 0, 0, 0.04)' : undefined,
    borderRadius: quoteBackgroundEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };

  const linkTextColor =
    buttonLinkTextColorRaw === '' || buttonLinkTextColorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, buttonLinkTextColorRaw, 1, scheme.color);
  const btnScopeClass = `${scopeClass}-btn`;
  const buttonAppearance: CSSProperties =
    buttonStyleMode === 'link'
      ? {
          background: 'transparent',
          color: linkTextColor,
          border: 'none',
          borderRadius: 0,
          fontWeight: 400,
          textUnderlineOffset: 3,
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
  const linkStyle: CSSProperties = {
    ...buttonAppearance,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: buttonStyleMode === 'link' ? 'fit-content' : desktopBtnWidth,
    maxWidth: '100%',
    padding: buttonStyleMode === 'link' ? '4px 0' : '12px 28px',
    fontSize: '1rem',
    textDecoration: buttonStyleMode === 'link' ? 'underline' : 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };
  const buttonResponsiveCss =
    buttonStyleMode !== 'link' && desktopBtnWidth !== mobileBtnWidth
      ? `@media (max-width: 749px) { .${btnScopeClass} { width: ${mobileBtnWidth} !important; } }`
      : '';

  const customCss = scopedPullQuoteCss(sectionId, style.customCss);
  const responsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    isHorizontal ? scopedMobileFlexStackCss(scopeClass) : ''
  );

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Pull quote"
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
            backgroundSize: 'cover',
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
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1,
          }}
        />
      ) : null}
      <div className={scopeClass} style={stage}>
        <EditorField fieldPath={`${settingsBase}.quote`} label="Quote" as="p" style={quoteStyle}>
          {quote}
        </EditorField>
        {linkLabel ? (
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
              to={linkUrl || '#'}
              target={linkOpenInNewTab ? '_blank' : undefined}
              rel={linkOpenInNewTab ? 'noopener noreferrer' : undefined}
              className={btnScopeClass}
              style={linkStyle}
            >
              <EditorField fieldPath={`${settingsBase}.linkLabel`} label="Label" as="span">
                {linkLabel}
              </EditorField>
            </Link>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
