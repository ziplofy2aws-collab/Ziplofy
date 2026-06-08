import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FooterSectionPreviewArt } from '../../../create-theme/_shared/FooterSectionPreviewArt';
import { HeroDefaultPreviewArt } from '../../../create-theme/_shared/HeroSectionPreviewArt';
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CursorArrowRaysIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import {
  BLOCK_CATALOG_CATEGORIES_SHOPIFY,
  BLOCK_PREVIEW_SLIDES,
  blocksForSection,
  filterBlockCatalog,
  getCatalogSections,
  type BlockCatalogIcon,
  type BlockCatalogItem,
  type BlockPreviewSlide,
  type CatalogSection,
} from './add-block-catalog';
import {
  filterBlocksForSection,
  getThemeCatalogSections,
  resolveNestedAddBlockAllowlist,
  resolveSectionTypeForAddBlock,
  themeCatalogToBlockItems,
  usesShopifyFullBlockPicker,
  type ThemeBlockCatalogApi,
} from './theme-block-catalog.adapter';

const SHOPIFY_BLUE = '#005bd3';

function DashedSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 2" />
    </svg>
  );
}

function CatalogIcon({ icon }: { icon: BlockCatalogIcon }) {
  const cls = 'h-[18px] w-[18px] shrink-0 text-gray-600';
  switch (icon) {
    case 'button':
      return <CursorArrowRaysIcon className={cls} />;
    case 'text':
    case 'jumbo':
      return <Bars3Icon className={cls} />;
    case 'title':
      return (
        <span className={`flex ${cls} items-center justify-center text-[13px] font-semibold leading-none`}>T</span>
      );
    case 'logo':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      );
    case 'link':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M8.5 11.5l3-3M10.5 7.5a2.12 2.12 0 013 3l-2 2M9.5 12.5a2.12 2.12 0 01-3-3l2-2"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'price':
    case 'product-card':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M6 4h8l1 2H5l1-2zm0 4v6a1 1 0 001 1h6a1 1 0 001-1V8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          {icon === 'price' ? (
            <text x="10" y="13" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="600">
              $
            </text>
          ) : null}
        </svg>
      );
    case 'variant-picker':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M12 9h4M14 7v4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'marquee':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3 10h14M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      );
    case 'group':
      return <Squares2X2Icon className={cls} />;
    case 'spacer':
      return <ViewColumnsIcon className={cls} />;
    case 'form':
      return <EnvelopeIcon className={cls} />;
    case 'code':
      return (
        <span className={`flex ${cls} items-center justify-center text-[11px] font-semibold leading-none`}>
          {'</>'}
        </span>
      );
    case 'image':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="7.5" cy="8.5" r="1.25" fill="currentColor" />
          <path d="M3 14l4-3 3 2 4-4 3 3" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );
    case 'placeholder':
      return <DashedSquareIcon className={cls} />;
    default:
      return <DashedSquareIcon className={cls} />;
  }
}

