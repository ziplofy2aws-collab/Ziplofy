'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { authApi, workspaceApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  adminContentColumnClass,
  adminListPrimaryButtonClass,
  adminListSecondaryButtonClass,
  dashboardCardShell,
} from '@/components/layout/dashboard-ui';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const loadUser = useAuthStore((s) => s.loadUser);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

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
      })
      .catch(() => toast.error('Could not load workspace status'))
      .finally(() => setChecking(false));
  }, [router]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Enter a workspace name');
      return;
    }
    setSaving(true);
    try {
      await workspaceApi.create({ name: name.trim(), description: description.trim() });
      await loadUser();
      toast.success('Workspace created');
      router.replace('/client/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create workspace';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className={`${adminContentColumnClass} py-16 text-center text-[13px] text-admin-text-secondary`}>
        Loading workspace…
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} flex min-h-[70vh] flex-col items-center justify-center`}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#005bd3]">Workspace selection</p>
      <h1 className="text-center text-[28px] font-semibold text-admin-text">Choose your Workspace</h1>
      <p className="mt-2 max-w-lg text-center text-[14px] text-admin-text-secondary">
        Each workspace is linked to your business account. Create one to continue to the dashboard.
      </p>

      <div className={`${dashboardCardShell} mt-8 w-full max-w-md text-center`}>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ebebeb]">
          <Plus className="h-7 w-7 text-admin-text" />
        </div>
        <h2 className="text-[18px] font-semibold text-admin-text">No Workspaces Yet</h2>
        <p className="mt-2 text-[13px] text-admin-text-secondary">
          Get started by creating your first workspace to manage your campaigns and website.
        </p>
        <button type="button" className={`${adminListPrimaryButtonClass} mt-5 w-full`} onClick={() => setOpen(true)}>
          + Create First Workspace
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={create} className={`${dashboardCardShell} w-full max-w-md space-y-3`}>
            <h3 className="text-[16px] font-semibold">Create workspace</h3>
            <label className="block text-[13px] font-medium">
              Workspace name <span className="text-red-600">*</span>
              <input
                className="mt-1 w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main business"
                required
                minLength={2}
              />
            </label>
            <label className="block text-[13px] font-medium">
              Description
              <textarea
                className="mt-1 min-h-[90px] w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className={adminListSecondaryButtonClass}
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={adminListPrimaryButtonClass} disabled={saving}>
                {saving ? 'Creating…' : 'Create workspace'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
