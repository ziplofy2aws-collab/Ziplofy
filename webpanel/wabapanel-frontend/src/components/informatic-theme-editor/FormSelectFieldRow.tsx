'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, ChevronDown, FileText, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EditorFieldDef } from '@/lib/informatic-theme/load-static-pack';
import { getConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { leadFormLabelFromValue } from '@/lib/informatic-theme/informatic-lead-form.util';
import { formApi } from '@/lib/api';

type WorkspaceForm = {
  _id: string;
  name: string;
  description?: string;
  status?: string;
};

type DropdownMode = 'actions' | 'replace' | null;

type Props = {
  field: EditorFieldDef;
  config: Record<string, unknown>;
  onLeadFormSelect: (formFieldPath: string, form: WorkspaceForm) => void;
  onLeadFormClear: (formFieldPath: string) => void;
};

export function FormSelectFieldRow({ field, config, onLeadFormSelect, onLeadFormClear }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dropdown, setDropdown] = useState<DropdownMode>(null);
  const [forms, setForms] = useState<WorkspaceForm[]>([]);
  const [loading, setLoading] = useState(false);

  const current = String(getConfigPath(config, field.path) ?? '').trim();
  const formNamePath = field.path.replace(/\.formId$/, '.formName');
  const storedName = String(getConfigPath(config, formNamePath) ?? '').trim();
  const selectedForm = forms.find((f) => f._id === current);
  const resolvedLabel =
    leadFormLabelFromValue(current, forms) ?? storedName ?? selectedForm?.name ?? '';

  const reloadForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await formApi.list();
      setForms(res.data.data || []);
    } catch {
      setForms([]);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadForms();
  }, [reloadForms]);

  useEffect(() => {
    if (!dropdown) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [dropdown]);

  const handleSelectExisting = useCallback(
    (formId: string) => {
      const form = forms.find((f) => f._id === formId);
      if (!form) return;
      setDropdown(null);
      onLeadFormSelect(field.path, form);
    },
    [forms, field.path, onLeadFormSelect]
  );

  const triggerLabel = selectedForm
    ? selectedForm.name
    : current
      ? resolvedLabel || 'Linked form'
      : loading && forms.length === 0
        ? 'Loading forms…'
        : 'Built-in contact form';

  const activeForms = forms.filter((f) => f.status !== 'inactive');

  return (
    <div className="py-1" ref={rootRef}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <span className="text-[13px] text-gray-800">{field.label || 'Lead generation form'}</span>
        <div className="relative min-w-[160px]">
          <button
            type="button"
            disabled={loading && forms.length === 0}
            aria-haspopup="menu"
            aria-expanded={Boolean(dropdown)}
            onClick={() => setDropdown((prev) => (prev ? null : 'actions'))}
            className="flex w-full items-center gap-2 rounded-lg border border-[#c9cccf] bg-white py-2 pl-2.5 pr-8 text-left text-[13px] text-gray-900 shadow-sm hover:border-[#aeb4b9] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3] disabled:opacity-60"
          >
            <FileText className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          </button>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

          {dropdown === 'actions' ? (
            <div
              role="menu"
              className="absolute right-0 z-[1600] mt-1 w-[min(100vw-2rem,220px)] overflow-hidden rounded-lg border border-[#c9cccf] bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setDropdown('replace')}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Replace
              </button>
              {current ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setDropdown(null);
                    onLeadFormClear(field.path);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                  Use built-in form
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDropdown(null);
                  window.open('/client/forms', '_blank', 'noopener,noreferrer');
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-gray-900 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                Create
              </button>
            </div>
          ) : null}

          {dropdown === 'replace' ? (
            <div
              role="listbox"
              className="absolute right-0 z-[1600] mt-1 max-h-64 w-[min(100vw-2rem,260px)] overflow-hidden rounded-lg border border-[#c9cccf] bg-white shadow-lg"
            >
              <div className="border-b border-[#e1e1e1] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Choose form
              </div>
              <ul className="max-h-48 overflow-y-auto overscroll-contain py-1">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!current}
                    onClick={() => {
                      setDropdown(null);
                      onLeadFormClear(field.path);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 ${
                      !current ? 'bg-blue-50 font-medium text-[#005bd3]' : 'text-gray-900'
                    }`}
                  >
                    Built-in contact form
                  </button>
                </li>
                {activeForms.length === 0 ? (
                  <li className="px-3 py-2 text-[12px] text-gray-500">No active forms yet</li>
                ) : (
                  activeForms.map((form) => {
                    const selected = form._id === current;
                    return (
                      <li key={form._id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => handleSelectExisting(form._id)}
                          className={`flex w-full px-3 py-2 text-left text-[13px] hover:bg-gray-50 ${
                            selected ? 'bg-blue-50 font-medium text-[#005bd3]' : 'text-gray-900'
                          }`}
                        >
                          {form.name}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="border-t border-[#e1e1e1] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdown(null);
                    window.open('/client/forms', '_blank', 'noopener,noreferrer');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-[#005bd3] hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden />
                  Create form
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {current && resolvedLabel ? (
        <p className="mt-1.5 text-[12px] text-gray-500">
          Showing fields from &quot;{resolvedLabel}&quot; on the storefront
        </p>
      ) : (
        <p className="mt-1.5 text-[12px] text-gray-500">
          Default name, email, and message fields — or link a form from Forms.
        </p>
      )}
    </div>
  );
}
