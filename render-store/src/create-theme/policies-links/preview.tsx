import React from 'react';
import { PreviewShell } from '../_shared/PreviewShell';

export function PoliciesLinksPreview() {
  return (
    <PreviewShell className="flex items-center justify-between gap-4 bg-[#f6f6f7]">
      <span className="shrink-0 text-[0.5rem] text-gray-600">© 2026 My Store, Powered by Ziplofy</span>
      <span className="shrink-0 text-[0.5rem] text-gray-700">Terms and Policies</span>
    </PreviewShell>
  );
}
