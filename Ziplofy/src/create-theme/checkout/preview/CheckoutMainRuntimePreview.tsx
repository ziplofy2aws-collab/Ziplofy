import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { isColorDark } from '../settings/checkout-color.utils';
import type { CheckoutTypographyTheme } from '../settings/checkout-typography-fonts';

type FieldChrome = {
  boxClass: string;
  labelClass: string;
  valueClass: string;
  iconClass: string;
  checkboxClass: string;
  headingClass: string;
  bodyMutedClass: string;
  suggestionsClass: string;
  suggestionItemClass: string;
  suggestionActiveClass: string;
};

function buildFieldChrome(transparent: boolean): FieldChrome {
  if (!transparent) {
    return {
      boxClass: 'border-[#dedede] bg-white',
      labelClass: 'text-[#707070]',
      valueClass: 'text-[#121212]',
      iconClass: 'text-[#707070]',
      checkboxClass: 'border-[#dedede] bg-white',
      headingClass: 'text-[#121212]',
      bodyMutedClass: 'text-[#707070]',
      suggestionsClass: 'border-[#dedede] bg-white',
      suggestionItemClass: 'text-[#121212] border-[#ededed]',
      suggestionActiveClass: 'bg-[#f6f6f7]',
    };
  }

  return {
    boxClass: 'border-white/90 bg-transparent',
    labelClass: 'text-white/85',
    valueClass: 'text-white',
    iconClass: 'text-white/85',
    checkboxClass: 'border-white/90 bg-transparent',
    headingClass: 'text-white',
    bodyMutedClass: 'text-white/80',
    suggestionsClass: 'border-white/90 bg-white',
    suggestionItemClass: 'text-[#121212] border-[#ededed]',
    suggestionActiveClass: 'bg-[#f6f6f7]',
  };
}

function PreviewField({
  label,
  value,
  className = '',
  trailing,
  chrome,
}: {
  label: string;
  value: string;
  className?: string;
  trailing?: React.ReactNode;
  chrome: FieldChrome;
}) {
  return (
    <div className={className}>
      <div
        className={`flex min-h-[52px] items-center justify-between gap-2 rounded-[5px] border px-3 py-2 ${chrome.boxClass}`}
      >
        <div className="min-w-0 flex-1">
          <div className={`text-[12px] leading-tight ${chrome.labelClass}`}>{label}</div>
          <div className={`mt-0.5 truncate text-[14px] leading-snug ${chrome.valueClass}`}>{value}</div>
        </div>
        {trailing}
      </div>
    </div>
  );
}

