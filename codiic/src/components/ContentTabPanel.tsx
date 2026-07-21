interface ContentTabPanelProps {
  title: string;
  description: string;
  empty: string;
}

export default function ContentTabPanel({ title, description, empty }: ContentTabPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200/90 bg-gradient-to-b from-gray-50/80 to-white px-6 py-12">
          <p className="max-w-md text-center text-sm text-gray-500">{empty}</p>
          <p className="mt-3 text-xs text-gray-400">Definitions and entries will list here when connected to your store API.</p>
        </div>
      </div>
    </div>
  );
}

