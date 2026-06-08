import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useStore } from '../../contexts/store.context';
import { useStoreSecuritySettings } from '../../contexts/store-security-settings.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const UsersSecurityPage: React.FC = () => {
  const { stores, activeStoreId } = useStore();
  const { settings, loading, fetchByStoreId, update, generateNewCode } = useStoreSecuritySettings();
  const activeStore = useMemo(
    () => stores.find((store) => store._id === activeStoreId),
    [stores, activeStoreId]
  );

  const [requireCode, setRequireCode] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [generatingCode, setGeneratingCode] = useState<boolean>(false);

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (settings) {
      setRequireCode(settings.requireCode);
    } else {
      setRequireCode(false);
    }
  }, [settings]);

  const handleCopySecurityCode = useCallback(() => {
    if (!settings?.securityCode) {
      toast.dismiss();
      toast.error('No security code to copy');
      return;
    }
    navigator.clipboard
      .writeText(settings.securityCode)
      .then(() => {
        toast.dismiss();
        toast.success('Security code copied');
      })
      .catch(() => {
        toast.dismiss();
        toast.error('Failed to copy code');
      });
  }, [settings]);

  const handleGenerateNewSecurityCode = useCallback(async () => {
    if (!settings?._id) {
      toast.dismiss();
      toast.error('Settings not available');
      return;
    }
    setGeneratingCode(true);
    try {
      await generateNewCode(settings._id);
      toast.dismiss();
      toast.success('New security code generated successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate new security code';
      toast.dismiss();
      toast.error(msg);
    } finally {
      setGeneratingCode(false);
    }
  }, [settings, generateNewCode]);

  const handleDisableRequireCode = useCallback(async () => {
    if (!activeStoreId || !settings) {
      toast.dismiss();
      toast.error('Settings not available');
      return;
    }
    setUpdating(true);
    try {
      await update(settings._id, { requireCode: false });
      toast.dismiss();
      toast.success('Security code requirement disabled');
      setRequireCode(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to disable security code requirement';
      toast.dismiss();
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  }, [activeStoreId, settings, update]);

  const handleRequireCodeButton = useCallback(async () => {
    if (!activeStoreId || !settings) {
      toast.dismiss();
      toast.error('Settings not available');
      return;
    }
    setUpdating(true);
    try {
      await update(settings._id, { requireCode: true });
      toast.dismiss();
      toast.success('Security code requirement enabled');
      setRequireCode(true);
    } catch (err: any) {
      const msg = err?.message || 'Failed to enable security code requirement';
      toast.dismiss();
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  }, [activeStoreId, settings, update]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title="Security"
          description="Manage collaborator access and security codes for your store."
        />

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading security settings...</p>
          </div>
        )}

        {!loading && settings && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900">Collaborators</h2>
              <p className="mt-1 text-sm text-gray-500">
                Give designers, developers, and marketers access to this store. Collaborators don&apos;t count toward your staff limit.{' '}
                <button type="button" onClick={() => {}} className="text-gray-700 font-medium hover:underline">
                  Learn more about collaborators
                </button>
                .
              </p>
            </div>

            {!settings.requireCode && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">
                      Anyone can send a collaborator request for <strong className="text-gray-900">{activeStore?.storeName || 'My Store'}</strong>. A code is not required.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      You&apos;ll still need to review and approve requests from{' '}
                      <button type="button" onClick={() => {}} className="text-gray-700 font-medium hover:underline">
                        Users
                      </button>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequireCodeButton}
                    disabled={updating}
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {updating ? 'Updating...' : 'Require code'}
                  </button>
                </div>
              </div>
            )}

            {settings.requireCode && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Store</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {activeStore?.storeName || 'My Store'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Share this code to allow someone to send you a collaborator request. You&apos;ll still need to review and approve from{' '}
                      <button type="button" onClick={() => {}} className="text-gray-700 font-medium hover:underline">
                        Users
                      </button>
                      .
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {settings.securityCode && (
                      <button
                        type="button"
                        onClick={handleCopySecurityCode}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-mono"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        {settings.securityCode}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateNewSecurityCode}
                      disabled={generatingCode}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingCode ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate new code'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisableRequireCode}
                      disabled={updating}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove code requirement"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersSecurityPage;
