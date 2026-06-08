import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefrontAuth, useThemeConfig, useThemeEditorPreview } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { PREVIEW_STOREFRONT_USER } from '../lib/editorPreviewFixtures';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { inputStyle, layout, useThemeColors } from '../tokens';

const SEC = 'templates.profile.sections.profile_main';

export function ProfilePage() {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview();
  const { user, checkAuth, updateUser, loading } = useStorefrontAuth();
  const navigate = useNavigate();
  const { text, primary, fontHeading, fontBody } = useThemeColors();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const effectiveUser = user ?? (isEditorPreview ? PREVIEW_STOREFRONT_USER : null);

  const title = cfgString(config, `${SEC}.settings.title`);
  const subtitle = cfgString(config, `${SEC}.settings.subtitle`, '');
  const emptyMsg = cfgString(config, `${SEC}.blocks.signed_out.blocks.empty_message.settings.text`);
  const signInLabel = cfgString(config, `${SEC}.blocks.signed_out.blocks.sign_in_button.settings.label`);
  const emailLabel = cfgString(config, `${SEC}.blocks.profile_form.blocks.email_field.settings.label`);
  const emailHelper = cfgString(config, `${SEC}.blocks.profile_form.blocks.email_field.settings.helperText`, '');
  const firstPh = cfgString(config, `${SEC}.blocks.profile_form.blocks.first_name_field.settings.placeholder`);
  const lastPh = cfgString(config, `${SEC}.blocks.profile_form.blocks.last_name_field.settings.placeholder`);
  const phonePh = cfgString(config, `${SEC}.blocks.profile_form.blocks.phone_field.settings.placeholder`);
  const saveLabel = cfgString(config, `${SEC}.blocks.save_button.settings.label`);
  const savingLabel = cfgString(config, `${SEC}.blocks.save_button.settings.savingLabel`);

  useEffect(() => {
    if (!isEditorPreview) void checkAuth();
  }, [checkAuth, isEditorPreview]);

  useEffect(() => {
    if (!effectiveUser) return;
    setFirstName(effectiveUser.firstName || '');
    setLastName(effectiveUser.lastName || '');
    setPhoneNumber(effectiveUser.phoneNumber || '');
  }, [effectiveUser]);

  if (!effectiveUser) {
    return (
      <PageShell>
        <EditorSection sectionId="profile_main" label="Profile" style={{ padding: `48px ${layout.padX}px`, textAlign: 'center', fontFamily: fontBody, color: text }}>
          <EditorBlock nodeId="template:profile:profile_main:block:signed_out" label="Signed out">
            <EditorField fieldPath={`${SEC}.blocks.signed_out.blocks.empty_message.settings.text`} label="Message" as="p">
              {emptyMsg}
            </EditorField>
            <EditorBlock nodeId="template:profile:profile_main:block:signed_out:block:sign_in_button" label="Sign in button">
              <button type="button" onClick={() => navigate('/auth/login')} style={{ marginTop: 16, background: primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
                {signInLabel}
              </button>
            </EditorBlock>
          </EditorBlock>
        </EditorSection>
      </PageShell>
    );
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditorPreview || !user) return;
    await updateUser(user._id, { firstName, lastName, phoneNumber });
  };

  return (
    <PageShell>
      <EditorSection sectionId="profile_main" label="Profile" style={{ padding: `48px ${layout.padX}px 80px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 480, margin: '0 auto', border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
          <EditorField fieldPath={`${SEC}.settings.title`} label="Heading" as="h1" style={{ fontFamily: fontHeading, fontSize: 28, marginTop: 0 }}>
            {title}
          </EditorField>
          {subtitle ? (
            <EditorField fieldPath={`${SEC}.settings.subtitle`} label="Subtext" as="p" style={{ lineHeight: 1.6, opacity: 0.85, margin: '12px 0 24px' }}>
              {subtitle}
            </EditorField>
          ) : null}
          <form onSubmit={(e) => void onSave(e)} style={{ display: 'grid', gap: 16 }}>
            <EditorBlock nodeId="template:profile:profile_main:block:profile_form" label="Profile form">
              <label style={{ display: 'grid', gap: 6 }}>
                <EditorField fieldPath={`${SEC}.blocks.profile_form.blocks.email_field.settings.label`} label="Email label" as="span" style={{ fontSize: 13, fontWeight: 600 }}>
                  {emailLabel}
                </EditorField>
                <input value={effectiveUser.email} readOnly style={{ ...inputStyle, opacity: 0.85 }} />
                {emailHelper ? (
                  <EditorField fieldPath={`${SEC}.blocks.profile_form.blocks.email_field.settings.helperText`} label="Helper" as="span" style={{ fontSize: 12, opacity: 0.7 }}>
                    {emailHelper}
                  </EditorField>
                ) : null}
              </label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={firstPh} readOnly={isEditorPreview} style={inputStyle} />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={lastPh} readOnly={isEditorPreview} style={inputStyle} />
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={phonePh} readOnly={isEditorPreview} style={inputStyle} />
            </EditorBlock>
            <EditorBlock nodeId="template:profile:profile_main:block:save_button" label="Save button">
              <button type="submit" disabled={!isEditorPreview && loading} style={{ background: primary, color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                {!isEditorPreview && loading ? savingLabel : saveLabel}
              </button>
            </EditorBlock>
          </form>
        </div>
      </EditorSection>
    </PageShell>
  );
}
