'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2 } from 'lucide-react';
import { authApi, workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { fireConfettiFireworks } from '@/lib/confettiFireworks';
import AppStatusScreen from '@/components/status/AppStatusScreen';
import WorkspaceCongrats from '@/components/status/WorkspaceCongrats';
import { FlowButton } from '@/components/ui/flow-button';
import AppFormModal, { appModalFieldClass, appModalLabelClass } from '@/components/ui/AppFormModal';

const glassPanel =
  'overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl';

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
  const [formError, setFormError] = useState<string | null>(null);

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
    setSaving(true);
    setFormError(null);
    if (name.trim().length < 2) {
      setFormError('Enter a workspace name (at least 2 characters).');
      setSaving(false);
      return;
    }
    const started = Date.now();
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
      setFormError(message);
      toast.error(message);
      setPhase('ready');
    } finally {
      const wait = Math.max(0, 500 - (Date.now() - started));
      if (wait) await new Promise((r) => window.setTimeout(r, wait));
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
          <FlowButton
            text="Create First Workspace"
            className="w-full"
            onClick={() => {
              setFormError(null);
              setOpen(true);
            }}
          />
        </div>
      </div>

      <AppFormModal
        open={open}
        eyebrow="New workspace"
        title="Create workspace"
        description="Each workspace keeps campaigns, contacts, and channels organized for one business."
        onClose={() => setOpen(false)}
        onSubmit={create}
        confirmLabel="Create workspace"
        confirmLoadingLabel="Creating…"
        loading={saving}
        error={formError}
      >
        <label className={appModalLabelClass}>
          Workspace name <span className="text-emerald-600">*</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={appModalFieldClass}
            placeholder="e.g. Main business"
            required
            minLength={2}
            maxLength={100}
            autoFocus
            disabled={saving}
          />
        </label>
        <label className={appModalLabelClass}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${appModalFieldClass} min-h-[100px] resize-y`}
            placeholder="Optional short description"
            maxLength={500}
            disabled={saving}
          />
        </label>
      </AppFormModal>
    </div>
  );
}
