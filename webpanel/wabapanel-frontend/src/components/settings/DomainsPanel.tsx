'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Globe,
  Info,
  ChevronDown,
  Copy,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStoreStore, selectActiveStore } from '@/stores/storeStore';
import { domainsApi, type StoreDomainItem } from '@/lib/api';
import {
  dashboardCardShell,
  dashboardNoticeCompactClass,
  primaryBtn,
  secondaryBtn,
} from '@/components/layout/dashboard-ui';

const inputCls =
  'w-full rounded-xl border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text outline-none focus:border-[#00896F]';

function statusLabel(status: string) {
  const s = status === 'active' ? 'connected' : status;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DomainsPanel() {
  const activeStore = useStoreStore(selectActiveStore);
  const activeStoreId = activeStore?._id || null;

  const [domains, setDomains] = useState<StoreDomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConnect, setPendingConnect] = useState<StoreDomainItem | null>(null);
  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [hostnameInput, setHostnameInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeStoreId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await domainsApi.list(activeStoreId);
      setDomains(res.data?.data || []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }, [activeStoreId]);

  useEffect(() => {
    setPendingConnect(null);
    load().catch(() => undefined);
  }, [load]);

  const handleConnectSubmit = useCallback(async () => {
    if (!activeStoreId) return;
    const host = hostnameInput.trim();
    if (!host) {
      setFormError('Enter a domain (e.g. www.brand.com)');
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const res = await domainsApi.connect(activeStoreId, host);
      setPendingConnect(res.data?.data || null);
      setConnectModalOpen(false);
      setHostnameInput('');
      setActionMessage('Add the DNS records below, then click Verify.');
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message || 'Could not start domain connection');
    } finally {
      setLoading(false);
    }
  }, [activeStoreId, hostnameInput, load]);

  const handleVerify = useCallback(
    async (domain: StoreDomainItem) => {
      if (!activeStoreId || domain.type === 'platform') return;
      setVerifyingId(domain.id);
      setActionMessage(null);
      setError(null);
      try {
        await domainsApi.verify(activeStoreId, domain.id);
        setPendingConnect(null);
        setActionMessage(`${domain.hostname} is connected.`);
        toast.success('Domain verified and connected');
        await load();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'DNS verification failed');
        await load();
      } finally {
        setVerifyingId(null);
      }
    },
    [activeStoreId, load]
  );

  const handleDisconnect = useCallback(
    async (domain: StoreDomainItem) => {
      if (!activeStoreId || domain.type === 'platform') return;
      if (!window.confirm(`Disconnect ${domain.hostname}?`)) return;
      setLoading(true);
      try {
        await domainsApi.disconnect(activeStoreId, domain.id);
        if (pendingConnect?.id === domain.id) setPendingConnect(null);
        setActionMessage(`${domain.hostname} disconnected.`);
        await load();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Failed to disconnect domain');
      } finally {
        setLoading(false);
      }
    },
    [activeStoreId, load, pendingConnect?.id]
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[14px] font-semibold text-admin-text">
            <Globe className="h-4 w-4" /> Domains
          </h3>
          <p className="mt-0.5 text-[12px] text-admin-text-subdued">
            Connect and manage the domains customers use to reach your store.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setConnectMenuOpen((o) => !o)}
              className={secondaryBtn}
            >
              Connect existing <ChevronDown className="h-4 w-4" />
            </button>
            {connectMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setConnectMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-admin-border bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectMenuOpen(false);
                      setFormError(null);
                      setConnectModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-admin-text hover:bg-[#f6f6f7]"
                  >
                    Connect domain
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="w-full cursor-not-allowed border-t border-admin-border px-4 py-2.5 text-left text-[13px] text-admin-text-subdued"
                  >
                    Transfer domain
                  </button>
                </div>
              </>
            )}
          </div>
          <button type="button" disabled title="Coming soon" className={`${secondaryBtn} opacity-50 cursor-not-allowed`}>
            Buy new domain
          </button>
        </div>
      </div>

      <div className={dashboardNoticeCompactClass}>
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Connect a custom domain you already own. Point DNS at your storefront, then verify
          ownership. Buy and transfer will be available later.
        </p>
      </div>

      {(error || formError || actionMessage) && (
        <div
          className={`rounded-xl border px-3 py-2.5 text-[12px] ${
            error || formError
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {formError || error || actionMessage}
        </div>
      )}

      {dnsPanelDomain && dnsPanelDomain.dnsInstructions?.length > 0 && (
        <div className={dashboardCardShell}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[14px] font-semibold text-admin-text">
                DNS records for {dnsPanelDomain.hostname}
              </h4>
              <p className="mt-1 text-[12px] text-admin-text-subdued">
                Add these at your domain provider, wait a few minutes for DNS to propagate, then
                verify.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPendingConnect(null)}
              className="rounded-lg p-1 text-admin-text-subdued hover:bg-[#f6f6f7]"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f6f6f7] text-[11px] text-admin-text-secondary">
                <tr>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Host / Name</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {dnsPanelDomain.dnsInstructions.map((row, idx) => (
                  <tr key={`${row.type}-${idx}`} className="border-t border-admin-border">
                    <td className="px-3 py-2 font-medium text-admin-text">{row.type}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-admin-text-secondary">{row.host}</td>
                    <td className="px-3 py-2 font-mono text-[11px] break-all text-admin-text-secondary">
                      {row.value}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => copyText(row.value)}
                        className="rounded p-1 text-admin-text-subdued hover:bg-[#f6f6f7]"
                        title="Copy value"
                      >
                        <Copy className="h-3.5 w-3.5" />
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
              disabled={verifyingId === dnsPanelDomain.id}
              onClick={() => handleVerify(dnsPanelDomain)}
              className={primaryBtn}
            >
              {verifyingId === dnsPanelDomain.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                </>
              ) : (
                'Verify connection'
              )}
            </button>
          </div>
        </div>
      )}

      <div className={`${dashboardCardShell} overflow-hidden p-0`}>
        <div className="border-b border-admin-border bg-[#f6f6f7]/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-admin-text-secondary">Domain</p>
            <p className="text-[11px] font-medium text-admin-text-secondary">Status</p>
          </div>
        </div>
        <div className="p-2">
          {!activeStoreId && (
            <p className="px-2 py-3 text-[13px] text-admin-text-subdued">
              Select a store to manage domains.
            </p>
          )}
          {activeStoreId && loading && domains.length === 0 && (
            <p className="px-2 py-3 text-[13px] text-admin-text-subdued">Loading domains…</p>
          )}
          {activeStoreId && !loading && domains.length === 0 && (
            <p className="px-2 py-3 text-[13px] text-admin-text-subdued">
              No domains found for this store.
            </p>
          )}
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#f6f6f7]/80"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-admin-text-subdued" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-admin-text">{domain.hostname}</p>
                  {domain.lastError && domain.status === 'failed' && (
                    <p className="truncate text-[11px] text-red-600">{domain.lastError}</p>
                  )}
                </div>
                {domain.isPrimary && (
                  <span className="shrink-0 rounded-md border border-admin-border bg-[#f6f6f7] px-2.5 py-1 text-[11px] font-medium text-admin-text">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {domain.type === 'connected' &&
                  (domain.status === 'pending' || domain.status === 'failed') && (
                    <button
                      type="button"
                      disabled={loading || verifyingId === domain.id}
                      onClick={() => handleVerify(domain)}
                      className="text-[11px] font-medium text-admin-text underline disabled:opacity-50"
                    >
                      {verifyingId === domain.id ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                {domain.type === 'connected' && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDisconnect(domain)}
                    className="text-[11px] font-medium text-admin-text-subdued hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
                <span className="rounded-md border border-admin-border bg-[#f6f6f7] px-2.5 py-1 text-[11px] font-medium text-admin-text">
                  {statusLabel(domain.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {connectModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConnectModalOpen(false)} />
          <div className="relative z-50 w-full max-w-md rounded-2xl border border-admin-border bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-admin-text">Connect domain</h3>
                <p className="mt-1 text-[12px] text-admin-text-subdued">
                  Enter the hostname you want customers to use (recommended: www.brand.com).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalOpen(false)}
                className="rounded-lg p-1 text-admin-text-subdued hover:bg-[#f6f6f7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mb-1.5 block text-[11px] font-medium text-admin-text-secondary">
              Domain
            </label>
            <input
              type="text"
              value={hostnameInput}
              onChange={(e) => setHostnameInput(e.target.value)}
              placeholder="www.brand.com"
              className={inputCls}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConnectSubmit();
              }}
            />
            {formError && <p className="mt-2 text-[11px] text-red-600">{formError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConnectModalOpen(false)} className={secondaryBtn}>
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConnectSubmit}
                className={primaryBtn}
              >
                {loading ? 'Saving…' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
