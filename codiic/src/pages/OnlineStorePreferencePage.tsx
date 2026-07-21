import {
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  LanguageIcon,
  LockClosedIcon,
  ShoppingBagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ToggleSwitch from '../components/ToggleSwitch';
import { axiosi } from '../config/axios.config';
import { useOnlineStorePreferences } from '../contexts/online-store-preferences.context';
import { useStore } from '../contexts/store.context';
import { StoreSeoSettingsPanel, type StoreSeoValues } from '../seo/StoreSeoSettingsPanel';

function InfoTooltip() {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 text-gray-400 transition-colors hover:text-gray-600"
      aria-label="More information"
    >
      <InformationCircleIcon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function SettingToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  withDivider = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  withDivider?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 ${
        withDivider ? 'border-t border-gray-200' : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-500" aria-hidden />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13px] font-medium text-gray-900">{label}</p>
            <InfoTooltip />
          </div>
          {description ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">{description}</p>
          ) : null}
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

const defaultSeoValues: StoreSeoValues = {
  homePageTitle: '',
  metaDescription: '',
  socialImageUrl: '',
};

type PreferencesFormSnapshot = {
  passwordProtectionEnabled: boolean;
  b2bCustomersOnly: boolean;
  countryRedirectionEnabled: boolean;
  languageRedirectionEnabled: boolean;
  spamContactFormsEnabled: boolean;
  spamAuthPagesEnabled: boolean;
  messageToYourVisitors: string;
  seoHomePageTitle: string;
  seoMetaDescription: string;
  seoSocialImageUrl: string;
  passwordInput: string;
};

function buildSnapshot(values: {
  passwordProtectionEnabled: boolean;
  b2bAccessEnabled: boolean;
  countryRedirectionEnabled: boolean;
  languageRedirectionEnabled: boolean;
  spamContactFormsEnabled: boolean;
  spamAuthPagesEnabled: boolean;
  messageToYourVisitorsInput: string;
  seoValues: StoreSeoValues;
  passwordInput: string;
}): PreferencesFormSnapshot {
  return {
    passwordProtectionEnabled: values.passwordProtectionEnabled,
    b2bCustomersOnly: values.b2bAccessEnabled,
    countryRedirectionEnabled: values.countryRedirectionEnabled,
    languageRedirectionEnabled: values.languageRedirectionEnabled,
    spamContactFormsEnabled: values.spamContactFormsEnabled,
    spamAuthPagesEnabled: values.spamAuthPagesEnabled,
    messageToYourVisitors: values.messageToYourVisitorsInput.trim(),
    seoHomePageTitle: values.seoValues.homePageTitle.trim(),
    seoMetaDescription: values.seoValues.metaDescription.trim(),
    seoSocialImageUrl: values.seoValues.socialImageUrl.trim(),
    passwordInput: values.passwordInput.trim(),
  };
}

function snapshotsEqual(a: PreferencesFormSnapshot, b: PreferencesFormSnapshot): boolean {
  return (
    a.passwordProtectionEnabled === b.passwordProtectionEnabled &&
    a.b2bCustomersOnly === b.b2bCustomersOnly &&
    a.countryRedirectionEnabled === b.countryRedirectionEnabled &&
    a.languageRedirectionEnabled === b.languageRedirectionEnabled &&
    a.spamContactFormsEnabled === b.spamContactFormsEnabled &&
    a.spamAuthPagesEnabled === b.spamAuthPagesEnabled &&
    a.messageToYourVisitors === b.messageToYourVisitors &&
    a.seoHomePageTitle === b.seoHomePageTitle &&
    a.seoMetaDescription === b.seoMetaDescription &&
    a.seoSocialImageUrl === b.seoSocialImageUrl &&
    a.passwordInput === b.passwordInput
  );
}

export default function OnlineStorePreferencePage() {
  const { activeStoreId } = useStore();
  const { preferences, loading, getByStoreId, update } = useOnlineStorePreferences();
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);

  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(false);
  const [b2bAccessEnabled, setB2bAccessEnabled] = useState(false);
  const [countryRedirectionEnabled, setCountryRedirectionEnabled] = useState(true);
  const [languageRedirectionEnabled, setLanguageRedirectionEnabled] = useState(false);
  const [spamContactFormsEnabled, setSpamContactFormsEnabled] = useState(true);
  const [spamAuthPagesEnabled, setSpamAuthPagesEnabled] = useState(true);

  const [passwordInput, setPasswordInput] = useState('');
  const [messageToYourVisitorsInput, setMessageToYourVisitorsInput] = useState('');
  const [seoValues, setSeoValues] = useState<StoreSeoValues>(defaultSeoValues);
  const [savedSnapshot, setSavedSnapshot] = useState<PreferencesFormSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!activeStoreId) {
      setStorefrontUrl(null);
      return;
    }

    let cancelled = false;
    axiosi
      .get<{ success: boolean; data?: { url?: string } }>(`/store-subdomain/store/${activeStoreId}`)
      .then((response) => {
        if (cancelled) return;
        setStorefrontUrl(response.data.data?.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setStorefrontUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activeStoreId]);

  useEffect(() => {
    if (!activeStoreId) {
      setLoaded(false);
      setSavedSnapshot(null);
      return;
    }

    let cancelled = false;
    setLoadingPreferences(true);
    setLoaded(false);
    setSavedSnapshot(null);

    getByStoreId(activeStoreId)
      .then((data) => {
        if (cancelled || !data) return;

        const nextPasswordProtectionEnabled = data.passwordProtectionEnabled;
        const nextB2bAccessEnabled = data.b2bCustomersOnly;
        const nextCountryRedirectionEnabled = data.countryRedirectionEnabled;
        const nextLanguageRedirectionEnabled = data.languageRedirectionEnabled;
        const nextSpamContactFormsEnabled = data.spamContactFormsEnabled;
        const nextSpamAuthPagesEnabled = data.spamAuthPagesEnabled;
        const nextMessage = data.messageToYourVisitors ?? '';
        const nextSeoValues: StoreSeoValues = {
          homePageTitle: data.seoHomePageTitle ?? '',
          metaDescription: data.seoMetaDescription ?? '',
          socialImageUrl: data.seoSocialImageUrl ?? '',
        };

        setPasswordProtectionEnabled(nextPasswordProtectionEnabled);
        setB2bAccessEnabled(nextB2bAccessEnabled);
        setCountryRedirectionEnabled(nextCountryRedirectionEnabled);
        setLanguageRedirectionEnabled(nextLanguageRedirectionEnabled);
        setSpamContactFormsEnabled(nextSpamContactFormsEnabled);
        setSpamAuthPagesEnabled(nextSpamAuthPagesEnabled);
        setPasswordInput('');
        setMessageToYourVisitorsInput(nextMessage);
        setSeoValues(nextSeoValues);

        setSavedSnapshot(
          buildSnapshot({
            passwordProtectionEnabled: nextPasswordProtectionEnabled,
            b2bAccessEnabled: nextB2bAccessEnabled,
            countryRedirectionEnabled: nextCountryRedirectionEnabled,
            languageRedirectionEnabled: nextLanguageRedirectionEnabled,
            spamContactFormsEnabled: nextSpamContactFormsEnabled,
            spamAuthPagesEnabled: nextSpamAuthPagesEnabled,
            messageToYourVisitorsInput: nextMessage,
            seoValues: nextSeoValues,
            passwordInput: '',
          })
        );
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load online store preferences');
      })
      .finally(() => {
        if (!cancelled) setLoadingPreferences(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeStoreId, getByStoreId]);

  const currentSnapshot = useMemo(
    () =>
      buildSnapshot({
        passwordProtectionEnabled,
        b2bAccessEnabled,
        countryRedirectionEnabled,
        languageRedirectionEnabled,
        spamContactFormsEnabled,
        spamAuthPagesEnabled,
        messageToYourVisitorsInput,
        seoValues,
        passwordInput,
      }),
    [
      passwordProtectionEnabled,
      b2bAccessEnabled,
      countryRedirectionEnabled,
      languageRedirectionEnabled,
      spamContactFormsEnabled,
      spamAuthPagesEnabled,
      messageToYourVisitorsInput,
      seoValues,
      passwordInput,
    ]
  );

  const isDirty = useMemo(() => {
    if (!savedSnapshot || !loaded) return false;
    return !snapshotsEqual(currentSnapshot, savedSnapshot);
  }, [currentSnapshot, savedSnapshot, loaded]);

  const handleSave = useCallback(async () => {
    if (!preferences?._id) {
      toast.error('Select a store first');
      return;
    }

    if (passwordProtectionEnabled && !passwordInput.trim() && !preferences.hasStorefrontPassword) {
      toast.error('Enter a storefront password');
      return;
    }

    try {
      setSaving(true);
      await update(preferences._id, {
        passwordProtectionEnabled,
        ...(passwordInput.trim() ? { storefrontPassword: passwordInput.trim() } : {}),
        messageToYourVisitors: messageToYourVisitorsInput.trim(),
        b2bCustomersOnly: b2bAccessEnabled,
        seoHomePageTitle: seoValues.homePageTitle.trim(),
        seoMetaDescription: seoValues.metaDescription.trim(),
        seoSocialImageUrl: seoValues.socialImageUrl.trim(),
        countryRedirectionEnabled,
        languageRedirectionEnabled,
        spamContactFormsEnabled,
        spamAuthPagesEnabled,
      });
      setPasswordInput('');
      setSavedSnapshot(
        buildSnapshot({
          passwordProtectionEnabled,
          b2bAccessEnabled,
          countryRedirectionEnabled,
          languageRedirectionEnabled,
          spamContactFormsEnabled,
          spamAuthPagesEnabled,
          messageToYourVisitorsInput,
          seoValues,
          passwordInput: '',
        })
      );
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }, [
    preferences,
    passwordProtectionEnabled,
    passwordInput,
    messageToYourVisitorsInput,
    b2bAccessEnabled,
    seoValues,
    countryRedirectionEnabled,
    languageRedirectionEnabled,
    spamContactFormsEnabled,
    spamAuthPagesEnabled,
    update,
  ]);

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30';
  const labelClass = 'mb-1.5 block text-[13px] font-medium text-gray-700';
  const hintClass = 'mt-1.5 text-[12px] text-gray-500';
  const saveDisabled =
    !isDirty || saving || loading || loadingPreferences || !loaded || !preferences?._id;

  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="mx-auto max-w-[900px] px-3 py-4 sm:px-4">
        <nav
          className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]"
          aria-label="Breadcrumb"
        >
          <Link
            to="/online-store"
            className="inline-flex items-center text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Online Store"
          >
            <ShoppingBagIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden />
          <span className="truncate font-semibold text-gray-900">Preferences</span>
        </nav>

        <div className="space-y-4 pb-24">
          {/* Store access */}
          <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-[13px] font-semibold text-gray-900">Store access</h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/80">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <LockClosedIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gray-500" aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[13px] font-medium text-gray-900">Password protection</p>
                        <InfoTooltip />
                      </div>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">
                        Restrict access to visitors with the password
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={passwordProtectionEnabled}
                    onChange={setPasswordProtectionEnabled}
                  />
                </div>

                {passwordProtectionEnabled ? (
                  <div className="space-y-4 border-t border-gray-200 px-4 py-4">
                    <div>
                      <label className={labelClass} htmlFor="store-pref-password">
                        Password
                      </label>
                      <input
                        id="store-pref-password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value.slice(0, 100))}
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        placeholder={
                          preferences?.hasStorefrontPassword ? 'Password is set — enter a new one to change' : ''
                        }
                      />
                      <p className={hintClass}>{passwordInput.length} of 100 characters used</p>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="store-pref-visitor-msg">
                        Message to your visitors
                      </label>
                      <textarea
                        id="store-pref-visitor-msg"
                        value={messageToYourVisitorsInput}
                        onChange={(e) =>
                          setMessageToYourVisitorsInput(e.target.value.slice(0, 5000))
                        }
                        className={`${inputClass} resize-none`}
                        rows={3}
                      />
                      <p className={hintClass}>
                        {messageToYourVisitorsInput.length} of 5,000 characters used
                      </p>
                    </div>
                  </div>
                ) : null}

                <SettingToggleRow
                  icon={BriefcaseIcon}
                  label="Restrict access to B2B customers only"
                  description={
                    <>
                      B2B customers will need to log in and verify their account to access your store.{' '}
                      <Link to="/companies" className="font-medium text-blue-600 hover:text-blue-700">
                        Manage companies
                      </Link>
                    </>
                  }
                  checked={b2bAccessEnabled}
                  onChange={setB2bAccessEnabled}
                  withDivider
                />
              </div>
            </div>
          </section>

          {/* Social sharing image and SEO */}
          <StoreSeoSettingsPanel
            storefrontOrigin={storefrontUrl}
            variant="preferences"
            showSaveButton={false}
            seoValues={seoValues}
            onSeoChange={setSeoValues}
          />

          {/* Automatic redirection */}
          <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[13px] font-semibold text-gray-900">Automatic redirection</h2>
                <InfoTooltip />
              </div>
            </div>
            <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200 sm:mx-5">
              <SettingToggleRow
                icon={GlobeAltIcon}
                label="Country/region"
                description="Displays the storefront that matches a visitor's location"
                checked={countryRedirectionEnabled}
                onChange={setCountryRedirectionEnabled}
              />
              <SettingToggleRow
                icon={LanguageIcon}
                label="Language"
                description="Displays the language that matches a visitor's browser, when available"
                checked={languageRedirectionEnabled}
                onChange={setLanguageRedirectionEnabled}
                withDivider
              />
            </div>
          </section>

          {/* Spam protection */}
          <section className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-[13px] font-semibold text-gray-900">Spam protection</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                Enabling hCaptcha can protect your store from spam. Some customers may need to complete the
                hCaptcha task.
              </p>
            </div>
            <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200 sm:mx-5">
              <SettingToggleRow
                icon={ChatBubbleLeftRightIcon}
                label="Enable on contact and comment forms"
                checked={spamContactFormsEnabled}
                onChange={setSpamContactFormsEnabled}
              />
              <SettingToggleRow
                icon={UserIcon}
                label="Enable on login, create account and password recovery pages"
                checked={spamAuthPagesEnabled}
                onChange={setSpamAuthPagesEnabled}
                withDivider
              />
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[900px] justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
              className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
