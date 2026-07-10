export type ProductFormAppearance = 'default' | 'minimal';

export function productFormCardClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'rounded-lg border border-gray-200/50 bg-white p-5'
    : 'rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm';
}

export function productFormSectionTitleClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'mb-3 text-sm font-medium text-gray-600'
    : 'mb-4 text-base font-semibold text-gray-900';
}

export function productFormDividerClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'mt-5 border-t border-gray-100/80 pt-5'
    : 'mt-6 border-t border-gray-100 pt-6';
}

export function productFormLabelClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'mb-1.5 block text-sm font-normal text-gray-500'
    : 'mb-2 block text-sm font-medium text-gray-700';
}

export function productFormInputClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'w-full rounded-md border border-gray-200/70 bg-white px-3 py-2 text-sm text-gray-800 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200'
    : 'w-full rounded-lg border border-gray-200 px-3 py-2 text-base transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400';
}

export function productFormPageClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return 'min-h-screen bg-page-background-color';
}

export function productFormMainStackClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal' ? 'space-y-5' : 'space-y-6';
}

export function productFormGridClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]'
    : 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]';
}

export function productFormAsideStackClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'space-y-3 lg:sticky lg:top-4 lg:self-start'
    : 'space-y-4 lg:sticky lg:top-4 lg:self-start';
}

export function productFormHelperTextClass(
  appearance: ProductFormAppearance = 'default'
): string {
  return appearance === 'minimal'
    ? 'mt-2.5 text-[13px] leading-relaxed text-gray-400'
    : 'mt-3 text-sm text-gray-500';
}
