import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  themeFontsFromConfig,
  resolveThemeTypographyStyle,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  lineHeightMultiplier,
  letterSpacingCss,
} from '../../runtime/shared/themeTypographyRuntime';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeLayout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  scopedMobileHorizontalPadCss,
} from '../../runtime/shared/responsive';
import {
  alignContentForPosition,
  justifyItemsForAlignment,
  multicolumnMobileStackCss,
  readMulticolumnItems,
  readMulticolumnLayout,
  resolveMulticolumnBorderCss,
  scopedMulticolumnCss,
} from './multicolumnStyles';

export function Multicolumn({
  sectionId = 'multicolumn_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readMulticolumnLayout(config, settingsBase), [config, settingsBase]);
  const items = useMemo(
    () => readMulticolumnItems(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scheme = style.scheme;
  const sectionBackground =
    !style.backgroundColor || style.backgroundColor === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, style.backgroundColor, 0, scheme.background);
  const schemeBorder = scheme.muted ?? scheme.color;
  const borderColorHex =
    !style.borderColor || style.borderColor === 'default'
      ? schemeBorder
      : resolveThemePaletteColorSetting(config, style.borderColor, 1, schemeBorder);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const scopeClass = `codiic-multicolumn-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const colCount = Math.max(items.length, style.columns);
  const isHorizontal = style.direction === 'horizontal';
  const shellClass = `${scopeClass}-shell`;
  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `codiic-multicolumn-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';
  const minHeightPx =
    style.height === 'small' ? 240 : style.height === 'medium' ? 360 : style.height === 'large' ? 480 : 0;
  const gridAlignItems =
    style.position === 'top' ? 'start' : style.position === 'bottom' ? 'end' : 'center';

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: minHeightPx > 0 ? minHeightPx : undefined,
    border: resolveMulticolumnBorderCss(
      style.borderStyle,
      style.borderThickness,
      style.borderOpacity,
      borderColorHex,
      schemeBorder
    ),
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isHorizontal ? `repeat(${colCount}, minmax(0, 1fr))` : '1fr',
    gap: style.layoutGap,
    width: '100%',
    minHeight: minHeightPx > 0 ? minHeightPx : undefined,
    height: minHeightPx > 0 ? '100%' : undefined,
    justifyItems: justifyItemsForAlignment(style.layoutAlignment),
    alignItems: isHorizontal ? gridAlignItems : undefined,
    alignContent: alignContentForPosition(style.position),
  };

  const clampPct = (n: number) => Math.min(100, Math.max(1, Number.isFinite(n) ? n : 100));

  const HEADING_PRESETS: Record<string, { fontSize: string; fontWeight: number; lineHeight: number }> = {
    default: { fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.3 },
    paragraph: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55 },
    'heading-1': { fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 700, lineHeight: 1.1 },
    'heading-2': { fontSize: 'clamp(1.625rem, 3.6vw, 2.25rem)', fontWeight: 700, lineHeight: 1.15 },
    'heading-3': { fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 700, lineHeight: 1.2 },
    'heading-4': { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
    'heading-5': { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
    'heading-6': { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
  };
  const headingMaxWidthPx = (mode: string) =>
    mode === 'narrow' ? 240 : mode === 'none' ? undefined : 360;
  const descMaxWidthPx = (mode: string) =>
    mode === 'narrow' ? 240 : mode === 'wide' ? 520 : mode === 'none' ? undefined : 360;
  const textTransformFor = (c: string): CSSProperties['textTransform'] =>
    c === 'uppercase' ? 'uppercase' : c === 'lowercase' ? 'lowercase' : c === 'capitalize' ? 'capitalize' : 'none';

  const fonts = useMemo(() => themeFontsFromConfig(config), [config]);

  const customCss = scopedMulticolumnCss(sectionId, style.customCss);
  const responsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    mobileStackClass ? multicolumnMobileStackCss(sectionId) : ''
  );
  const blocksBase = settingsBase.replace(/\.settings$/, '');

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Multicolumn"
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
      <div
        className={scopeClass}
        style={{
          maxWidth: innerMaxWidth,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className={mobileStackClass || undefined} style={grid}>
          {items.map((item) => {
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${item.id}`
                : `layout:${sectionId}:block:${item.id}`;

            const s = item.settings;
            // Section Layout → Alignment controls content alignment across columns.
            // Column Alignment still controls justifySelf when the column is not full-width.
            const contentAlign = style.layoutAlignment;
            const alignItems =
              contentAlign === 'left'
                ? 'flex-start'
                : contentAlign === 'right'
                  ? 'flex-end'
                  : 'center';
            const justifyContent =
              s.position === 'top' ? 'flex-start' : s.position === 'bottom' ? 'flex-end' : 'center';
            const colWidth =
              s.width === 'fit'
                ? 'fit-content'
                : s.width === 'custom'
                  ? `${clampPct(s.customWidth)}%`
                  : '100%';
            const colHeight =
              s.height === 'fill'
                ? '100%'
                : s.height === 'custom'
                  ? `${clampPct(s.customHeight)}%`
                  : undefined;
            const colBg =
              s.backgroundColor && s.backgroundColor !== 'default'
                ? resolveThemePaletteColorSetting(config, s.backgroundColor, 0, 'transparent')
                : undefined;
            const colBgImage =
              s.backgroundMedia === 'image' && s.backgroundImageUrl ? s.backgroundImageUrl : null;
            const colBorderColorHex =
              !s.borderColor || s.borderColor === 'default'
                ? schemeBorder
                : resolveThemePaletteColorSetting(config, s.borderColor, 1, schemeBorder);

            const columnStyle: CSSProperties = {
              display: 'flex',
              flexDirection: s.direction === 'horizontal' ? 'row' : 'column',
              alignItems,
              justifyContent,
              textAlign: contentAlign,
              gap: s.layoutGap,
              width: colWidth,
              height: colHeight,
              justifySelf:
                s.width === 'fill'
                  ? 'stretch'
                  : s.layoutAlignment === 'left'
                    ? 'start'
                    : s.layoutAlignment === 'right'
                      ? 'end'
                      : 'center',
              background: colBg,
              backgroundImage: colBgImage
                ? s.backgroundOverlay
                  ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${colBgImage})`
                  : `url(${colBgImage})`
                : undefined,
              backgroundSize: colBgImage ? 'cover' : undefined,
              backgroundPosition: colBgImage ? 'center' : undefined,
              border: resolveMulticolumnBorderCss(
                s.borderStyle,
                s.borderThickness,
                s.borderOpacity,
                colBorderColorHex,
                schemeBorder
              ),
              borderRadius: s.cornerRadius > 0 ? s.cornerRadius : undefined,
              overflow: s.cornerRadius > 0 ? 'hidden' : undefined,
              paddingTop: s.paddingTop || undefined,
              paddingBottom: s.paddingBottom || undefined,
              paddingLeft: s.paddingLeft || undefined,
              paddingRight: s.paddingRight || undefined,
              boxSizing: 'border-box',
              position: 'relative',
            };

            const h = item.headingSettings;
            const headingNormalizedPreset = h.preset === 'body' ? 'paragraph' : h.preset;
            let headingTypo: CSSProperties;
            if (headingNormalizedPreset === 'custom') {
              const weightStyle = resolveThemeFontWeightAndStyle(h.font);
              const sizePx =
                h.fontSize && h.fontSize !== 'default' ? Number.parseInt(h.fontSize, 10) : NaN;
              headingTypo = {
                fontFamily: resolveThemeFontFamily(h.font, fonts),
                fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : '1.0625rem',
                fontWeight: weightStyle.fontWeight ?? 700,
                fontStyle: weightStyle.fontStyle,
                lineHeight: lineHeightMultiplier(h.lineHeight),
                letterSpacing: letterSpacingCss(h.letterSpacing),
                textTransform: textTransformFor(h.textCase),
                textWrap:
                  h.wrap === 'balance' ? 'balance' : h.wrap === 'nowrap' ? 'nowrap' : 'pretty',
              };
            } else if (
              headingNormalizedPreset === 'default' ||
              headingNormalizedPreset === 'paragraph' ||
              headingNormalizedPreset.startsWith('heading-')
            ) {
              const fromTheme =
                headingNormalizedPreset !== 'default'
                  ? resolveThemeTypographyStyle(config, headingNormalizedPreset, fonts)
                  : null;
              const headingPreset = HEADING_PRESETS[h.preset] ?? HEADING_PRESETS.default;
              headingTypo = fromTheme
                ? {
                    fontFamily: fromTheme.fontFamily,
                    fontSize: `${fromTheme.fontSize}px`,
                    fontWeight: fromTheme.fontWeight,
                    fontStyle: fromTheme.fontStyle,
                    lineHeight: fromTheme.lineHeight,
                    letterSpacing: fromTheme.letterSpacing,
                    textTransform: fromTheme.textTransform,
                  }
                : {
                    fontSize: headingPreset.fontSize,
                    fontWeight: headingPreset.fontWeight,
                    lineHeight: headingPreset.lineHeight,
                    letterSpacing: '-0.01em',
                  };
            } else {
              const headingPreset = HEADING_PRESETS.default;
              headingTypo = {
                fontSize: headingPreset.fontSize,
                fontWeight: headingPreset.fontWeight,
                lineHeight: headingPreset.lineHeight,
                letterSpacing: '-0.01em',
              };
            }
            const headingColor =
              h.color === '' || h.color === 'default'
                ? scheme.color
                : resolveThemePaletteColorSetting(config, h.color, 1, scheme.color);
            const headingBg = h.backgroundEnabled
              ? h.backgroundColor && h.backgroundColor !== 'default'
                ? resolveThemePaletteColorSetting(config, h.backgroundColor, 0, 'rgba(0,0,0,0.04)')
                : 'rgba(0,0,0,0.04)'
              : undefined;
            const headingStyle: CSSProperties = {
              margin: 0,
              ...headingTypo,
              width: h.width === 'fill' ? '100%' : 'fit-content',
              maxWidth: headingMaxWidthPx(h.maxWidth),
              textAlign: contentAlign as CSSProperties['textAlign'],
              color: headingColor,
              background: headingBg,
              borderRadius: h.backgroundEnabled && h.cornerRadius > 0 ? h.cornerRadius : undefined,
              paddingTop: h.paddingTop || undefined,
              paddingBottom: h.paddingBottom || undefined,
              paddingLeft: h.paddingLeft || undefined,
              paddingRight: h.paddingRight || undefined,
              boxSizing: 'border-box',
            };

            const d = item.descriptionSettings;
            const descNormalizedPreset = d.preset === 'body' ? 'paragraph' : d.preset;
            let descTypo: CSSProperties;
            if (descNormalizedPreset === 'default') {
              descTypo = { fontSize: '0.9375rem', lineHeight: 1.55 };
            } else if (descNormalizedPreset === 'custom') {
              const weightStyle = resolveThemeFontWeightAndStyle(d.font);
              const sizePx =
                d.fontSize && d.fontSize !== 'default' ? Number.parseInt(d.fontSize, 10) : NaN;
              descTypo = {
                fontFamily: resolveThemeFontFamily(d.font, fonts),
                fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : '0.9375rem',
                fontWeight: weightStyle.fontWeight ?? 400,
                fontStyle: weightStyle.fontStyle,
                lineHeight: lineHeightMultiplier(d.lineHeight),
                letterSpacing: letterSpacingCss(d.letterSpacing),
                textTransform: textTransformFor(d.textCase),
                textWrap:
                  d.wrap === 'balance' ? 'balance' : d.wrap === 'nowrap' ? 'nowrap' : 'pretty',
              };
            } else {
              const t = resolveThemeTypographyStyle(config, descNormalizedPreset, fonts);
              descTypo = {
                fontFamily: t.fontFamily,
                fontSize: `${t.fontSize}px`,
                fontWeight: t.fontWeight,
                fontStyle: t.fontStyle,
                lineHeight: t.lineHeight,
                letterSpacing: t.letterSpacing,
                textTransform: t.textTransform,
              };
            }
            const descColor =
              d.color === '' || d.color === 'default'
                ? scheme.muted
                : resolveThemePaletteColorSetting(config, d.color, 1, scheme.muted);
            const descBg = d.backgroundEnabled
              ? d.backgroundColor && d.backgroundColor !== 'default'
                ? resolveThemePaletteColorSetting(config, d.backgroundColor, 0, 'rgba(0,0,0,0.04)')
                : 'rgba(0,0,0,0.04)'
              : undefined;
            const descStyle: CSSProperties = {
              margin: 0,
              ...descTypo,
              width: d.width === 'fill' ? '100%' : 'fit-content',
              maxWidth: descMaxWidthPx(d.maxWidth),
              textAlign: contentAlign as CSSProperties['textAlign'],
              color: descColor,
              background: descBg,
              borderRadius: d.backgroundEnabled && d.cornerRadius > 0 ? d.cornerRadius : undefined,
              paddingTop: d.paddingTop || undefined,
              paddingBottom: d.paddingBottom || undefined,
              paddingLeft: d.paddingLeft || undefined,
              paddingRight: d.paddingRight || undefined,
              boxSizing: 'border-box',
            };

            const content = (
              <>
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.heading`}
                  label="Heading"
                  as="h3"
                  style={headingStyle}
                >
                  <ThemeEditorRichTextContent html={item.heading} />
                </EditorField>
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.text`}
                  label="Description"
                  as="div"
                  style={descStyle}
                >
                  {item.text ? (
                    <ThemeEditorRichTextContent html={item.text} />
                  ) : (
                    'Add a description in the sidebar.'
                  )}
                </EditorField>
              </>
            );

            return (
              <div
                key={item.id}
                data-codiic-node={blockNodeId}
                data-codiic-label={item.heading}
                data-codiic-kind="block"
                style={columnStyle}
              >
                {s.link ? (
                  <a
                    href={s.link}
                    target={s.linkOpenInNewTab ? '_blank' : undefined}
                    rel={s.linkOpenInNewTab ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'flex',
                      flexDirection: s.direction === 'horizontal' ? 'row' : 'column',
                      alignItems,
                      gap: s.layoutGap,
                      width: '100%',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
