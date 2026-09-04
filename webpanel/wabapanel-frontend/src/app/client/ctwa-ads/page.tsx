'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, Target, TrendingUp, MousePointer, DollarSign, Pause, Play, RefreshCw, AlertCircle, Upload, X, Image as ImageIcon, Video, Eye, ChevronDown } from 'lucide-react';
import api, { workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const tagChip =
  'inline-flex items-center gap-1 rounded-full bg-[#f1f1f1] px-2.5 py-1 text-[12px] font-medium text-admin-text ring-1 ring-inset ring-admin-border';
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';
const stepTabBase =
  'rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors';
const stepTabActive = 'bg-admin-text text-white';
const stepTabIdle = 'bg-[#f6f6f7] text-admin-text-secondary hover:bg-[#ebebeb] hover:text-admin-text';

interface CTWAAd {
  _id: string;
  name: string;
  adId: string;
  adAccountId?: string;
  platform: string;
  status: string;
  budgetType: string;
  budget: number;
  bidStrategy: string;
  bidAmount: number;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  costPerClick: number;
  costPerConversion: number;
  startDate: string;
  endDate: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    gender: string;
    locations: string[];
    languages: string[];
    interests: string[];
    customAudience: string;
    lookalike: boolean;
  };
  placements: string[];
  headline: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  callToAction: string;
  welcomeMessage: string;
  optimizationGoal: string;
  createdAt: string;
}

const defaultForm = {
  name: '', adId: '', platform: 'facebook', status: 'draft',
  budgetType: 'daily', budget: 0, bidStrategy: 'lowest_cost', bidAmount: 0,
  startDate: '', endDate: '',
  targeting: { ageMin: 18, ageMax: 65, gender: 'all', locations: [] as string[], languages: [] as string[], interests: [] as string[], customAudience: '', lookalike: false },
  placements: ['facebook_feed', 'instagram_feed'] as string[],
  headline: '', description: '', mediaUrl: '', mediaType: '',
  callToAction: 'send_whatsapp_message', welcomeMessage: '', optimizationGoal: 'conversations',
};

const ctwaApi = {
  list: () => api.get('/ctwa-ads'),
  create: (data: object) => api.post('/ctwa-ads', data),
  update: (id: string, data: object) => api.put(`/ctwa-ads/${id}`, data),
  delete: (id: string) => api.delete(`/ctwa-ads/${id}`),
  sync: (data?: object) => api.post('/ctwa-ads/sync', data || {}),
  adAccounts: () => api.get('/ctwa-ads/ad-accounts'),
  publish: (id: string, data: object) => api.post(`/ctwa-ads/${id}/publish`, data),
};

interface AdAccount { id: string; name: string; account_status?: number; currency?: string; }

const datePresets = [
  { value: 'maximum', label: 'Lifetime' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7d', label: 'Last 7 days' },
  { value: 'last_14d', label: 'Last 14 days' },
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'last_90d', label: 'Last 90 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15',
  paused: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/15',
  completed: 'bg-[#f6f6f7] text-admin-text-secondary ring-1 ring-inset ring-admin-border',
  draft: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/15',
};

const placementOptions = [
  { value: 'facebook_feed', label: 'Facebook Feed' },
  { value: 'instagram_feed', label: 'Instagram Feed' },
  { value: 'instagram_stories', label: 'Instagram Stories' },
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'facebook_stories', label: 'Facebook Stories' },
  { value: 'facebook_reels', label: 'Facebook Reels' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'audience_network', label: 'Audience Network' },
];

const ctaOptions = [
  { value: 'send_whatsapp_message', label: 'Send WhatsApp Message' },
  { value: 'learn_more', label: 'Learn More' },
  { value: 'shop_now', label: 'Shop Now' },
  { value: 'sign_up', label: 'Sign Up' },
  { value: 'contact_us', label: 'Contact Us' },
  { value: 'get_quote', label: 'Get Quote' },
  { value: 'book_now', label: 'Book Now' },
];