function BlockRow({
  block,
  selected,
  onHover,
  onSelect,
}: {
  block: BlockCatalogItem;
  selected?: boolean;
  onHover?: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-gray-800 hover:bg-[#ededed] ${
        selected ? 'bg-[#dcdcdc] font-medium' : ''
      }`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onSelect}
    >
      <CatalogIcon icon={block.icon} />
      {block.label}
    </button>
  );
}

function CategorySection({
  section,
  items,
  isOpen,
  onToggle,
  onHoverBlock,
  onSelectBlock,
  selectedBlockId,
}: {
  section: Extract<CatalogSection, { type: 'category' }>;
  items: BlockCatalogItem[];
  isOpen: boolean;
  onToggle: () => void;
  onHoverBlock?: (block: BlockCatalogItem) => void;
  onSelectBlock: (block: BlockCatalogItem) => void;
  selectedBlockId?: string;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-gray-800"
      >
        {section.label}
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen
        ? items.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              selected={selectedBlockId === block.id}
              onHover={onHoverBlock ? () => onHoverBlock(block) : undefined}
              onSelect={() => onSelectBlock(block)}
            />
          ))
        : null}
    </div>
  );
}

function ContactFormField({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      className={`rounded-md border border-[#d4d8dd] bg-white px-3 py-2 text-[0.62rem] text-gray-400 ${
        tall ? 'h-16' : 'h-8'
      }`}
    >
      {label}
    </div>
  );
}

function PreviewVisual({ variant }: { variant: BlockPreviewSlide['variant'] }) {
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
  if (variant === 'product-card') {
    return (
      <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-3 shadow-lg">
        <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <p className="text-sm font-semibold text-gray-900">Shirt</p>
        <p className="text-sm text-gray-600">$19.99</p>
      </div>
    );
  }
  if (variant === 'text-marquee') {
    return (
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="whitespace-nowrap bg-black px-4 py-3 text-sm font-semibold tracking-wide text-white">
          <span className="mr-8 inline-block">NEW ARRIVALS</span>
          <span className="mr-8 inline-block">LIMITED DROP</span>
          <span className="inline-block">FREE SHIPPING</span>
        </div>
      </div>
    );
  }
  if (variant === 'storytelling-logo') {
    return (
      <div className="mx-auto flex w-full max-w-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-white py-10 shadow-md">
        <span className="text-5xl font-black tracking-tight text-gray-900">My Store</span>
      </div>
    );
  }
  if (variant === 'storytelling-video') {
    return (
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-xl text-gray-900">
              ▶
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'image-with-text') {
    return (
      <div className="mx-auto grid w-full max-w-[380px] grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="aspect-[4/5] bg-gradient-to-br from-blue-200 to-violet-200" />
        <div className="flex flex-col justify-center p-4">
          <p className="text-sm font-semibold text-gray-900">Image block</p>
          <p className="mt-1 text-xs text-gray-600">Add media to hero.</p>
        </div>
      </div>
    );
  }
  if (variant === 'icons-with-text') {
    return (
      <div className="mx-auto w-full max-w-[340px] rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">★</span>
          <p className="text-sm font-medium text-gray-800">Trusted by 10k+ customers</p>
        </div>
      </div>
    );
  }
  if (variant === 'icon-only') {
    return (
      <div className="mx-auto flex w-full max-w-[360px] items-center justify-center py-10">
        <svg className="h-11 w-11 text-gray-700" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10.8 3.4H16a1 1 0 011 1v5.2a1 1 0 01-.3.7l-7.2 7.2a1 1 0 01-1.4 0L2.8 12.2a1 1 0 010-1.4l7.2-7.2a1 1 0 01.8-.2z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <circle cx="14.3" cy="5.8" r="1.2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </div>
    );
  }
  if (variant === 'heading-only') {
    return (
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-center py-16">
        <p className="text-[76px] font-bold tracking-tight text-[#2e2f33]">New arrivals</p>
      </div>
    );
  }
  if (variant === 'image-only') {
    return (
      <div className="mx-auto w-full max-w-[460px] rounded-sm bg-[#d7d8d9] p-8">
        <div className="relative mx-auto h-[330px] w-[330px] rounded-[26%] bg-[#d4d2d4]">
          <div
            className="absolute left-1/2 top-[56%] h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-[42deg] rounded-[18%]"
            style={{ background: 'linear-gradient(145deg,#1f7a83,#3fb4b5)' }}
          />
          <div
            className="absolute left-1/2 top-[50%] h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-[42deg] rounded-[18%]"
            style={{ background: 'linear-gradient(145deg,#2a8f98,#58bebd)' }}
          />
          <div
            className="absolute left-1/2 top-[44%] h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rotate-[42deg] rounded-[18%]"
            style={{ background: 'linear-gradient(145deg,#379fa1,#65c9c4)' }}
          />
          <div
            className="absolute left-[31%] top-[33%] h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle at 40% 40%, #1f8b8f 0%, #2f9fa0 60%, transparent 61%)' }}
          />
          <div className="absolute left-[31%] top-[33%] h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eef2f3]" />
          <div className="absolute left-[60%] top-[42%] h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-[30%] bg-[#3aa7a7]" />
        </div>
      </div>
    );
  }
  if (variant === 'logo-only') {
    return (
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-center py-16">
        <p className="text-[76px] font-black tracking-tight text-black">My Store</p>
      </div>
    );
  }
  if (variant === 'button-only') {
    return (
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-center py-16">
        <button className="rounded-3xl bg-black px-8 py-4 text-[34px] font-medium text-white">Shop now</button>
      </div>
    );
  }
  if (variant === 'page-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] flex-col items-center justify-center py-16 text-center">
        <p className="text-[76px] font-bold tracking-tight text-[#2e2f33]">Page title</p>
        <p className="mt-4 text-[40px] font-normal text-[#3f4247]">Select a page to display its content.</p>
      </div>
    );
  }
  if (variant === 'text-only') {
    return (
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center py-16">
        <p className="max-w-[420px] text-[14px] leading-6 text-[#4a4d52]">
          We make things that work better and last longer. Our products solve real problems with clean design and
          honest materials.
        </p>
      </div>
    );
  }
  if (variant === 'video-only') {
    return (
      <div className="mx-auto w-full max-w-[520px] py-10">
        <div className="relative mx-auto h-[210px] w-[420px] overflow-hidden rounded-sm bg-[#d9d9db]">
          <div className="absolute inset-y-0 left-0 w-[58%] bg-[#e2e2e3]" />
          <div className="absolute right-8 top-7 h-[86px] w-[86px] rotate-[-22deg] rounded-[22%] bg-[#e7b353]" />
          <div className="absolute right-20 top-12 h-[98px] w-[98px] rotate-[21deg] rounded-[22%] bg-[#59b9b7]" />
          <div className="absolute right-2 top-14 h-[92px] w-[92px] rotate-[18deg] rounded-[22%] bg-[#b45c46]" />
          <div className="absolute left-1/2 top-1/2 z-10 flex h-13 w-13 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/95 shadow">
            <span className="ml-0.5 text-xl leading-none text-[#7e838a]">▶</span>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'collection-card-only') {
    return (
      <div className="mx-auto w-full max-w-[520px] py-8">
        <div className="mx-auto w-[430px]">
          <div className="flex h-[330px] items-center justify-center rounded-sm bg-[#dedede]">
            <div className="relative h-[220px] w-[280px]">
              <div className="absolute left-1/2 top-1/2 h-[180px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-[20%] bg-[#e2b057]" />
              <div className="absolute left-[20px] top-[52px] h-[190px] w-[140px] rotate-[-20deg] rounded-[22%] bg-[#2d9c7f]" />
              <div className="absolute right-[18px] top-[58px] h-[186px] w-[136px] rotate-[24deg] rounded-[22%] bg-[#de6b59]" />
            </div>
          </div>
          <p className="mt-3 text-[42px] font-semibold tracking-tight text-[#2f3338]">Collection title</p>
        </div>
      </div>
    );
  }
  if (variant === 'collection-title-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-center py-20">
        <p className="text-[46px] font-normal tracking-tight text-[#2f3338]">Collection title</p>
      </div>
    );
  }
  if (variant === 'comparison-slider-only') {
    return (
      <div className="mx-auto w-full max-w-[520px] py-10">
        <div className="relative mx-auto h-[220px] w-[430px] overflow-hidden rounded-sm bg-[#d8d8da]">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#e7e7e8]" />
          <div className="absolute inset-y-0 left-1/2 w-[6px] -translate-x-1/2 bg-white/90" />
          <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
            <span className="text-[28px] leading-none text-[#5a5f66]">‹ ›</span>
          </div>
          <div className="absolute left-[44%] top-[56%] h-[118px] w-[86px] -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] rounded-[20%] bg-[#df6e59]" />
          <div className="absolute left-[58%] top-[56%] h-[118px] w-[86px] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] rounded-[20%] bg-[#2f9f8e]" />
        </div>
      </div>
    );
  }
  if (variant === 'jumbo-text-only') {
    return (
      <div className="mx-auto flex w-full max-w-[540px] items-center justify-center py-20">
        <p className="text-[112px] font-black tracking-tight text-black">Be bold.</p>
      </div>
    );
  }
  if (variant === 'copyright-only') {
    return (
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center py-20 text-center">
        <p className="text-[42px] font-normal text-[#3a3d42]">© 2026 My Store, Powered by Ziplofy</p>
      </div>
    );
  }
  if (variant === 'policy-links-only') {
    return (
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center py-20 text-center">
        <p className="text-[44px] font-normal text-[#3a3d42]">Terms and Policies</p>
      </div>
    );
  }
  if (variant === 'accordion-only') {
    return (
      <div className="mx-auto w-full max-w-[560px] py-14">
        <div className="mx-auto w-[460px] text-[11px] text-[#555a60]">
          <div className="border-b border-[#d4d7db] py-2">Return policy</div>
          <div className="border-b border-[#d4d7db] py-2">
            Our goal is for every customer to be totally satisfied with their purchase.
          </div>
          <div className="border-b border-[#d4d7db] py-2">Shipping</div>
          <div className="border-b border-[#d4d7db] py-2">Manufacturing</div>
        </div>
      </div>
    );
  }
  if (variant === 'menu-only') {
    return (
      <div className="mx-auto w-full max-w-[520px] py-16">
        <div className="mx-auto w-[280px] text-left">
          <p className="text-[66px] font-bold tracking-tight text-[#2e3237]">Main menu</p>
          <p className="mt-5 text-[40px] text-[#35393f]">Home</p>
          <p className="mt-3 text-[40px] text-[#35393f]">Catalog</p>
          <p className="mt-3 text-[40px] text-[#35393f]">Contact</p>
        </div>
      </div>
    );
  }
  if (variant === 'buy-buttons-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-center py-16">
        <button className="rounded-3xl bg-[#7d7f83] px-10 py-5 text-[42px] font-medium text-white">Sold out</button>
      </div>
    );
  }
  if (variant === 'price-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-center py-16">
        <p className="text-[46px] font-normal text-[#32363c]">Rs. 19.99</p>
      </div>
    );
  }
  if (variant === 'inventory-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-center py-16">
        <div className="flex items-center gap-3 text-[#34383d]">
          <span className="inline-block h-6 w-6 rounded-full border-2 border-[#c8ccd1]" />
          <span className="text-[44px]">Out of stock</span>
        </div>
      </div>
    );
  }
  if (variant === 'recommended-only') {
    return (
      <div className="mx-auto w-full max-w-[620px] py-14">
        <div className="mx-auto w-[560px]">
          <p className="mb-2 text-[36px] font-semibold text-[#2e3237]">You may also like</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-[110px] rounded-sm bg-[#ececed]" />
            <div className="h-[110px] rounded-sm bg-[#ececed]" />
            <div className="h-[110px] rounded-sm bg-[#ececed]" />
            <div className="h-[110px] rounded-sm bg-[#ececed]" />
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'review-stars-only') {
    return (
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-center py-16">
        <p className="text-[40px] text-[#30343a]">★★★★☆ 3 reviews</p>
      </div>
    );
  }
  if (variant === 'special-instructions-only') {
    return (
      <div className="mx-auto w-full max-w-[560px] py-12">
        <div className="mx-auto w-[320px]">
          <p className="text-[42px] text-[#2f3338]">Customize your product</p>
          <div className="mt-4 rounded-md bg-[#dfdfe1] p-4 text-[#3a3e43]">
            <p className="text-[34px]">Enter your special instructions</p>
            <p className="mt-6 text-[38px] italic">0/100 characters used</p>
          </div>
        </div>
      </div>
    );
  }
  if (variant === 'title-only') {
    return (
      <div className="mx-auto flex w-full max-w-[520px] items-center justify-center py-16">
        <p className="text-[46px] text-[#33383d]">Product title</p>
      </div>
    );
  }
  if (variant === 'multicolumn') {
    return (
      <div className="mx-auto w-full max-w-[340px] rounded-2xl border border-gray-200 bg-white p-4 shadow-md">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 rounded-md bg-gray-100" />
          <div className="h-16 rounded-md bg-gray-100" />
          <div className="h-16 rounded-md bg-gray-100" />
        </div>
      </div>
    );
  }
  if (variant === 'hero') {
    return <HeroDefaultPreviewArt size="modal" />;
  }
  if (variant === 'featured-product') {
    return (
      <div className="mx-auto flex w-full max-w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="aspect-square w-[42%] bg-gradient-to-br from-red-200 to-orange-200" />
        <div className="flex flex-1 flex-col justify-center p-4">
          <p className="text-sm font-medium text-gray-900">Product title</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Rs. 19.99</p>
          <span className="mt-3 inline-flex w-fit rounded-full bg-gray-700 px-3 py-1 text-xs text-white">
            Sold out
          </span>
        </div>
      </div>
    );
  }
  if (variant === 'footer-section') {
    return <FooterSectionPreviewArt size="modal" />;
  }
  if (variant === 'policies-links') {
    return (
      <div className="mx-auto w-full max-w-[360px] rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
        <p className="text-base font-semibold text-gray-900">© 2026 My Store, Powered by Ziplofy</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Refunds</span>
        </div>
      </div>
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
      <div className="mx-auto w-full max-w-[320px] rounded-lg border border-[#e5e7eb] bg-[#f6f6f7] px-6 py-6 shadow-[0_2px_14px_rgba(0,0,0,0.08)]">
        <div className="flex h-9 w-full items-center rounded-full border border-gray-300 bg-white pl-4 pr-1">
          <span className="text-[0.58rem] text-gray-400">Email address</span>
          <span className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center text-gray-700">
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
    );
  }
  if (variant === 'custom-section') {
    return (
      <div className="mx-auto w-full max-w-[340px] rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-md">
        <p className="text-sm font-medium text-gray-700">Custom content block</p>
      </div>
    );
  }
  if (variant === 'announcement-bar') {
    return (
      <div className="mx-auto w-full max-w-[380px] rounded-xl bg-black px-4 py-2 text-center text-sm font-medium text-white shadow-md">
        Free shipping on orders over $50
      </div>
    );
  }
  if (variant === 'divider') {
    return (
      <div className="mx-auto w-full max-w-[380px] py-6">
        <div className="h-px w-full bg-gray-400" />
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md">
      <p className="text-lg font-semibold text-gray-900">Heading</p>
      <p className="mt-2 text-sm text-gray-500">Add compelling copy to your section.</p>
    </div>
  );
}

function previewSlideForBlock(block: BlockCatalogItem): BlockPreviewSlide | null {
  const normalizedId = block.id.toLowerCase().replace(/_/g, '-').trim();
  const idMap: Record<string, BlockPreviewSlide['variant']> = {
    button: 'button-only',
    heading: 'heading-only',
    logo: 'logo-only',
    text: 'text-only',
    image: 'image-only',
    video: 'video-only',
    icon: 'icon-only',
    page: 'page-only',
    'collection-card': 'collection-card-only',
    'collection-title': 'collection-title-only',
    'custom-liquid': 'custom-section',
    'image-compare': 'comparison-slider-only',
    'jumbo-text': 'jumbo-text-only',
    marquee: 'text-marquee',
    announcement: 'announcement-bar',
    copyright: 'copyright-only',
    'follow-on-shop': 'footer-section',
    'payment-icons': 'footer-section',
    'policy-links': 'policy-links-only',
    social: 'footer-section',
    'contact-form': 'contact-form',
    'email-signup': 'newsletter',
    accordion: 'accordion-only',
    group: 'multicolumn',
    spacer: 'multicolumn',
    menu: 'menu-only',
    'popup-link': 'rich-text',
    'buy-buttons': 'buy-buttons-only',
    description: 'text-block',
    price: 'price-only',
    'product-card': 'product-card',
    'product-inventory': 'inventory-only',
    'recommended-products': 'recommended-only',
    'review-stars': 'review-stars-only',
    sku: 'featured-product',
    'special-instructions': 'special-instructions-only',
    swatches: 'featured-product',
    title: 'title-only',
    'variant-picker': 'product-card',
  };
  const variant = idMap[block.id] ?? idMap[normalizedId];
  if (!variant) return null;
  return {
    id: `block-${block.id}`,
    headline: `${block.label} block`,
    headlineAccent: 'Preview',
    caption: `Add ${block.label.toLowerCase()} to this section.`,
    variant,
  };
}

export type AddBlockModalProps = {
  open: boolean;
  sectionLabel?: string;
  /** Theme-specific block list from S3 pack (schema + default-config + manifest). */
  themeBlockCatalog?: ThemeBlockCatalogApi | null;
  editorSchema?: { templates?: Array<{ sections?: Array<{ id?: string; type?: string }> }> } | null;
  addBlockNodeId?: string;
  onClose: () => void;
  onSelectBlock: (block: BlockCatalogItem) => void;
};

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  open,
  sectionLabel,
  themeBlockCatalog,
  editorSchema,
  addBlockNodeId,
  onClose,
  onSelectBlock,
}) => {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    basic: true,
    collection: true,
    custom: true,
    decorative: true,
    footer: true,
    forms: true,
    layout: true,
    links: true,
    product: true,
  });
  const [hoveredBlock, setHoveredBlock] = useState<BlockCatalogItem | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockCatalogItem | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const sectionType = useMemo(
    () =>
      addBlockNodeId ? resolveSectionTypeForAddBlock(editorSchema ?? null, addBlockNodeId) : undefined,
    [addBlockNodeId, editorSchema]
  );
  const shopifyFullPicker = usesShopifyFullBlockPicker(sectionType);

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
      setShowAll(shopifyFullPicker);
      setSlideIndex(0);
      setHoveredBlock(null);
      setSelectedBlock(null);
      if (shopifyFullPicker) {
        setExpandedCats(
          Object.fromEntries(BLOCK_CATALOG_CATEGORIES_SHOPIFY.map((c) => [c.id, true])) as Record<
            string,
            boolean
          >
        );
      }
    }
  }, [open, shopifyFullPicker]);

  const searching = search.trim().length > 0;
  const effectiveShowAll = showAll || searching || shopifyFullPicker;

  const usesThemeCatalog = Boolean(themeBlockCatalog?.blocks?.length) && !shopifyFullPicker;

  const filtered = useMemo(() => {
    if (shopifyFullPicker) {
      return filterBlockCatalog(search, true);
    }
    if (usesThemeCatalog && themeBlockCatalog) {
      let items = themeCatalogToBlockItems(themeBlockCatalog);
      if (!effectiveShowAll) items = items.filter((b) => !b.extendedOnly);
      const q = search.trim().toLowerCase();
      if (q) {
        items = items.filter(
          (b) =>
            b.label.toLowerCase().includes(q) ||
            b.category.includes(q) ||
            b.keywords?.some((k) => k.includes(q))
        );
      }
      if (addBlockNodeId) {
        const nestedAllow = resolveNestedAddBlockAllowlist(addBlockNodeId);
        if (nestedAllow) {
          const set = new Set(nestedAllow);
          items = items.filter((b) => set.has(b.id));
        } else {
          const st = resolveSectionTypeForAddBlock(editorSchema ?? null, addBlockNodeId);
          items = filterBlocksForSection(themeBlockCatalog, st, items);
          if (st === 'faq') {
            items = items.filter((b) => b.id !== 'accordion-row');
          }
        }
      }
      return items;
    }
    return filterBlockCatalog(search, effectiveShowAll);
  }, [
    shopifyFullPicker,
    usesThemeCatalog,
    themeBlockCatalog,
    search,
    effectiveShowAll,
    addBlockNodeId,
    editorSchema,
  ]);

  const sections = useMemo(() => {
    if (shopifyFullPicker) {
      return getCatalogSections(effectiveShowAll, search, { shopifyFull: true });
    }
    if (usesThemeCatalog && themeBlockCatalog) {
      return getThemeCatalogSections(themeBlockCatalog, effectiveShowAll, search);
    }
    return getCatalogSections(effectiveShowAll, search);
  }, [shopifyFullPicker, usesThemeCatalog, themeBlockCatalog, effectiveShowAll, search]);

  const previewBlock = selectedBlock ?? hoveredBlock;

  const activeSlide = useMemo(() => {
    if (previewBlock) {
      const mapped = previewSlideForBlock(previewBlock);
      if (mapped) return mapped;
      const idx = BLOCK_PREVIEW_SLIDES.findIndex((s) => s.id === previewBlock.id);
      if (idx >= 0) return BLOCK_PREVIEW_SLIDES[idx];
      if (previewBlock.category === 'basic' || previewBlock.category === 'links') {
        return BLOCK_PREVIEW_SLIDES[2];
      }
      if (previewBlock.category === 'decorative') return BLOCK_PREVIEW_SLIDES[0];
      if (previewBlock.category === 'product') return BLOCK_PREVIEW_SLIDES[1];
      return BLOCK_PREVIEW_SLIDES[1];
    }
    return BLOCK_PREVIEW_SLIDES[slideIndex] ?? BLOCK_PREVIEW_SLIDES[0];
  }, [previewBlock, slideIndex]);

  useEffect(() => {
    if (!open || selectedBlock || !filtered.length) return;
    if (filtered.length === 1) {
      setSelectedBlock(filtered[0]);
    }
  }, [open, filtered, selectedBlock]);

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!open || !mounted) return null;

  const handleRowClick = (block: BlockCatalogItem) => {
    if (selectedBlock?.id === block.id) {
      onSelectBlock(block);
      return;
    }
    setSelectedBlock(block);
    setHoveredBlock(null);
  };

  const handleAddSelected = () => {
    if (selectedBlock) onSelectBlock(selectedBlock);
  };

  const listPanel = (
    <>
      <div className={`border-b border-[#e1e1e1] ${shopifyFullPicker ? 'p-2.5' : 'p-3'}`}>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks"
            className="w-full rounded-lg border border-[#8c9196] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm outline-none focus:border-[#005bd3] focus:ring-2 focus:ring-[#005bd3]/25"
            autoFocus
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
        <p id="add-block-modal-title" className="sr-only">
          Add block{sectionLabel ? ` to ${sectionLabel}` : ''}
        </p>
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-500">No blocks match your search</p>
        ) : (
          <>
            {sections.map((section) => {
              if (section.type === 'standalone') {
                const items = blocksForSection(section, filtered);
                if (!items.length) return null;
                return (
                  <div key={section.item.id} className="mb-1">
                    {items.map((block) => (
                      <BlockRow
                        key={block.id}
                        block={block}
                        selected={selectedBlock?.id === block.id}
                        onHover={() => setHoveredBlock(block)}
                        onSelect={() => handleRowClick(block)}
                      />
                    ))}
                  </div>
                );
              }
              const items = blocksForSection(section, filtered);
              const catId = section.id;
              const isCatOpen = expandedCats[catId] !== false;
              return (
                <CategorySection
                  key={catId}
                  section={section}
                  items={items}
                  isOpen={isCatOpen}
                  onToggle={() => toggleCat(catId)}
                  onHoverBlock={setHoveredBlock}
                  onSelectBlock={handleRowClick}
                  selectedBlockId={selectedBlock?.id}
                />
              );
            })}
            {!shopifyFullPicker && !searching && filtered.some((b) => b.extendedOnly) ? (
              <button
                type="button"
                className="mt-2 w-full px-3 py-2 text-left text-sm font-medium hover:underline"
                style={{ color: SHOPIFY_BLUE }}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? 'Show less' : 'Show all'}
              </button>
            ) : null}
          </>
        )}
      </div>
    </>
  );

  if (filtered.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/25 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-[min(520px,88vh)] w-full max-w-[920px] overflow-hidden rounded-2xl bg-[#f6f6f7] shadow-2xl ring-1 ring-black/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-block-modal-title"
      >
        <div className="flex w-[min(100%,380px)] shrink-0 flex-col border-r border-[#e1e1e1] bg-[#f6f6f7]">
          {listPanel}
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f1f1f1] px-6 py-8">
          <div className="text-center">
            <p className="text-base text-gray-800">{activeSlide.headline}</p>
            <p className="mt-0.5 text-base font-semibold text-violet-700">{activeSlide.headlineAccent}</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <PreviewVisual variant={activeSlide.variant} />
            <p className="mt-5 text-center text-sm text-gray-600">{activeSlide.caption}</p>
            {selectedBlock ? (
              <button
                type="button"
                className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: SHOPIFY_BLUE }}
                onClick={handleAddSelected}
              >
                Add {selectedBlock.label}
              </button>
            ) : null}
          </div>
          {!previewBlock ? (
            <div className="flex justify-center gap-1.5 pb-2">
              {BLOCK_PREVIEW_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Preview slide ${i + 1}`}
                  onClick={() => {
                    setHoveredBlock(null);
                    setSelectedBlock(null);
                    setSlideIndex(i);
                  }}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    slideIndex === i ? 'bg-gray-700' : 'bg-gray-400/60 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddBlockModal;
