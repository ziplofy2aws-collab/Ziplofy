import { useEffect, useState, type FormEvent } from 'react';
import {
  useCustomerAddresses,
  useStorefrontAuth,
  useStorefrontCountries,
  useThemeConfig,
  useThemeEditorPreview,
  type CreateCustomerAddressRequest,
} from '@render-store/sdk';
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
  const {
    addresses,
    fetchCustomerAddressesByCustomerId,
    addCustomerAddress,
    deleteCustomerAddress,
    loading: addressesLoading,
  } = useCustomerAddresses();
  const { countries, getCountries } = useStorefrontCountries();
  const { text, primary, fontHeading, fontBody } = useThemeColors();
  const [language, setLanguage] = useState('en');
  const [agreedToMarketingEmails, setAgreedToMarketingEmails] = useState(false);
  const [agreedToSmsMarketing, setAgreedToSmsMarketing] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    countryId: '',
    pinCode: '',
    phoneNumber: '',
  });

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

  useEffect(() => {
    if (isEditorPreview || !user?._id) return;
    void fetchCustomerAddressesByCustomerId(user._id);
  }, [fetchCustomerAddressesByCustomerId, isEditorPreview, user?._id]);

  useEffect(() => {
    if (isEditorPreview) return;
    void getCountries({ page: 1, limit: 250 });
  }, [getCountries, isEditorPreview]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditorPreview || !user?._id) return;
    await updateUser(user._id, { language, agreedToMarketingEmails, agreedToSmsMarketing });
  };

  const onAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditorPreview || !user?._id) return;
    const payload: CreateCustomerAddressRequest = {
      customerId: user._id,
      countryId: addressDraft.countryId,
      firstName: addressDraft.firstName,
      lastName: addressDraft.lastName,
      address: addressDraft.address,
      city: addressDraft.city,
      state: addressDraft.state,
      pinCode: addressDraft.pinCode,
      phoneNumber: addressDraft.phoneNumber,
    };
    await addCustomerAddress(payload);
    setAddressDraft({
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      countryId: '',
      pinCode: '',
      phoneNumber: '',
    });
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
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 24 }}>
          <div style={{ border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
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
                    style={{ ...inputStyle, fontFamily: fontBody }}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </label>
                <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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

          <div style={{ border: `1px solid ${layout.line}`, borderRadius: 12, padding: 40 }}>
            <h2 style={{ fontFamily: fontHeading, fontSize: 22, marginTop: 0 }}>Addresses</h2>
            {addressesLoading ? <p style={{ opacity: 0.7 }}>Loading addresses…</p> : null}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'grid', gap: 12 }}>
              {(addresses ?? []).map((address) => {
                const countryName =
                  typeof address.countryId === 'object' && address.countryId
                    ? address.countryId.name
                    : '';
                return (
                  <li key={address._id} style={{ border: `1px solid ${layout.line}`, borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <strong>
                          {address.firstName} {address.lastName}
                        </strong>
                        <p style={{ margin: '6px 0 0', opacity: 0.85 }}>
                          {[address.address, address.city, address.state, countryName, address.pinCode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      {!isEditorPreview ? (
                        <button
                          type="button"
                          onClick={() => void deleteCustomerAddress(address._id)}
                          style={{ background: 'none', border: 'none', color: primary, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            <form onSubmit={(e) => void onAddAddress(e)} style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  placeholder="First name"
                  value={addressDraft.firstName}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, firstName: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                />
                <input
                  placeholder="Last name"
                  value={addressDraft.lastName}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, lastName: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                />
              </div>
              <input
                placeholder="Address"
                value={addressDraft.address}
                onChange={(e) => setAddressDraft((p) => ({ ...p, address: e.target.value }))}
                style={{ ...inputStyle, fontFamily: fontBody }}
                required
                disabled={isEditorPreview}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  placeholder="City"
                  value={addressDraft.city}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, city: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                />
                <input
                  placeholder="State"
                  value={addressDraft.state}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, state: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select
                  value={addressDraft.countryId}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, countryId: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                >
                  <option value="">Select country</option>
                  {(countries ?? []).map((country) => (
                    <option key={country._id} value={country._id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="PIN code"
                  value={addressDraft.pinCode}
                  onChange={(e) => setAddressDraft((p) => ({ ...p, pinCode: e.target.value }))}
                  style={{ ...inputStyle, fontFamily: fontBody }}
                  required
                  disabled={isEditorPreview}
                />
              </div>
              <input
                placeholder="Phone"
                value={addressDraft.phoneNumber}
                onChange={(e) => setAddressDraft((p) => ({ ...p, phoneNumber: e.target.value }))}
                style={{ ...inputStyle, fontFamily: fontBody }}
                required
                disabled={isEditorPreview}
              />
              <button
                type="submit"
                disabled={isEditorPreview}
                style={{
                  background: primary,
                  color: '#fff',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: 8,
                  cursor: isEditorPreview ? 'default' : 'pointer',
                  fontWeight: 600,
                }}
              >
                Add address
              </button>
            </form>
          </div>
        </div>
      </EditorSection>
    </PageShell>
  );
}
