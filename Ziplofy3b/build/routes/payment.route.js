"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const paymentRouter = (0, express_1.Router)();
paymentRouter.post('/confirm', payment_controller_1.confirmPayment);
paymentRouter.get('/store/:storeId', payment_controller_1.getPaymentsByStoreId);
exports.default = paymentRouter;
