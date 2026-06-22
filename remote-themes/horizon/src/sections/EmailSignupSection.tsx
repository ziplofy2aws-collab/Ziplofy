import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { readEmailSignupLayout, scopedEmailSignupCss } from '../lib/emailSignupStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function EmailSignupSection({
  sectionId = 'email_signup',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const [email, setEmail] = useState('');

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readEmailSignupLayout(config, settingsBase), [config, settingsBase]);

  const title = cfgString(config, `${settingsBase}.title`);
  const subtitle = cfgString(config, `${settingsBase}.subtitle`);
  const placeholder = cfgString(config, `${settingsBase}.placeholder`);
  const submitLabel = cfgString(config, `${settingsBase}.buttonLabel`);

  const scheme = style.colorScheme;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const inputRadius = 100;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const sectionShell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
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

  const copyColumn: CSSProperties = {
    flex: style.direction === 'horizontal' ? '1 1 280px' : undefined,
    minWidth: 0,
    marginLeft: style.alignment === 'right' && style.direction === 'vertical' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' && style.direction === 'vertical' ? 'auto' : undefined,
    maxWidth: style.direction === 'vertical' ? 520 : undefined,
    width: style.direction === 'vertical' ? '100%' : undefined,
  };

  const formColumn: CSSProperties = {
    flex: style.direction === 'horizontal' ? '1 1 320px' : undefined,
    minWidth: 0,
    width: style.direction === 'vertical' ? '100%' : undefined,
    maxWidth: 420,
    marginLeft:
      style.direction === 'vertical' && style.alignment === 'center'
        ? 'auto'
        : style.direction === 'vertical' && style.alignment === 'right'
          ? 'auto'
          : undefined,
    marginRight:
      style.direction === 'vertical' && style.alignment === 'center'
        ? 'auto'
        : style.direction === 'vertical' && style.alignment === 'left'
          ? 'auto'
          : undefined,
  };

  const integratedShell: CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    overflow: 'hidden',
    border: `1px solid ${scheme.inputBorder}`,
    borderRadius: inputRadius,
    background: scheme.inputBg,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: fontBody,
    fontSize: 15,
    lineHeight: 1.4,
    color: scheme.color,
    padding: '12px 16px',
    boxSizing: 'border-box',
  };

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Email signup" style={sectionShell}>
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
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedEmailSignupCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={{ ...innerFlex, position: 'relative', zIndex: 2 }}>
        {title.trim() || subtitle.trim() ? (
          <div style={copyColumn}>
            {title.trim() ? (
              <EditorField
                fieldPath={`${settingsBase}.title`}
                label="Heading"
                as="h2"
                style={{
                  margin: style.direction === 'horizontal' ? 0 : '0 0 12px',
                  fontFamily: fontHeading,
                  fontSize: 32,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: scheme.color,
                  textAlign,
                }}
              >
                {title}
              </EditorField>
            ) : null}
            {subtitle.trim() ? (
              <EditorField
                fieldPath={`${settingsBase}.subtitle`}
                label="Subtext"
                as="p"
                style={{
                  margin: style.direction === 'horizontal' ? 0 : '0 0 28px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: scheme.muted,
                  textAlign,
                }}
              >
                {subtitle}
              </EditorField>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={formColumn}>
          <EditorField fieldPath={`${settingsBase}.placeholder`} label="Email placeholder" as="span">
            <div style={integratedShell}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
                aria-label={placeholder}
              />
              <button
                type="submit"
                aria-label={submitLabel || placeholder || 'Submit'}
                style={{
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  color: scheme.buttonColor,
                  fontFamily: fontBody,
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 14px',
                  lineHeight: 1,
                }}
              >
                →
              </button>
            </div>
          </EditorField>
        </form>
      </div>
    </EditorSection>
  );
}
