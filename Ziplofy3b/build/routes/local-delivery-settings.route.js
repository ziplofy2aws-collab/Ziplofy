"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const local_delivery_settings_controller_1 = require("../controllers/local-delivery-settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const localDeliverySettingsRouter = express_1.default.Router();
localDeliverySettingsRouter.use(auth_middleware_1.protect);
localDeliverySettingsRouter.post('/', local_delivery_settings_controller_1.createLocalDeliverySettings);
localDeliverySettingsRouter.get('/store/:storeId', local_delivery_settings_controller_1.getLocalDeliverySettingsByStoreId);
exports.default = localDeliverySettingsRouter;