function PreviewCheckbox({ label, chrome }: { label: string; chrome: FieldChrome }) {
  return (
    <div className={`flex items-start gap-2.5 text-[14px] ${chrome.valueClass}`}>
      <span
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border ${chrome.checkboxClass}`}
      />
      <span className="leading-snug">{label}</span>
    </div>
  );
}

const ADDRESS_SUGGESTIONS = [
  'Netaji Subhash Marg, New Delhi, Delhi, India',
  'Netaji Subhash Place, Pitampura, New Delhi, Delhi, India',
  'Netaji Nagar, New Delhi, Delhi, India',
];

type Props = {
  accentColor?: string;
  buttonColor?: string;
  addressAutocompletion?: boolean;
  inputFieldsTransparent?: boolean;
  typography?: CheckoutTypographyTheme;
  device?: 'desktop' | 'mobile';
};

export function CheckoutMainRuntimePreview({
  accentColor = '#1773b0',
  buttonColor = '#1773b0',
  addressAutocompletion = false,
  inputFieldsTransparent = false,
  typography,
  device = 'desktop',
}: Props) {
  const isMobile = device === 'mobile';
  const bodyFontFamily = typography?.bodyFontFamily;
  const headingsFontFamily = typography?.headingsFontFamily;
  const chrome = buildFieldChrome(inputFieldsTransparent);
  const buttonTextColor = isColorDark(buttonColor) ? '#ffffff' : '#121212';
  const selectionStyle = {
    borderColor: accentColor,
    boxShadow: `inset 0 0 0 1px ${accentColor}`,
  };

  return (
    <main
      className={`mx-auto w-full select-none ${isMobile ? 'max-w-none px-4 py-6' : 'max-w-[580px] px-6 py-8 sm:px-8'}`}
      style={bodyFontFamily ? { fontFamily: bodyFontFamily } : undefined}
    >
      <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              className={`font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
              style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
            >
              Contact
            </h2>
            <span className={`shrink-0 font-medium ${isMobile ? 'text-[13px]' : 'text-[14px]'}`} style={{ color: accentColor }}>
              Sign in
            </span>
          </div>

          <div className="space-y-3">
            <PreviewField label="Email" value="mose.kling@example.com" chrome={chrome} />
            <PreviewCheckbox label="Email me with news and offers" chrome={chrome} />
          </div>
        </section>

        <section>
          <h2
            className={`mb-4 font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Delivery
          </h2>

          <div className="space-y-3">
            <PreviewField
              label="Country/Region"
              value="India"
              chrome={chrome}
              trailing={<ChevronDownIcon className={`h-4 w-4 shrink-0 ${chrome.iconClass}`} aria-hidden />}
            />

            <div className="grid grid-cols-2 gap-3">
              <PreviewField label="First name" value="Mose" chrome={chrome} />
              <PreviewField label="Last name" value="Kling" chrome={chrome} />
            </div>

            <div>
              <PreviewField
                label="Address"
                value="Netaji Subhash Marg"
                chrome={chrome}
                trailing={
                  addressAutocompletion ? (
                    <MagnifyingGlassIcon className={`h-4 w-4 shrink-0 ${chrome.iconClass}`} aria-hidden />
                  ) : undefined
                }
              />
              {addressAutocompletion ? (
                <div className={`mt-1 overflow-hidden rounded-[5px] border shadow-sm ${chrome.suggestionsClass}`}>
                  {ADDRESS_SUGGESTIONS.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2.5 text-[14px] leading-snug ${chrome.suggestionItemClass} ${
                        index < ADDRESS_SUGGESTIONS.length - 1 ? 'border-b' : ''
                      } ${index === 0 ? chrome.suggestionActiveClass : ''}`}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <PreviewField label="Apartment, suite, etc. (optional)" value="Lal Qila, Chandni Chowk" chrome={chrome} />

            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <PreviewField label="City" value="New Delhi" chrome={chrome} />
              <PreviewField
                label="State"
                value="Delhi"
                chrome={chrome}
                trailing={<ChevronDownIcon className={`h-4 w-4 shrink-0 ${chrome.iconClass}`} aria-hidden />}
              />
              <PreviewField label="PIN code" value="110006" chrome={chrome} />
            </div>

            <PreviewField
              label="Phone"
              value="+91 11 2327 7705"
              chrome={chrome}
              trailing={
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="text-base leading-none" aria-hidden>
                    🇮🇳
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 ${chrome.iconClass}`} aria-hidden />
                  <QuestionMarkCircleIcon className={`h-4 w-4 ${inputFieldsTransparent ? 'text-white/70' : 'text-[#8a8a8a]'}`} aria-hidden />
                </span>
              }
            />

            <PreviewCheckbox label="Save this information for next time" chrome={chrome} />
          </div>
        </section>

        <section>
          <h2
            className={`mb-4 font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Shipping method
          </h2>
          <div
            className={`flex items-center justify-between rounded-[5px] border px-4 py-3.5 ${
              inputFieldsTransparent ? 'bg-transparent' : ''
            }`}
            style={selectionStyle}
          >
            <span className={`text-[14px] ${chrome.valueClass}`}>Standard (Example)</span>
            <span className={`text-[14px] tabular-nums ${chrome.valueClass}`}>₹10.00</span>
          </div>
        </section>

        <section>
          <h2
            className={`font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
          >
            Payment
          </h2>
          <p className={`mt-1 text-[14px] ${chrome.bodyMutedClass}`}>
            All transactions are secure and encrypted.
          </p>

          <div
            className={`mt-4 rounded-[5px] border px-4 py-3.5 ${
              inputFieldsTransparent ? 'bg-transparent' : ''
            }`}
            style={selectionStyle}
          >
            <span className={`text-[14px] ${chrome.valueClass}`}>Cash on Delivery (COD)</span>
          </div>

          <div className="mt-6">
            <h3
              className={`mb-3 text-[14px] font-medium ${chrome.headingClass}`}
              style={headingsFontFamily ? { fontFamily: headingsFontFamily } : undefined}
            >
              Billing address
            </h3>
            <div
              className={`overflow-hidden rounded-[5px] border ${
                inputFieldsTransparent ? 'border-white/90' : 'border-[#dedede]'
              }`}
            >
              <div
                className={`flex items-center gap-3 border-b px-4 py-3.5 ${
                  inputFieldsTransparent ? 'border-white/90 bg-transparent' : 'border-[#dedede] bg-white'
                }`}
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[5px] ${
                    inputFieldsTransparent ? 'bg-transparent' : 'bg-white'
                  }`}
                  style={{ borderColor: accentColor }}
                  aria-hidden
                />
                <span className={`text-[14px] ${chrome.valueClass}`}>Same as shipping address</span>
              </div>
              <div
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  inputFieldsTransparent ? 'bg-transparent' : 'bg-white'
                }`}
              >
                <span
                  className={`h-[18px] w-[18px] shrink-0 rounded-full border ${
                    inputFieldsTransparent ? 'border-white/90 bg-transparent' : 'border-[#dedede] bg-white'
                  }`}
                  aria-hidden
                />
                <span className={`text-[14px] ${chrome.valueClass}`}>Use a different billing address</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div
            className="w-full rounded-[5px] px-4 py-4 text-center text-[14px] font-medium"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            Complete order
          </div>
        </section>
      </div>
    </main>
  );
}
