import React from 'react';
import { PreviewShell } from '../_shared/PreviewShell';

export function AnnouncementBarPreview() {
  return (
    <PreviewShell className="bg-gray-900 py-3 text-center">
      <p className="text-[0.55rem] font-medium text-white">
        Free shipping on orders over ₹999 — Shop now
      </p>
    </PreviewShell>
  );
}
