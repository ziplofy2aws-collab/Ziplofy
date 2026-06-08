import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { inputStyle, layout, useThemeColors } from '../tokens';

const SEC = 'templates.forgot_password.sections.forgot_main';

export function ForgotPasswordPage() {
  const config = useThemeConfig();
  const { text, primary, fontHeading, fontBody } = useThemeColors();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const eyebrow = cfgString(config, `${SEC}.settings.eyebrow`, '');
  const title = cfgString(config, `${SEC}.settings.title`);
  const subtitle = cfgString(config, `${SEC}.settings.subtitle`, '');
  const emailPh = cfgString(config, `${SEC}.blocks.form_fields.blocks.email_field.settings.placeholder`);
  const submitLabel = cfgString(config, `${SEC}.blocks.primary_button.settings.label`);
  const successText = cfgString(config, `${SEC}.blocks.success_message.settings.text`);
  const backLabel = cfgString(config, `${SEC}.blocks.footer_link.blocks.back_link.settings.label`);
  const backHref = cfgString(config, `${SEC}.blocks.footer_link.blocks.back_link.settings.href`);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <PageShell>
      <EditorSection sectionId="forgot_main" label="Reset password" style={{ padding: `48px ${layout.padX}px 80px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 440, margin: '0 auto', border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
          {eyebrow ? (
            <EditorField fieldPath={`${SEC}.settings.eyebrow`} label="Eyebrow" as="p" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px' }}>
              {eyebrow}
            </EditorField>
          ) : null}
          <EditorField fieldPath={`${SEC}.settings.title`} label="Heading" as="h1" style={{ fontFamily: fontHeading, fontSize: 28, marginTop: 0 }}>
            {title}
          </EditorField>
          <EditorField fieldPath={`${SEC}.settings.subtitle`} label="Instructions" as="p" style={{ lineHeight: 1.6, opacity: 0.85, margin: '12px 0 24px' }}>
            {subtitle}
          </EditorField>
          {sent ? (
            <EditorBlock nodeId="template:forgot_password:forgot_main:block:success_message" label="Success message">
              <EditorField fieldPath={`${SEC}.blocks.success_message.settings.text`} label="Confirmation text" as="p" style={{ marginTop: 16, fontSize: 14, color: primary }}>
                {successText}
              </EditorField>
            </EditorBlock>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <EditorBlock nodeId="template:forgot_password:forgot_main:block:form_fields" label="Form fields">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={emailPh} style={inputStyle} />
              </EditorBlock>
              <EditorBlock nodeId="template:forgot_password:forgot_main:block:primary_button" label="Submit button">
                <button type="submit" style={{ background: primary, color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                  {submitLabel}
                </button>
              </EditorBlock>
            </form>
          )}
          <EditorBlock nodeId="template:forgot_password:forgot_main:block:footer_link" label="Back to login">
            <p style={{ marginTop: 20, fontSize: 14 }}>
              <Link to={backHref} style={{ color: primary, fontWeight: 600 }}>
                <EditorField fieldPath={`${SEC}.blocks.footer_link.blocks.back_link.settings.label`} label="Link label" as="span">
                  {backLabel}
                </EditorField>
              </Link>
            </p>
          </EditorBlock>
        </div>
      </EditorSection>
    </PageShell>
  );
}
