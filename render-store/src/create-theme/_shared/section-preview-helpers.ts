import type { CreateThemeElement } from '../types';
import { resolveCreateThemePreviewVariant } from './preview-variant-resolver';
import { BLOCK_PREVIEW_SLIDES, type BlockPreviewSlide } from './section-preview-slides';
import type { SectionPreviewVariant } from './SectionPreviewVisual';

export function defaultPreviewForElement(element: CreateThemeElement | null): BlockPreviewSlide {
  if (!element) return BLOCK_PREVIEW_SLIDES[0]!;
  const variant = resolveCreateThemePreviewVariant(
    element.id,
    element.catalogIcon
  ) as SectionPreviewVariant;
  const base =
    BLOCK_PREVIEW_SLIDES.find((s) => s.id === variant || s.variant === variant) ??
    BLOCK_PREVIEW_SLIDES[0]!;
  if (element.previewCaption) {
    return { ...base, caption: element.previewCaption };
  }
  return base;
}

export function defaultExpandedCategoriesForGroup(
  groupId: 'header' | 'template' | 'footer'
): Record<string, boolean> {
  if (groupId === 'footer') {
    return {
      banners: false,
      footer: true,
      forms: false,
      layout: false,
      products: false,
      storytelling: false,
      text: false,
      collections: false,
    };
  }
  if (groupId === 'template') {
    return {
      banners: true,
      collections: false,
      forms: true,
      layout: false,
      products: false,
      storytelling: false,
      text: false,
    };
  }
  return { layout: true };
}
