import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FooterSectionPreviewArt } from '../../../create-theme/_shared/FooterSectionPreviewArt';
import {
  HeroDefaultPreviewArt,
  HeroLandscapeIllustration,
  HeroSceneFrame,
} from '../../../create-theme/_shared/HeroSectionPreviewArt';
import { LayeredSlideshowPreviewArt } from '../../../create-theme/_shared/LayeredSlideshowPreviewArt';
import { BLOCK_PREVIEW_SLIDES } from './add-block-catalog';
import {
  defaultExpandedCategoriesForGroup,
  defaultPreviewForSection,
  filterSectionCatalog,
  getSectionCatalogForGroup,
  type SectionCatalogEntry,
  type SectionCatalogGroup,
  type SectionCatalogIcon,
  type SectionCatalogItem,
} from './add-section-catalog';

const SHOPIFY_BLUE = '#005bd3';

function SectionCatalogIconView({ icon }: { icon: SectionCatalogIcon }) {
  const cls = 'h-[18px] w-[18px] shrink-0 text-gray-600';
  switch (icon) {
    case 'marquee':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3 10h14M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'code':
      return (
        <span className={`flex ${cls} items-center justify-center text-[11px] font-semibold`}>&lt;/&gt;</span>
      );
    case 'divider':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'hero':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 8.5h8M6 11.5h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'slideshow':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="9" rx="1" fill="#e5e7eb" stroke="currentColor" strokeWidth="1" />
          <path d="M5 8h4v3H5V8zm6 0h4v3h-4V8z" fill="#9ca3af" />
          <circle cx="6" cy="15" r="1" fill="currentColor" />
          <circle cx="10" cy="15" r="1" fill="currentColor" />
          <circle cx="14" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    case 'collection':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="3" y="12" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <rect x="11" y="12" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
    case 'link':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7.5 12.5a3 3 0 0 0 4.24 0l2.06-2.06a3 3 0 0 0-4.24-4.24L8.5 7.5M12.5 7.5a3 3 0 0 0-4.24 0L6.2 9.56a3 3 0 0 0 4.24 4.24l.82-.82"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'form':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'blocks':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 7.5h8M6 10h8M6 12.5h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'blog':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path
            d="M8 12.5l1.2-1.2 2.3 2.3L14 9.5M8 8.5h4"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'highlight':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 6h10" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" strokeLinecap="round" />
          <rect x="6" y="8.5" width="8" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5 14h10" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" strokeLinecap="round" />
        </svg>
      );
    case 'text':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" />
          <path d="M6 9h8M6 12h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
        </svg>
      );
  }
}

function SectionRow({
  item,
  indented,
  isActive,
  onHover,
  onSelect,
}: {
  item: SectionCatalogItem;
  indented?: boolean;
  isActive?: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-gray-800 ${
        isActive ? 'bg-[#ededed]' : 'hover:bg-[#ededed]'
      } ${indented ? 'pl-8 pr-2' : 'px-3 pr-2'}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
    >
      <SectionCatalogIconView icon={item.icon} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#005bd3] text-white shadow-sm transition-all duration-200 ease-out ${
          isActive
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-[0.82] opacity-0'
        }`}
        aria-hidden={!isActive}
      >
        <PlusIcon
          className={`h-4 w-4 stroke-[2.5] transition-transform duration-200 ease-out ${
            isActive ? 'scale-100' : 'scale-75'
          }`}
        />
      </span>
    </button>
  );
}

function CategoryBlock({
  entry,
  isOpen,
  hoveredId,
  onToggle,
  onHover,
  onSelect,
}: {
  entry: Extract<SectionCatalogEntry, { type: 'category' }>;
  isOpen: boolean;
  hoveredId?: string;
  onToggle: () => void;
  onHover: (item: SectionCatalogItem) => void;
  onSelect: (item: SectionCatalogItem) => void;
}) {
  if (!entry.items.length) return null;
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-[#ededed]/80"
      >
        {entry.label}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          {entry.items.map((item) => (
            <SectionRow
              key={item.id}
              item={item}
              indented
              isActive={hoveredId === item.id}
              onHover={() => onHover(item)}
              onSelect={() => onSelect(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideshowFullFrameScene({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <div className="relative aspect-[4/3] w-full bg-[#ddd6c8]">
        <HeroLandscapeIllustration />
        {children}
      </div>
    </div>
  );
}

function BentoCollectionTile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex min-h-[58px] flex-col overflow-hidden rounded-md bg-[#ececec] ${className ?? ''}`}
    >
      <div className="flex flex-1 items-center justify-center p-1.5">{children}</div>
      <p className="px-2 pb-1.5 text-[0.45rem] font-medium text-gray-800">Collection title</p>
    </div>
  );
}

function GridCollectionTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[88px] flex-col overflow-hidden rounded-md bg-[#ececec]">
      <p className="absolute left-2 top-2 z-10 text-[0.45rem] font-medium text-gray-800">Collection title</p>
      <div className="flex flex-1 items-center justify-center p-2 pt-5">{children}</div>
    </div>
  );
}

function CollectionCarouselTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[92px] shrink-0">
      <BentoCollectionTile>{children}</BentoCollectionTile>
    </div>
  );
}

