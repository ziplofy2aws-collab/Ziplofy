import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import Modal from '../../components/Modal';
import { useProducts, ProductSearchPagination, ProductSearchWithVariantsItem, ProductSearchVariant } from '../../contexts/product.context';
import { useStore } from '../../contexts/store.context';
import { useMarkets, MarketCountry } from '../../contexts/market.context';
import { useStates, StateItem } from '../../contexts/state.context';
import { useShippingZones } from '../../contexts/shipping-zone.context';
import { useShippingZoneRates, ShippingZoneRate } from '../../contexts/shipping-zone-rate.context';
import { useShippingProfiles } from '../../contexts/shipping-profile.context';
import { useShippingProfileLocationSettings } from '../../contexts/shipping-profile-location-settings.context';
import {
  useShippingProfileProductVariants,
  ShippingProfileProductVariantEntry,
} from '../../contexts/shipping-profile-product-variants.context';

interface FulfillmentLocation {
  id: string;
  name: string;
  address?: string;
  country?: string;
  raw?: any;
}

type FulfillmentLocationItem = FulfillmentLocation & {
  contextSetting: { createNewRates: boolean; removeRates: boolean };
};

const ShippingProfileDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profileId } = useParams<{ profileId: string }>();
  const { searchProductsWithVariants } = useProducts();
  const { activeStoreId } = useStore();
  const { storeCountries, getCountriesByStoreId } = useMarkets();
  const { statesByCountry, getStatesByCountryId } = useStates();
  const { createShippingZone, updateShippingZone, deleteShippingZone, getShippingZonesByShippingProfileId, shippingZones, loading: shippingZoneLoading } = useShippingZones();
  const {
    createShippingZoneRate,
    getShippingZoneRatesByZoneId,
    updateShippingZoneRate,
    deleteShippingZoneRate,
    loading: rateLoading,
  } = useShippingZoneRates();
  const {
    shippingProfiles,
    getShippingProfilesByStoreId,
    updateShippingProfile,
    deleteShippingProfile,
    loading: profileUpdateLoading,
  } = useShippingProfiles();
  const {
    settingsByProfileId: locationSettingsByProfileId,
    fetchByProfileId: fetchLocationSettings,
    updateLocationSetting,
    loading: locationSettingsContextLoading,
    error: locationSettingsContextError,
  } = useShippingProfileLocationSettings();
  const {
    entriesByProfileId: productVariantEntriesByProfileId,
    fetchByProfileId: fetchProductVariantEntries,
    addEntry: addProductVariantEntry,
    deleteEntry: deleteProductVariantEntry,
  } = useShippingProfileProductVariants();
  
  const [zoneRates, setZoneRates] = useState<Record<string, ShippingZoneRate[]>>({});
  const [ratesLoading, setRatesLoading] = useState<Record<string, boolean>>({});
  const [profileFetching, setProfileFetching] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [locationSettingsChanged, setLocationSettingsChanged] = useState<Record<string, boolean>>({});
  const [initialLocationSettings, setInitialLocationSettings] = useState<Record<string, { createNewRates: boolean; removeRates: boolean }>>({});
  const [initialShippingZoneIds, setInitialShippingZoneIds] = useState<Set<string>>(new Set());

  const handleBack = () => {
    navigate('/settings/shipping-and-delivery');
  };

  const [locationSettings, setLocationSettings] = useState<Record<string, { createNewRates: boolean; removeRates: boolean }>>({});

  useEffect(() => {
    if (!profileId) return;
    if (locationSettingsByProfileId[profileId]) return;
    fetchLocationSettings(profileId).catch(() => {
      // error handled in context
    });
  }, [profileId, locationSettingsByProfileId, fetchLocationSettings]);

  const formatLocationAddress = useCallback((locationData: any) => {
    if (!locationData) return '';
    const parts = [
      locationData?.address,
      locationData?.apartment,
      locationData?.city,
      locationData?.state,
      locationData?.postalCode,
    ]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .map((part) => String(part).trim());
    return parts.join(', ');
  }, []);

  const fulfillmentLocations = useMemo<FulfillmentLocationItem[]>(() => {
    if (!profileId) return [];
    const entries = locationSettingsByProfileId[profileId] || [];
    return entries.reduce<FulfillmentLocationItem[]>((acc, entry) => {
      const locationData = entry.location as any;
      const rawId =
        typeof entry.locationId === 'string'
          ? entry.locationId
          : (entry.locationId as any)?._id || entry.locationId;
      const id = rawId ? String(rawId).trim() : '';
      if (!id) {
        return acc;
      }
      acc.push({
        id,
        name: locationData?.name || 'Untitled location',
        address: formatLocationAddress(locationData),
        country: locationData?.countryRegion || '',
        raw: locationData,
        contextSetting: {
          createNewRates: entry.createNewRates,
          removeRates: entry.removeRates,
        },
      });
      return acc;
    }, []);
  }, [profileId, locationSettingsByProfileId, formatLocationAddress]);

  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [debouncedProductSearchTerm, setDebouncedProductSearchTerm] = useState<string>('');
  const [productSearchLoading, setProductSearchLoading] = useState<boolean>(false);
  const [productSearchError, setProductSearchError] = useState<string | null>(null);
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchWithVariantsItem[]>([]);
  const [productSearchPagination, setProductSearchPagination] = useState<ProductSearchPagination | null>(null);
  const [pendingVariantIds, setPendingVariantIds] = useState<Set<string>>(new Set());
  const [pendingProductIds, setPendingProductIds] = useState<Set<string>>(new Set());
  const [entryPendingDeletion, setEntryPendingDeletion] = useState<ShippingProfileProductVariantEntry | null>(null);
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [nextProfileName, setNextProfileName] = useState('');

  const [shippingZoneModalOpen, setShippingZoneModalOpen] = useState<boolean>(false);
  const [shippingZoneName, setShippingZoneName] = useState<string>('');
  const [shippingZoneSearch, setShippingZoneSearch] = useState<string>('');
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedStateIds, setSelectedStateIds] = useState<Set<string>>(new Set());
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [shippingZoneCountriesLoading, setShippingZoneCountriesLoading] = useState<boolean>(false);
  const [shippingZoneCountriesError, setShippingZoneCountriesError] = useState<string | null>(null);
  const [shippingZoneCreateError, setShippingZoneCreateError] = useState<string | null>(null);
  const [loadingCountryStates, setLoadingCountryStates] = useState<Set<string>>(new Set());
  const selectedCountriesRef = useRef<Set<string>>(selectedCountries);
  const [manageRatesModalOpen, setManageRatesModalOpen] = useState<boolean>(false);
  const [activeManageLocation, setActiveManageLocation] = useState<FulfillmentLocationItem | null>(null);
  const [manageRatesSelection, setManageRatesSelection] = useState<'create' | 'remove'>('create');
  const manageRatesSelectionRef = useRef<'create' | 'remove'>('create');
  const [zoneMenuAnchor, setZoneMenuAnchor] = useState<{ element: HTMLElement; zoneId: string } | null>(null);
  const [zonePendingDeletion, setZonePendingDeletion] = useState<{ id: string; name: string } | null>(null);
  const [zoneDeleteLoading, setZoneDeleteLoading] = useState(false);
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [addRateModalOpen, setAddRateModalOpen] = useState<boolean>(false);
  const [activeRateZone, setActiveRateZone] = useState<any | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateType, setRateType] = useState<string>('flat');
  const [shippingRate, setShippingRate] = useState<string>('custom');
  const [customRateName, setCustomRateName] = useState<string>('');
  const [customDeliveryDescription, setCustomDeliveryDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('0.00');
  const [conditionalPricingEnabled, setConditionalPricingEnabled] = useState<boolean>(false);
  const [conditionalPricingBasis, setConditionalPricingBasis] = useState<'weight' | 'price'>('weight');
  const [minWeight, setMinWeight] = useState<string>('0');
  const [maxWeight, setMaxWeight] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('0.00');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [rateMenuAnchor, setRateMenuAnchor] = useState<{
    element: HTMLElement;
    zoneId: string;
    zoneName: string;
    rate: ShippingZoneRate;
  } | null>(null);
  const [ratePendingDeletion, setRatePendingDeletion] = useState<{
    zoneId: string;
    zoneName: string;
    rate: ShippingZoneRate;
  } | null>(null);
  const [rateDeleteLoading, setRateDeleteLoading] = useState(false);
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const [deleteProfileLoading, setDeleteProfileLoading] = useState(false);

  const deliverySuggestions = [
    'Tracking number provided',
    'Made to order',
    'Ships next day',
  ];

  const editingZoneId = editingZone?._id ? String(editingZone._id) : null;
  const { reservedStatesMap, reservedCountriesMap } = useMemo(() => {
    const stateMap = new Map<string, string>();
    const countryMap = new Map<string, string>();

    if (Array.isArray(shippingZones)) {
      shippingZones.forEach((zone: any) => {
        if (!zone || (editingZoneId && String(zone._id) === editingZoneId)) {
          return;
        }
        const zoneLabel = zone.zoneName || 'Another zone';
        (zone.countries || []).forEach((country: any) => {
          if (!country) return;
          const normalizedCountryId = country.countryId ? String(country.countryId) : '';
          if (!normalizedCountryId) return;

          if (Array.isArray(country.stateIds) && country.stateIds.length > 0) {
            country.stateIds.forEach((stateId: string) => {
              if (stateId) {
                stateMap.set(String(stateId), zoneLabel);
              }
            });
          } else {
            countryMap.set(normalizedCountryId, zoneLabel);
          }
        });
      });
    }

    return {
      reservedStatesMap: stateMap,
      reservedCountriesMap: countryMap,
    };
  }, [shippingZones, editingZoneId]);

  const filteredCountries = useMemo(() => {
    const countries = storeCountries ?? [];
    const query = shippingZoneSearch.trim().toLowerCase();
    if (!query) {
      return [...countries].sort((a, b) => a.name.localeCompare(b.name));
    }

    return countries
      .filter((country) => {
        const candidates = [
          country.name,
          country.officialName,
          country.iso2,
          country.iso3,
          country.numericCode,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        return candidates.some((value) => value.includes(query));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [storeCountries, shippingZoneSearch]);

  const fetchStatesForCountry = useCallback(
    async (countryId: string): Promise<StateItem[]> => {
      if (!countryId) return [];
      const existing = statesByCountry[countryId];
      if (existing) return existing;

      setLoadingCountryStates((prev) => {
        const next = new Set(prev);
        next.add(countryId);
        return next;
      });

      try {
        const items = await getStatesByCountryId(countryId);
        return items || [];
      } catch {
        return [];
      } finally {
        setLoadingCountryStates((prev) => {
          const next = new Set(prev);
          next.delete(countryId);
          return next;
        });
      }
    },
    [getStatesByCountryId, statesByCountry]
  );

  useEffect(() => {
    if (!activeStoreId) return;
    setProfileFetching(true);
    getShippingProfilesByStoreId(activeStoreId)
      .catch((err) => {
        console.error('Failed to fetch shipping profiles:', err);
      })
      .finally(() => setProfileFetching(false));
  }, [activeStoreId, getShippingProfilesByStoreId]);

  useEffect(() => {
    if (!profileId) return;
    fetchProductVariantEntries(profileId).catch(() => {
      // handled in context
    });
  }, [profileId, fetchProductVariantEntries]);

  const currentProfile = useMemo(() => {
    if (!profileId) return undefined;
    return shippingProfiles.find((profile) => profile._id === profileId);
  }, [shippingProfiles, profileId]);

  useEffect(() => {
    if (!productModalOpen) return;
    const handler = setTimeout(() => {
      setDebouncedProductSearchTerm(productSearchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [productModalOpen, productSearchTerm]);

  useEffect(() => {
    selectedCountriesRef.current = selectedCountries;
  }, [selectedCountries]);

  useEffect(() => {
    if (!productModalOpen) return;
    if (!debouncedProductSearchTerm.trim()) {
      setProductSearchResults([]);
      setProductSearchPagination(null);
      setProductSearchError(null);
      return;
    }
    if (!activeStoreId) {
      setProductSearchError('Select a store to manage products.');
      setProductSearchResults([]);
      return;
    }

    let cancelled = false;
    const fetchProducts = async () => {
      try {
        setProductSearchLoading(true);
        setProductSearchError(null);
        const response = await searchProductsWithVariants({
          storeId: activeStoreId,
          q: debouncedProductSearchTerm,
          limit: 50,
        });
        if (cancelled) return;
        setProductSearchResults(response.data || []);
        setProductSearchPagination(response.pagination || null);
      } catch (err: any) {
        if (cancelled) return;
        setProductSearchResults([]);
        const msg = err?.message || 'Failed to search products';
        setProductSearchError(msg);
      } finally {
        if (!cancelled) {
          setProductSearchLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [productModalOpen, activeStoreId, debouncedProductSearchTerm, searchProductsWithVariants]);

  useEffect(() => {
    if (!shippingZoneModalOpen) return;

    if (!activeStoreId) {
      setShippingZoneCountriesError('Select a store to manage shipping zones.');
      setShippingZoneCountriesLoading(false);
      return;
    }

    let cancelled = false;

    const fetchStoreCountries = async () => {
      try {
        setShippingZoneCountriesLoading(true);
        setShippingZoneCountriesError(null);
        await getCountriesByStoreId(activeStoreId);
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || 'Failed to fetch countries';
        setShippingZoneCountriesError(msg);
      } finally {
        if (!cancelled) {
          setShippingZoneCountriesLoading(false);
        }
      }
    };

    fetchStoreCountries();

    return () => {
      cancelled = true;
    };
  }, [shippingZoneModalOpen, activeStoreId, getCountriesByStoreId]);

  // Fetch shipping zones when profile is available
  useEffect(() => {
    if (!profileId) return;
    getShippingZonesByShippingProfileId(profileId).catch((err) => {
      console.error('Failed to fetch shipping zones:', err);
    });
  }, [profileId, getShippingZonesByShippingProfileId]);

  // Fetch rates for each shipping zone
  useEffect(() => {
    if (!shippingZones || shippingZones.length === 0) return;
    
    const fetchRatesForZones = async () => {
      for (const zone of shippingZones) {
        if (!zone._id) continue;
        
        // Check if already fetched to avoid unnecessary calls
        setRatesLoading((prev) => {
          if (prev[zone._id]) return prev; // Already loading
          return { ...prev, [zone._id]: true };
        });
        
        try {
          const rates = await getShippingZoneRatesByZoneId(zone._id);
          setZoneRates((prev) => {
            // Only update if not already set (avoid overwriting with stale data)
            if (prev[zone._id]) return prev;
            return { ...prev, [zone._id]: rates };
          });
        } catch (err) {
          console.error(`Failed to fetch rates for zone ${zone._id}:`, err);
          setZoneRates((prev) => {
            if (prev[zone._id]) return prev;
            return { ...prev, [zone._id]: [] };
          });
        } finally {
          setRatesLoading((prev) => ({ ...prev, [zone._id]: false }));
        }
      }
    };
    
    fetchRatesForZones();
  }, [shippingZones, getShippingZoneRatesByZoneId]);

  const resetRateForm = () => {
    setRateType('flat');
    setShippingRate('custom');
    setCustomRateName('');
    setCustomDeliveryDescription('');
    setPrice('0.00');
    setConditionalPricingEnabled(false);
    setConditionalPricingBasis('weight');
    setMinWeight('0');
    setMaxWeight('');
    setMinPrice('0.00');
    setMaxPrice('');
  };

  const populateRateFormFromRate = (rate: ShippingZoneRate) => {
    setRateType(rate.rateType || 'flat');
    setShippingRate(rate.shippingRate || 'custom');
    setCustomRateName(rate.customRateName || '');
    setCustomDeliveryDescription(rate.customDeliveryDescription || '');

    const priceValue =
      typeof rate.price === 'number'
        ? rate.price
        : parseFloat(String(rate.price ?? 0));
    setPrice(Number.isFinite(priceValue) ? priceValue.toFixed(2) : '0.00');

    const isConditional = Boolean(rate.conditionalPricingEnabled);
    setConditionalPricingEnabled(isConditional);
    setConditionalPricingBasis(
      isConditional && rate.conditionalPricingBasis === 'price' ? 'price' : 'weight'
    );
    setMinWeight(
      rate.minWeight === null || rate.minWeight === undefined ? '' : String(rate.minWeight)
    );
    setMaxWeight(
      rate.maxWeight === null || rate.maxWeight === undefined ? '' : String(rate.maxWeight)
    );
    setMinPrice(
      rate.minPrice === null || rate.minPrice === undefined ? '' : String(rate.minPrice)
    );
    setMaxPrice(
      rate.maxPrice === null || rate.maxPrice === undefined ? '' : String(rate.maxPrice)
    );
  };

  const handleCloseRateModal = () => {
    setAddRateModalOpen(false);
    setActiveRateZone(null);
    setEditingRateId(null);
    resetRateForm();
  };

  const handleOpenRateModalForZone = (zone: any) => {
    if (!zone) return;
    resetRateForm();
    setActiveRateZone(zone);
    setEditingRateId(null);
    setAddRateModalOpen(true);
  };

  const handleEditRateFromMenu = () => {
    if (!rateMenuAnchor) return;
    const zone = shippingZones.find((z: any) => z._id === rateMenuAnchor.zoneId) || {
      _id: rateMenuAnchor.zoneId,
    };
    resetRateForm();
    populateRateFormFromRate(rateMenuAnchor.rate);
    setActiveRateZone(zone);
    setEditingRateId(rateMenuAnchor.rate._id);
    setAddRateModalOpen(true);
    setRateMenuAnchor(null);
  };

  const handleDeleteRateFromMenu = async () => {
    if (!rateMenuAnchor) return;
    const { zoneId, zoneName, rate } = rateMenuAnchor;
    setRateMenuAnchor(null);
    setRatePendingDeletion({ zoneId, zoneName, rate });
  };

  const handleOpenActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionsAnchor(event.currentTarget);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchor(null);
  };

  const handleConfirmDeleteProfile = async () => {
    if (!profileId) return;
    setDeleteProfileLoading(true);
    try {
      await deleteShippingProfile(profileId);
      setDeleteProfileDialogOpen(false);
      setActionsAnchor(null);
      navigate('/settings/shipping-and-delivery');
    } catch (err) {
      // error already handled via context
    } finally {
      setDeleteProfileLoading(false);
    }
  };

  const handleConfirmDeleteZone = async () => {
    if (!zonePendingDeletion) return;
    setZoneDeleteLoading(true);
    try {
      await deleteShippingZone(zonePendingDeletion.id);
      setZonePendingDeletion(null);
    } catch (err) {
      console.error('Failed to delete shipping zone:', err);
    } finally {
      setZoneDeleteLoading(false);
    }
  };

  const handleConfirmDeleteRate = async () => {
    if (!ratePendingDeletion) return;
    setRateDeleteLoading(true);
    const { zoneId, rate } = ratePendingDeletion;
    try {
      await deleteShippingZoneRate(rate._id);
      setZoneRates((prev) => {
        const current = prev[zoneId] || [];
        return {
          ...prev,
          [zoneId]: current.filter((existing) => existing._id !== rate._id),
        };
      });
      setRatePendingDeletion(null);
    } catch (err) {
      console.error('Failed to delete shipping zone rate:', err);
    } finally {
      setRateDeleteLoading(false);
    }
  };

  const handleSaveRate = async () => {
    if (!activeRateZone) return;

    const sharedPayload: any = {
      rateType: rateType as 'flat' | 'carrier',
      shippingRate: shippingRate || 'custom',
      customRateName: customRateName.trim(),
      customDeliveryDescription: customDeliveryDescription.trim() || undefined,
      price,
      conditionalPricingEnabled,
      conditionalPricingBasis: conditionalPricingEnabled ? conditionalPricingBasis : undefined,
      minWeight:
        conditionalPricingEnabled && conditionalPricingBasis === 'weight'
          ? minWeight || undefined
          : undefined,
      maxWeight:
        conditionalPricingEnabled && conditionalPricingBasis === 'weight'
          ? maxWeight || undefined
          : undefined,
      minPrice:
        conditionalPricingEnabled && conditionalPricingBasis === 'price'
          ? minPrice || undefined
          : undefined,
      maxPrice:
        conditionalPricingEnabled && conditionalPricingBasis === 'price'
          ? maxPrice || undefined
          : undefined,
    };

    try {
      if (editingRateId) {
        const updatedRate = await updateShippingZoneRate(editingRateId, sharedPayload);
        setZoneRates((prev) => {
          const zoneId = activeRateZone._id;
          const current = prev[zoneId] || [];
          return {
            ...prev,
            [zoneId]: current.map((existing) =>
              existing._id === editingRateId ? updatedRate : existing
            ),
          };
        });
      } else {
        const payload = {
          ...sharedPayload,
          shippingZoneId: activeRateZone._id,
        };
        const createdRate = await createShippingZoneRate(payload);
        if (activeRateZone._id) {
          setZoneRates((prev) => ({
            ...prev,
            [activeRateZone._id]: [createdRate, ...(prev[activeRateZone._id] || [])],
          }));
        }
      }
      handleCloseRateModal();
    } catch (err) {
      console.error('Failed to save shipping zone rate:', err);
    }
  };

  const handleOpenProductModal = () => {
    setProductModalOpen(true);
    setProductSearchTerm('');
    setDebouncedProductSearchTerm('');
    setProductSearchResults([]);
    setProductSearchError(null);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
  };

  const handleOpenShippingZoneModal = async (zone?: any) => {
    // Always clear editing zone first to ensure clean state
    setEditingZone(null);
    setShippingZoneName('');
    setSelectedCountries(new Set());
    setSelectedStateIds(new Set());
    setExpandedCountries(new Set());
    setShippingZoneSearch('');
    setShippingZoneCountriesError(null);
    setShippingZoneCreateError(null);
    setLoadingCountryStates(new Set());
    
    setShippingZoneModalOpen(true);
    
    if (zone) {
      // Editing mode - set values after modal is open
      setEditingZone(zone);
      setShippingZoneName(zone.zoneName || '');
      
      // Pre-select countries and states from the zone
      const countriesSet = new Set<string>();
      const statesSet = new Set<string>();
      
      if (zone.countries && Array.isArray(zone.countries)) {
        // Fetch states for each country in the zone
        for (const country of zone.countries) {
          countriesSet.add(country.countryId);
          // Fetch states for this country if not already loaded
          if (!statesByCountry[country.countryId]) {
            try {
              await getStatesByCountryId(country.countryId);
            } catch (err) {
              console.error(`Failed to fetch states for country ${country.countryId}:`, err);
            }
          }
          // Add selected states for this country
          if (country.stateIds && Array.isArray(country.stateIds)) {
            country.stateIds.forEach((stateId: string) => {
              statesSet.add(stateId);
            });
          }
        }
      }
      
      setSelectedCountries(countriesSet);
      setSelectedStateIds(statesSet);
      setExpandedCountries(new Set());
    }
  };

  const handleCloseShippingZoneModal = () => {
    setShippingZoneModalOpen(false);
    setEditingZone(null);
    setShippingZoneName('');
    setShippingZoneSearch('');
    setSelectedCountries(new Set());
    setSelectedStateIds(new Set());
    setExpandedCountries(new Set());
    setShippingZoneCreateError(null);
  };

  const handleCreateShippingZone = async () => {
    if (!profileId) {
      setShippingZoneCreateError('Shipping profile ID is required');
      return;
    }

    if (!shippingZoneName.trim()) {
      setShippingZoneCreateError('Zone name is required');
      return;
    }

    if (selectedShippingZoneCount === 0) {
      setShippingZoneCreateError('Please select at least one country or state');
      return;
    }

    try {
      setShippingZoneCreateError(null);

      // Structure countries array with their states
      const countriesArray: Array<{ countryId: string; stateIds?: string[] }> = [];

      // Process selected countries
      for (const countryId of selectedCountries) {
        const statesForCountry = statesByCountry[countryId] || [];
        const selectedStatesForCountry = statesForCountry.filter((state) =>
          selectedStateIds.has(state._id)
        );

        // If country is selected but has no selected states, it means entire country
        // If country has selected states, include only those states
        if (selectedStatesForCountry.length > 0) {
          countriesArray.push({
            countryId,
            stateIds: selectedStatesForCountry.map((state) => state._id),
          });
        } else {
          // Entire country selected (no specific states)
          countriesArray.push({
            countryId,
          });
        }
      }

      // Also check for states that might be selected but their country is not in selectedCountries
      // This shouldn't happen based on the UI logic, but handle it just in case
      const stateCountryMap = new Map<string, string>();
      Object.entries(statesByCountry).forEach(([countryId, states]) => {
        states.forEach((state) => {
          stateCountryMap.set(state._id, countryId);
        });
      });

      const orphanedStates: string[] = [];
      for (const stateId of selectedStateIds) {
        const countryId = stateCountryMap.get(stateId);
        if (countryId && !selectedCountries.has(countryId)) {
          orphanedStates.push(stateId);
        }
      }

      // Add orphaned states grouped by country
      if (orphanedStates.length > 0) {
        const orphanedByCountry = new Map<string, string[]>();
        orphanedStates.forEach((stateId) => {
          const countryId = stateCountryMap.get(stateId);
          if (countryId) {
            if (!orphanedByCountry.has(countryId)) {
              orphanedByCountry.set(countryId, []);
            }
            orphanedByCountry.get(countryId)!.push(stateId);
          }
        });

        orphanedByCountry.forEach((stateIds, countryId) => {
          countriesArray.push({
            countryId,
            stateIds,
          });
        });
      }

      if (editingZone) {
        // Update existing zone
        await updateShippingZone(editingZone._id, {
          zoneName: shippingZoneName.trim(),
          countries: countriesArray,
        });
        // Refresh zones after update
        if (profileId) {
          await getShippingZonesByShippingProfileId(profileId);
        }
      } else {
        // Create new zone
        await createShippingZone({
          zoneName: shippingZoneName.trim(),
          shippingProfileId: profileId,
          countries: countriesArray,
        });
        // Refresh zones after creation
        if (profileId) {
          await getShippingZonesByShippingProfileId(profileId);
        }
      }
      handleCloseShippingZoneModal();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create shipping zone';
      setShippingZoneCreateError(msg);
    }
  };

  const handleOpenManageRatesModal = (location: FulfillmentLocationItem) => {
    setActiveManageLocation(location);
    // Pre-populate with existing settings if available
    const locationId = String(location.id).trim();
    const existingSettings = locationSettings[locationId] || location.contextSetting;
    let initialSelection: 'create' | 'remove' = 'create';
    if (existingSettings) {
      // If removeRates is true, select 'remove', otherwise select 'create'
      initialSelection = existingSettings.removeRates ? 'remove' : 'create';
    }
    manageRatesSelectionRef.current = initialSelection;
    setManageRatesSelection(initialSelection);
    setManageRatesModalOpen(true);
  };

  const handleCloseManageRatesModal = () => {
    setManageRatesModalOpen(false);
    setActiveManageLocation(null);
    // Don't reset manageRatesSelection here - it will be set when modal opens again
  };

  const handleSaveManageRates = async () => {
    if (!activeManageLocation || !profileId) return;
    
    // Ensure locationId is a valid string
    const locationId = String(activeManageLocation.id).trim();
    if (!locationId || locationId.length === 0) {
      console.error('Invalid locationId:', activeManageLocation.id);
      return;
    }
    
    // Read the current selection value from ref (always up-to-date)
    const currentSelection = manageRatesSelectionRef.current;
    
    // Determine the boolean values based on selection
    const createNewRates = currentSelection === 'create';
    const removeRates = currentSelection === 'remove';
    
    // Debug logging
    console.log('Saving location settings:', {
      locationId,
      currentSelection,
      stateValue: manageRatesSelection,
      refValue: manageRatesSelectionRef.current,
      createNewRates,
      removeRates,
    });
    
    const originalSetting = locationSettings[locationId] || activeManageLocation.contextSetting;
    const originalCreate = originalSetting ? originalSetting.createNewRates : true;
    const originalRemove = originalSetting ? originalSetting.removeRates : false;
    const selectionChanged = createNewRates !== originalCreate || removeRates !== originalRemove;

    if (!selectionChanged) {
      setManageRatesModalOpen(false);
      return;
    }

    try {
      await updateLocationSetting(profileId, locationId, { createNewRates, removeRates });
      setLocationSettings((prev) => ({
        ...prev,
        [locationId]: {
          createNewRates,
          removeRates,
        },
      }));
      setLocationSettingsChanged((prev) => ({
        ...prev,
        [locationId]: true,
      }));
    } catch (err) {
      console.error('Failed to update location setting:', err);
    } finally {
      setManageRatesModalOpen(false);
    }
  };

  const formatVariantLabel = (variant: ProductSearchVariant) => {
    const values = Object.values(variant.optionValues || {});
    if (values.length === 0) return variant.sku;
    return values.join(' / ');
  };

  const renderProductsTable = () => {
    if (productSearchLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      );
    }

    if (productSearchError) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs">
          {productSearchError}
        </div>
      );
    }

    if (!productSearchResults.length) {
      return (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-600">
            No products found.
          </p>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 overflow-hidden">
        <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
          <p className="flex-1 text-xs font-medium text-gray-600">
            Product
          </p>
          <p className="w-40 text-right text-xs font-medium text-gray-600">
            Profile
          </p>
        </div>
        <div>
          {productSearchResults.map((item) => {
            const allVariantsSelected = item.variants.every((variant) => variantEntryMap.has(variant._id));
            const someVariantsSelected =
              !allVariantsSelected && item.variants.some((variant) => variantEntryMap.has(variant._id));
            const productPending = pendingProductIds.has(item.product._id);
            return (
              <div key={item.product._id} className="border-b border-gray-100">
                <div className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allVariantsSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someVariantsSelected;
                    }}
                    onChange={() => handleProductToggle(item, allVariantsSelected)}
                    disabled={productPending}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 disabled:opacity-50"
                  />
                  <div className="w-9 h-9 bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      item.product.title?.charAt(0).toUpperCase() || 'P'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.product.sku || 'No SKU'}
                    </p>
                  </div>
                  <p className="w-40 text-right text-sm text-gray-600">
                    General shipping
                  </p>
                </div>
                {item.variants.map((variant) => {
                  const variantSelected = variantEntryMap.has(variant._id);
                  const variantPending = pendingVariantIds.has(variant._id) || productPending;
                  return (
                    <div
                      key={variant._id}
                      className="flex items-center gap-3 px-3 py-1 pl-12"
                    >
                      <input
                        type="checkbox"
                        checked={variantSelected}
                        onChange={() => handleVariantToggle(variant)}
                        disabled={variantPending}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {formatVariantLabel(variant)}
                        </p>
                        <p className="text-xs text-gray-600">
                          SKU: {variant.sku}
                        </p>
                      </div>
                      <p className="w-40 text-right text-sm text-gray-600">
                        General shipping
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const productVariantEntries = useMemo(
    () => (profileId ? productVariantEntriesByProfileId[profileId] || [] : []),
    [profileId, productVariantEntriesByProfileId]
  );
  const selectedCount = productVariantEntries.length;

  const variantEntryMap = useMemo(() => {
    const map = new Map<string, ShippingProfileProductVariantEntry>();
    productVariantEntries.forEach((entry) => {
      const variantId =
        typeof entry.productVariantId === 'string'
          ? entry.productVariantId
          : entry.productVariantId?._id;
      if (variantId) {
        map.set(String(variantId), entry);
      }
    });
    return map;
  }, [productVariantEntries]);

  const handleVariantToggle = async (variant: ProductSearchVariant) => {
    if (!profileId) return;
    const variantId = variant._id;
    setPendingVariantIds((prev) => new Set(prev).add(variantId));
    try {
      const existingEntry = variantEntryMap.get(variantId);
      if (existingEntry) {
        await deleteProductVariantEntry(existingEntry._id, profileId);
      } else {
        await addProductVariantEntry(profileId, { productVariantId: variantId });
      }
    } catch (err) {
      console.error('Failed to toggle product variant entry:', err);
    } finally {
      setPendingVariantIds((prev) => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }
  };

  const handleProductToggle = async (item: ProductSearchWithVariantsItem, currentlySelected: boolean) => {
    if (!profileId) return;
    const productId = item.product._id;
    setPendingProductIds((prev) => new Set(prev).add(productId));
    try {
      if (currentlySelected) {
        const entriesToRemove = item.variants
          .map((variant) => variantEntryMap.get(variant._id))
          .filter((entry): entry is ShippingProfileProductVariantEntry => Boolean(entry));
        for (const entry of entriesToRemove) {
          await deleteProductVariantEntry(entry._id, profileId);
        }
      } else {
        const variantsToAdd = item.variants.filter((variant) => !variantEntryMap.has(variant._id));
        for (const variant of variantsToAdd) {
          await addProductVariantEntry(profileId, { productVariantId: variant._id });
        }
      }
    } catch (err) {
      console.error('Failed to toggle product variants:', err);
    } finally {
      setPendingProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const toggleCountrySelection = (country: MarketCountry) => {
    const countryId = country._id;
    const isSelected = selectedCountries.has(countryId);

    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      return next;
    });

    if (isSelected) {
      const states = statesByCountry[countryId];
      if (states?.length) {
        setSelectedStateIds((prev) => {
          const next = new Set(prev);
          states.forEach((state) => next.delete(state._id));
          return next;
        });
      }
    } else {
      const states = statesByCountry[countryId];
      if (states?.length) {
        setSelectedStateIds((prev) => {
          const next = new Set(prev);
          states.forEach((state) => next.add(state._id));
          return next;
        });
      } else {
        fetchStatesForCountry(countryId).then((fetchedStates) => {
          if (!fetchedStates?.length) return;
          if (!selectedCountriesRef.current.has(countryId)) return;
          setSelectedStateIds((prev) => {
            const next = new Set(prev);
            fetchedStates.forEach((state) => next.add(state._id));
            return next;
          });
        });
      }
    }
  };

  const toggleCountryExpanded = useCallback(
    (country: MarketCountry) => {
      setExpandedCountries((prev) => {
        const next = new Set(prev);
        if (next.has(country._id)) {
          next.delete(country._id);
        } else {
          next.add(country._id);
          void fetchStatesForCountry(country._id);
        }
        return next;
      });
    },
    [fetchStatesForCountry]
  );

  const toggleStateSelection = useCallback(
    (country: MarketCountry, state: StateItem) => {
      setSelectedStateIds((prev) => {
        const next = new Set(prev);
        if (next.has(state._id)) {
          next.delete(state._id);
        } else {
          next.add(state._id);
        }

        const states = statesByCountry[country._id] || [];
        if (states.length) {
          const allSelected = states.every((item) => next.has(item._id));
          setSelectedCountries((prevCountries) => {
            const nextCountries = new Set(prevCountries);
            if (allSelected) {
              nextCountries.add(country._id);
            } else {
              nextCountries.delete(country._id);
            }
            return nextCountries;
          });
        }

        return next;
      });
    },
    [statesByCountry]
  );

  const getCountrySelectionLabel = (country: MarketCountry) => {
    if (loadingCountryStates.has(country._id)) {
      return 'Loading states...';
    }

    const statesForCountry = statesByCountry[country._id];
    if (Array.isArray(statesForCountry)) {
      const statesCount = statesForCountry.length;
      const selectedCount = statesForCountry.filter((state) => selectedStateIds.has(state._id)).length;
      const suffix = statesCount === 1 ? 'state' : 'states';
      return `${selectedCount} of ${statesCount} ${suffix}`;
    }

    if (selectedCountries.has(country._id)) {
      return 'Selected';
    }

    return '';
  };

  const renderShippingCountries = () => {
    if (!filteredCountries.length) {
      return (
        <div className="border border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-600">
            No countries available. Add countries to your markets to see them here.
          </p>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 overflow-hidden">
        {filteredCountries.map((country) => {
          const normalizedCountryId = String(
            country._id ?? (country as any).countryId ?? (country as any).id ?? ''
          );
          const countrySelected = selectedCountries.has(country._id);
          const countryLabel = getCountrySelectionLabel(country);
          const countrySymbol = country.flagEmoji || country.iso2?.toUpperCase() || '??';
          const statesForCountry = statesByCountry[country._id];
          const isExpanded = expandedCountries.has(country._id);
          const countryReservedLabel =
            normalizedCountryId && reservedCountriesMap.get(normalizedCountryId);
          const countryDisabled = Boolean(countryReservedLabel);

          return (
            <div key={country._id} className="border-b border-gray-100">
              <div className="flex items-center gap-3 px-3 py-2">
                <input
                  type="checkbox"
                  checked={countrySelected}
                  onChange={() => toggleCountrySelection(country)}
                  disabled={countryDisabled}
                  className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 disabled:opacity-50"
                />
                <div className="w-8 h-8 flex items-center justify-center text-base">
                  {countrySymbol}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {country.name}
                  </p>
                  {countryDisabled ? (
                    <p className="text-xs text-gray-400 font-medium">
                      In another zone
                    </p>
                  ) : countryLabel ? (
                    <p className="text-xs text-gray-600">
                      {countryLabel}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => toggleCountryExpanded(country)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isExpanded && (
                <div className="pl-12 pr-3 pb-2">
                  {loadingCountryStates.has(country._id) ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                      <p className="text-xs text-gray-600">
                        Loading states...
                      </p>
                    </div>
                  ) : statesForCountry && statesForCountry.length > 0 ? (
                    <div className="space-y-1">
                      {statesForCountry.map((state) => {
                        const stateId = String(state._id);
                        const stateSelected = selectedStateIds.has(state._id);
                        const stateReservedLabel =
                          reservedCountriesMap.get(normalizedCountryId) ||
                          (stateId ? reservedStatesMap.get(stateId) : undefined);
                        const stateDisabled = Boolean(stateReservedLabel);
                        return (
                          <div
                            key={state._id}
                            className="flex items-center gap-2 py-1"
                          >
                            <input
                              type="checkbox"
                              checked={stateSelected && !stateDisabled}
                              onChange={() => toggleStateSelection(country, state)}
                              disabled={stateDisabled}
                              className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400 disabled:opacity-50"
                            />
                            <div className="flex-1">
                              <p className={`text-sm ${stateDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                                {state.name}
                              </p>
                              {!stateDisabled && state.code && (
                                <p className="text-xs text-gray-600">
                                  {state.code}
                                </p>
                              )}
                            </div>
                            {stateDisabled && (
                              <p className="text-xs text-gray-400 font-medium">
                                In another zone
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 py-2">
                      No states available
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedShippingZoneCount = selectedCountries.size + selectedStateIds.size;
  const profileTitle = currentProfile?.profileName || 'Shipping profile';

  useEffect(() => {
    if (currentProfile?.profileName !== undefined) {
      setNextProfileName(currentProfile.profileName);
    }
  }, [currentProfile?.profileName]);

  // Track if initial state has been captured to prevent re-capturing
  const initialStateCapturedRef = useRef<boolean>(false);
  const lastProfileIdRef = useRef<string | undefined>(undefined);
  const [profileDataLoaded, setProfileDataLoaded] = useState<boolean>(false);

  // Reset capture flag when profileId changes
  useEffect(() => {
    if (profileId !== lastProfileIdRef.current) {
      initialStateCapturedRef.current = false;
      setProfileDataLoaded(false);
      lastProfileIdRef.current = profileId;
    }
  }, [profileId]);

  // Populate state from profile data when profile loads
  useEffect(() => {
    if (!currentProfile || !profileId || profileFetching) return;
    
    // Only populate if we haven't captured initial state yet
    if (!initialStateCapturedRef.current && !profileDataLoaded) {
      // Populate locationSettings from profile
      if (currentProfile.locationSettings && currentProfile.locationSettings.length > 0) {
        const settingsMap: Record<string, { createNewRates: boolean; removeRates: boolean }> = {};
        currentProfile.locationSettings.forEach((setting) => {
          // Ensure locationId is a string and normalized (trimmed) consistently
          const locationId = String(setting.locationId).trim();
          if (locationId && locationId.length > 0) {
            settingsMap[locationId] = {
              createNewRates: setting.createNewRates,
              removeRates: setting.removeRates,
            };
          }
        });
        console.log('Populated locationSettings from profile:', settingsMap);
        setLocationSettings(settingsMap);
      }
      
      // Mark profile data as loaded
      setProfileDataLoaded(true);
    }
  }, [profileId, currentProfile, profileFetching]);

  // Initialize state when profile loads - capture initial state after data is ready (ONLY ONCE)
  useEffect(() => {
    if (!currentProfile || !profileId || profileFetching) return;
    if (initialStateCapturedRef.current) return; // Don't re-capture if already done
    if (!profileDataLoaded) return; // Wait for profile data to be loaded first
    
    // Capture initial state immediately after profile data is loaded
    // Use a small delay to ensure state updates have been processed
    const timer = setTimeout(() => {
      setInitialLocationSettings({ ...locationSettings });
      setInitialShippingZoneIds(new Set(shippingZones.map((z: any) => z._id)));
      initialStateCapturedRef.current = true; // Mark as captured
    }, 100); // Small delay to ensure state updates are processed
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, currentProfile, profileFetching, profileDataLoaded, shippingZones.length]); // Wait for profile data to be loaded

  // Track changes to show save button
  useEffect(() => {
    // If initial state hasn't been captured yet, don't show button unless there's actual data
    if (!initialStateCapturedRef.current) {
      if (Object.keys(locationSettings).length === 0 && shippingZones.length === 0) {
        setHasUnsavedChanges(false);
      }
      return;
    }
    
    // Deep comparison of location settings
    const locationSettingsChanged = (() => {
      const currentKeys = Object.keys(locationSettings);
      const initialKeys = Object.keys(initialLocationSettings);
      
      // Check if number of locations changed
      if (currentKeys.length !== initialKeys.length) {
        return true;
      }
      
      // Check if any location is missing or has different settings
      for (const locId of currentKeys) {
        const current = locationSettings[locId];
        const initial = initialLocationSettings[locId];
        
        if (!initial) {
          return true; // New location added
        }
        
        if (current.createNewRates !== initial.createNewRates || 
            current.removeRates !== initial.removeRates) {
          return true; // Settings changed
        }
      }
      
      // Check if any initial location was removed
      for (const locId of initialKeys) {
        if (!locationSettings[locId]) {
          return true; // Location removed
        }
      }
      
      return false;
    })();
    
    const shippingZonesChanged = 
      shippingZones.length !== initialShippingZoneIds.size ||
      shippingZones.some((zone: any) => !initialShippingZoneIds.has(zone._id)) ||
      Array.from(initialShippingZoneIds).some(id => !shippingZones.find((z: any) => z._id === id));
    
    const profileNameChanged = nextProfileName.trim() !== (currentProfile?.profileName || '').trim();
    
    setHasUnsavedChanges(profileNameChanged || locationSettingsChanged || shippingZonesChanged);
  }, [locationSettings, shippingZones, nextProfileName, currentProfile?.profileName, initialLocationSettings, initialShippingZoneIds]);

  const handleSave = async () => {
    if (!profileId) return;
    const trimmedName = nextProfileName.trim();
    if (!trimmedName) {
      setNextProfileName(currentProfile?.profileName || 'Shipping profile');
      setIsEditingProfileName(false);
      return;
    }

    try {
      await updateShippingProfile(profileId, {
        profileName: trimmedName,
      });
      setHasUnsavedChanges(false);
      setIsEditingProfileName(false);
    } catch (err: any) {
      console.error('Failed to update shipping profile:', err);
    }
  };

  if (!profileId) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Invalid profile</h2>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to shipping settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profileFetching && !currentProfile) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping profile not found</h2>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to shipping settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="mt-0.5 inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
              aria-label="Back to shipping"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              {isEditingProfileName ? (
                <input
                  type="text"
                  value={nextProfileName}
                  onChange={(e) => setNextProfileName(e.target.value)}
                  autoFocus
                  onBlur={() => setIsEditingProfileName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setIsEditingProfileName(false);
                    }
                  }}
                  className="w-full text-2xl font-bold text-gray-900 tracking-tight border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 min-w-0"
                />
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {nextProfileName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfileName(true)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Edit profile name"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Manage products, locations, and shipping zones for this profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={handleOpenActionsMenu}
                className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                Actions
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {actionsAnchor && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-sm z-10 min-w-[160px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteProfileDialogOpen(true);
                      handleCloseActionsMenu();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Delete profile
                  </button>
                </div>
              )}
            </div>
            {(hasUnsavedChanges || (nextProfileName.trim() !== (currentProfile?.profileName || '').trim())) && (
              <button
                type="button"
                onClick={handleSave}
                disabled={profileUpdateLoading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors min-w-[100px] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {profileUpdateLoading ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-6">

          {/* Products Section */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900">Products</h2>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Add products that use this shipping profile.
            </p>
            <button
              type="button"
              onClick={handleOpenProductModal}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BuildingStorefrontIcon className="w-4 h-4" />
              Add products
            </button>
            {productVariantEntries.length === 0 ? (
              <p className="text-sm text-gray-500 mt-3">No products selected yet.</p>
            ) : (
              <div className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50/80 border-b border-gray-200 px-4 py-2.5">
                  <p className="text-sm font-medium text-gray-700">Selected ({selectedCount})</p>
                </div>
                <div className="p-3 space-y-2">
                  {productVariantEntries.map((entry) => {
                    const variant: any =
                      typeof entry.productVariantId === 'string'
                        ? { _id: entry.productVariantId }
                        : entry.productVariantId;
                    const product =
                      variant && typeof variant.productId === 'object' ? variant.productId : null;
                    const variantLabel = variant?.optionValues
                      ? Object.values(variant.optionValues).filter(Boolean).join(' / ')
                      : variant?.sku || 'Variant';
                    const imageUrl =
                      product?.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : undefined;

                    return (
                      <div key={entry._id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600 shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product?.title || 'Product'} className="w-full h-full object-cover" />
                          ) : (
                            variantLabel?.charAt(0).toUpperCase() || 'P'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product?.title || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{variantLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEntryPendingDeletion(entry)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          aria-label="Remove product"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment Locations Section */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900">Fulfillment locations</h2>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Locations that fulfill orders for this profile and their rate settings.
            </p>

            {locationSettingsContextLoading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading locations…</p>
              </div>
            ) : locationSettingsContextError ? (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {locationSettingsContextError}
              </div>
            ) : fulfillmentLocations.length === 0 ? (
              <p className="text-sm text-gray-500">No fulfillment locations available for this profile.</p>
            ) : (
              <div className="space-y-3">
                {fulfillmentLocations.map((location, index) => {
                  const normalizedLocationId = String(location.id).trim();
                  const effectiveSetting =
                    locationSettings[normalizedLocationId] || location.contextSetting;
                  const creatingNewRates = effectiveSetting ? effectiveSetting.createNewRates : true;
                  return (
                    <div
                      key={location.id}
                      className={`rounded-lg border border-gray-200 bg-gray-50/50 p-4 ${index > 0 ? 'mt-3' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{location.name}</p>
                          {location.country && (
                            <p className="text-sm text-gray-500 mt-0.5">{location.country}</p>
                          )}
                          {location.address && (
                            <p className="text-sm text-gray-500 mt-0.5">{location.address}</p>
                          )}
                          <div className="mt-2">
                            {creatingNewRates ? (
                              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                Creating new rates
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
                                Rates removed for this profile
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenManageRatesModal(location)}
                          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-900">Shipping zones</h3>
                <button
                  type="button"
                  onClick={() => handleOpenShippingZoneModal()}
                  className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Add shipping zone
                </button>
              </div>

              {shippingZoneLoading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Loading zones…</p>
                </div>
              ) : shippingZones.length === 0 ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>Add a zone and rate to ship from these locations.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingZones.map((zone: any) => {
                    const firstCountry = zone.countries?.[0];
                    const hasMultipleCountries = zone.countries?.length > 1;
                    const countryName = firstCountry?.countryName || 'Unknown';
                    const countryFlag = firstCountry?.countryFlag || '';
                    const selectedStates = firstCountry?.selectedStatesCount || 0;
                    const totalStates = firstCountry?.totalStatesCount || 0;
                    const hasStates = selectedStates > 0;

                    return (
                      <div key={zone._id} className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 hover:bg-gray-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            {countryFlag && (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">
                                {countryFlag}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {zone.zoneName}
                                {hasMultipleCountries ? (
                                  <span className="text-sm text-gray-500 ml-1">
                                    · {zone.countries.length} countries
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-500 ml-1">
                                      · {countryName}
                                    </span>
                                    {hasStates && (
                                      <span className="text-sm text-gray-500 ml-1">
                                        ({selectedStates} of {totalStates} {totalStates === 1 ? 'state' : 'states'})
                                      </span>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => setZoneMenuAnchor({ element: e.currentTarget, zoneId: zone._id })}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                aria-label="Zone options"
                              >
                                <EllipsisHorizontalIcon className="w-5 h-5" />
                              </button>
                              {zoneMenuAnchor?.zoneId === zone._id && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-sm z-10 min-w-[120px] overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const zoneToEdit = shippingZones.find((z: any) => z._id === zoneMenuAnchor?.zoneId);
                                      setZoneMenuAnchor(null);
                                      if (zoneToEdit) {
                                        handleOpenShippingZoneModal(zoneToEdit);
                                      }
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const zoneId = zoneMenuAnchor?.zoneId;
                                      setZoneMenuAnchor(null);
                                      if (!zoneId) return;
                                      const zoneToDelete = shippingZones.find((z: any) => z._id === zoneId);
                                      setZonePendingDeletion({
                                        id: zoneId,
                                        name: zoneToDelete?.zoneName || 'this',
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Rates list */}
                        {ratesLoading[zone._id] ? (
                          <div className="px-4 py-4 flex items-center justify-center gap-2 border-t border-gray-100">
                            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Loading rates…</span>
                          </div>
                        ) : zoneRates[zone._id] && zoneRates[zone._id].length > 0 ? (
                          <div className="px-4 pb-4 pt-0 space-y-2 border-t border-gray-100">
                            {zoneRates[zone._id].map((rate: ShippingZoneRate) => {
                              const priceValue =
                                typeof rate.price === 'number'
                                  ? rate.price
                                  : parseFloat(String(rate.price));
                              const normalizedPrice = Number.isFinite(priceValue) ? priceValue : 0;

                              return (
                                <div
                                  key={rate._id}
                                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 flex items-center justify-between gap-2"
                                >
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {rate.customRateName}
                                  </p>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                      normalizedPrice === 0 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {normalizedPrice === 0 ? 'Free' : `₹${normalizedPrice.toFixed(2)}`}
                                    </span>
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                                          setRateMenuAnchor({
                                            element: e.currentTarget,
                                            zoneId: zone._id,
                                            zoneName: zone.zoneName,
                                            rate,
                                          })
                                        }
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 transition-colors"
                                        aria-label="Rate options"
                                      >
                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                      </button>
                                      {rateMenuAnchor?.zoneId === zone._id && rateMenuAnchor?.rate._id === rate._id && (
                                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-sm z-10 min-w-[120px] overflow-hidden">
                                          <button
                                            type="button"
                                            onClick={handleEditRateFromMenu}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                          >
                                            Edit rate
                                          </button>
                                          <button
                                            type="button"
                                            onClick={handleDeleteRateFromMenu}
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mx-4 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-start gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>No rates. Customers in this zone won&apos;t be able to complete checkout.</span>
                          </div>
                        )}
                        
                        <div className="px-4 pb-4">
                          <button
                            type="button"
                            onClick={() => handleOpenRateModalForZone(zone)}
                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                          >
                            <TruckIcon className="w-4 h-4" />
                            Add rate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Start shipping to more places Section */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-900">
                Start shipping to more places
              </h2>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600" title="Info">
                i
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Add countries/regions to a market to start selling and manage localized settings, including shipping zones
            </p>
            <button
              type="button"
              onClick={() => navigate('/markets')}
              className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Markets
            </button>
            <RouterLink
              to="/settings/markets"
              className="block mt-3 text-xs text-gray-600 hover:text-gray-900"
            >
              233 countries/regions not in a market
            </RouterLink>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <Modal
        open={productModalOpen}
        onClose={handleCloseProductModal}
        maxWidth="md"
        title="Manage products"
        actions={
          <>
            <button
              onClick={handleCloseProductModal}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseProductModal}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="Search products"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <select
              value="all"
              disabled
              className="px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 w-[180px] bg-gray-50"
            >
              <option value="all">Search by All</option>
            </select>
          </div>

          <button
            disabled
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-400 w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add filter +
          </button>

          {productSearchPagination && (
            <p className="text-xs text-gray-600">
              Showing {productSearchResults.length} of {productSearchPagination.total} products
            </p>
          )}

          {renderProductsTable()}
        </div>
      </Modal>

      {/* Delete Variant Modal */}
      <Modal
        open={Boolean(entryPendingDeletion)}
        onClose={() => setEntryPendingDeletion(null)}
        maxWidth="sm"
        title="Remove Variant?"
        actions={
          <>
            <button
              onClick={() => setEntryPendingDeletion(null)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                if (entryPendingDeletion && profileId) {
                  void deleteProductVariantEntry(entryPendingDeletion._id, profileId).finally(() => {
                    setEntryPendingDeletion(null);
                  });
                } else {
                  setEntryPendingDeletion(null);
                }
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Yes
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this product variant from{' '}
            <span className="font-medium text-gray-900">
              {profileTitle}
            </span>{' '}
            shipping profile?
          </p>
          {entryPendingDeletion && (
            <p className="text-sm font-medium text-gray-900 mt-2">
              {(() => {
                const variant =
                  typeof entryPendingDeletion.productVariantId === 'string'
                    ? null
                    : entryPendingDeletion.productVariantId;
                if (!variant) {
                  return String(entryPendingDeletion.productVariantId);
                }
                const product =
                  variant && typeof variant.productId === 'object' ? variant.productId : null;
                const variantLabel = variant.optionValues
                  ? Object.values(variant.optionValues)
                      .filter(Boolean)
                      .join(' / ')
                  : variant.sku;
                return `${product?.title || 'Product'} • ${variantLabel || 'Variant'}`;
              })()}
            </p>
          )}
        </div>
      </Modal>

      {/* Manage Rates Modal */}
      <Modal
        open={manageRatesModalOpen}
        onClose={handleCloseManageRatesModal}
        maxWidth="sm"
        title={`Manage rates for ${activeManageLocation?.name || 'location'}`}
        actions={
          <>
            <button
              onClick={handleCloseManageRatesModal}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveManageRates}
              disabled={!manageRatesSelection}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Create new rates
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="create"
                checked={manageRatesSelection === 'create'}
                onChange={(e) => {
                  const newValue = e.target.value as 'create' | 'remove';
                  manageRatesSelectionRef.current = newValue;
                  setManageRatesSelection(newValue);
                }}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700">
                New rate for {activeManageLocation?.name || 'this location'}
              </span>
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Remove rates
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="remove"
                checked={manageRatesSelection === 'remove'}
                onChange={(e) => {
                  const newValue = e.target.value as 'create' | 'remove';
                  manageRatesSelectionRef.current = newValue;
                  setManageRatesSelection(newValue);
                }}
                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700">
                This location will no longer ship the products in this profile
              </span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Shipping Zone Modal */}
      <Modal
        open={shippingZoneModalOpen}
        onClose={handleCloseShippingZoneModal}
        maxWidth="md"
        title={editingZone ? 'Edit shipping zone' : 'Create new shipping zone'}
        actions={
          <>
            <button
              onClick={handleCloseShippingZoneModal}
              disabled={shippingZoneLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {shippingZoneCreateError && (
              <span className="text-xs text-red-600 mr-2">
                {shippingZoneCreateError}
              </span>
            )}
            <button
              onClick={handleCreateShippingZone}
              disabled={!shippingZoneName.trim() || selectedShippingZoneCount === 0 || shippingZoneLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shippingZoneLoading ? 'Creating...' : 'Done'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Zone name
            </p>
            <input
              type="text"
              value={shippingZoneName}
              onChange={(e) => setShippingZoneName(e.target.value)}
              placeholder=""
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 mt-1"
            />
            <p className="text-xs text-gray-600 mt-1">
              Customers won't see this
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Shipping zones
            </p>
            <div className="relative mb-3">
              <input
                type="text"
                value={shippingZoneSearch}
                onChange={(e) => setShippingZoneSearch(e.target.value)}
                placeholder="Search countries and regions to ship to"
                className="w-full px-3 py-1.5 pl-10 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {shippingZoneCountriesLoading ? (
              <div className="border border-gray-200 py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : shippingZoneCountriesError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs">
                {shippingZoneCountriesError}
              </div>
            ) : (
              renderShippingCountries()
            )}
            <RouterLink
              to="/settings/markets"
              className="inline-block mt-3 text-xs text-gray-600 hover:text-gray-900"
            >
              Add more countries/regions in Markets
            </RouterLink>
          </div>
        </div>
      </Modal>

      {/* Add Rate Modal */}
      <Modal
        open={addRateModalOpen}
        onClose={handleCloseRateModal}
        maxWidth="sm"
        title={editingRateId ? 'Edit rate' : 'Add rate'}
        actions={
          <>
            <button
              onClick={handleCloseRateModal}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRate}
              disabled={!customRateName.trim() || rateType === 'carrier' || rateLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rateLoading ? 'Saving...' : editingRateId ? 'Save' : 'Done'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Rate type */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Rate type
            </p>
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="flat">Use flat rate</option>
              <option value="carrier">Use carrier or app to calculate rates</option>
            </select>
            {rateType === 'carrier' && (
              <div className="mt-2 bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 text-xs flex items-start justify-between gap-2">
                <span>There are no carriers or apps available for this zone. Change back to flat rate</span>
                <button
                  onClick={() => setRateType('flat')}
                  className="text-blue-600 underline font-medium shrink-0"
                >
                  Change back to flat rate
                </button>
              </div>
            )}
          </div>

          {rateType === 'flat' && (
            <>
              {/* Shipping rate */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Shipping rate
                </p>
                <select
                  value={shippingRate}
                  onChange={(e) => setShippingRate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Custom rate name */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Custom rate name
                </p>
                <input
                  type="text"
                  value={customRateName}
                  onChange={(e) => setCustomRateName(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Custom delivery description */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Custom delivery description (optional)
                </p>
                <select
                  value={customDeliveryDescription}
                  onChange={(e) => setCustomDeliveryDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">None</option>
                  {deliverySuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion}>
                      {suggestion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Price
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setPrice(value);
                      }}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <button
                    onClick={() => setPrice('0.00')}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors min-w-[80px]"
                  >
                    Free
                  </button>
                </div>
              </div>

              {/* Conditional pricing section */}
              {conditionalPricingEnabled ? (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setConditionalPricingEnabled(false);
                      setConditionalPricingBasis('weight');
                      setMinWeight('0');
                      setMaxWeight('');
                      setMinPrice('0.00');
                      setMaxPrice('');
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900 underline mb-3 block"
                  >
                    Remove conditional pricing
                  </button>
                  <div className="mb-3 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="weight"
                        checked={conditionalPricingBasis === 'weight'}
                        onChange={(e) => setConditionalPricingBasis(e.target.value as 'weight' | 'price')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
                      />
                      <span className="text-sm text-gray-700">Based on item weight</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="price"
                        checked={conditionalPricingBasis === 'price'}
                        onChange={(e) => setConditionalPricingBasis(e.target.value as 'weight' | 'price')}
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-400"
                      />
                      <span className="text-sm text-gray-700">Based on order price</span>
                    </label>
                  </div>
                  {conditionalPricingBasis === 'weight' ? (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Minimum weight
                        </p>
                        <div className="relative">
                          <input
                            type="text"
                            value={minWeight}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setMinWeight(value);
                            }}
                            placeholder="0"
                            className="w-full px-3 py-1.5 pr-12 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">kg</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Maximum weight
                        </p>
                        <div className="relative">
                          <input
                            type="text"
                            value={maxWeight}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setMaxWeight(value);
                            }}
                            placeholder="No limit"
                            className="w-full px-3 py-1.5 pr-12 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">kg</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Minimum price
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                          <input
                            type="text"
                            value={minPrice}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setMinPrice(value);
                            }}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Maximum price
                        </p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">₹</span>
                          <input
                            type="text"
                            value={maxPrice}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9.]/g, '');
                              setMaxPrice(value);
                            }}
                            placeholder="No limit"
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setConditionalPricingEnabled(true)}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Add conditional pricing
                </button>
              )}

              {/* Checkout preview */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Checkout preview
                </p>
                <div className="border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-gray-900 border-gray-300"
                      />
                      <p className="text-sm text-gray-900">
                        {customRateName || 'Rate name'}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {parseFloat(price) === 0 ? 'FREE' : `₹ ${parseFloat(price).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Profile Modal */}
      <Modal
        open={deleteProfileDialogOpen}
        onClose={() => {
          if (deleteProfileLoading) return;
          setDeleteProfileDialogOpen(false);
        }}
        maxWidth="sm"
        title="Delete shipping profile"
        actions={
          <>
            <button
              onClick={() => {
                if (deleteProfileLoading) return;
                setDeleteProfileDialogOpen(false);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
            <button
              onClick={handleConfirmDeleteProfile}
              disabled={deleteProfileLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteProfileLoading ? 'Deleting...' : 'Yes'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">
            {currentProfile?.profileName || 'this'}
          </span>{' '}
          shipping profile?
        </p>
      </Modal>

      {/* Delete Zone Modal */}
      <Modal
        open={Boolean(zonePendingDeletion)}
        onClose={() => {
          if (zoneDeleteLoading) return;
          setZonePendingDeletion(null);
        }}
        maxWidth="sm"
        title="Delete shipping zone"
        actions={
          <>
            <button
              onClick={() => {
                if (zoneDeleteLoading) return;
                setZonePendingDeletion(null);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
            <button
              onClick={handleConfirmDeleteZone}
              disabled={zoneDeleteLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {zoneDeleteLoading ? 'Deleting...' : 'Yes'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">
            {zonePendingDeletion?.name || 'this'}
          </span>{' '}
          shipping zone?
        </p>
      </Modal>

      {/* Delete Rate Modal */}
      <Modal
        open={Boolean(ratePendingDeletion)}
        onClose={() => {
          if (rateDeleteLoading) return;
          setRatePendingDeletion(null);
        }}
        maxWidth="sm"
        title="Delete shipping rate"
        actions={
          <>
            <button
              onClick={() => {
                if (rateDeleteLoading) return;
                setRatePendingDeletion(null);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              No
            </button>
            <button
              onClick={handleConfirmDeleteRate}
              disabled={rateDeleteLoading}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rateDeleteLoading ? 'Deleting...' : 'Yes'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">
            {ratePendingDeletion?.rate.customRateName || 'this'}
          </span>{' '}
          shipping zone rate from{' '}
          <span className="font-medium text-gray-900">
            {ratePendingDeletion?.zoneName || 'this'}
          </span>{' '}
          shipping zone?
        </p>
      </Modal>
    </div>
  );
};

export default ShippingProfileDetailsPage;

