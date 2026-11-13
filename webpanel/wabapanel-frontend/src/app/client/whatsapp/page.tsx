'use client';
import React, { useState, useEffect } from 'react';
import { Wifi, Settings, CheckCircle, Copy, RefreshCw, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  adminContentColumnClass,
  dashboardCardShell,
  dashboardNoticeCompactClass,
  primaryBtn,
  secondaryBtn,
} from '@/components/layout/dashboard-ui';

const dangerBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200/80 bg-white/60 px-3.5 py-2 text-[13px] font-medium text-red-600 backdrop-blur-md transition-colors hover:bg-red-50/80 disabled:cursor-not-allowed disabled:opacity-50';
const cardClass = `${dashboardCardShell} !p-5`;
const metaCell = 'rounded-2xl border border-white/70 bg-white/45 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md';
const metaLabel = 'mb-1 text-[12px] font-medium text-[#6b7a74]';
const metaValue = 'text-[13px] font-semibold text-[#101828]';

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function WhatsAppPage() {
  const { currentWorkspace } = useAuthStore();
  const wa = currentWorkspace?.whatsapp;
  const [method, setMethod] = useState<'embedded' | 'qr' | 'manual'>('embedded');
  const [manualForm, setManualForm] = useState({
    wabaId: wa?.wabaId || '', phoneNumberId: wa?.phoneNumberId || '',
    businessAccountId: wa?.businessAccountId || '', accessToken: wa?.accessToken || '',
  });
  const [saving, setSaving] = useState(false);
  const [extraNumbers, setExtraNumbers] = useState<{ phoneNumberId: string; phoneNumber: string; displayName: string; accessToken?: string; wabaId?: string }[]>(wa?.extraNumbers || []);
  const [newNum, setNewNum] = useState({ phoneNumberId: '', phoneNumber: '', displayName: '', accessToken: '', wabaId: '' });
  const [diffWaba, setDiffWaba] = useState(false);
  const [numSaving, setNumSaving] = useState(false);
  const [payCfg, setPayCfg] = useState((wa as unknown as { paymentConfiguration?: string })?.paymentConfiguration || '');
  const [payCfgSaving, setPayCfgSaving] = useState(false);
  const savePayCfg = async () => {
    if (!currentWorkspace?._id) return;
    setPayCfgSaving(true);
    try {
      await workspaceApi.updateWhatsApp(currentWorkspace._id, { paymentConfiguration: payCfg.trim() });
      toast.success('WhatsApp Pay configuration saved');
    } catch { toast.error('Failed to save'); }
    setPayCfgSaving(false);
  };
  const [refreshing, setRefreshing] = useState(false);
  interface WaHealth {
    tokenValid: boolean;
    phone: { display_phone_number?: string; verified_name?: string; quality_rating?: string; code_verification_status?: string; platform_type?: string; name_status?: string; messaging_limit_tier?: string; status?: string; throughput?: { level?: string } } | null;
    waba: { name?: string; account_review_status?: string; business_verification_status?: string; country?: string; ownership_type?: string } | null;
    errors: string[];
  }
  const [health, setHealth] = useState<WaHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadHealth = async () => {
    if (!currentWorkspace?._id) return;
    setHealthLoading(true);
    try {
      const r = await workspaceApi.getWhatsAppHealth(currentWorkspace._id);
      setHealth(r.data.data);
    } catch { setHealth(null); }
    setHealthLoading(false);
  };

  useEffect(() => {
    if (wa?.isConnected && currentWorkspace?._id) loadHealth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wa?.isConnected, currentWorkspace?._id]);

  const limitLabel = (tier?: string) => {
    if (!tier) return 'Unknown';
    const map: Record<string, string> = {
      TIER_50: '50 / 24hr', TIER_250: '250 / 24hr', TIER_1K: '1,000 / 24hr',
      TIER_10K: '10,000 / 24hr', TIER_100K: '100,000 / 24hr', TIER_UNLIMITED: 'Unlimited',
      TIER_NOT_SET: 'Not set (new number)',
    };
    return map[tier] || tier;
  };

  const handleRefreshDetails = async () => {
    if (!currentWorkspace?._id) return;
    setRefreshing(true);
    try {
      const res = await workspaceApi.refreshWhatsAppDetails(currentWorkspace._id);
      const updatedWs = res.data.data;
      if (updatedWs) {
        useAuthStore.setState({ currentWorkspace: updatedWs });
        toast.success('Details refreshed from Meta');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to refresh — check if your Access Token is still valid');
    }
    setRefreshing(false);
  };

  // Auto-refresh if display name or phone number is missing
  useEffect(() => {
    if (wa?.isConnected && (!wa.displayName || !wa.phoneNumber) && currentWorkspace?._id) {
      handleRefreshDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wa?.isConnected, currentWorkspace?._id]);

  const saveExtraNumbers = async (list: { phoneNumberId: string; phoneNumber: string; displayName: string; accessToken?: string; wabaId?: string }[]) => {
    if (!currentWorkspace?._id) return;
    setNumSaving(true);
    try {
      await workspaceApi.updateWhatsApp(currentWorkspace._id, { extraNumbers: list });
      setExtraNumbers(list);
      toast.success('Numbers updated');
    } catch { toast.error('Failed to save'); }
    setNumSaving(false);
  };

  const addExtraNumber = () => {
    if (!newNum.phoneNumberId.trim()) { toast.error('Phone Number ID required'); return; }
    if (diffWaba && (!newNum.accessToken.trim() || !newNum.wabaId.trim())) {
      toast.error('For a different WABA, Access Token and WABA ID are required'); return;
    }
    const entry = {
      phoneNumberId: newNum.phoneNumberId.trim(),
      phoneNumber: newNum.phoneNumber.trim(),
      displayName: newNum.displayName.trim(),
      accessToken: diffWaba ? newNum.accessToken.trim() : '',
      wabaId: diffWaba ? newNum.wabaId.trim() : '',
    };
    saveExtraNumbers([...extraNumbers, entry]);
    setNewNum({ phoneNumberId: '', phoneNumber: '', displayName: '', accessToken: '', wabaId: '' });
    setDiffWaba(false);
  };

  const [submitting, setSubmitting] = useState(false);
  const [signupConfig, setSignupConfig] = useState<{ enableEmbeddedSignup: boolean; enableManualSignup: boolean; enableCoexistence: boolean; usingOwnMetaApp: boolean; hasOwnMetaApp: boolean; appId: string; configId: string; webhookUrl: string; webhookVerifyToken: string }>({
    enableEmbeddedSignup: false, enableManualSignup: true, enableCoexistence: false, usingOwnMetaApp: false, hasOwnMetaApp: false, appId: '', configId: '', webhookUrl: '', webhookVerifyToken: '',
  });
  const [metaAppForm, setMetaAppForm] = useState({ appId: '', appSecret: '', configId: '' });
  const [metaAppSaving, setMetaAppSaving] = useState(false);
  // Tenant connection record (status lifecycle: connected / pending / disconnected)
  interface WaConnection {
    connectionStatus?: 'connected' | 'pending' | 'disconnected';
    lastError?: string;
    tokenValid?: boolean;
    tokenExpiresAt?: string | null;
    webhookSubscribed?: boolean;
    businessId?: string;
  }
  const [conn, setConn] = useState<WaConnection | null>(null);

  const loadConnection = async () => {
    if (!currentWorkspace?._id) return;
    try {
      const r = await workspaceApi.getWhatsAppConnection(currentWorkspace._id);
      setConn(r.data.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?._id, wa?.isConnected]);

  // Handle the redirect back from the backend OAuth callback
  const { loadUser } = useAuthStore();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get('wa');
    if (!wa) return;
    if (wa === 'connected') {
      toast.success('WhatsApp connected successfully!');
      loadUser().catch(() => {});
      loadConnection();
    } else if (wa === 'error') {
      toast.error(params.get('msg') || 'WhatsApp connection failed');
      loadConnection();
    }
    window.history.replaceState({}, '', window.location.pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSignupConfig = async () => {
    if (!currentWorkspace?._id) return;
    try {
      const r = await workspaceApi.getWhatsAppSignupConfig(currentWorkspace._id);
      const cfg = r.data.data || {};
      setSignupConfig({
        enableEmbeddedSignup: cfg.enableEmbeddedSignup || false,
        enableManualSignup: cfg.enableManualSignup !== false,
        enableCoexistence: cfg.enableCoexistence || false,
        usingOwnMetaApp: cfg.usingOwnMetaApp || false,
        hasOwnMetaApp: cfg.hasOwnMetaApp || false,
        appId: cfg.appId || '',
        configId: cfg.configId || '',
        webhookUrl: cfg.webhookUrl || '',
        webhookVerifyToken: cfg.webhookVerifyToken || '',
      });
      if (cfg.hasOwnMetaApp) {
        setMetaAppForm((f) => ({ ...f, appId: cfg.appId || f.appId, configId: cfg.configId || f.configId }));
      }
      // Embedded stays the default tab — when no app is configured yet it
      // shows the own-Meta-app form, which is how a tenant enables it.
      if (cfg.enableEmbeddedSignup) setMethod('embedded');
    } catch { /* keep defaults */ }
  };

  useEffect(() => {
    loadSignupConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?._id]);

  const saveMetaApp = async () => {
    if (!currentWorkspace?._id || metaAppSaving) return;
    if (!metaAppForm.appId.trim() || !metaAppForm.configId.trim() || (!metaAppForm.appSecret.trim() && !signupConfig.hasOwnMetaApp)) {
      toast.error('App ID, App Secret and Config ID are all required');
      return;
    }
    setMetaAppSaving(true);
    try {
      await workspaceApi.updateWhatsAppMetaApp(currentWorkspace._id, {
        appId: metaAppForm.appId.trim(),
        appSecret: metaAppForm.appSecret.trim(),
        configId: metaAppForm.configId.trim(),
      });
      toast.success('Meta app saved — Embedded signup is now available');
      await loadSignupConfig();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save Meta app');
    }
    setMetaAppSaving(false);
  };

  const handleManualConnect = async () => {
    if (submitting) return;
    if (!currentWorkspace?._id) {
      toast.error('Workspace not loaded. Please refresh the page and try again.');
      return;
    }
    setSaving(true);
    setSubmitting(true);
    try {
      const saveRes = await workspaceApi.updateWhatsApp(currentWorkspace._id, {
        ...manualForm, connectionMethod: 'manual', isConnected: true,
      });
      toast.success('WhatsApp connected successfully!');
      // Update store with new workspace data
      const updatedWs = saveRes.data.data;
      if (updatedWs) {
        useAuthStore.setState({ currentWorkspace: updatedWs });
      }
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!currentWorkspace || !confirm('Disconnect WhatsApp?')) return;
    try {
      await workspaceApi.updateWhatsApp(currentWorkspace._id, { isConnected: false, connectionMethod: '' });
      toast.success('Disconnected');
      window.location.reload();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  // Launch WhatsApp Embedded Signup via full-page OAuth redirect — the backend
  // builds the Facebook URL with all credentials, Meta sends the browser back
  // to our backend callback which completes onboarding, then lands here again.
  // coexistence=true onboards an existing WhatsApp Business App number.
  const launchSignup = async (coexistence: boolean) => {
    if (!currentWorkspace?._id || saving) return;
    setSaving(true);
    try {
      const r = await workspaceApi.getWhatsAppOAuthUrl(currentWorkspace._id, coexistence);
      const url = r.data?.data?.url;
      if (!url) throw new Error('No OAuth URL returned');
      window.location.href = url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Could not start Facebook signup');
      setSaving(false);
    }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">WhatsApp connection</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Connect your WhatsApp Business Account</p>
        </div>
        {wa?.isConnected && (
          <button type="button" className={dangerBtn} disabled={submitting} onClick={handleDisconnect}>
            {submitting ? <Spinner /> : null} Disconnect
          </button>
        )}
      </div>

      {/* Connection status — always visible for every tenant */}
      {(() => {
        const status = conn?.connectionStatus || (wa?.isConnected ? 'connected' : 'disconnected');
        const subtitle = status === 'connected'
          ? [wa?.displayName, wa?.phoneNumber].filter(Boolean).join(' · ') || 'WhatsApp Business Account linked'
          : status === 'pending'
            ? 'Connection needs attention — see below'
            : 'No WhatsApp Business Account linked';
        return (
          <div className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#1f8a4c]" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-admin-text">
                    WhatsApp Business
                    <Badge variant={status === 'connected' ? 'success' : status === 'pending' ? 'warning' : 'danger'}>
                      {status === 'connected' ? 'Connected' : status === 'pending' ? 'Pending' : 'Disconnected'}
                    </Badge>
                  </h3>
                  <p className="text-[12px] text-admin-text-secondary">{subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-admin-text-subdued transition-colors hover:bg-white hover:text-admin-text"
                title="Refresh status"
                onClick={() => { loadConnection(); if (wa?.isConnected) loadHealth(); }}
              >
                <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        );
      })()}

      {conn?.connectionStatus === 'pending' && (
        <div className={dashboardNoticeCompactClass}>
          <p className="text-[13px] text-[#3d4a45]">
            Your WhatsApp connection needs attention{conn.lastError ? ` — ${conn.lastError}` : ''}. Reconnect below or refresh your access token to restore messaging.
          </p>
        </div>
      )}

      {wa?.isConnected ? (
        <>
          <div className={cardClass}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                  <Wifi className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-admin-text">
                    Connected
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </h3>
                  <p className="text-[12px] text-admin-text-secondary">via {wa.connectionMethod || 'Manual'}</p>
                </div>
              </div>
              <button type="button" onClick={handleRefreshDetails} disabled={refreshing} className={secondaryBtn}>
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh details'}
              </button>
            </div>

            {(!wa.displayName || !wa.phoneNumber) && (
              <div className={`mb-4 ${dashboardNoticeCompactClass}`}>
                <p className="text-[13px] text-[#3d4a45]">Display Name / Phone Number not available — your Access Token may have expired. Update your token or click Refresh.</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className={metaCell}>
                <p className={metaLabel}>Display name</p>
                <p className={metaValue}>{wa.displayName || '-'}</p>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Phone number</p>
                <p className={metaValue}>{wa.phoneNumber || '-'}</p>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>WABA ID</p>
                <p className={`${metaValue} font-mono text-[12px]`}>{wa.wabaId || '-'}</p>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Quality rating</p>
                <Badge variant={wa.qualityRating === 'GREEN' ? 'success' : wa.qualityRating === 'YELLOW' ? 'warning' : 'default'}>
                  {wa.qualityRating || 'N/A'}
                </Badge>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Phone number ID</p>
                <div className="flex items-center gap-2">
                  <p className={`${metaValue} font-mono text-[12px]`}>{wa.phoneNumberId || '-'}</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-admin-text-subdued hover:bg-white hover:text-admin-text"
                    onClick={() => { navigator.clipboard.writeText(wa.phoneNumberId || ''); toast.success('Copied'); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Business account ID</p>
                <div className="flex items-center gap-2">
                  <p className={`${metaValue} font-mono text-[12px]`}>{conn?.businessId || wa.businessAccountId || '-'}</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-admin-text-subdued hover:bg-white hover:text-admin-text"
                    onClick={() => { navigator.clipboard.writeText(conn?.businessId || wa.businessAccountId || ''); toast.success('Copied'); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Token expiry</p>
                <p className={metaValue}>
                  {conn?.tokenExpiresAt ? new Date(conn.tokenExpiresAt).toLocaleDateString() : 'Never (system token)'}
                </p>
              </div>
              <div className={metaCell}>
                <p className={metaLabel}>Webhook subscription</p>
                <Badge variant={conn?.webhookSubscribed ? 'success' : 'default'}>
                  {conn?.webhookSubscribed ? 'Subscribed' : 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-1 text-[15px] font-semibold text-admin-text">WhatsApp Pay (in-chat payments)</h3>
            <p className="mb-3 text-[13px] text-admin-text-secondary">
              Let customers pay inside WhatsApp (UPI) without leaving the chat. Create a Payment Configuration in WhatsApp Manager (link Razorpay, PayU or your UPI VPA), then enter its name here. India only.
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="min-w-[220px] flex-1">
                <Input placeholder="Payment configuration name (from WhatsApp Manager)" value={payCfg} onChange={(e) => setPayCfg(e.target.value)} />
              </div>
              <button type="button" className={primaryBtn} disabled={payCfgSaving} onClick={savePayCfg}>
                {payCfgSaving ? <Spinner /> : null} Save
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold text-admin-text">
                <Activity className="h-4 w-4 text-admin-text-secondary" /> API health &amp; limits
              </h3>
              <button type="button" onClick={loadHealth} disabled={healthLoading} className={secondaryBtn}>
                <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
                {healthLoading ? 'Checking...' : 'Check now'}
              </button>
            </div>
            {healthLoading && !health ? (
              <p className="text-[13px] text-admin-text-subdued">Checking with Meta...</p>
            ) : !health ? (
              <p className="text-[13px] text-admin-text-subdued">Click &quot;Check now&quot; to fetch live status from Meta</p>
            ) : (
              <>
                {!health.tokenValid && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <p className="text-[13px] text-red-700">Access Token expired or invalid — messages will fail. Update your token above.</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className={metaCell}>
                    <p className={metaLabel}>Token status</p>
                    <Badge variant={health.tokenValid ? 'success' : 'danger'}>{health.tokenValid ? 'Valid' : 'Invalid / Expired'}</Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Messaging limit</p>
                    <p className={metaValue}>{limitLabel(health.phone?.messaging_limit_tier)}</p>
                    <p className="mt-0.5 text-[10px] text-admin-text-subdued">unique customers / 24hr (marketing)</p>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Quality rating</p>
                    <Badge variant={health.phone?.quality_rating === 'GREEN' ? 'success' : health.phone?.quality_rating === 'YELLOW' ? 'warning' : health.phone?.quality_rating === 'RED' ? 'danger' : 'default'}>
                      {health.phone?.quality_rating || 'N/A'}
                    </Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Phone verification</p>
                    <Badge variant={health.phone?.code_verification_status === 'VERIFIED' ? 'success' : 'warning'}>
                      {health.phone?.code_verification_status || 'N/A'}
                    </Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Display name status</p>
                    <Badge variant={health.phone?.name_status === 'APPROVED' ? 'success' : 'default'}>{health.phone?.name_status || 'N/A'}</Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Number status</p>
                    <Badge variant={health.phone?.status === 'CONNECTED' ? 'success' : 'default'}>{health.phone?.status || 'N/A'}</Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Throughput</p>
                    <p className={metaValue}>{health.phone?.throughput?.level || 'N/A'}</p>
                    <p className="mt-0.5 text-[10px] text-admin-text-subdued">messages per second capacity</p>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>WABA review</p>
                    <Badge variant={health.waba?.account_review_status === 'APPROVED' ? 'success' : 'warning'}>{health.waba?.account_review_status || 'N/A'}</Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={`${metaLabel} flex items-center gap-1`}><ShieldCheck className="h-3 w-3" /> Business verification</p>
                    <Badge variant={health.waba?.business_verification_status === 'verified' ? 'success' : 'default'}>{health.waba?.business_verification_status || 'N/A'}</Badge>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Platform</p>
                    <p className={metaValue}>{health.phone?.platform_type || 'N/A'}</p>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>Country</p>
                    <p className={metaValue}>{health.waba?.country || 'N/A'}</p>
                  </div>
                  <div className={metaCell}>
                    <p className={metaLabel}>WABA name</p>
                    <p className={`${metaValue} truncate`}>{health.waba?.name || 'N/A'}</p>
                  </div>
                </div>
                {health.errors.length > 0 && (
                  <div className={`mt-3 ${dashboardNoticeCompactClass}`}>
                    {health.errors.map((e, i) => <p key={i} className="text-[12px] text-[#3d4a45]">{e}</p>)}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={cardClass}>
            <h3 className="mb-1 text-[15px] font-semibold text-admin-text">Additional numbers</h3>
            <p className="mb-4 text-[13px] text-admin-text-secondary">
              Add unlimited WhatsApp numbers — from the same WABA, or from a different WABA (tick the box and give that number&apos;s own Access Token + WABA ID). Incoming chats on any number land in the same inbox, and replies automatically go from the number the customer messaged.
            </p>
            <div className="mb-4 space-y-2">
              {extraNumbers.length === 0 && <p className="text-[13px] text-admin-text-subdued">No additional numbers yet</p>}
              {extraNumbers.map((n, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-admin-border bg-white p-3">
                  <div>
                    <p className="text-[13px] font-medium text-admin-text">
                      {n.displayName || n.phoneNumber || 'Number ' + (i + 2)}
                      {n.accessToken ? (
                        <span className="ml-2 align-middle rounded-full bg-[#f1f1f1] px-1.5 py-0.5 text-[10px] font-medium text-admin-text ring-1 ring-inset ring-admin-border">Different WABA</span>
                      ) : null}
                    </p>
                    <p className="font-mono text-[12px] text-admin-text-secondary">{n.phoneNumberId}{n.phoneNumber ? ' · ' + n.phoneNumber : ''}</p>
                  </div>
                  <button
                    type="button"
                    disabled={numSaving}
                    onClick={() => saveExtraNumbers(extraNumbers.filter((_, j) => j !== i))}
                    className={dangerBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
              <Input label="Phone Number ID" value={newNum.phoneNumberId} onChange={(e) => setNewNum({ ...newNum, phoneNumberId: e.target.value })} placeholder="From Meta dashboard" />
              <Input label="Phone Number" value={newNum.phoneNumber} onChange={(e) => setNewNum({ ...newNum, phoneNumber: e.target.value })} placeholder="+91..." />
              <Input label="Label (optional)" value={newNum.displayName} onChange={(e) => setNewNum({ ...newNum, displayName: e.target.value })} placeholder="Sales / Support" />
              <div className="flex items-end">
                <button type="button" className={`w-full ${primaryBtn}`} disabled={numSaving} onClick={addExtraNumber}>
                  {numSaving ? <Spinner /> : null} {numSaving ? 'Saving...' : 'Add number'}
                </button>
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] text-admin-text-secondary">
              <input type="checkbox" checked={diffWaba} onChange={(e) => setDiffWaba(e.target.checked)} className="h-4 w-4 accent-admin-text" />
              This number belongs to a different WhatsApp Business Account (different access token)
            </label>
            {diffWaba && (
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input label="Access Token (of that WABA)" value={newNum.accessToken} onChange={(e) => setNewNum({ ...newNum, accessToken: e.target.value })} placeholder="EAAG..." />
                <Input label="WABA ID (of that WABA)" value={newNum.wabaId} onChange={(e) => setNewNum({ ...newNum, wabaId: e.target.value })} placeholder="From Meta dashboard" />
              </div>
            )}
            <p className="mt-3 text-[12px] text-admin-text-subdued">
              Same WABA: just the Phone Number ID is enough — the webhook is already shared. Different WABA: tick the box and provide that number&apos;s own Access Token + WABA ID; the panel auto-subscribes its webhook so its chats also arrive here.
            </p>
          </div>

          <div className={cardClass}>
            <h3 className="mb-1 text-[15px] font-semibold text-admin-text">Webhook configuration</h3>
            <p className="mb-4 text-[13px] text-admin-text-secondary">
              Configure these details in your Meta Developer Portal (App Dashboard → WhatsApp → Configuration) to receive incoming messages.
            </p>
            <div className="max-w-2xl space-y-3">
              <div className="rounded-lg border border-admin-border bg-[#f6f6f7] p-3.5">
                <p className="mb-1 text-[12px] font-medium text-admin-text-secondary">Callback URL</p>
                <div className="flex items-start gap-2">
                  <p className="break-all font-mono text-[13px] font-medium text-admin-text">{signupConfig.webhookUrl || '-'}</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(signupConfig.webhookUrl || ''); toast.success('Copied!'); }}
                    className="shrink-0 rounded-md border border-admin-border bg-white p-1.5 text-admin-text-subdued hover:bg-[#f1f1f1] hover:text-admin-text"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-admin-border bg-[#f6f6f7] p-3.5">
                <p className="mb-1 text-[12px] font-medium text-admin-text-secondary">Verify token</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[13px] font-medium text-admin-text">{signupConfig.webhookVerifyToken || '-'}</p>
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(signupConfig.webhookVerifyToken || ''); toast.success('Copied!'); }}
                    className="shrink-0 rounded-md border border-admin-border bg-white p-1.5 text-admin-text-subdued hover:bg-[#f1f1f1] hover:text-admin-text"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className={dashboardNoticeCompactClass}>
                <p className="text-[12px] text-[#3d4a45]">Subscribe to <strong className="font-semibold text-[#101828]">messages</strong> webhook field in Meta Developer Portal to receive incoming WhatsApp messages.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setMethod('embedded')}
              className={`flex-1 rounded-xl border p-4 text-left transition-colors ${
                method === 'embedded'
                  ? 'border-admin-text bg-[#f1f1f1]'
                  : 'border-admin-border bg-white hover:bg-[#f6f6f7]'
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-admin-text">
                <Settings className="h-4 w-4" /> Embedded signup
              </div>
              <p className="text-[12px] text-admin-text-secondary">Connect via Facebook directly</p>
            </button>
            {signupConfig.enableManualSignup && (
              <button
                type="button"
                onClick={() => setMethod('manual')}
                className={`flex-1 rounded-xl border p-4 text-left transition-colors ${
                  method === 'manual'
                    ? 'border-admin-text bg-[#f1f1f1]'
                    : 'border-admin-border bg-white hover:bg-[#f6f6f7]'
                }`}
              >
                <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-admin-text">
                  <Wifi className="h-4 w-4" /> Manual setup
                </div>
                <p className="text-[12px] text-admin-text-secondary">Enter API credentials manually</p>
              </button>
            )}
          </div>

          {method === 'embedded' && (
            <div className={cardClass}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-admin-text">Embedded signup</h3>
                {signupConfig.usingOwnMetaApp && (
                  <Badge variant="default">Your Meta app</Badge>
                )}
              </div>

              {!signupConfig.enableEmbeddedSignup ? (
                <>
                  <p className="mb-4 text-[13px] text-admin-text-secondary">
                    One-click signup needs a Meta developer app. Enter your own Meta app credentials below — or ask your administrator to configure the platform app.
                  </p>
                  <div className="max-w-lg space-y-4">
                    <Input label="Meta App ID" value={metaAppForm.appId} onChange={(e) => setMetaAppForm({ ...metaAppForm, appId: e.target.value })} placeholder="e.g. 1234567890123456" />
                    <Input label="Meta App Secret" type="password" value={metaAppForm.appSecret} onChange={(e) => setMetaAppForm({ ...metaAppForm, appSecret: e.target.value })} placeholder="From Meta Developer Dashboard" />
                    <Input label="Embedded Signup Config ID" value={metaAppForm.configId} onChange={(e) => setMetaAppForm({ ...metaAppForm, configId: e.target.value })} placeholder="WhatsApp Embedded Signup configuration ID" />
                    <button type="button" className={primaryBtn} disabled={metaAppSaving} onClick={saveMetaApp}>
                      {metaAppSaving ? <Spinner /> : null} Save &amp; enable embedded signup
                    </button>
                    <p className="text-[12px] text-admin-text-subdued">
                      Create an app in the Meta Developer Dashboard, add the WhatsApp product, then copy the Embedded Signup configuration ID. Saved credentials are only used for your own workspace.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4 text-[13px] text-admin-text-secondary">
                    Connect your WhatsApp Business Account through Facebook. Click the button below — a Facebook popup will open where you can authorize access.
                  </p>
                  <button type="button" className={primaryBtn} disabled={saving} onClick={() => launchSignup(false)}>
                    {saving ? <Spinner /> : null} Launch Facebook signup
                  </button>
                  <p className="mt-3 text-[12px] text-admin-text-subdued">
                    A Facebook popup will open. Sign in with your Facebook account that has access to the WhatsApp Business Account you want to connect.
                  </p>

                  {signupConfig.enableCoexistence && (
                    <div className="mt-6 border-t border-admin-border pt-6">
                      <h4 className="mb-1 text-[13px] font-semibold text-admin-text">Already using WhatsApp Business App?</h4>
                      <p className="mb-4 text-[13px] text-admin-text-secondary">
                        Connect a number that is currently running in the WhatsApp Business App. You can keep using it on your phone <strong>and</strong> the panel at the same time — chats stay in sync. No need to delete the number.
                      </p>
                      <button type="button" className={secondaryBtn} disabled={saving} onClick={() => launchSignup(true)}>
                        {saving ? <Spinner /> : null} Connect WhatsApp Business App number
                      </button>
                      <p className="mt-3 text-[12px] text-admin-text-subdued">
                        During signup, choose your existing WhatsApp Business App number and enter the verification code shown in the app.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

              {method === 'manual' && signupConfig.enableManualSignup && (
                <div className={cardClass}>
                  <h3 className="mb-2 text-[15px] font-semibold text-admin-text">Manual configuration</h3>
                  <p className="mb-4 text-[13px] text-admin-text-secondary">Enter your WhatsApp Business API credentials from Meta Business Suite.</p>
                  <div className="max-w-lg space-y-4">
                    <Input label="WABA ID" value={manualForm.wabaId} onChange={(e) => setManualForm({ ...manualForm, wabaId: e.target.value })} placeholder="e.g. 3537291816411935" />
                    <Input label="Phone Number ID" value={manualForm.phoneNumberId} onChange={(e) => setManualForm({ ...manualForm, phoneNumberId: e.target.value })} />
                    <Input label="Business Account ID" value={manualForm.businessAccountId} onChange={(e) => setManualForm({ ...manualForm, businessAccountId: e.target.value })} />
                    <Input label="Access Token" type="password" value={manualForm.accessToken} onChange={(e) => setManualForm({ ...manualForm, accessToken: e.target.value })} />
                    <button type="button" className={primaryBtn} disabled={saving} onClick={handleManualConnect}>
                      {saving ? <Spinner /> : null} Connect WhatsApp
                    </button>
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  );
}
