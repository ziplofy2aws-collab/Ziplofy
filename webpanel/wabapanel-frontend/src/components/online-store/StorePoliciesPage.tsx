'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Ellipsis,
  Fingerprint,
  Lock,
  Scale,
} from 'lucide-react';
import {
  adminListCardClass,
  adminListPageInnerClass,
  adminListPageShellClass,
} from '@/components/admin-list-ui';
import {
  htmlToPlainText,
  isRichTextContentEmpty,
  isRichTextEditorContentEqual,
  normalizePolicyContentForSave,
  plainTextToEditorHtml,
  storedPolicyToEditorValue,
} from '@/lib/policy-rich-text.util';
import {
  formatStorePhysicalAddress,
  POLICY_TEMPLATE_BUILDERS,
  type PolicyTemplateContext,
} from '@/lib/policy-templates';
import {
  STORE_POLICY_LABELS,
  STORE_POLICY_TYPES,
  storePolicyApi,
  type StorePoliciesMap,
  type StorePolicyType,
} from '@/lib/store-policy';
import { selectActiveStore, useStoreStore } from '@/stores/storeStore';
import { PoliciesRow } from './PoliciesRow';
import {
  btnGhost,
  btnPrimary,
  btnPrimaryMuted,
  PolicyEditorModal,
} from './PolicyEditorModal';

const policyStatusInactive =
  'inline-flex items-center rounded-md bg-admin-fill px-2 py-0.5 text-xs font-medium text-admin-text-secondary';
const policyStatusActive =
  'inline-flex items-center rounded-md bg-admin-secondary px-2 py-0.5 text-xs font-medium text-admin-text';
const policyStatusRequired =
  'inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900';

const POLICY_ICONS: Record<StorePolicyType, ReactNode> = {
  'return-refund': <RefreshCw className="h-4 w-4" />,
  privacy: <Lock className="h-4 w-4" />,
  terms: <Scale className="h-4 w-4" />,
  contact: <Fingerprint className="h-4 w-4" />,
};

function emptyPoliciesMap(): StorePoliciesMap {
  return STORE_POLICY_TYPES.reduce((acc, type) => {
    acc[type] = null;
    return acc;
  }, {} as StorePoliciesMap);
}

function isPolicyDirty(currentPlain: string, storedHtml: string | undefined): boolean {
  const nextHtml = plainTextToEditorHtml(currentPlain);
  return !isRichTextEditorContentEqual(nextHtml, storedHtml ?? '');
}

