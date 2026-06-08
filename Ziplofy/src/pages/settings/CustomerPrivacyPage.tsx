import React, { useState } from 'react';
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30';
const btnOutline =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';

const rowInteractive =
  'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-blue-50/50 sm:px-4';
const rowStatic =
  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left sm:px-4';

type LinkRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  automated?: boolean;
  onClick?: () => void;
};

function LinkRow({ icon, title, subtitle, automated, onClick }: LinkRowProps) {
  const iconWrap = (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50 text-slate-700 transition-colors ${
        onClick ? 'group-hover:border-blue-200/80 group-hover:bg-blue-50/60 group-hover:text-blue-800' : ''
      }`}
    >
      {icon}
    </div>
  );

  const inner = (
    <>
      {iconWrap}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      {automated ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          <span className="text-xs font-medium text-slate-600">Automated</span>
        </div>
      ) : null}
      {onClick ? (
        <ChevronRightIcon
          className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowInteractive}>
        {inner}
      </button>
    );
  }

  return <div className={`${rowStatic} text-left`}>{inner}</div>;
}

const CustomerPrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [networkIntelligenceEnabled, setNetworkIntelligenceEnabled] = useState(true);
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  const handleOpenDisableModal = () => {
    setDisableModalOpen(true);
  };

  const handleCloseDisableModal = () => {
    setDisableModalOpen(false);
  };

  const handleTurnOffNetworkIntelligence = () => {
    setNetworkIntelligenceEnabled(false);
    setDisableModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Customer privacy"
          description="Manage privacy policy, cookie banner, data sharing, and marketing consent settings."
          tip="Privacy policy content is edited under Settings → Policies. Checkout marketing preferences are configured in Checkout settings."
        />

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="border-l-4 border-blue-500/75 pl-3">
              <h2 className="text-base font-semibold text-gray-900">Privacy settings</h2>
              <p className="mt-1 text-sm text-gray-500">Storefront disclosures and automated compliance signals.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 p-4 sm:p-5">
            <LinkRow
              icon={<DocumentTextIcon className="h-5 w-5" aria-hidden />}
              title="Privacy policy"
              subtitle="Published on your online store"
              automated
            />
            <LinkRow
              icon={<QueueListIcon className="h-5 w-5" aria-hidden />}
              title="Cookie banner"
              subtitle="Not required for regions you're selling in"
              automated
            />
            <LinkRow
              icon={<ArrowPathIcon className="h-5 w-5" aria-hidden />}
              title="Data sharing opt out page"
              subtitle="Not required for regions you're selling in"
              automated
              onClick={() => navigate('/settings/customer-privacy/dns')}
            />
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50/80 text-blue-700">
                  <ShieldCheckIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 border-l-4 border-blue-500/75 pl-3">
                  <h2 className="text-base font-semibold text-gray-900">Ziplofy Network Intelligence</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Optional data use to improve recommendations and targeting across Ziplofy.
                  </p>
                </div>
              </div>
              {networkIntelligenceEnabled ? (
                <button type="button" onClick={handleOpenDisableModal} className={btnOutline}>
                  Disable
                </button>
              ) : null}
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {networkIntelligenceEnabled ? (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Enabled
              </div>
            ) : (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                Disabled
              </div>
            )}

            <p className="text-sm leading-relaxed text-gray-600">
              Your customer data is securely used with other Ziplofy data to improve products, ad targeting, and
              personalization for your store as described in the{' '}
              <a href="#" className="font-medium text-blue-700 underline-offset-2 hover:underline">
                Additional Services Terms
              </a>
              . No other merchant can see your data.
            </p>
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 border-l-4 border-blue-500/75 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">Marketing settings</h2>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title="Marketing preferences apply at checkout and in customer notifications."
                    aria-label="More information about marketing settings"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Connect checkout and notifications to your consent flows.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100 p-4 sm:p-5">
            <LinkRow
              icon={<EnvelopeIcon className="h-5 w-5" aria-hidden />}
              title="E-mail and SMS marketing in checkout"
              subtitle="Ask your customers for their marketing preferences"
              onClick={() => navigate('/settings/checkout')}
            />
            <LinkRow
              icon={<CheckCircleIcon className="h-5 w-5" aria-hidden />}
              title="Double opt-in for marketing"
              subtitle="Ask your customers to confirm their contact details"
              onClick={() => navigate('/settings/notifications')}
            />
          </div>
        </SettingsPanel>

        <SettingsPanel className="ring-1 ring-slate-200/60">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-4 sm:px-6">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1 border-l-4 border-blue-500/75 pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">Data storage hosting location</h2>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    title="Where primary customer and order data is processed for this store."
                    aria-label="More information about data hosting"
                  >
                    <InformationCircleIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Shown to customers where relevant for transparency.</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3">
              <span className="text-2xl leading-none" role="img" aria-label="United States">
                🇺🇸
              </span>
              <p className="text-sm font-semibold text-gray-900">United States</p>
            </div>
          </div>
        </SettingsPanel>

        <Modal
          open={disableModalOpen}
          onClose={handleCloseDisableModal}
          title="Turn off Ziplofy Network Intelligence"
          maxWidth="sm"
          actions={
            <>
              <button type="button" onClick={handleCloseDisableModal} className={btnGhost}>
                Cancel
              </button>
              <button type="button" onClick={handleTurnOffNetworkIntelligence} className={btnPrimary}>
                Turn off
              </button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-slate-600">
            This means your customer data is no longer securely used with other Ziplofy data to improve products.
            This restricts your access or ability to customize all apps and features that require this data.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default CustomerPrivacyPage;
