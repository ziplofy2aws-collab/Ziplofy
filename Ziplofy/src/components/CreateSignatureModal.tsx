import { ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SIGNATURE_NAME_MAX = 100;

const EXPIRY_OPTIONS = [
  { value: 15, label: '15 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const;

type SelectOption = {
  value: string;
  label: string;
  muted?: boolean;
};

function formatExpiryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function PreferenceSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    const match = options.find((option) => option.value === value && !option.muted);
    return match?.label ?? placeholder ?? '';
  }, [options, value, placeholder]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref}>
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-[13px] shadow-sm transition-colors ${
            open ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className={selectedLabel ? 'text-gray-900' : 'text-gray-400'}>{selectedLabel || placeholder}</span>
          <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {options.map((option) => {
              const isSelected = option.value === value && !option.muted;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  disabled={option.muted}
                  onClick={() => {
                    if (option.muted) return;
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-[13px] transition-colors ${
                    option.muted
                      ? 'cursor-default text-gray-400'
                      : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  primaryDomain?: string | null;
};

export default function CreateSignatureModal({ open, onClose, primaryDomain }: Props) {
  const [mounted, setMounted] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSignatureName('');
    setSelectedDomain(primaryDomain ?? '');
    setExpiresInDays(30);
  }, [open, primaryDomain]);

  useEffect(() => {
    if (!open || !mounted) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, mounted]);

  const domainOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [{ value: '', label: 'Select a domain', muted: true }];
    if (primaryDomain) {
      options.push({
        value: primaryDomain,
        label: `${primaryDomain} (Primary)`,
      });
    }
    return options;
  }, [primaryDomain]);

  const expiryOptions = useMemo<SelectOption[]>(
    () => EXPIRY_OPTIONS.map((option) => ({ value: String(option.value), label: option.label })),
    []
  );

  const canCreate = signatureName.trim().length > 0 && selectedDomain.length > 0;

  const handleCreate = useCallback(() => {
    if (!canCreate) return;
    onClose();
  }, [canCreate, onClose]);

  if (!open || !mounted) return null;

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30';

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-signature-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="create-signature-title" className="text-[15px] font-semibold text-gray-900">
            Create new signature
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto">
          <p className="border-b border-gray-100 px-5 py-3 text-[13px] text-gray-600">
            These details can&apos;t be changed after the signature is created
          </p>

          <div className="space-y-0">
            <div className="border-b border-gray-100 px-5 py-4">
              <label className="mb-1.5 block text-[13px] font-medium text-gray-700" htmlFor="sig-name">
                Signature name
              </label>
              <input
                id="sig-name"
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value.slice(0, SIGNATURE_NAME_MAX))}
                placeholder="Enter a name for this signature"
                className={inputClass}
                autoFocus
              />
              <p className="mt-1.5 text-[12px] text-gray-500">
                {signatureName.length} of {SIGNATURE_NAME_MAX} characters used
              </p>
            </div>

            <div className="border-b border-gray-100 px-5 py-4">
              <PreferenceSelect
                id="sig-domain"
                label="Domain"
                value={selectedDomain}
                onChange={setSelectedDomain}
                options={domainOptions}
                placeholder="Select a domain"
              />
            </div>

            <div className="px-5 py-4">
              <PreferenceSelect
                id="sig-expires"
                label="Expires in"
                value={String(expiresInDays)}
                onChange={(value) => setExpiresInDays(Number(value))}
                options={expiryOptions}
              />
              <p className="mt-1.5 text-[12px] text-gray-500">
                Expires on {formatExpiryDate(expiresInDays)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-white"
          >
            Create signature
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') ?? document.body
  );
}

function getHostnameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export { getHostnameFromUrl };
