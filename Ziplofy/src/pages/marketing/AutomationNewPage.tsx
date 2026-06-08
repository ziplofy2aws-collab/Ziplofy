import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";

const AutomationNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'trigger' | 'templates'>('trigger');

  const handleSelectTrigger = () => {
    setSelectedOption('trigger');
    navigate('/marketing/automations/create');
  };

  const handleBrowseTemplates = () => {
    navigate('/marketing/automations/templates');
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        position: 'relative',
      }}
    >
      {/* Illustration Section - Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 40 },
          right: { xs: 20, md: 40 },
          display: { xs: 'none', md: 'block' },
        }}
      >
          {/* Minimal Illustration */}
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
          }}
        >
          {/* Accent block */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 20,
              width: 40,
              height: 50,
              backgroundColor: '#e8eefc',
              borderRadius: '20px 20px 0 0',
              transform: 'rotate(-15deg)',
              '&::before': { display: 'none' },
              '&::after': { display: 'none' },
            }}
          />

          {/* Flow Diagram */}
          <Box
            sx={{
              position: 'absolute',
              top: 30,
              right: 0,
              width: 200,
              height: 100,
            }}
          >
            {/* Nodes */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 60,
                height: 40,
                backgroundColor: 'white',
                borderRadius: 2,
                border: '2px solid #e3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '80%',
                  height: '60%',
                  border: '2px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 20px 20px',
                }}
              />
            </Box>

            {/* Top node */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 80,
                height: 35,
                border: '2px solid #e3e8ff',
                borderRadius: 2,
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ff6b6b',
                  marginRight: 1,
                }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 2,
                  backgroundColor: '#e0e0e0',
                }}
              />
            </Box>

            {/* Bottom node */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 80,
                height: 35,
                border: '2px solid #e3e8ff',
                borderRadius: 2,
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 1,
              }}
            >
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '6px solid #4caf50',
                  marginRight: 1,
                }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 2,
                  backgroundColor: '#e0e0e0',
                }}
              />
            </Box>

            {/* Connecting lines */}
            <Box
              sx={{
                position: 'absolute',
                left: 60,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 60,
                height: 1,
                borderTop: '2px solid #e3e8ff',
                borderRight: '2px solid #e3e8ff',
                borderRadius: '0 20px 0 0',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  right: 0,
                  width: 1,
                  height: 20,
                  borderLeft: '2px solid #e3e8ff',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 60,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 60,
                height: 1,
                borderTop: '2px solid #e3e8ff',
                borderRight: '2px solid #e3e8ff',
                borderRadius: '0 0 0 20px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 20,
                  right: 0,
                  width: 1,
                  height: 20,
                  borderLeft: '2px solid #e3e8ff',
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          maxWidth: 600,
          textAlign: 'center',
        }}
      >
        {/* Start building text */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#424242',
            mb: 2,
          }}
        >
          Start building
        </Typography>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            maxWidth: 500,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSelectTrigger}
            sx={{
              flex: 1,
              backgroundColor: selectedOption === 'trigger' ? '#111827' : '#fff',
              color: selectedOption === 'trigger' ? '#fff' : '#374151',
              textTransform: 'none',
              py: 1.5,
              px: 3,
              borderRadius: 2,
              border: selectedOption === 'trigger' ? 'none' : '1px solid #e5e7eb',
              fontWeight: 600,
              position: 'relative',
              '&:hover': {
                backgroundColor: selectedOption === 'trigger' ? '#111827' : '#f9fafb',
              },
              '&::after': { display: 'none' },
            }}
          >
            Select a trigger
          </Button>

          <Button
            variant="outlined"
            onClick={handleBrowseTemplates}
            sx={{
              flex: 1,
              backgroundColor: '#fff',
              color: '#374151',
              textTransform: 'none',
              py: 1.5,
              px: 3,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#e5e7eb',
              },
            }}
          >
            Browse templates
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AutomationNewPage;

