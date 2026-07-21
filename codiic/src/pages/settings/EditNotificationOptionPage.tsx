import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNotificationOptions } from '../../contexts/notification-options.context';
import { useNotificationCategories } from '../../contexts/notification-categories.context';
import type { NotificationOption } from '../../contexts/notification-options.context';
import toast from 'react-hot-toast';

const EditNotificationOptionPage: React.FC = () => {
  const { categoryId, categorySlug, optionId } = useParams<{ categoryId: string; categorySlug: string; optionId: string }>();
  const navigate = useNavigate();
  const { options, fetchByCategoryId } = useNotificationOptions();
  const { categories, fetchAll: fetchCategories } = useNotificationCategories();
  const [currentOption, setCurrentOption] = useState<NotificationOption | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const isCustomerCategory = categorySlug?.includes('customer');
  const parentPath =
    categoryId && categorySlug
      ? `/settings/notifications/${categoryId}/${categorySlug}`
      : '/settings/notifications';

  const categoryName = useMemo(() => {
    if (!categoryId) return 'Notifications';
    const match = categories.find((c) => c._id === categoryId);
    if (match?.name) return match.name;
    if (categorySlug) {
      return categorySlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Notifications';
  }, [categories, categoryId, categorySlug]);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().catch(() => {
        // handled in context
      });
    }
  }, [categories.length, fetchCategories]);

  // Find the option by id
  useEffect(() => {
    if (optionId && options.length > 0) {
      const found = options.find((opt) => opt._id === optionId);

      if (found) {
        setCurrentOption(found);
        setEmailSubject(found.emailSubject || '');
        setEmailBody(found.emailBody || '');
        setIsDirty(false);
      }
    }
  }, [optionId, options]);

  useEffect(() => {
    if (!categoryId || options.length > 0) return;
    fetchByCategoryId(categoryId).catch(() => {
      // handled in context
    });
  }, [categoryId, options.length, fetchByCategoryId]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSubject(e.target.value);
    setIsDirty(true);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailBody(e.target.value);
    setIsDirty(true);
  };

  const handleLocalize = () => {
    // TODO: Implement localization
    console.log('Localize');
  };

  const handlePreview = () => {
    if (!optionId || !categoryId || !categorySlug) return;
    navigate(`/settings/notifications/${categoryId}/${categorySlug}/${optionId}`, {
      state: {
        categoryId,
        parentPath,
        categoryName,
      },
    });
  };

  const handleRevertToDefault = () => {
    if (currentOption) {
      // Reset to original values
      setEmailSubject(currentOption.emailSubject || '');
      setEmailBody(currentOption.emailBody || '');
      setIsDirty(false);
      toast.success('Reverted to default values');
    }
  };

  const handleSave = async () => {
    if (!currentOption) return;

    try {
      // TODO: Implement API call to update notification option
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Email template updated successfully');
      setIsDirty(false);
      // Optionally navigate back to detail page
      // navigate(`/settings/notifications/customer/${optionName}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update email template');
    }
  };

  if (!categoryId || !categorySlug) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <Box sx={{ maxWidth: 1200, mx: 'auto', py: 0 }}>
            <Typography>Notification category not found.</Typography>
          </Box>
        </div>
      </div>
    );
  }

  if (!currentOption) {
    return (
      <div className="w-full">
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          <Box sx={{ maxWidth: 1200, mx: 'auto', py: 0 }}>
            <Typography>Loading...</Typography>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <Box sx={{ maxWidth: 1200, mx: 'auto', py: 0, width: '100%' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRightIcon sx={{ fontSize: 16 }} />}
        sx={{ mb: 3 }}
      >
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/settings/notifications')}
          sx={{
            color: '#666',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            cursor: 'pointer',
          }}
        >
          Notifications
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            if (categoryId && categorySlug) {
              navigate(parentPath, { state: { categoryId } });
            } else {
              navigate('/settings/notifications');
            }
          }}
          sx={{
            color: '#666',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            cursor: 'pointer',
          }}
        >
          {categoryName}
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            if (!optionId || !categoryId || !categorySlug) return;
            navigate(`/settings/notifications/${categoryId}/${categorySlug}/${optionId}`, {
              state: {
                categoryId,
                parentPath,
                categoryName,
              },
            });
          }}
          sx={{
            color: '#666',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
            cursor: 'pointer',
          }}
        >
          {currentOption.optionName}
        </Link>
        <Typography variant="body2" sx={{ color: '#111' }}>
          Edit {currentOption.optionName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#111' }}>
          Edit {currentOption.optionName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleLocalize}
            sx={{
              textTransform: 'none',
              color: '#111',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Localize
          </Button>
          <Button
            variant="outlined"
            onClick={handlePreview}
            sx={{
              textTransform: 'none',
              color: '#111',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Preview
          </Button>
        </Box>
      </Box>

      {/* Liquid Variables Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111', mb: 2 }}>
          Liquid variables
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
          You can use{' '}
          <Link
            href="#"
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            liquid variables
          </Link>{' '}
          to customize your templates. Learn more about liquid variables.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          You can customize the look and feel across all email notifications from the{' '}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (isCustomerCategory) {
                navigate('/settings/notifications/customer/templates');
              }
            }}
            sx={{
              color: '#1976d2',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
              cursor: 'pointer',
            }}
          >
            Customize email templates
          </Link>{' '}
          page.
        </Typography>
      </Paper>

      {/* Email Subject Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111', mb: 2 }}>
          Email subject
        </Typography>
        <TextField
          fullWidth
          value={emailSubject}
          onChange={handleSubjectChange}
          placeholder="Enter email subject"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
            },
          }}
        />
      </Paper>

      {/* Email Body (HTML) Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111', mb: 2 }}>
          Email body (HTML)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={emailBody}
          onChange={handleBodyChange}
          placeholder="Enter email body HTML"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
          }}
        />
      </Paper>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          onClick={handleRevertToDefault}
          sx={{
            textTransform: 'none',
            color: '#111',
            borderColor: '#ddd',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Revert to default
        </Button>
        {isDirty && (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              textTransform: 'none',
              backgroundColor: '#111',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              },
            }}
          >
            Save
          </Button>
        )}
      </Box>
        </Box>
      </div>
    </div>
  );
};

export default EditNotificationOptionPage;

