import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { readContactFormLayout, scopedContactFormCss } from '../lib/contactFormStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function ContactFormSection({
  sectionId = 'contact_form',
  templateId = 'index',
  placement = 'template',
}: Props) {
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

  const title = cfgString(config, `${settingsBase}.title`);
  const namePlaceholder = cfgString(config, `${settingsBase}.namePlaceholder`);
  const emailPlaceholder = cfgString(config, `${settingsBase}.emailPlaceholder`);
  const phonePlaceholder = cfgString(config, `${settingsBase}.phonePlaceholder`);
  const commentPlaceholder = cfgString(config, `${settingsBase}.commentPlaceholder`);
  const submitLabel = cfgString(config, `${settingsBase}.submitLabel`);

  const scheme = style.colorScheme;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const inputRadius = Math.max(style.cornerRadius > 0 ? style.cornerRadius : 8, 0);

  const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: fontBody,
    fontSize: 15,
    lineHeight: 1.4,
    color: scheme.color,
    background: scheme.inputBg,
    border: `1px solid ${scheme.inputBorder}`,
    borderRadius: inputRadius,
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
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border:
      style.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
    ...(style.minHeight != null ? { minHeight: style.minHeight } : {}),
  };

  const innerFlex: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight: style.minHeight != null ? style.minHeight - style.paddingTop - style.paddingBottom : undefined,
    display: 'flex',
    flexDirection: style.direction === 'horizontal' ? 'row' : 'column',
    alignItems: style.direction === 'horizontal' ? 'center' : undefined,
    justifyContent,
    gap: style.gap,
    textAlign,
  };

  const formShell: CSSProperties = {
    maxWidth: 520,
    width: '100%',
    margin: style.alignment === 'center' ? '0 auto' : undefined,
    marginLeft: style.alignment === 'right' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' ? 'auto' : undefined,
    flex: style.direction === 'horizontal' ? '1 1 320px' : undefined,
  };

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Contact form" style={sectionShell}>
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
        <style dangerouslySetInnerHTML={{ __html: scopedContactFormCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={{ ...innerFlex, position: 'relative', zIndex: 2 }}>
        <EditorField
          fieldPath={`${settingsBase}.title`}
          label="Heading"
          as="h2"
          style={{
            margin: 0,
            flex: style.direction === 'horizontal' ? '0 0 auto' : undefined,
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

        <form onSubmit={onSubmit} style={formShell}>
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={phonePlaceholder}
                style={inputStyle}
                aria-label={phonePlaceholder}
              />
            </EditorField>
          </div>

          <div style={{ marginBottom: 16 }}>
            <EditorField fieldPath={`${settingsBase}.commentPlaceholder`} label="Comment placeholder" as="span">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={commentPlaceholder}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                aria-label={commentPlaceholder}
              />
            </EditorField>
          </div>

          <EditorField fieldPath={`${settingsBase}.submitLabel`} label="Submit button">
            <button
              type="submit"
              style={{
                fontFamily: fontBody,
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1,
                color: scheme.buttonColor,
                background: scheme.buttonBg,
                border: 'none',
                borderRadius: 9999,
                padding: '14px 28px',
                cursor: 'pointer',
              }}
            >
              {submitLabel}
            </button>
          </EditorField>
        </form>
      </div>
    </EditorSection>
  );
}
