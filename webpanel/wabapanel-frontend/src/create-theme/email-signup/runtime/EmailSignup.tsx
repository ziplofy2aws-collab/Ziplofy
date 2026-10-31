import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  isThemeEditorPreview,
  useStorefrontNewsletter,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { notifyEmailSignupEditorPreview } from '../../runtime/shared/editorPreviewNotice';
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
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import {
  readEmailSignupHeading,
  readEmailSignupText,
  readEmailSignupForm,
  readEmailSignupLayout,
  scopedEmailSignupCss,
} from './emailSignupStyles';

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10h12M12 6l4 4-4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmailSignup({
  sectionId = 'email_signup',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { submitting, subscribeToNewsletter } = useStorefrontNewsletter();
  const [email, setEmail] = useState('');

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readEmailSignupLayout(config, settingsBase), [config, settingsBase]);

  const title = cfgString(config, `${settingsBase}.title`, 'Subscribe to our emails');
  const subtitle = cfgString(
    config,
    `${settingsBase}.subtitle`,
    'Be the first to know about new collections and special offers.'
  );
  const placeholder = cfgString(config, `${settingsBase}.placeholder`, 'Email address');

  const scheme = style.colorScheme;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const sectionBackground =
    style.backgroundColor && style.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, style.backgroundColor, 0, scheme.background)
      : scheme.background;

  const sectionShell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
    ...(style.minHeight != null ? { minHeight: style.minHeight } : {}),
  };

  const innerFlex: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight:
      style.minHeight != null ? style.minHeight - style.paddingTop - style.paddingBottom : undefined,
    display: 'flex',
    flexDirection: style.direction === 'horizontal' ? 'row' : 'column',
    alignItems:
      style.direction === 'horizontal'
        ? 'center'
        : style.alignment === 'left'
          ? 'flex-start'
          : style.alignment === 'right'
            ? 'flex-end'
            : 'center',
    justifyContent,
    gap: style.gap,
    textAlign,
  };

  const heading = useMemo(() => readEmailSignupHeading(config, settingsBase), [config, settingsBase]);
  const fonts = useMemo(() => themeFontsFromConfig(config), [config]);

  const headingMaxWidthPx = (mode: string) =>
    mode === 'narrow' ? 240 : mode === 'wide' ? 640 : mode === 'none' ? undefined : 480;
  const textTransformFor = (c: string): CSSProperties['textTransform'] =>
    c === 'uppercase'
      ? 'uppercase'
      : c === 'lowercase'
        ? 'lowercase'
        : c === 'capitalize'
          ? 'capitalize'
          : 'none';

  const headingNormalizedPreset = heading.preset === 'body' ? 'paragraph' : heading.preset;
  let headingTypo: CSSProperties;
  if (headingNormalizedPreset === 'default') {
    headingTypo = { fontFamily: fontHeading, fontSize: 36, fontWeight: 700, lineHeight: 1.15 };
  } else if (headingNormalizedPreset === 'custom') {
    const weightStyle = resolveThemeFontWeightAndStyle(heading.font);
    const sizePx =
      heading.fontSize && heading.fontSize !== 'default'
        ? Number.parseInt(heading.fontSize, 10)
        : NaN;
    headingTypo = {
      fontFamily: resolveThemeFontFamily(heading.font, fonts),
      fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : 36,
      fontWeight: weightStyle.fontWeight ?? 700,
      fontStyle: weightStyle.fontStyle,
      lineHeight: lineHeightMultiplier(heading.lineHeight),
      letterSpacing: letterSpacingCss(heading.letterSpacing),
      textTransform: textTransformFor(heading.textCase),
      textWrap:
        heading.wrap === 'balance' ? 'balance' : heading.wrap === 'nowrap' ? 'nowrap' : 'pretty',
    };
  } else {
    const t = resolveThemeTypographyStyle(config, headingNormalizedPreset, fonts);
    headingTypo = {
      fontFamily: t.fontFamily,
      fontSize: `${t.fontSize}px`,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textTransform: t.textTransform,
    };
  }

  const headingColor =
    heading.color === '' || heading.color === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, heading.color, 1, scheme.color);
  const headingBg = heading.backgroundEnabled
    ? heading.backgroundColor && heading.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, heading.backgroundColor, 0, 'rgba(0,0,0,0.04)')
      : 'rgba(0,0,0,0.04)'
    : undefined;

  const headingStyle: CSSProperties = {
    margin: 0,
    flex: style.direction === 'horizontal' ? '0 0 auto' : undefined,
    ...headingTypo,
    width: heading.width === 'fill' ? '100%' : 'fit-content',
    maxWidth: headingMaxWidthPx(heading.maxWidth),
    color: headingColor,
    background: headingBg,
    borderRadius: heading.backgroundEnabled && heading.cornerRadius > 0 ? heading.cornerRadius : undefined,
    paddingTop: heading.paddingTop || undefined,
    paddingBottom: heading.paddingBottom || undefined,
    paddingLeft: heading.paddingLeft || undefined,
    paddingRight: heading.paddingRight || undefined,
    boxSizing: 'border-box',
    textAlign: heading.alignment,
    alignSelf:
      heading.alignment === 'left'
        ? 'flex-start'
        : heading.alignment === 'right'
          ? 'flex-end'
          : 'center',
  };

  const text = useMemo(() => readEmailSignupText(config, settingsBase), [config, settingsBase]);

  const textNormalizedPreset = text.preset === 'body' ? 'paragraph' : text.preset;
  let textTypo: CSSProperties;
  if (textNormalizedPreset === 'default' || textNormalizedPreset === 'paragraph') {
    textTypo = { fontFamily: fontBody, fontSize: 16, fontWeight: 400, lineHeight: 1.5 };
  } else if (textNormalizedPreset === 'custom') {
    const weightStyle = resolveThemeFontWeightAndStyle(text.font);
    const sizePx =
      text.fontSize && text.fontSize !== 'default' ? Number.parseInt(text.fontSize, 10) : NaN;
    textTypo = {
      fontFamily: resolveThemeFontFamily(text.font, fonts),
      fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : 16,
      fontWeight: weightStyle.fontWeight ?? 400,
      fontStyle: weightStyle.fontStyle,
      lineHeight: lineHeightMultiplier(text.lineHeight),
      letterSpacing: letterSpacingCss(text.letterSpacing),
      textTransform: textTransformFor(text.textCase),
      textWrap: text.wrap === 'balance' ? 'balance' : text.wrap === 'nowrap' ? 'nowrap' : 'pretty',
    };
  } else {
    const t = resolveThemeTypographyStyle(config, textNormalizedPreset, fonts);
    textTypo = {
      fontFamily: t.fontFamily,
      fontSize: `${t.fontSize}px`,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textTransform: t.textTransform,
    };
  }

  const textColor =
    text.color === '' || text.color === 'default'
      ? scheme.subtitleColor
      : resolveThemePaletteColorSetting(config, text.color, 1, scheme.subtitleColor);
  const textBg = text.backgroundEnabled
    ? text.backgroundColor && text.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, text.backgroundColor, 0, 'rgba(0,0,0,0.04)')
      : 'rgba(0,0,0,0.04)'
    : undefined;

  const subtitleStyle: CSSProperties = {
    margin: 0,
    ...textTypo,
    width: text.width === 'fill' ? '100%' : 'fit-content',
    maxWidth: text.maxWidth === 'none' ? undefined : (headingMaxWidthPx(text.maxWidth) ?? 520),
    color: textColor,
    background: textBg,
    borderRadius: text.backgroundEnabled && text.cornerRadius > 0 ? text.cornerRadius : undefined,
    paddingTop: text.paddingTop || undefined,
    paddingBottom: text.paddingBottom || undefined,
    paddingLeft: text.paddingLeft || undefined,
    paddingRight: text.paddingRight || undefined,
    boxSizing: 'border-box',
    textAlign: text.alignment,
    alignSelf:
      text.alignment === 'left'
        ? 'flex-start'
        : text.alignment === 'right'
          ? 'flex-end'
          : 'center',
  };

  const form = useMemo(() => readEmailSignupForm(config, settingsBase), [config, settingsBase]);

  const formShell: CSSProperties = {
    width: form.width === 'custom' ? `${Math.min(100, Math.max(10, form.customWidth))}%` : '100%',
    maxWidth: form.width === 'custom' ? undefined : 480,
    marginTop: style.direction === 'vertical' ? 16 : 0,
    marginLeft: style.alignment === 'right' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' ? 'auto' : undefined,
    flex: style.direction === 'horizontal' ? '1 1 320px' : undefined,
    paddingTop: form.paddingTop || undefined,
    paddingBottom: form.paddingBottom || undefined,
    paddingLeft: form.paddingLeft || undefined,
    paddingRight: form.paddingRight || undefined,
    boxSizing: 'border-box',
  };

  const formHeadingColor =
    form.headingColor === '' || form.headingColor === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, form.headingColor, 1, scheme.color);
  const submitLinkColor =
    form.submitLinkColor === '' || form.submitLinkColor === 'default'
      ? scheme.buttonColor
      : resolveThemePaletteColorSetting(config, form.submitLinkColor, 1, scheme.buttonColor);

  const formHeadingTypo: CSSProperties = (() => {
    const preset = form.headingPreset === 'body' ? 'paragraph' : form.headingPreset;
    if (preset === 'default') return { fontFamily: fontHeading, fontWeight: 700, fontSize: 20 };
    const t = resolveThemeTypographyStyle(config, preset, fonts);
    return {
      fontFamily: t.fontFamily,
      fontSize: `${t.fontSize}px`,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textTransform: t.textTransform,
    };
  })();

  const inputWrapperBorder: CSSProperties =
    form.inputBorder === 'none'
      ? { border: 'none', borderRadius: 9999 }
      : form.inputBorder === 'bottom'
        ? { border: 'none', borderBottom: `1px solid ${scheme.inputBorder}`, borderRadius: 0 }
        : { border: `1px solid ${scheme.inputBorder}`, borderRadius: 9999 };

  const showArrow = form.submitDisplay === 'arrow';

  const submitButtonBaseStyle: CSSProperties =
    form.submitStyle === 'link'
      ? {
          background: 'transparent',
          color: submitLinkColor,
          border: 'none',
          textDecoration: 'underline',
          fontFamily: fontBody,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }
      : form.submitStyle === 'secondary'
        ? {
            background: 'transparent',
            color: scheme.color,
            border: `1px solid ${scheme.color}`,
            fontFamily: fontBody,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }
        : {
            background: scheme.color,
            color: scheme.background,
            border: 'none',
            fontFamily: fontBody,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          };

  const renderSubmitContent = () =>
    showArrow ? <ArrowIcon color={form.submitStyle === 'primary' ? scheme.background : submitLinkColor} /> : 'Subscribe';

  const blockSubmitButton = (
    <button
      type="submit"
      disabled={submitting}
      style={{
        ...submitButtonBaseStyle,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 48,
        padding: form.submitStyle === 'link' ? '0 4px' : '0 24px',
        borderRadius: form.submitStyle === 'link' ? 0 : 9999,
        alignSelf: 'stretch',
        opacity: submitting ? 0.75 : undefined,
        cursor: submitting ? 'wait' : submitButtonBaseStyle.cursor,
      }}
    >
      {submitting && !showArrow ? 'Subscribing…' : renderSubmitContent()}
    </button>
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isThemeEditorPreview() || submitting) {
      if (isThemeEditorPreview()) notifyEmailSignupEditorPreview();
      setEmail('');
      return;
    }

    void (async () => {
      try {
        await subscribeToNewsletter({ email });
        setEmail('');
      } catch {
        // Toast handled in context
      }
    })();
  };

  const scopedCss = scopedEmailSignupCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Email signup"
      style={sectionShell}
    >
      {style.backgroundMedia === 'image' && style.backgroundImageUrl ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${style.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && style.backgroundMedia === 'image' ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1,
          }}
        />
      ) : null}
      {scopedCss ? <style>{scopedCss}</style> : null}
      <div style={{ ...innerFlex, position: 'relative', zIndex: 2 }}>
        <EditorField fieldPath={`${settingsBase}.title`} label="Heading" as="h2" style={headingStyle}>
          <ThemeEditorRichTextContent html={title} />
        </EditorField>

        <EditorField
          fieldPath={`${settingsBase}.subtitle`}
          label="Text"
          as="p"
          style={subtitleStyle}
        >
          <ThemeEditorRichTextContent html={subtitle} />
        </EditorField>

        <form onSubmit={onSubmit} style={formShell}>
          {form.headingText ? (
            <EditorField
              fieldPath={`${settingsBase}.signupHeadingText`}
              label="Heading"
              as="div"
              style={{ margin: '0 0 8px', color: formHeadingColor, textAlign, ...formHeadingTypo }}
            >
              <ThemeEditorRichTextContent html={form.headingText} />
            </EditorField>
          ) : null}
          <EditorField
            fieldPath={`${settingsBase}.placeholder`}
            label="Email field"
            as="span"
            style={{ display: 'block' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: form.integratedButton ? 'row' : 'column',
                alignItems: form.integratedButton ? 'center' : 'stretch',
                gap: form.integratedButton ? 0 : 12,
                width: '100%',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: 48,
                  ...inputWrapperBorder,
                  background: scheme.inputBg,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: fontBody,
                    fontSize: 15,
                    lineHeight: 1.4,
                    color: scheme.color,
                    padding: form.inputBorder === 'bottom' ? '0 4px' : '0 16px',
                  }}
                />
                {form.integratedButton ? (
                  showArrow ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      aria-label="Subscribe"
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        marginRight: 4,
                        border: 'none',
                        borderRadius: '50%',
                        background: 'transparent',
                        color: submitLinkColor,
                        cursor: submitting ? 'wait' : 'pointer',
                        opacity: submitting ? 0.75 : 1,
                        padding: 0,
                      }}
                    >
                      <ArrowIcon color={submitLinkColor} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flexShrink: 0,
                        ...submitButtonBaseStyle,
                        height: 40,
                        marginRight: 4,
                        padding: form.submitStyle === 'link' ? '0 12px' : '0 18px',
                        borderRadius: form.submitStyle === 'link' ? 0 : 9999,
                        opacity: submitting ? 0.75 : undefined,
                        cursor: submitting ? 'wait' : submitButtonBaseStyle.cursor,
                      }}
                    >
                      {submitting ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  )
                ) : null}
              </div>
              {!form.integratedButton ? blockSubmitButton : null}
            </div>
          </EditorField>
        </form>
      </div>
    </EditorSection>
  );
}
