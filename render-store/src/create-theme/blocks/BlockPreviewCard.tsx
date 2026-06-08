import React from 'react';
import { PreviewShell } from '../_shared/PreviewShell';

type Props = {
  label: string;
  category: string;
};

export function BlockPreviewCard({ label, category }: Props) {
  return (
    <PreviewShell className="flex min-h-[56px] flex-col items-center justify-center bg-white">
      <p className="text-[0.65rem] font-semibold text-gray-900">{label}</p>
      <p className="mt-0.5 text-[0.45rem] uppercase tracking-wide text-gray-400">{category}</p>
    </PreviewShell>
  );
}
