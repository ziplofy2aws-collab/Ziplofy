import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStorefront, useStorefrontAuth, useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { inputStyle, layout, useThemeColors } from '../tokens';

const SEC = 'templates.login.sections.login_main';

export function LoginPage() {
  const config = useThemeConfig();
  const { login, loading } = useStorefrontAuth();
  const { storeFrontMeta } = useStorefront();
  const navigate = useNavigate();
  const { text, primary, fontHeading, fontBody } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const eyebrow = cfgString(config, `${SEC}.settings.eyebrow`, '');
  const title = cfgString(config, `${SEC}.settings.title`);
  const subtitle = cfgString(config, `${SEC}.settings.subtitle`, '');
  const emailPh = cfgString(config, `${SEC}.blocks.form_fields.blocks.email_field.settings.placeholder`);
  const passwordPh = cfgString(config, `${SEC}.blocks.form_fields.blocks.password_field.settings.placeholder`);
  const btnLabel = cfgString(config, `${SEC}.blocks.primary_button.settings.label`);
  const btnLoading = cfgString(config, `${SEC}.blocks.primary_button.settings.loadingLabel`);
  const promptText = cfgString(config, `${SEC}.blocks.footer_link.blocks.signup_prompt.settings.text`);
  const linkLabel = cfgString(config, `${SEC}.blocks.footer_link.blocks.signup_link.settings.label`);
  const linkHref = cfgString(config, `${SEC}.blocks.footer_link.blocks.signup_link.settings.href`);
  const forgotLabel = cfgString(config, `${SEC}.blocks.forgot_password_link.settings.label`);
  const forgotHref = cfgString(config, `${SEC}.blocks.forgot_password_link.settings.href`);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeFrontMeta?.storeId) return;
    await login({ storeId: storeFrontMeta.storeId, email, password });
    navigate('/');
  };

  return (
    <PageShell>
      <EditorSection
        sectionId="login_main"
        label="Login form"
        style={{ padding: `48px ${layout.padX}px 80px`, fontFamily: fontBody, color: text }}
      >
        <div style={{ maxWidth: 440, margin: '0 auto', border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
          {eyebrow ? (
            <EditorField fieldPath={`${SEC}.settings.eyebrow`} label="Eyebrow" as="p" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, margin: '0 0 8px' }}>
              {eyebrow}
            </EditorField>
          ) : null}
          <EditorField fieldPath={`${SEC}.settings.title`} label="Heading" as="h1" style={{ fontFamily: fontHeading, fontSize: 28, marginTop: 0 }}>
            {title}
          </EditorField>
          {subtitle ? (
            <EditorField fieldPath={`${SEC}.settings.subtitle`} label="Subtext" as="p" style={{ lineHeight: 1.6, opacity: 0.85, margin: '12px 0 24px' }}>
              {subtitle}
            </EditorField>
          ) : null}
          <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'grid', gap: 16 }}>
            <EditorBlock nodeId="template:login:login_main:block:form_fields" label="Form fields">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={emailPh} style={inputStyle} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={passwordPh} style={inputStyle} />
            </EditorBlock>
            <EditorBlock nodeId="template:login:login_main:block:forgot_password_link" label="Forgot password">
              <p style={{ margin: 0, textAlign: 'right' }}>
                <Link to={forgotHref} style={{ color: primary, fontSize: 13, fontWeight: 600 }}>
                  <EditorField fieldPath={`${SEC}.blocks.forgot_password_link.settings.label`} label="Link label" as="span">
                    {forgotLabel}
                  </EditorField>
                </Link>
              </p>
            </EditorBlock>
            <EditorBlock nodeId="template:login:login_main:block:primary_button" label="Submit button">
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  background: primary,
                  color: '#fff',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: 8,
                  cursor: loading ? 'wait' : 'pointer',
                  fontWeight: 600,
                  width: '100%',
                }}
              >
                {loading ? btnLoading : btnLabel}
              </button>
            </EditorBlock>
          </form>
          <EditorBlock nodeId="template:login:login_main:block:footer_link" label="Sign up link">
            <p style={{ marginTop: 20, fontSize: 14 }}>
              <EditorField fieldPath={`${SEC}.blocks.footer_link.blocks.signup_prompt.settings.text`} label="Prompt text" as="span">
                {promptText}{' '}
              </EditorField>
              <Link to={linkHref} style={{ color: primary, fontWeight: 600 }}>
                <EditorField fieldPath={`${SEC}.blocks.footer_link.blocks.signup_link.settings.label`} label="Link label" as="span">
                  {linkLabel}
                </EditorField>
              </Link>
            </p>
          </EditorBlock>
        </div>
      </EditorSection>
    </PageShell>
  );
}
