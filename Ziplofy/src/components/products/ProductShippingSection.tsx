import {
  ChevronDownIcon,
  ChevronUpIcon,
  CubeIcon,
  InformationCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AddPackageModal from "../AddPackageModal";
import { Packaging, usePackaging } from "../../contexts/packaging.context";

interface ProductShippingSectionProps {
  physicalProduct: boolean;
  selectedPackage: string;
  productWeight: string;
  weightUnit: string;
  countryOfOrigin: string;
  hsCode: string;
  onPhysicalProductChange: (checked: boolean) => void;
  onSelectedPackageChange: (value: string) => void;
  onProductWeightChange: (value: string) => void;
  onWeightUnitChange: (value: string) => void;
  onCountryOfOriginChange: (value: string) => void;
  onHsCodeChange: (value: string) => void;
  activeStoreId: string | null;
}

const weightUnits = ["lb", "oz", "kg", "grams"];

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands",
  "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland",
  "Czech Republic", "Hungary", "Portugal", "Greece", "Ireland", "Luxembourg", "Slovakia",
  "Slovenia", "Croatia", "Romania", "Bulgaria", "Lithuania", "Latvia", "Estonia", "Malta",
  "Cyprus", "Japan", "South Korea", "China", "India", "Australia", "New Zealand", "Brazil",
  "Argentina", "Chile", "Mexico", "South Africa", "Israel", "Turkey", "Russia", "Ukraine",
  "Thailand", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "Taiwan",
  "Hong Kong", "Saudi Arabia", "United Arab Emirates", "Egypt", "Morocco", "Nigeria",
  "Kenya", "Ghana", "Ethiopia", "Tanzania", "Uganda", "Rwanda", "Senegal", "Ivory Coast",
  "Cameroon", "Algeria", "Tunisia", "Libya", "Sudan", "Angola", "Mozambique", "Zambia",
  "Zimbabwe", "Botswana", "Namibia", "Lesotho", "Swaziland", "Madagascar", "Mauritius",
  "Seychelles", "Comoros", "Djibouti", "Somalia", "Eritrea", "South Sudan", "Central African Republic",
  "Chad", "Niger", "Mali", "Burkina Faso", "Guinea", "Sierra Leone", "Liberia", "Gambia",
  "Guinea-Bissau", "Cape Verde", "São Tomé and Príncipe", "Equatorial Guinea", "Gabon",
  "Republic of the Congo", "Democratic Republic of the Congo", "Burundi", "Malawi",
];

const pillClass =
  "rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800";

function formatPackageLabel(pkg: Packaging): string {
  const def = pkg.isDefault ? "Store default • " : "";
  const dims =
    pkg.packageType === "envelope"
      ? `${pkg.length} × ${pkg.width} ${pkg.dimensionsUnit}`
      : `${pkg.length} × ${pkg.width} × ${pkg.height} ${pkg.dimensionsUnit}`;
  return `${def}${pkg.packageName} - ${dims}, ${pkg.weight} ${pkg.weightUnit}`;
}

