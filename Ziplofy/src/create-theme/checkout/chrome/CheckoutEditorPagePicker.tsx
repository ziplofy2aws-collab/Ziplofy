import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CubeIcon,
  KeyIcon,
  ShoppingCartIcon,
  UserIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import '../../chrome/create-theme-page-picker.css';
import {
  CHECKOUT_EDITOR_PAGE_MENU,
  findCheckoutEditorPageItem,
  type CheckoutEditorPage,
  type CheckoutEditorPageIcon,
} from '../checkout-editor-page-menu';

type Props = {
  value: CheckoutEditorPage;
  onChange: (page: CheckoutEditorPage) => void;
  onOnlineStoreTheme?: () => void;
};

function PageIcon({ icon, className }: { icon: CheckoutEditorPageIcon; className?: string }) {
  const cls = className ?? 'h-[18px] w-[18px] shrink-0 text-gray-700';
  switch (icon) {
    case 'checkout':
      return <ShoppingCartIcon className={cls} />;
    case 'thank-you':
      return <CheckCircleIcon className={cls} />;
    case 'sign-in':
      return <KeyIcon className={cls} />;
    case 'signup':
      return <UserPlusIcon className={cls} />;
    case 'orders':
      return <CubeIcon className={cls} />;
    case 'order-status':
      return <ClockIcon className={cls} />;
    case 'profile':
      return <UserIcon className={cls} />;
    case 'online-store':
      return <BuildingStorefrontIcon className={cls} />;
    default:
      return <ShoppingCartIcon className={cls} />;
  }
}

function CheckoutEditorPagePickerInner({ value, onChange, onOnlineStoreTheme }: Props) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = findCheckoutEditorPageItem(value);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 300;
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2 - width / 2,
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const selectPage = useCallback(
    (page: CheckoutEditorPage) => {
      onChange(page);
      setOpen(false);
    },
    [onChange]
  );

  const menu =
    open && menuPos
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[1400] cursor-default bg-transparent"
              aria-label="Close checkout page menu"
              onClick={() => setOpen(false)}
            />
            <div
              className="create-theme-page-picker-menu fixed z-[1410] overflow-hidden rounded-[12px] border border-[#e3e3e3] bg-white"
              style={{
                top: menuPos.top,
                left: Math.max(8, Math.min(menuPos.left, window.innerWidth - menuPos.width - 8)),
                width: menuPos.width,
              }}
              role="listbox"
              aria-label="Checkout pages"
            >
              <div className="create-theme-page-picker-list max-h-[min(420px,55vh)] overflow-y-auto py-1.5">
                {CHECKOUT_EDITOR_PAGE_MENU.map((group) => (
                  <div key={group.id} className="px-2 pb-1">
                    <p className="px-2 pb-1 pt-2 text-[12px] font-semibold text-gray-500">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const isSelected = item.pageId === value;
                      return (
                        <button
                          key={item.pageId}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`mb-0.5 flex w-full items-center gap-2 rounded-[8px] border px-2 py-[7px] text-left text-[13px] transition-colors ${
                            isSelected
                              ? 'border-[#007ace] bg-[#f0f7ff] font-medium text-gray-900'
                              : 'border-transparent text-gray-800 hover:bg-[#f1f1f1]'
                          }`}
                          onClick={() => selectPage(item.pageId)}
                        >
                          <PageIcon icon={item.icon} />
                          <span className="min-w-0 flex-1 truncate leading-snug">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}

                <div className="mx-3 my-1 border-t border-[#e8e8e8]" role="separator" />

                <div className="px-2 pb-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[8px] border border-transparent px-2 py-[7px] text-left text-[13px] text-gray-800 transition-colors hover:bg-[#f1f1f1]"
                    onClick={() => {
                      setOpen(false);
                      onOnlineStoreTheme?.();
                    }}
                  >
                    <PageIcon icon="online-store" />
                    <span className="min-w-0 flex-1 truncate leading-snug">Online store theme</span>
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[200px] max-w-[min(92vw,280px)] items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <PageIcon icon={current.icon} className="h-[18px] w-[18px] shrink-0 text-gray-800" />
        <span className="truncate">{current.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {menu}
    </>
  );
}

export const CheckoutEditorPagePicker = memo(CheckoutEditorPagePickerInner);
export default CheckoutEditorPagePicker;
