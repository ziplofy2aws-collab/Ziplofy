"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const location_controller_1 = require("../controllers/location.controller");
exports.locationRouter = express_1.default.Router();
// protect all routes
exports.locationRouter.use(auth_middleware_1.protect);
// Create
exports.locationRouter.post('/', location_controller_1.createLocation);
// Get by store id
exports.locationRouter.get('/store/:storeId', location_controller_1.getLocationsByStoreId);
// Update
exports.locationRouter.put('/:id', location_controller_1.updateLocation);
// Delete
exports.locationRouter.delete('/:id', location_controller_1.deleteLocation);
