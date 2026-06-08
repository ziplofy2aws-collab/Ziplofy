import {
  ChevronRightIcon,
  CloudArrowDownIcon,
  CodeBracketIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface ResourcesSectionProps {
  onOpenShortcutsModal: () => void;
}

export default function ResourcesSection({ onOpenShortcutsModal }: ResourcesSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Resources</h2>
        <p className="mt-1 text-sm text-gray-500">Helpful links, shortcuts, and activity history.</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
          <LinkIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Change log</p>
          </div>
          <button className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            View
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Ziplofy Help Center</p>
          </div>
          <button className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Get help
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
          <CodeBracketIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Hire a Ziplofy Partner</p>
          </div>
          <button className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Hire
          </button>
        </div>

        <button
          onClick={onOpenShortcutsModal}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6H18m0 0h.75m-.75 3h.75m-.75 3h.75M9.813 15v4.687c0 .414.336.75.75.75h4.125a.75.75 0 00.75-.75V15m0 0h-3.375M9.813 15h3.375m0 0H21M9.813 9.813H5.25a2.25 2.25 0 00-2.25 2.25v7.5c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-7.5a2.25 2.25 0 00-2.25-2.25h-4.563zM12.375 9.813V8.625c0-1.036-.84-1.875-1.875-1.875h-1.5c-1.036 0-1.875.84-1.875 1.875v1.188m7.5 0V8.625c0-1.036.84-1.875 1.875-1.875h1.5c1.035 0 1.875.84 1.875 1.875v1.188m-7.5 0h7.5" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Keyboard shortcuts</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />
        </button>

        <button
          onClick={() => navigate('/settings/general/activity')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <CloudArrowDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Store activity log</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </div>
    </div>
  );
}