const inputClass = 'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const sectionClass = 'space-y-3 rounded-lg border border-admin-border bg-[#fafafa] p-4';

export default function CTWAAdsPage() {
  const [ads, setAds] = useState<CTWAAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CTWAAd | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'targeting' | 'creative'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentWorkspace } = useAuthStore();
  const wa = currentWorkspace?.whatsapp as unknown as { connectionMethod?: string; adsAccessToken?: string } | undefined;
  const needsAdsToken = !!wa && wa.connectionMethod !== 'manual';
  const [adsToken, setAdsToken] = useState('');
  const [adsTokenSaving, setAdsTokenSaving] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [datePreset, setDatePreset] = useState('maximum');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [previewAd, setPreviewAd] = useState<CTWAAd | null>(null);
  const [publishAd, setPublishAd] = useState<CTWAAd | null>(null);
  const [publishPageId, setPublishPageId] = useState('');
  const [publishAccount, setPublishAccount] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const open = showModal || !!previewAd || !!publishAd;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal, previewAd, publishAd]);

  const closeCampaignModal = () => {
    setShowModal(false);
    resetForm();
  };

  const loadAdAccounts = async () => {
    try {
      const r = await ctwaApi.adAccounts();
      const accts: AdAccount[] = r.data.data || [];
      setAdAccounts(accts);
      setSelectedAccounts(prev => prev.length ? prev : accts.map(a => a.id));
    } catch { /* token may lack ads permission */ }
  };
  useEffect(() => { loadAdAccounts(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const toggleAccount = (id: string) => {
    const next = selectedAccounts.includes(id) ? selectedAccounts.filter(x => x !== id) : [...selectedAccounts, id];
    setSelectedAccounts(next);
  };
  const allSelected = adAccounts.length > 0 && selectedAccounts.length === adAccounts.length;
  const accountLabel = adAccounts.length === 0 ? 'No ad accounts'
    : allSelected ? `All accounts (${adAccounts.length})`
    : selectedAccounts.length === 0 ? 'Select accounts'
    : selectedAccounts.length === 1 ? (adAccounts.find(a => a.id === selectedAccounts[0])?.name || selectedAccounts[0])
    : `${selectedAccounts.length} accounts`;

  const doPublish = async () => {
    if (!publishAd) return;
    const acct = publishAccount || selectedAccounts[0];
    if (!acct) { toast.error('Select an ad account'); return; }
    if (!publishPageId.trim()) { toast.error('Facebook Page ID is required'); return; }
    setPublishing(true);
    try {
      const r = await ctwaApi.publish(publishAd._id, { adAccountId: acct, pageId: publishPageId.trim() });
      toast.success(r.data.message || 'Published to Meta (PAUSED)');
      setPublishAd(null); fetchAds();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Publish failed');
    }
    setPublishing(false);
  };
  const saveAdsToken = async () => {
    if (!currentWorkspace?._id || !adsToken.trim()) return;
    setAdsTokenSaving(true);
    try {
      await workspaceApi.updateWhatsApp(currentWorkspace._id, { adsAccessToken: adsToken.trim() });
      const ws = { ...currentWorkspace, whatsapp: { ...(currentWorkspace.whatsapp as object), adsAccessToken: adsToken.trim() } };
      useAuthStore.setState({ currentWorkspace: ws as unknown as typeof currentWorkspace });
      setAdsToken('');
      toast.success('Ads access token saved — click Sync from Meta');
    } catch { toast.error('Failed to save token'); }
    setAdsTokenSaving(false);
  };

  const fetchAds = () => {
    setLoading(true);
    ctwaApi.list().then(r => setAds(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAds(); }, []);

  const resetForm = () => { setForm(JSON.parse(JSON.stringify(defaultForm))); setEditItem(null); setActiveTab('details'); };

  const handleSync = async (opts?: { datePreset?: string; adAccountIds?: string[] }) => {
    if (syncing) return;
    setSyncing(true); setSyncError('');
    try {
      const ids = opts?.adAccountIds ?? selectedAccounts;
      const res = await ctwaApi.sync({
        adAccountIds: ids.length ? ids : undefined,
        datePreset: opts?.datePreset ?? datePreset,
      });
      toast.success(res.data.message || 'Synced from Meta');
      if (res.data.accountErrors?.length) toast.error(`Some accounts failed: ${res.data.accountErrors[0]}`);
      fetchAds();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      const msg = error.response?.data?.message || 'Sync failed';
      setSyncError(error.response?.data?.error ? `${msg}: ${error.response.data.error}` : msg);
      toast.error(msg);
    }
    setSyncing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitting) return;
    setSubmitting(true);

    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { url, mimetype } = res.data.data;
      const mediaType = mimetype.startsWith('video/') ? 'video' : 'image';
      setForm(prev => ({ ...prev, mediaUrl: url, mediaType }));
      toast.success('Media uploaded');
    } catch { toast.error('Upload failed'); } finally { setSubmitting(false); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!form.name.trim()) { toast.error('Campaign name is required'); return; }
    setSubmitting(true);
    try {
      if (editItem) {
        await ctwaApi.update(editItem._id, form);
        toast.success('Campaign updated');
      } else {
        await ctwaApi.create(form);
        toast.success('Campaign created');
      }
      setShowModal(false); resetForm(); fetchAds();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (!confirm('Delete this campaign?')) return;
    try { await ctwaApi.delete(id); toast.success('Deleted'); fetchAds(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const toggleStatus = async (ad: CTWAAd) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    try { await ctwaApi.update(ad._id, { status: newStatus }); toast.success(`Campaign ${newStatus}`); fetchAds(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const toggleRow = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const bulkSetStatus = async (newStatus: string) => {
    if (bulkBusy || !selectedIds.length) return;
    setBulkBusy(true);
    try {
      await Promise.all(selectedIds.map(id => ctwaApi.update(id, { status: newStatus })));
      toast.success(`${selectedIds.length} campaign(s) ${newStatus}`);
      setSelectedIds([]); fetchAds();
    } catch { toast.error('Some updates failed'); } finally { setBulkBusy(false); }
  };
  const bulkDelete = async () => {
    if (bulkBusy || !selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected campaign(s)?`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(selectedIds.map(id => ctwaApi.delete(id)));
      toast.success(`${selectedIds.length} campaign(s) deleted`);
      setSelectedIds([]); fetchAds();
    } catch { toast.error('Some deletes failed'); } finally { setBulkBusy(false); }
  };

  const openEdit = (ad: CTWAAd) => {
    setEditItem(ad);
    setForm({
      name: ad.name, adId: ad.adId || '', platform: ad.platform, status: ad.status,
      budgetType: ad.budgetType || 'daily', budget: ad.budget, bidStrategy: ad.bidStrategy || 'lowest_cost', bidAmount: ad.bidAmount || 0,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      targeting: ad.targeting || defaultForm.targeting,
      placements: ad.placements?.length ? ad.placements : defaultForm.placements,
      headline: ad.headline || '', description: ad.description || '',
      mediaUrl: ad.mediaUrl || '', mediaType: ad.mediaType || '',
      callToAction: ad.callToAction || 'send_whatsapp_message',
      welcomeMessage: ad.welcomeMessage || '', optimizationGoal: ad.optimizationGoal || 'conversations',
    });
    setShowModal(true); setActiveTab('details');
  };

  const addTag = (field: 'locations' | 'interests' | 'languages', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setForm(prev => ({
      ...prev,
      targeting: { ...prev.targeting, [field]: [...prev.targeting[field], value.trim()] }
    }));
    setter('');
  };

  const removeTag = (field: 'locations' | 'interests' | 'languages', index: number) => {
    setForm(prev => ({
      ...prev,
      targeting: { ...prev.targeting, [field]: prev.targeting[field].filter((_, i) => i !== index) }
    }));
  };

  const togglePlacement = (value: string) => {
    setForm(prev => ({
      ...prev,
      placements: prev.placements.includes(value) ? prev.placements.filter(p => p !== value) : [...prev.placements, value]
    }));
  };

  const filteredAds = ads.filter(a =>
    (filterStatus === 'all' || a.status === filterStatus) &&
    (!search.trim() || a.name.toLowerCase().includes(search.trim().toLowerCase()) || (a.adId || '').includes(search.trim()))
  );
  const allRowsSelected = filteredAds.length > 0 && filteredAds.every(a => selectedIds.includes(a._id));
  const toggleAllRows = () => setSelectedIds(allRowsSelected ? [] : filteredAds.map(a => a._id));
  const totalBudget = filteredAds.reduce((s, a) => s + (a.budget || 0), 0);
  const totalSpent = filteredAds.reduce((s, a) => s + (a.spent || 0), 0);
  const totalClicks = filteredAds.reduce((s, a) => s + (a.clicks || 0), 0);
  const totalConversions = filteredAds.reduce((s, a) => s + (a.conversions || 0), 0);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Click to WhatsApp Ads</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Manage CTWA ad campaigns connected to Meta</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {adAccounts.length > 0 && (
            <div className="relative">
              <button type="button" onClick={() => setShowAccountMenu(v => !v)} className={`${secondaryBtn} max-w-[240px] truncate`} title="Ad Accounts">
                <span className="truncate">{accountLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 z-30 mt-1 max-h-80 w-72 overflow-auto rounded-xl border border-admin-border bg-white p-2 shadow-lg">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-b border-admin-border px-2 py-1.5 text-[13px] font-medium hover:bg-[#f6f6f7]">
                    <input type="checkbox" checked={allSelected} onChange={() => setSelectedAccounts(allSelected ? [] : adAccounts.map(a => a.id))} />
                    <span>Select all ({adAccounts.length})</span>
                  </label>
                  {adAccounts.map(a => (
                    <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-[#f6f6f7]">
                      <input type="checkbox" checked={selectedAccounts.includes(a.id)} onChange={() => toggleAccount(a.id)} />
                      <span className="truncate">{a.name ? `${a.name} (${a.id.replace('act_', '')})` : a.id}</span>
                    </label>
                  ))}
                  <button type="button" onClick={() => { setShowAccountMenu(false); handleSync(); }} disabled={syncing || !selectedAccounts.length} className={`mt-2 w-full justify-center ${primaryBtn}`}>
                    Sync selected ({selectedAccounts.length})
                  </button>
                </div>
              )}
            </div>
          )}
          <select value={datePreset} onChange={(e) => { setDatePreset(e.target.value); handleSync({ datePreset: e.target.value }); }} className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text" title="Stats period (auto-syncs)">
            {datePresets.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <button type="button" onClick={() => handleSync()} disabled={syncing} className={secondaryBtn}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing...' : 'Sync from Meta'}
          </button>
          <button type="button" onClick={() => { resetForm(); setShowModal(true); }} className={primaryBtn}>
            <Plus className="h-4 w-4" /> New campaign
          </button>
        </div>
      </div>

      {needsAdsToken && (
        <div className={dashboardCardShell}>
          <p className="text-[13px] font-semibold text-admin-text">Ads access token {wa?.adsAccessToken ? <span className="font-normal text-emerald-700">(saved ✓)</span> : <span className="font-normal text-amber-700">(required for Sync from Meta)</span>}</p>
          <p className="mt-1 text-[12px] text-admin-text-secondary">Your WhatsApp is connected via embedded/coexistence signup, so its token has no ads permission. Create a System User token in Meta Business Settings with <strong>ads_read</strong> permission (and your Ad Account assigned) and paste it here. Messaging keeps using your existing token — this one is only for ads sync.</p>
          <div className="mt-3 flex gap-2">
            <input type="password" placeholder={wa?.adsAccessToken ? 'Replace saved token (EAAG...)' : 'Paste ads access token (EAAG...)'} value={adsToken} onChange={(e) => setAdsToken(e.target.value)} className={inputClass + ' flex-1'} />
            <button type="button" onClick={saveAdsToken} disabled={adsTokenSaving || !adsToken.trim()} className={`${primaryBtn} shrink-0`}>{adsTokenSaving ? 'Saving...' : 'Save token'}</button>
          </div>
        </div>
      )}

      {syncError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-red-700">Sync error</p>
            <p className="mt-1 text-[12px] text-red-600">{syncError}</p>
            <p className="mt-2 text-[12px] text-admin-text-secondary">Ensure your access token has <strong>ads_read</strong> permission in Meta Developer portal.</p>
          </div>
          <button type="button" onClick={() => setSyncError('')} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total budget', value: `₹${totalBudget.toLocaleString()}`, icon: <DollarSign className="h-4 w-4 text-emerald-700" />, tint: 'bg-emerald-50' },
          { label: 'Total spent', value: `₹${totalSpent.toLocaleString()}`, icon: <TrendingUp className="h-4 w-4 text-blue-700" />, tint: 'bg-blue-50' },
          { label: 'Total clicks', value: totalClicks.toLocaleString(), icon: <MousePointer className="h-4 w-4 text-purple-700" />, tint: 'bg-purple-50' },
          { label: 'Conversions', value: totalConversions.toLocaleString(), icon: <Target className="h-4 w-4 text-orange-700" />, tint: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${dashboardCardShell} !p-3.5`}>
            <div className="mb-2 flex items-center gap-2">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.tint}`}>{stat.icon}</span>
              <span className="text-[12px] font-medium text-admin-text-secondary">{stat.label}</span>
            </div>
            <p className="text-xl font-bold tabular-nums leading-tight text-admin-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      {ads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30" />
          {['all', 'active', 'paused', 'completed', 'draft'].map(s => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)} className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${filterStatus === s ? 'border-admin-text bg-admin-text text-white' : 'border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'}`}>
            {s === 'all' ? `All (${ads.length})` : `${s} (${ads.filter(a => a.status === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Ads Table */}
      {loading ? (
        <div className="py-10 text-center text-[13px] text-admin-text-subdued">Loading...</div>
      ) : filteredAds.length === 0 ? (
        <div className={`${dashboardCardShell} p-12 text-center`}>
          <Target className="mx-auto mb-3 h-12 w-12 text-admin-border" />
          <p className="text-[13px] font-medium text-admin-text">{ads.length ? 'No campaigns match the filter' : 'No CTWA campaigns yet'}</p>
          <p className="mt-1 text-[12px] text-admin-text-secondary">{ads.length ? 'Change the filter or search above.' : 'Click “Sync from Meta” to import or create a new campaign.'}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 border-b border-admin-border bg-[#f6f6f7] px-4 py-2.5 text-[13px]">
              <span className="font-medium text-admin-text">{selectedIds.length} selected</span>
              <button type="button" onClick={() => bulkSetStatus('active')} disabled={bulkBusy} className={secondaryBtn}><Play className="h-3.5 w-3.5" /> Activate</button>
              <button type="button" onClick={() => bulkSetStatus('paused')} disabled={bulkBusy} className={`${secondaryBtn} border-amber-300 text-amber-700 hover:bg-amber-50`}><Pause className="h-3.5 w-3.5" /> Pause</button>
              <button type="button" onClick={bulkDelete} disabled={bulkBusy} className={`${secondaryBtn} border-red-300 text-red-600 hover:bg-red-50`}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              <button type="button" onClick={() => setSelectedIds([])} className="ml-auto text-admin-text-secondary hover:text-admin-text">Clear</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-admin-border bg-[#f6f6f7]">
                <tr>
                  <th className="w-10 px-4 py-3"><input type="checkbox" checked={allRowsSelected} onChange={toggleAllRows} title="Select all" /></th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Campaign</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Platform</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Status</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Budget</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Spent</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Impressions</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Clicks</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">CTR</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Conv.</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-admin-text-subdued">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-divider">
                {filteredAds.map((ad) => (
                  <tr key={ad._id} className={`hover:bg-[#f6f6f7] ${selectedIds.includes(ad._id) ? 'bg-[#f1f1f1]' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(ad._id)} onChange={() => toggleRow(ad._id)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ad.mediaUrl && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f1f1f1] shrink-0">
                            {ad.mediaType === 'video' ? (
                              <div className="w-full h-full flex items-center justify-center"><Video className="w-5 h-5 text-admin-text-subdued" /></div>
                            ) : (
                              <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-admin-text">{ad.name}</p>
                          {ad.adId && <p className="text-xs text-admin-text-subdued">ID: {ad.adId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="capitalize text-admin-text-secondary">{ad.platform}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ad.status] || 'bg-[#f1f1f1] text-admin-text-secondary'}`}>{ad.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">₹{(ad.budget || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₹{(ad.spent || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(ad.impressions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{(ad.clicks || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + '%' : '0%'}</td>
                    <td className="px-4 py-3 text-right">{(ad.conversions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setPreviewAd(ad)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Preview"><Eye className="h-4 w-4" /></button>
                        {!ad.adId && (
                          <button onClick={() => { setPublishAd(ad); setPublishAccount(ad.adAccountId || selectedAccounts[0] || ''); setPublishPageId((wa as unknown as { adsPageId?: string })?.adsPageId || ''); }} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Publish to Meta"><Upload className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => toggleStatus(ad)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title={ad.status === 'active' ? 'Pause' : 'Activate'}>
                          {ad.status === 'active' ? <Pause className="h-4 w-4 text-amber-500" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(ad)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(ad._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewAd && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={() => setPreviewAd(null)} />
          <div className={`${modalPanelClass} max-w-sm`} role="dialog" aria-modal="true" aria-label="Ad preview">
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
              <h3 className="text-[14px] font-semibold text-admin-text">Ad preview</h3>
              <button type="button" onClick={() => setPreviewAd(null)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="overflow-hidden rounded-lg border border-admin-border">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f1f1] text-[11px] font-bold text-admin-text">FB</div>
                  <div>
                    <p className="text-[12px] font-semibold text-admin-text">Your Page</p>
                    <p className="text-[10px] text-admin-text-subdued">Sponsored</p>
                  </div>
                </div>
                {previewAd.description && <p className="px-3 pb-2 text-[12px] text-admin-text">{previewAd.description}</p>}
                {previewAd.mediaUrl ? (
                  previewAd.mediaType === 'video' ? (
                    <video src={previewAd.mediaUrl} controls className="max-h-64 w-full bg-black" />
                  ) : (
                    <img src={previewAd.mediaUrl} alt="" className="max-h-64 w-full object-cover" />
                  )
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-[#f1f1f1] text-[12px] text-admin-text-subdued"><ImageIcon className="mr-1 h-5 w-5" /> No media</div>
                )}
                <div className="flex items-center justify-between bg-[#f6f6f7] px-3 py-2">
                  <p className="truncate text-[12px] font-semibold text-admin-text">{previewAd.headline || previewAd.name}</p>
                  <span className="ml-2 shrink-0 rounded bg-admin-text px-2.5 py-1 text-[11px] font-medium text-white">WhatsApp</span>
                </div>
              </div>
              {previewAd.welcomeMessage && (
                <div className="mt-3 rounded-lg bg-[#f6f6f7] p-2">
                  <p className="mb-0.5 text-[10px] text-admin-text-secondary">Pre-filled WhatsApp message:</p>
                  <p className="text-[12px] text-admin-text">{previewAd.welcomeMessage}</p>
                </div>
              )}
              <div className="mt-3 space-y-0.5 text-[11px] text-admin-text-secondary">
                <p>Targeting: {previewAd.targeting?.ageMin || 18}-{previewAd.targeting?.ageMax || 65}, {previewAd.targeting?.gender || 'all'}{previewAd.targeting?.locations?.length ? ', ' + previewAd.targeting.locations.join(', ') : ''}</p>
                {previewAd.targeting?.interests?.length ? <p>Interests: {previewAd.targeting.interests.join(', ')}</p> : null}
                <p>Budget: ₹{(previewAd.budget || 0).toLocaleString()} {previewAd.budgetType === 'lifetime' ? 'lifetime' : '/day'}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Publish Modal */}
      {publishAd && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={() => setPublishAd(null)} />
          <div className={`${modalPanelClass} max-w-md`} role="dialog" aria-modal="true" aria-label="Publish to Meta">
            <div className="flex items-center justify-between border-b border-admin-border px-5 py-3.5">
              <h3 className="text-[15px] font-semibold text-admin-text">Publish to Meta</h3>
              <button type="button" onClick={() => setPublishAd(null)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3 overflow-y-auto p-5">
              <p className="text-[12px] text-admin-text-secondary">Campaign <strong className="text-admin-text">{publishAd.name}</strong> will be created on Meta in <strong className="text-admin-text">PAUSED</strong> state so you can review it before spending. Your token needs <strong>ads_management</strong> permission.</p>
              <div>
                <label className={labelClass}>Ad account</label>
                {adAccounts.length > 0 ? (
                  <select value={publishAccount} onChange={(e) => setPublishAccount(e.target.value)} className={inputClass}>
                    {adAccounts.map(a => <option key={a.id} value={a.id}>{a.name ? `${a.name} (${a.id.replace('act_', '')})` : a.id}</option>)}
                  </select>
                ) : (
                  <input placeholder="act_1234567890" value={publishAccount} onChange={(e) => setPublishAccount(e.target.value)} className={inputClass} />
                )}
              </div>
              <div>
                <label className={labelClass}>Facebook Page ID</label>
                <input placeholder="Your Facebook Page ID (linked to WhatsApp)" value={publishPageId} onChange={(e) => setPublishPageId(e.target.value)} className={inputClass} />
                <p className="mt-1 text-[11px] text-admin-text-subdued">Meta Business Suite → Page → About → Page ID. The page must be connected to your WhatsApp number.</p>
              </div>
              <button type="button" onClick={doPublish} disabled={publishing} className={`w-full ${primaryBtn}`}>{publishing ? 'Publishing...' : 'Publish (PAUSED)'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Full Campaign Modal */}
      {showModal && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={closeCampaignModal} />
          <div className={`${modalPanelClass} max-w-2xl`} role="dialog" aria-modal="true" aria-label={editItem ? 'Edit campaign' : 'New campaign'}>
            <div className="shrink-0 border-b border-admin-border px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold tracking-tight text-admin-text">{editItem ? 'Edit campaign' : 'New campaign'}</h2>
                  <p className="mt-0.5 text-[12px] text-admin-text-secondary">
                    {activeTab === 'details' ? 'Step 1 of 3 — Campaign details' : activeTab === 'targeting' ? 'Step 2 of 3 — Audience & targeting' : 'Step 3 of 3 — Ad creative'}
                  </p>
                </div>
                <button type="button" onClick={closeCampaignModal} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  { id: 'details' as const, label: '1. Details' },
                  { id: 'targeting' as const, label: '2. Targeting' },
                  { id: 'creative' as const, label: '3. Creative' },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`${stepTabBase} ${activeTab === tab.id ? stepTabActive : stepTabIdle}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Campaign name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. Summer Sale CTWA" />
                  </div>
                  <div>
                    <label className={labelClass}>Meta Ad ID (optional)</label>
                    <input value={form.adId} onChange={e => setForm({ ...form, adId: e.target.value })} className={inputClass} placeholder="Auto-filled when synced from Meta" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Platform</label>
                      <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputClass}>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Budget &amp; bidding</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Budget type</label>
                        <select value={form.budgetType} onChange={e => setForm({ ...form, budgetType: e.target.value })} className={inputClass}>
                          <option value="daily">Daily budget</option>
                          <option value="lifetime">Lifetime budget</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Budget amount (₹)</label>
                        <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} className={inputClass} min="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Bid strategy</label>
                        <select value={form.bidStrategy} onChange={e => setForm({ ...form, bidStrategy: e.target.value })} className={inputClass}>
                          <option value="lowest_cost">Lowest cost (auto)</option>
                          <option value="cost_cap">Cost cap</option>
                          <option value="bid_cap">Bid cap</option>
                        </select>
                      </div>
                      {form.bidStrategy !== 'lowest_cost' && (
                        <div>
                          <label className={labelClass}>Bid amount (₹)</label>
                          <input type="number" value={form.bidAmount} onChange={e => setForm({ ...form, bidAmount: Number(e.target.value) })} className={inputClass} min="0" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Schedule</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Start date</label>
                        <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End date</label>
                        <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Optimization goal</label>
                    <select value={form.optimizationGoal} onChange={e => setForm({ ...form, optimizationGoal: e.target.value })} className={inputClass}>
                      <option value="conversations">Conversations (WhatsApp)</option>
                      <option value="link_clicks">Link clicks</option>
                      <option value="impressions">Impressions</option>
                      <option value="reach">Reach</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'targeting' && (
                <div className="space-y-4">
                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Demographics</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>Min age</label>
                        <input type="number" value={form.targeting.ageMin} onChange={e => setForm({ ...form, targeting: { ...form.targeting, ageMin: Number(e.target.value) } })} className={inputClass} min="13" max="65" />
                      </div>
                      <div>
                        <label className={labelClass}>Max age</label>
                        <input type="number" value={form.targeting.ageMax} onChange={e => setForm({ ...form, targeting: { ...form.targeting, ageMax: Number(e.target.value) } })} className={inputClass} min="13" max="65" />
                      </div>
                      <div>
                        <label className={labelClass}>Gender</label>
                        <select value={form.targeting.gender} onChange={e => setForm({ ...form, targeting: { ...form.targeting, gender: e.target.value } })} className={inputClass}>
                          <option value="all">All</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Locations</h3>
                    <div className="flex gap-2">
                      <input value={locationInput} onChange={e => setLocationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('locations', locationInput, setLocationInput))} className={inputClass} placeholder="Type city/state/country and press Enter" />
                      <button type="button" onClick={() => addTag('locations', locationInput, setLocationInput)} className={`${primaryBtn} shrink-0`}>Add</button>
                    </div>
                    {form.targeting.locations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.targeting.locations.map((loc, i) => (
                          <span key={i} className={tagChip}>
                            {loc} <button type="button" onClick={() => removeTag('locations', i)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Interests</h3>
                    <div className="flex gap-2">
                      <input value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('interests', interestInput, setInterestInput))} className={inputClass} placeholder="e.g. Fashion, Technology, Food" />
                      <button type="button" onClick={() => addTag('interests', interestInput, setInterestInput)} className={`${primaryBtn} shrink-0`}>Add</button>
                    </div>
                    {form.targeting.interests.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.targeting.interests.map((int, i) => (
                          <span key={i} className={tagChip}>
                            {int} <button type="button" onClick={() => removeTag('interests', i)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Languages</h3>
                    <div className="flex gap-2">
                      <input value={languageInput} onChange={e => setLanguageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('languages', languageInput, setLanguageInput))} className={inputClass} placeholder="e.g. Hindi, English, Tamil" />
                      <button type="button" onClick={() => addTag('languages', languageInput, setLanguageInput)} className={`${primaryBtn} shrink-0`}>Add</button>
                    </div>
                    {form.targeting.languages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.targeting.languages.map((lang, i) => (
                          <span key={i} className={tagChip}>
                            {lang} <button type="button" onClick={() => removeTag('languages', i)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Custom audience</h3>
                    <input value={form.targeting.customAudience} onChange={e => setForm({ ...form, targeting: { ...form.targeting, customAudience: e.target.value } })} className={inputClass} placeholder="Custom Audience ID from Meta" />
                    <label className="mt-2 flex items-center gap-2 text-[13px] text-admin-text-secondary">
                      <input type="checkbox" checked={form.targeting.lookalike} onChange={e => setForm({ ...form, targeting: { ...form.targeting, lookalike: e.target.checked } })} className="rounded border-admin-border text-admin-text focus:ring-[#005bd3]/30" />
                      Create lookalike audience
                    </label>
                  </div>

                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Placements</h3>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {placementOptions.map(p => (
                        <label key={p.value} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-[13px] text-admin-text-secondary hover:bg-[#f6f6f7]">
                          <input type="checkbox" checked={form.placements.includes(p.value)} onChange={() => togglePlacement(p.value)} className="rounded border-admin-border text-admin-text focus:ring-[#005bd3]/30" />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'creative' && (
                <div className="space-y-4">
                  <div className={sectionClass}>
                    <h3 className="text-[13px] font-semibold text-admin-text">Media</h3>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    {form.mediaUrl ? (
                      <div className="relative">
                        {form.mediaType === 'video' ? (
                          <video src={form.mediaUrl} controls className="max-h-48 w-full rounded-lg bg-[#f1f1f1]" />
                        ) : (
                          <img src={form.mediaUrl} alt="" className="max-h-48 w-full rounded-lg bg-[#f1f1f1] object-cover" />
                        )}
                        <button type="button" onClick={() => setForm({ ...form, mediaUrl: '', mediaType: '' })} className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-admin-border p-8 transition-colors hover:border-admin-text-subdued hover:bg-[#f6f6f7]">
                        {uploading ? (
                          <RefreshCw className="h-8 w-8 animate-spin text-admin-text" />
                        ) : (
                          <Upload className="h-8 w-8 text-admin-text-subdued" />
                        )}
                        <span className="text-[13px] text-admin-text-secondary">{uploading ? 'Uploading...' : 'Click to upload image or video'}</span>
                        <span className="text-[11px] text-admin-text-subdued">JPG, PNG, MP4, MOV (Max 30MB)</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Ad headline</label>
                    <input value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} className={inputClass} placeholder="Catchy headline for your ad" maxLength={40} />
                    <p className="mt-1 text-[11px] text-admin-text-subdued">{form.headline.length}/40 characters</p>
                  </div>

                  <div>
                    <label className={labelClass}>Ad description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Describe your offer or product" maxLength={125} />
                    <p className="mt-1 text-[11px] text-admin-text-subdued">{form.description.length}/125 characters</p>
                  </div>

                  <div>
                    <label className={labelClass}>Call to action</label>
                    <select value={form.callToAction} onChange={e => setForm({ ...form, callToAction: e.target.value })} className={inputClass}>
                      {ctaOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>WhatsApp welcome message</label>
                    <textarea value={form.welcomeMessage} onChange={e => setForm({ ...form, welcomeMessage: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Message shown when user clicks the ad and opens WhatsApp" />
                  </div>

                  <div className={sectionClass}>
                    <h3 className="flex items-center gap-2 text-[13px] font-semibold text-admin-text"><Eye className="h-4 w-4" /> Ad preview</h3>
                    <div className="mx-auto max-w-sm rounded-lg bg-[#f6f6f7] p-4">
                      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-admin-border">
                        {form.mediaUrl ? (
                          form.mediaType === 'video' ? (
                            <div className="flex h-40 w-full items-center justify-center bg-[#f1f1f1]"><Video className="h-10 w-10 text-admin-text-subdued" /></div>
                          ) : (
                            <img src={form.mediaUrl} alt="" className="h-40 w-full object-cover" />
                          )
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[#f1f1f1] to-[#f6f6f7]"><ImageIcon className="h-10 w-10 text-admin-border" /></div>
                        )}
                        <div className="p-3">
                          <p className="text-[13px] font-semibold text-admin-text">{form.headline || 'Your ad headline'}</p>
                          <p className="mt-1 text-[12px] text-admin-text-secondary">{form.description || 'Your ad description will appear here'}</p>
                          <button type="button" className="mt-3 w-full rounded-lg bg-admin-text py-2 text-[12px] font-medium text-white">
                            {ctaOptions.find(o => o.value === form.callToAction)?.label || 'Send WhatsApp Message'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-admin-border bg-[#fafafa] px-5 py-3.5 sm:px-6">
              <div>
                {activeTab !== 'details' && (
                  <button type="button" onClick={() => setActiveTab(activeTab === 'creative' ? 'targeting' : 'details')} className={secondaryBtn}>← Back</button>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeCampaignModal} className={secondaryBtn}>Cancel</button>
                {activeTab !== 'creative' ? (
                  <button type="button" onClick={() => setActiveTab(activeTab === 'details' ? 'targeting' : 'creative')} className={primaryBtn}>Next →</button>
                ) : (
                  <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
                    {submitting ? 'Saving...' : editItem ? 'Update campaign' : 'Create campaign'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
