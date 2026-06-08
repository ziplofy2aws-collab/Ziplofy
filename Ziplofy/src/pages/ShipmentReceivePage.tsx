import { Avatar, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTransferEntries } from '../contexts/transfer-entries.context';
import { useShipments } from '../contexts/shipment.context';

const ShipmentReceivePage: React.FC = () => {
  const navigate = useNavigate();
  const { id: transferId } = useParams();
  const { shipmentId } = useParams();
  const { entries, fetchByTransferId, loading } = useTransferEntries();
  const { receiveShipment, loading: shipmentsLoading } = useShipments();

  useEffect(() => {
    if (transferId) fetchByTransferId(transferId).catch(() => {});
  }, [transferId, fetchByTransferId]);

  const [acceptByEntry, setAcceptByEntry] = useState<Record<string, number>>({});
  const [rejectByEntry, setRejectByEntry] = useState<Record<string, number>>({});

  const handleAcceptChange = (entryId: string, transferredQty: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(ev.target.value ?? 0);
    const clampedAccept = Math.max(0, Math.min(transferredQty, isNaN(raw) ? 0 : raw));
    setAcceptByEntry(prev => ({ ...prev, [entryId]: clampedAccept }));
    // ensure reject does not exceed remaining
    setRejectByEntry(prev => {
      const currentReject = prev[entryId] ?? 0;
      const maxReject = Math.max(0, transferredQty - clampedAccept);
      const clampedReject = Math.max(0, Math.min(maxReject, currentReject));
      if (clampedReject === currentReject) return prev;
      return { ...prev, [entryId]: clampedReject };
    });
  };
  const handleRejectChange = (entryId: string, transferredQty: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(ev.target.value ?? 0);
    const currentAccept = acceptByEntry[entryId] ?? 0;
    const maxReject = Math.max(0, transferredQty - currentAccept);
    const clampedReject = Math.max(0, Math.min(maxReject, isNaN(raw) ? 0 : raw));
    setRejectByEntry(prev => ({ ...prev, [entryId]: clampedReject }));
  };

  const handleSave = async () => {
    if (!shipmentId) return;
    const items = entries.map(e => ({
      entryId: e._id,
      accept: Number(acceptByEntry[e._id] || 0),
      reject: Number(rejectByEntry[e._id] || 0),
    }));
    await receiveShipment(shipmentId, items);
    navigate('/products/transfers');
  };

  return (
    <div className="min-h-screen bg-page-background-color">
      <Box sx={{ width: '100%', color: '#000000', m: -3, p: 3, minHeight: '100%' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Receive Shipment</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>Control how much you want to accept or reject per variant.</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', bgcolor: 'white' }}>
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading entries...</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Variant</TableCell>
                    <TableCell align="right">Transferred Qty</TableCell>
                    <TableCell align="right">Accept</TableCell>
                    <TableCell align="right">Reject</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map(e => (
                    <TableRow key={e._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar variant="rounded" src={e.variantId.images?.[0] || undefined} sx={{ width: 36, height: 36 }} />
                          <Typography variant="body2" fontWeight={700}>{e.variantId.productName || 'Unnamed product'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {Object.entries(e.variantId.optionValues || {}).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{e.quantity}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 140 }}>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, max: e.quantity }}
                          value={acceptByEntry[e._id] ?? ''}
                          onChange={handleAcceptChange(e._id, Number(e.quantity) || 0)}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 140 }}>
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0, max: Math.max(0, (Number(e.quantity) || 0) - (acceptByEntry[e._id] ?? 0)) }}
                          value={rejectByEntry[e._id] ?? ''}
                          onChange={handleRejectChange(e._id, Number(e.quantity) || 0)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button variant="text" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={shipmentsLoading}>Save</Button>
          </Box>
        </Paper>
        </Box>
      </Box>
    </div>
  );
};

export default ShipmentReceivePage;


