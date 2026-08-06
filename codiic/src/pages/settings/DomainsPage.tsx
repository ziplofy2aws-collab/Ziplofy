import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GlobeAltIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';
import { useStore } from '../../contexts/store.context';
import {
  useDomains,
  type DnsInstruction,
  type StoreDomainItem,
} from '../../contexts/domains.context';

const DomainsPage: React.FC = () => {
  const { activeStoreId } = useStore();
  const {
    domains,
    loading,
    error,
    pendingConnect,
    listByStoreId,
    connect,
    verify,
    disconnect,
    clearPendingConnect,
    clearError,
  } = useDomains();

  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [hostnameInput, setHostnameInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!activeStoreId) return;
    listByStoreId(activeStoreId).catch(() => undefined);
  }, [activeStoreId, listByStoreId]);

  const openConnectModal = useCallback(() => {
    setConnectMenuOpen(false);
    setHostnameInput('');
    setFormError(null);
    clearError();
    setConnectModalOpen(true);
  }, [clearError]);

  const handleConnectSubmit = useCallback(async () => {
    if (!activeStoreId) return;
    const host = hostnameInput.trim();
    if (!host) {
      setFormError('Enter a domain (e.g. www.brand.com)');
      return;
    }
    setFormError(null);
    try {
      await connect(activeStoreId, host);
      setConnectModalOpen(false);
      setActionMessage('Add the DNS records below, then click Verify.');
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Could not start domain connection');
    }
  }, [activeStoreId, hostnameInput, connect]);

  const handleVerify = useCallback(
    async (domain: StoreDomainItem) => {
      if (!activeStoreId || domain.type === 'platform') return;
      setVerifyingId(domain.id);
      setActionMessage(null);
      clearError();
      try {
        await verify(activeStoreId, domain.id);
        setActionMessage(`${domain.hostname} is connected.`);
        clearPendingConnect();
      } catch {
        // error surfaced via context
      } finally {
        setVerifyingId(null);
      }
    },
    [activeStoreId, verify, clearError, clearPendingConnect]
  );

  const handleDisconnect = useCallback(
    async (domain: StoreDomainItem) => {
      if (!activeStoreId || domain.type === 'platform') return;
      if (!window.confirm(`Disconnect ${domain.hostname}?`)) return;
      try {
        await disconnect(activeStoreId, domain.id);
        setActionMessage(`${domain.hostname} disconnected.`);
      } catch {
        // error via context
      }
    },
    [activeStoreId, disconnect]
  );

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage('Copied to clipboard');
    } catch {
      setActionMessage('Could not copy');
    }
  }, []);

  const dnsPanelDomain =
    pendingConnect ||
    domains.find((d) => d.type === 'connected' && (d.status === 'pending' || d.status === 'failed'));

  const statusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Domains"
          description="Connect and manage the domains customers use to reach your store."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  ref={menuButtonRef}
                  onClick={() => setConnectMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Connect existing
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {connectMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setConnectMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-sm z-20 overflow-hidden">
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Connect domain
                      </button>
                      <button
                        type="button"
                        disabled
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-400 border-t border-gray-200 cursor-not-allowed"
                        title="Coming soon"
                      >
                        Transfer domain
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 cursor-not-allowed"
              >
                Buy new domain
              </button>
            </div>
          }
        />

        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-start gap-3">
          <InformationCircleIcon className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            Connect a custom domain you already own. Point DNS at your Codiic storefront, then
            verify ownership. Buy and transfer will be available later.
          </p>
        </div>

        {(error || formError || actionMessage) && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              error || formError
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {formError || error || actionMessage}
          </div>
        )}

        {dnsPanelDomain && dnsPanelDomain.dnsInstructions?.length > 0 && (
          <DnsInstructionsPanel
            domain={dnsPanelDomain}
            verifying={verifyingId === dnsPanelDomain.id}
            onVerify={() => handleVerify(dnsPanelDomain)}
            onCopy={copyText}
            onDismiss={clearPendingConnect}
          />
        )}

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/80">
            <div className="flex justify-between items-center">
              <p className="text-xs font-medium text-gray-700">Domain</p>
              <p className="text-xs font-medium text-gray-700">Status</p>
            </div>
          </div>
          <div className="p-2">
            {!activeStoreId && (
              <p className="text-sm text-gray-500 px-2 py-3">Select a store to manage domains.</p>
            )}
            {activeStoreId && loading && domains.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-3">Loading domains…</p>
            )}
            {activeStoreId && !loading && domains.length === 0 && (
              <p className="text-sm text-gray-500 px-2 py-3">No domains found for this store.</p>
            )}
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="flex justify-between items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GlobeAltIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">{domain.hostname}</p>
                    {domain.lastError && domain.status === 'failed' && (
                      <p className="text-xs text-red-600 truncate">{domain.lastError}</p>
                    )}
                  </div>
                  {domain.isPrimary && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 shrink-0">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {domain.type === 'connected' &&
                    (domain.status === 'pending' || domain.status === 'failed') && (
                      <button
                        type="button"
                        disabled={loading || verifyingId === domain.id}
                        onClick={() => handleVerify(domain)}
                        className="text-xs font-medium text-gray-800 underline disabled:opacity-50"
                      >
                        {verifyingId === domain.id ? 'Verifying…' : 'Verify'}
                      </button>
                    )}
                  {domain.type === 'connected' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDisconnect(domain)}
                      className="text-xs font-medium text-gray-500 hover:text-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200">
                    {statusLabel(domain.status === 'active' ? 'connected' : domain.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {connectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConnectModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-xl bg-white border border-gray-200 shadow-lg p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Connect domain</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the hostname you want customers to use (recommended: www.brand.com).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Domain</label>
            <input
              type="text"
              value={hostnameInput}
              onChange={(e) => setHostnameInput(e.target.value)}
              placeholder="www.brand.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConnectSubmit();
              }}
            />
            {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConnectSubmit}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function DnsInstructionsPanel({
  domain,
  verifying,
  onVerify,
  onCopy,
  onDismiss,
}: {
  domain: StoreDomainItem;
  verifying: boolean;
  onVerify: () => void;
  onCopy: (text: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            DNS records for {domain.hostname}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Add these at your domain provider, wait a few minutes for DNS to propagate, then
            verify.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-gray-400 hover:bg-gray-100"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Host / Name</th>
              <th className="px-3 py-2 font-medium">Value</th>
              <th className="px-3 py-2 font-medium w-10" />
            </tr>
          </thead>
          <tbody>
            {domain.dnsInstructions.map((row: DnsInstruction, idx: number) => (
              <tr key={`${row.type}-${idx}`} className="border-t border-gray-200">
                <td className="px-3 py-2 font-medium text-gray-900">{row.type}</td>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">{row.host}</td>
                <td className="px-3 py-2 text-gray-700 font-mono text-xs break-all">{row.value}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onCopy(row.value)}
                    className="p-1 rounded text-gray-500 hover:bg-gray-100"
                    title="Copy value"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={verifying}
          onClick={onVerify}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Verify connection'}
        </button>
      </div>
    </div>
  );
}

export default DomainsPage;
