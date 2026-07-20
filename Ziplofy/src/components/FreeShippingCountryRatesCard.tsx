import React from "react";

interface CountryLite {
  _id?: string;
  name?: string;
  iso2?: string;
}

interface FreeShippingCountryRatesCardProps {
  countrySelection?: string;
  selectedCountryIds?: string[];
  selectedCountries?: CountryLite[];
  excludeShippingRates?: boolean;
  shippingRateLimit?: number | string;
}

const FreeShippingCountryRatesCard: React.FC<FreeShippingCountryRatesCardProps> = ({
  countrySelection,
  selectedCountryIds,
  selectedCountries,
  excludeShippingRates,
  shippingRateLimit,
}) => {
  const renderBoolean = (v?: boolean) => (v ? 'Yes' : 'No');

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm">
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4">Country & rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Country selection</p>
            <p className="text-[13px] text-gray-900">{countrySelection}</p>
          </div>
          {countrySelection === 'selected-countries' && (
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Selected countries</p>
              <p className="text-[13px] text-gray-900">
                {(selectedCountries?.length
                  ? selectedCountries.map((c) => c.name || c.iso2 || c._id).join(', ')
                  : (selectedCountryIds || []).join(', ') || '-'
                )}
              </p>
            </div>
          )}
          <div>
            <p className="text-[12px] text-gray-500 mb-1">Exclude shipping rates</p>
            <p className="text-[13px] text-gray-900">{renderBoolean(excludeShippingRates)}</p>
          </div>
          {excludeShippingRates && (
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Shipping rate limit</p>
              <p className="text-[13px] text-gray-900">{shippingRateLimit != null ? `₹${shippingRateLimit}` : '-'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeShippingCountryRatesCard;

