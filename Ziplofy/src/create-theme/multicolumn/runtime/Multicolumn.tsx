import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
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
  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground =
    backgroundColorRaw === '' || backgroundColorRaw === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, backgroundColorRaw, 0, scheme.background);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const scopeClass = `ziplofy-multicolumn-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const colCount = Math.max(items.length, style.columns);
  const isHorizontal = style.direction === 'horizontal';
  const shellClass = `${scopeClass}-shell`;
  const mobileStackClass = isHorizontal
    ? `ziplofy-multicolumn-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
    : '';

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
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
    justifyItems: justifyItemsForAlignment(style.layoutAlignment),
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
            const alignItems =
              s.layoutAlignment === 'left'
                ? 'flex-start'
                : s.layoutAlignment === 'right'
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

            const columnStyle: CSSProperties = {
              display: 'flex',
              flexDirection: s.direction === 'horizontal' ? 'row' : 'column',
              alignItems,
              justifyContent,
              textAlign: s.layoutAlignment,
              gap: s.layoutGap,
              width: colWidth,
              height: colHeight,
              justifySelf:
                s.layoutAlignment === 'left'
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
              border: s.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
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
            const headingPreset = HEADING_PRESETS[h.preset] ?? HEADING_PRESETS.default;
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
              fontSize: headingPreset.fontSize,
              fontWeight: headingPreset.fontWeight,
              lineHeight: headingPreset.lineHeight,
              letterSpacing: '-0.01em',
              width: h.width === 'fill' ? '100%' : 'fit-content',
              maxWidth: headingMaxWidthPx(h.maxWidth),
              textAlign: h.alignment as CSSProperties['textAlign'],
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
              textAlign: d.alignment as CSSProperties['textAlign'],
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
                data-ziplofy-node={blockNodeId}
                data-ziplofy-label={item.heading}
                data-ziplofy-kind="block"
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
