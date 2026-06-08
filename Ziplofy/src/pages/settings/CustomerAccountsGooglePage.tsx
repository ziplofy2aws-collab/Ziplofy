import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
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

const CustomerAccountsGooglePage: React.FC = () => {
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
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authorizedOrigins, setAuthorizedOrigins] = useState<string[]>([]);
  const [redirectUris, setRedirectUris] = useState<string[]>([]);
  const [deauthUris, setDeauthUris] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate('/settings/customer-accounts/authentication');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fallbackOrigins = useMemo(
    () => ['https://ziplofy.com', 'https://example.myziplofy.com'],
    [],
  );
  const fallbackRedirects = useMemo(
    () => [
      'https://ziplofy.com/authentication/placeholder/social/google/callback',
      'https://example.myziplofy.com/authentication/social/google/callback',
    ],
    [],
  );
  const fallbackDeauth = useMemo(
    () => [
      'https://ziplofy.com/authentication/placeholder/social/google/revoke',
      'https://example.myziplofy.com/authentication/social/google/revoke',
    ],
    [],
  );

  useEffect(() => {
    if (activeStoreId) {
      fetchByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, fetchByStoreId]);

  useEffect(() => {
    if (!settings?.googleAuth) {
      setEnabled(false);
      setClientId('');
      setClientSecret('');
      setAuthorizedOrigins(fallbackOrigins);
      setRedirectUris(fallbackRedirects);
      setDeauthUris(fallbackDeauth);
      setHasUnsavedChanges(false);
      return;
    }
    setEnabled(Boolean(settings.googleAuth.enabled));
    setClientId(settings.googleAuth.clientId || '');
    setClientSecret(settings.googleAuth.clientSecret || '');
    setAuthorizedOrigins(
      (settings.googleAuth.authorizedJavaScriptOrigins?.length
        ? settings.googleAuth.authorizedJavaScriptOrigins
        : fallbackOrigins.slice()) as string[],
    );
    setRedirectUris(
      (settings.googleAuth.authorizedRedirectURIs?.length
        ? settings.googleAuth.authorizedRedirectURIs
        : fallbackRedirects.slice()) as string[],
    );
    setDeauthUris(
      (settings.googleAuth.deauthorizeCallbackURIs?.length
        ? settings.googleAuth.deauthorizeCallbackURIs
        : fallbackDeauth.slice()) as string[],
    );
    setHasUnsavedChanges(false);
  }, [settings, fallbackOrigins, fallbackRedirects, fallbackDeauth]);

  useEffect(() => {
    if (!settings?.googleAuth) {
      setHasUnsavedChanges(false);
      return;
    }
    const dirty =
      enabled !== Boolean(settings.googleAuth.enabled) ||
      clientId.trim() !== (settings.googleAuth.clientId || '') ||
      clientSecret.trim() !== (settings.googleAuth.clientSecret || '');
    setHasUnsavedChanges(dirty);
  }, [enabled, clientId, clientSecret, settings]);

  const handleSave = async () => {
    if (!settings?._id) return;
    try {
      setSaving(true);
      await update(settings._id, {
        googleAuth: {
          enabled,
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
          authorizedJavaScriptOrigins: authorizedOrigins,
          authorizedRedirectURIs: redirectUris,
          deauthorizeCallbackURIs: deauthUris,
        },
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      // handled by context
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
          Sign in with Google
        </Typography>
        {settings && (
          <Button
            variant="contained"
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
        Enable customers to sign in using their Google account
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
            In the Google Cloud Console, create or select a project using the instructions provided in the help documentation and the following configuration.
          </Typography>

          {/* Application type */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Application type
            </Typography>
            <TextField
              fullWidth
              value="Web application"
              InputProps={{
                readOnly: true,
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
          </Box>

          {/* Authorized JavaScript origins */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Authorized JavaScript origins
            </Typography>
            <Stack spacing={1.5}>
              {authorizedOrigins.map((origin, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={origin}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(origin)}
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

          {/* Authorized redirect URIs */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Authorized redirect URIs
            </Typography>
            <Stack spacing={1.5}>
              {redirectUris.map((uri, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={uri}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(uri)}
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

          {/* Deauthorize callback URIs */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
              Deauthorize callback URIs
            </Typography>
            <Stack spacing={1.5}>
              {deauthUris.map((uri, index) => (
                <TextField
                  key={index}
                  fullWidth
                  value={uri}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(uri)}
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
            Once the project is created, copy the Client ID and Client Secret shown by Google and paste them below.
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Client ID"
              required
              placeholder="From Google Console"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isDisabled}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />

            <TextField
              fullWidth
              label="Client Secret"
              required
              placeholder="From Google Console"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              type="password"
              disabled={isDisabled}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default CustomerAccountsGooglePage;

