"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const local_delivery_location_entry_controller_1 = require("../controllers/local-delivery-location-entry.controller");
const localDeliveryLocationEntryRouter = express_1.default.Router();
localDeliveryLocationEntryRouter.use(auth_middleware_1.protect);
localDeliveryLocationEntryRouter.get('/local-delivery/:localDeliveryId', local_delivery_location_entry_controller_1.getLocalDeliveryLocationEntriesByLocalDeliveryId);
exports.default = localDeliveryLocationEntryRouter;
