"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.giftCardRouter = void 0;
const express_1 = require("express");
const gift_card_controller_1 = require("../controllers/gift-card.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.giftCardRouter = (0, express_1.Router)();
// Apply authentication middleware to all routes
exports.giftCardRouter.use(auth_middleware_1.protect);
// Gift card routes
exports.giftCardRouter.post('/', gift_card_controller_1.createGiftCard);
exports.giftCardRouter.get('/store/:storeId', gift_card_controller_1.getGiftCardsByStoreId);
exports.giftCardRouter.put('/:id', gift_card_controller_1.updateGiftCard);
exports.giftCardRouter.delete('/:id', gift_card_controller_1.deleteGiftCard);