export function StorePoliciesPage() {
  const activeStore = useStoreStore(selectActiveStore);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const storeId = activeStore?._id || null;

  const [policies, setPolicies] = useState<StorePoliciesMap>(emptyPoliciesMap());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openType, setOpenType] = useState<StorePolicyType | null>(null);
  const [draftPlain, setDraftPlain] = useState('');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const load = useCallback(async () => {
    if (!storeId) {
      setPolicies(emptyPoliciesMap());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await storePolicyApi.listPolicies(storeId);
      setPolicies(res.data?.success && res.data.data ? res.data.data : emptyPoliciesMap());
    } catch {
      toast.error('Failed to load policies');
      setPolicies(emptyPoliciesMap());
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const templateContext = useMemo((): PolicyTemplateContext => {
    const storeName = activeStore?.storeName?.trim() || 'My Store';
    return {
      storeName,
      email: 'support@example.com',
      phone: '[INSERT BUSINESS PHONE NUMBER]',
      legalBusinessName: storeName,
      physicalAddress: formatStorePhysicalAddress({ legalBusinessName: storeName }),
    };
  }, [activeStore?.storeName]);

  const openPolicy = useCallback(
    (type: StorePolicyType) => {
      const stored = policies[type]?.content || '';
      setDraftPlain(htmlToPlainText(storedPolicyToEditorValue(stored)));
      setDisclaimerOpen(false);
      setOpenType(type);
    },
    [policies]
  );

  const closePolicy = useCallback(() => {
    setOpenType(null);
    setDraftPlain('');
    setDisclaimerOpen(false);
  }, []);

  const insertTemplate = useCallback(() => {
    if (!openType) return;
    const builder = POLICY_TEMPLATE_BUILDERS[openType];
    setDraftPlain(builder(templateContext));
  }, [openType, templateContext]);

  const savePolicy = useCallback(async () => {
    if (!storeId || !openType) return;
    const content = normalizePolicyContentForSave(plainTextToEditorHtml(draftPlain));
    if (!content) {
      toast.error('Policy content is required');
      return;
    }
    setSaving(true);
    try {
      await storePolicyApi.upsertPolicy(storeId, openType, content);
      toast.success(policies[openType] ? 'Policy updated' : 'Policy published');
      closePolicy();
      await load();
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save policy'
      );
    } finally {
      setSaving(false);
    }
  }, [storeId, openType, draftPlain, policies, closePolicy, load]);

  const activeRecord = openType ? policies[openType] : null;
  const canPublish = !isRichTextContentEmpty(plainTextToEditorHtml(draftPlain)) && Boolean(storeId);
  const canUpdate =
    Boolean(activeRecord) && isPolicyDirty(draftPlain, activeRecord?.content) && canPublish;

  return (
    <div className={adminListPageShellClass}>
      <div className={`${adminListPageInnerClass} max-w-[1000px]`}>
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold tracking-tight text-admin-text">Policies</h1>
          <p className="mt-1 text-[14px] text-admin-text-subdued">
            Manage written policies for your Informatic storefront — privacy, terms, returns, and contact
            information.
          </p>
        </div>

        {!storeId ? (
          <div className={`${adminListCardClass} p-6 text-[14px] text-admin-text-secondary`}>
            Select a store from the account menu to manage policies.
          </div>
        ) : null}

        <div className={`${adminListCardClass} mb-6`}>
          <div className="flex items-start justify-between gap-4 p-5 pb-4">
            <div>
              <h2 className="text-base font-semibold text-admin-text">Written policies</h2>
              <p className="mt-1 text-sm text-admin-text-subdued">
                Policies can be linked in your store footer and Informatic theme menus
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-admin-border bg-admin-surface p-2 text-admin-text-subdued transition-colors hover:bg-admin-row-hover hover:text-admin-text"
              aria-label="More actions"
            >
              <Ellipsis className="h-4 w-4" />
            </button>
          </div>
          <div className="border-t border-admin-divider">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-admin-text-subdued">Loading policies…</div>
            ) : (
              STORE_POLICY_TYPES.map((type, index) => {
                const record = policies[type];
                const isContact = type === 'contact';
                return (
                  <div key={type}>
                    {index > 0 ? <div className="border-t border-admin-divider" /> : null}
                    <PoliciesRow
                      icon={POLICY_ICONS[type]}
                      label={STORE_POLICY_LABELS[type]}
                      right={
                        record ? (
                          <span className={policyStatusActive}>Active</span>
                        ) : isContact ? (
                          <span className={policyStatusRequired}>Required</span>
                        ) : (
                          <span className={policyStatusInactive}>No policy set</span>
                        )
                      }
                      onClick={() => openPolicy(type)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <PolicyEditorModal
        open={openType !== null}
        title={openType ? STORE_POLICY_LABELS[openType] : ''}
        onClose={closePolicy}
        disclaimerExpanded={disclaimerOpen}
        onToggleDisclaimer={() => setDisclaimerOpen((v) => !v)}
        onInsertTemplate={insertTemplate}
        topBanner={
          openType === 'contact' ? (
            <p className="mb-4 rounded-lg border border-admin-border bg-admin-fill px-3 py-2 text-sm text-admin-text-secondary">
              Contact information is required on your website if you are selling into the European Union.
            </p>
          ) : openType === 'privacy' ? (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-admin-border bg-admin-fill px-3 py-2 text-sm text-admin-text-secondary">
              <span>Use automated policy</span>
              <span className="text-xs text-admin-text-subdued">(Preview only — not saved separately)</span>
            </div>
          ) : null
        }
        actions={
          <>
            <button type="button" onClick={closePolicy} className={btnGhost} disabled={saving}>
              Cancel
            </button>
            {activeRecord ? (
              <button
                type="button"
                className={canUpdate && !saving ? btnPrimary : btnPrimaryMuted}
                disabled={!canUpdate || saving}
                onClick={() => void savePolicy()}
              >
                {saving ? 'Saving…' : 'Update'}
              </button>
            ) : (
              <button
                type="button"
                className={canPublish && !saving ? btnPrimary : btnPrimaryMuted}
                disabled={!canPublish || saving}
                onClick={() => void savePolicy()}
              >
                {saving ? 'Saving…' : 'Publish'}
              </button>
            )}
          </>
        }
      >
        <textarea
          value={draftPlain}
          onChange={(e) => setDraftPlain(e.target.value)}
          rows={18}
          placeholder={
            openType ? `Add your ${STORE_POLICY_LABELS[openType].toLowerCase()}…` : 'Add policy content…'
          }
          className="min-h-[320px] w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-[14px] leading-relaxed text-admin-text outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/15"
        />
      </PolicyEditorModal>
    </div>
  );
}
