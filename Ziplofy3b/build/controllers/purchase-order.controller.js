"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivePurchaseOrderInventory = exports.markPurchaseOrderAsOrdered = exports.getPurchaseOrdersByStoreId = exports.createPurchaseOrder = void 0;
const purchase_order_entry_model_1 = require("../models/purchase-order-entry/purchase-order-entry.model");
const inventory_level_model_1 = require("../models/inventory-level/inventory-level.model");
const purchase_order_model_1 = require("../models/purchase-order/purchase-order.model");
const error_utils_1 = require("../utils/error.utils");
const mongoose_1 = __importDefault(require("mongoose"));
// Create a new purchase order
exports.createPurchaseOrder = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, supplierId, destinationLocationId, orderDate, tags, paymentTerm, supplierCurrency, shippingCarrier, trackingNumber, expectedArrivalDate, costAdjustments, status, entries } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    // Validate required fields
    if (!storeId || !supplierId || !destinationLocationId) {
        throw new error_utils_1.CustomError("Store ID, Supplier ID, and Destination Location ID are required", 400);
    }
    // Validate entries
    if (!entries || entries.length === 0) {
        throw new error_utils_1.CustomError("At least one entry is required", 400);
    }
    // Validate each entry
    for (const entry of entries) {
        if (!entry.variantId || !entry.quantityOrdered || !entry.cost) {
            throw new error_utils_1.CustomError("Each entry must have variantId, quantityOrdered, and cost", 400);
        }
    }
    // Create the purchase order
    const purchaseOrder = await purchase_order_model_1.PurchaseOrder.create({
        storeId,
        supplierId,
        destinationLocationId,
        orderDate: orderDate || new Date(),
        tags: tags || [],
        paymentTerm,
        supplierCurrency,
        shippingCarrier,
        trackingNumber,
        expectedArrivalDate,
        costAdjustments: costAdjustments || [],
        status: status || 'draft',
        isDeleted: false,
    });
    // Create purchase order entries
    const createdEntries = [];
    for (const entry of entries) {
        const totalCost = entry.quantityOrdered * entry.cost;
        const taxAmount = entry.taxPercent ? (totalCost * entry.taxPercent) / 100 : 0;
        const finalTotalCost = totalCost + taxAmount;
        const purchaseOrderEntry = await purchase_order_entry_model_1.PurchaseOrderEntry.create({
            purchaseOrderId: purchaseOrder._id,
            variantId: entry.variantId,
            supplierSku: entry.supplierSku,
            quantityOrdered: entry.quantityOrdered,
            quantityReceived: 0, // Default to 0 for new orders
            cost: entry.cost,
            taxPercent: entry.taxPercent || 0,
            totalCost: finalTotalCost,
        });
        createdEntries.push(purchaseOrderEntry);
    }
    // Calculate totals for the purchase order
    const subtotalCost = createdEntries.reduce((sum, entry) => sum + (entry.quantityOrdered * entry.cost), 0);
    const totalTax = createdEntries.reduce((sum, entry) => {
        const lineTotal = entry.quantityOrdered * entry.cost;
        return sum + (lineTotal * (entry.taxPercent || 0) / 100);
    }, 0);
    const totalCost = subtotalCost + totalTax;
    // Update purchase order with calculated totals
    purchaseOrder.subtotalCost = subtotalCost;
    purchaseOrder.totalTax = totalTax;
    purchaseOrder.totalCost = totalCost;
    await purchaseOrder.save();
    // Populate the purchase order with tags and other references
    const populatedPurchaseOrder = await purchase_order_model_1.PurchaseOrder.findById(purchaseOrder._id)
        .populate('storeId', 'storeName')
        .populate('supplierId', 'name')
        .populate('destinationLocationId', 'name address')
        .populate('tags', 'name');
    res.status(201).json({
        success: true,
        message: "Purchase order created successfully",
        data: {
            purchaseOrder: populatedPurchaseOrder,
        },
    });
});
// Get all purchase orders by store ID
exports.getPurchaseOrdersByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        throw new error_utils_1.CustomError("User not authenticated", 401);
    }
    if (!storeId) {
        throw new error_utils_1.CustomError("Store ID is required", 400);
    }
    // Optional query parameters for filtering
    const { status, isDeleted = false, dateFrom, dateTo, } = req.query;
    // Build MongoDB query
    const query = {
        storeId,
        isDeleted: isDeleted === 'true',
    };
    if (status) {
        query.status = status;
    }
    if (dateFrom || dateTo) {
        query.orderDate = {};
        if (dateFrom) {
            query.orderDate.$gte = new Date(dateFrom);
        }
        if (dateTo) {
            query.orderDate.$lte = new Date(dateTo);
        }
    }
    // Get purchase orders
    const purchaseOrders = await purchase_order_model_1.PurchaseOrder.find(query)
        .populate('storeId', 'storeName')
        .populate('supplierId', 'name')
        .populate('destinationLocationId', 'name address')
        .populate('tags', 'name')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "Purchase orders retrieved successfully",
        data: {
            purchaseOrders,
        },
    });
});
// Mark purchase order as ordered
exports.markPurchaseOrderAsOrdered = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid purchase order id", 400);
    }
    const po = await purchase_order_model_1.PurchaseOrder.findById(id);
    if (!po)
        throw new error_utils_1.CustomError("Purchase order not found", 404);
    if (po.status !== 'draft') {
        throw new error_utils_1.CustomError("Only draft purchase orders can be marked as ordered", 400);
    }
    po.status = 'ordered';
    await po.save();
    // Increment destination location incoming for each variant in entries
    const entries = await purchase_order_entry_model_1.PurchaseOrderEntry.find({ purchaseOrderId: po._id }).lean();
    for (const entry of entries) {
        const variantId = entry.variantId;
        const qty = Math.max(0, Number(entry.quantityOrdered) || 0);
        const destinationId = po.destinationLocationId;
        if (!variantId || !destinationId || qty <= 0)
            continue;
        let level = await inventory_level_model_1.InventoryLevelModel.findOne({ variantId, locationId: destinationId });
        if (!level) {
            level = await inventory_level_model_1.InventoryLevelModel.create({
                variantId,
                locationId: destinationId,
                onHand: 0,
                committed: 0,
                unavailable: { damaged: 0, qualityControl: 0, safetyStock: 0, other: 0 },
                available: 0,
                incoming: 0,
            });
        }
        level.incoming = Math.max(0, (level.incoming || 0) + qty);
        await level.save();
    }
    const populated = await purchase_order_model_1.PurchaseOrder.findById(po._id)
        .populate('storeId', 'storeName')
        .populate('supplierId', 'name')
        .populate('destinationLocationId', 'name address')
        .populate('tags', 'name');
    res.status(200).json({ success: true, message: 'Purchase order marked as ordered', data: { purchaseOrder: populated } });
});
// Receive inventory for a purchase order
// Body: { entries: [{ entryId: string, accept: number, reject?: number }] }
exports.receivePurchaseOrderInventory = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new error_utils_1.CustomError("Invalid purchase order id", 400);
    }
    const po = await purchase_order_model_1.PurchaseOrder.findById(id);
    if (!po)
        throw new error_utils_1.CustomError("Purchase order not found", 404);
    if (po.status !== 'ordered' && po.status !== 'partially_received') {
        throw new error_utils_1.CustomError("Only ordered purchase orders can receive inventory", 400);
    }
    const payload = (req.body?.entries || []);
    if (!Array.isArray(payload) || payload.length === 0) {
        throw new error_utils_1.CustomError("entries array is required", 400);
    }
    const entries = await purchase_order_entry_model_1.PurchaseOrderEntry.find({ purchaseOrderId: id });
    const entryById = new Map(entries.map(e => [String(e._id), e]));
    for (const it of payload) {
        if (!it || !it.entryId || !mongoose_1.default.isValidObjectId(it.entryId))
            continue;
        const entry = entryById.get(String(it.entryId));
        if (!entry)
            continue;
        const accept = Math.max(0, Number(it.accept) || 0);
        const reject = Math.max(0, Number(it.reject) || 0);
        const total = Number(entry.quantityOrdered) || 0;
        const alreadyReceived = Number(entry.quantityReceived || 0);
        const remaining = Math.max(0, total - alreadyReceived);
        const processed = Math.min(remaining, accept + reject);
        const effectiveAccept = Math.min(accept, processed);
        // Update entry received
        entry.quantityReceived = Math.min(total, alreadyReceived + effectiveAccept);
        await entry.save();
        // Update inventory levels at destination
        const variantId = entry.variantId;
        const destinationId = po.destinationLocationId;
        if (!variantId || !destinationId)
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
    // Recompute overall status
    const latestEntries = await purchase_order_entry_model_1.PurchaseOrderEntry.find({ purchaseOrderId: id });
    const allReceived = latestEntries.every(en => (en.quantityReceived || 0) >= (en.quantityOrdered || 0));
    po.status = allReceived ? 'received' : 'partially_received';
    await po.save();
    res.status(200).json({ success: true, message: 'Inventory updated', data: { status: po.status } });
});
