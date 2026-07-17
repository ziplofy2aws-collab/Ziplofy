import React from 'react';
import { getCreateThemeElement } from '../registry';
import { defaultPreviewForElement } from '../_shared/section-preview-helpers';
import { SectionPreviewVisual } from '../_shared/SectionPreviewVisual';

/** Reuses the same catalog hover preview art as Add section modal. */
export function CodiixElementPreview({ elementId }: { elementId: string }) {
  const element = getCreateThemeElement(elementId);
  if (!element) return null;
  const slide = defaultPreviewForElement(element);

  return (
    <div className="codiix-preview">
      <p className="codiix-preview__label">Preview · {element.label}</p>
      <div className="codiix-preview__frame">
        <div className="codiix-preview__scale">
          <SectionPreviewVisual variant={slide.variant} />
        </div>
      </div>
      <p className="codiix-preview__caption">
        This is how <strong>{element.label}</strong> looks
        {slide.caption ? ` — ${slide.caption}` : '.'}
      </p>
    </div>
  );
}
