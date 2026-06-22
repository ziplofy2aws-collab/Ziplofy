export const locationInputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] font-normal text-gray-700 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-200';

export const locationSecondaryButtonClass =
  'inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-normal text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

export const locationPrimaryButtonClass =
  'inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

export const locationTableHeadClass = 'px-3 py-2.5 text-[12px] font-medium text-gray-500';

export const locationTableHeadRightClass = `${locationTableHeadClass} text-right`;

export const locationTableCellClass = 'px-3 py-2.5 text-[13px] text-gray-700';

export const locationTableCellRightClass = `${locationTableCellClass} text-right`;

export function formatLocationAddress(location: {
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryRegion?: string;
}): string {
  return [
    location.address,
    location.apartment,
    location.city,
    location.state,
    location.postalCode,
    location.countryRegion,
  ]
    .filter(Boolean)
    .join(', ');
}
