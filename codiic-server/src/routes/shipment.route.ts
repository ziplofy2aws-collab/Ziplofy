import { Router } from 'express';
import { createShipment, deleteShipment, getShipmentByTransferId, markShipmentInTransit, receiveShipment, updateShipment } from '../controllers/shipment.controller';
import { protect } from '../middlewares/auth.middleware';

export const shipmentRouter = Router();

shipmentRouter.use(protect);

// Create shipment
shipmentRouter.post('/', createShipment);

// Get shipment by transfer id
shipmentRouter.get('/transfer/:id', getShipmentByTransferId);

// Update shipment
shipmentRouter.put('/:id', updateShipment);

// Delete shipment
shipmentRouter.delete('/:id', deleteShipment);

// Mark shipment as in transit
shipmentRouter.get('/:id/in-transit', markShipmentInTransit);

// Receive shipment
shipmentRouter.post('/:id/receive', receiveShipment);


