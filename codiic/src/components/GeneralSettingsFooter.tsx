
interface GeneralSettingsFooterProps {
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}

export default function GeneralSettingsFooter({
  onSave,
  saving,
  disabled,
}: GeneralSettingsFooterProps) {
  return (
    <div className="sticky bottom-0 z-20 px-2 py-3">
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:flex-row">
        <p className="text-xs text-slate-500">
          To change your user-level time zone and language, visit your{' '}
          <a href="#" className="text-slate-700 hover:underline">
            account settings
          </a>
          .
        </p>
        <button
          onClick={onSave}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

