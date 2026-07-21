import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  ShoppingBag as BagIcon,
  Info as InfoIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useCountries } from '../../contexts/country.context';

const TaxRegionDetailPage: React.FC = () => {
  const { regionName } = useParams<{ regionName: string }>();
  const { countries, getCountries } = useCountries();
  const [country, setCountry] = useState<any>(null);
  const [shippingOverrideModalOpen, setShippingOverrideModalOpen] = useState(false);
  const [taxRate, setTaxRate] = useState<string>('');
  const [productOverrideModalOpen, setProductOverrideModalOpen] = useState(false);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  // Mock collections data
  const mockCollections = [
    { id: '1', name: 'Home page' },
    { id: '2', name: 'Featured products' },
    { id: '3', name: 'New arrivals' },
    { id: '4', name: 'Sale items' },
  ];
  
  const filteredCollections = mockCollections.filter((collection) =>
    collection.name.toLowerCase().includes(collectionSearchQuery.toLowerCase())
  );

  useEffect(() => {
    getCountries({ limit: 1000 });
  }, [getCountries]);

  useEffect(() => {
    if (countries.length > 0 && regionName) {
      const foundCountry = countries.find(
        (c) => c.name.toLowerCase().replace(/\s+/g, '-') === regionName.toLowerCase()
      );
      setCountry(foundCountry || null);
    }
  }, [countries, regionName]);

  const displayName = country?.name || regionName?.replace(/-/g, ' ') || 'Unknown Region';
  
  // Get region-specific tax name (GST for Australia, Sales tax for others, etc.)
  const getTaxName = (countryName: string) => {
    const name = countryName.toLowerCase();
    if (name.includes('australia')) return 'GST collection';
    if (name.includes('canada')) return 'Sales tax';
    return 'Sales tax';
  };

  const taxName = getTaxName(displayName);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }} separator={<ChevronRightIcon fontSize="small" />}>
        <Link
          component={RouterLink}
          to="/settings/taxes-and-duties"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
            textDecoration: 'none',
            '&:hover': { color: '#111827' },
          }}
        >
          <BagIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Taxes and duties
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 500 }}>
          {displayName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 3 }}>
        {displayName}
      </Typography>

      {/* Tax service section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
          Tax service
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BagIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
            Basic Tax
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
            }}
          />
          <Chip
            label="Active"
            size="small"
            sx={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24,
            }}
          />
        </Stack>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Free service
        </Typography>
      </Paper>

      {/* Regional settings */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
          Regional settings
        </Typography>

        {/* Tax collection section */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
              {taxName}
            </Typography>
            <InfoIcon sx={{ color: '#6b7280', fontSize: 18 }} />
          </Stack>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            If you do business in {displayName}, you may be required to collect {taxName.toLowerCase()} on sales in {displayName}.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
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
            Collect in new region
          </Button>
        </Box>
      </Paper>

      {/* Tax rates and exemptions */}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
        Tax rates and exemptions
      </Typography>

      {/* Shipping overrides */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
              Shipping overrides
            </Typography>
            <InfoIcon sx={{ color: '#6b7280', fontSize: 18 }} />
          </Stack>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShippingOverrideModalOpen(true)}
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
            Add override
          </Button>
        </Stack>
      </Paper>

      {/* Product overrides */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e5e7eb',
          backgroundColor: '#fff',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
              Product overrides
            </Typography>
            <InfoIcon sx={{ color: '#6b7280', fontSize: 18 }} />
          </Stack>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setProductOverrideModalOpen(true)}
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
            Add override
          </Button>
        </Stack>
      </Paper>

      {/* Footer link */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Link
          href="https://www.google.com/search?q=Learn+more+about+sales+tax"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#2563eb',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Learn more about sales tax
        </Link>
      </Box>

      {/* Shipping Override Modal */}
      <Dialog
        open={shippingOverrideModalOpen}
        onClose={() => {
          setShippingOverrideModalOpen(false);
          setTaxRate('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Add shipping override
          </Typography>
          <IconButton
            onClick={() => {
              setShippingOverrideModalOpen(false);
              setTaxRate('');
            }}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              mb: 3,
              backgroundColor: '#fff7ed',
              color: '#9a3412',
              border: '1px solid #fed7aa',
              '& .MuiAlert-icon': {
                color: '#ea580c',
              },
              '& .MuiAlert-message': {
                color: '#9a3412',
              },
            }}
          >
            You need to add a GST registration for a region before you can create a product override for that region.
          </Alert>

          <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827', mb: 3 }}>
            Add a custom tax rate for shipping.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
              Tax rate
            </Typography>
            <TextField
              fullWidth
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ color: '#6b7280' }}>%</Typography>
                  </InputAdornment>
                ),
              }}
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

          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Only regions where you collect GST are shown.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setShippingOverrideModalOpen(false);
              setTaxRate('');
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
            disabled={!taxRate || parseFloat(taxRate) <= 0}
            onClick={() => {
              // Handle add override logic here
              setShippingOverrideModalOpen(false);
              setTaxRate('');
            }}
            sx={{
              textTransform: 'none',
              backgroundColor: '#6b7280',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
              '&.Mui-disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            Add override
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Override Modal */}
      <Dialog
        open={productOverrideModalOpen}
        onClose={() => {
          setProductOverrideModalOpen(false);
          setCollectionSearchQuery('');
          setSelectedCollection(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Add product override
          </Typography>
          <IconButton
            onClick={() => {
              setProductOverrideModalOpen(false);
              setCollectionSearchQuery('');
              setSelectedCollection(null);
            }}
            sx={{
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              mb: 3,
              backgroundColor: '#fff7ed',
              color: '#9a3412',
              border: '1px solid #fed7aa',
              '& .MuiAlert-icon': {
                color: '#ea580c',
              },
              '& .MuiAlert-message': {
                color: '#9a3412',
              },
            }}
          >
            You need to add a GST registration for a region before you can create a product override for that region.
          </Alert>

          <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827', mb: 3 }}>
            Add a custom sales tax rate for a collection of products. Select an existing collection or{' '}
            <Link
              component={RouterLink}
              to="/products/collections/new"
              onClick={() => {
                setProductOverrideModalOpen(false);
                setCollectionSearchQuery('');
                setSelectedCollection(null);
              }}
              sx={{
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': {
                  color: '#1d4ed8',
                },
              }}
            >
              create a new one
            </Link>
            .
          </Typography>

          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search"
              value={collectionSearchQuery}
              onChange={(e) => setCollectionSearchQuery(e.target.value)}
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

          {/* Collection List */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Collection
            </Typography>
            <Box
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                maxHeight: 200,
                overflowY: 'auto',
                backgroundColor: '#fff',
              }}
            >
              {filteredCollections.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: '#6b7280' }}>
                  No collections found
                </Box>
              ) : (
                filteredCollections.map((collection) => (
                  <Box
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection.id)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: selectedCollection === collection.id ? '#f3f4f6' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                      },
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Typography sx={{ color: '#111827', fontWeight: selectedCollection === collection.id ? 600 : 400 }}>
                      {collection.name}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Pagination */}
          {filteredCollections.length > 0 && (
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <IconButton
                disabled
                size="small"
                sx={{
                  border: '1px solid #e5e7eb',
                  color: '#d1d5db',
                  '&.Mui-disabled': {
                    borderColor: '#e5e7eb',
                    color: '#d1d5db',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                disabled
                size="small"
                sx={{
                  border: '1px solid #e5e7eb',
                  color: '#d1d5db',
                  '&.Mui-disabled': {
                    borderColor: '#e5e7eb',
                    color: '#d1d5db',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setProductOverrideModalOpen(false);
              setCollectionSearchQuery('');
              setSelectedCollection(null);
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
            disabled={!selectedCollection}
            onClick={() => {
              // Handle add override logic here
              setProductOverrideModalOpen(false);
              setCollectionSearchQuery('');
              setSelectedCollection(null);
            }}
            sx={{
              textTransform: 'none',
              backgroundColor: '#6b7280',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
              '&.Mui-disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            Add override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxRegionDetailPage;

