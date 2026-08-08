import {
  ChevronRightIcon,
  CloudArrowDownIcon,
  CodeBracketIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { adminListCardClass, adminListSecondaryButtonClass } from './admin-list-ui';

interface ResourcesSectionProps {
  onOpenShortcutsModal: () => void;
}

export default function ResourcesSection({ onOpenShortcutsModal }: ResourcesSectionProps) {
  const navigate = useNavigate();

  return (
    <div className={`${adminListCardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold text-admin-text">Resources</h2>
        <p className="mt-1 text-[13px] text-admin-text-secondary">
          Helpful links, shortcuts, and activity history.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border divide-y divide-admin-divider">
        <div className="flex items-center gap-3 bg-admin-surface px-4 py-3 transition-colors hover:bg-admin-row-hover">
          <LinkIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Change log</p>
          </div>
          <button type="button" className={adminListSecondaryButtonClass}>
            View
          </button>
        </div>

        <div className="flex items-center gap-3 bg-admin-surface px-4 py-3 transition-colors hover:bg-admin-row-hover">
          <QuestionMarkCircleIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">codiic Help Center</p>
          </div>
          <button type="button" className={adminListSecondaryButtonClass}>
            Get help
          </button>
        </div>

        <div className="flex items-center gap-3 bg-admin-surface px-4 py-3 transition-colors hover:bg-admin-row-hover">
          <CodeBracketIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Hire a codiic Partner</p>
          </div>
          <button type="button" className={adminListSecondaryButtonClass}>
            Hire
          </button>
        </div>

        <button
          onClick={onOpenShortcutsModal}
          className="flex w-full items-center gap-3 bg-admin-surface px-4 py-3 text-left transition-colors hover:bg-admin-row-hover"
        >
          <svg
            className="h-5 w-5 shrink-0 text-admin-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6H18m0 0h.75m-.75 3h.75m-.75 3h.75M9.813 15v4.687c0 .414.336.75.75.75h4.125a.75.75 0 00.75-.75V15m0 0h-3.375M9.813 15h3.375m0 0H21M9.813 9.813H5.25a2.25 2.25 0 00-2.25 2.25v7.5c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-7.5a2.25 2.25 0 00-2.25-2.25h-4.563zM12.375 9.813V8.625c0-1.036-.84-1.875-1.875-1.875h-1.5c-1.036 0-1.875.84-1.875 1.875v1.188m7.5 0V8.625c0-1.036.84-1.875 1.875-1.875h1.5c1.035 0 1.875.84 1.875 1.875v1.188m-7.5 0h7.5"
            />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Keyboard shortcuts</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-admin-text-subdued" />
        </button>

        <button
          onClick={() => navigate('/settings/general/activity')}
          className="flex w-full items-center gap-3 bg-admin-surface px-4 py-3 text-left transition-colors hover:bg-admin-row-hover"
        >
          <CloudArrowDownIcon className="h-5 w-5 shrink-0 text-admin-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-admin-text">Store activity log</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-admin-text-subdued" />
        </button>
      </div>
    </div>
  );
}
