'use client';
import React, { useState, useEffect } from 'react';
import { Code2, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';
import AllEndpoints from '@/components/ApiEndpointsDocs';
import { workspaceApi } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '') + '/api/v1';

const primaryBtn =
  'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50';
const iconBtn =
  'rounded-lg border border-admin-border bg-white p-2 text-admin-text-secondary transition-colors hover:bg-[#f6f6f7] hover:text-admin-text';

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [wsId, setWsId] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('workspaceId') || '';
    setWsId(id);
    if (id) workspaceApi.get(id).then(r => setApiKey(r.data.data?.apiKey || '')).catch(() => {});
  }, []);

  const generate = async () => {
    if (apiKey && !confirm('Your old key will stop working. Generate a new key?')) return;
    try {
      const r = await api.post(`/workspaces/${wsId}/api-key`);
      setApiKey(r.data.data.apiKey);
      setShowKey(true);
      toast.success('New API key generated');
    } catch {
      toast.error('Failed');
    }
  };

  const KEY = apiKey || 'YOUR_API_KEY';

  return (
    <div className={`${adminContentColumnClass} space-y-5`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
          <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">API &amp; Developers</h1>
        </div>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Authenticate with your API key and explore available endpoints
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-admin-border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] sm:p-5">
        <h2 className="text-[13px] font-semibold text-admin-text">Your API key</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            type={showKey ? 'text' : 'password'}
            value={apiKey || 'No key yet — generate one'}
            className="min-w-0 flex-1 rounded-lg border border-admin-border bg-[#f6f6f7] px-3 py-2 font-mono text-[13px] text-admin-text focus:outline-none"
          />
          <button type="button" onClick={() => setShowKey(!showKey)} className={iconBtn} title={showKey ? 'Hide key' : 'Show key'}>
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {apiKey && (
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied'); }}
              className={iconBtn}
              title="Copy key"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={generate} className={primaryBtn}>
            <RefreshCw className="h-3.5 w-3.5" /> {apiKey ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        <p className="text-[12px] leading-relaxed text-admin-text-subdued">
          Send this header with every request:{' '}
          <code className="rounded border border-admin-border bg-[#f6f6f7] px-1.5 py-0.5 font-mono text-[11px] text-admin-text">
            X-API-Key: {'{your key}'}
          </code>
          {' '}· Base URL:{' '}
          <code className="rounded border border-admin-border bg-[#f6f6f7] px-1.5 py-0.5 font-mono text-[11px] text-admin-text">
            {BASE}
          </code>
        </p>
      </div>

      <AllEndpoints KEY={KEY} />
    </div>
  );
}
