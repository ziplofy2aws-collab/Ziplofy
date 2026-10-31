import { CREATE_THEME_CATALOG_GROUPS } from '../catalog-groups';
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

/** Expand every category in the Add section popup by default. */
export function defaultExpandedCategoriesForGroup(
  groupId: 'header' | 'template' | 'footer'
): Record<string, boolean> {
  const group = CREATE_THEME_CATALOG_GROUPS[groupId];
  const expanded: Record<string, boolean> = {};
  for (const categoryId of group?.categoryOrder ?? []) {
    expanded[categoryId] = true;
  }
  for (const categoryId of Object.keys(group?.categories ?? {})) {
    expanded[categoryId] = true;
  }
  return expanded;
}
