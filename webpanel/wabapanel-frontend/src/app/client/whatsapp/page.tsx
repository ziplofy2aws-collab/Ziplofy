'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Settings, CheckCircle, Copy, RefreshCw, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const dangerBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';
const cardClass = `${dashboardCardShell} !p-5`;
const metaCell = 'rounded-lg border border-admin-border bg-[#f6f6f7] p-3.5';
const metaLabel = 'mb-1 text-[12px] font-medium text-admin-text-secondary';
const metaValue = 'text-[13px] font-semibold text-admin-text';

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
  const [method, setMethod] = useState<'embedded' | 'qr' | 'manual'>('manual');
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
  const [signupConfig, setSignupConfig] = useState<{ enableEmbeddedSignup: boolean; enableManualSignup: boolean; enableCoexistence: boolean; appId: string; configId: string; webhookUrl: string; webhookVerifyToken: string }>({
    enableEmbeddedSignup: false, enableManualSignup: true, enableCoexistence: false, appId: '', configId: '', webhookUrl: '', webhookVerifyToken: '',
  });
  // Captured from Embedded Signup session logging (postMessage) — most reliable WABA/phone IDs
  const sessionInfoRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  // Embedded Signup session logging: listen for the WABA/phone IDs Meta posts back
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'WA_EMBEDDED_SIGNUP' && data?.data) {
          sessionInfoRef.current = { wabaId: data.data.waba_id, phoneNumberId: data.data.phone_number_id };
        }
      } catch { /* non-JSON messages are ignored */ }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!currentWorkspace?._id) return;
    workspaceApi.getWhatsAppSignupConfig(currentWorkspace._id).then(r => {
      const cfg = r.data.data || {};
      setSignupConfig({
        enableEmbeddedSignup: cfg.enableEmbeddedSignup || false,
        enableManualSignup: cfg.enableManualSignup !== false,
        enableCoexistence: cfg.enableCoexistence || false,
        appId: cfg.appId || '',
        configId: cfg.configId || '',
        webhookUrl: cfg.webhookUrl || '',
        webhookVerifyToken: cfg.webhookVerifyToken || '',
      });
      // Auto-select first available method
      if (cfg.enableEmbeddedSignup) setMethod('embedded');
      else if (cfg.enableManualSignup !== false) setMethod('manual');
    }).catch(() => {});
  }, [currentWorkspace?._id]);

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

  // Launch WhatsApp Embedded Signup. coexistence=true onboards an existing
  // WhatsApp Business App number (usable on both the app and Cloud API).
  const launchSignup = (coexistence: boolean) => {
    if (!signupConfig.appId) { toast.error('Meta App ID not configured by admin'); return; }
    sessionInfoRef.current = {};
    const launchFBLogin = () => {
      const FB = (window as unknown as { FB?: { login: (cb: (r: { authResponse?: { code?: string } }) => void, opts: object) => void } }).FB;
      if (!FB) { toast.error('Facebook SDK failed to load. Please disable ad-blockers and try again.'); return; }
      FB.login((response) => {
        const code = response.authResponse?.code;
        if (!code) { toast.error('Facebook login cancelled or failed'); return; }
        setSaving(true);
        workspaceApi.embeddedSignup(currentWorkspace!._id, {
          code, coexistence,
          wabaId: sessionInfoRef.current.wabaId,
          phoneNumberId: sessionInfoRef.current.phoneNumberId,
        }).then((res) => {
          toast.success(coexistence ? 'WhatsApp Business App number connected!' : 'WhatsApp connected via Embedded Signup!');
          const updatedWs = res.data.data;
          if (updatedWs) useAuthStore.setState({ currentWorkspace: { ...currentWorkspace, whatsapp: { ...currentWorkspace?.whatsapp, isConnected: true, connectionMethod: coexistence ? 'coexistence' : 'embedded', ...updatedWs } } as typeof currentWorkspace });
          window.location.reload();
        }).catch((err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Embedded signup failed');
        }).finally(() => setSaving(false));
      }, {
        config_id: signupConfig.configId || undefined,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          // Coexistence requires the business-app onboarding flow + session logging (v3)
          featureType: coexistence ? 'whatsapp_business_app_onboarding' : 'only_waba_sharing',
          sessionInfoVersion: coexistence ? 3 : 2,
        },
      });
    };
    if ((window as unknown as { FB?: object }).FB) { launchFBLogin(); return; }
    (window as unknown as { fbAsyncInit?: () => void }).fbAsyncInit = () => {
      const FB = (window as unknown as { FB: { init: (o: object) => void } }).FB;
      FB.init({ appId: signupConfig.appId, cookie: true, xfbml: true, version: 'v21.0' });
      launchFBLogin();
    };
    const s = document.createElement('script'); s.src = 'https://connect.facebook.net/en_US/sdk.js'; s.async = true; document.body.appendChild(s);
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
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[13px] text-amber-800">Display Name / Phone Number not available — your Access Token may have expired. Update your token or click Refresh.</p>
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
                  <p className={`${metaValue} font-mono text-[12px]`}>{wa.businessAccountId || '-'}</p>
                  <button
                    type="button"
                    className="rounded-md p-1 text-admin-text-subdued hover:bg-white hover:text-admin-text"
                    onClick={() => { navigator.clipboard.writeText(wa.businessAccountId || ''); toast.success('Copied'); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    {health.errors.map((e, i) => <p key={i} className="text-[12px] text-amber-800">{e}</p>)}
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
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[12px] text-amber-900">Subscribe to <strong>messages</strong> webhook field in Meta Developer Portal to receive incoming WhatsApp messages.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {!signupConfig.enableEmbeddedSignup && !signupConfig.enableManualSignup ? (
            <div className={`${cardClass} py-10 text-center`}>
              <Settings className="mx-auto mb-3 h-12 w-12 text-admin-border" />
              <h3 className="mb-1 text-[15px] font-semibold text-admin-text">No signup method available</h3>
              <p className="text-[13px] text-admin-text-secondary">Please contact your administrator to enable a WhatsApp signup method.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                {signupConfig.enableEmbeddedSignup && (
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
                )}
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

              {method === 'embedded' && signupConfig.enableEmbeddedSignup && (
                <div className={cardClass}>
                  <h3 className="mb-2 text-[15px] font-semibold text-admin-text">Embedded signup</h3>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
