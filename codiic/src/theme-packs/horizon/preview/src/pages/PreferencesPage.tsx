import { useEffect, useState, type FormEvent } from 'react';
import { useStorefrontAuth, useThemeConfig, useThemeEditorPreview } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { PREVIEW_STOREFRONT_USER } from '../lib/editorPreviewFixtures';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { PageShell } from '../shell/PageShell';
import { inputStyle, layout, useThemeColors } from '../tokens';

const SEC = 'templates.preferences.sections.preferences_main';

export function PreferencesPage() {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview();
  const { user, checkAuth, updateUser, loading } = useStorefrontAuth();
  const { text, primary, fontHeading, fontBody } = useThemeColors();
  const [language, setLanguage] = useState('en');
  const [agreedToMarketingEmails, setAgreedToMarketingEmails] = useState(false);
  const [agreedToSmsMarketing, setAgreedToSmsMarketing] = useState(false);

  const effectiveUser = user ?? (isEditorPreview ? PREVIEW_STOREFRONT_USER : null);

  const title = cfgString(config, `${SEC}.settings.title`);
  const subtitle = cfgString(config, `${SEC}.settings.subtitle`, '');
  const signedOutMsg = cfgString(config, `${SEC}.blocks.signed_out.settings.message`);
  const emailLabel = cfgString(config, `${SEC}.blocks.marketing_options.blocks.email_marketing.settings.label`);
  const smsLabel = cfgString(config, `${SEC}.blocks.marketing_options.blocks.sms_marketing.settings.label`);
  const languageLabel = cfgString(config, `${SEC}.blocks.marketing_options.blocks.language_field.settings.label`);
  const saveLabel = cfgString(config, `${SEC}.blocks.save_button.settings.label`);
  const savingLabel = cfgString(config, `${SEC}.blocks.save_button.settings.savingLabel`);

  useEffect(() => {
    if (!isEditorPreview) void checkAuth();
  }, [checkAuth, isEditorPreview]);

  useEffect(() => {
    if (!effectiveUser) return;
    setLanguage(effectiveUser.language || 'en');
    setAgreedToMarketingEmails(Boolean(effectiveUser.agreedToMarketingEmails));
    setAgreedToSmsMarketing(Boolean(effectiveUser.agreedToSmsMarketing));
  }, [effectiveUser]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditorPreview || !user?._id) return;
    await updateUser(user._id, { language, agreedToMarketingEmails, agreedToSmsMarketing });
  };

  if (!effectiveUser) {
    return (
      <PageShell>
        <EditorSection sectionId="preferences_main" label="Preferences" style={{ padding: `48px ${layout.padX}px`, fontFamily: fontBody, color: text }}>
          <EditorBlock nodeId="template:preferences:preferences_main:block:signed_out" label="Signed out">
            <EditorField fieldPath={`${SEC}.blocks.signed_out.settings.message`} label="Message" as="p">
              {signedOutMsg}
            </EditorField>
          </EditorBlock>
        </EditorSection>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <EditorSection sectionId="preferences_main" label="Preferences" style={{ padding: `48px ${layout.padX}px 80px`, fontFamily: fontBody, color: text }}>
        <div style={{ maxWidth: 520, margin: '0 auto', border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
          <EditorField fieldPath={`${SEC}.settings.title`} label="Heading" as="h1" style={{ fontFamily: fontHeading, fontSize: 28, marginTop: 0 }}>
            {title}
          </EditorField>
          {subtitle ? (
            <EditorField fieldPath={`${SEC}.settings.subtitle`} label="Subtext" as="p" style={{ lineHeight: 1.6, opacity: 0.85, margin: '12px 0 24px' }}>
              {subtitle}
            </EditorField>
          ) : null}
          <form onSubmit={(e) => void onSave(e)} style={{ display: 'grid', gap: 16 }}>
            <EditorBlock nodeId="template:preferences:preferences_main:block:marketing_options" label="Marketing">
              <label style={{ display: 'grid', gap: 8 }}>
                <EditorField fieldPath={`${SEC}.blocks.marketing_options.blocks.language_field.settings.label`} label="Field label" as="span">
                  {languageLabel}
                </EditorField>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isEditorPreview}
                  style={{ ...inputStyle, cursor: isEditorPreview ? 'default' : 'pointer' }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={agreedToMarketingEmails}
                  onChange={(e) => setAgreedToMarketingEmails(e.target.checked)}
                  disabled={isEditorPreview}
                />
                <EditorField fieldPath={`${SEC}.blocks.marketing_options.blocks.email_marketing.settings.label`} label="Checkbox label" as="span">
                  {emailLabel}
                </EditorField>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={agreedToSmsMarketing}
                  onChange={(e) => setAgreedToSmsMarketing(e.target.checked)}
                  disabled={isEditorPreview}
                />
                <EditorField fieldPath={`${SEC}.blocks.marketing_options.blocks.sms_marketing.settings.label`} label="Checkbox label" as="span">
                  {smsLabel}
                </EditorField>
              </label>
            </EditorBlock>
            <EditorBlock nodeId="template:preferences:preferences_main:block:save_button" label="Save button">
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
