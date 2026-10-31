import type { CheckoutTypographyTheme } from './settings/checkout-typography-fonts';

export type CheckoutFieldChrome = {
  boxClass: string;
  labelClass: string;
  valueClass: string;
  iconClass: string;
  checkboxClass: string;
  headingClass: string;
  bodyMutedClass: string;
  inputClass: string;
  selectClass: string;
};

export function buildCheckoutFieldChrome(transparent: boolean): CheckoutFieldChrome {
  if (!transparent) {
    return {
      boxClass: 'border-[#dedede] bg-white',
      labelClass: 'text-[#707070]',
      valueClass: 'text-[#121212]',
      iconClass: 'text-[#707070]',
      checkboxClass: 'border-[#dedede] bg-white',
      headingClass: 'text-[#121212]',
      bodyMutedClass: 'text-[#707070]',
      inputClass:
        'w-full rounded-[5px] border border-[#dedede] bg-white px-3 py-3 text-[14px] text-[#121212] placeholder:text-[#8a8a8a] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]',
      selectClass:
        'w-full rounded-[5px] border border-[#dedede] bg-white px-3 py-3 text-[14px] text-[#121212] focus:border-[#005bd3] focus:outline-none focus:ring-1 focus:ring-[#005bd3]',
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
    inputClass:
      'w-full rounded-[5px] border border-white/90 bg-transparent px-3 py-3 text-[14px] text-white placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-1 focus:ring-white',
    selectClass:
      'w-full rounded-[5px] border border-white/90 bg-transparent px-3 py-3 text-[14px] text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white',
  };
}

export type CheckoutMainViewTypography = Pick<
  CheckoutTypographyTheme,
  'bodyFontFamily' | 'headingsFontFamily'
>;
