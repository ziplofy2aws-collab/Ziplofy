import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  CategoryBlock,
  SectionRow,
  type SectionCatalogEntry,
  type SectionCatalogIcon,
} from '../_shared/section-catalog-list';
import { BLOCK_PREVIEW_SLIDES } from '../_shared/section-preview-slides';
import {
  defaultExpandedCategoriesForGroup,
  defaultPreviewForElement,
} from '../_shared/section-preview-helpers';
import { SectionPreviewVisual } from '../_shared/SectionPreviewVisual';
import { CREATE_THEME_CATALOG_GROUPS } from '../catalog-groups';
import {
  createThemeGroupLabel,
  filterCreateThemeCatalogItems,
  listCreateThemeCatalogItems,
} from '../registry';
import type { CreateThemeCatalogGroup, CreateThemeCatalogListItem, CreateThemeElement } from '../types';

type Props = {
  open: boolean;
  groupId: CreateThemeCatalogGroup;
  groupLabel: string;
  onClose: () => void;
  onSelect: (elementId: string) => void;
};

function buildCatalogEntries(
  items: CreateThemeCatalogListItem[],
  groupId: CreateThemeCatalogGroup
): SectionCatalogEntry[] {
  const standalone: CreateThemeElement[] = [];
  const categories = new Map<string, { label: string; elements: CreateThemeElement[] }>();

  for (const item of items) {
    if (item.standalone || !item.categoryId) {
      standalone.push(item.element);
      continue;
    }
    const key = item.categoryId;
    if (!categories.has(key)) {
      categories.set(key, { label: item.categoryLabel ?? key, elements: [] });
    }
    categories.get(key)!.elements.push(item.element);
  }

  const groupDef = CREATE_THEME_CATALOG_GROUPS[groupId];
  const categoryOrder = groupDef?.categoryOrder ?? [...categories.keys()];

  const entries: SectionCatalogEntry[] = [];
  for (const element of standalone) {
    entries.push({ type: 'standalone', element });
  }
  for (const categoryId of categoryOrder) {
    const cat = categories.get(categoryId);
    if (!cat?.elements.length) continue;
    entries.push({ type: 'category', id: categoryId, label: cat.label, elements: cat.elements });
  }
  for (const [id, cat] of categories) {
    if (categoryOrder.includes(id)) continue;
    entries.push({ type: 'category', id, label: cat.label, elements: cat.elements });
  }
  return entries;
}

function catalogIconFor(element: CreateThemeElement): SectionCatalogIcon {
  const icon = element.catalogIcon;
  if (
    icon === 'marquee' ||
    icon === 'code' ||
    icon === 'divider' ||
    icon === 'hero' ||
    icon === 'slideshow' ||
    icon === 'collection' ||
    icon === 'link' ||
    icon === 'form' ||
    icon === 'blocks' ||
    icon === 'blog' ||
    icon === 'highlight' ||
    icon === 'text'
  ) {
    return icon;
  }
  return 'section';
}

export function CreateThemeAddSectionModal({ open, groupId, groupLabel, onClose, onSelect }: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() =>
    defaultExpandedCategoriesForGroup(groupId)
  );
  const [hovered, setHovered] = useState<CreateThemeElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const items = useMemo(() => {
    const all = listCreateThemeCatalogItems(groupId);
    return filterCreateThemeCatalogItems(all, search);
  }, [groupId, search]);

  const entries = useMemo(() => buildCatalogEntries(items, groupId), [items, groupId]);

  const activeSlide = useMemo(() => {
    if (hovered) return defaultPreviewForElement(hovered);
    return BLOCK_PREVIEW_SLIDES[slideIndex] ?? BLOCK_PREVIEW_SLIDES[0]!;
  }, [hovered, slideIndex]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setSlideIndex(0);
    const expanded = defaultExpandedCategoriesForGroup(groupId);
    setExpandedCats(expanded);
    let preview: CreateThemeElement | null = null;
    for (const entry of buildCatalogEntries(listCreateThemeCatalogItems(groupId))) {
      if (entry.type === 'category' && expanded[entry.id] && entry.elements[0]) {
        preview = entry.elements[0];
        break;
      }
      if (entry.type === 'standalone') {
        preview = entry.element;
        break;
      }
    }
    setHovered(preview);
  }, [open, groupId]);

  if (!open || !mounted) return null;

  const title = groupLabel || createThemeGroupLabel(groupId);

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] bg-black/20"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`absolute left-[min(calc(300px+12px),92vw)] top-[8%] flex w-[min(920px,calc(100vw-320px))] max-w-[920px] overflow-hidden rounded-2xl bg-[#f6f6f7] shadow-2xl ring-1 ring-black/10 ${
          groupId === 'footer' ? 'h-[min(640px,82vh)]' : 'h-[min(560px,80vh)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="create-theme-add-section-title"
      >
        <div className="flex h-full w-full">
          <div className="flex w-[min(100%,380px)] shrink-0 flex-col border-r border-[#e1e1e1] bg-[#f6f6f7]">
            <div className="space-y-3 border-b border-[#e1e1e1] p-3">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sections"
                  className="w-full rounded-lg border border-[#8c9196] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/25"
                  autoFocus
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
              <p id="create-theme-add-section-title" className="sr-only">
                Add section to {title}
              </p>
              {entries.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500">No sections match your search.</p>
              ) : (
                entries.map((entry) => {
                  if (entry.type === 'standalone') {
                    return (
                      <SectionRow
                        key={entry.element.id}
                        element={entry.element}
                        icon={catalogIconFor(entry.element)}
                        isActive={hovered?.id === entry.element.id}
                        onHover={() => setHovered(entry.element)}
                        onSelect={() => onSelect(entry.element.id)}
                      />
                    );
                  }
                  const isOpen = expandedCats[entry.id] === true;
                  return (
                    <CategoryBlock
                      key={entry.id}
                      entry={entry}
                      isOpen={isOpen}
                      hoveredId={hovered?.id}
                      iconForElement={catalogIconFor}
                      onToggle={() => {
                        const nextOpen = !isOpen;
                        setExpandedCats((prev) => ({ ...prev, [entry.id]: nextOpen }));
                        if (nextOpen && entry.elements[0]) {
                          setHovered(entry.elements[0]);
                          setSlideIndex(0);
                        }
                      }}
                      onHover={setHovered}
                      onSelect={(el) => onSelect(el.id)}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-[#f1f1f1] px-6 py-8">
            <div className="text-center">
              <p className="text-base text-gray-800">{activeSlide.headline}</p>
              <p className="mt-0.5 text-base font-semibold text-violet-700">{activeSlide.headlineAccent}</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-6">
              <SectionPreviewVisual variant={activeSlide.variant} />
              <p className="mt-5 text-center text-sm text-gray-600">{activeSlide.caption}</p>
            </div>
            <div className="flex justify-center gap-1.5 pb-2">
              {BLOCK_PREVIEW_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Preview slide ${i + 1}`}
                  onClick={() => {
                    setHovered(null);
                    setSlideIndex(i);
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    !hovered && slideIndex === i ? 'bg-gray-700' : 'bg-gray-400/60 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
