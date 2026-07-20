import React from 'react';
import { FooterSectionPreviewArt } from '../_shared/FooterSectionPreviewArt';
import { PreviewShell } from '../_shared/PreviewShell';

export function FooterPreview() {
  return (
    <PreviewShell className="bg-[#f1f1f1] p-2">
      <FooterSectionPreviewArt size="compact" />
    </PreviewShell>
  );
}
