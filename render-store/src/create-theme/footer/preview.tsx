import React from 'react';
import { PreviewShell } from '../_shared/PreviewShell';

export function FooterPreview() {
  return (
    <PreviewShell className="flex items-center gap-5 bg-[#f6f6f7]">
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.82rem] font-bold leading-tight text-gray-900">Join our email list</h3>
        <p className="mt-1 max-w-[11rem] text-[0.55rem] leading-snug text-gray-600">
          Get exclusive deals and early access to new products.
        </p>
      </div>
      <div className="flex w-[52%] max-w-[210px] shrink-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-full border border-[#c9cccf] bg-white px-3 py-2.5">
          <span className="truncate text-[0.5rem] text-gray-400">Email address</span>
        </div>
        <span className="flex shrink-0 items-center justify-center rounded-full bg-gray-900 px-3.5 py-2.5 text-[0.5rem] font-medium text-white">
          Sign up
        </span>
      </div>
    </PreviewShell>
  );
}
