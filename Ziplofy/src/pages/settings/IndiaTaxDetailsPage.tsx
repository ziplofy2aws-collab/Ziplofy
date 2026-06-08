import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ShoppingBag as BagIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useCountries } from '../../contexts/country.context';
import { useStates } from '../../contexts/state.context';
import { useTaxRateDefaults } from '../../contexts/tax-rate-default.context';
import { useTaxRateOverrides } from '../../contexts/tax-rate-override.context';
import { useShippingOverrides } from '../../contexts/shipping-override.context';
import { useProductOverrides } from '../../contexts/product-override.context';
import { useProductOverrideEntries } from '../../contexts/product-override-entry.context';
import { useCountryTax } from '../../contexts/country-tax.context';
import { useCountryTaxOverride } from '../../contexts/country-tax-override.context';
import { useStore } from '../../contexts/store.context';
import { useCollections, Collection } from '../../contexts/collection.context';
import { SettingsHero } from '../../components/settings/SettingsPageScaffold';

const IndiaTaxDetailsPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const { countries, getCountries } = useCountries();
  const { getStatesByCountryId, statesByCountry, loading: statesLoading } = useStates();
  const { taxDefaults, loading: taxDefaultsLoading, getTaxDefaultsByCountryId } = useTaxRateDefaults();
  const { createTaxRate, updateTaxRate, deleteTaxRate, deleteTaxOverridesByStoreAndCountry, getTaxRatesByStoreId } = useTaxRateOverrides();
  const { 
    getShippingOverridesByStoreAndCountry, 
    createShippingOverride, 
    updateShippingOverride, 
    deleteShippingOverride 
  } = useShippingOverrides();
  const {
    getProductOverridesByStoreAndCountry,
    createProductOverride,
    deleteProductOverride,
  } = useProductOverrides();
  const {
    createProductOverrideEntry,
    getProductOverrideEntriesByProductOverrideId,
    deleteProductOverrideEntry,
  } = useProductOverrideEntries();
  const { getCountryTaxByCountryId, countryTaxMap } = useCountryTax();
  const { 
    createCountryTaxOverride,
    getCountryTaxOverrideByStoreAndCountry,
    updateCountryTaxOverrideByStoreAndCountry,
    deleteCountryTaxOverrideByStoreAndCountry,
    countryTaxOverrideMap 
  } = useCountryTaxOverride();
  const { activeStoreId } = useStore();
  const { searchCollections } = useCollections();
  const [country, setCountry] = useState<any>(null);
  // Removed indiaFederalRate - now using currentCountryTaxRate computed value
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [addOverrideModalOpen, setAddOverrideModalOpen] = useState<boolean>(false);
  const [overrideType, setOverrideType] = useState<'products' | 'shipping'>('products');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>('');
  const [overrideCollectionContext, setOverrideCollectionContext] = useState<string | null>(null);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');
  const [collectionSearchResults, setCollectionSearchResults] = useState<Collection[]>([]);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState<boolean>(false);
  const [collectionSearchPage, setCollectionSearchPage] = useState<number>(1);
  const [collectionPagination, setCollectionPagination] = useState<any>(null);
  const [overrideLocation, setOverrideLocation] = useState<string>('india');
  const [overrideTaxRate, setOverrideTaxRate] = useState<number>(9);
  const [editingTaxDefault, setEditingTaxDefault] = useState<any>(null);
  const [taxOverrides, setTaxOverrides] = useState<any[]>([]);
  const [productOverrides, setProductOverrides] = useState<any[]>([]);
  const [productOverrideError, setProductOverrideError] = useState<string | null>(null);
  const [productMenuState, setProductMenuState] = useState<{
    anchorEl: HTMLElement | null;
    overrideId: string | null;
    collectionName: string;
  }>({
    anchorEl: null,
    overrideId: null,
    collectionName: '',
  });
  const [shippingOverrides, setShippingOverrides] = useState<any[]>([]);
  const [productOverrideEntries, setProductOverrideEntries] = useState<Record<string, any[]>>({});
  const [editingOverrideRate, setEditingOverrideRate] = useState<number>(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteOverrideId, setDeleteOverrideId] = useState<string | null>(null);
  const [deleteOverrideRegionName, setDeleteOverrideRegionName] = useState<string>('');
  const [deleteOverrideCollectionName, setDeleteOverrideCollectionName] = useState<string>('');
  const [deleteOverrideIsShipping, setDeleteOverrideIsShipping] = useState<boolean>(false);
  const [deleteOverrideIsProductEntry, setDeleteOverrideIsProductEntry] = useState<boolean>(false);
  const [deleteOverrideProductOverrideId, setDeleteOverrideProductOverrideId] = useState<string | null>(null);
  const [editShippingModalOpen, setEditShippingModalOpen] = useState<boolean>(false);
  const [editingShippingOverride, setEditingShippingOverride] = useState<any>(null);
  const [editShippingTaxRate, setEditShippingTaxRate] = useState<number>(0);
  const [editCountryTaxModalOpen, setEditCountryTaxModalOpen] = useState<boolean>(false);
  const [editCountryTaxRate, setEditCountryTaxRate] = useState<number>(0);
  const [resetCountryTaxModalOpen, setResetCountryTaxModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<{
    taxRate: number;
    taxLabel: string;
    calculationMethod: 'added' | 'instead' | 'compounded' | null;
  }>({
    taxRate: 0,
    taxLabel: '',
    calculationMethod: 'instead',
  });

  useEffect(() => {
    getCountries({ limit: 1000 });
  }, [getCountries]);

  useEffect(() => {
    if (countries.length > 0 && countryId) {
      const foundCountry = countries.find((c) => c._id === countryId);
      if (foundCountry) {
        setCountry(foundCountry);
        getStatesByCountryId(foundCountry._id);
      }
    }
  }, [countries, countryId, getStatesByCountryId]);

  // Fetch country tax when countryId is available
  useEffect(() => {
    if (countryId) {
      getCountryTaxByCountryId(countryId);
    }
  }, [countryId, getCountryTaxByCountryId]);

  // Fetch country tax override when countryId and activeStoreId are available
  useEffect(() => {
    if (countryId && activeStoreId) {
      getCountryTaxOverrideByStoreAndCountry(activeStoreId, countryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, activeStoreId]);

  // Fetch tax defaults when country is found
  useEffect(() => {
    if (country && country._id) {
      getTaxDefaultsByCountryId(country._id, activeStoreId || undefined);
    }
  }, [country, activeStoreId, getTaxDefaultsByCountryId]);

  // Fetch product overrides when country and storeId are available
  useEffect(() => {
    const fetchProductOverrides = async () => {
      if (country && country._id && activeStoreId) {
        try {
          const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
          const product = await getProductOverridesByStoreAndCountry(activeStoreId, countryId);
          setProductOverrides(product);
        } catch (error) {
          console.error('Failed to fetch product overrides:', error);
        }
      }
    };
    fetchProductOverrides();
  }, [country, activeStoreId, getProductOverridesByStoreAndCountry]);

  // Fetch product override entries for each product override
  useEffect(() => {
    const fetchProductOverrideEntries = async () => {
      if (productOverrides.length > 0) {
        try {
          const entriesMap: Record<string, any[]> = {};
          await Promise.all(
            productOverrides.map(async (override) => {
              try {
                const entries = await getProductOverrideEntriesByProductOverrideId(override._id);
                entriesMap[override._id] = entries;
              } catch (error) {
                console.error(`Failed to fetch entries for product override ${override._id}:`, error);
                entriesMap[override._id] = [];
              }
            })
          );
          setProductOverrideEntries(entriesMap);
        } catch (error) {
          console.error('Failed to fetch product override entries:', error);
        }
      } else {
        setProductOverrideEntries({});
      }
    };
    fetchProductOverrideEntries();
  }, [productOverrides, getProductOverrideEntriesByProductOverrideId]);

  // Fetch shipping overrides when country and storeId are available
  useEffect(() => {
    const fetchShippingOverrides = async () => {
      if (country && country._id && activeStoreId) {
        try {
          const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
          const shipping = await getShippingOverridesByStoreAndCountry(activeStoreId, countryId);
          setShippingOverrides(shipping);
        } catch (error) {
          console.error('Failed to fetch shipping overrides:', error);
        }
      }
    };
    fetchShippingOverrides();
  }, [country, activeStoreId, getShippingOverridesByStoreAndCountry]);

  // Compute current country tax rate (override if exists, otherwise default)
  const currentCountryTaxRate = useMemo(() => {
    if (!countryId) return 0;
    const override = activeStoreId ? countryTaxOverrideMap[`${activeStoreId}-${countryId}`] : null;
    const defaultTax = countryTaxMap[countryId];
    
    if (override) {
      return override.taxRate;
    }
    if (defaultTax) {
      return defaultTax.taxRate;
    }
    return 0;
  }, [countryId, activeStoreId, countryTaxOverrideMap, countryTaxMap]);

  // Debounced collection search
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!activeStoreId || !collectionDropdownOpen) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchCollections(activeStoreId, collectionSearchQuery || '', collectionSearchPage, 10);
        setCollectionSearchResults(result.data);
        setCollectionPagination(result.pagination);
      } catch (error) {
        console.error('Failed to search collections:', error);
        setCollectionSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [collectionSearchQuery, collectionSearchPage, collectionDropdownOpen, activeStoreId, searchCollections]);

  // Initial search when dropdown opens
  useEffect(() => {
    if (collectionDropdownOpen && activeStoreId) {
      const performSearch = async () => {
        try {
          const result = await searchCollections(activeStoreId, '', 1, 10);
          setCollectionSearchResults(result.data);
          setCollectionPagination(result.pagination);
        } catch (error) {
          console.error('Failed to search collections:', error);
          setCollectionSearchResults([]);
        }
      };
      performSearch();
    }
  }, [collectionDropdownOpen, activeStoreId, searchCollections]);

  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection._id);
    setSelectedCollectionName(collection.title);
    setCollectionDropdownOpen(false);
    setCollectionSearchQuery('');
    setProductOverrideError(null);
  };

  const handleProductMenuClose = () => {
    setProductMenuState({
      anchorEl: null,
      overrideId: null,
      collectionName: '',
    });
  };

  const handleCollectionPageChange = (newPage: number) => {
    setCollectionSearchPage(newPage);
  };

  const handleDeleteClick = (overrideId: string, regionName: string, isShipping: boolean, collectionName?: string) => {
    setDeleteOverrideId(overrideId);
    setDeleteOverrideRegionName(regionName);
    setDeleteOverrideCollectionName(collectionName || '');
    setDeleteOverrideIsShipping(isShipping);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOverrideId) return;

    try {
      if (deleteOverrideIsProductEntry && deleteOverrideProductOverrideId) {
        // Delete product override entry
        await deleteProductOverrideEntry(deleteOverrideId);
        // Refetch entries for this product override
        const updatedEntries = await getProductOverrideEntriesByProductOverrideId(deleteOverrideProductOverrideId);
        setProductOverrideEntries((prev) => ({
          ...prev,
          [deleteOverrideProductOverrideId]: updatedEntries,
        }));
        // Refetch product overrides
        if (country && country._id && activeStoreId) {
          const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
          const product = await getProductOverridesByStoreAndCountry(activeStoreId, countryId);
          setProductOverrides(product);
        }
      } else if (deleteOverrideIsShipping) {
        await deleteShippingOverride(deleteOverrideId);
        // Refetch shipping overrides
        if (country && country._id && activeStoreId) {
          const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
          const shipping = await getShippingOverridesByStoreAndCountry(activeStoreId, countryId);
          setShippingOverrides(shipping);
        }
      } else {
        await deleteProductOverride(deleteOverrideId);
        // Refetch product overrides
        if (country && country._id && activeStoreId) {
          const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
          const product = await getProductOverridesByStoreAndCountry(activeStoreId, countryId);
          setProductOverrides(product);
        }
      }
      setDeleteModalOpen(false);
      setDeleteOverrideId(null);
      setDeleteOverrideRegionName('');
      setDeleteOverrideCollectionName('');
      setDeleteOverrideIsShipping(false);
      setDeleteOverrideIsProductEntry(false);
      setDeleteOverrideProductOverrideId(null);
    } catch (error) {
      console.error('Failed to delete override:', error);
    }
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setDeleteOverrideId(null);
    setDeleteOverrideRegionName('');
    setDeleteOverrideCollectionName('');
    setDeleteOverrideIsShipping(false);
    setDeleteOverrideIsProductEntry(false);
    setDeleteOverrideProductOverrideId(null);
  };

  const handleEditShippingClick = (override: any) => {
    setEditingShippingOverride(override);
    setEditShippingTaxRate(override.taxRate);
    setEditShippingModalOpen(true);
  };

  const handleEditShippingSave = async () => {
    if (!editingShippingOverride || !country || !country._id || !activeStoreId) return;

    try {
      await updateShippingOverride(editingShippingOverride._id, { taxRate: editShippingTaxRate });
      // Refetch shipping overrides
      const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
      const shipping = await getShippingOverridesByStoreAndCountry(activeStoreId, countryId);
      setShippingOverrides(shipping);
      setEditShippingModalOpen(false);
      setEditingShippingOverride(null);
      setEditShippingTaxRate(0);
    } catch (error) {
      console.error('Failed to update shipping override:', error);
    }
  };

  const handleEditShippingModalClose = () => {
    setEditShippingModalOpen(false);
    setEditingShippingOverride(null);
    setEditShippingTaxRate(0);
  };

  const handleEditCountryTaxClick = () => {
    if (!countryId || !activeStoreId) return;
    
    // Get current tax rate (override if exists, otherwise default)
    const currentTaxRate = 
      (activeStoreId && countryTaxOverrideMap[`${activeStoreId}-${countryId}`]?.taxRate) ||
      countryTaxMap[countryId]?.taxRate ||
      0;
    
    setEditCountryTaxRate(currentTaxRate);
    setEditCountryTaxModalOpen(true);
  };

  const handleEditCountryTaxModalClose = () => {
    setEditCountryTaxModalOpen(false);
    setEditCountryTaxRate(0);
  };

  const handleEditCountryTaxSave = async () => {
    if (!countryId || !activeStoreId) return;

    // Validate tax rate
    if (editCountryTaxRate < 0 || editCountryTaxRate > 100) {
      alert('Tax rate must be between 0 and 100');
      return;
    }

    try {
      // Check if override already exists
      const existingOverride = countryTaxOverrideMap[`${activeStoreId}-${countryId}`];
      
      if (existingOverride) {
        // If override exists, update it
        await updateCountryTaxOverrideByStoreAndCountry(activeStoreId, countryId, {
          taxRate: editCountryTaxRate,
        });
      } else {
        // If override doesn't exist, create a new one
        await createCountryTaxOverride({
          storeId: activeStoreId,
          countryId: countryId,
          taxRate: editCountryTaxRate,
        });
      }
      
      // Refresh the override data
      await getCountryTaxOverrideByStoreAndCountry(activeStoreId, countryId, { force: true });
      
      // Close modal
      handleEditCountryTaxModalClose();
    } catch (error: any) {
      console.error('Failed to update country tax override:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update country tax override';
      alert(errorMessage);
    }
  };

  const handleResetCountryTaxClick = () => {
    setResetCountryTaxModalOpen(true);
  };

  const handleResetCountryTaxModalClose = () => {
    setResetCountryTaxModalOpen(false);
  };

  const handleResetCountryTaxConfirm = async () => {
    if (!countryId || !activeStoreId) return;

    try {
      // Delete the override
      await deleteCountryTaxOverrideByStoreAndCountry(activeStoreId, countryId);
      
      // Refresh the override data (this will return null if deleted successfully)
      await getCountryTaxOverrideByStoreAndCountry(activeStoreId, countryId, { force: true });
      
      // Close modal
      handleResetCountryTaxModalClose();
    } catch (error: any) {
      console.error('Failed to reset country tax override:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reset country tax override';
      alert(errorMessage);
    }
  };

  const getStateNameFromOverride = (override: any): string => {
    if (!override.stateId) return 'India';
    if (typeof override.stateId === 'object' && override.stateId.name) {
      return override.stateId.name;
    }
    // Try to find in statesByCountry
    if (country && statesByCountry[country._id]) {
      const state = statesByCountry[country._id].find((s) => s._id === override.stateId);
      return state ? state.name : 'Unknown';
    }
    return 'Unknown';
  };

  const getStateNameFromShippingOverride = (override: any): string => {
    if (!override.stateId) return 'India';
    if (typeof override.stateId === 'object' && override.stateId.name) {
      return override.stateId.name;
    }
    // Try to find in statesByCountry
    if (country && statesByCountry[country._id]) {
      const state = statesByCountry[country._id].find((s) => s._id === override.stateId);
      return state ? state.name : 'Unknown';
    }
    return 'Unknown';
  };

  const getStateNameFromStateId = (stateId: string | null): string => {
    if (!stateId || stateId === 'india') return 'India';
    if (country && statesByCountry[country._id]) {
      const state = statesByCountry[country._id].find((s) => s._id === stateId);
      return state ? state.name : 'Unknown';
    }
    return 'Unknown';
  };

  const handleEditClick = (taxDefault: any) => {
    setEditingTaxDefault(taxDefault);
    setEditFormData({
      taxRate: taxDefault.taxRate,
      taxLabel: taxDefault.taxLabel || 'IGST',
      calculationMethod: taxDefault.calculationMethod || 'instead',
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingTaxDefault(null);
    setEditFormData({
      taxRate: 0,
      taxLabel: '',
      calculationMethod: 'instead',
    });
  };

  const handleEditSave = async () => {
    if (!editingTaxDefault || !country || !activeStoreId) {
      return;
    }

    try {
      const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
      const stateId = editingTaxDefault.stateId
        ? (typeof editingTaxDefault.stateId === 'object' && editingTaxDefault.stateId?._id
            ? editingTaxDefault.stateId._id
            : typeof editingTaxDefault.stateId === 'string'
            ? editingTaxDefault.stateId
            : null)
        : null;
      
      // Check if this tax default already has an override
      const hasOverride = editingTaxDefault.isOverride === true || editingTaxDefault.overrideId;

      // Determine calculationMethod: for state-level entries use the value from form, for federal-level it should be null
      const isStateLevel = stateId !== null && stateId !== undefined;
      const calculationMethod = isStateLevel ? editFormData.calculationMethod : null;

      if (hasOverride && editingTaxDefault.overrideId) {
        // Update existing override
        await updateTaxRate(editingTaxDefault.overrideId, {
          taxRate: editFormData.taxRate,
          taxLabel: editFormData.taxLabel,
          calculationMethod: calculationMethod,
        });
      } else {
        // Create new override
        await createTaxRate({
          storeId: activeStoreId,
          countryId: countryId,
          stateId: stateId,
          taxRate: editFormData.taxRate,
          taxLabel: editFormData.taxLabel,
          calculationMethod: calculationMethod,
        });
      }

      // Refetch tax defaults to update the UI with the new override information
      await getTaxDefaultsByCountryId(countryId, activeStoreId);

      handleEditModalClose();
    } catch (error: any) {
      console.error('Failed to save tax override:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to save tax override. Please try again.';
      alert(errorMessage);
      // Don't close the modal on error so user can retry
    }
  };

  const getCalculationMethodLabel = (method: 'added' | 'instead' | 'compounded' | null | undefined, federalRate: number): string => {
    if (!method) return '—';
    const rate = federalRate.toFixed(3);
    switch (method) {
      case 'added':
        return `Added to ${rate}% federal tax`;
      case 'instead':
        return `Instead of ${rate}% federal tax`;
      case 'compounded':
        return `Compounded on top of ${rate}% federal tax`;
      default:
        return '—';
    }
  };

  const handleResetToDefaultClick = () => {
    setResetModalOpen(true);
  };

  const handleResetModalClose = () => {
    setResetModalOpen(false);
  };

  const handleResetConfirm = async () => {
    if (!country || !country._id || !activeStoreId) {
      return;
    }

    try {
      const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
      
      // Delete all tax overrides for this store and country
      await deleteTaxOverridesByStoreAndCountry(activeStoreId, countryId);
      
      // Refetch defaults with storeId to get updated defaults (without overrides)
      const updatedTaxDefaults = await getTaxDefaultsByCountryId(countryId, activeStoreId);
      
      // Update federal rate if needed
      // Removed setIndiaFederalRate - now using currentCountryTaxRate computed value from country tax
      
      handleResetModalClose();
    } catch (error: any) {
      console.error('Failed to reset tax rates:', error);
      // You might want to show an error message to the user here
      // For now, we'll just log it
    }
  };

  // Get state name from stateId
  const getStateName = (stateId: string | { _id: string; name: string; code: string } | null | undefined): string => {
    if (!stateId) return '';
    if (typeof stateId === 'object' && 'name' in stateId) {
      return stateId.name;
    }
    // If stateId is a string, try to find it in statesByCountry
    if (country && statesByCountry[country._id]) {
      const state = statesByCountry[country._id].find((s) => s._id === stateId);
      return state ? state.name : '';
    }
    return '';
  };

  // Get state-level tax defaults (excluding federal) and sort by state name
  const stateTaxDefaults = taxDefaults
    .filter((td) => td.stateId && td.stateId !== null)
    .map((td) => ({
      ...td,
      stateName: getStateName(td.stateId),
    }))
    .sort((a, b) => {
      const nameA = a.stateName.toLowerCase();
      const nameB = b.stateName.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <SettingsHero
          title={country?.name || 'Loading…'}
          description="Manage tax rates, overrides, and exemptions for this country."
          leading={
            <button
              type="button"
              onClick={() => navigate('/settings/taxes-and-duties')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200/90 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/90 transition-colors shrink-0"
              aria-label="Back to taxes and duties"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
        />

        {/* Country Tax Section - Above Base taxes */}
        {countryId && (countryTaxMap[countryId] || (activeStoreId && countryTaxOverrideMap[`${activeStoreId}-${countryId}`])) && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={{ minWidth: 120, color: '#111827', fontWeight: 500 }}>
              {country?.name || 'Loading...'}
            </Typography>
            <Typography sx={{ color: '#111827', fontWeight: 500 }}>
              {(
                (activeStoreId && countryTaxOverrideMap[`${activeStoreId}-${countryId}`]?.taxRate) ||
                countryTaxMap[countryId]?.taxRate ||
                0
              ).toFixed(2)}%
            </Typography>
            {activeStoreId && countryTaxOverrideMap[`${activeStoreId}-${countryId}`] && (
              <Chip
                label="Overridden"
                size="small"
                sx={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
            <Box sx={{ flex: 1 }} />
            {activeStoreId && countryTaxOverrideMap[`${activeStoreId}-${countryId}`] && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetCountryTaxClick}
                sx={{
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#111827',
                  fontSize: '0.75rem',
                  px: 2,
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f3f4f6',
                  },
                }}
              >
                Reset to default
              </Button>
            )}
            <IconButton
              size="small"
              onClick={handleEditCountryTaxClick}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#111827',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Stack>
        </div>
      )}

        {/* Base taxes section */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Base taxes
          </Typography>
          <Button
            variant="outlined"
            onClick={handleResetToDefaultClick}
            sx={{
              textTransform: 'none',
              borderColor: '#d1d5db',
              color: '#111827',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Reset to default tax rates
          </Button>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
          Regions
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  Region
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  Tax rate
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  Tax type
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  Federal tax override
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', width: 80 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* State rows */}
              {statesLoading || taxDefaultsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                    Loading tax defaults...
                  </TableCell>
                </TableRow>
              ) : stateTaxDefaults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#6b7280' }}>
                    No tax defaults found
                  </TableCell>
                </TableRow>
              ) : (
                stateTaxDefaults.map((taxDefault) => {
                  const stateName = taxDefault.stateName || getStateName(taxDefault.stateId);
                  const calculationMethod = taxDefault.calculationMethod || 'instead';
                  
                  return (
                    <TableRow key={taxDefault._id}>
                      <TableCell sx={{ borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {stateName}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {taxDefault.taxRate.toFixed(3)}%
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {taxDefault.taxLabel || 'IGST'}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f3f4f6', color: '#111827' }}>
                        {getCalculationMethodLabel(calculationMethod, currentCountryTaxRate)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(taxDefault)}
                          sx={{
                            color: '#6b7280',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                              color: '#111827',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </div>

        {/* Tax rates and exemptions section */}
        <div>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Tax rates and exemptions
          </Typography>

          {/* Shipping overrides */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
              Shipping overrides
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setOverrideType('shipping');
                setAddOverrideModalOpen(true);
                setProductOverrideError(null);
              }}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                color: '#111827',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db',
                },
              }}
              aria-label="add shipping override"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {shippingOverrides.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              No shipping overrides
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mb: 2 }}>
              {shippingOverrides.map((override) => {
                const stateName = getStateNameFromShippingOverride(override);
                const displayName = stateName;
                
                return (
                  <Stack
                    key={override._id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      p: 2,
                      border: '1px solid #f3f4f6',
                      borderRadius: 1,
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <Typography sx={{ minWidth: 120, color: '#111827', fontWeight: 500 }}>
                      {displayName}
                    </Typography>
                    <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                      {override.taxRate}%
                    </Typography>
                    <Typography sx={{ color: '#6b7280', flex: 1 }}>
                      instead of {currentCountryTaxRate.toFixed(3)}% federal tax
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleEditShippingClick(override)}
                      sx={{
                        color: '#6b7280',
                        '&:hover': {
                          color: '#2563eb',
                          backgroundColor: '#eff6ff',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(override._id, displayName, true)}
                      sx={{
                        color: '#6b7280',
                        '&:hover': {
                          color: '#dc2626',
                          backgroundColor: '#fee2e2',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>
          )}

          <Box
            onClick={() => {
              setOverrideType('shipping');
              setOverrideCollectionContext(null);
              setAddOverrideModalOpen(true);
              setProductOverrideError(null);
              setOverrideLocation('india');
              setOverrideTaxRate(9);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid #e5e7eb',
              borderRadius: 1.5,
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              color: '#111827',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontWeight: 500 }}>Add override</Typography>
          </Box>
          </div>

        <Menu
          anchorEl={productMenuState.anchorEl}
          open={Boolean(productMenuState.anchorEl)}
          onClose={handleProductMenuClose}
        >
          <MenuItem
            onClick={() => {
              // Find the product override ID for this collection
              const productOverride = productOverrides.find((override) => {
                const collectionName = typeof override.collectionId === 'object' 
                  ? override.collectionId.title 
                  : override.collectionId || '';
                return collectionName === productMenuState.collectionName;
              });
              
              if (productOverride) {
                setOverrideCollectionContext(productMenuState.collectionName || null);
                // Store the product override ID in selectedCollection for later use
                setSelectedCollection(productOverride._id);
              }
              setOverrideType('shipping');
              setAddOverrideModalOpen(true);
              setProductOverrideError(null);
              setOverrideLocation('india');
              setOverrideTaxRate(9);
              handleProductMenuClose();
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add override" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (!productMenuState.overrideId) return;
              handleDeleteClick(productMenuState.overrideId, '', false, productMenuState.collectionName);
              handleProductMenuClose();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete override" />
          </MenuItem>
        </Menu>

        {/* Product overrides */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 mb-6">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
              Product overrides
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setOverrideType('products');
                setOverrideCollectionContext(null);
                setAddOverrideModalOpen(true);
                setProductOverrideError(null);
              }}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                color: '#111827',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db',
                },
              }}
              aria-label="add product override"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {productOverrides.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              No product overrides
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {productOverrides.map((override) => {
                const collectionName = typeof override.collectionId === 'object' 
                  ? override.collectionId.title 
                  : override.collectionId || 'Unknown Collection';
                const entries = productOverrideEntries[override._id] || [];
                
                return (
                  <Box
                    key={override._id}
                    sx={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Collection Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.5,
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          color: '#2563eb',
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {collectionName}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconButton
                          size="small"
                          sx={{ color: '#6b7280' }}
                          aria-label="more actions"
                          onClick={(e) => setProductMenuState({
                            anchorEl: e.currentTarget,
                            overrideId: override._id,
                            collectionName,
                          })}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                    
                    {/* Product Override Entries */}
                    {entries.length > 0 && (
                      <Box sx={{ p: 2, pt: 1 }}>
                        <Stack spacing={1.5}>
                          {entries.map((entry) => {
                            const stateName = entry.stateId 
                              ? (typeof entry.stateId === 'object' && entry.stateId.name 
                                  ? entry.stateId.name 
                                  : 'Unknown State')
                              : 'India';
                            
                            return (
                              <Stack
                                key={entry._id}
                                direction="row"
                                alignItems="center"
                                spacing={2}
                                sx={{
                                  p: 2,
                                  border: '1px solid #f3f4f6',
                                  borderRadius: 1,
                                  backgroundColor: '#fafafa',
                                }}
                              >
                                <Typography sx={{ minWidth: 120, color: '#111827', fontWeight: 500 }}>
                                  {stateName}
                                </Typography>
                                <Typography sx={{ color: '#111827', fontWeight: 500 }}>
                                  {entry.taxRate}%
                                </Typography>
                                <Typography sx={{ color: '#6b7280', flex: 1 }}>
                                  instead of {currentCountryTaxRate.toFixed(3)}% federal tax
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeleteOverrideId(entry._id);
                                    setDeleteOverrideRegionName(stateName);
                                    setDeleteOverrideIsProductEntry(true);
                                    setDeleteOverrideProductOverrideId(override._id);
                                    setDeleteModalOpen(true);
                                  }}
                                  sx={{
                                    color: '#6b7280',
                                    '&:hover': {
                                      color: '#dc2626',
                                      backgroundColor: '#fee2e2',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="#"
            underline="hover"
            sx={{
              color: '#6b7280',
              fontSize: '0.875rem',
              '&:hover': {
                color: '#111827',
              },
            }}
          >
            Learn more about sales tax
          </Link>
        </div>
        </div>

      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          Edit Tax Default
          <IconButton
            aria-label="close"
            onClick={handleEditModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                Region
              </Typography>
              <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                {editingTaxDefault && (editingTaxDefault.stateName || (editingTaxDefault.stateId === null ? 'India' : getStateName(editingTaxDefault.stateId)))}
              </Typography>
            </Box>

            <TextField
              label="Tax rate"
              type="number"
              value={editFormData.taxRate}
              onChange={(e) => setEditFormData({ ...editFormData, taxRate: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ color: '#6b7280' }}>%</Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: 0.001,
                min: 0,
                max: 100,
              }}
              fullWidth
              size="small"
            />

            <TextField
              label="Tax type"
              value={editFormData.taxLabel}
              onChange={(e) => setEditFormData({ ...editFormData, taxLabel: e.target.value })}
              fullWidth
              size="small"
              disabled={editingTaxDefault && (!editingTaxDefault.stateId || editingTaxDefault.stateId === null)}
            />

            {editingTaxDefault && editingTaxDefault.stateId && editingTaxDefault.stateId !== null && (
              <FormControl fullWidth size="small">
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                  Federal tax override
                </Typography>
                <Select
                  value={editFormData.calculationMethod || 'instead'}
                  onChange={(e) => setEditFormData({ ...editFormData, calculationMethod: e.target.value as 'added' | 'instead' | 'compounded' })}
                  displayEmpty
                >
                  <MenuItem value="added">Added to {currentCountryTaxRate.toFixed(3)}% federal tax</MenuItem>
                  <MenuItem value="instead">Instead of {currentCountryTaxRate.toFixed(3)}% federal tax</MenuItem>
                  <MenuItem value="compounded">Compounded on top of {currentCountryTaxRate.toFixed(3)}% federal tax</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleEditModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            sx={{
              textTransform: 'none',
              backgroundColor: '#6b7280',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
            }}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Modal */}
      <Dialog
        open={resetModalOpen}
        onClose={handleResetModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          Reset to default tax rates
          <IconButton
            aria-label="close"
            onClick={handleResetModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#111827' }}>
            Are you sure you want to reset all your taxes for India? This will set both the country tax and all region taxes to their current default values.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleResetModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResetConfirm}
            sx={{
              textTransform: 'none',
              backgroundColor: '#dc2626',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
            }}
          >
            Reset tax rates
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Override Modal */}
      <Dialog
        open={addOverrideModalOpen}
        onClose={() => setAddOverrideModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          {overrideType === 'shipping' 
            ? (overrideCollectionContext 
                ? `Add region to override for ${overrideCollectionContext}` 
                : 'Add region to override for Shipping')
            : 'Add tax override for India'}
          <IconButton
            aria-label="close"
            onClick={() => {
              setAddOverrideModalOpen(false);
              setOverrideType('products');
              setSelectedCollection('');
              setSelectedCollectionName('');
              setCollectionSearchQuery('');
              setCollectionDropdownOpen(false);
              setCollectionSearchPage(1);
              setOverrideLocation('india');
              setOverrideTaxRate(9);
              setProductOverrideError(null);
              setOverrideCollectionContext(null);
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Stack spacing={3}>
            {/* Collection Selection (only for Products) */}
            {overrideType === 'products' && (
              <Box sx={{ position: 'relative' }}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5, fontWeight: 400 }}>
                  Select a collection to apply the tax override to. You can also{' '}
                  <Link
                    component={RouterLink}
                    to="http://admin.localhost:5173/products/collections/new"
                    target="_blank"
                    sx={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    create a new collection
                  </Link>
                  .
                </Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <Select
                    value={selectedCollection}
                    onOpen={() => {
                      setCollectionDropdownOpen(true);
                      setCollectionSearchPage(1);
                    }}
                    onClose={() => {
                      setCollectionDropdownOpen(false);
                      setCollectionSearchQuery('');
                    }}
                    displayEmpty
                    renderValue={() => {
                      if (selectedCollectionName) {
                        return selectedCollectionName;
                      }
                      return 'Select collection';
                    }}
                    sx={{
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563eb',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                          mt: 0.5,
                        },
                      },
                    }}
                  >
                    <Box sx={{ p: 1, borderBottom: '1px solid #e5e7eb' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search collections"
                        value={collectionSearchQuery}
                        onChange={(e) => {
                          setCollectionSearchQuery(e.target.value);
                          setCollectionSearchPage(1);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            '& fieldset': {
                              borderColor: '#2563eb',
                            },
                            '&:hover fieldset': {
                              borderColor: '#2563eb',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2563eb',
                            },
                          },
                        }}
                      />
                    </Box>
                    {collectionSearchResults.length === 0 ? (
                      <MenuItem disabled sx={{ justifyContent: 'center', py: 2 }}>
                        <Typography sx={{ color: '#6b7280' }}>No collections found</Typography>
                      </MenuItem>
                    ) : (
                      <>
                        {collectionSearchResults.map((collection) => (
                          <MenuItem
                            key={collection._id}
                            value={collection._id}
                            onClick={() => handleCollectionSelect(collection)}
                            selected={selectedCollection === collection._id}
                            sx={{
                              '&.Mui-selected': {
                                backgroundColor: '#f3f4f6',
                                '&:hover': {
                                  backgroundColor: '#e5e7eb',
                                },
                              },
                            }}
                          >
                            {collection.title}
                          </MenuItem>
                        ))}
                        {collectionPagination && collectionPagination.totalPages > 1 && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              px: 1,
                              py: 0.5,
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            <IconButton
                              size="small"
                              disabled={collectionSearchPage === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCollectionPageChange(collectionSearchPage - 1);
                              }}
                              sx={{
                                color: '#6b7280',
                                '&:disabled': {
                                  color: '#d1d5db',
                                },
                              }}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Page {collectionSearchPage} of {collectionPagination.totalPages}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={collectionSearchPage === collectionPagination.totalPages}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCollectionPageChange(collectionSearchPage + 1);
                              }}
                              sx={{
                                color: '#6b7280',
                                '&:disabled': {
                                  color: '#d1d5db',
                                },
                              }}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                          </Box>
                        )}
                      </>
                    )}
                  </Select>
                </FormControl>
                {productOverrideError && (
                  <Typography variant="body2" sx={{ color: '#dc2626', mt: 1 }}>
                    {productOverrideError}
                  </Typography>
                )}
              </Box>
            )}

            {/* Error message for shipping overrides */}
            {overrideType === 'shipping' && productOverrideError && (
              <Box>
                <Typography variant="body2" sx={{ color: '#dc2626', mt: 1 }}>
                  {productOverrideError}
                </Typography>
              </Box>
            )}

            {/* Location and Tax Rate - Side by side for shipping */}
            {overrideType === 'shipping' && (
              <Stack direction="row" spacing={2}>
                {/* Location */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                    Location
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={overrideLocation}
                      onChange={(e) => {
                        setOverrideLocation(e.target.value);
                        setProductOverrideError(null);
                      }}
                      sx={{
                        backgroundColor: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563eb',
                        },
                      }}
                    >
                      <MenuItem value="india">India</MenuItem>
                      {country && statesByCountry[country._id] && statesByCountry[country._id].map((state) => (
                        <MenuItem key={state._id} value={state._id}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Tax Rate */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                    Tax rate
                  </Typography>
                  <TextField
                    type="number"
                    value={overrideTaxRate}
                    onChange={(e) => setOverrideTaxRate(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography sx={{ color: '#6b7280' }}>%</Typography>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      step: 0.001,
                      min: 0,
                      max: 100,
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                        '& fieldset': {
                          borderColor: '#d1d5db',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9ca3af',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2563eb',
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
            )}

            {overrideType === 'products' && (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                The selected collection will use the default India tax rates. No extra inputs needed.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setAddOverrideModalOpen(false);
              setOverrideType('products');
              setSelectedCollection('');
              setSelectedCollectionName('');
              setCollectionSearchQuery('');
              setCollectionDropdownOpen(false);
              setCollectionSearchPage(1);
              setOverrideLocation('india');
              setOverrideTaxRate(9);
              setProductOverrideError(null);
            }}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={overrideType === 'products' && !selectedCollection}
            onClick={async () => {
              if (!country || !country._id || !activeStoreId) return;
              
              try {
                const countryId = typeof country._id === 'string' ? country._id : country._id.toString();
                if (overrideType === 'shipping') {
                  const stateId = overrideLocation === 'india' ? null : overrideLocation;
                  
                  // Check if this is for a product override entry (when overrideCollectionContext is set)
                  if (overrideCollectionContext && selectedCollection) {
                    // Check if product override entry already exists for this state
                    const existingEntries = productOverrideEntries[selectedCollection] || [];
                    const alreadyExists = existingEntries.some((entry) => {
                      const entryStateId = typeof entry.stateId === 'object' && entry.stateId !== null
                        ? entry.stateId._id
                        : entry.stateId;
                      // Compare stateIds, handling both null (federal) and state-level entries
                      if (stateId === null) {
                        return entryStateId === null || entryStateId === undefined;
                      }
                      return entryStateId === stateId;
                    });

                    if (alreadyExists) {
                      const stateName = stateId === null || stateId === 'india' 
                        ? 'India' 
                        : getStateNameFromStateId(stateId);
                      setProductOverrideError(`A product override entry already exists for ${stateName}. You cannot add the same state twice for this product override.`);
                      return;
                    }
                    
                    // This is a product override entry - create product override entry
                    await createProductOverrideEntry({
                      productOverrideId: selectedCollection,
                      stateId: stateId,
                      taxRate: overrideTaxRate,
                      isActive: true,
                    });
                    
                    // Refetch entries for this product override
                    const updatedEntries = await getProductOverrideEntriesByProductOverrideId(selectedCollection);
                    setProductOverrideEntries((prev) => ({
                      ...prev,
                      [selectedCollection]: updatedEntries,
                    }));
                    
                    // Refetch product overrides to update the UI if needed
                    const product = await getProductOverridesByStoreAndCountry(activeStoreId, countryId);
                    setProductOverrides(product);
                  } else {
                    // Regular shipping override
                    // Check if shipping override already exists for this state
                    const alreadyExists = shippingOverrides.some((override) => {
                      const overrideStateId = typeof override.stateId === 'object' && override.stateId !== null
                        ? override.stateId._id
                        : override.stateId;
                      // Compare stateIds, handling both null (federal) and state-level overrides
                      if (stateId === null) {
                        return overrideStateId === null || overrideStateId === undefined;
                      }
                      return overrideStateId === stateId;
                    });

                    if (alreadyExists) {
                      const stateName = stateId === null || stateId === 'india' 
                        ? 'India' 
                        : getStateNameFromStateId(stateId);
                      setProductOverrideError(`A shipping override already exists for ${stateName}. You cannot add the same state twice for this store and country.`);
                      return;
                    }
                    
                    // Create shipping override
                    await createShippingOverride({
                      storeId: activeStoreId,
                      countryId: countryId,
                      stateId: stateId,
                      taxRate: overrideTaxRate,
                      isActive: true,
                    });
                    
                    // Refetch shipping overrides
                    const shipping = await getShippingOverridesByStoreAndCountry(activeStoreId, countryId);
                    setShippingOverrides(shipping);
                  }
                } else {
                  // Create product override
                  const alreadyExists = productOverrides.some((override) => {
                    const overrideCollectionId = typeof override.collectionId === 'object'
                      ? override.collectionId._id
                      : override.collectionId;
                    return overrideCollectionId === selectedCollection;
                  });

                  if (alreadyExists) {
                    setProductOverrideError('This collection already has a product override for India.');
                    return;
                  }

                  await createProductOverride({
                    storeId: activeStoreId,
                    countryId: countryId,
                    collectionId: selectedCollection,
                  });
                  
                  // Refetch product overrides
                  const product = await getProductOverridesByStoreAndCountry(activeStoreId, countryId);
                  setProductOverrides(product);
                }
                
                setAddOverrideModalOpen(false);
                setOverrideType('products');
                setSelectedCollection('');
                setSelectedCollectionName('');
                setCollectionSearchQuery('');
                setCollectionDropdownOpen(false);
                setCollectionSearchPage(1);
                setOverrideLocation('india');
                setOverrideTaxRate(9);
                setProductOverrideError(null);
                setOverrideCollectionContext(null);
              } catch (error: any) {
                console.error('Failed to create override:', error);
                // Show error message to user
                const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create override. Please try again.';
                setProductOverrideError(errorMessage);
              }
            }}
            sx={{
              textTransform: 'none',
              backgroundColor: overrideType === 'products' && !selectedCollection ? '#d1d5db' : '#111827',
              color: '#fff',
              '&:hover': {
                backgroundColor: overrideType === 'products' && !selectedCollection ? '#d1d5db' : '#000000',
              },
              '&.Mui-disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
              },
            }}
          >
            {overrideType === 'shipping' ? 'Add region to override' : 'Add override'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          {deleteOverrideIsShipping || deleteOverrideIsProductEntry ? 'Delete region from override' : 'Delete entire override'}
          <IconButton
            aria-label="close"
            onClick={handleDeleteModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#111827' }}>
            {deleteOverrideIsShipping || deleteOverrideIsProductEntry ? (
              <>Are you sure you want to remove <strong>{deleteOverrideRegionName}</strong> from the list of regions this override applies to? This action cannot be reversed.</>
            ) : (
              <>Are you sure you want to remove <strong>{deleteOverrideCollectionName}</strong>? This action cannot be reversed.</>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleDeleteModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            sx={{
              textTransform: 'none',
              backgroundColor: '#dc2626',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Shipping Override Modal */}
      <Dialog
        open={editShippingModalOpen}
        onClose={handleEditShippingModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          Edit shipping override
          <IconButton
            aria-label="close"
            onClick={handleEditShippingModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          {editingShippingOverride && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Location
                </Typography>
                <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                  {getStateNameFromShippingOverride(editingShippingOverride)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Tax rate
                </Typography>
                <TextField
                  type="number"
                  value={editShippingTaxRate}
                  onChange={(e) => setEditShippingTaxRate(parseFloat(e.target.value) || 0)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ color: '#6b7280' }}>%</Typography>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    step: 0.001,
                    min: 0,
                    max: 100,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    },
                  }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleEditShippingModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditShippingSave}
            sx={{
              textTransform: 'none',
              backgroundColor: '#2563eb',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Country Tax Modal */}
      <Dialog
        open={editCountryTaxModalOpen}
        onClose={handleEditCountryTaxModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          Edit country tax
          <IconButton
            aria-label="close"
            onClick={handleEditCountryTaxModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                Country
              </Typography>
              <Typography variant="body1" sx={{ color: '#111827', fontWeight: 500 }}>
                {country?.name || 'Loading...'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                Tax rate
              </Typography>
              <TextField
                type="number"
                value={editCountryTaxRate}
                onChange={(e) => setEditCountryTaxRate(parseFloat(e.target.value) || 0)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ color: '#6b7280' }}>%</Typography>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  step: 0.01,
                  min: 0,
                  max: 100,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleEditCountryTaxModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditCountryTaxSave}
            sx={{
              textTransform: 'none',
              backgroundColor: '#2563eb',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Country Tax Confirmation Modal */}
      <Dialog
        open={resetCountryTaxModalOpen}
        onClose={handleResetCountryTaxModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, fontWeight: 600, color: '#111827' }}>
          Reset to default
          <IconButton
            aria-label="close"
            onClick={handleResetCountryTaxModalClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#111827' }}>
            Are you sure you want to reset the country tax to default? This will delete your overridden value and the default value will be used.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleResetCountryTaxModalClose}
            sx={{
              textTransform: 'none',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResetCountryTaxConfirm}
            sx={{
              textTransform: 'none',
              backgroundColor: '#dc2626',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
            }}
          >
            Reset to default
          </Button>
        </DialogActions>
      </Dialog>

      </div>
    </div>
  );
};

export default IndiaTaxDetailsPage;

