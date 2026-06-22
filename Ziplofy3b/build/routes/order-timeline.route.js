"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderTimelineRouter = void 0;
const express_1 = __importDefault(require("express"));
const order_timeline_controller_1 = require("../controllers/order-timeline.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.orderTimelineRouter = express_1.default.Router();
exports.orderTimelineRouter.use(auth_middleware_1.protect);
exports.orderTimelineRouter.post('/', order_timeline_controller_1.createOrderTimelineEntry);
exports.orderTimelineRouter.get('/order/:orderId', order_timeline_controller_1.getOrderTimelineByOrderId);
exports.orderTimelineRouter.put('/:id', order_timeline_controller_1.updateOrderTimelineEntry);
exports.orderTimelineRouter.delete('/:id', order_timeline_controller_1.deleteOrderTimelineEntry);
