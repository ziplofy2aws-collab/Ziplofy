import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { ThemeEditorRichTextContent } from '../../../../../create-theme/runtime/shared/ThemeEditorRichTextContent';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
} from '../../../../../create-theme/runtime/shared/themeTypographyRuntime';
import { resolveThemePaletteColorSetting } from '../../../../../create-theme/settings/theme-color-palette.settings';
import { IconGlyph } from '../components/IconGlyph';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import {
  alignContentForPosition,
  iconsWithTextMobileStackCss,
  justifyItemsForAlignment,
  readIconWithTextItems,
  readIconsWithTextLayout,
  resolveIconsWithTextBorderCss,
  scopedIconsWithTextCss,
} from '../lib/iconsWithTextStyles';
import { layout } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function IconsWithTextSection({
  sectionId = 'icons_with_text',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readIconsWithTextLayout(config, settingsBase),
    [config, settingsBase]
  );
  const items = useMemo(
    () => readIconWithTextItems(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );
  const fonts = useMemo(() => themeFontsFromConfig(config), [config]);

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
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `codiic-icons-with-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const colCount = Math.max(items.length, style.columns);
  const isHorizontal = style.direction === 'horizontal';
  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `codiic-icons-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

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

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: resolveIconsWithTextBorderCss(
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
    justifyItems: justifyItemsForAlignment(style.layoutAlignment),
    alignContent: alignContentForPosition(style.position),
  };

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems:
      style.layoutAlignment === 'right'
        ? 'flex-end'
        : style.layoutAlignment === 'center'
          ? 'center'
          : 'flex-start',
    gap: 10,
    color: scheme.color,
  };

  const customCss = scopedIconsWithTextCss(sectionId, style.customCss);
  const mobileCss = mobileStackClass ? iconsWithTextMobileStackCss(sectionId) : '';
  const blocksBase = settingsBase.replace(/\.settings$/, '');

  return (
    <EditorSection sectionId={sectionId} label="Icons with text" editorNodeId={editorNodeId} style={shell}>
      {customCss ? <style>{customCss}</style> : null}
      {mobileCss ? <style>{mobileCss}</style> : null}
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
            const groupNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${item.id}`
                : `layout:${sectionId}:block:${item.id}`;
            const iconNodeId = `${groupNodeId}:nested:icon`;

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
                ? scheme.color
                : resolveThemePaletteColorSetting(config, d.color, 1, scheme.color);
            const descBg = d.backgroundEnabled
              ? d.backgroundColor && d.backgroundColor !== 'default'
                ? resolveThemePaletteColorSetting(config, d.backgroundColor, 0, 'rgba(0,0,0,0.04)')
                : 'rgba(0,0,0,0.04)'
              : undefined;
            const textStyle: CSSProperties = {
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

            return (
              <div
                key={item.id}
                data-codiic-node={groupNodeId}
                data-codiic-label={item.heading}
                data-codiic-kind="block"
                style={columnStyle}
              >
                <span
                  data-codiic-node={iconNodeId}
                  data-codiic-label="Icon"
                  data-codiic-kind="field"
                  data-codiic-field={`${blocksBase}.blocks.${item.id}.settings.icon`}
                >
                  <IconGlyph icon={item.icon} style={{ color: 'inherit' }} />
                </span>
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.heading`}
                  label="Text"
                  as="h3"
                  style={headingStyle}
                >
                  <ThemeEditorRichTextContent html={item.heading} />
                </EditorField>
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.text`}
                  label="Text"
                  as="div"
                  style={textStyle}
                >
                  {item.text ? (
                    <ThemeEditorRichTextContent html={item.text} />
                  ) : (
                    'Add a description in the sidebar.'
                  )}
                </EditorField>
              </div>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
