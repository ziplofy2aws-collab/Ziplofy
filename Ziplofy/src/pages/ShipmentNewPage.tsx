import { Avatar, Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useShipments } from '../contexts/shipment.context';

const CARRIERS = [
  '4PX-99','Minutos','Aeronet','AGS','Amazon','Amazon Logistics UK','AMM Expedition','ANpost','Anuj Logistics','Apple Express'
];

const ShipmentNewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { transferId?: string; entries?: any[] } };
  const params = useParams();
  const routeTransferId = params.id as string | undefined;
  const transferId = routeTransferId || location.state?.transferId;
  const entries = location.state?.entries || [];
  const { createShipment, loading } = useShipments();

  const [eta, setEta] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const totalUnits = useMemo(() => entries.reduce((sum, e) => sum + (e?.quantity || 0), 0), [entries]);

  const handleCreate = async () => {
    if (!transferId || !eta || !trackingNumber || !carrier) return;
    await createShipment({
      transferId,
      estimatedArrivalDate: eta,
      trackingNumber,
      carrier
    });
    navigate(`/products/transfers/${transferId}`);
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <Box sx={{ width: '100%', color: '#000000', m: -3, p: 3, minHeight: '100%' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Create Shipment</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>Transfer #{transferId?.slice(-8) || '—'} • {totalUnits} units</Typography>
        </Paper>

        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Items to ship</Typography>
            <Stack spacing={2}>
              {entries.map((e: any) => (
                <Box key={e._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                  <Avatar variant="rounded" src={e.variantId?.images?.[0] || undefined} sx={{ width: 48, height: 48 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{e.variantId?.productName || 'Unnamed product'}</Typography>
                    {!!e.variantId?.optionValues && (
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {Object.entries(e.variantId.optionValues).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </Typography>
                    )}
                  </Box>
                  <Chip label={`Qty: ${e.quantity}`} />
                </Box>
              ))}
              {entries.length === 0 && (
                <Typography variant="body2" color="text.secondary">No entries found from transfer state.</Typography>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', bgcolor: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Shipment details</Typography>
            <Stack spacing={2}>
              <TextField
                type="date"
                label="Estimated arrival date"
                InputLabelProps={{ shrink: true }}
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
              <TextField
                label="Tracking number"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <FormControl>
                <InputLabel>Shipping carrier</InputLabel>
                <Select label="Shipping carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                  {CARRIERS.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
              <Button variant="text" onClick={() => navigate(-1)}>Back</Button>
              <Button variant="contained" disabled={!eta || !trackingNumber || !carrier || !transferId || loading} onClick={handleCreate}>
                {loading ? 'Creating...' : 'Create shipment'}
              </Button>
            </Box>
          </Paper>
        </Stack>
        </Box>
      </Box>
    </div>
  );
};

export default ShipmentNewPage;


