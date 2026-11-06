'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, X } from 'lucide-react';
import { authApi, workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { fireConfettiFireworks } from '@/lib/confettiFireworks';
import AppStatusScreen from '@/components/status/AppStatusScreen';
import WorkspaceCongrats from '@/components/status/WorkspaceCongrats';
import { FlowButton, FlowButtonLoading } from '@/components/ui/flow-button';

const glassPanel =
  'overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl';
const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-white/80 bg-white/75 px-3.5 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] focus:border-emerald-400/70 focus:bg-white/90 focus:ring-4 focus:ring-emerald-500/15';
const labelClass = 'block text-[13px] font-semibold text-slate-800';

type Phase = 'ready' | 'checking' | 'celebrating' | 'entering';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const loadUser = useAuthStore((s) => s.loadUser);
  const [phase, setPhase] = useState<Phase>('checking');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    authApi
      .onboardingStatus()
      .then((res) => {
        const data = res.data.data;
        if (!data.profileComplete) {
          router.replace('/client/manage-profile');
          return;
        }
        if (data.workspaceCount > 0) {
          router.replace('/client/dashboard');
          return;
        }
        setPhase('ready');
      })
      .catch(() => {
        toast.error('Could not load workspace status');
        setPhase('ready');
      });
  }, [router]);

  useEffect(() => {
    if (phase !== 'celebrating') return;
    void fireConfettiFireworks(4200);
  }, [phase]);

  const enterDashboard = async () => {
    if (continuing) return;
    setContinuing(true);
    setPhase('entering');
    try {
      await loadUser();
      await new Promise((r) => window.setTimeout(r, 700));
      try {
        sessionStorage.removeItem('workspaceCelebrate');
      } catch {
        /* ignore */
      }
      router.replace('/client/dashboard');
    } catch {
      setContinuing(false);
      setPhase('celebrating');
      toast.error('Could not open dashboard');
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Enter a workspace name');
      return;
    }
    setSaving(true);
    try {
      await workspaceApi.create({ name: name.trim(), description: description.trim() });
      try {
        sessionStorage.setItem('workspaceCelebrate', '1');
      } catch {
        /* ignore */
      }
      setOpen(false);
      setPhase('celebrating');
    } catch (err: unknown) {
      try {
        sessionStorage.removeItem('workspaceCelebrate');
      } catch {
        /* ignore */
      }
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create workspace';
      toast.error(message);
      setPhase('ready');
    } finally {
      setSaving(false);
    }
  };

  if (phase === 'checking') {
    return <AppStatusScreen variant="loading" fullScreen={false} />;
  }

  if (phase === 'celebrating' && portalReady) {
    return createPortal(
      <WorkspaceCongrats
        starting={continuing}
        onStart={() => {
          void enterDashboard();
        }}
      />,
      document.body
    );
  }

  if (phase === 'entering' && portalReady) {
    return createPortal(<AppStatusScreen variant="loading" />, document.body);
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-[720px] flex-col items-center justify-center px-1 py-6">
      <div className="pointer-events-none absolute inset-x-8 top-10 h-40 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-4 h-36 w-36 rounded-full bg-sky-200/35 blur-3xl" />

      <div className="relative mb-6 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
          Choose your Workspace
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-[14px] leading-relaxed text-slate-600">
          Each workspace is linked to your business account. Create one to continue to the dashboard.
        </p>
      </div>

      <div className={`relative ${glassPanel} w-full max-w-md px-6 py-8 text-center sm:px-8`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/80 bg-gradient-to-br from-white/90 to-emerald-50/80 shadow-[0_12px_30px_rgba(16,185,129,0.18)]">
          <Building2 className="h-7 w-7 text-emerald-700" strokeWidth={1.75} />
        </div>
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">No Workspaces Yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-slate-600">
          Get started by creating your first workspace to manage your campaigns and website.
        </p>
        <div className="mt-6">
          <FlowButton text="Create First Workspace" className="w-full" onClick={() => setOpen(true)} />
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-[3px]"
            disabled={saving}
            onClick={() => setOpen(false)}
          />
          <form
            onSubmit={create}
            className={`relative ${glassPanel} w-full max-w-md space-y-4 px-5 py-6 sm:px-7 sm:py-7`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/75">
                  New workspace
                </p>
                <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-slate-900">
                  Create workspace
                </h3>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/80 bg-white/55 p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-800 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className={labelClass}>
              Workspace name <span className="text-emerald-600">*</span>
              <input
                className={fieldClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main business"
                required
                minLength={2}
                autoFocus
              />
            </label>

            <label className={labelClass}>
              Description
              <textarea
                className={`${fieldClass} min-h-[100px] resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description"
              />
            </label>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
              <FlowButton
                type="button"
                text="Cancel"
                className="sm:w-auto sm:min-w-[120px]"
                disabled={saving}
                onClick={() => setOpen(false)}
              />
              {saving ? (
                <FlowButtonLoading text="Creating…" className="sm:w-auto sm:min-w-[190px]" />
              ) : (
                <FlowButton type="submit" text="Create workspace" className="sm:w-auto sm:min-w-[190px]" />
              )}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