const ProductShippingSection: React.FC<ProductShippingSectionProps> = ({
  physicalProduct,
  selectedPackage,
  productWeight,
  weightUnit,
  countryOfOrigin,
  hsCode,
  onPhysicalProductChange,
  onSelectedPackageChange,
  onProductWeightChange,
  onWeightUnitChange,
  onCountryOfOriginChange,
  onHsCodeChange,
  activeStoreId,
}) => {
  const { packagings, fetchPackagingsByStoreId, createPackaging } = usePackaging();
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [customsExpanded, setCustomsExpanded] = useState(false);
  const [packageFormData, setPackageFormData] = useState({
    packageName: "",
    packageType: "box",
    length: "",
    width: "",
    height: "",
    dimensionsUnit: "cm",
    weight: "",
    weightUnit: "kg",
    isDefault: false,
  });

  useEffect(() => {
    if (activeStoreId) {
      void fetchPackagingsByStoreId(activeStoreId);
    }
  }, [activeStoreId, fetchPackagingsByStoreId]);

  useEffect(() => {
    if (!selectedPackage && packagings.length > 0) {
      const preferredPackage =
        packagings.find((pkg) => pkg.isDefault) || packagings[0];
      onSelectedPackageChange(preferredPackage._id);
    }
  }, [selectedPackage, packagings, onSelectedPackageChange]);

  useEffect(() => {
    if (!physicalProduct) {
      setCustomsExpanded(false);
    }
  }, [physicalProduct]);

  const handlePackageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSelectedPackageChange(e.target.value);
    },
    [onSelectedPackageChange]
  );

  const handleProductWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onProductWeightChange(e.target.value);
    },
    [onProductWeightChange]
  );

  const handleWeightUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onWeightUnitChange(e.target.value);
    },
    [onWeightUnitChange]
  );

  const handleCountryOfOriginChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onCountryOfOriginChange(e.target.value);
    },
    [onCountryOfOriginChange]
  );

  const handleHsCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onHsCodeChange(e.target.value);
    },
    [onHsCodeChange]
  );

  const isHsCodeValid = hsCode.trim() === "" || /^\d{6}$/.test(hsCode.trim());

  const resetPackageForm = useCallback(() => {
    setPackageFormData({
      packageName: "",
      packageType: "box",
      length: "",
      width: "",
      height: "",
      dimensionsUnit: "cm",
      weight: "",
      weightUnit: "kg",
      isDefault: false,
    });
  }, []);

  const handleOpenAddPackageModal = useCallback(() => {
    resetPackageForm();
    setIsAddPackageModalOpen(true);
  }, [resetPackageForm]);

  const handleCloseAddPackageModal = useCallback(() => {
    setIsAddPackageModalOpen(false);
  }, []);

  const handlePackageFormChange = useCallback((field: string, value: unknown) => {
    setPackageFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddPackageSubmit = useCallback(async () => {
    if (!activeStoreId) {
      toast.error("Please select a store first");
      return;
    }

    const payload = {
      storeId: activeStoreId,
      packageName: packageFormData.packageName.trim(),
      packageType: packageFormData.packageType as "box" | "envelope" | "soft_package",
      length: parseFloat(packageFormData.length),
      width: parseFloat(packageFormData.width),
      height:
        packageFormData.packageType === "envelope"
          ? 0
          : parseFloat(packageFormData.height),
      dimensionsUnit: packageFormData.dimensionsUnit as "cm" | "in",
      weight: parseFloat(packageFormData.weight),
      weightUnit: packageFormData.weightUnit as "g" | "kg" | "oz" | "lb",
      isDefault: packageFormData.isDefault,
    };

    if (
      !payload.packageName ||
      Number.isNaN(payload.length) ||
      Number.isNaN(payload.width) ||
      Number.isNaN(payload.weight) ||
      (payload.packageType !== "envelope" && Number.isNaN(payload.height))
    ) {
      toast.error("Please fill all required package details");
      return;
    }

    try {
      await createPackaging(payload);
      setIsAddPackageModalOpen(false);
      await fetchPackagingsByStoreId(activeStoreId);
      toast.success("Package added");
    } catch {
      toast.error("Failed to add package");
    }
  }, [
    activeStoreId,
    packageFormData,
    createPackaging,
    fetchPackagingsByStoreId,
  ]);

  const selectChevronClass =
    "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500";

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-gray-900">Shipping</h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-gray-600">
            {physicalProduct ? "Physical product" : "Not a physical product"}
          </span>
          <span
            className="text-gray-400"
            title={
              physicalProduct
                ? "Physical products use package and weight for shipping rates."
                : "Digital or service products skip shipping dimensions."
            }
          >
            <InformationCircleIcon className="h-4 w-4" aria-hidden />
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={physicalProduct}
            onClick={() => onPhysicalProductChange(!physicalProduct)}
            className={`flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
              physicalProduct
                ? "justify-end border-gray-900 bg-gray-900"
                : "justify-start border-gray-300 bg-white"
            }`}
          >
            <span
              aria-hidden
              className={`h-5 w-5 rounded-full shadow ${
                physicalProduct ? "bg-white" : "bg-gray-400"
              }`}
            />
          </button>
        </div>
      </div>

      {physicalProduct && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Package
                </label>
                <span className="text-gray-400" title="Used to calculate shipping labels and rates.">
                  <InformationCircleIcon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <div className="relative">
                <CubeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <select
                  value={selectedPackage}
                  onChange={handlePackageChange}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-11 pr-10 text-sm text-gray-900 transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">Select</option>
                  {packagings.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {formatPackageLabel(pkg)}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className={selectChevronClass} aria-hidden />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {packagings.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    No packages yet. Add one to continue.
                  </p>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={handleOpenAddPackageModal}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  <PlusIcon className="h-3.5 w-3.5" aria-hidden />
                  Add package
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={productWeight}
                  onChange={handleProductWeightChange}
                  placeholder="0.0"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <div className="relative w-24 shrink-0 sm:w-28">
                  <select
                    value={weightUnit}
                    onChange={handleWeightUnitChange}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="" disabled>
                      Unit
                    </option>
                    {weightUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className={selectChevronClass} aria-hidden />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-1">
            {!customsExpanded ? (
              <button
                type="button"
                onClick={() => setCustomsExpanded(true)}
                className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:bg-gray-50/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={pillClass}>Country of origin</span>
                  <span className={pillClass}>HS Code</span>
                </div>
                <ChevronDownIcon
                  className="h-5 w-5 shrink-0 text-gray-500"
                  aria-hidden
                />
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setCustomsExpanded(false)}
                  className="flex w-full items-center justify-between gap-3 border-b border-gray-100 py-4 text-left transition-colors hover:bg-gray-50/50"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    Customs information
                  </span>
                  <ChevronUpIcon
                    className="h-5 w-5 shrink-0 text-gray-500"
                    aria-hidden
                  />
                </button>

                <div className="space-y-5 pt-4">
                  <div>
                    <div className="mb-2 flex items-center gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Country/Region of origin
                      </label>
                      <span
                        className="text-gray-400"
                        title="Used on customs forms for international shipments."
                      >
                        <InformationCircleIcon className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={countryOfOrigin}
                        onChange={handleCountryOfOriginChange}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      >
                        <option value="">Select</option>
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className={selectChevronClass} aria-hidden />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Harmonized System (HS) code
                      </label>
                      <span
                        className="text-gray-400"
                        title="Six-digit international tariff code."
                      >
                        <InformationCircleIcon className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                    <input
                      type="text"
                      value={hsCode}
                      onChange={handleHsCodeChange}
                      placeholder="Enter a 6-digit code or search by keyword"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 ${
                        isHsCodeValid
                          ? "border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                          : "border-red-300 focus:border-red-400 focus:ring-red-300"
                      }`}
                      maxLength={6}
                      inputMode="numeric"
                      aria-invalid={!isHsCodeValid}
                    />
                    {!isHsCodeValid ? (
                      <p className="mt-1 text-sm text-red-600">
                        HS code must be exactly 6 digits
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AddPackageModal
        open={isAddPackageModalOpen}
        onClose={handleCloseAddPackageModal}
        formData={packageFormData}
        onFormChange={handlePackageFormChange}
        onSubmit={handleAddPackageSubmit}
      />
    </div>
  );
};

export default ProductShippingSection;