function HangerShirtsMini() {
  return (
    <div className="flex items-end justify-center gap-1.5" aria-hidden>
      {(['#6b7280', '#c44d4d', '#4a9a9a'] as const).map((color, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="mb-0.5 h-0.5 w-5 rounded-full bg-gray-500" />
          <div className="h-9 w-6 rounded-t-sm shadow-sm" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
}

function HangingSweatersMini() {
  return (
    <div className="flex items-start justify-center gap-2 pt-0.5" aria-hidden>
      <div className="h-11 w-7 rounded-b-lg rounded-t-sm bg-[#9ca3af]" />
      <div className="h-11 w-7 rounded-b-lg rounded-t-sm bg-[#e8c547]" />
      <div className="h-11 w-7 rounded-b-lg rounded-t-sm bg-[#5ba8a8]" />
    </div>
  );
}

function ClothingRackMini({ wide = false }: { wide?: boolean }) {
  if (wide) {
    return (
      <div className="relative h-14 w-32" aria-hidden>
        <div className="absolute bottom-3 left-1 right-1 h-px bg-gray-600" />
        <div className="absolute bottom-3 left-1/2 h-9 w-px -translate-x-1/2 bg-gray-600" />
        <div className="absolute top-2 left-4 h-6 w-4 rounded-sm bg-[#d45454]" />
        <div className="absolute top-2 left-1/2 h-6 w-4 -translate-x-1/2 rounded-sm bg-[#e8c547]" />
        <div className="absolute top-2 right-4 h-6 w-4 rounded-sm bg-[#9ca3af]" />
        <div className="absolute right-1 top-3 h-7 w-2 rounded-full bg-[#5a9a6a]" />
        <div className="absolute bottom-0 left-6 h-3 w-5 rounded-sm bg-[#8b6914]" />
        <div className="absolute bottom-0 right-6 h-3 w-5 rounded-sm bg-[#8b6914]" />
      </div>
    );
  }
  return (
    <div className="relative h-12 w-14" aria-hidden>
      <div className="absolute bottom-2 left-0 right-0 h-px bg-gray-600" />
      <div className="absolute bottom-2 left-1/2 h-8 w-px -translate-x-1/2 bg-gray-600" />
      <div className="absolute top-1 left-1.5 h-5 w-3 rounded-sm bg-[#d45454]" />
      <div className="absolute top-1 left-1/2 h-5 w-3 -translate-x-1/2 rounded-sm bg-[#e8c547]" />
      <div className="absolute top-1 right-1.5 h-5 w-3 rounded-sm bg-[#9ca3af]" />
      <div className="absolute right-0 top-2 h-6 w-1.5 rounded-full bg-[#5a9a6a]" />
      <div className="absolute bottom-0 left-2.5 h-2 w-3.5 rounded-sm bg-[#8b6914]" />
      <div className="absolute bottom-0 right-2.5 h-2 w-3.5 rounded-sm bg-[#8b6914]" />
    </div>
  );
}

function ContactFormField({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className="relative rounded border border-gray-300 bg-white">
      <span className="absolute left-2 top-1 text-[0.42rem] text-gray-500">{label}</span>
      <div className={tall ? 'h-14' : 'h-8'} />
    </div>
  );
}

const FEATURED_PRODUCT_TILES: Array<{ shirtColor: string; withSun?: boolean }> = [
  { shirtColor: '#d45454' },
  { shirtColor: '#4a9a9a' },
  { shirtColor: '#4b5563', withSun: true },
  { shirtColor: '#e8a54b' },
];

function ProductCarouselCard({
  shirtColor,
  withSun = false,
  className,
  size = 'md',
}: {
  shirtColor: string;
  withSun?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const shirtClass =
    size === 'sm' ? 'h-9 w-7' : size === 'lg' ? 'h-14 w-11' : 'h-11 w-9';
  return (
    <div className={className ?? 'w-[74px] shrink-0'}>
      <div className="relative flex aspect-square items-center justify-center rounded-md bg-[#f4f4f4]">
        <div
          className={`relative overflow-hidden rounded-t-lg shadow-sm ${shirtClass}`}
          style={{ backgroundColor: shirtColor }}
        >
          <div className="absolute left-0 right-0 top-0 h-2 bg-black/10" />
          {withSun ? (
            <div className="absolute right-0.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden />
          ) : null}
        </div>
      </div>
      <p className="mt-1.5 text-center text-[0.5rem] font-medium leading-tight text-gray-900">Product title</p>
      <p className="text-center text-[0.48rem] text-gray-600">Rs. 19.99</p>
    </div>
  );
}

type BlogPostIllustrationVariant = 'thread' | 'sewing' | 'boxes';

function BlogPostIllustration({ variant }: { variant: BlogPostIllustrationVariant }) {
  if (variant === 'thread') {
    return (
      <div className="flex items-end justify-center gap-1.5" aria-hidden>
        <div className="h-10 w-3 rounded-full bg-[#e8c547]" />
        <div className="h-12 w-3.5 rounded-full bg-[#d45454]" />
        <div className="h-9 w-3 rounded-full bg-[#4a9a9a]" />
      </div>
    );
  }
  if (variant === 'sewing') {
    return (
      <div className="relative h-12 w-14" aria-hidden>
        <div className="absolute bottom-0 left-1/2 h-7 w-10 -translate-x-1/2 rounded-sm bg-[#6b7280]" />
        <div className="absolute bottom-6 left-1/2 h-2 w-12 -translate-x-1/2 rounded-sm bg-[#4b5563]" />
        <div className="absolute bottom-7 right-1 h-4 w-4 rounded-full bg-[#9ca3af]" />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-12" aria-hidden>
      <div className="absolute bottom-0 left-0 h-5 w-6 rounded-sm bg-[#c4a574]" />
      <div className="absolute bottom-1 left-4 h-6 w-7 rounded-sm bg-[#a88b5c]" />
      <div className="absolute bottom-0 right-0 h-4 w-5 rounded-sm bg-[#8b6914]" />
    </div>
  );
}

function BlogPostCard({
  variant,
  className,
}: {
  variant: BlogPostIllustrationVariant;
  className?: string;
}) {
  return (
    <div className={className ?? 'w-[100px] shrink-0'}>
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-[#f0f0f0] p-2">
        <BlogPostIllustration variant={variant} />
      </div>
      <p className="mt-2 text-[0.5rem] font-bold leading-tight text-gray-900">Title</p>
      <p className="text-[0.45rem] text-gray-500">Date | Author</p>
      <p className="mt-1 text-[0.42rem] leading-snug text-gray-600">
        An excerpt of your blog post&apos;s content
      </p>
    </div>
  );
}

function ProductHotspotDot({ className }: { className?: string }) {
  return (
    <span
      className={`absolute z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-white/25 shadow-[0_0_0_1px_rgba(0,0,0,0.08)] ${className ?? ''}`}
      aria-hidden
    />
  );
}

function TealFoldedShirtIllustration() {
  return (
    <div className="relative h-12 w-11" aria-hidden>
      <div
        className="absolute inset-x-0 bottom-0 top-2 rounded-sm bg-[#4a9a9a] shadow-sm"
        style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}
      />
    </div>
  );
}

function StorytellingCarouselSlide({ title }: { title: string }) {
  return (
    <div className="w-[108px] shrink-0">
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-[#f0f0f0]">
        <TealFoldedShirtIllustration />
      </div>
      <p className="mt-2 text-[0.52rem] font-bold leading-tight text-gray-900">{title}</p>
      <p className="mt-0.5 text-[0.42rem] leading-snug text-gray-600">
        Made with care and unconditionally loved by our customers.
      </p>
    </div>
  );
}

function StackedTealShirtsIllustration() {
  return (
    <div className="relative h-[88px] w-[100px]" aria-hidden>
      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          className="absolute left-1/2 rounded-sm bg-[#4a9a9a] shadow-md"
          style={{
            width: `${72 - layer * 8}%`,
            height: `${22 - layer * 2}px`,
            bottom: `${layer * 18}px`,
            transform: `translateX(-50%) rotate(${-6 + layer * 4}deg) skewX(-8deg)`,
            clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
            opacity: 1 - layer * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function FoldedShirtsMini() {
  return (
    <div className="relative h-[52px] w-[64px]" aria-hidden>
      <div
        className="absolute left-[4%] top-[18%] h-[38px] w-[28px] -rotate-[8deg] rounded-sm bg-[#5a9a6a] shadow-sm"
        style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)' }}
      />
      <div
        className="absolute left-[28%] top-[10%] h-[40px] w-[28px] rotate-[4deg] rounded-sm bg-[#e8c547] shadow-sm"
        style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)' }}
      />
      <div
        className="absolute right-[2%] top-[22%] h-[36px] w-[26px] rotate-[10deg] rounded-sm bg-[#d45454] shadow-sm"
        style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)' }}
      />
    </div>
  );
}

function PreviewVisual({
  variant,
}: {
  variant:
    | 'before-after'
    | 'product-card'
    | 'featured-collection-carousel'
    | 'featured-collection-editorial'
    | 'featured-collection-grid'
    | 'featured-product'
    | 'product-highlight'
    | 'product-hotspots'
    | 'recommended-products'
    | 'blog-posts-carousel'
    | 'blog-posts-editorial'
    | 'blog-posts-grid'
    | 'storytelling-carousel'
    | 'storytelling-editorial'
    | 'storytelling-editorial-jumbo'
    | 'image-compare'
    | 'image-with-text'
    | 'storytelling-video'
    | 'storytelling-logo'
    | 'faq'
    | 'icons-with-text'
    | 'text-marquee'
    | 'multicolumn'
    | 'pull-quote'
    | 'rich-text'
    | 'footer-section'
    | 'policies-links'
    | 'text-block'
    | 'newsletter'
    | 'contact-form'
    | 'custom-section'
    | 'announcement-bar'
    | 'divider'
    | 'hero'
    | 'hero-bottom-aligned'
    | 'hero-marquee'
    | 'large-logo'
    | 'layered-slideshow'
    | 'slideshow-full-frame'
    | 'slideshow-inset'
    | 'split-showcase'
    | 'collection-links-spotlight'
    | 'collection-links-text'
    | 'collection-list-bento'
    | 'collection-list-carousel'
    | 'collection-list-editorial'
    | 'collection-list-grid';
}) {
  if (variant === 'collection-list-grid') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-semibold text-gray-900">Shop by collection</h4>
        <div className="grid grid-cols-3 gap-2">
          <GridCollectionTile>
            <FoldedShirtsMini />
          </GridCollectionTile>
          <GridCollectionTile>
            <HangerShirtsMini />
          </GridCollectionTile>
          <GridCollectionTile>
            <HangingSweatersMini />
          </GridCollectionTile>
        </div>
      </div>
    );
  }
  if (variant === 'collection-list-editorial') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-semibold text-gray-900">Shop by collection</h4>
        <div className="grid grid-cols-[0.85fr_1.25fr] gap-2">
          <BentoCollectionTile className="min-h-[66px]">
            <FoldedShirtsMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="min-h-[66px]">
            <HangerShirtsMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="col-span-2 min-h-[54px]">
            <HangingSweatersMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="col-span-2 min-h-[58px]">
            <ClothingRackMini wide />
          </BentoCollectionTile>
        </div>
      </div>
    );
  }
  if (variant === 'collection-list-carousel') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-semibold text-gray-900">Shop by collection</h4>
        <div className="-mx-1 flex gap-2 overflow-hidden px-1">
          <CollectionCarouselTile>
            <FoldedShirtsMini />
          </CollectionCarouselTile>
          <CollectionCarouselTile>
            <HangerShirtsMini />
          </CollectionCarouselTile>
          <CollectionCarouselTile>
            <HangingSweatersMini />
          </CollectionCarouselTile>
          <div className="w-[48px] shrink-0 overflow-hidden">
            <div className="w-[92px]">
              <BentoCollectionTile>
                <div className="relative h-12 w-8" aria-hidden>
                  <div className="absolute bottom-0 left-1/2 h-8 w-px -translate-x-1/2 bg-gray-600" />
                  <div className="absolute top-1 left-1/2 h-7 w-6 -translate-x-1/2 rounded-sm bg-[#d45454]" />
                </div>
              </BentoCollectionTile>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'collection-list-bento') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-[0.72rem] font-semibold text-gray-900">Shop by collection</h4>
        <div className="grid grid-cols-3 grid-rows-2 gap-2">
          <BentoCollectionTile className="col-span-1">
            <FoldedShirtsMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="col-span-2">
            <HangerShirtsMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="col-span-2">
            <HangingSweatersMini />
          </BentoCollectionTile>
          <BentoCollectionTile className="col-span-1">
            <ClothingRackMini />
          </BentoCollectionTile>
        </div>
      </div>
    );
  }
  if (variant === 'collection-links-text') {
    return (
      <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-sm border border-white bg-white px-6 py-7 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {Array.from({ length: 4 }, (_, i) => (
            <p key={i} className="text-[0.75rem] font-medium leading-tight text-gray-900">
              Collection title <sup className="ml-0.5 text-[0.5rem] font-normal text-gray-500">5</sup>
            </p>
          ))}
        </div>
      </div>
    );
  }
  if (variant === 'collection-links-spotlight') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-sm border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex min-h-[184px]">
          <div className="flex w-[48%] flex-col justify-center gap-3 border-r border-gray-100 px-4 py-5">
            {Array.from({ length: 4 }, (_, i) => (
              <p key={i} className="text-[0.72rem] font-medium leading-tight text-gray-900">
                Collection title <sup className="ml-0.5 text-[0.5rem] font-normal text-gray-500">5</sup>
              </p>
            ))}
          </div>
          <div className="relative flex w-[52%] items-center justify-center bg-[#ececec] px-3">
            <div className="relative h-[96px] w-[118px]" aria-hidden>
              <div
                className="absolute left-[6%] top-[20%] h-[68px] w-[50px] -rotate-[8deg] rounded-sm bg-[#5a9a6a] shadow-sm"
                style={{
                  clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
                }}
              />
              <div
                className="absolute left-[30%] top-[12%] h-[72px] w-[52px] rotate-[4deg] rounded-sm bg-[#e8c547] shadow-sm"
                style={{
                  clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
                }}
              />
              <div
                className="absolute right-[4%] top-[24%] h-[66px] w-[48px] rotate-[10deg] rounded-sm bg-[#d45454] shadow-sm"
                style={{
                  clipPath: 'polygon(12% 0%, 88% 0%, 100% 32%, 100% 100%, 0% 100%, 0% 32%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'split-showcase') {
    const tile = (title: string, bgClass: string) => (
      <div className={`relative flex min-h-[200px] w-1/2 flex-col overflow-hidden ${bgClass}`}>
        <div className="absolute inset-0 bg-black/25" aria-hidden />
        <div className="relative z-10 flex flex-1 flex-col px-3 pb-3 pt-4">
          <div className="flex flex-1 items-center justify-center">
            <h3 className="text-center text-[0.82rem] font-bold leading-tight text-white drop-shadow-md">
              {title}
            </h3>
          </div>
          <div className="flex justify-center pb-1">
            <span className="text-[0.52rem] font-medium text-white underline decoration-white/90 underline-offset-2">
              Shop now
            </span>
          </div>
        </div>
      </div>
    );
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-sm border border-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex">
          {tile('New arrivals', 'bg-[#4a7fc4]')}
          {tile('Bestsellers', 'bg-[#e76f51]')}
        </div>
      </div>
    );
  }
  if (variant === 'slideshow-inset') {
    return (
      <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-xl bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="relative aspect-[5/3] w-full overflow-hidden rounded-lg bg-[#ddd6c8]">
          <HeroLandscapeIllustration />
        </div>
        <div className="px-2 pb-1 pt-4 text-center">
          <h3 className="text-[1rem] font-bold leading-tight tracking-tight text-gray-900">New arrivals</h3>
          <p className="mx-auto mt-2 max-w-[14.5rem] text-[0.54rem] leading-snug text-gray-600">
            Introducing our latest products, made especially for the season. Shop your favorites before
            they&apos;re gone!
          </p>
          <span className="mt-3.5 inline-flex rounded-full bg-gray-900 px-4 py-1.5 text-[0.62rem] font-medium text-white">
            Shop now
          </span>
        </div>
      </div>
    );
  }
  if (variant === 'slideshow-full-frame') {
    return (
      <SlideshowFullFrameScene>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pt-2 text-center">
          <h3 className="text-[1.15rem] font-bold leading-tight tracking-tight text-white drop-shadow-sm">
            New arrivals
          </h3>
          <p className="mt-2 max-w-[15.5rem] text-[0.58rem] leading-snug text-white/95">
            Introducing our latest products, made especially for the season. Shop your favorites before
            they&apos;re gone!
          </p>
          <span className="mt-3.5 inline-flex rounded-full bg-white px-4 py-1.5 text-[0.62rem] font-medium text-gray-900 shadow-sm">
            Shop now
          </span>
        </div>
        <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
        </div>
      </SlideshowFullFrameScene>
    );
  }
  if (variant === 'layered-slideshow') {
    return <LayeredSlideshowPreviewArt size="modal" />;
  }
  if (variant === 'large-logo') {
    return (
      <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-sm border border-white/95 bg-[#f0f1ed] shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="relative flex min-h-[220px] flex-col px-5 pb-8 pt-5">
          <p className="max-w-[9.5rem] text-left text-[0.5rem] leading-[1.45] text-gray-800">
            Made with care and unconditionally loved by our customers, this signature bestseller exceeds
            all expectations.
          </p>
          <p className="mt-auto text-center text-[2.85rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-black">
            My Store
          </p>
        </div>
      </div>
    );
  }
  if (variant === 'hero-marquee') {
    return (
      <HeroSceneFrame>
        <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
          <div
            className="flex w-max whitespace-nowrap text-[1.35rem] font-bold leading-none tracking-tight text-white drop-shadow-md"
            style={{ animation: 'add-section-marquee 14s linear infinite' }}
          >
            <span className="px-4">Explore our latest products. Explore our latest products.&nbsp;</span>
            <span className="px-4" aria-hidden>
              Explore our latest products. Explore our latest products.&nbsp;
            </span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[14%] flex justify-center">
          <span className="rounded-full bg-white px-5 py-2 text-xs font-medium text-gray-900 shadow-md">
            Shop now
          </span>
        </div>
        <style>{`
          @keyframes add-section-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </HeroSceneFrame>
    );
  }
  if (variant === 'hero-bottom-aligned') {
    return (
      <HeroSceneFrame>
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-6 pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 shrink-0 text-left">
              <p className="text-[0.65rem] italic text-white/95">Introducing</p>
              <h3 className="mt-1 text-[1.65rem] font-normal leading-tight tracking-tight text-white drop-shadow-sm">
                New arrivals
              </h3>
            </div>
            <p className="max-w-[9.5rem] text-right text-[0.6rem] leading-snug text-white/95">
              We make things that work better and last longer. Our products solve real problems with clean
              design and honest materials.
            </p>
          </div>
        </div>
      </HeroSceneFrame>
    );
  }
  if (variant === 'hero') {
    return <HeroDefaultPreviewArt size="modal" />;
  }
  if (variant === 'announcement-bar') {
    return (
      <div className="mx-auto w-full max-w-[520px] px-4">
        <div className="flex items-center justify-center rounded-lg bg-[#4a8fe8] px-5 py-3 shadow-md ring-1 ring-[#3a7fd4]/30">
          <p className="text-center text-sm font-medium leading-snug text-white">
            Shop our latest arrivals!
          </p>
        </div>
      </div>
    );
  }
  if (variant === 'divider') {
    return (
      <div className="mx-auto w-full max-w-[420px] rounded-sm border border-[#e5e7eb] bg-[#f6f6f7] px-6 py-10">
        <div className="flex w-full items-center justify-center">
          <div className="h-px w-full max-w-[360px] bg-[#d1d5db]" role="presentation" />
        </div>
      </div>
    );
  }
  if (variant === 'before-after') {
    return (
      <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl bg-[#e8e4df] shadow-md">
        <div className="flex h-[200px] items-stretch">
          <div className="flex-1 bg-gradient-to-br from-sky-200 to-amber-100" />
          <div className="relative w-1 shrink-0 bg-white shadow">
            <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow">
              <span className="text-xs text-gray-500">⇆</span>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-orange-200 to-rose-200" />
        </div>
      </div>
    );
  }
  if (variant === 'custom-section') {
    return (
      <div
        className="mx-auto min-h-[220px] w-full max-w-[420px] rounded-sm border border-white bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        role="presentation"
      />
    );
  }
  if (variant === 'contact-form') {
    return (
      <div className="mx-auto w-full max-w-[340px] rounded-lg border border-[#e1e1e1] bg-[#f0f4f8] px-6 py-6 shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <h3 className="mb-4 text-center text-[0.9rem] font-bold text-gray-900">Contact us</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <ContactFormField label="Name" />
            <ContactFormField label="Email" />
          </div>
          <ContactFormField label="Phone" />
          <ContactFormField label="Comment" tall />
          <div className="pt-1">
            <span className="inline-flex rounded bg-gray-900 px-4 py-1.5 text-[0.62rem] font-medium text-white">
              Submit
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'newsletter') {
    return (
      <div className="mx-auto w-full max-w-[360px] rounded-lg border border-[#e5e7eb] bg-[#f6f6f7] px-8 py-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <h3 className="text-[0.95rem] font-bold text-gray-900">Subscribe to our emails</h3>
        <p className="mx-auto mt-2 max-w-[16rem] text-[0.58rem] leading-snug text-gray-600">
          Be the first to know about new collections and special offers.
        </p>
        <div className="relative mx-auto mt-5 max-w-[260px]">
          <div className="flex h-9 items-center rounded-full border border-gray-300 bg-white pl-4 pr-1">
            <span className="text-[0.58rem] text-gray-400">Email address</span>
            <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-700">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M4 10h12M12 6l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'featured-collection-editorial') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-semibold text-gray-900">Featured products</h4>
        <div className="grid grid-cols-3 gap-2">
          <ProductCarouselCard
            className="w-full min-w-0"
            shirtColor={FEATURED_PRODUCT_TILES[0].shirtColor}
            size="sm"
          />
          <div className="col-span-2">
            <ProductCarouselCard
              className="w-full min-w-0"
              shirtColor={FEATURED_PRODUCT_TILES[1].shirtColor}
              size="lg"
            />
          </div>
          <div className="col-span-2">
            <ProductCarouselCard
              className="w-full min-w-0"
              shirtColor={FEATURED_PRODUCT_TILES[2].shirtColor}
              withSun={FEATURED_PRODUCT_TILES[2].withSun}
              size="lg"
            />
          </div>
          <ProductCarouselCard
            className="w-full min-w-0"
            shirtColor={FEATURED_PRODUCT_TILES[3].shirtColor}
            size="sm"
          />
        </div>
      </div>
    );
  }
  if (variant === 'featured-collection-carousel') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-semibold text-gray-900">Featured products</h4>
        <div className="-mx-1 flex gap-2.5 overflow-hidden px-1">
          <ProductCarouselCard shirtColor="#e8a54b" />
          <ProductCarouselCard shirtColor="#4a9a9a" />
          <ProductCarouselCard shirtColor="#4b5563" withSun />
          <ProductCarouselCard shirtColor="#d45454" />
          <div className="w-6 shrink-0" aria-hidden />
        </div>
      </div>
    );
  }
  if (variant === 'footer-section') {
    return <FooterSectionPreviewArt size="modal" />;
  }
  if (variant === 'policies-links') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] items-center justify-between gap-4 overflow-hidden rounded-lg border border-[#e1e1e1] bg-[#f6f6f7] px-5 py-4 shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <span className="shrink-0 text-[0.5rem] text-gray-600">© 2026 My Store, Powered by Ziplofy</span>
        <span className="shrink-0 text-[0.5rem] text-gray-700">Terms and Policies</span>
      </div>
    );
  }
  if (variant === 'multicolumn') {
    const columns = [
      {
        title: 'Intentional design',
        body: 'We create with intention. Our products solve real problems with clean design and honest materials.',
      },
      {
        title: 'Quality first',
        body: 'We obsess over the details and strive to deliver the best products at the best prices, every time.',
      },
      {
        title: 'Customer care',
        body: "We're always on your side: keeping our loyal customers happy is our top priority and number one goal.",
      },
    ];
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white px-4 py-5 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-3 gap-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[0.52rem] font-bold leading-tight text-gray-900">{col.title}</p>
              <p className="mt-1.5 text-[0.42rem] leading-snug text-gray-600">{col.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (variant === 'pull-quote') {
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white px-6 py-7 text-center shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <p className="text-[0.58rem] font-bold leading-snug text-gray-900">
          At the heart of every product lies a unique story, driven by our passion for quality and
          innovation. Each item enhances your everyday life and sparks joy.
        </p>
        <span className="mt-3 inline-block text-[0.48rem] font-medium text-gray-900 underline">
          Shop now
        </span>
      </div>
    );
  }
  if (variant === 'rich-text') {
    return (
      <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-lg border border-white bg-white px-6 py-7 text-center shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h3 className="text-[0.85rem] font-bold text-gray-900">New arrivals</h3>
        <p className="mx-auto mt-2 max-w-[16rem] text-[0.5rem] leading-snug text-gray-600">
          We make things that work better and last longer. Our products solve real problems with clean
          design and honest materials.
        </p>
        <span className="mt-4 inline-flex rounded-full bg-gray-900 px-4 py-1.5 text-[0.55rem] font-medium text-white">
          Shop now
        </span>
      </div>
    );
  }
  if (variant === 'faq') {
    const faqItems = [
      'What is the return policy?',
      'Are any purchases final sale?',
      'When will I get my order?',
      'Where are your products manufactured?',
      'How much does shipping cost?',
    ];
    return (
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-white bg-white px-5 py-5 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h3 className="text-[0.78rem] font-bold text-gray-900">Frequently asked questions</h3>
        <ul className="mt-3 space-y-0 border-t border-gray-200">
          {faqItems.map((q) => (
            <li
              key={q}
              className="flex items-center justify-between border-b border-gray-200 py-2 text-[0.5rem] text-gray-900"
            >
              <span>{q}</span>
              <span className="text-[0.55rem] text-gray-500" aria-hidden>
                ⌄
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (variant === 'icons-with-text') {
    const columns = [
      { icon: 'eye', title: 'Intentional design' },
      { icon: 'heart', title: 'Made with care' },
      { icon: 'person', title: 'A team with a goal' },
    ] as const;
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white px-4 py-5 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-3 gap-3">
          {columns.map((col) => (
            <div key={col.title} className="text-center">
              <div className="mx-auto mb-2 flex h-6 w-6 items-center justify-center text-gray-700">
                {col.icon === 'eye' ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M10 4C5 4 2 10 2 10s3 6 8 6 8-6 8-6-3-6-8-6Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                ) : col.icon === 'heart' ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M10 17s-6-4-6-8a3.5 3.5 0 0 1 6-2 3.5 3.5 0 0 1 6 2c0 4-6 8-6 8Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <circle cx="10" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <path
                      d="M5 16c0-3 2.2-5 5-5s5 2 5 5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <p className="text-[0.52rem] font-bold text-gray-900">{col.title}</p>
              <p className="mt-1 text-[0.42rem] leading-snug text-gray-500">
                We make things that work better and last longer.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (variant === 'text-marquee') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white py-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="overflow-hidden">
          <div
            className="flex w-max whitespace-nowrap text-[0.62rem] font-medium text-gray-900"
            style={{ animation: 'add-section-text-marquee 16s linear infinite' }}
          >
            <span className="px-6">
              We make things that work better and last longer. We make things that work better and
              last longer.&nbsp;
            </span>
            <span className="px-6" aria-hidden>
              We make things that work better and last longer. We make things that work better and
              last longer.&nbsp;
            </span>
          </div>
        </div>
        <style>{`
          @keyframes add-section-text-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    );
  }
  if (variant === 'image-compare') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex w-[48%] flex-col justify-center px-4 py-5">
          <h3 className="text-[0.8rem] font-bold leading-tight text-gray-900">Find your perfect fit</h3>
          <p className="mt-1.5 text-[0.48rem] leading-snug text-gray-700">Discover the best of both worlds</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-gray-900 px-2.5 py-1 text-[0.48rem] font-medium text-gray-900">
              View all
            </span>
            <span className="rounded-full border border-gray-900 px-2.5 py-1 text-[0.48rem] font-medium text-gray-900">
              Shop now
            </span>
          </div>
        </div>
        <div className="relative flex w-[52%] items-center justify-center bg-[#f4f4f4] p-3">
          <div className="relative h-[100px] w-[88px] overflow-hidden rounded-md" aria-hidden>
            <div className="absolute inset-0 w-1/2 bg-[#e76f51]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[#4a9a9a]" />
            <div className="absolute left-1/2 top-0 flex h-full w-5 -translate-x-1/2 flex-col items-center justify-center bg-white shadow-md">
              <span className="text-[0.45rem] text-gray-500">⇆</span>
            </div>
            <div className="absolute left-[18%] top-[28%] h-12 w-10 rounded-t-lg bg-[#d45454]/80" />
            <div className="absolute right-[16%] top-[28%] h-12 w-10 rounded-t-lg bg-[#3d8b8b]/80" />
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-logo') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] items-center justify-center overflow-hidden rounded-lg border border-[#d8d8d8] bg-[#f6f6f7] py-12 shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <p className="text-[1.85rem] font-bold tracking-tight text-gray-900">My Store</p>
      </div>
    );
  }
  if (variant === 'image-with-text') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex w-[46%] shrink-0 items-center justify-center bg-[#f0f0f0] py-5">
          <StackedTealShirtsIllustration />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-5">
          <h3 className="text-[0.8rem] font-bold leading-tight text-gray-900">Our signature product</h3>
          <p className="mt-2 text-[0.48rem] leading-snug text-gray-700">
            Made with care and unconditionally loved by our customers, this signature bestseller exceeds all
            expectations.
          </p>
          <span className="mt-3 inline-flex w-fit rounded-full bg-gray-900 px-3.5 py-1.5 text-[0.55rem] font-medium text-white">
            Shop now
          </span>
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-video') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-[#f6f6f7] shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="relative min-h-[140px] w-full">
          <div
            className="absolute bottom-0 right-0 top-0 flex w-[68%] items-center justify-center bg-[#ececec]"
            style={{ clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }}
          >
            <div className="flex items-end justify-center gap-1.5" aria-hidden>
              <div className="h-9 w-7 rounded-t-md bg-[#e8c547]" />
              <div className="relative h-10 w-8 rounded-t-md bg-[#4a9a9a]">
                <div className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f5d76e] to-[#c45c4a]" />
              </div>
              <div className="h-8 w-6 rounded-t-md bg-[#8b6914]" />
            </div>
            <div className="absolute left-[12%] top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow">
              <span className="ml-0.5 text-[0.45rem] text-gray-800">▶</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 px-3 py-2.5">
          <p className="max-w-[58%] text-[0.42rem] leading-snug text-gray-700">
            Take a look behind the scenes of our latest product launch.
          </p>
          <p className="text-right text-[0.42rem] font-medium text-gray-900">Discover the collection</p>
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-carousel') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-bold text-gray-900">Discover elevated design</h4>
        <div className="-mx-1 flex gap-2 overflow-hidden px-1">
          <StorytellingCarouselSlide title="Artistry in action" />
          <StorytellingCarouselSlide title="Uncompromising quality" />
          <StorytellingCarouselSlide title="Made to last" />
          <div className="w-6 shrink-0" aria-hidden />
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-editorial') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex w-1/2 items-center justify-center bg-[#f0f0f0] py-6">
          <TealFoldedShirtIllustration />
        </div>
        <div className="flex w-1/2 flex-col justify-center bg-[#e8f0f5] px-4 py-5">
          <span className="inline-flex w-fit rounded-sm bg-white/90 px-1.5 py-0.5 text-[0.42rem] font-medium text-gray-800">
            Bestseller
          </span>
          <h3 className="mt-2 text-[0.85rem] font-bold leading-tight text-gray-900">Our signature product</h3>
          <p className="mt-1.5 text-[0.48rem] leading-snug text-gray-700">
            Made with care and unconditionally loved by our customers, this signature bestseller exceeds all
            expectations.
          </p>
          <span className="mt-2.5 text-[0.48rem] font-medium text-gray-900 underline">Shop now</span>
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-editorial-jumbo') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] min-h-[130px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex w-[52%] items-center justify-end bg-[#fafafa] px-5 py-4">
          <p className="text-right text-[1.1rem] font-bold uppercase leading-[0.95] tracking-tight text-gray-900">
            <span className="block">UP</span>
            <span className="block">THE</span>
            <span className="block">ANTE</span>
          </p>
        </div>
        <div className="flex w-[48%] items-center justify-center bg-[#ececec] py-4">
          <StackedTealShirtsIllustration />
        </div>
      </div>
    );
  }
  if (variant === 'blog-posts-carousel') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-bold text-gray-900">Blog posts</h4>
        <div className="-mx-1 flex gap-2 overflow-hidden px-1">
          <div className="w-5 shrink-0 overflow-hidden opacity-60">
            <div className="w-[100px]">
              <BlogPostCard variant="thread" />
            </div>
          </div>
          <BlogPostCard variant="sewing" />
          <BlogPostCard variant="thread" />
          <BlogPostCard variant="boxes" />
          <div className="w-5 shrink-0" aria-hidden />
        </div>
      </div>
    );
  }
  if (variant === 'blog-posts-editorial') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-bold text-gray-900">Blog posts</h4>
        <div className="grid grid-cols-2 gap-2">
          <BlogPostCard variant="thread" className="w-full min-w-0" />
          <BlogPostCard variant="sewing" className="w-full min-w-0" />
        </div>
        <div className="mt-2">
          <BlogPostCard variant="boxes" className="w-full min-w-0" />
        </div>
      </div>
    );
  }
  if (variant === 'blog-posts-grid') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-bold text-gray-900">Blog posts</h4>
        <div className="grid grid-cols-3 gap-2">
          <BlogPostCard variant="sewing" className="w-full min-w-0" />
          <BlogPostCard variant="thread" className="w-full min-w-0" />
          <BlogPostCard variant="boxes" className="w-full min-w-0" />
        </div>
      </div>
    );
  }
  if (variant === 'recommended-products') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.72rem] font-bold text-gray-900">Related products</h4>
        <div className="grid grid-cols-4 gap-2">
          <ProductCarouselCard className="w-full min-w-0" shirtColor="#d45454" size="sm" />
          <ProductCarouselCard className="w-full min-w-0" shirtColor="#5a9a6a" size="sm" />
          <ProductCarouselCard className="w-full min-w-0" shirtColor="#4b5563" withSun size="sm" />
          <ProductCarouselCard className="w-full min-w-0" shirtColor="#d45454" size="sm" />
        </div>
      </div>
    );
  }
  if (variant === 'product-hotspots') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-2 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="overflow-hidden rounded-md [&>div]:shadow-none">
          <HeroSceneFrame>
            <p className="absolute left-3 top-3 z-10 text-[0.55rem] font-bold text-white drop-shadow-sm">
              Shop the look
            </p>
            <ProductHotspotDot className="left-1/2 top-[10%] -translate-x-1/2" />
            <ProductHotspotDot className="left-[22%] top-[38%]" />
            <ProductHotspotDot className="left-[58%] top-[55%]" />
            <ProductHotspotDot className="left-[35%] top-[50%]" />
            <ProductHotspotDot className="right-[24%] top-[48%]" />
          </HeroSceneFrame>
        </div>
      </div>
    );
  }
  if (variant === 'product-highlight') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <div className="flex w-1/2 shrink-0 items-center justify-center bg-[#ececec] py-8">
          <StackedTealShirtsIllustration />
        </div>
        <div className="flex w-1/2 flex-col bg-[#f7f5f0] px-4 py-5">
          <div className="flex w-full items-start justify-between gap-2">
            <p className="text-[0.62rem] font-normal text-gray-900">Product title</p>
            <p className="shrink-0 text-[0.58rem] text-gray-900">Rs. 19.99</p>
          </div>
          <div className="relative mx-auto mt-4 h-16 w-14" aria-hidden>
            <div className="absolute inset-x-0 bottom-0 top-2 rounded-t-lg bg-[#d45454] shadow-sm">
              <div className="absolute inset-x-1 top-0 h-2 rounded-b-sm bg-[#e8c547]" />
              <div className="absolute left-0 top-[28%] h-[42%] w-0.5 bg-[#e8c547]/90" />
              <div className="absolute right-0 top-[28%] h-[42%] w-0.5 bg-[#e8c547]/90" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'featured-product') {
    return (
      <div className="relative mx-auto flex w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <div className="flex aspect-square w-[46%] shrink-0 items-center justify-center bg-[#f4f4f4]">
          <div className="relative h-[72px] w-[60px]" aria-hidden>
            <div className="absolute inset-x-0 bottom-0 top-4 rounded-t-xl bg-[#d45454] shadow-sm">
              <div className="absolute inset-x-2 top-0 h-2.5 rounded-b-sm bg-[#e8c547]" />
              <div className="absolute left-0 top-[28%] h-[45%] w-1 bg-[#e8c547]/90" />
              <div className="absolute right-0 top-[28%] h-[45%] w-1 bg-[#e8c547]/90" />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-5">
          <p className="text-[0.65rem] font-normal text-gray-900">Product title</p>
          <p className="mt-2 text-[0.6rem] text-gray-900">Rs. 19.99</p>
          <p className="mt-0.5 text-[0.48rem] text-gray-500">Taxes included.</p>
          <div className="mt-2 flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-[0.5rem] leading-none ${i < 4 ? 'text-gray-900' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
            <span className="ml-1 text-[0.48rem] text-gray-600">3 reviews</span>
          </div>
          <span className="mt-4 flex w-full items-center justify-center rounded-full bg-gray-600 py-2 text-[0.58rem] font-medium text-white">
            Sold out
          </span>
        </div>
      </div>
    );
  }
  if (variant === 'featured-collection-grid') {
    return (
      <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-white bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.1)]">
        <h4 className="mb-3 text-left text-[0.8rem] font-bold text-gray-900">Products</h4>
        <div className="grid grid-cols-4 gap-x-1.5">
          {FEATURED_PRODUCT_TILES.map((tile, i) => (
            <ProductCarouselCard
              key={i}
              className="w-full min-w-0"
              shirtColor={tile.shirtColor}
              withSun={tile.withSun}
              size="sm"
            />
          ))}
        </div>
      </div>
    );
  }
  if (variant === 'product-card') {
    return (
      <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3 shadow-lg">
        <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <p className="text-sm font-semibold text-gray-900">Featured products</p>
        <p className="text-sm text-gray-600">From your catalog</p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md">
      <p className="text-lg font-semibold text-gray-900">Section preview</p>
      <p className="mt-2 text-sm text-gray-500">Add this section to your page.</p>
    </div>
  );
}

