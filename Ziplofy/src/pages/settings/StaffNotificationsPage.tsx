import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  ListItem,
  ListItemButton,
  ListItemText,
  Switch,
  IconButton,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ChevronRight as ChevronRightIcon,
  Email as EmailIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  title: string;
  description: string;
  path: string;
  hasToggle?: boolean;
}

const StaffNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>({
    'salesattributionedited': true,
    'newdraftorder': true,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const notificationItems: NotificationItem[] = [
    {
      title: 'New order',
      description: 'Sent when a customer places an order',
      path: '/settings/notifications/staff/new-order',
    },
    {
      title: 'New return request',
      description: 'Sent when a customer requests a return on an order',
      path: '/settings/notifications/staff/new-return-request',
    },
    {
      title: 'Sales attribution edited',
      description: 'Sent to order notification subscribers when the attributed staff on an order is edited.',
      path: '/settings/notifications/staff/sales-attribution-edited',
      hasToggle: true,
    },
    {
      title: 'New draft order',
      description: 'Sent when a customer submits a draft order. Only sent to store owner',
      path: '/settings/notifications/staff/new-draft-order',
      hasToggle: true,
    },
  ];

  const handleToggleSwitch = (itemKey: string) => {
    setToggleStates((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <NotificationsIcon sx={{ fontSize: 24, color: '#111' }} />
        <ChevronRightIcon sx={{ fontSize: 20, color: '#666' }} />
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#111' }}>
          Staff notifications
        </Typography>
      </Box>

      {/* Notifications Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          mb: 3,
        }}
      >
        {notificationItems.map((item, index) => {
          const itemKey = item.title.toLowerCase().replace(/\s+/g, '');
          const isToggled = toggleStates[itemKey] ?? false;

          return (
            <React.Fragment key={index}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => !item.hasToggle && handleNavigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{
                      sx: { color: '#111', fontWeight: 500, mb: 0.5 },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: '#666', fontSize: '0.875rem' },
                    }}
                  />
                  {item.hasToggle ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={isToggled}
                        onChange={() => handleToggleSwitch(itemKey)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#111',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#111',
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(item.path);
                        }}
                        sx={{
                          color: '#666',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <ChevronRightIcon sx={{ color: '#666', ml: 2 }} />
                  )}
                </ListItemButton>
              </ListItem>
              {index < notificationItems.length - 1 && (
                <Box sx={{ height: 1, backgroundColor: '#e0e0e0', my: 0.5 }} />
              )}
            </React.Fragment>
          );
        })}
      </Paper>

      {/* Recipients Section */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#111', mb: 2 }}>
          Recipients
        </Typography>

        {/* Existing Recipient */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <EmailIcon sx={{ color: '#666', fontSize: 24 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#111', mb: 0.5 }}>
                My Store Admin
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                developer200419@gmail.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                All orders
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleMenuClick}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
          <MenuItem onClick={handleMenuClose}>Remove</MenuItem>
        </Menu>

        {/* Add Recipient Button */}
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            // TODO: Implement add recipient functionality
          }}
          sx={{
            mt: 2,
            textTransform: 'none',
            color: '#111',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          Add recipient
        </Button>
      </Paper>
    </Box>
  );
};

export default StaffNotificationsPage;

