"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentRouter = void 0;
const express_1 = require("express");
const shipment_controller_1 = require("../controllers/shipment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.shipmentRouter = (0, express_1.Router)();
exports.shipmentRouter.use(auth_middleware_1.protect);
// Create shipment
exports.shipmentRouter.post('/', shipment_controller_1.createShipment);
// Get shipment by transfer id
exports.shipmentRouter.get('/transfer/:id', shipment_controller_1.getShipmentByTransferId);
// Update shipment
exports.shipmentRouter.put('/:id', shipment_controller_1.updateShipment);
// Delete shipment
exports.shipmentRouter.delete('/:id', shipment_controller_1.deleteShipment);
// Mark shipment as in transit
exports.shipmentRouter.get('/:id/in-transit', shipment_controller_1.markShipmentInTransit);
// Receive shipment
exports.shipmentRouter.post('/:id/receive', shipment_controller_1.receiveShipment);
