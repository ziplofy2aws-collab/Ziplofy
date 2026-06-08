import {
  ArrowLeftIcon,
  CommandLineIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

type Tab = 'All' | 'Active' | 'Expired';

function PreferenceSection({
  icon: Icon,
  iconWrapClass,
  iconClass,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  iconWrapClass: string;
  iconClass: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}
          >
            <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50/20 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-50/40">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={false}
        className="relative h-7 w-12 shrink-0 rounded-full bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform" />
      </button>
    </div>
  );
}

export default function OnlineStorePreferencePage() {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [messageToYourVisitorsInput, setMessageToYourVisitorsInput] = useState<string>('');
  const [homePageTitleInput, setHomePageTitleInput] = useState<string>('');
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('All');

  const [createNewSignatureModalOpen, setCreateNewSignatureModalOpen] = useState<boolean>(false);

  const [signatureInput, setSignatureInput] = useState<string>('');
  const [domainInput, setDomainInput] = useState<string>('');
  const [expiresInInput, setExpiresInInput] = useState<string>('');

  const handleChangePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
  }, []);

  const handleMessageToYourVisitorsInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageToYourVisitorsInput(e.target.value);
  }, []);

  const handleHomePageTitleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHomePageTitleInput(e.target.value);
  }, []);

  const handleMetaDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetaDescription(e.target.value);
  }, []);

  const handleChangeActiveTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleToggleNewSignatureModal = useCallback(() => {
    setCreateNewSignatureModalOpen((prev) => !prev);
  }, []);

  const handleSignatureInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureInput(e.target.value);
  }, []);

  const handleDomainInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDomainInput(e.target.value);
  }, []);

  const handleExpiresInInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiresInInput(e.target.value);
  }, []);

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
  const hintClass = 'mt-1.5 text-xs text-gray-500';

  return (
    <div className="w-full space-y-6 pb-8">
      <Link
        to="/online-store"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
        Back to Online Store
      </Link>

      <header className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-blue-50/20 px-5 py-5 shadow-sm sm:px-6">
        <div className="min-w-0 pl-3 border-l-4 border-blue-500/70">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Store preferences</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control storefront access, SEO metadata, redirects, spam protection, and crawler signing.
          </p>
        </div>
        <div className="mt-4 hidden rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-2.5 sm:block">
          <p className="text-xs leading-relaxed text-blue-950/80">
            <span className="font-semibold text-blue-950">Tip:</span> set a clear home page title and meta
            description — they often appear in search results and when your link is shared.
          </p>
        </div>
      </header>

      <PreferenceSection
        icon={LockClosedIcon}
        iconWrapClass="bg-amber-50"
        iconClass="text-amber-600"
        title="Store access"
        description="Password protection and the message visitors see before entering your storefront."
      >
        <div className="mb-5 rounded-xl border border-amber-100/80 bg-amber-50/40 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">Password protection</p>
          <p className="mt-0.5 text-xs text-amber-900/80">
            Restrict browsing to visitors who know the password. To open the store publicly, remove the password
            after your plan allows it.
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass} htmlFor="store-pref-password">
              Password
            </label>
            <input
              id="store-pref-password"
              value={passwordInput}
              onChange={handleChangePassword}
              className={inputClass}
              type="password"
              placeholder="Enter store password"
              autoComplete="new-password"
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
              onChange={handleMessageToYourVisitorsInputChange}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="e.g. We're launching soon! Enter the password to preview."
            />
            <p className={hintClass}>{messageToYourVisitorsInput.length} of 5,000 characters used</p>
          </div>
        </div>
      </PreferenceSection>

      <PreferenceSection
        icon={PhotoIcon}
        iconWrapClass="bg-blue-50"
        iconClass="text-blue-600"
        title="Social sharing and SEO"
        description="Default image for link previews, plus the home page title and meta description for search."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <PhotoIcon className="h-6 w-6 text-gray-400" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-gray-900">Social sharing image</p>
            <p className="mt-0.5 text-xs text-gray-500">Recommended 1200 × 628 px</p>
            <button
              type="button"
              className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Upload image
            </button>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClass} htmlFor="store-pref-home-title">
                Home page title
              </label>
              <input
                id="store-pref-home-title"
                className={inputClass}
                value={homePageTitleInput}
                onChange={handleHomePageTitleInputChange}
                type="text"
                placeholder="e.g. My Store — Quality products"
              />
              <p className={hintClass}>{homePageTitleInput.length} of 70 characters used</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="store-pref-meta">
                Meta description
              </label>
              <textarea
                id="store-pref-meta"
                className={`${inputClass} resize-none`}
                rows={3}
                value={metaDescription}
                onChange={handleMetaDescriptionChange}
                placeholder="Brief description for search engines"
              />
              <p className={hintClass}>{metaDescription.length} of 320 characters used</p>
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 font-mono text-xs text-gray-500">
          Preview URL: <span className="text-gray-600">your-store</span>
          .myziplofy.com
        </p>
      </PreferenceSection>

      <PreferenceSection
        icon={GlobeAltIcon}
        iconWrapClass="bg-indigo-50"
        iconClass="text-indigo-600"
        title="Automatic redirection"
        description="Optional behavior based on where visitors are or which language their browser prefers."
      >
        <div className="space-y-3">
          <ToggleRow
            label="Country / region"
            description="Show a storefront that matches the visitor's location when possible."
          />
          <ToggleRow
            label="Language"
            description="Use the visitor's browser language when a matching translation is available."
          />
        </div>
      </PreferenceSection>

      <PreferenceSection
        icon={ShieldCheckIcon}
        iconWrapClass="bg-emerald-50"
        iconClass="text-emerald-600"
        title="Spam protection"
        description="hCaptcha can reduce spam; some customers may need to complete a challenge on certain forms."
      >
        <div className="space-y-3">
          <ToggleRow label="Enable on contact and comment forms" />
          <ToggleRow label="Enable on login, account creation, and password recovery" />
        </div>
      </PreferenceSection>

      <PreferenceSection
        icon={CommandLineIcon}
        iconWrapClass="bg-slate-100"
        iconClass="text-slate-700"
        title="Crawler access"
        description="Create signatures so trusted tools can crawl your store with the right headers."
      >
        <p className="mb-4 text-sm leading-relaxed text-gray-600">
          Copy Signature, Signature-Input, and Signature-Agent values from an active record and add them to your
          HTTP crawler requests.
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-gray-100 bg-gray-50/90 p-1.5">
            {(['All', 'Active', 'Expired'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleChangeActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 bg-gray-50/30 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-gray-900">Manage crawler access</p>
            <p className="max-w-sm text-xs leading-relaxed text-gray-500">
              Create signatures that authorize external crawlers to access your storefront safely.
            </p>
            <button
              type="button"
              onClick={handleToggleNewSignatureModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Create signature
            </button>
          </div>
        </div>
      </PreferenceSection>

      <Modal
        open={createNewSignatureModalOpen}
        onClose={handleToggleNewSignatureModal}
        title="Create new signature"
        maxWidth="md"
        actions={
          <>
            <button
              type="button"
              onClick={handleToggleNewSignatureModal}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Create signature
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-500">
            These details can&apos;t be changed after the signature is created.
          </p>
          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClass} htmlFor="sig-name">
                Signature name
              </label>
              <input
                id="sig-name"
                value={signatureInput}
                onChange={handleSignatureInputChange}
                type="text"
                className={inputClass}
                placeholder="e.g. My crawler"
              />
              <p className={hintClass}>{signatureInput.length} of 100 characters used</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="sig-domain">
                Domain
              </label>
              <input
                id="sig-domain"
                value={domainInput}
                onChange={handleDomainInputChange}
                type="text"
                className={inputClass}
                placeholder="e.g. example.com"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sig-expires">
                Expires in
              </label>
              <input
                id="sig-expires"
                value={expiresInInput}
                onChange={handleExpiresInInputChange}
                type="text"
                className={inputClass}
                placeholder="e.g. 30 days"
              />
              <p className={hintClass}>Example: expires on a fixed date after creation (set in backend).</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
