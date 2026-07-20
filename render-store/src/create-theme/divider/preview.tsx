import React from 'react';
import { PreviewShell } from '../_shared/PreviewShell';

export function DividerPreview() {
  return (
    <PreviewShell className="flex items-center justify-center bg-white py-8">
      <div className="h-px w-full max-w-[280px] bg-gray-300" />
    </PreviewShell>
  );
}
