import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ContentCopy as ContentCopyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/store.context';
import { useCustomerAccountSettings } from '../../contexts/customer-account-settings.context';

const cardStyles = {
  p: 3,
  borderRadius: 2,
  border: '1px solid #e5e7eb',
  backgroundColor: '#fff',
};

const fallbackDomains = ['https://ziplofy.com', 'https://example.myziplofy.com'];
const fallbackRedirects = [
  'https://ziplofy.com/authentication/placeholder/social/facebook/callback',
  'https://example.myziplofy.com/authentication/social/facebook/callback',
];
const fallbackDeauth = [
  'https://ziplofy.com/authentication/placeholder/social/facebook/revoke',
  'https://example.myziplofy.com/authentication/social/facebook/revoke',
];

const CustomerAccountsFacebookPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const {
    settings,
    loading,
    error,
    fetchByStoreId,
    update,
  } = useCustomerAccountSettings();
  const [enabled, setEnabled] = useState(false);
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [domains, setDomains] = useState<string[]>(fallbackDomains);
  const [redirectURLs, setRedirectURLs] = useState<string[]>(fallbackRedirects);
  const [deauthorizeCallbackURLs, setDeauthorizeCallbackURLs] = useState<string[]>(fallbackDeauth);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate('/settings/customer-accounts/authentication');
  };

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (!settings?.facebookAuth) {
      setEnabled(false);
      setAppId('');
      setAppSecret('');
      setDomains(fallbackDomains);
      setRedirectURLs(fallbackRedirects);
      setDeauthorizeCallbackURLs(fallbackDeauth);
      setHasUnsavedChanges(false);
      return;
    }
    setEnabled(Boolean(settings.facebookAuth.enabled));
    setAppId(settings.facebookAuth.appId || '');
    setAppSecret(settings.facebookAuth.appSecret || '');
    setDomains(settings.facebookAuth.domains?.length ? settings.facebookAuth.domains : fallbackDomains);
    setRedirectURLs(
      settings.facebookAuth.redirectURLs?.length ? settings.facebookAuth.redirectURLs : fallbackRedirects,
    );
    setDeauthorizeCallbackURLs(
      settings.facebookAuth.deauthorizeCallbackURLs?.length
        ? settings.facebookAuth.deauthorizeCallbackURLs
        : fallbackDeauth,
    );
    setHasUnsavedChanges(false);
  }, [settings]);

  useEffect(() => {
    if (!settings) {
      setHasUnsavedChanges(false);
      return;
    }
    const baseEnabled = Boolean(settings.facebookAuth?.enabled);
    const baseAppId = settings.facebookAuth?.appId || '';
    const baseAppSecret = settings.facebookAuth?.appSecret || '';
    const dirty =
      enabled !== baseEnabled ||
      appId.trim() !== baseAppId ||
      appSecret.trim() !== baseAppSecret;
    setHasUnsavedChanges(dirty);
  }, [enabled, appId, appSecret, settings]);

  const handleSave = async () => {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await update(settings._id, {
        facebookAuth: {
          enabled,
          appId: appId.trim(),
          appSecret: appSecret.trim(),
          domains,
          redirectURLs,
          deauthorizeCallbackURLs,
        },
      });
      setHasUnsavedChanges(false);
    } catch {
      // handled via context error state
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = loading || saving || !settings;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <IconButton
          onClick={handleBack}
          size="small"
          sx={{
            border: '1px solid rgba(17, 24, 39, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <PersonIcon sx={{ color: '#374151', fontSize: 20 }} />
        <ArrowForwardIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', flexGrow: 1 }}>
          Sign in with Facebook
        </Typography>
        {settings && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isDisabled}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, minWidth: 120 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
        <Switch
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={isDisabled}
          sx={{
            ml: 2,
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#111827',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#111827',
            },
          }}
        />
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          {enabled ? 'On' : 'Off'}
        </Typography>
      </Stack>

      <Typography variant="body1" sx={{ color: '#6b7280', mb: 4 }}>
        Enable customers to sign in using their Facebook account
      </Typography>

      {error && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 1.5,
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
          }}
        >
          {error}
        </Paper>
      )}

      <Stack spacing={3}>
        {/* Setup instructions */}
        <Paper elevation={0} sx={cardStyles}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Setup instructions
          </Typography>

          <Typography variant="body2" sx={{ color: '#4b5563', mb: 3 }}>
            In the{' '}
            <Link
              href="https://developers.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Meta for Developers
            </Link>
            {' '}console, create a new App and add "Facebook Login" using the instructions provided in the{' '}
            <Link
              href="#"
              sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              help documentation
            </Link>
            {' '}and the following configuration.
          </Typography>

          {/* Domains */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Domains
            </Typography>
            <Stack spacing={1.5}>
              {domains.map((domain, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={domain}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(domain)}
                          sx={{ color: '#6b7280' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      backgroundColor: '#f9fafb',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e5e7eb',
                      },
                    },
                  }}
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          {/* Redirect URLs */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Redirect URLs
            </Typography>
            <Stack spacing={1.5}>
              {redirectURLs.map((url, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={url}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(url)}
                          sx={{ color: '#6b7280' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      backgroundColor: '#f9fafb',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e5e7eb',
                      },
                    },
                  }}
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          {/* Deauthorize callback URLs */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Deauthorize callback URLs
            </Typography>
            <Stack spacing={1.5}>
              {deauthorizeCallbackURLs.map((url, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={url}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(url)}
                          sx={{ color: '#6b7280' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      backgroundColor: '#f9fafb',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e5e7eb',
                      },
                    },
                  }}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* Credentials */}
        <Paper elevation={0} sx={cardStyles}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Credentials
          </Typography>

          <Typography variant="body2" sx={{ color: '#4b5563', mb: 3 }}>
            Once created, copy the App ID and App Secret shown by Facebook and paste them below.
          </Typography>

          <Stack spacing={2}>
            <Box>
              <TextField
                fullWidth
                label="App ID"
                required
                placeholder="From Facebook Developers portal"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                disabled={isDisabled}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                From Facebook Developers portal
              </Typography>
            </Box>

            <Box>
              <TextField
                fullWidth
                label="App Secret"
                required
                placeholder="From Facebook Developers portal"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                type="password"
                disabled={isDisabled}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block' }}>
                From Facebook Developers portal
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default CustomerAccountsFacebookPage;
