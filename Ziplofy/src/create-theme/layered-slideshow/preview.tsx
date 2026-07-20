import React from 'react';
import { LayeredSlideshowPreviewArt } from '../_shared/LayeredSlideshowPreviewArt';
import { PreviewShell } from '../_shared/PreviewShell';

export function layeredslideshowPreview() {
  return (
    <PreviewShell className="bg-[#f1f1f1] p-2">
      <LayeredSlideshowPreviewArt size="compact" />
    </PreviewShell>
  );
}
