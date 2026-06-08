import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InventoryLevelModel } from '../models/inventory-level/inventory-level.model';
import { Shipment } from '../models/shipment/shipment.model';
import { TransferEntry } from '../models/transfer-entry/transfer-entry.model';
import { Transfer } from '../models/transfers/transfers.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// POST /shipments
export const createShipment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { transferId, trackingNumber, carrier, estimatedArrivalDate } = req.body as {
    transferId?: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedArrivalDate?: string | Date;
  };

  if (!transferId || !mongoose.isValidObjectId(transferId)) {
    throw new CustomError('Valid transferId is required', 400);
  }

  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw new CustomError('Transfer not found', 404);

  // Optional: enforce business flow that shipment can be created only after ready_to_ship
  // if (transfer.status !== 'ready_to_ship') {
  //   throw new CustomError('Shipment can only be created for transfers in ready_to_ship status', 400);
  // }

  const shipment = await Shipment.create({
    transferId: new mongoose.Types.ObjectId(transferId),
    trackingNumber,
    carrier,
    estimatedArrivalDate: estimatedArrivalDate ? new Date(estimatedArrivalDate) : undefined,
    shippedDate: new Date(),
  });

  return res.status(201).json({ success: true, data: shipment, message: 'Shipment created successfully' });
});

// GET /shipments/transfer/:transferId
export const getShipmentByTransferId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid transferId is required', 400);
  }

  const shipment = await Shipment.findOne({ transferId: new mongoose.Types.ObjectId(id) }).sort({ createdAt: -1 });

  return res.status(200).json({ success: true, data: shipment });
});

// POST /shipments/:id/in-transit
export const markShipmentInTransit = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipment id is required', 400);
  }

  const shipment = await Shipment.findById(id);
  if (!shipment) throw new CustomError('Shipment not found', 404);

  const transferId = shipment.transferId as any as mongoose.Types.ObjectId;
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw new CustomError('Transfer not found', 404);

  // Adjust inventory: move reserved from origin to incoming at destination
  const originId = transfer.originLocationId as any as mongoose.Types.ObjectId;
  const destinationId = transfer.destinationLocationId as any as mongoose.Types.ObjectId;
  if (!originId || !destinationId) {
    throw new CustomError('Transfer missing origin or destination location', 400);
  }

  const entries = await TransferEntry.find({ transferId: transfer._id }).lean();

  for (const entry of entries) {
    const variantId = (entry as any).variantId as mongoose.Types.ObjectId;
    const qty = Number((entry as any).quantity) || 0;
    if (!variantId || qty <= 0) continue;

    // Origin: decrease unavailable.other by qty (not below 0), and reduce onHand since stock leaves origin
    const originLevel = await InventoryLevelModel.findOne({ variantId, locationId: originId });
    if (originLevel) {
      const unavail = originLevel.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 } as any;
      const nextUnavailable = {
        ...unavail,
        other: Math.max(0, (unavail.other || 0) - qty),
      };
      const unavailTotal = (nextUnavailable.damaged || 0) + (nextUnavailable.qualityControl || 0) + (nextUnavailable.safetyStock || 0) + (nextUnavailable.other || 0);
      originLevel.unavailable = nextUnavailable as any;
      // Deduct physically shipped qty from origin onHand now that items left the origin
      originLevel.onHand = Math.max(0, (originLevel.onHand || 0) - qty);
      originLevel.available = Math.max(0, (originLevel.onHand || 0) - (originLevel.committed || 0) - unavailTotal);
      await originLevel.save();
    }

    // Destination: increase incoming by qty (create level if missing)
    let destLevel = await InventoryLevelModel.findOne({ variantId, locationId: destinationId });
    if (!destLevel) {
      destLevel = await InventoryLevelModel.create({
        variantId,
        locationId: destinationId,
        onHand: 0,
        committed: 0,
        unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
        available: 0,
        incoming: 0,
      } as any);
    }
    destLevel.incoming = Math.max(0, (destLevel.incoming || 0) + qty);
    await destLevel.save();
  }

  // Update statuses
  shipment.status = 'in_transit';
  await shipment.save();

  transfer.status = 'in_progress';
  await transfer.save();

  return res.status(200).json({ 
    success: true, 
    data: { shipmentId: shipment._id, transferId: transfer._id }, 
    message: 'Shipment marked as in transit; inventory updated and transfer in progress' 
  });
});

// PUT /shipments/:id
export const updateShipment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipment id is required', 400);
  }

  const { estimatedArrivalDate, trackingNumber, carrier } = req.body as Partial<{ estimatedArrivalDate: string | Date; trackingNumber: string; carrier: string }>;

  const update: any = {};
  if (estimatedArrivalDate !== undefined) update.estimatedArrivalDate = estimatedArrivalDate ? new Date(estimatedArrivalDate) : undefined;
  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
  if (carrier !== undefined) update.carrier = carrier;

  const updated = await Shipment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!updated) throw new CustomError('Shipment not found', 404);

  return res.status(200).json({ success: true, data: updated, message: 'Shipment updated successfully' });
});

// DELETE /shipments/:id
export const deleteShipment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipment id is required', 400);
  }

  const deleted = await Shipment.findByIdAndDelete(id);
  if (!deleted) throw new CustomError('Shipment not found', 404);

  return res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
});


export const receiveShipment = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new CustomError('Valid shipment id is required', 400);
  }

  const shipment = await Shipment.findById(id);
  if (!shipment) throw new CustomError('Shipment not found', 404);

  const transferId = shipment.transferId as any as mongoose.Types.ObjectId;
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw new CustomError('Transfer not found', 404);

  const destinationId = transfer.destinationLocationId as any as mongoose.Types.ObjectId;
  if (!destinationId) throw new CustomError('Transfer missing destination location', 400);

  const payload = req.body as {entryId: string; accept: number; reject: number}[];

  const entries = await TransferEntry.find({ transferId: transfer._id }).lean();
  const entryById = new Map(entries.map(e => [String(e._id), e]));

  for (const it of payload) {
    if (!it || !it.entryId || !mongoose.isValidObjectId(it.entryId)) continue;
    const entry = entryById.get(String(it.entryId));
    if (!entry) continue;
    const accept = Math.max(0, Number(it.accept) || 0);
    const reject = Math.max(0, Number(it.reject) || 0);
    const total = Number((entry as any).quantity) || 0;
    const processed = Math.min(total, accept + reject);
    const effectiveAccept = Math.min(accept, processed);

    const variantId = (entry as any).variantId as mongoose.Types.ObjectId;
    if (!variantId) continue;

    let destLevel = await InventoryLevelModel.findOne({ variantId, locationId: destinationId });
    if (!destLevel) {
      destLevel = await InventoryLevelModel.create({
        variantId,
        locationId: destinationId,
        onHand: 0,
        committed: 0,
        unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
        available: 0,
        incoming: 0,
      } as any);
    }
    const incomingNow = Math.max(0, (destLevel.incoming || 0) - processed);
    const onHandNow = Math.max(0, (destLevel.onHand || 0) + effectiveAccept);
    const availableNow = Math.max(0, (destLevel.available || 0) + effectiveAccept);
    destLevel.incoming = incomingNow;
    destLevel.onHand = onHandNow;
    destLevel.available = availableNow;
    await destLevel.save();
  }

  shipment.status = 'received';
  shipment.receivedDate = new Date();
  await shipment.save();

  transfer.status = 'transferred';
  await transfer.save();

  return res.status(200).json({ success: true, data: { shipmentId: shipment._id, transferId: transfer._id }, message: 'Shipment received and inventory updated' });
});

