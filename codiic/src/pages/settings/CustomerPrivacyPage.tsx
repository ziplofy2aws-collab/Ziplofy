import React, { useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  QueueListIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/Modal';
import {
  adminListFooterLinkClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
} from '../../components/admin-list-ui';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const sectionHeaderClass = 'border-b border-admin-divider bg-admin-table-header px-5 py-4 sm:px-6';

const rowInteractive =
  'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-admin-row-hover sm:px-4';
const rowStatic = 'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left sm:px-4';

type LinkRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  automated?: boolean;
  onClick?: () => void;
};

function LinkRow({ icon, title, subtitle, automated, onClick }: LinkRowProps) {
  const iconWrap = (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-secondary text-admin-text-secondary transition-colors group-hover:bg-admin-fill">
      {icon}
    </div>
  );

  const inner = (
    <>
      {iconWrap}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-admin-text">{title}</p>
        <p className="text-[13px] text-admin-text-secondary">{subtitle}</p>
      </div>
      {automated ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-admin-text" aria-hidden />
          <span className="text-[12px] font-medium text-admin-text-secondary">Automated</span>
        </div>
      ) : null}
      {onClick ? (
        <ChevronRightIcon
          className="h-5 w-5 shrink-0 text-admin-text-subdued transition-transform group-hover:translate-x-0.5 group-hover:text-admin-text"
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

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <h2 className="text-[13px] font-semibold text-admin-text">Privacy settings</h2>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Storefront disclosures and automated compliance signals.
            </p>
          </div>
          <div className="divide-y divide-admin-divider p-4 sm:p-5">
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

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-admin-border bg-admin-fill text-admin-text">
                  <ShieldCheckIcon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13px] font-semibold text-admin-text">
                    codiic Network Intelligence
                  </h2>
                  <p className="mt-1 text-[13px] text-admin-text-secondary">
                    Optional data use to improve recommendations and targeting across codiic.
                  </p>
                </div>
              </div>
              {networkIntelligenceEnabled ? (
                <button
                  type="button"
                  onClick={handleOpenDisableModal}
                  className={adminListSecondaryButtonClass}
                >
                  Disable
                </button>
              ) : null}
            </div>
          </div>
          <div className="p-5 sm:p-6">
            {networkIntelligenceEnabled ? (
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-secondary px-3 py-1 text-[12px] font-medium text-admin-text">
                <span className="h-2 w-2 rounded-full bg-admin-text" aria-hidden />
                Enabled
              </div>
            ) : (
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-fill px-3 py-1 text-[12px] font-medium text-admin-text-secondary">
                <span className="h-2 w-2 rounded-full bg-admin-text-subdued" aria-hidden />
                Disabled
              </div>
            )}

            <p className="text-[13px] leading-relaxed text-admin-text-secondary">
              Your customer data is securely used with other codiic data to improve products, ad
              targeting, and personalization for your store as described in the{' '}
              <a href="#" className={`${adminListFooterLinkClass} font-medium`}>
                Additional Services Terms
              </a>
              . No other merchant can see your data.
            </p>
          </div>
        </SettingsPanel>

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[13px] font-semibold text-admin-text">Marketing settings</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                title="Marketing preferences apply at checkout and in customer notifications."
                aria-label="More information about marketing settings"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Connect checkout and notifications to your consent flows.
            </p>
          </div>
          <div className="divide-y divide-admin-divider p-4 sm:p-5">
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

        <SettingsPanel>
          <div className={sectionHeaderClass}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[13px] font-semibold text-admin-text">
                Data storage hosting location
              </h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
                title="Where primary customer and order data is processed for this store."
                aria-label="More information about data hosting"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-admin-text-secondary">
              Shown to customers where relevant for transparency.
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="inline-flex items-center gap-3 rounded-xl border border-admin-border bg-admin-secondary px-4 py-3">
              <span className="text-2xl leading-none" role="img" aria-label="United States">
                🇺🇸
              </span>
              <p className="text-[13px] font-semibold text-admin-text">United States</p>
            </div>
          </div>
        </SettingsPanel>

        <Modal
          open={disableModalOpen}
          onClose={handleCloseDisableModal}
          title="Turn off codiic Network Intelligence"
          maxWidth="sm"
          actions={
            <>
              <button
                type="button"
                onClick={handleCloseDisableModal}
                className={adminListSecondaryButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTurnOffNetworkIntelligence}
                className={adminListPrimaryButtonClass}
              >
                Turn off
              </button>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed text-admin-text-secondary">
            This means your customer data is no longer securely used with other codiic data to
            improve products. This restricts your access or ability to customize all apps and
            features that require this data.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default CustomerPrivacyPage;
