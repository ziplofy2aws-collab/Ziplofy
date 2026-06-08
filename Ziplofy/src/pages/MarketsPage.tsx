import React, { useState, SyntheticEvent, JSX } from "react";
import { Box, Typography, Paper, Tabs, Tab } from "@mui/material";

export default function OrdersPage(): JSX.Element {
  const [tab, setTab] = useState<number>(0);

  const handleChange = (event: SyntheticEvent, newValue: number): void => {
    setTab(newValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Tabs value={tab} onChange={handleChange} sx={{ mb: 2 }}>
        <Tab label="Drafts" />
        <Tab label="Abandoned Carts" />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1">This is the Drafts section.</Typography>
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1">
            This is the Abandoned Carts section.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
