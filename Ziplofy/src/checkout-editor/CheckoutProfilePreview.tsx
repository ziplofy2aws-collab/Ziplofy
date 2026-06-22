import React from 'react';

type Props = {
  device: 'desktop' | 'mobile';
  storeUrl?: string | null;
};

export function CheckoutProfilePreview({ device, storeUrl }: Props) {
  const storefrontHref = storeUrl?.trim() || '#';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f1f1]">
      <div
        className={`mx-auto flex min-h-0 w-full flex-1 flex-col ${
          device === 'mobile' ? 'max-w-[390px] border-x border-gray-200 bg-[#f1f1f1]' : ''
        }`}
      >
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <p className="text-[15px] leading-relaxed text-gray-700">
              This store isn&apos;t set up to receive orders yet. Contact the store directly for help.
            </p>
            <a
              href={storefrontHref}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
            >
              Return to store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
