import { adminListPrimaryButtonClass } from './admin-list-ui';

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
      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-surface/95 px-4 py-3 backdrop-blur sm:flex-row">
        <p className="text-[12px] text-admin-text-secondary">
          To change your user-level time zone and language, visit your{' '}
          <a href="#" className="text-admin-text hover:underline">
            account settings
          </a>
          .
        </p>
        <button
          onClick={onSave}
          disabled={disabled}
          className={`${adminListPrimaryButtonClass} disabled:bg-admin-fill disabled:text-admin-text-subdued`}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
