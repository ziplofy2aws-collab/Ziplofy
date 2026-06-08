"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giftCardTimelineRouter = void 0;
const express_1 = __importDefault(require("express"));
const gift_card_timeline_controller_1 = require("../controllers/gift-card-timeline.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.giftCardTimelineRouter = express_1.default.Router();
// Apply authentication middleware to all routes
exports.giftCardTimelineRouter.use(auth_middleware_1.protect);
// Create timeline entry
exports.giftCardTimelineRouter.post('/', gift_card_timeline_controller_1.createTimelineEntry);
// Get timeline entries by gift card id
exports.giftCardTimelineRouter.get('/gift-card/:giftCardId', gift_card_timeline_controller_1.getTimelineByGiftCardId);
// Update timeline entry
exports.giftCardTimelineRouter.put('/:id', gift_card_timeline_controller_1.updateTimelineEntry);
// Delete timeline entry
exports.giftCardTimelineRouter.delete('/:id', gift_card_timeline_controller_1.deleteTimelineEntry);
