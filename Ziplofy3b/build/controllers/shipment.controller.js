"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveShipment = exports.deleteShipment = exports.updateShipment = exports.markShipmentInTransit = exports.getShipmentByTransferId = exports.createShipment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
const shipment_model_1 = require("../models/shipment/shipment.model");
const transfer_entry_model_1 = require("../models/transfer-entry/transfer-entry.model");
const transfers_model_1 = require("../models/transfers/transfers.model");
const error_utils_1 = require("../utils/error.utils");
// POST /shipments
exports.createShipment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { transferId, trackingNumber, carrier, estimatedArrivalDate } = req.body;
    if (!transferId || !mongoose_1.default.isValidObjectId(transferId)) {
        throw new error_utils_1.CustomError('Valid transferId is required', 400);
    }
    const transfer = await transfers_model_1.Transfer.findById(transferId);
    if (!transfer)
        throw new error_utils_1.CustomError('Transfer not found', 404);
    // Optional: enforce business flow that shipment can be created only after ready_to_ship
    // if (transfer.status !== 'ready_to_ship') {
    //   throw new CustomError('Shipment can only be created for transfers in ready_to_ship status', 400);
    // }
    const shipment = await shipment_model_1.Shipment.create({
        transferId: new mongoose_1.default.Types.ObjectId(transferId),
        trackingNumber,
        carrier,
        estimatedArrivalDate: estimatedArrivalDate ? new Date(estimatedArrivalDate) : undefined,
        shippedDate: new Date(),
    });
    return res.status(201).json({ success: true, data: shipment, message: 'Shipment created successfully' });
});
// GET /shipments/transfer/:transferId
exports.getShipmentByTransferId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid transferId is required', 400);
    }
    const shipment = await shipment_model_1.Shipment.findOne({ transferId: new mongoose_1.default.Types.ObjectId(id) }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: shipment });
});
// POST /shipments/:id/in-transit
exports.markShipmentInTransit = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipment id is required', 400);
    }
    const shipment = await shipment_model_1.Shipment.findById(id);
    if (!shipment)
        throw new error_utils_1.CustomError('Shipment not found', 404);
    const transferId = shipment.transferId;
    const transfer = await transfers_model_1.Transfer.findById(transferId);
    if (!transfer)
        throw new error_utils_1.CustomError('Transfer not found', 404);
    // Adjust inventory: move reserved from origin to incoming at destination
    const originId = transfer.originLocationId;
    const destinationId = transfer.destinationLocationId;
    if (!originId || !destinationId) {
        throw new error_utils_1.CustomError('Transfer missing origin or destination location', 400);
    }
    const entries = await transfer_entry_model_1.TransferEntry.find({ transferId: transfer._id }).lean();
    for (const entry of entries) {
        const variantId = entry.variantId;
        const qty = Number(entry.quantity) || 0;
        if (!variantId || qty <= 0)
            continue;
        // Origin: decrease unavailable.other by qty (not below 0), and reduce onHand since stock leaves origin
        const originLevel = await inventory_level_model_1.InventoryLevelModel.findOne({ variantId, locationId: originId });
        if (originLevel) {
            const unavail = originLevel.unavailable || { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 };
            const nextUnavailable = {
                ...unavail,
                other: Math.max(0, (unavail.other || 0) - qty),
            };
            const unavailTotal = (nextUnavailable.damaged || 0) + (nextUnavailable.qualityControl || 0) + (nextUnavailable.safetyStock || 0) + (nextUnavailable.other || 0);
            originLevel.unavailable = nextUnavailable;
            // Deduct physically shipped qty from origin onHand now that items left the origin
            originLevel.onHand = Math.max(0, (originLevel.onHand || 0) - qty);
            originLevel.available = Math.max(0, (originLevel.onHand || 0) - (originLevel.committed || 0) - unavailTotal);
            await originLevel.save();
        }
        // Destination: increase incoming by qty (create level if missing)
        let destLevel = await inventory_level_model_1.InventoryLevelModel.findOne({ variantId, locationId: destinationId });
        if (!destLevel) {
            destLevel = await inventory_level_model_1.InventoryLevelModel.create({
                variantId,
                locationId: destinationId,
                onHand: 0,
                committed: 0,
                unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
                available: 0,
                incoming: 0,
            });
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
exports.updateShipment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipment id is required', 400);
    }
    const { estimatedArrivalDate, trackingNumber, carrier } = req.body;
    const update = {};
    if (estimatedArrivalDate !== undefined)
        update.estimatedArrivalDate = estimatedArrivalDate ? new Date(estimatedArrivalDate) : undefined;
    if (trackingNumber !== undefined)
        update.trackingNumber = trackingNumber;
    if (carrier !== undefined)
        update.carrier = carrier;
    const updated = await shipment_model_1.Shipment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated)
        throw new error_utils_1.CustomError('Shipment not found', 404);
    return res.status(200).json({ success: true, data: updated, message: 'Shipment updated successfully' });
});
// DELETE /shipments/:id
exports.deleteShipment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipment id is required', 400);
    }
    const deleted = await shipment_model_1.Shipment.findByIdAndDelete(id);
    if (!deleted)
        throw new error_utils_1.CustomError('Shipment not found', 404);
    return res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
});
exports.receiveShipment = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError('Valid shipment id is required', 400);
    }
    const shipment = await shipment_model_1.Shipment.findById(id);
    if (!shipment)
        throw new error_utils_1.CustomError('Shipment not found', 404);
    const transferId = shipment.transferId;
    const transfer = await transfers_model_1.Transfer.findById(transferId);
    if (!transfer)
        throw new error_utils_1.CustomError('Transfer not found', 404);
    const destinationId = transfer.destinationLocationId;
    if (!destinationId)
        throw new error_utils_1.CustomError('Transfer missing destination location', 400);
    const payload = req.body;
    const entries = await transfer_entry_model_1.TransferEntry.find({ transferId: transfer._id }).lean();
    const entryById = new Map(entries.map(e => [String(e._id), e]));
    for (const it of payload) {
        if (!it || !it.entryId || !mongoose_1.default.isValidObjectId(it.entryId))
            continue;
        const entry = entryById.get(String(it.entryId));
        if (!entry)
            continue;
        const accept = Math.max(0, Number(it.accept) || 0);
        const reject = Math.max(0, Number(it.reject) || 0);
        const total = Number(entry.quantity) || 0;
        const processed = Math.min(total, accept + reject);
        const effectiveAccept = Math.min(accept, processed);
        const variantId = entry.variantId;
        if (!variantId)
            continue;
        let destLevel = await inventory_level_model_1.InventoryLevelModel.findOne({ variantId, locationId: destinationId });
        if (!destLevel) {
            destLevel = await inventory_level_model_1.InventoryLevelModel.create({
                variantId,
                locationId: destinationId,
                onHand: 0,
                committed: 0,
                unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
                available: 0,
                incoming: 0,
            });
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
