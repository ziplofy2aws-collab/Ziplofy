import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { resolveThemeInputFieldInlineStyle } from '../../runtime/shared/themeInputFieldsRuntime';
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
  readContactFormFormGroup,
  readContactFormHeading,
  readContactFormLayout,
  readContactFormSubmitButton,
  scopedContactFormCss,
} from './contactFormStyles';

export function ContactForm({
  sectionId = 'contact_form',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readContactFormLayout(config, settingsBase), [config, settingsBase]);

  const title = cfgString(config, `${settingsBase}.title`, 'Contact us');
  const namePlaceholder = cfgString(config, `${settingsBase}.namePlaceholder`, 'Name');
  const emailPlaceholder = cfgString(config, `${settingsBase}.emailPlaceholder`, 'Email');
  const phonePlaceholder = cfgString(config, `${settingsBase}.phonePlaceholder`, 'Phone');
  const commentPlaceholder = cfgString(config, `${settingsBase}.commentPlaceholder`, 'Comment');
  const submitLabel = cfgString(config, `${settingsBase}.submitLabel`, 'Submit');

  const scheme = style.colorScheme;
  const sectionBackground =
    style.backgroundColor === '' || style.backgroundColor === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, style.backgroundColor, 0, scheme.background);
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const themeInputStyle = useMemo(() => resolveThemeInputFieldInlineStyle(config), [config]);

  const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    ...themeInputStyle,
    padding: '12px 14px',
    outline: 'none',
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setPhone('');
    setComment('');
  };

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
    alignItems: style.direction === 'horizontal' ? 'center' : undefined,
    justifyContent,
    gap: style.gap,
    textAlign,
  };

  const formGroup = useMemo(
    () => readContactFormFormGroup(config, settingsBase),
    [config, settingsBase]
  );

  const clampPct = (n: number) => Math.min(100, Math.max(1, Number.isFinite(n) ? n : 100));
  const formGroupBg =
    formGroup.backgroundColor && formGroup.backgroundColor !== 'default'
      ? resolveThemePaletteColorSetting(config, formGroup.backgroundColor, 0, 'transparent')
      : undefined;
  const formScopeClass = `ziplofy-contact-form-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const formResponsiveCss =
    formGroup.mobileWidth === 'custom'
      ? `@media (max-width: 749px){.${formScopeClass}{width:${clampPct(formGroup.mobileCustomWidth)}% !important;max-width:100% !important;}}`
      : '';

  const formShell: CSSProperties = {
    width: formGroup.desktopWidth === 'custom' ? `${clampPct(formGroup.desktopCustomWidth)}%` : '100%',
    maxWidth: formGroup.desktopWidth === 'custom' ? '100%' : 520,
    margin: style.alignment === 'center' ? '0 auto' : undefined,
    marginLeft: style.alignment === 'right' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' ? 'auto' : undefined,
    flex: style.direction === 'horizontal' ? '1 1 320px' : undefined,
    background: formGroupBg,
    borderRadius: formGroupBg ? 12 : undefined,
    paddingTop: formGroup.paddingTop || undefined,
    paddingBottom: formGroup.paddingBottom || undefined,
    paddingLeft: formGroup.paddingLeft || undefined,
    paddingRight: formGroup.paddingRight || undefined,
    boxSizing: 'border-box',
  };

  const submitBtn = useMemo(
    () => readContactFormSubmitButton(config, settingsBase),
    [config, settingsBase]
  );
  const submitScopeClass = `ziplofy-contact-submit-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const submitDesktopWidthCss =
    submitBtn.desktopWidth === 'custom' ? `${clampPct(submitBtn.desktopCustomWidth)}%` : 'auto';
  const submitResponsiveCss =
    submitBtn.mobileWidth === 'custom'
      ? `@media (max-width: 749px){.${submitScopeClass}{width:${clampPct(submitBtn.mobileCustomWidth)}% !important;display:block !important;}}`
      : '';
  const submitButtonStyle: CSSProperties = {
    fontFamily: fontBody,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1,
    color: submitBtn.style === 'secondary' ? scheme.buttonBg : scheme.buttonColor,
    background: submitBtn.style === 'secondary' ? 'transparent' : scheme.buttonBg,
    border: submitBtn.style === 'secondary' ? `1px solid ${scheme.buttonBg}` : 'none',
    borderRadius: 9999,
    padding: '14px 28px',
    cursor: 'pointer',
    width: submitDesktopWidthCss,
    display: submitBtn.desktopWidth === 'custom' ? 'block' : 'inline-block',
    textAlign: 'center',
    boxSizing: 'border-box',
  };

  const heading = useMemo(() => readContactFormHeading(config, settingsBase), [config, settingsBase]);
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
    headingTypo = { fontFamily: fontHeading, fontSize: 32, fontWeight: 700, lineHeight: 1.2 };
  } else if (headingNormalizedPreset === 'custom') {
    const weightStyle = resolveThemeFontWeightAndStyle(heading.font);
    const sizePx =
      heading.fontSize && heading.fontSize !== 'default'
        ? Number.parseInt(heading.fontSize, 10)
        : NaN;
    headingTypo = {
      fontFamily: resolveThemeFontFamily(heading.font, fonts),
      fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : 32,
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

  const scopedCss = scopedContactFormCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Contact form"
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
          aria-hidden131
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
        <EditorField fieldPath={`${settingsBase}.title`} label="Text" as="h2" style={headingStyle}>
          <ThemeEditorRichTextContent html={title} />
        </EditorField>

        {formResponsiveCss ? <style>{formResponsiveCss}</style> : null}
        <form onSubmit={onSubmit} className={formScopeClass} style={formShell}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <EditorField fieldPath={`${settingsBase}.namePlaceholder`} label="Name placeholder" as="span">
              <input
                type="text"
                className="ziplofy-theme-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                style={inputStyle}
                aria-label={namePlaceholder}
              />
            </EditorField>
            <EditorField fieldPath={`${settingsBase}.emailPlaceholder`} label="Email placeholder" as="span">
              <input
                type="email"
                className="ziplofy-theme-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={emailPlaceholder}
                style={inputStyle}
                aria-label={emailPlaceholder}
              />
            </EditorField>
          </div>

          <div style={{ marginBottom: 12 }}>
            <EditorField fieldPath={`${settingsBase}.phonePlaceholder`} label="Phone placeholder" as="span">
              <input
                type="tel"
                className="ziplofy-theme-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={phonePlaceholder}
                style={inputStyle}
                aria-label={phonePlaceholder}
              />
            </EditorField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <EditorField
              fieldPath={`${settingsBase}.commentPlaceholder`}
              label="Comment placeholder"
              as="span"
            >
              <textarea
                className="ziplofy-theme-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={commentPlaceholder}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                aria-label={commentPlaceholder}
              />
            </EditorField>
          </div>

          {submitResponsiveCss ? <style>{submitResponsiveCss}</style> : null}
          <EditorField fieldPath={`${settingsBase}.submitLabel`} label="Submit button" as="span">
            <button type="submit" className={submitScopeClass} style={submitButtonStyle}>
              {submitLabel}
            </button>
          </EditorField>
        </form>
      </div>
    </EditorSection>
  );
}