export type AddSectionModalProps = {
  open: boolean;
  groupId: SectionCatalogGroup;
  groupLabel: string;
  onClose: () => void;
  onSelectSection: (section: SectionCatalogItem) => void;
};

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  open,
  groupId,
  groupLabel,
  onClose,
  onSelectSection,
}) => {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() =>
    defaultExpandedCategoriesForGroup(groupId)
  );
  const [hovered, setHovered] = useState<SectionCatalogItem | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const baseCatalog = useMemo(() => getSectionCatalogForGroup(groupId), [groupId]);
  const { entries } = useMemo(() => filterSectionCatalog(baseCatalog, search), [baseCatalog, search]);

  const activeSlide = useMemo(() => {
    if (hovered) return defaultPreviewForSection(hovered);
    return BLOCK_PREVIEW_SLIDES[slideIndex] ?? BLOCK_PREVIEW_SLIDES[0];
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
    if (open) {
      setSearch('');
      setSlideIndex(0);
      const expanded = defaultExpandedCategoriesForGroup(groupId);
      setExpandedCats(expanded);
      let previewItem: SectionCatalogItem | null = null;
      for (const entry of getSectionCatalogForGroup(groupId)) {
        if (entry.type === 'category' && expanded[entry.id] && entry.items[0]) {
          previewItem = entry.items[0];
          break;
        }
        if (entry.type === 'standalone') {
          previewItem = entry.item;
          break;
        }
      }
      setHovered(previewItem);
    }
  }, [open, groupId]);

  if (!open || !mounted) return null;

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
        aria-modal="true"
        aria-labelledby="add-section-modal-title"
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
              <p id="add-section-modal-title" className="sr-only">
                Add section to {groupLabel}
              </p>
              {entries.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500">No sections match your search.</p>
              ) : (
                entries.map((entry) => {
                  if (entry.type === 'standalone') {
                    return (
                      <SectionRow
                        key={entry.item.id}
                        item={entry.item}
                        isActive={hovered?.id === entry.item.id}
                        onHover={() => setHovered(entry.item)}
                        onSelect={() => onSelectSection(entry.item)}
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
                      onToggle={() => {
                        const nextOpen = !isOpen;
                        setExpandedCats((prev) => ({ ...prev, [entry.id]: nextOpen }));
                        if (nextOpen && entry.items[0]) {
                          setHovered(entry.items[0]);
                          setSlideIndex(0);
                        }
                      }}
                      onHover={setHovered}
                      onSelect={onSelectSection}
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
              <PreviewVisual variant={activeSlide.variant} />
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
};

export default AddSectionModal;
