import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
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
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { scopedTextMarqueeMobileCss } from '../../runtime/shared/responsive';
import {
  readTextMarqueeLayout,
  readTextMarqueeTextSettings,
  scopedTextMarqueeCss,
  textMarqueeKeyframes,
} from './textMarqueeStyles';

const DEFAULT_TEXT = 'We make things that work better and last longer.';
const PHRASE_COPIES = 6;

function MarqueePhrases({
  text,
  gap,
  textPath,
  phraseStyle,
  ariaHidden,
}: {
  text: string;
  gap: number;
  textPath: string;
  phraseStyle?: CSSProperties;
  ariaHidden?: boolean;
}) {
  return (
    <>
      {Array.from({ length: PHRASE_COPIES }, (_, index) => (
        <span
          key={index}
          style={{ flexShrink: 0, paddingRight: gap }}
          aria-hidden={ariaHidden && index > 0 ? true : undefined}
        >
          <span style={phraseStyle}>
            {index === 0 && !ariaHidden ? (
              <EditorField fieldPath={textPath} label="Text">
                {text}
              </EditorField>
            ) : (
              text
            )}
          </span>
        </span>
      ))}
    </>
  );
}

export function TextMarquee({
  sectionId = 'text_marquee_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readTextMarqueeLayout(config, settingsBase), [config, settingsBase]);
  const textSettings = useMemo(
    () => readTextMarqueeTextSettings(config, settingsBase),
    [config, settingsBase]
  );
  const fonts = useMemo(() => themeFontsFromConfig(config), [config]);
  const text = cfgString(config, `${settingsBase}.text`, DEFAULT_TEXT) || DEFAULT_TEXT;
  const scopeClass = `codiic-text-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const textPath = `${settingsBase}.text`;

  const textTransformFor = (c: string): CSSProperties['textTransform'] =>
    c === 'uppercase' ? 'uppercase' : c === 'lowercase' ? 'lowercase' : c === 'capitalize' ? 'capitalize' : undefined;

  const typographyStyle: CSSProperties = useMemo(() => {
    const t = textSettings;
    const normalized = t.preset === 'body' ? 'paragraph' : t.preset;
    if (normalized === 'default') return {};
    if (normalized === 'custom') {
      const weightStyle = resolveThemeFontWeightAndStyle(t.font);
      const sizePx = t.fontSize && t.fontSize !== 'default' ? Number.parseInt(t.fontSize, 10) : NaN;
      return {
        fontFamily: resolveThemeFontFamily(t.font, fonts),
        fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : undefined,
        fontWeight: weightStyle.fontWeight,
        fontStyle: weightStyle.fontStyle,
        lineHeight: lineHeightMultiplier(t.lineHeight),
        letterSpacing: letterSpacingCss(t.letterSpacing),
        textTransform: textTransformFor(t.textCase),
      };
    }
    const r = resolveThemeTypographyStyle(config, normalized, fonts);
    return {
      fontFamily: r.fontFamily,
      fontSize: `${r.fontSize}px`,
      fontWeight: r.fontWeight,
      fontStyle: r.fontStyle,
      lineHeight: r.lineHeight,
      letterSpacing: r.letterSpacing,
      textTransform: r.textTransform,
    };
  }, [textSettings, fonts, config]);

  const textColor =
    textSettings.color === '' || textSettings.color === 'default'
      ? undefined
      : resolveThemePaletteColorSetting(config, textSettings.color, 1, style.scheme.color);

  const phraseBackground = textSettings.backgroundEnabled
    ? textSettings.backgroundColor && textSettings.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, textSettings.backgroundColor, 0, 'rgba(0,0,0,0.04)')
      : 'rgba(0,0,0,0.04)'
    : undefined;

  const phraseStyle: CSSProperties = {
    display: 'inline-block',
    paddingTop: textSettings.paddingTop || undefined,
    paddingBottom: textSettings.paddingBottom || undefined,
    paddingLeft: textSettings.paddingLeft || undefined,
    paddingRight: textSettings.paddingRight || undefined,
    background: phraseBackground,
    borderRadius:
      textSettings.backgroundEnabled && textSettings.cornerRadius > 0
        ? textSettings.cornerRadius
        : undefined,
  };

  const sectionBackground =
    style.backgroundColor && style.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, style.backgroundColor, 0, style.scheme.background)
      : style.scheme.background;

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: style.scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: layout.padX,
    paddingRight: layout.padX,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const track: CSSProperties = {
    display: 'flex',
    width: 'max-content',
    gap: style.layoutGap,
    fontFamily: fontBody,
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    color: style.scheme.color,
    ...typographyStyle,
    ...(textColor ? { color: textColor } : null),
  };

  const viewport: CSSProperties = {
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    minHeight: 32,
  };

  const customCss = scopedTextMarqueeCss(sectionId, style.customCss);
  const keyframes = textMarqueeKeyframes(scopeClass, style.motionDirection);
  const responsiveCss = scopedTextMarqueeMobileCss(scopeClass);

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Marquee">
      <section className={scopeClass} style={shell} data-section-type="text-marquee">
        <style>
          {keyframes}
          {responsiveCss}
          {customCss ? customCss : ''}
        </style>
        <div className={`${scopeClass}__viewport`} style={viewport}>
          <div className={`${scopeClass}__track`} style={track}>
            <MarqueePhrases
              text={text}
              gap={style.layoutGap}
              textPath={textPath}
              phraseStyle={phraseStyle}
            />
            <MarqueePhrases
              text={text}
              gap={style.layoutGap}
              textPath={textPath}
              phraseStyle={phraseStyle}
              ariaHidden
            />
          </div>
        </div>
      </section>
    </EditorSection>
  );
}
